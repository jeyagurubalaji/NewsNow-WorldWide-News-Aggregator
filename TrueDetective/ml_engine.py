# true_detective/ml_engine.py
import re
import urllib.parse
import feedparser
from sentence_transformers import SentenceTransformer, util
import streamlit as st

@st.cache_resource
def load_model():
    return SentenceTransformer('all-MiniLM-L6-v2')

class RealFakeClassifier:
    def __init__(self):
        self.encoder = load_model()

    def clean_query(self, text):
        # Extract meaningful alphanumeric terms
        words = re.findall(r'\b[A-Za-z0-9]+\b', text)
        return " ".join(words[:6])

    def search_news_rss(self, claim_text):
        query_variants = [
            self.clean_query(claim_text),           # Filtered terms
            claim_text[:60]                         # Direct partial phrase
        ]

        entries = []
        for q in query_variants:
            if not q.strip():
                continue
            encoded = urllib.parse.quote(q)
            rss_url = f"https://news.google.com/rss/search?q={encoded}&hl=en-US&gl=US&ceid=US:en"
            feed = feedparser.parse(rss_url)
            if feed.entries:
                entries.extend(feed.entries[:8])
                break # Stop if we found relevant feeds

        if not entries:
            return None

        # Compare claim against feed headlines using semantic cosine similarity
        claim_emb = self.encoder.encode(claim_text, convert_to_tensor=True)
        scores = []

        for entry in entries:
            headline = entry.get('title', '')
            headline_emb = self.encoder.encode(headline, convert_to_tensor=True)
            sim = float(util.cos_sim(claim_emb, headline_emb)[0][0])
            scores.append((sim, headline))

        max_sim, best_match = max(scores, key=lambda x: x[0])

        # Dynamic Threshold Calibration
        if max_sim >= 0.55:
            confidence = round(min(80.0 + (max_sim * 20.0), 98.0), 1)
            return {
                "status": "LIKELY TRUE",
                "confidence": confidence,
                "explanation": f"Verified story matches global news reporting: '{best_match}'"
            }
        elif 0.30 <= max_sim < 0.55:
            return {
                "status": "MISLEADING",
                "confidence": 75.0,
                "explanation": f"Related reports found, but details vary: '{best_match}'"
            }
        else:
            return {
                "status": "LIKELY FALSE",
                "confidence": 84.0,
                "explanation": "No matching reporting found across global news indexes."
            }

    def analyze(self, title, text):
        full_text = f"{title} {text}".strip()
        result = self.search_news_rss(full_text)

        if result:
            return result

        return {
            "status": "UNVERIFIED",
            "confidence": 50.0,
            "explanation": "Unable to verify claim against active news feeds."
        }