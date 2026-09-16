"""Verify local links and original article text against the source backup."""
import json,sys,zipfile
from pathlib import Path
from urllib.parse import urlsplit,unquote
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parents[1];z=zipfile.ZipFile(sys.argv[1]);prefix='imadeathing-backup-2026-09-10/data/'
posts=json.loads(z.read(prefix+'posts.json'))
items=json.loads((root/'content/articles.json').read_text())
assert len(items)==len(posts)
assert all(item.get('body') for item in items),'Every article must have a bundled body for file:// reading'
assert all(item.get('category')!='About' for item in items),'The old About page must remain omitted'
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
   assert u.hostname not in ['imadeathing.co.uk','www.imadeathing.co.uk'],(p,n.get(key))
   if u.scheme or u.netloc or not u.path:continue
   assert (p.parent/unquote(u.path)).exists(),(p,n.get(key))
   checked+=1
 assert not soup.select('[onload],[onclick]'),p
print(f'Passed: {len(posts)} bundled articles preserve original text; {checked} local references resolve; no user-facing links use the old domain.')
