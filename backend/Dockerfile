FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    NLTK_DATA=/usr/share/nltk_data

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential \
      curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# spaCy models (sm = tagger/parser/ner; md = adds vectors for similarity)
RUN python -m spacy download en_core_web_sm \
 && python -m spacy download en_core_web_md

# NLTK corpora
COPY download_nltk.py .
RUN python download_nltk.py

COPY app ./app

# Separate non-root user used for subprocess sandboxing (uid 10001)
RUN useradd -m -u 10001 -s /bin/sh sandbox \
 && mkdir -p /app/data \
 && chown -R sandbox:sandbox /app/data

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
