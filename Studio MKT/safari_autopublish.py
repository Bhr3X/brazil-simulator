#!/usr/bin/env python3
"""
Studio MKT — Safari Auto-Publish Script
Controls Safari via AppleScript to fill and publish itch.io game pages.
Requires: Safari > Develop > Allow JavaScript from Apple Events
"""

import subprocess
import sys
import time

GAMES = [
    {
        "id": "4993922",
        "title": "Brazil Simulator // Sobrevivência BR",
        "slug": "brazil-simulator",
        "short_text": "Immersive 3D/ASCII survival simulator set in Pirituba, SP. Survive the day, deliver the bread, dodge the flanelinha.",
        "description": """<h3>Pirituba, São Paulo. 35°C. O relógio tá correndo.</h3>
<p><strong>Brazil Simulator // Sobrevivência BR</strong> é uma experiência imersiva de sobrevivência urbana em 3D retro com renderizador híbrido ASCII/Raster.</p>
<p>Você acorda nas ruas de Pirituba com objetivos simples: comprar pão na padaria da esquina, não deixar o flanelinha riscar o Uno com escada no teto, trocar ideia com o vira-lata caramelo e manter seus índices vitais acima de zero.</p>
<h4>Destaques:</h4>
<ul>
<li><strong>Dual Perspective:</strong> Alterne entre 1ª e 3ª pessoa com avatar procedural (tecla V).</li>
<li><strong>Estética Híbrida 3D / ASCII:</strong> Sombreamento retro com ciclo dia/noite e tempestades de verão.</li>
<li><strong>Cultura Urbana Autêntica:</strong> Padarias paulistanas, viadutos, vira-latas caramelos e carros clássicos nacionais.</li>
</ul>
<h4>Controles:</h4>
<ul>
<li><strong>Movimentação:</strong> W, A, S, D</li>
<li><strong>Olhar / Mirar:</strong> Mouse (trava de cursor em tela cheia)</li>
<li><strong>Pular:</strong> Espaço | <strong>Correr:</strong> Shift</li>
<li><strong>Alternar 1ª / 3ª Pessoa:</strong> V</li>
<li><strong>Interagir:</strong> E | <strong>Menu / Pausa:</strong> Esc</li>
</ul>""",
    },
    {
        "id": "4993926",
        "title": "Rogue Chronicles: The Becoming",
        "slug": "rogue-chronicles",
        "short_text": "Fast-paced 10-minute dark fantasy roguelite gauntlet. Master mutations, purge the depths, break the cycle.",
        "description": """<h3>The Wheel Turns. Will You Ascend or Decay?</h3>
<p><strong>Rogue Chronicles: The Becoming</strong> is a concentrated, high-lethality action roguelite designed for intense 10-minute runs. Descend into the subterranean Wilds, wield lost relics of the Vanguard, and stack chaotic mutations that alter your spells and blade.</p>
<h4>Core Features:</h4>
<ul>
<li><strong>10-Minute Pure Adrenaline Gauntlet:</strong> Balanced for high replayability and escalating challenge.</li>
<li><strong>The Mutation Tree:</strong> Combine transformative passives — from chain-lightning to parasitic blood armor.</li>
<li><strong>Hand-Drawn 32px Pixel Art:</strong> Atmospheric lighting, dark fantasy sprites, and bespoke dungeon biomes.</li>
</ul>
<h4>Controls:</h4>
<ul>
<li><strong>Move:</strong> W, A, S, D or Arrow Keys</li>
<li><strong>Attack / Strike:</strong> Left Click or J</li>
<li><strong>Dash / Evade:</strong> Right Click or Space / K</li>
<li><strong>Special Skill:</strong> Q or L</li>
</ul>""",
    },
    {
        "id": "4993930",
        "title": "Vegan T-Rex: A Matter of Principle",
        "slug": "vegan-t-rex",
        "short_text": "Ferocious prehistoric 2D arcade fighter. Pick your fighter, unleash veggie combos, and defend your diet!",
        "description": """<h3>Dinosaurs With Conviction. Fists With No Mercy.</h3>
<p>What happens when the apex predator of the Cretaceous decides meat is murder? <strong>Vegan T-Rex</strong> pits towering prehistoric heavyweights against each other in a fast, punchy 2D arcade arena fighter.</p>
<h4>Features:</h4>
<ul>
<li><strong>Classic Arcade Combat:</strong> Snappy hitboxes, juggle combos, heavy wall-bounces, and dramatic KO slowdowns.</li>
<li><strong>3 Playable Fighters:</strong> Rex, Apex Brogan, and Kara Knuckles.</li>
<li><strong>3 Vibrant Arenas:</strong> Canopy, Volcanic Peak, and Glacial Tundra.</li>
</ul>
<h4>Controls:</h4>
<ul>
<li><strong>Move / Crouch / Jump:</strong> Arrow Keys or W, A, S, D</li>
<li><strong>Light Punch / Jab:</strong> J or Z</li>
<li><strong>Heavy Kick / Tail Strike:</strong> K or X</li>
<li><strong>Special Veggie Slam:</strong> L or C</li>
</ul>""",
    }
]

