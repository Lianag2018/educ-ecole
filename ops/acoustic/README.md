# Narrator-only acoustic syllable cues

This workflow processes only the public built-in synthetic narrator MP3s. Never
point it at child recordings or private homework. It performs no OpenAI requests.
Generation of missing narrator MP3s remains in the existing production pipeline.

## Reproduce

Install Montreal Forced Aligner 3.4.3 in an isolated conda-forge environment and
FFmpeg. Download `french_mfa` acoustic and dictionary models with `mfa model download`.
Then, with that environment activated:

```sh
node ops/acoustic/inventory.mjs /tmp/educ-acoustic
python ops/acoustic/prepare.py /tmp/educ-acoustic
python ops/acoustic/dictionary.py MODEL_DIRECTORY/french_mfa.dict /tmp/educ-acoustic/french-school.dict
mfa align /tmp/educ-acoustic/corpus /tmp/educ-acoustic/french-school.dict MODEL_DIRECTORY/french_mfa.zip /tmp/educ-acoustic/aligned --output_format json --clean --num_jobs 2 --no_use_postgres
node ops/acoustic/export.mjs /tmp/educ-acoustic src/reading-acoustic-data.json
node --test ops/tests/acoustic-reading.test.mjs
```

`export.mjs` fails rather than publish unknown phones, mismatched text or unresolved
printed-unit boundaries. All boundaries come from aligned phoneme edges; there is
no uniform division by characters or elapsed word duration. The source audio's
SHA-256 is retained and checked against the actual MP3 during production builds.
The browser checks ordered, positive intervals and valid printed-unit indices.

The dictionary supplement corrects missing corpus words and grammatical
homographs (e.g. *volent* is a verb here, not the noun *volant*). Written units
retain silent letters. Reduced schwas and glides have explicit phone-edge mappings;
punctuation uses the actual silent interval. Acoustic alignments are model
estimates, not human phonetic certification or a child's pronunciation score.
No physical iPad/Safari listening test is claimed.

Existing recordings are preserved. A changed audio checksum blocks reuse of old
syllable cues. New stories must be recorded and aligned before the coverage test
can pass. Production consumes these assets without repeating paid transcriptions.

## Attribution

Montreal Forced Aligner 3.4.3 — Montreal Corpus Tools, Michael McAuliffe et al.
French MFA acoustic model and pronunciation dictionary: CC BY 4.0, sourced from
Wikipron and the corpora documented in the model card. The application bundles
only derived timestamps and original text; model weights and dictionary are not
shipped to tablets.

- https://montreal-forced-aligner.readthedocs.io/en/latest/installation.html
- https://huggingface.co/MontrealCorpusTools/french_mfa
- https://creativecommons.org/licenses/by/4.0/

Acoustic model archive used for this export (SHA-256):
`37163d109c89706d447ed582a0f8902a1212ea68e09004b876f5fc02a711226a`.
Source dictionary SHA-256: `e28e20fceb4141221df9de6abb8fd96f26ed57f1a5a9429a9380905b0b4616d7`.
