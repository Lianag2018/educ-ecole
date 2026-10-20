"""Offline technical resize of approved indexed PNG; stdlib only.
Sharp install unavailable (registry DNS blocked); no artistic generation.
"""
from pathlib import Path
import struct,zlib,math
root=Path(__file__).resolve().parents[1]/'icons'
data=(root/'hibou-512.png').read_bytes();pos=8;packed=b'';palette=[];alpha=b''
while pos<len(data):
 n=struct.unpack('>I',data[pos:pos+4])[0];kind=data[pos+4:pos+8];chunk=data[pos+8:pos+8+n];pos+=12+n
 if kind==b'IHDR':w,h,depth,color,compression,filtering,interlace=struct.unpack('>IIBBBBB',chunk)
 if kind==b'PLTE':palette=[tuple(chunk[i:i+3]) for i in range(0,len(chunk),3)]
 if kind==b'tRNS':alpha=chunk
 if kind==b'IDAT':packed+=chunk
assert (w,h,depth,color,interlace)==(512,512,8,3,0)
raw=zlib.decompress(packed);rows=[];previous=bytearray(w);p=0
for y in range(h):
 f=raw[p];p+=1;row=bytearray(raw[p:p+w]);p+=w
 for x in range(w):
  a=row[x-1] if x else 0;b=previous[x];c=previous[x-1] if x else 0
  if f==1:predict=a
  elif f==2:predict=b
  elif f==3:predict=(a+b)//2
  elif f==4:
   guess=a+b-c;dist=[abs(guess-a),abs(guess-b),abs(guess-c)];predict=[a,b,c][dist.index(min(dist))]
  else:assert f==0;predict=0
  row[x]=(row[x]+predict)&255
 rows.append([palette[i]+(alpha[i] if i<len(alpha) else 255,) for i in row]);previous=row
def chunk(kind,payload):return struct.pack('>I',len(payload))+kind+payload+struct.pack('>I',zlib.crc32(kind+payload)&0xffffffff)
for name,size in [('apple-touch-icon',180),('icon-192',192),('favicon',32)]:
 out=bytearray()
 for y in range(size):
  out.append(0);sy=(y+.5)*h/size-.5;y0=max(0,min(h-1,math.floor(sy)));y1=min(h-1,y0+1);fy=sy-y0
  for x in range(size):
   sx=(x+.5)*w/size-.5;x0=max(0,min(w-1,math.floor(sx)));x1=min(w-1,x0+1);fx=sx-x0
   for c in range(4):out.append(round(rows[y0][x0][c]*(1-fx)*(1-fy)+rows[y0][x1][c]*fx*(1-fy)+rows[y1][x0][c]*(1-fx)*fy+rows[y1][x1][c]*fx*fy))
 png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',size,size,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(out,9))+chunk(b'IEND',b'')
 (root/(name+'.png')).write_bytes(png)
print('Approved original preserved; PNG derivatives 180, 192, 32 generated.')