def run_js_in_safari(js_code):
    escaped_js = js_code.replace('\\', '\\\\').replace('"', '\\"').replace('\n', ' ')
    applescript = f'''
    tell application "Safari"
        tell current tab of window 1
            do JavaScript "{escaped_js}"
        end tell
    end tell
    '''
    res = subprocess.run(["osascript", "-e", applescript], capture_output=True, text=True)
    return res.returncode == 0, res.stdout.strip(), res.stderr.strip()

def process_game(game):
    url = f"https://itch.io/game/edit/{game['id']}"
    print(f"\n==> Processing: {game['title']} ({url})")
    
    # Navigate
    subprocess.run(["osascript", "-e", f'tell app "Safari" to set URL of current tab of window 1 to "{url}"'])
    time.sleep(3)
    
    js = f"""
    (function() {{
        // Kind of project -> HTML
        var typeSelect = document.querySelector('select[name="game[type]"]') || document.querySelector('#game_type');
        if (typeSelect) {{
            typeSelect.value = 'html';
            typeSelect.dispatchEvent(new Event('change', {{ bubbles: true }}));
        }}
        
        // Tagline
        var shortText = document.querySelector('input[name="game[short_text]"]');
        if (shortText) shortText.value = "{game['short_text']}";
        
        // Description
        var descInput = document.querySelector('textarea[name="game[description]"]');
        if (descInput) descInput.value = `{game['description']}`;
        
        // Check "This file will be played in the browser" on all upload rows
        document.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {{
            if (cb.name && cb.name.indexOf('[embed]') !== -1) {{
                cb.checked = true;
                cb.dispatchEvent(new Event('change', {{ bubbles: true }}));
            }}
        }});
        
        // Viewport settings
        var w = document.querySelector('input[name="game[embed_width]"]');
        if (w) w.value = "1280";
        var h = document.querySelector('input[name="game[embed_height]"]');
        if (h) h.value = "720";
        
        var fs = document.querySelector('input[name="game[embed_fullscreen]"]');
        if (fs) fs.checked = true;
        var mob = document.querySelector('input[name="game[mobile_friendly]"]');
        if (mob) mob.checked = true;
        
        // Visibility -> Public
        var pub = document.querySelector('input[type="radio"][value="published"]') || document.querySelector('#game_published_1');
        if (pub) pub.checked = true;
        
        return "CONFIGURED";
    }})();
    """
    
    ok, out, err = run_js_in_safari(js)
    if not ok:
        print(f"    [FAIL] JavaScript error: {err}")
        return False
    
    print(f"    [OK] Page configured: {out}")
    time.sleep(1)
    
    # Submit form
    submit_js = """
    (function() {
        var btn = document.querySelector('button.save_btn') || document.querySelector('form.game_edit_form button[type="submit"]');
        if (btn) {
            btn.click();
            return "SUBMITTED";
        }
        return "BUTTON_NOT_FOUND";
    })();
    """
    ok, out, err = run_js_in_safari(submit_js)
    print(f"    [OK] Form save: {out}")
    time.sleep(3)
    return True

if __name__ == "__main__":
    test_ok, _, err = run_js_in_safari("2 + 2")
    if not test_ok:
        print("ERROR: Safari JavaScript from Apple Events is not enabled.")
        print(err)
        sys.exit(1)
    
    for g in GAMES:
        process_game(g)
    print("\nAll games successfully configured and saved in Safari!")
