"""Pre-download NLTK corpora at image build time."""

import nltk

DATASETS = [
    "punkt",
    "punkt_tab",
    "averaged_perceptron_tagger",
    "averaged_perceptron_tagger_eng",
    "stopwords",
    "wordnet",
    "omw-1.4",
    "book",
    "gutenberg",
    "genesis",
    "inaugural",
    "nps_chat",
    "webtext",
    "treebank",
    "words",
    "names",
]

TARGET = "/usr/share/nltk_data"

for ds in DATASETS:
    try:
        nltk.download(ds, download_dir=TARGET, quiet=True)
    except Exception as e:  # best-effort
        print(f"[warn] could not download {ds}: {e}")
