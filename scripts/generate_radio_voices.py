def print_flush(*args, **kwargs):
    kwargs["flush"] = True
    print(*args, **kwargs)
#!/usr/bin/env python3
"""
generate_radio_voices.py
Generate studio-quality Brazilian Portuguese radio audio clips using OpenArt's
ElevenLabs Multilingual v2 endpoint and download them into media/audio/news/.
"""

import os
import sys
import time
import json
import argparse
import urllib.request
import urllib.error

CREDENTIALS_PATH = os.path.expanduser("~/.openart/cli-credentials.json")
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "media", "audio", "news")

# ElevenLabs voice IDs on OpenArt
VOICE_CADU = "onwK4e9ZLuTAKqWW03F9"    # Daniel - Steady Broadcaster (sensationalist news anchor)
VOICE_MARCAO = "CwhRBWXzGAHq8TQ4Fs17"  # Roger - Laid-Back, Casual (street reporter)

# Radio News Dialogue Script Definitions
NEWS_SCRIPTS = [
    # 1. HEAD BONK
    {
        "id": "bonk_cadu1",
        "speaker": "Cadu",
        "voice": VOICE_CADU,
        "text": "Atenção, ouvintes! Um incidente bizarro acabou de acontecer no limite das obras da Edgar Facó com a Paula Ferreira! Marcão, temos imagens?"
    },
    {
        "id": "bonk_marcao1",
        "speaker": "Marcão",
        "voice": VOICE_MARCAO,
        "text": "Ao vivo, Cadu! Um cidadão desatento tentou atravessar o tapume achando que a rua continuava e bateu a cabeça com tudo na parede pintada em obras! O barulho do impacto ecoou no quarteirão!"
    },
    {
        "id": "bonk_cadu2",
        "speaker": "Cadu",
        "voice": VOICE_CADU,
        "text": "Mas é inacreditável, Marcão! A placa gigante de Desculpe pelo transtorno, estamos em Obras estava bem na cara dele! Faltou atenção ou sobrou cachaça?"
    },
    {
        "id": "bonk_marcao2",
        "speaker": "Marcão",
        "voice": VOICE_MARCAO,
        "text": "Ele ainda tentou empurrar os tapumes, Cadu! O Seu Tião do bar disse que o sujeito ficou meio tonto e reclamando da prefeitura no meio da poeira!"
    },

    # 2. SERIAL KICKER
    {
        "id": "kick_cadu1",
        "speaker": "Cadu",
        "voice": VOICE_CADU,
        "text": "Atenção, ouvintes da Rede Simulação! Um flagrante de desordem pública na Edgar Facó está mobilizando a vizinhança. Marcão, você está ao vivo. O que está acontecendo?"
    },
    {
        "id": "kick_marcao1",
        "speaker": "Marcão",
        "voice": VOICE_MARCAO,
        "text": "Pois é, Cadu! A coisa tá feia! Um elemento descontrolado foi flagrado desferindo chutes violentos em objetos no asfalto, incluindo latinhas de cerveja e a bola da molecada!"
    },
    {
        "id": "kick_cadu2",
        "speaker": "Cadu",
        "voice": VOICE_CADU,
        "text": "É um absurdo, Marcão! A que ponto chegamos? A pessoa não tem um lote pra carpir e fica chutando lixo pela avenida! As autoridades já foram acionadas?"
    },
    {
        "id": "kick_marcao2",
        "speaker": "Marcão",
        "voice": VOICE_MARCAO,
        "text": "O Seu Tião do bar já ameaçou pegar o cabo de vassoura, Cadu! A CET pede que os motoristas diminuam a velocidade para não atropelar a bola dente-de-leite!"
    },

    # 3. HUNGER
    {
        "id": "fome_cadu1",
        "speaker": "Cadu",
        "voice": VOICE_CADU,
        "text": "Urgente! O departamento de saúde comunitária emite alerta de nível vermelho para a região da Paula Ferreira. Marcão, qual é a gravidade da situação?"
    },
    {
        "id": "fome_marcao1",
        "speaker": "Marcão",
        "voice": VOICE_MARCAO,
        "text": "Gravíssima, Cadu! Um cidadão está perambulando pelo bairro com o bucho em estado de calamidade pública! O estômago do indivíduo está roncando mais alto que a moto dos Correios!"
    },
    {
        "id": "fome_cadu2",
        "speaker": "Cadu",
        "voice": VOICE_CADU,
        "text": "Mas pelo amor de Deus, Marcão! A Padaria Estrela está aberta, tem coxinha na vitrine! Por que o cidadão se recusa a se alimentar?"
    },
    {
        "id": "fome_marcao2",
        "speaker": "Marcão",
        "voice": VOICE_MARCAO,
        "text": "Fontes informam que ele tá guardando as moedas ou simplesmente esqueceu de mastigar, Cadu! Se não comer um pastel nos próximos minutos, vai desmaiar no meio-fio!"
    },

    # 4. DEBT
    {
        "id": "debt_cadu1",
        "speaker": "Cadu",
        "voice": VOICE_CADU,
        "text": "Economia em frangalhos em Pirituba! O rombo financeiro na praça já preocupa os comerciantes locais. Marcão, você tem os números?"
    },
    {
        "id": "debt_marcao1",
        "speaker": "Marcão",
        "voice": VOICE_MARCAO,
        "text": "Exatamente, Cadu! Foi detectada uma dívida colossal pendurada na caderneta de fiado do Seu Tião! O caloteiro segue foragido pelas esquinas de Pirituba!"
    },
    {
        "id": "debt_cadu2",
        "speaker": "Cadu",
        "voice": VOICE_CADU,
        "text": "Inadmissível, Marcão! O Seu Tião trabalha de sol a sol, vendendo cerveja estalando de gelada, pro cidadão tomar fiado e sumir do mapa? Cadê a honra do trabalhador?"
    },
    {
        "id": "debt_marcao2",
        "speaker": "Marcão",
        "voice": VOICE_MARCAO,
        "text": "O Tião já cortou o fiado de todo o bairro, Cadu! Quem for tomar uma gelada agora, só no dinheiro vivo ou no Pix!"
    },

    # 5. POLICE / PERIGO
    {
        "id": "perigo_cadu1",
        "speaker": "Cadu",
        "voice": VOICE_CADU,
        "text": "Plantão policial! Viaturas da PM estão em patrulhamento ostensivo pelas artérias de Pirituba. Marcão, o cerco está se fechando?"
    },
    {
        "id": "perigo_marcao1",
        "speaker": "Marcão",
        "voice": VOICE_MARCAO,
        "text": "O clima é tenso, Cadu! A polícia identificou um indivíduo com índice de perigo nas alturas! O helicóptero Águia já sobrevoa a ponte da Paula Ferreira!"
    },
    {
        "id": "perigo_cadu2",
        "speaker": "Cadu",
        "voice": VOICE_CADU,
        "text": "A polícia de São Paulo não dorme em serviço, Marcão! Quem tiver com a ginga frouxa e documento vencido, melhor encostar na parede com a mão na cabeça!"
    },
    {
        "id": "perigo_marcao2",
        "speaker": "Marcão",
        "voice": VOICE_MARCAO,
        "text": "Exatamente, Cadu! O conselho aqui é manter a calma e não fazer movimentos bruscos na frente da barca!"
    },

    # 6. GENERAL ROUTINE
    {
        "id": "rotina_cadu1",
        "speaker": "Cadu",
        "voice": VOICE_CADU,
        "text": "Voltamos com as notícias do trânsito e do cotidiano em Pirituba. Marcão, como está a movimentação das calçadas neste momento?"
    },
    {
        "id": "rotina_marcao1",
        "speaker": "Marcão",
        "voice": VOICE_MARCAO,
        "text": "Muita correria, Cadu! O pessoal descendo do trem da CPTM, a feira livre bombando e os cachorros vira-lata caramelo fazendo a ronda habitual na porta do açougue!"
    },
    {
        "id": "rotina_cadu2",
        "speaker": "Cadu",
        "voice": VOICE_CADU,
        "text": "Essa é a verdadeira São Paulo que trabalha e não para, Marcão! Vida que segue na selva de pedra!"
    },
    {
        "id": "rotina_marcao2",
        "speaker": "Marcão",
        "voice": VOICE_MARCAO,
        "text": "Com certeza, Cadu! O pastel tá saindo quentinho e a vida não para de rodar no servidor!"
    },

    # 7. WEATHER QUESTION & FORECASTS
    {
        "id": "tempo_pergunta",
        "speaker": "Cadu",
        "voice": VOICE_CADU,
        "text": "E agora, Marcão, como fica o tempo nas próximas horas?"
    },
    {
        "id": "tempo_storm",
        "speaker": "Marcão",
        "voice": VOICE_MARCAO,
        "text": "Atenção motoristas na Marginal Tietê e na Paula Ferreira! O radar meteorológico detectou uma tempestade de verão violenta se aproximando! Vai desabar o céu com chuva torrencial e trovoadas nos próximos minutos!"
    },
    {
        "id": "tempo_garoa",
        "speaker": "Marcão",
        "voice": VOICE_MARCAO,
        "text": "A previsão para as próximas horas em São Paulo é daquela clássica garoa paulistana, névoa baixa e pista molhada na Edgar Facó. Peguem o guarda-chuva porque o clima vai fechar!"
    },
    {
        "id": "tempo_clear",
        "speaker": "Marcão",
        "voice": VOICE_MARCAO,
        "text": "O sol vai abrir com força em Pirituba! Sensação térmica de 36 graus no asfalto quente. O céu limpo promete uma tarde de boteco e cerveja gelada!"
    }
]

