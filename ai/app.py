from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
from keybert import KeyBERT
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF
import warnings
warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)

print("Loading AI models... please wait")

# load sentiment model
sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment-latest",
    max_length=512,
    truncation=True
)

# load keyword model
kw_model = KeyBERT()

# load spacy
nlp = spacy.load("en_core_web_sm")

print("All models loaded successfully!")


# ─── HEALTH CHECK ───────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "civicsense-ai"})


# ─── SENTIMENT ──────────────────────────────────────────────
@app.route("/sentiment", methods=["POST"])
def sentiment():
    try:
        data = request.get_json()
        comments = data.get("comments", [])

        if not comments:
            return jsonify({"error": "No comments provided"}), 400

        results = []
        BATCH_SIZE = 32

        for i in range(0, len(comments), BATCH_SIZE):
            batch = comments[i:i + BATCH_SIZE]
            texts = [c["text"][:512] for c in batch]
            predictions = sentiment_pipeline(texts)

            for j, pred in enumerate(predictions):
                label = pred["label"].lower()
                if "pos" in label:
                    label = "positive"
                elif "neg" in label:
                    label = "negative"
                else:
                    label = "neutral"

                results.append({
                    "id": batch[j]["id"],
                    "label": label,
                    "score": round(pred["score"], 4)
                })

        return jsonify({"results": results})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── KEYWORDS ───────────────────────────────────────────────
@app.route("/keywords", methods=["POST"])
def keywords():
    try:
        data = request.get_json()
        comments = data.get("comments", [])

        if not comments:
            return jsonify({"error": "No comments provided"}), 400

        results = []

        for comment in comments:
            text = comment["text"]
            kws = kw_model.extract_keywords(
                text,
                keyphrase_ngram_range=(1, 2),
                stop_words="english",
                top_n=10
            )

            # spacy NER
            doc = nlp(text)
            entities = {ent.text.lower(): ent.label_ for ent in doc.ents}

            keyword_list = []
            for word, weight in kws:
                keyword_list.append({
                    "word": word,
                    "weight": round(weight, 4),
                    "entityType": entities.get(word.lower(), "KEYWORD")
                })

            results.append({
                "id": comment["id"],
                "keywords": keyword_list
            })

        return jsonify({"results": results})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── SUMMARIZE ──────────────────────────────────────────────
@app.route("/summarize", methods=["POST"])
def summarize():
    try:
        data = request.get_json()
        comments = data.get("comments", [])
        bill_id = data.get("billId", "")

        if not comments:
            return jsonify({"error": "No comments provided"}), 400

        # combine all texts
        all_text = " ".join([c["text"] for c in comments])

        # simple extractive summary using first 3 sentences
        sentences = all_text.replace(".", ".|").replace("!", "!|").replace("?", "?|").split("|")
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        summary = " ".join(sentences[:5])

        if not summary:
            summary = all_text[:500]

        return jsonify({
            "billId": bill_id,
            "summary": summary,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── TOPICS ─────────────────────────────────────────────────
@app.route("/topics", methods=["POST"])
def topics():
    try:
        data = request.get_json()
        comments = data.get("comments", [])

        if len(comments) < 3:
            return jsonify({"topics": []})

        texts = [c["text"] for c in comments]

        # TF-IDF + NMF topic modeling
        vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words="english",
            ngram_range=(1, 2)
        )
        tfidf = vectorizer.fit_transform(texts)

        n_topics = min(5, len(texts))
        nmf = NMF(n_components=n_topics, random_state=42)
        nmf.fit(tfidf)

        feature_names = vectorizer.get_feature_names_out()
        topics_list = []

        for i, topic in enumerate(nmf.components_):
            top_keywords = [
                feature_names[j] for j in topic.argsort()[:-11:-1]
            ]
            topics_list.append({
                "label": f"Theme {i + 1}",
                "keywords": top_keywords,
                "count": len(texts) // n_topics
            })

        return jsonify({"topics": topics_list})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)