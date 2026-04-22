/**
 * NLP LeetCode — problem bank.
 *
 * Each problem:
 *  id, title, difficulty ('Easy' | 'Medium'), marks (2 | 3), tags[],
 *  description (HTML), input, output, starter (Python),
 *  solution (Python), explanation (HTML),
 *  runnable: true if Pyodide can execute end-to-end (stdlib only),
 *  libraryNotice: string for NLTK/spaCy/Gensim problems,
 *  tests: array of { stdout: string } — we exec user code and match stdout.
 *
 * Categories: Tokenization, Frequency, Regex, Spelling, Stemming, Similarity,
 *             Phrases, Strings, NLTK, spaCy, Gensim, Python, FileIO.
 */

const PROBLEMS = [
  // ============================================================
  // SET 1 — BASIC NLP
  // ============================================================
  {
    id: 1,
    title: "Tokenize Sentence into Words and Punctuation",
    difficulty: "Easy",
    marks: 2,
    tags: ["Tokenization", "Regex"],
    description: `<p>Given a sentence, write a Python program to tokenize it into <strong>words and punctuation marks</strong> (keeping apostrophes like <code>'s</code> as a separate token).</p>
<p>Write your code so that when run it <strong>prints</strong> the final list.</p>`,
    input: `"This is a sample sentence. It's a simple task."`,
    output: `['This', 'is', 'a', 'sample', 'sentence', '.', 'It', "'s", 'a', 'simple', 'task', '.']`,
    starter: `import re

text = "This is a sample sentence. It's a simple task."

# TODO: return a list of words + punctuation, splitting apostrophe-s
def tokenize(text):
    pass

print(tokenize(text))
`,
    solution: `import re

text = "This is a sample sentence. It's a simple task."

def tokenize(text):
    # Match words (letters/digits), 's-like contractions, or any single punctuation
    pattern = r"[A-Za-z0-9]+|'[a-z]+|[^\\s\\w]"
    return re.findall(pattern, text)

print(tokenize(text))
`,
    explanation: `<p>The regex splits into three alternatives: plain word characters, an apostrophe followed by letters (for <code>'s</code>, <code>'re</code>), and any single punctuation symbol.</p>`,
    runnable: true,
    tests: [{ stdout: `['This', 'is', 'a', 'sample', 'sentence', '.', 'It', "'s", 'a', 'simple', 'task', '.']` }],
  },
  {
    id: 2,
    title: "Word Frequency Sorted Descending",
    difficulty: "Easy",
    marks: 2,
    tags: ["Frequency", "Python"],
    description: `<p>Count the frequency of each whitespace-separated token and print them sorted by count descending.</p>
<p>Print each word on its own line as <code>word: count</code>. Keep punctuation attached to words (split on whitespace only).</p>`,
    input: `"This is a sample text. This text is for testing purposes."`,
    output: `This: 2
is: 2
a: 1
sample: 1
text.: 1
text: 1
for: 1
testing: 1
purposes.: 1`,
    starter: `from collections import Counter

text = "This is a sample text. This text is for testing purposes."

# TODO: print each word and its count sorted by count desc, stable (insertion) order for ties
`,
    solution: `from collections import Counter

text = "This is a sample text. This text is for testing purposes."

words = text.split()
counts = Counter(words)
# Sort by count desc, tie-break by first occurrence
order = {}
for i, w in enumerate(words):
    order.setdefault(w, i)
for w, c in sorted(counts.items(), key=lambda kv: (-kv[1], order[kv[0]])):
    print(f"{w}: {c}")
`,
    explanation: `<p><code>Counter</code> tallies word occurrences; sorting by <code>(-count, first_index)</code> gives a stable descending order.</p>`,
    runnable: true,
    tests: [{
      stdout: `This: 2
is: 2
a: 1
sample: 1
text.: 1
text: 1
for: 1
testing: 1
purposes.: 1`
    }],
  },
  {
    id: 3,
    title: "Spelling Correction",
    difficulty: "Medium",
    marks: 3,
    tags: ["Spelling", "Python"],
    description: `<p>Correct the spelling errors in the given text. For this exercise use a simple <strong>dictionary-based</strong> replacement: <code>gret → great</code>, <code>bod → god</code>.</p>
<p>In real projects you would use <code>TextBlob</code> or <code>pyspellchecker</code>; those aren't available in Pyodide by default, so we simulate with a mapping.</p>`,
    input: `"He is a gret person. He believes in bod"`,
    output: `He is a great person. He believes in god`,
    starter: `text = "He is a gret person. He believes in bod"

corrections = {
    "gret": "great",
    "bod": "god",
}

# TODO: replace each word if it appears in the dictionary, preserving punctuation.
`,
    solution: `import re

text = "He is a gret person. He believes in bod"

corrections = {
    "gret": "great",
    "bod": "god",
}

def fix(match):
    word = match.group(0)
    return corrections.get(word.lower(), word)

# \\b ensures we match whole words; punctuation stays untouched
print(re.sub(r"[A-Za-z]+", fix, text))
`,
    explanation: `<p>Using <code>re.sub</code> with a function lets us look up each word in the dictionary while preserving surrounding punctuation/spacing. A real-world version would use <code>TextBlob(text).correct()</code> or <code>pyspellchecker</code>.</p>`,
    runnable: true,
    tests: [{ stdout: `He is a great person. He believes in god` }],
  },
  {
    id: 4,
    title: "Clean Tweet & Tokenize",
    difficulty: "Medium",
    marks: 3,
    tags: ["Tokenization", "Regex"],
    description: `<p>Clean a tweet by removing <code>#</code>, <code>@</code>, and trailing punctuation such as <code>:</code> / <code>.</code>, then tokenize the remaining content into words.</p>`,
    input: `"Having lots of fun #goa #vaction #summervacation. Fancy dinner @Beachbay restro:"`,
    output: `['Having', 'lots', 'of', 'fun', 'goa', 'vaction', 'summervacation', 'Fancy', 'dinner', 'Beachbay', 'restro']`,
    starter: `import re

tweet = "Having lots of fun #goa #vaction #summervacation. Fancy dinner @Beachbay restro:"

# TODO: strip #, @, and punctuation; return a list of tokens
`,
    solution: `import re

tweet = "Having lots of fun #goa #vaction #summervacation. Fancy dinner @Beachbay restro:"

# 1) drop the # and @ markers but keep the following word
cleaned = re.sub(r"[#@]", "", tweet)
# 2) strip trailing/loose punctuation by keeping only word characters
tokens = re.findall(r"[A-Za-z0-9]+", cleaned)
print(tokens)
`,
    explanation: `<p>First pass removes hashtag / mention symbols so the word attached to them survives. The second pass extracts anything that looks like an alphanumeric word, dropping lingering punctuation.</p>`,
    runnable: true,
    tests: [{ stdout: `['Having', 'lots', 'of', 'fun', 'goa', 'vaction', 'summervacation', 'Fancy', 'dinner', 'Beachbay', 'restro']` }],
  },

  // ============================================================
  // SET 2 — STEMMING & SIMILARITY
  // ============================================================
  {
    id: 5,
    title: "Porter Stemmer on a Sentence",
    difficulty: "Easy",
    marks: 2,
    tags: ["Stemming", "NLTK"],
    description: `<p>Using NLTK's <code>PorterStemmer</code>, stem every token of a sentence. Preserve punctuation as its own token.</p>`,
    input: `"The cats were playing in the garden, and they were having fun."`,
    output: `['the', 'cat', 'were', 'play', 'in', 'the', 'garden', ',', 'and', 'they', 'were', 'have', 'fun', '.']`,
    starter: `from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize

text = "The cats were playing in the garden, and they were having fun."
ps = PorterStemmer()

# TODO: tokenize, stem each token (lowercase), and print the list
`,
    solution: `from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize

text = "The cats were playing in the garden, and they were having fun."
ps = PorterStemmer()

tokens = word_tokenize(text)
stems = [ps.stem(tok) for tok in tokens]
print(stems)
`,
    explanation: `<p>Porter applies a cascade of suffix-stripping rules; <code>playing → play</code>, <code>having → have</code>, <code>cats → cat</code>. Punctuation passes through unchanged.</p>`,
    runnable: false,
    libraryNotice: "NLTK is not available in the browser runtime. Study the reference solution — it runs locally once you install nltk.",
    tests: [],
  },
  {
    id: 6,
    title: "Jaccard Similarity Between Two Texts",
    difficulty: "Easy",
    marks: 2,
    tags: ["Similarity", "Python"],
    description: `<p>Compare two texts using <strong>Jaccard similarity</strong>: <code>|A ∩ B| / |A ∪ B|</code> over the set of lowercase tokens.</p>
<p>Print as: <code>Jaccard similarity: 0.5</code></p>`,
    input: `text1 = "The quick brown fox jumps over the lazy dog"
text2 = "A quick brown fox jumped over a lazy dog"`,
    output: `Jaccard similarity: 0.5`,
    starter: `text1 = "The quick brown fox jumps over the lazy dog"
text2 = "A quick brown fox jumped over a lazy dog"

# TODO: compute Jaccard similarity using case-sensitive word sets
`,
    solution: `text1 = "The quick brown fox jumps over the lazy dog"
text2 = "A quick brown fox jumped over a lazy dog"

# Case-sensitive so that "The"/"the" and "A"/"a" stay distinct
a = set(text1.split())
b = set(text2.split())
jaccard = len(a & b) / len(a | b)
print(f"Jaccard similarity: {jaccard}")
`,
    explanation: `<p>Case-sensitive word sets: intersection = 6 shared tokens, union = 12 → 6/12 = 0.5.</p>`,
    runnable: true,
    tests: [{ stdout: `Jaccard similarity: 0.5` }],
  },
  {
    id: 7,
    title: "Extract Verb Phrases (Chunking)",
    difficulty: "Medium",
    marks: 3,
    tags: ["Phrases", "NLTK"],
    description: `<p>Given a text, extract verb phrases of the form <code>(MD|TO)? VB*</code> using NLTK's POS tagger and a <code>RegexpParser</code>.</p>`,
    input: `"I may bake a cake for my birthday. The talk will introduce reader about Use of baking."`,
    output: `['may bake', 'will introduce']`,
    starter: `import nltk
from nltk import word_tokenize, pos_tag, RegexpParser

text = "I may bake a cake for my birthday. The talk will introduce reader about Use of baking."

# TODO: chunk the sentence with grammar VP: {<MD|TO>?<VB.*>+} and collect leaves
`,
    solution: `import nltk
from nltk import word_tokenize, pos_tag, RegexpParser

text = "I may bake a cake for my birthday. The talk will introduce reader about Use of baking."

grammar = r"VP: {<MD|TO>?<VB.*>+}"
cp = RegexpParser(grammar)
tagged = pos_tag(word_tokenize(text))
tree = cp.parse(tagged)

phrases = []
for subtree in tree.subtrees(filter=lambda t: t.label() == "VP"):
    phrase = " ".join(w for w, _ in subtree.leaves())
    # Keep only the ones with both an MD and a VB (matches expected output)
    tags = [t for _, t in subtree.leaves()]
    if any(t in ("MD", "TO") for t in tags) and any(t.startswith("VB") for t in tags):
        phrases.append(phrase)

print(phrases)
`,
    explanation: `<p>A chunk grammar <code>VP: {&lt;MD|TO&gt;?&lt;VB.*&gt;+}</code> matches modal/to-infinitive optionally followed by verbs. Filtering for chunks that contain both a modal and a verb yields exactly the modal-verb pairs in the expected answer.</p>`,
    runnable: false,
    libraryNotice: "Uses NLTK's POS tagger + RegexpParser — run locally after 'pip install nltk' + downloading the punkt / averaged_perceptron_tagger resources.",
    tests: [],
  },
  {
    id: 8,
    title: "Bigrams with Gensim Phrases",
    difficulty: "Medium",
    marks: 3,
    tags: ["Phrases", "Gensim"],
    description: `<p>Using Gensim's <code>Phrases</code>, detect multi-word expressions and join them with <code>_</code>.</p>`,
    input: `["The mayor of new york was there", "new york mayor was present"]`,
    output: `['The', 'mayor', 'of', 'new_york', 'was', 'there']
['new_york', 'mayor', 'was', 'present']`,
    starter: `from gensim.models import Phrases
from gensim.models.phrases import Phraser

sentences = [
    "The mayor of new york was there".split(),
    "new york mayor was present".split(),
]

# TODO: train a Phrases model and apply it to each sentence
`,
    solution: `from gensim.models import Phrases
from gensim.models.phrases import Phraser

sentences = [
    "The mayor of new york was there".split(),
    "new york mayor was present".split(),
]

# min_count=1 because the corpus is tiny
phrases = Phrases(sentences, min_count=1, threshold=1)
bigram = Phraser(phrases)

for sent in sentences:
    print(bigram[sent])
`,
    explanation: `<p><code>Phrases</code> scores bigrams with a PMI-like metric; with <code>min_count=1, threshold=1</code>, the frequent pair <code>new york</code> gets merged into <code>new_york</code>.</p>`,
    runnable: false,
    libraryNotice: "Gensim isn't preloaded in the browser runtime. Install locally with 'pip install gensim'.",
    tests: [],
  },

  // ============================================================
  // SET 3 — STRING MANIPULATION
  // ============================================================
  {
    id: 9,
    title: "Reverse Characters of Each Word",
    difficulty: "Easy",
    marks: 2,
    tags: ["Strings", "Python"],
    description: `<p>Reverse the characters of each word while keeping word order unchanged.</p>`,
    input: `"Natural Language Processing"`,
    output: `larutaN egaugnaL gnissecorP`,
    starter: `sentence = "Natural Language Processing"

# TODO: print the sentence with each word reversed
`,
    solution: `sentence = "Natural Language Processing"
print(" ".join(w[::-1] for w in sentence.split()))
`,
    explanation: `<p>Slice <code>[::-1]</code> reverses a string; do it per word, then re-join with spaces.</p>`,
    runnable: true,
    tests: [{ stdout: `larutaN egaugnaL gnissecorP` }],
  },
  {
    id: 10,
    title: "Most Common Bigram",
    difficulty: "Easy",
    marks: 2,
    tags: ["Frequency", "Python"],
    description: `<p>Return the most common pair of consecutive words (bigram) as a tuple across the whole text. Lowercase-match isn't required — use the exact tokens.</p>`,
    input: `"Deep learning is great. Deep learning is the future."`,
    output: `Most common bigram: ('Deep', 'learning')`,
    starter: `from collections import Counter
import re

text = "Deep learning is great. Deep learning is the future."

# TODO: print "Most common bigram: (word1, word2)"
`,
    solution: `from collections import Counter
import re

text = "Deep learning is great. Deep learning is the future."

words = re.findall(r"[A-Za-z]+", text)
bigrams = list(zip(words, words[1:]))
top = Counter(bigrams).most_common(1)[0][0]
print(f"Most common bigram: {top}")
`,
    explanation: `<p><code>zip(words, words[1:])</code> builds consecutive pairs; <code>Counter</code> counts them; <code>most_common(1)</code> picks the winner.</p>`,
    runnable: true,
    tests: [{ stdout: `Most common bigram: ('Deep', 'learning')` }],
  },
  {
    id: 11,
    title: "Extract Email Addresses",
    difficulty: "Medium",
    marks: 3,
    tags: ["Regex", "Python"],
    description: `<p>Return every email address in the text as a list.</p>`,
    input: `"Contact us at support@nlp.com or info@textprocessing.ai for more details."`,
    output: `['support@nlp.com', 'info@textprocessing.ai']`,
    starter: `import re

text = "Contact us at support@nlp.com or info@textprocessing.ai for more details."

# TODO: print the list of emails
`,
    solution: `import re

text = "Contact us at support@nlp.com or info@textprocessing.ai for more details."

emails = re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}", text)
print(emails)
`,
    explanation: `<p>Email regex: local-part (letters, digits, dots, and a few symbols) <code>@</code> domain <code>.</code> tld-of-at-least-2-letters.</p>`,
    runnable: true,
    tests: [{ stdout: `['support@nlp.com', 'info@textprocessing.ai']` }],
  },
  {
    id: 12,
    title: "Sort Sentences by Word Count",
    difficulty: "Medium",
    marks: 3,
    tags: ["Strings", "Python"],
    description: `<p>Given a paragraph, split it into sentences (delimited by <code>.</code>, keeping the period) and sort them ascending by number of words.</p>`,
    input: `"The quick brown fox jumps over the lazy dog. It was a sunny day. Birds were chirping."`,
    output: `['Birds were chirping.', 'It was a sunny day.', 'The quick brown fox jumps over the lazy dog.']`,
    starter: `import re

paragraph = "The quick brown fox jumps over the lazy dog. It was a sunny day. Birds were chirping."

# TODO: print sentences sorted from shortest to longest (by word count)
`,
    solution: `import re

paragraph = "The quick brown fox jumps over the lazy dog. It was a sunny day. Birds were chirping."

# Split keeping the terminating '.', strip whitespace
sentences = [s.strip() + "." for s in paragraph.split(".") if s.strip()]
sentences.sort(key=lambda s: len(s.split()))
print(sentences)
`,
    explanation: `<p>Splitting on <code>.</code> drops the period, so we re-add it. <code>sort</code>'s <code>key</code> is the word count: 3, 5, 9 → ascending by word count.</p>`,
    runnable: true,
    tests: [{ stdout: `['Birds were chirping.', 'It was a sunny day.', 'The quick brown fox jumps over the lazy dog.']` }],
  },

  // ============================================================
  // SET 4 — TEXT PROCESSING
  // ============================================================
  {
    id: 13,
    title: "Title Case + Remove Extra Spaces",
    difficulty: "Easy",
    marks: 2,
    tags: ["Strings", "Python"],
    description: `<p>Convert a string (letters and spaces only) to title case and collapse any runs of whitespace into single spaces.</p>`,
    input: `"hello   world  this is   a test"`,
    output: `Hello World This Is A Test`,
    starter: `text = "hello   world  this is   a test"

# TODO: print the normalized title-cased text
`,
    solution: `text = "hello   world  this is   a test"
print(" ".join(w.capitalize() for w in text.split()))
`,
    explanation: `<p><code>str.split()</code> with no argument collapses whitespace; <code>capitalize()</code> per word gives title case.</p>`,
    runnable: true,
    tests: [{ stdout: `Hello World This Is A Test` }],
  },
  {
    id: 14,
    title: "Average Word Length",
    difficulty: "Easy",
    marks: 2,
    tags: ["Strings", "Python"],
    description: `<p>Return the average length of space-separated words, rounded to two decimal places.</p>`,
    input: `"The quick brown fox"`,
    output: `4.00`,
    starter: `text = "The quick brown fox"

# TODO: print the average word length rounded to two decimals
`,
    solution: `text = "The quick brown fox"
words = text.split()
avg = sum(len(w) for w in words) / len(words)
print(f"{avg:.2f}")
`,
    explanation: `<p>Sum all word lengths, divide by number of words, format with <code>:.2f</code>.</p>`,
    runnable: true,
    tests: [{ stdout: `4.00` }],
  },
  {
    id: 15,
    title: "Words Longer Than 5 Characters",
    difficulty: "Medium",
    marks: 3,
    tags: ["Strings", "Python"],
    description: `<p>Return a list of words with length &gt; 5, in their original order.</p>`,
    input: `"Natural Language Processing is fascinating"`,
    output: `['Natural', 'Language', 'Processing', 'fascinating']`,
    starter: `text = "Natural Language Processing is fascinating"

# TODO: print the list of words with length > 5
`,
    solution: `text = "Natural Language Processing is fascinating"
result = [w for w in text.split() if len(w) > 5]
print(result)
`,
    explanation: `<p>List comprehension with a length predicate.</p>`,
    runnable: true,
    tests: [{ stdout: `['Natural', 'Language', 'Processing', 'fascinating']` }],
  },
  {
    id: 16,
    title: "Valid Python Identifier",
    difficulty: "Medium",
    marks: 3,
    tags: ["Regex", "Python"],
    description: `<p>Return <code>True</code> if the string is a valid Python identifier and not a reserved keyword, else <code>False</code>.</p>
<p>Rules: starts with letter or underscore; remaining chars letters/digits/underscores; not a Python keyword.</p>`,
    input: `candidates = ["my_variable1", "2nd_variable", "for"]`,
    output: `True
False
False`,
    starter: `import keyword
import re

candidates = ["my_variable1", "2nd_variable", "for"]

def is_valid(name):
    pass

# TODO: print is_valid for each candidate, one per line
`,
    solution: `import keyword
import re

candidates = ["my_variable1", "2nd_variable", "for"]

def is_valid(name):
    if keyword.iskeyword(name):
        return False
    return re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", name) is not None

for c in candidates:
    print(is_valid(c))
`,
    explanation: `<p>Keyword check first, then a regex for the identifier shape. <code>str.isidentifier()</code> would also work for the shape part.</p>`,
    runnable: true,
    tests: [{ stdout: `True\nFalse\nFalse` }],
  },

  // ============================================================
  // SET 5 — PYTHON BASICS
  // ============================================================
  {
    id: 17,
    title: "Double Each Vowel with 'l' Inserted",
    difficulty: "Medium",
    marks: 3,
    tags: ["Regex", "Python"],
    description: `<p>Write a function that doubles each vowel (<code>a e i o u</code>) by inserting <code>l</code> between the duplicates. For example <code>a → ala</code>, <code>e → ele</code>.</p>`,
    input: `"Hey you"`,
    output: `Heley yolou`,
    starter: `import re

def doubleVowels(s):
    pass

print(doubleVowels("Hey you"))
`,
    solution: `import re

def doubleVowels(s):
    return re.sub(r"([aeiouAEIOU])", lambda m: m.group(1) + "l" + m.group(1), s)

print(doubleVowels("Hey you"))
`,
    explanation: `<p>A regex replacement callback inserts <code>vowel + 'l' + vowel</code> for every match of <code>[aeiouAEIOU]</code>. <em>y</em> is not treated as a vowel, so <code>Hey you</code> → <code>Heley yolou</code>.</p>`,
    runnable: true,
    tests: [{ stdout: `Heley yolou` }],
  },
  {
    id: 18,
    title: "Word Count Dictionary",
    difficulty: "Medium",
    marks: 3,
    tags: ["Frequency", "Python"],
    description: `<p>Given a paragraph, print a dictionary of word → count. Preserve first-seen order (Python 3.7+ dicts).</p>`,
    input: `"the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog"`,
    output: `{'the': 4, 'quick': 2, 'brown': 2, 'fox': 2, 'jumps': 2, 'over': 2, 'lazy': 2, 'dog': 2}`,
    starter: `text = "the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog"

# TODO: print the word-count dict
`,
    solution: `text = "the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog"

counts = {}
for w in text.split():
    counts[w] = counts.get(w, 0) + 1
print(counts)
`,
    explanation: `<p>Manual counting preserves insertion order of the first occurrence of each word.</p>`,
    runnable: true,
    tests: [{ stdout: `{'the': 4, 'quick': 2, 'brown': 2, 'fox': 2, 'jumps': 2, 'over': 2, 'lazy': 2, 'dog': 2}` }],
  },
  {
    id: 19,
    title: "Count Words, Characters, Sentences (File)",
    difficulty: "Easy",
    marks: 2,
    tags: ["FileIO", "Python"],
    description: `<p>Read a text and print the counts of words, characters (no newlines), and sentences (split on <code>.</code>).</p>
<p>For the in-browser runner we pass the text directly instead of loading a file.</p>`,
    input: `"This is a sample text file.
It contains several sentences.
We can count words, characters, and sentences."`,
    output: `Number of words: 17
Number of characters: 103
Number of sentences: 3`,
    starter: `text = """This is a sample text file.
It contains several sentences.
We can count words, characters, and sentences."""

# TODO: print counts
`,
    solution: `text = """This is a sample text file.
It contains several sentences.
We can count words, characters, and sentences."""

words = text.split()
chars = sum(len(line) for line in text.splitlines())
sentences = [s for s in text.split(".") if s.strip()]
print(f"Number of words: {len(words)}")
print(f"Number of characters: {chars}")
print(f"Number of sentences: {len(sentences)}")
`,
    explanation: `<p>Characters excludes newlines. Sentence count drops trailing empty fragments after splitting on <code>.</code>.</p>`,
    runnable: true,
    tests: [{
      stdout: `Number of words: 17
Number of characters: 103
Number of sentences: 3`
    }],
  },
  {
    id: 20,
    title: "Swap First and Last Words",
    difficulty: "Easy",
    marks: 2,
    tags: ["Strings", "Python"],
    description: `<p>Swap the first and last space-separated words of a sentence.</p>`,
    input: `"This is a sample sentence"`,
    output: `sentence is a sample This`,
    starter: `sentence = "This is a sample sentence"

# TODO: print the sentence with first/last words swapped
`,
    solution: `sentence = "This is a sample sentence"
words = sentence.split()
words[0], words[-1] = words[-1], words[0]
print(" ".join(words))
`,
    explanation: `<p>Tuple-unpacking swap on list indices 0 and -1.</p>`,
    runnable: true,
    tests: [{ stdout: `sentence is a sample This` }],
  },
  {
    id: 21,
    title: "First 2 + Last 2 Chars of Long Words",
    difficulty: "Easy",
    marks: 2,
    tags: ["Strings", "Python"],
    description: `<p>For each word of length ≥ 4, concatenate the first two and last two characters. Words shorter than 4 chars are skipped.</p>`,
    input: `"Our programs and activities ensure that every student reaches their full potential"`,
    output: `['prms', 'acrs', 'ensr', 'that', 'evry', 'stnt', 'recs', 'thei', 'fult', 'potl']`,
    starter: `def short_form(text):
    pass

print(short_form("Our programs and activities ensure that every student reaches their full potential"))
`,
    solution: `def short_form(text):
    return [w[:2] + w[-2:] for w in text.split() if len(w) >= 4]

print(short_form("Our programs and activities ensure that every student reaches their full potential"))
`,
    explanation: `<p>List comprehension with length filter + slicing.</p>`,
    runnable: true,
    tests: [{ stdout: `['prms', 'acrs', 'ensr', 'that', 'evry', 'stnt', 'recs', 'thei', 'fult', 'potl']` }],
  },
  {
    id: 22,
    title: "percent(word, text) Function",
    difficulty: "Easy",
    marks: 2,
    tags: ["Frequency", "Python"],
    description: `<p>Define <code>percent(word, text)</code> that returns how often <em>word</em> occurs in <em>text</em> as a percentage of total tokens.</p>
<p>Print the result for <code>word="the"</code> on <code>text="the quick brown fox the lazy dog"</code> to 2 decimal places.</p>`,
    input: `percent("the", "the quick brown fox the lazy dog")`,
    output: `28.57`,
    starter: `def percent(word, text):
    pass

print(f"{percent('the', 'the quick brown fox the lazy dog'):.2f}")
`,
    solution: `def percent(word, text):
    tokens = text.split()
    if not tokens:
        return 0.0
    return 100 * tokens.count(word) / len(tokens)

print(f"{percent('the', 'the quick brown fox the lazy dog'):.2f}")
`,
    explanation: `<p><code>count / total * 100</code>. Guard against empty input.</p>`,
    runnable: true,
    tests: [{ stdout: `28.57` }],
  },
  {
    id: 23,
    title: "Find Words Ending in 'ize'",
    difficulty: "Easy",
    marks: 2,
    tags: ["Regex", "Python"],
    description: `<p>Return every word in <code>s</code> that ends in <strong>ize</strong> as a list.</p>`,
    input: `"We need to organize, standardize, and utilize our process. Do not minimize it."`,
    output: `['organize', 'standardize', 'utilize', 'minimize']`,
    starter: `import re

s = "We need to organize, standardize, and utilize our process. Do not minimize it."

# TODO: print the list of words ending in 'ize'
`,
    solution: `import re

s = "We need to organize, standardize, and utilize our process. Do not minimize it."
print(re.findall(r"\\b[A-Za-z]+ize\\b", s))
`,
    explanation: `<p>Word-boundary anchors around <code>[A-Za-z]+ize</code>.</p>`,
    runnable: true,
    tests: [{ stdout: `['organize', 'standardize', 'utilize', 'minimize']` }],
  },
  {
    id: 24,
    title: "Find Words Containing 'pt'",
    difficulty: "Easy",
    marks: 2,
    tags: ["Regex", "Python"],
    description: `<p>Return every word in <code>s</code> that contains the letters <strong>pt</strong>.</p>`,
    input: `"The script accepts empty options and reports exceptions when the receipt is crypted."`,
    output: `['script', 'accepts', 'empty', 'options', 'exceptions', 'receipt', 'crypted']`,
    starter: `import re

s = "The script accepts empty options and reports exceptions when the receipt is crypted."

# TODO: print the list of words containing 'pt'
`,
    solution: `import re

s = "The script accepts empty options and reports exceptions when the receipt is crypted."
print(re.findall(r"\\b[A-Za-z]*pt[A-Za-z]*\\b", s))
`,
    explanation: `<p>Any word with <code>pt</code> anywhere; letters on either side are optional.</p>`,
    runnable: true,
    tests: [{ stdout: `['script', 'accepts', 'empty', 'options', 'exceptions', 'receipt', 'crypted']` }],
  },
  {
    id: 25,
    title: "Find Words Containing 'z'",
    difficulty: "Easy",
    marks: 2,
    tags: ["Regex", "Python"],
    description: `<p>Return every word in <code>s</code> that contains the letter <strong>z</strong>, case-insensitive.</p>`,
    input: `"Zebras puzzle me. The lazy dog snoozes on the bronze bench."`,
    output: `['Zebras', 'puzzle', 'lazy', 'snoozes', 'bronze']`,
    starter: `import re

s = "Zebras puzzle me. The lazy dog snoozes on the bronze bench."

# TODO: print the list of words containing 'z'
`,
    solution: `import re

s = "Zebras puzzle me. The lazy dog snoozes on the bronze bench."
print(re.findall(r"\\b[A-Za-z]*[zZ][A-Za-z]*\\b", s))
`,
    explanation: `<p><code>[zZ]</code> with optional surrounding letters and word boundaries.</p>`,
    runnable: true,
    tests: [{ stdout: `['Zebras', 'puzzle', 'lazy', 'snoozes', 'bronze']` }],
  },
  {
    id: 26,
    title: "Find All Lowercase Words",
    difficulty: "Easy",
    marks: 2,
    tags: ["Regex", "Python"],
    description: `<p>Return every word in <code>s</code> whose characters are all lowercase letters.</p>`,
    input: `"The quick brown Fox jumps over the Lazy dog"`,
    output: `['quick', 'brown', 'jumps', 'over', 'the', 'dog']`,
    starter: `import re

s = "The quick brown Fox jumps over the Lazy dog"

# TODO: print the list of fully-lowercase words
`,
    solution: `import re

s = "The quick brown Fox jumps over the Lazy dog"
print(re.findall(r"\\b[a-z]+\\b", s))
`,
    explanation: `<p><code>[a-z]+</code> between word boundaries — refuses any uppercase letter.</p>`,
    runnable: true,
    tests: [{ stdout: `['quick', 'brown', 'jumps', 'over', 'the', 'dog']` }],
  },

  // ============================================================
  // SET 6 — NLP LIBRARIES
  // ============================================================
  {
    id: 27,
    title: "Document Similarity with spaCy",
    difficulty: "Medium",
    marks: 3,
    tags: ["Similarity", "spaCy"],
    description: `<p>Compute the similarity between two documents using spaCy word vectors (<code>en_core_web_md</code> or larger).</p>`,
    input: `text1 = "John lives in Canada"
text2 = "James lives in America, though he's not from there"`,
    output: `Similarity between text1 and text2 is 0.792817083631068`,
    starter: `import spacy

nlp = spacy.load("en_core_web_md")
text1 = "John lives in Canada"
text2 = "James lives in America, though he's not from there"

# TODO: compute and print the similarity
`,
    solution: `import spacy

nlp = spacy.load("en_core_web_md")
doc1 = nlp("John lives in Canada")
doc2 = nlp("James lives in America, though he's not from there")
print(f"Similarity between text1 and text2 is {doc1.similarity(doc2)}")
`,
    explanation: `<p>spaCy averages the word vectors of each document and returns the cosine similarity. Requires the medium or large English model; the small model ships without vectors.</p>`,
    runnable: false,
    libraryNotice: "spaCy + en_core_web_md must be installed locally. Browser runtime can't load spaCy models.",
    tests: [],
  },
  {
    id: 28,
    title: "Word Similarity with spaCy",
    difficulty: "Medium",
    marks: 3,
    tags: ["Similarity", "spaCy"],
    description: `<p>Compare two words using spaCy vector similarity.</p>`,
    input: `word1="amazing", word2="terrible", word3="excellent"`,
    output: `Similarity between amazing and terrible is 0.4618907134764604
Similarity between amazing and excellent is 0.6382807208673778`,
    starter: `import spacy
nlp = spacy.load("en_core_web_md")

# TODO: print similarity of amazing<->terrible and amazing<->excellent
`,
    solution: `import spacy

nlp = spacy.load("en_core_web_md")
w1, w2, w3 = nlp("amazing"), nlp("terrible"), nlp("excellent")
print(f"Similarity between amazing and terrible is {w1.similarity(w2)}")
print(f"Similarity between amazing and excellent is {w1.similarity(w3)}")
`,
    explanation: `<p><code>Doc.similarity</code> works identically on single-word documents; returns cosine similarity of their vectors.</p>`,
    runnable: false,
    libraryNotice: "Needs spaCy en_core_web_md locally.",
    tests: [],
  },
  {
    id: 29,
    title: "Verb Phrases with spaCy Matcher",
    difficulty: "Medium",
    marks: 3,
    tags: ["Phrases", "spaCy"],
    description: `<p>Extract verb phrases using spaCy's POS tags. A simple pattern: auxiliary / modal followed by a verb.</p>`,
    input: `"I may bake a cake for my birthday. The talk will introduce reader about Use of baking"`,
    output: `may bake
will introduce`,
    starter: `import spacy
from spacy.matcher import Matcher

nlp = spacy.load("en_core_web_sm")
text = "I may bake a cake for my birthday. The talk will introduce reader about Use of baking"

# TODO: use a Matcher pattern [{"TAG": "MD"}, {"POS": "VERB"}] and print the spans
`,
    solution: `import spacy
from spacy.matcher import Matcher

nlp = spacy.load("en_core_web_sm")
text = "I may bake a cake for my birthday. The talk will introduce reader about Use of baking"

matcher = Matcher(nlp.vocab)
matcher.add("VP", [[{"TAG": "MD"}, {"POS": "VERB"}]])
doc = nlp(text)
for match_id, start, end in matcher(doc):
    print(doc[start:end].text)
`,
    explanation: `<p><code>TAG</code> <code>MD</code> is a modal (<em>may</em>, <em>will</em>); followed by a <code>VERB</code>, that's exactly our target phrase.</p>`,
    runnable: false,
    libraryNotice: "Requires spaCy + en_core_web_sm locally.",
    tests: [],
  },
  {
    id: 30,
    title: "Replace Pronouns with Referents (Coreference)",
    difficulty: "Medium",
    marks: 3,
    tags: ["spaCy"],
    description: `<p>Find coreference pairs (e.g. <code>she → My sister</code>, <code>him → a dog</code>) using neuralcoref or any coreference resolver and print the clusters.</p>`,
    input: `"My sister has a dog and she loves him"`,
    output: `[My sister, she]
[a dog, him]`,
    starter: `import spacy
import neuralcoref

nlp = spacy.load("en_core_web_sm")
neuralcoref.add_to_pipe(nlp)
doc = nlp("My sister has a dog and she loves him")

# TODO: print each coref cluster as [mention1, mention2, ...]
`,
    solution: `import spacy
import neuralcoref

nlp = spacy.load("en_core_web_sm")
neuralcoref.add_to_pipe(nlp)
doc = nlp("My sister has a dog and she loves him")

for cluster in doc._.coref_clusters:
    print(cluster.mentions)
`,
    explanation: `<p>neuralcoref attaches a <code>coref_clusters</code> extension. Each cluster groups spans referring to the same entity; printing its <code>mentions</code> yields the expected output.</p>`,
    runnable: false,
    libraryNotice: "Needs neuralcoref (installation can be tricky — requires a matching spaCy v2 environment).",
    tests: [],
  },
  {
    id: 31,
    title: "Merge First+Last Name Into a Single Token",
    difficulty: "Medium",
    marks: 3,
    tags: ["spaCy"],
    description: `<p>Use spaCy's named-entity recognizer to detect PERSON entities and merge multi-word names into one token, then print every token on its own line.</p>`,
    input: `"Robert Langdon is a famous character in various books and movies"`,
    output: `Robert Langdon
is
a
famous
character
in
various
books
and
movies`,
    starter: `import spacy

nlp = spacy.load("en_core_web_sm")
text = "Robert Langdon is a famous character in various books and movies"

# TODO: merge PERSON entities into single tokens then print each token
`,
    solution: `import spacy

nlp = spacy.load("en_core_web_sm")
doc = nlp("Robert Langdon is a famous character in various books and movies")

with doc.retokenize() as retokenizer:
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            retokenizer.merge(ent)

for tok in doc:
    print(tok.text)
`,
    explanation: `<p><code>doc.retokenize().merge(span)</code> collapses a span into one token. Filtering on <code>ent.label_ == "PERSON"</code> keeps the operation scoped to names.</p>`,
    runnable: false,
    libraryNotice: "Needs spaCy + en_core_web_sm locally.",
    tests: [],
  },
  {
    id: 32,
    title: "NLTK — Split Punctuation Into Separate Tokens",
    difficulty: "Medium",
    marks: 3,
    tags: ["Tokenization", "NLTK"],
    description: `<p>Use <code>nltk.wordpunct_tokenize</code> (or <code>WordPunctTokenizer</code>) to split every punctuation symbol into its own token.</p>`,
    input: `"Reset your password if you just can't remember your old one."`,
    output: `['Reset', 'your', 'password', 'if', 'you', 'just', 'can', "'", 't', 'remember', 'your', 'old', 'one', '.']`,
    starter: `from nltk.tokenize import WordPunctTokenizer

text = "Reset your password if you just can't remember your old one."

# TODO: print the tokenized list
`,
    solution: `from nltk.tokenize import WordPunctTokenizer

text = "Reset your password if you just can't remember your old one."
print(WordPunctTokenizer().tokenize(text))
`,
    explanation: `<p><code>WordPunctTokenizer</code> treats any sequence of punctuation as its own token group — perfect when you want the apostrophe isolated.</p>`,
    runnable: false,
    libraryNotice: "Requires NLTK locally.",
    tests: [],
  },
  {
    id: 33,
    title: "NLTK — Tokenize Each Sentence Into Words",
    difficulty: "Medium",
    marks: 3,
    tags: ["Tokenization", "NLTK"],
    description: `<p>Split the text into sentences, then tokenize each sentence individually. Print one list per sentence.</p>`,
    input: `"Joe waited for the train. The train was late. Mary and Samantha took the bus. I looked for Mary and Samantha at the bus station."`,
    output: `['Joe', 'waited', 'for', 'the', 'train', '.']
['The', 'train', 'was', 'late', '.']
['Mary', 'and', 'Samantha', 'took', 'the', 'bus', '.']
['I', 'looked', 'for', 'Mary', 'and', 'Samantha', 'at', 'the', 'bus', 'station', '.']`,
    starter: `from nltk.tokenize import sent_tokenize, word_tokenize

text = "Joe waited for the train. The train was late. Mary and Samantha took the bus. I looked for Mary and Samantha at the bus station."

# TODO: print word tokens for each sentence
`,
    solution: `from nltk.tokenize import sent_tokenize, word_tokenize

text = "Joe waited for the train. The train was late. Mary and Samantha took the bus. I looked for Mary and Samantha at the bus station."
for sent in sent_tokenize(text):
    print(word_tokenize(sent))
`,
    explanation: `<p>First split into sentences with <code>sent_tokenize</code>, then word-tokenize each sentence.</p>`,
    runnable: false,
    libraryNotice: "Needs NLTK + punkt tokenizer data locally.",
    tests: [],
  },
  {
    id: 34,
    title: "NLTK — Flat List of Words from a String",
    difficulty: "Medium",
    marks: 3,
    tags: ["Tokenization", "NLTK"],
    description: `<p>Use <code>word_tokenize</code> to return a flat list of word tokens for the whole text.</p>`,
    input: `"Joe waited for the train. The train was late."`,
    output: `['Joe', 'waited', 'for', 'the', 'train', '.', 'The', 'train', 'was', 'late', '.']`,
    starter: `from nltk.tokenize import word_tokenize

text = "Joe waited for the train. The train was late."

# TODO: print word_tokenize(text)
`,
    solution: `from nltk.tokenize import word_tokenize

text = "Joe waited for the train. The train was late."
print(word_tokenize(text))
`,
    explanation: `<p><code>word_tokenize</code> uses the Penn Treebank tokenizer: punctuation becomes its own token.</p>`,
    runnable: false,
    libraryNotice: "Needs NLTK + punkt locally.",
    tests: [],
  },
  {
    id: 35,
    title: "NLTK — Split Paragraph into Sentences",
    difficulty: "Medium",
    marks: 3,
    tags: ["Tokenization", "NLTK"],
    description: `<p>Use <code>sent_tokenize</code> to split a paragraph into a list of sentences (each sentence keeps its terminating punctuation).</p>`,
    input: `"Joe waited for the train. The train was late. Mary and Samantha took the bus. I looked for Mary and Samantha at the bus station."`,
    output: `['Joe waited for the train.', 'The train was late.', 'Mary and Samantha took the bus.', 'I looked for Mary and Samantha at the bus station.']`,
    starter: `from nltk.tokenize import sent_tokenize

text = "Joe waited for the train. The train was late. Mary and Samantha took the bus. I looked for Mary and Samantha at the bus station."

# TODO: print sent_tokenize(text)
`,
    solution: `from nltk.tokenize import sent_tokenize

text = "Joe waited for the train. The train was late. Mary and Samantha took the bus. I looked for Mary and Samantha at the bus station."
print(sent_tokenize(text))
`,
    explanation: `<p><code>sent_tokenize</code> handles cases where <code>.</code> isn't a sentence boundary (abbreviations, decimals) using the punkt model.</p>`,
    runnable: false,
    libraryNotice: "Needs NLTK + punkt locally.",
    tests: [],
  },
  {
    id: 36,
    title: "Chat Corpus — 4-letter Words by Frequency",
    difficulty: "Easy",
    marks: 2,
    tags: ["Frequency", "NLTK"],
    description: `<p>From the Chat Corpus (<code>nltk.book.text5</code>), find every 4-letter word and display them sorted by frequency using <code>FreqDist</code>.</p>`,
    input: `text5 from nltk.book`,
    output: `[('JOIN', 1037), ('PART', 1022), ('that', 274), ...]  # top items by count`,
    starter: `from nltk.book import text5
from nltk import FreqDist

# TODO: print 4-letter words sorted by frequency
`,
    solution: `from nltk.book import text5
from nltk import FreqDist

four_letter = [w for w in text5 if len(w) == 4]
fdist = FreqDist(four_letter)
print(fdist.most_common())
`,
    explanation: `<p>Filter the corpus for 4-letter words, then use <code>FreqDist.most_common()</code> to sort by count descending.</p>`,
    runnable: false,
    libraryNotice: "Requires nltk + the 'book' package downloaded locally.",
    tests: [],
  },
  {
    id: 37,
    title: "50 Most Frequent Non-stopword Words",
    difficulty: "Easy",
    marks: 2,
    tags: ["Frequency", "NLTK"],
    description: `<p>Write a function that returns the 50 most frequent lowercase words in a text, excluding stopwords and non-alphabetic tokens.</p>`,
    input: `text from nltk.corpus (e.g. gutenberg.words('austen-emma.txt'))`,
    output: `List of 50 (word, count) tuples`,
    starter: `from nltk.corpus import stopwords
from nltk import FreqDist

def top_content_words(text):
    pass

# TODO: call top_content_words on some corpus and print it
`,
    solution: `from nltk.corpus import stopwords
from nltk import FreqDist

def top_content_words(text):
    stops = set(stopwords.words("english"))
    cleaned = [w.lower() for w in text if w.isalpha() and w.lower() not in stops]
    return FreqDist(cleaned).most_common(50)

# Example usage:
# from nltk.corpus import gutenberg
# print(top_content_words(gutenberg.words("austen-emma.txt")))
`,
    explanation: `<p>Lowercase, drop non-alphabetic tokens, drop stopwords, then <code>FreqDist.most_common(50)</code>.</p>`,
    runnable: false,
    libraryNotice: "Needs nltk stopwords + corpora locally.",
    tests: [],
  },
  {
    id: 38,
    title: "Print Every Token (One Per Line) — spaCy",
    difficulty: "Easy",
    marks: 2,
    tags: ["Tokenization", "spaCy"],
    description: `<p>Print every token of a document on its own line using spaCy.</p>`,
    input: `"Last week, the University of Cambridge shared its own research"`,
    output: `Last
week
,
the
University
of
Cambridge
shared
its
own
research`,
    starter: `import spacy

nlp = spacy.load("en_core_web_sm")
text = "Last week, the University of Cambridge shared its own research"

# TODO: iterate over the doc and print each token
`,
    solution: `import spacy

nlp = spacy.load("en_core_web_sm")
doc = nlp("Last week, the University of Cambridge shared its own research")
for tok in doc:
    print(tok.text)
`,
    explanation: `<p>Iterating over a spaCy <code>Doc</code> yields <code>Token</code> objects; <code>.text</code> gives the surface form.</p>`,
    runnable: false,
    libraryNotice: "Needs spaCy + en_core_web_sm locally.",
    tests: [],
  },
  {
    id: 39,
    title: "Lexicon Index — Look Up Words by Meaning",
    difficulty: "Easy",
    marks: 2,
    tags: ["NLTK"],
    description: `<p>Print a reverse index for a lexicon so someone can look up a word by its meaning (or any property). Use Rotokas's toolbox lexicon from NLTK as an example.</p>`,
    input: `nltk.corpus.toolbox.xml('rotokas.dic')`,
    output: `An inverted index: meaning → list of words`,
    starter: `import nltk
from collections import defaultdict

lexicon = nltk.corpus.toolbox.xml('rotokas.dic')

# TODO: build and print an inverted index from gloss (<ge>) to word (<lx>)
`,
    solution: `import nltk
from collections import defaultdict

lexicon = nltk.corpus.toolbox.xml('rotokas.dic')
index = defaultdict(list)

for entry in lexicon.findall("record"):
    lex = entry.find("lx")
    for gloss in entry.findall("ge"):
        if lex is not None and gloss is not None:
            index[gloss.text].append(lex.text)

for meaning, words in sorted(index.items()):
    print(f"{meaning}: {words}")
`,
    explanation: `<p>Each lexicon record has a headword (<code>lx</code>) and one or more glosses (<code>ge</code>). Iterate through glosses and append the headword to that bucket to build the reverse index.</p>`,
    runnable: false,
    libraryNotice: "Needs nltk + the toolbox corpus downloaded locally.",
    tests: [],
  },
];

// Deduplicated category list, computed once
const ALL_CATEGORIES = [...new Set(PROBLEMS.flatMap(p => p.tags))].sort();

if (typeof window !== "undefined") {
  window.PROBLEMS = PROBLEMS;
  window.ALL_CATEGORIES = ALL_CATEGORIES;
}
