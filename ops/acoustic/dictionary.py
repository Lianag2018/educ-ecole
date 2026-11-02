"""Corpus-specific French pronunciations, excluding dictionary homographs.
Only public built-in narrator text is processed. These are not child assessments.
"""
import pathlib,sys
source,destination=map(pathlib.Path,sys.argv[1:3])
pronunciations={
 'arrosoirs':'a ʁ o z w a ʁ','réjouissent':'ʁ e ʒ w i s','h':'a ʃ',
 'oisillon':'w a z i j ɔ̃',"l'oisillon":'l w a z i j ɔ̃',
 'contentes':'k ɔ̃ t ɑ̃ t','réessayer':'ʁ e e s e j e','pelles':'p ɛ l','noa':'n o a',
 # In this corpus, t occurs only inside demande-t-il, never as a letter name.
 't':'t','volent':'v ɔ l','devient':'d ə v j ɛ̃','tenir':'t ə n i ʁ',
 'lili':'l i l i','lina':'l i n a','choisit':'ʃ w a z i',
}
lines=[line for line in source.read_text().splitlines() if line.split('\t')[0] not in pronunciations]
lines += [word+'\t0.99\t0.5\t1\t1\t'+phones for word,phones in pronunciations.items()]
destination.write_text('\n'.join(lines)+'\n')
