import os
import tempfile
from urllib.parse import urlparse
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests


from dotenv import load_dotenv
load_dotenv()


app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
db = None


def _is_remote_url(value):
    try:
        parsed = urlparse(value)
        return parsed.scheme in ("http", "https")
    except Exception:
        return False


def _download_pdf_to_temp(file_url):
    response = requests.get(file_url, timeout=60)
    response.raise_for_status()

    tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    tmp_file.write(response.content)
    tmp_file.close()
    return tmp_file.name

@app.route('/', methods=['GET'])
def root():
    return jsonify({"service": "campuslearn-aiservice", "status": "up"}), 200

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

@app.route('/load', methods=['POST', 'OPTIONS'])
def load_notes():
    global db
    temp_file_path = None
    try:
        payload = request.get_json(silent=True) or {}
        file_path = payload.get('file_path')
        file_url = payload.get('file_url')
        reset = bool(payload.get('reset', False))

        if reset:
            db = None

        if not file_path and not file_url:
            return jsonify({"error": "file_path or file_url is required"}), 400

        source = file_path
        if file_url:
            if not _is_remote_url(file_url):
                return jsonify({"error": "Invalid file_url"}), 400
            temp_file_path = _download_pdf_to_temp(file_url)
            source = temp_file_path

        from loader import load_pdf
        from vector_store import create_vector_store, add_to_vector_store

        docs = load_pdf(source)
        if db is None:
            db = create_vector_store(docs)
        else:
            db = add_to_vector_store(db, docs)

        return jsonify({"message": "Notes loaded successfully"})
    except Exception as e:
        print("PYTHON LOAD ERROR 👉", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass


@app.route('/ask', methods=['POST', 'OPTIONS'])
def ask():
    global db

    if db is None:
        return jsonify({
            "answer": "Notes are not loaded yet. Please load notes first."
        }), 400

    try:
        payload = request.get_json(silent=True) or {}
        question = payload.get('question')
        if not question:
            return jsonify({"error": "question is required"}), 400
        from chatbot import get_answer
        answer = get_answer(db, question)
        return jsonify({"answer": answer})
    except Exception as e:
        print("ASK ERROR 👉", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/youtube', methods=['POST', 'OPTIONS'])
def youtube_mode():
    data = request.get_json(silent=True) or {}
    topic = data.get('topic')
    language = data.get('language', 'english')
    duration_filter = data.get('duration', 'all')
    recent = data.get('recent', False)

    if not topic:
        return jsonify({ "videos": [] })

    # Build search query
    query = f"{topic} full lecture"

    if language == "english":
        query += " english"
    elif language == "hindi":
        query += " hindi"

    if recent:
        query += " 2023 2024"

    import yt_dlp

    ydl_opts = {
        'quiet': True,
        'skip_download': True,
        'extract_flat': True
    }

    videos = []

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        result = ydl.extract_info(
            f"ytsearch15:{query}",
            download=False
        )

        for entry in result.get('entries', []):
            duration = entry.get('duration')
            duration_text = None

            if duration:
                duration = int(duration)
                minutes = duration // 60
                seconds = duration % 60
                duration_text = f"{minutes}:{seconds:02d}"

                # Duration filter
                if duration_filter == "short" and minutes > 10:
                    continue
                if duration_filter == "medium" and not (10 <= minutes <= 30):
                    continue
                if duration_filter == "long" and minutes < 30:
                    continue

            thumbnail = None
            thumbs = entry.get('thumbnails')
            if thumbs:
                thumbnail = thumbs[-1].get('url')

            videos.append({
                "title": entry.get('title'),
                "link": f"https://www.youtube.com/watch?v={entry.get('id')}",
                "channel": entry.get('uploader'),
                "thumbnail": thumbnail,
                "duration": duration_text
            })

            if len(videos) >= 9:
                break

    return jsonify({ "videos": videos })



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)

















# # from flask import Flask, request, jsonify
# from loader import load_pdf
# from vector_store import create_vector_store
# from chatbot import get_answer
# import yt_dlp


# from dotenv import load_dotenv
# load_dotenv()


# app = Flask(__name__)
# db = None

# @app.route('/load', methods=['POST'])
# def load_notes():
#     global db
#     try:
#         file_path = request.json['file_path']
#         docs = load_pdf(file_path)
#         db = create_vector_store(docs)
#         return jsonify({"message": "Notes loaded successfully"})
#     except Exception as e:
#         print("PYTHON LOAD ERROR 👉", str(e))
#         return jsonify({"error": str(e)}),


# @app.route('/ask', methods=['POST'])
# def ask():
#     global db

#     if db is None:
#         return jsonify({
#             "answer": "Notes are not loaded yet. Please load notes first."
#         }), 400

#     try:
#         question = request.json['question']
#         answer = get_answer(db, question)
#         return jsonify({"answer": answer})
#     except Exception as e:
#         print("ASK ERROR 👉", str(e))
#         return jsonify({"error": str(e)}), 500


# @app.route('/youtube', methods=['POST'])
# def youtube_mode():
#     data = request.json
#     topic = data.get('topic')
#     language = data.get('language', 'english')
#     duration_filter = data.get('duration', 'all')
#     recent = data.get('recent', False)

#     if not topic:
#         return jsonify({ "videos": [] })

#     # Build search query
#     query = f"{topic} full lecture"

#     if language == "english":
#         query += " english"
#     elif language == "hindi":
#         query += " hindi"

#     if recent:
#         query += " 2023 2024"

#     ydl_opts = {
#         'quiet': True,
#         'skip_download': True,
#         'extract_flat': True
#     }

#     videos = []

#     with yt_dlp.YoutubeDL(ydl_opts) as ydl:
#         result = ydl.extract_info(
#             f"ytsearch15:{query}",
#             download=False
#         )

#         for entry in result.get('entries', []):
#             duration = entry.get('duration')
#             duration_text = None

#             if duration:
#                 duration = int(duration)
#                 minutes = duration // 60
#                 seconds = duration % 60
#                 duration_text = f"{minutes}:{seconds:02d}"

#                 # Duration filter
#                 if duration_filter == "short" and minutes > 10:
#                     continue
#                 if duration_filter == "medium" and not (10 <= minutes <= 30):
#                     continue
#                 if duration_filter == "long" and minutes < 30:
#                     continue

#             thumbnail = None
#             thumbs = entry.get('thumbnails')
#             if thumbs:
#                 thumbnail = thumbs[-1].get('url')

#             videos.append({
#                 "title": entry.get('title'),
#                 "link": f"https://www.youtube.com/watch?v={entry.get('id')}",
#                 "channel": entry.get('uploader'),
#                 "thumbnail": thumbnail,
#                 "duration": duration_text
#             })

#             if len(videos) >= 9:
#                 break

#     return jsonify({ "videos": videos })



# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=8000)
