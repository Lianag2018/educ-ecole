import json,pathlib,urllib.request,concurrent.futures,subprocess,sys
root=pathlib.Path(sys.argv[1]);(root/'corpus'/'narrator').mkdir(parents=True,exist_ok=True)
a={'clips':json.loads((root/'tokens.json').read_text())}
def one(item):
 name,entry=item;stem=name[:-4];mp3=root/name;wav=root/'corpus'/'narrator'/(stem+'.wav')
 if not mp3.exists():
  with urllib.request.urlopen('https://educ-ecole.vercel.app/audio/'+name,timeout=30) as r:mp3.write_bytes(r.read())
 if not wav.exists():subprocess.run(['ffmpeg','-v','error','-i',str(mp3),'-ar','16000','-ac','1',str(wav)],check=True)
 wav.with_suffix('.lab').write_text(entry['text'])
 return name
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for i,name in enumerate(pool.map(one,a['clips'].items())): print(i+1,name[:8],flush=True)
