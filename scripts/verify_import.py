"""Verify local links and original article text against the source backup."""
import json,sys,zipfile
from pathlib import Path
from urllib.parse import urlsplit,unquote
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parents[1];z=zipfile.ZipFile(sys.argv[1]);prefix='imadeathing-backup-2026-09-10/data/'
posts=json.loads(z.read(prefix+'posts.json'))+json.loads(z.read(prefix+'pages.json'))
for p in posts:
 slug='game-boy-tetris' if p['id']==260 else p['slug']
 original=BeautifulSoup(p['content']['rendered'],'html.parser')
 actual=BeautifulSoup((root/'articles'/slug/'index.html').read_text(),'html.parser').select_one('.article-content')
 for n in original.select('script,style,form,object,embed'):n.decompose()
 for n in actual.select('.missing-image'):n.decompose()
 assert original.get_text(' ',strip=True).split()==actual.get_text(' ',strip=True).split(),slug
checked=0
for p in root.rglob('*.html'):
 if '.git' in p.parts or 'work' in p.parts:continue
 soup=BeautifulSoup(p.read_text(),'html.parser')
 for n in soup.select('[src], [href]'):
  for key in ['src','href']:
   u=urlsplit(n.get(key,''))
   if u.scheme or u.netloc or not u.path:continue
   assert (p.parent/unquote(u.path)).exists(),(p,n.get(key))
   checked+=1
 assert not soup.select('[onload],[onclick]'),p
print(f'Passed: {len(posts)} articles preserve original text; {checked} local references resolve.')
