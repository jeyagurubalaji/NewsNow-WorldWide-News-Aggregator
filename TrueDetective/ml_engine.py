import re
import urllib.parse
import feedparser
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class RealFakeClassifier:
    def __init__(self):
        pass

    def clean_query(self, text):
        words = re.findall(r'\b[A-Za-z0-9]+\b', text)
        return " ".join(words[:6])

    def search_news_rss(self, claim_text):
        query_variants = [
            self.clean_query(claim_text),
            claim_text[:60]
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
                break

        if not entries:
            return None

        # Ultra-lightweight TF-IDF Cosine Similarity calculation
        headlines = [entry.get('title', '') for entry in entries]
        corpus = [claim_text] + headlines

        vectorizer = TfidfVectorizer().fit_transform(corpus)
        vectors = vectorizer.toarray()

        claim_vector = vectors[0].reshape(1, -1)
        headline_vectors = vectors[1:]

        similarities = cosine_similarity(claim_vector, headline_vectors)[0]

        max_idx = similarities.argmax()
        max_sim = similarities[max_idx]
        best_match = headlines[max_idx]

        if max_sim >= 0.35:
            confidence = round(min(80.0 + (max_sim * 20.0), 98.0), 1)
            return {
                "status": "LIKELY TRUE",
                "confidence": confidence,
                "explanation": f"Verified story matches global news reporting: '{best_match}'"
            }
        elif 0.15 <= max_sim < 0.35:
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