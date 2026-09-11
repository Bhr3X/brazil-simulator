#!/usr/bin/env node

/**
 * Google Flow Music (flowmusic.app) Pilot Bridge
 *
 * Controls a dedicated Google Chrome instance via CDP (Chrome DevTools Protocol)
 * with a persistent user profile (~/.flow_music_profile) and zero external npm dependencies.
 *
 * Commands:
 *   node tools/flow_pilot.mjs launch           - Launch Chrome with dedicated profile & remote debugging
 *   node tools/flow_pilot.mjs status           - Check connection, page status & login state
 *   node tools/flow_pilot.mjs prompt "<text>"  - Send a prompt to the Producer chat
 *   node tools/flow_pilot.mjs screenshot [out] - Capture screenshot of current UI
 *   node tools/flow_pilot.mjs monitor [sec]    - Monitor generation and capture audio URLs
 *   node tools/flow_pilot.mjs download [dir]   - Download latest captured/rendered audio tracks
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.FLOW_PORT || '9222', 10);
const PROFILE_DIR = process.env.FLOW_PROFILE_DIR || path.join(process.env.HOME, '.flow_music_profile');
const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'https://www.flowmusic.app';

class FlowMusicPilot {
  constructor(port = PORT) {
    this.port = port;
    this.ws = null;
    this.msgId = 1;
    this.pending = new Map();
    this.historyFile = path.join(__dirname, 'captured_tracks.json');
    this.capturedMedia = this.loadCapturedUrls();
    this.eventListeners = [];
  }

  loadCapturedUrls() {
    try {
      if (fs.existsSync(this.historyFile)) {
        return JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
      }
    } catch {}
    return [];
  }

  saveCapturedUrl(url) {
    if (url.includes('/starters/') || url.includes('starter0')) return;
    try {
      const list = this.loadCapturedUrls();
      if (!list.includes(url)) {
        list.push(url);
        fs.writeFileSync(this.historyFile, JSON.stringify(list, null, 2));
      }
    } catch (e) {
      console.warn(`[FlowPilot Warning] Could not save to historyFile: ${e.message}`);
    }
  }

  async newSession() {
    console.log(`[FlowPilot] Creating new session via Page.navigate...`);
    await this.send('Page.navigate', { url: 'https://www.flowmusic.app/' });
    await new Promise(r => setTimeout(r, 2000));
    for (let i = 0; i < 20; i++) {
      const ready = await this.evaluate(`!!document.querySelector('textarea')`);
      if (ready) break;
      await new Promise(r => setTimeout(r, 500));
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  async isPortOpen() {
    try {
      const res = await fetch(`http://127.0.0.1:${this.port}/json/version`);
      return res.ok;
    } catch {
      return false;
    }
  }

  async launchBrowser() {
    if (await this.isPortOpen()) {
      console.log(`[FlowPilot] Chrome is already running on port ${this.port}.`);
      return;
    }

    if (!fs.existsSync(CHROME_PATH)) {
      throw new Error(`Google Chrome binary not found at ${CHROME_PATH}`);
    }

    fs.mkdirSync(PROFILE_DIR, { recursive: true });

    console.log(`[FlowPilot] Launching Chrome on port ${this.port}...`);
    console.log(`[FlowPilot] Profile Directory: ${PROFILE_DIR}`);

    const args = [
      `--remote-debugging-port=${this.port}`,
      `--user-data-dir=${PROFILE_DIR}`,
      '--no-first-run',
      '--no-default-browser-check',
      TARGET_URL
    ];

    const child = spawn(CHROME_PATH, args, {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();

    // Wait for CDP port to respond
    let ready = false;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 400));
      if (await this.isPortOpen()) {
        ready = true;
        break;
      }
    }

    if (!ready) {
      throw new Error(`Timed out waiting for Chrome CDP to open on port ${this.port}`);
    }

    console.log(`[FlowPilot] Chrome launched successfully and CDP is active.`);
  }

  async connect() {
    if (!(await this.isPortOpen())) {
      await this.launchBrowser();
    }

    const listRes = await fetch(`http://127.0.0.1:${this.port}/json`);
    const targets = await listRes.json();

    // Look for an existing flowmusic tab or standard page tab
    let flowTarget = targets.find(t => t.type === 'page' && t.url.includes('flowmusic.app'));

    if (!flowTarget) {
      // Check if there is an empty page we can navigate
      const pageTarget = targets.find(t => t.type === 'page');
      if (pageTarget) {
        flowTarget = pageTarget;
      } else {
        // Create new target
        const newRes = await fetch(`http://127.0.0.1:${this.port}/json/new?${TARGET_URL}`, { method: 'PUT' });
        flowTarget = await newRes.json();
      }
    }

    if (!flowTarget || !flowTarget.webSocketDebuggerUrl) {
      throw new Error('Failed to obtain a WebSocket debugger URL for Chrome target.');
    }

    this.target = flowTarget;
    this.ws = new WebSocket(flowTarget.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);

      if (data.id && this.pending.has(data.id)) {
        const { resolve, reject } = this.pending.get(data.id);
        this.pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }

      // Intercept network responses to capture audio and media URLs
      if (data.method === 'Network.responseReceived') {
        const { response } = data.params;
        const mime = response?.mimeType || '';
        const url = response?.url || '';
        if (
          mime.startsWith('audio/') ||
          mime.startsWith('video/') ||
          url.endsWith('.mp3') ||
          url.endsWith('.wav') ||
          url.endsWith('.m4a') ||
          url.includes('audio-generation') ||
          url.includes('synth') ||
          url.includes('clips/') ||
          url.includes('lyria')
        ) {
          if (!this.capturedMedia.includes(url)) {
            this.capturedMedia.push(url);
            console.log(`[FlowPilot Network] Captured audio/media URL: ${url}`);
            this.saveCapturedUrl(url);
          }
        }
      }

      for (const listener of this.eventListeners) {
        listener(data);
      }
    };

    await this.send('Runtime.enable');
    await this.send('Page.enable');
    await this.send('Network.enable');
    await this.send('DOM.enable');

    // Ensure we are on flowmusic.app
    const currentUrl = await this.evaluate('window.location.href');
    if (!currentUrl || !currentUrl.includes('flowmusic.app')) {
      console.log(`[FlowPilot] Navigating target to ${TARGET_URL}...`);
      await this.send('Page.navigate', { url: TARGET_URL });
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  send(method, params = {}) {
    const id = this.msgId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text + ' ' + JSON.stringify(res.exceptionDetails.exception));
    }
    return res.result ? res.result.value : undefined;
  }

  async getStatus() {
    return await this.evaluate(`
      (() => {
        const url = window.location.href;
        const title = document.title;
        const buttons = Array.from(document.querySelectorAll('button')).map(b => (b.innerText || b.getAttribute('aria-label') || '').trim());
        const hasLogin = buttons.some(t => /log\\s*in/i.test(t));
        const hasSignUp = buttons.some(t => /sign\\s*up/i.test(t));
        const hasTextarea = !!document.querySelector('textarea[aria-label="Chat message"], textarea');
        const sendBtn = document.querySelector('button[aria-label="Send message"]');
        const isSendEnabled = sendBtn && !sendBtn.disabled;
        const audioElements = Array.from(document.querySelectorAll('audio')).map(a => a.src).filter(Boolean);
        const songs = Array.from(document.querySelectorAll('h3, h4, [data-slot="song-title"]')).map(el => el.textContent.trim()).filter(Boolean);

        return {
          url,
          title,
          isLoggedIn: !hasLogin,
          hasLoginPrompt: hasLogin,
          hasTextarea,
          isSendEnabled: !!isSendEnabled,
          detectedSongsCount: songs.length,
          detectedAudioCount: audioElements.length,
          audioElements
        };
      })()
    `);
  }

  async sendPrompt(promptText) {
    console.log(`[FlowPilot] Submitting prompt to Producer: "${promptText}"...`);

    const result = await this.evaluate(`
      (() => {
        const ta = document.querySelector('textarea[aria-label="Chat message"]') || document.querySelector('textarea');
        if (!ta) return { success: false, reason: 'Chat textarea not found.' };

        // Set value via prototype setter to notify React state
        const protoSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        protoSetter.call(ta, ${JSON.stringify(promptText)});
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));

        // Give React tick to update state and enable send button
        return { success: true, value: ta.value };
      })()
    `);

    if (!result.success) {
      throw new Error(`Failed to set prompt: ${result.reason}`);
    }

    await new Promise(r => setTimeout(r, 400));

    const clickResult = await this.evaluate(`
      (() => {
        const btn = document.querySelector('button[aria-label="Send message"]');
        if (!btn) return { clicked: false, reason: 'Send button not found' };
        if (btn.disabled) return { clicked: false, reason: 'Send button is disabled (are you logged in?)' };
        btn.click();
        return { clicked: true };
      })()
    `);

    if (!clickResult.clicked) {
      console.warn(`[FlowPilot Warning] ${clickResult.reason}`);
    } else {
      console.log(`[FlowPilot] Prompt sent successfully.`);
    }

    return clickResult;
  }

  async captureScreenshot(filePath = 'tools/flow_music_screenshot.png') {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buffer);
    console.log(`[FlowPilot] Screenshot saved to ${filePath}`);
    return filePath;
  }

  async playPlayer() {
    console.log(`[FlowPilot] Clicking Play button in audio player...`);
    const res = await this.evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const playBtn = buttons.find(b => b.querySelector('svg.lucide-play') || b.getAttribute('aria-label')?.toLowerCase().includes('play'));
        if (playBtn) {
          playBtn.click();
          return { success: true };
        }
        return { success: false };
      })()
    `);
    console.log('[FlowPilot] Play click result:', res);
    return res;
  }

  async inspectMenu() {
    console.log(`[FlowPilot] Inspecting track options menu...`);
    return await this.evaluate(`
      (() => {
        // Click the three dots button in bottom bar
        const buttons = Array.from(document.querySelectorAll('button'));
        const moreBtn = buttons.find(b => b.querySelector('svg.lucide-ellipsis, svg.lucide-more-horizontal') || b.textContent.includes('...') || b.getAttribute('aria-label')?.toLowerCase().includes('more'));
        if (moreBtn) {
          moreBtn.click();
          return { clicked: true };
        }
        return { clicked: false };
      })()
    `);
  }

  async clickTrackMenu(trackName) {
    console.log(`[FlowPilot] Clicking More Options for "${trackName}"...`);
    const res = await this.evaluate(`
      (() => {
        const title = ${JSON.stringify(trackName)};
        const btn = document.querySelector('button[aria-label*="' + title + '"][aria-label*="More options"]') ||
                    document.querySelector('button[aria-label*="More options for ' + title + '"]');
        if (!btn) return { clicked: false, error: 'Button not found' };

        // Close any existing open menus first
        const openMenu = document.querySelector('[role="menu"]');
        if (openMenu) {
          document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        }

        btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        btn.click();
        return { clicked: true };
      })()
    `);
    console.log('[FlowPilot] Clicked track menu:', res);
    return res;
  }

  async clickDownloadOption(format = 'MP3', outputDir = './Studio MKT/media') {
    fs.mkdirSync(outputDir, { recursive: true });
    const absDir = path.resolve(outputDir);
    console.log(`[FlowPilot] Setting Chrome download directory to ${absDir}...`);

    try {
      await this.send('Browser.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: absDir,
        eventsEnabled: true
      });
    } catch (e) {
      console.warn(`[FlowPilot Warning] setDownloadBehavior: ${e.message}`);
    }

    // Step 1: Click/hover "Download" submenu trigger to open sub-menu
    await this.evaluate(`
      (() => {
        const items = Array.from(document.querySelectorAll('[role="menuitem"]'));
        const dl = items.find(el => el.textContent.trim() === 'Download');
        if (dl) {
          dl.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
          dl.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
          dl.click();
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 600));

    console.log(`[FlowPilot] Clicking Download -> "${format}" in menu...`);
    const res = await this.evaluate(`
      (() => {
        const items = Array.from(document.querySelectorAll('[role="menuitem"], [data-radix-menu-content] *'));
        const targetFmt = ${JSON.stringify(format.toUpperCase())};
        const fmtBtn = items.find(el => el.textContent.trim().toUpperCase() === targetFmt);
        if (fmtBtn) {
          fmtBtn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
          fmtBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          fmtBtn.click();
          return { clickedFormat: true, format: targetFmt };
        }
        return { clickedFormat: false, available: items.map(i => i.textContent.trim()).filter(Boolean) };
      })()
    `);
    console.log('[FlowPilot] Format click result:', res);

    // Poll outputDir for newly appeared audio file
    console.log(`[FlowPilot] Waiting for file to download into ${absDir}...`);
    const initialFiles = fs.readdirSync(absDir);
    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 500));
      const currentFiles = fs.readdirSync(absDir).filter(f => !f.endsWith('.crdownload') && !f.startsWith('.'));
      const newFiles = currentFiles.filter(f => !initialFiles.includes(f));
      if (newFiles.length > 0) {
        console.log(`[FlowPilot] Download complete. Found new files: ${newFiles.join(', ')}`);
        return newFiles;
      }
    }
    return res;
  }

  async downloadLatestGenerated(format = 'MP3', outputDir = './Studio MKT/media') {
    const res = await this.evaluate(`
      (() => {
        const moreBtns = Array.from(document.querySelectorAll('button'))
          .filter(b => b.getAttribute('aria-label')?.includes('More options'));
        if (moreBtns.length === 0) return { success: false, reason: 'No more options buttons found' };
        // Choose the first one (top generated song card)
        const btn = moreBtns[0];
        const label = btn.getAttribute('aria-label');

        // Close any open menu
        const openMenu = document.querySelector('[role="menu"]');
        if (openMenu) {
          document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        }

        btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        btn.click();
        return { success: true, label };
      })()
    `);
    console.log('[FlowPilot] Clicked latest track menu:', res);
    if (!res.success) throw new Error(res.reason || 'Failed to click latest track menu');
    await new Promise(r => setTimeout(r, 600));
    return await this.clickDownloadOption(format, outputDir);
  }

  async monitor(durationSeconds = 60) {
    console.log(`[FlowPilot] Monitoring activity for ${durationSeconds} seconds... (Press Ctrl+C to stop)`);
    const startTime = Date.now();
    const intervalMs = 2000;

    while (Date.now() - startTime < durationSeconds * 1000) {
      await new Promise(r => setTimeout(r, intervalMs));
      const status = await this.getStatus();
      const newAudios = await this.evaluate(`
        Array.from(document.querySelectorAll('audio')).map(a => a.src).filter(Boolean)
      `);

      if (newAudios && newAudios.length > 0) {
        for (const src of newAudios) {
          if (!this.capturedMedia.includes(src)) {
            this.capturedMedia.push(src);
            console.log(`[FlowPilot DOM] Discovered audio element src: ${src}`);
          }
        }
      }
    }
    console.log(`[FlowPilot] Monitoring complete. Total captured media: ${this.capturedMedia.length}`);
  }

  async downloadCaptured(outputDir = './Studio MKT/media') {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`[FlowPilot] Downloading captured tracks to ${outputDir}...`);

    if (this.capturedMedia.length === 0) {
      // Check DOM one more time
      const domAudios = await this.evaluate(`
        Array.from(document.querySelectorAll('audio, a[download]')).map(el => el.src || el.href).filter(Boolean)
      `);
      if (domAudios && domAudios.length > 0) {
        this.capturedMedia.push(...domAudios);
      }
    }

    if (this.capturedMedia.length === 0) {
      console.log(`[FlowPilot] No audio tracks captured yet.`);
      return [];
    }

    const downloaded = [];
    let idx = 1;
    for (const url of this.capturedMedia) {
      try {
        const ext = url.split('?')[0].split('.').pop() || 'mp3';
        const filename = `flow_track_${Date.now()}_${idx++}.${ext.length <= 4 ? ext : 'mp3'}`;
        const destPath = path.join(outputDir, filename);

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const arrayBuf = await res.arrayBuffer();
        fs.writeFileSync(destPath, Buffer.from(arrayBuf));
        console.log(`[FlowPilot] Downloaded: ${destPath}`);
        downloaded.push(destPath);
      } catch (err) {
        console.warn(`[FlowPilot] Failed to download ${url}: ${err.message}`);
      }
    }

    return downloaded;
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// CLI Command Router
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';
  const pilot = new FlowMusicPilot();

  try {
    if (command === 'launch') {
      await pilot.launchBrowser();
      console.log(`[FlowPilot] Session ready. Open the Chrome window to log into your Google Account if needed.`);
      process.exit(0);
    }

    await pilot.connect();

    switch (command) {
      case 'status': {
        const st = await pilot.getStatus();
        console.log('\n--- Flow Music Status ---');
        console.log(`Title:              ${st.title}`);
        console.log(`URL:                ${st.url}`);
        console.log(`Is Logged In:       ${st.isLoggedIn ? 'YES ✅' : 'NO ❌ (Click "Log in" in the Chrome window)'}`);
        console.log(`Chat Input Ready:   ${st.hasTextarea ? 'YES ✅' : 'NO ❌'}`);
        console.log(`Send Button Active: ${st.isSendEnabled ? 'YES ✅' : 'NO (Disabled)'}`);
        console.log(`Audio Elements:     ${st.detectedAudioCount}`);
        console.log('-------------------------\n');
        break;
      }

      case 'prompt': {
        const promptText = args.slice(1).join(' ');
        if (!promptText) {
          console.error('Error: Please provide prompt text. Example: node tools/flow_pilot.mjs prompt "Upbeat Bossa Nova"');
          process.exit(1);
        }
        await pilot.sendPrompt(promptText);
        break;
      }

      case 'screenshot': {
        const outPath = args[1] || 'tools/flow_music_screenshot.png';
        await pilot.captureScreenshot(outPath);
        break;
      }

      case 'monitor': {
        const seconds = parseInt(args[1] || '45', 10);
        await pilot.monitor(seconds);
        break;
      }

      case 'new-session': {
        await pilot.newSession();
        break;
      }

      case 'play': {
        await pilot.playPlayer();
        break;
      }

      case 'menu': {
        await pilot.inspectMenu();
        break;
      }

      case 'download-track': {
        const title = args[1] || 'Rollback do Zé';
        const fmt = args[2] || 'MP3';
        const outDir = args[3] || './Studio MKT/media';
        await pilot.clickTrackMenu(title);
        await new Promise(r => setTimeout(r, 600));
        await pilot.clickDownloadOption(fmt, outDir);
        break;
      }

      case 'download': {
        const outDir = args[1] || './Studio MKT/media';
        await pilot.downloadCaptured(outDir);
        break;
      }

      default:
        console.log(`Unknown command: ${command}`);
        console.log(`Available commands: launch, status, prompt, screenshot, monitor, download`);
    }
  } catch (err) {
    console.error(`[FlowPilot Error] ${err.message}`);
    process.exit(1);
  } finally {
    pilot.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('flow_pilot.mjs')) {
  main();
}

export { FlowMusicPilot };
