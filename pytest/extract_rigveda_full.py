import requests
from bs4 import BeautifulSoup
import json
import os
import time

BASE_URL = "https://www.vedarahasya.net/"
MANDALA_COUNT = 10
OUTPUT_DIR = "../public/data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Helper to clean up whitespace

def clean_text(text):
    return ' '.join(text.split())

for mandala_num in range(1, MANDALA_COUNT + 1):
    mandala_url = f"{BASE_URL}rv{mandala_num:02d}.htm"
    print(f"Fetching Mandala {mandala_num} from {mandala_url}")
    resp = requests.get(mandala_url)
    soup = BeautifulSoup(resp.text, "html.parser")
    hymns = []
    fonts = soup.find_all("font")
    for i in range(0, len(fonts) - 2, 3):
        sanskrit = clean_text(fonts[i].get_text())
        translit = clean_text(fonts[i+1].get_text())
        translation = clean_text(fonts[i+2].get_text())
        hymns.append({
            "hymn": len(hymns) + 1,
            "sanskrit": sanskrit,
            "transliteration": translit,
            "translation": translation
        })
    out_path = os.path.join(OUTPUT_DIR, f"mandala-{mandala_num}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"mandala": mandala_num, "hymns": hymns}, f, ensure_ascii=False, indent=2)
    print(f"Saved {out_path} with {len(hymns)} hymns.")
print("All mandalas processed!")