def load_credentials():
    if not os.path.exists(CREDENTIALS_PATH):
        raise FileNotFoundError(f"OpenArt credentials not found at {CREDENTIALS_PATH}")
    with open(CREDENTIALS_PATH, "r") as f:
        return json.load(f)

def get_account_status(token):
    url = "https://openart.ai/suite/api/cli/v1/account"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}",
        "User-Agent": "openart-cli/0.1.1"
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def submit_voice_generation(token, project_id, text, voice_id):
    url = "https://openart.ai/suite/api/forms/creations/eleven_multilingual_v2%3Atext2speech"
    payload = {
        "projectId": project_id,
        "prompt": text,
        "voiceId": voice_id,
        "stability": 0.5,
        "similarityBoost": 0.75,
        "style": 0,
        "speed": 1.0,
        "useSpeakerBoost": True
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0"
    })
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"OpenArt API error ({e.code}): {err_body}")

def poll_creation(token, creation_id, max_wait=60):
    url = f"https://openart.ai/suite/api/history/{creation_id}"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0"
    })
    start = time.time()
    while time.time() - start < max_wait:
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                resources = data.get("resources", [])
                if resources and len(resources) > 0 and resources[0].get("url"):
                    return resources[0].get("url")
                history = data.get("history", {})
                if history.get("status") == "completed" and resources:
                    return resources[0].get("url")
                if history.get("status") == "failed":
                    raise RuntimeError(f"Generation failed: {history.get('errorMessage', 'Unknown error')}")
        except Exception as e:
            print_flush(f"  [poll] retry: {e}", flush=True)
        time.sleep(2.0)
    raise TimeoutError(f"Creation {creation_id} timed out after {max_wait}s")

