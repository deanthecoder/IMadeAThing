"""Import published WordPress content from the saved ZIP. Requires beautifulsoup4."""
import sys,json,zipfile,html,re,os
from pathlib import Path
from urllib.parse import urlsplit,urljoin,unquote
from urllib.request import Request,urlopen
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parents[1]
z=zipfile.ZipFile(sys.argv[1]);prefix='imadeathing-backup-2026-09-10/'
read=lambda name:json.loads(z.read(prefix+'data/'+name+'.json'))
posts=read('posts');pages=read('pages');media={x['id']:x for x in read('media')};cats={x['id']:x['name'] for x in read('categories')}
manifest=json.loads(z.read(prefix+'manifest.json'))['files'];issues=[];embeds=[];items=[]
def canon(u):
 return re.sub(r'https?://axela.temp.domains/~imadeathing/?','https://imadeathing.co.uk/',html.unescape(u)).replace('http://imadeathing.co.uk/','https://imadeathing.co.uk/')
def slug(p):return 'game-boy-tetris' if p['id']==260 else p['slug']
routes={canon(p['link']).rstrip('/'):'articles/'+slug(p)+'/index.html' for p in posts+pages}
byid={str(p['id']):'articles/'+slug(p)+'/index.html' for p in posts+pages}
assets={}
def asset(u):
 u=canon(u);name=manifest.get(u)
 if not name:return None
 target='assets/archive/'+name.removeprefix('site/')
 out=root/target;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(z.read(prefix+name));assets[u]=target
 return target
def relative(target,page):return os.path.relpath(root/target,(root/page).parent)
def youtube_id(url):
 parts=urlsplit(url)
 if parts.hostname in ['youtu.be']:
  return parts.path.strip('/').split('/')[0]
 match=re.search(r'/(?:embed|shorts)/([^/?#]+)',parts.path)
 return match.group(1) if match else None
def youtube_thumbnail(video_id):
 target=f'assets/archive/youtube/{video_id}.jpg';out=root/target
 if out.exists():return target
 out.parent.mkdir(parents=True,exist_ok=True)
 for size in ['maxresdefault','hqdefault']:
  try:
   request=Request(f'https://i.ytimg.com/vi/{video_id}/{size}.jpg',headers={'User-Agent':'Mozilla/5.0'})
   with urlopen(request,timeout=20) as response:
    data=response.read()
   if len(data)>1000:
    out.write_bytes(data);return target
  except Exception:
   pass
 issues.append({'article':'YouTube','url':video_id,'reason':'Thumbnail unavailable'})
 return None
for m in media.values():
 asset(m['source_url'])
