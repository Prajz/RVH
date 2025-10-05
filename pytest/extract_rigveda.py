import requests
from bs4 import BeautifulSoup
import json
import time
import os

BASE_URL = "https://www.sacred-texts.com/hin/rigveda/"
MANDALA_COUNT = 10

def get_hymn_links(mandala_num):
    url = f"{BASE_URL}rvi{mandala_num:02d}.htm"
    link_prefix = f"rv{mandala_num:02d}"
    print(f"Fetching hymn list for Mandala {mandala_num}...")
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, "html.parser")
    links = []
    for a in soup.select("a"):
        href = a.get("href")
        if href and href.startswith(link_prefix):
            links.append(BASE_URL + href)
    print(f"Found {len(links)} hymns for Mandala {mandala_num}")
    return links

def parse_hymn(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, "html.parser")
    title = soup.find("h2").text.strip() if soup.find("h2") else ""
    verses = []
    for p in soup.select("p"):
        text = p.text.strip()
        if text:
            verses.append({"en": text})
    return {
        "title": title,
        "verses": verses
    }

# Ensure output directory exists
output_dir = "../public/data"
os.makedirs(output_dir, exist_ok=True)

for mandala_num in range(1, MANDALA_COUNT + 1):
    print(f"Processing Mandala {mandala_num}")
    hymns = []
    links = get_hymn_links(mandala_num)
    for idx, link in enumerate(links):
        print(f"  Fetching Hymn {idx+1} of Mandala {mandala_num}")
        hymn = parse_hymn(link)
        hymn["mandala"] = mandala_num
        hymn["hymn"] = idx + 1
        hymn["deities"] = []  # You can add deity extraction logic if needed
        hymn["meter"] = ""    # You can add meter extraction logic if needed
        hymn["audio"] = ""    # Add audio links if available
        hymns.append(hymn)
        time.sleep(0.5)  # Be polite to the server
    with open(os.path.join(output_dir, f"mandala-{mandala_num}.json"), "w", encoding="utf-8") as f:
        json.dump({"mandala": mandala_num, "hymns": hymns}, f, ensure_ascii=False, indent=2)
    print(f"Saved mandala-{mandala_num}.json")

print("All mandalas processed!")