def download_audio(url, target_path):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"})
    with urllib.request.urlopen(req) as resp:
        with open(target_path, "wb") as f:
            f.write(resp.read())

def main():
    parser = argparse.ArgumentParser(description="Generate radio voice clips via OpenArt ElevenLabs")
    parser.add_argument("--single", type=str, help="Generate only a single clip by ID (e.g. bonk_cadu1)")
    parser.add_argument("--dry-run", action="store_true", help="Print costs and lines without calling API")
    args = parser.parse_args()

    creds = load_credentials()
    token = creds["accessToken"]

    account = get_account_status(token)
    user_info = account.get("user", {})
    credits_available = account.get("credits", 0)
    print_flush(f"=== OpenArt ElevenLabs Radio Generator ===")
    print_flush(f"User: {user_info.get('email')} (Plan: {account.get('plan')})")
    print_flush(f"Available Credits: {credits_available}")
    print_flush(f"Output Directory: {OUTPUT_DIR}")
    print_flush("-" * 42)

    project_id = "8cyhqiXVrhwTCkueN5rQ"  # Default Personal Project

    targets = NEWS_SCRIPTS
    if args.single:
        targets = [item for item in NEWS_SCRIPTS if item["id"] == args.single]
        if not targets:
            print_flush(f"Error: Clip '{args.single}' not found!")
            sys.exit(1)

    total_chars = sum(len(item["text"]) for item in targets)
    total_est_credits = sum((len(item["text"]) + 24) // 25 * 5 for item in targets)

    print_flush(f"Clips to process: {len(targets)}")
    print_flush(f"Total characters: {total_chars}")
    print_flush(f"Estimated credits: ~{total_est_credits}")
    print_flush("-" * 42)

    if args.dry_run:
        print_flush("[DRY RUN] Script completed without network calls.")
        for item in targets:
            clip_credits = (len(item["text"]) + 24) // 25 * 5
            print_flush(f"- [{item['id']}] {item['speaker']} ({len(item['text'])} chars, {clip_credits} cr): \"{item['text'][:60]}...\"")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for i, item in enumerate(targets, 1):
        clip_id = item["id"]
        out_file = os.path.join(OUTPUT_DIR, f"{clip_id}.mp3")
        if os.path.exists(out_file):
            print_flush(f"[{i}/{len(targets)}] {clip_id}: ALREADY EXISTS -> {out_file}")
            continue

        print_flush(f"[{i}/{len(targets)}] Generating {clip_id} ({item['speaker']})...")
        print_flush(f"  Text: \"{item['text']}\"")
        try:
            res = submit_voice_generation(token, project_id, item["text"], item["voice"])
            print_flush(f"  Response: {res}")
            creation_id = res.get("id") or res.get("creationId") or res.get("historyId")
            
            audio_url = None
            if "resources" in res and len(res["resources"]) > 0:
                audio_url = res["resources"][0].get("url")
            elif "url" in res:
                audio_url = res["url"]
            elif creation_id:
                print_flush(f"  Polling creation {creation_id}...")
                audio_url = poll_creation(token, creation_id)

            if not audio_url:
                raise RuntimeError(f"Could not extract audio URL from response: {res}")

            print_flush(f"  Downloading from {audio_url}...")
            download_audio(audio_url, out_file)
            print_flush(f"  Saved -> {out_file} ({os.path.getsize(out_file)} bytes)")

        except Exception as e:
            print_flush(f"  ERROR generating {clip_id}: {e}")

        time.sleep(1.0)

    print_flush("\nGeneration process complete!")

if __name__ == "__main__":
    main()