for p in posts+pages:
 title=html.unescape(p['title']['rendered']);page='articles/'+slug(p)+'/index.html';soup=BeautifulSoup(p['content']['rendered'],'html.parser')
 original=BeautifulSoup(p['content']['rendered'],'html.parser')
 video_preview=None
 for node in soup.select('script,style,form,object,embed'):node.decompose()
 for node in soup.find_all(True):
  for key in list(node.attrs):
   if key.startswith('on') or key=='style':del node[key]
  for key in ['src','href']:
   if node.get(key,'').strip().lower().startswith('javascript:'):del node[key]
 for frame in soup.find_all('iframe'):
  src=frame.get('src','');url=urljoin(p['link'],src);host=urlsplit(url).hostname or ''
  embeds.append({'article':title,'url':url})
  if host in ['www.youtube.com','youtube.com','www.youtube-nocookie.com','youtu.be']:
   video_id=youtube_id(url)
   thumb=youtube_thumbnail(video_id) if video_id else None
   if thumb:
    video_preview=video_preview or thumb
    link=soup.new_tag('a',href=f'https://www.youtube.com/watch?v={video_id}')
    link['class']='video-preview';link['target']='_blank';link['rel']='noopener'
    link['aria-label']=f'Watch {title} on YouTube'
    image=soup.new_tag('img',src=relative(thumb,page),alt=f'{title} video preview')
    image['loading']='lazy';image['draggable']='false';link.append(image);frame.replace_with(link)
   else:
    link=soup.new_tag('a',href=url);link.string='Watch on YouTube ↗';frame.replace_with(link)
  else:
   link=soup.new_tag('a',href=url);link.string='Open embedded content ↗';frame.replace_with(link)
 for node in list(soup.find_all(True)):
  if not node.parent:continue
  for key in ['src','href','poster']:
   value=node.get(key)
   if not value or value.startswith(('#','data:','mailto:')) or node.name=='iframe':continue
   if value.startswith('../') and ((root/page).parent/value).resolve().is_file():continue
   url=canon(urljoin(p['link'],value));parts=urlsplit(url)
   path=routes.get(url.split('#')[0].rstrip('/'))
   if not path and parts.hostname=='imadeathing.co.uk' and parts.query.startswith('p='):path=byid.get(parts.query[2:])
   if path:node[key]=relative(path,page)+('#'+parts.fragment if parts.fragment else '');continue
   saved=assets.get(url) or (asset(url) if '/wp-content/uploads/' in url or key in ['src','poster'] else None)
   if saved:node[key]=relative(saved,page)
   else:
    node[key]=url
    if key in ['src','poster']:
     issues.append({'article':title,'url':url,'reason':'Not available in backup'})
     if node.name=='img':
      if 'ir-uk.amazon-adsystem.com' in url:node.decompose();break
      note=soup.new_tag('span');note['class']='missing-image';note.string='[Original external image unavailable]';node.replace_with(note);break
  if node.name=='img':
   node.attrs.pop('srcset',None);node.attrs.pop('sizes',None);node['loading']='lazy'
   # Fix source dimensions without distorting the image on small screens.
   node.attrs.pop('width',None);node.attrs.pop('height',None)
 names=[cats[i] for i in p.get('categories',[])]
 category='Tools' if 'Shader Shrinker' in title else 'Retro' if 'Emulation' in names else 'Shaders' if 'GLSL Shader Coding' in names else 'Hardware'
 if p in pages:category='About'
 text=original.get_text(' ',strip=True)
 excerpt=BeautifulSoup(p.get('excerpt',{}).get('rendered',''),'html.parser').get_text(' ',strip=True)
 excerpt=re.sub(r'\s*\[.*?\]\s*$','',excerpt).strip() or text
 desc=excerpt[:145].rsplit(' ',1)[0]+'…' if len(excerpt)>145 else excerpt
 pic=media.get(p.get('featured_media'),{}).get('source_url')
 if not pic:
  img=original.find('img');pic=img.get('src') if img else None
 saved=asset(pic) if pic else None
 saved=saved or video_preview
 visual=f'<img src="{html.escape(saved)}" alt="{html.escape(title,quote=True)}" loading="lazy" draggable="false">' if saved else f'<span class="text-preview">{html.escape(category)}<b>{html.escape(title)}</b></span>'
 item={'id':'g33kboy' if p['id']==260 else slug(p),'title':title,'category':category,'description':desc,'art':'archive-art','visual':visual,'url':page,'featured':p['id'] in [260,247,213,194,151,9],'date':p['date'][:10]}
 items.append(item)
 out=root/page;out.parent.mkdir(parents=True,exist_ok=True)
 out.write_text(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)} — I Made A Thing</title><meta name="description" content="{html.escape(desc,quote=True)}"><link rel="stylesheet" href="../../style.css"></head><body class="article-page"><header><a class="brand" href="../../index.html">I MADE A THING</a></header><main class="article-shell"><a class="back-link" href="../../index.html">← Back to the collection</a><article><p class="eyebrow">{category.upper()}</p><h1>{html.escape(title)}</h1><p class="article-date"><time datetime="{p['date'][:10]}">{p['date'][:10]}</time> · Updated {p['modified'][:10]}</p><div class="article-content">{soup}</div></article></main></body></html>''')
 # Old WordPress paths remain valid within the new hosting base path.
 oldpath=urlsplit(p['link']).path.lstrip('/')+'index.html'
 alias=root/oldpath;alias.parent.mkdir(parents=True,exist_ok=True);dest=os.path.relpath(out,alias.parent)
 alias.write_text(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url={html.escape(dest,quote=True)}"><title>{html.escape(title)}</title></head><body><a href="{html.escape(dest,quote=True)}">Continue to {html.escape(title)}</a></body></html>')
(root/'content/articles.json').write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n')
(root/'content.js').write_text('const items = '+json.dumps(items,ensure_ascii=False,indent=2)+';\n')
(root/'content/url-map.json').write_text(json.dumps(routes,indent=2)+'\n')
(root/'content/import-report.json').write_text(json.dumps({'posts':len(posts),'pages':len(pages),'savedAssets':len(assets),'externalEmbeds':embeds,'missingAssets':issues},indent=2)+'\n')
print('Imported',len(posts),'posts and',len(pages),'pages;',len(assets),'assets;',len(issues),'unavailable assets;',len(embeds),'external embeds')
