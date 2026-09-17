const cards=document.querySelector('#cards'),reader=document.querySelector('#reader'),searchDialog=document.querySelector('#search-dialog');
let category=null,index=0,motion=!matchMedia('(prefers-reduced-motion: reduce)').matches,returnFocus=null,nextReturnFocus=null;
let carouselFrame=0, carouselOffset=0, featuredTimer, userChose=false;
const DISTANT_CARD_LIMIT=20;
function chooseDistantItems(limit){
 const chosen=[],seen=new Set(),add=item=>{if(item&&!seen.has(item.id)&&chosen.length<limit){seen.add(item.id);chosen.push(item)}};
 items.filter(item=>item.featured).forEach(add);
 const categories=[...new Set(items.map(item=>item.category))];
 const buckets=categories.map(name=>items.filter(item=>item.category===name&&!item.featured));
 for(let row=0;chosen.length<limit&&buckets.some(bucket=>row<bucket.length);row++)buckets.forEach(bucket=>add(bucket[row]));
 return chosen;
}
const distantItems=chooseDistantItems(DISTANT_CARD_LIMIT);
const distantSlotById=new Map(distantItems.map((item,slot)=>[item.id,slot]));
function cardVisualFor(item){return item.visual.includes('<img')?item.visual.replace(/src="([^"]+)"/,(_,source)=>`src="assets/cards/${item.id}.jpg" data-full-src="${source}"`):item.visual}
function attachCardImageFallback(element){
 const image=element.querySelector('img[data-full-src]');
 if(image)image.addEventListener('error',()=>{image.src=image.dataset.fullSrc;image.removeAttribute('data-full-src')},{once:true});
}
function canUseViewTransition(source){return motion&&source&&typeof document.startViewTransition==='function'}
function openItem(item,source,focusTarget=source){
 cancelFeatured();nextReturnFocus=focusTarget||document.querySelector('#search-open');
 const update=()=>{
  if(searchDialog.open)searchDialog.close();
  history.pushState(null,'',`#${item.id}`);route();
 };
 if(!canUseViewTransition(source)){update();return}
 source.style.viewTransitionName='project-reader';reader.classList.add('transition-opened');document.body.classList.add('view-transitioning');
 const transition=document.startViewTransition(()=>{
  source.style.viewTransitionName='';update();reader.style.viewTransitionName='project-reader';
 });
 transition.finished.catch(()=>{}).finally(()=>{
  source.style.viewTransitionName='';reader.style.viewTransitionName='';document.body.classList.remove('view-transitioning');
 });
}
function cancelFeatured(){userChose=true;clearTimeout(featuredTimer)}
function stopCarousel(){cancelAnimationFrame(carouselFrame);carouselFrame=0}
const featuredItems=()=>items.filter(item=>item.featured).sort((a,b)=>(a.featuredRank??Number.MAX_SAFE_INTEGER)-(b.featuredRank??Number.MAX_SAFE_INTEGER));
const filtered=()=>category==='Featured'?featuredItems():items.filter(x=>category!==null&&(category==='All'||x.category===category));
items.forEach(item=>{
 const card=document.createElement('button');card.className='card';card.dataset.id=item.id;
 card.innerHTML=`<div class="visual ${item.art}">${cardVisualFor(item)}<span class="kind">${item.category==='Articles'?'DEV NOTE':item.category.toUpperCase()}</span></div><div class="card-body"><h2>${item.title}</h2><p>${item.description}</p><span class="open-label">${item.externalUrl?'View shader':item.category==='Articles'?'Read the note':'Explore project'} &nbsp; ↗</span></div>`;
 attachCardImageFallback(card);
 card.addEventListener('click',()=>{
  if(suppressClick)return;cancelFeatured();const i=filtered().findIndex(x=>x.id===item.id);
  if(i<0){stopCarousel();carouselOffset=0;category=item.category;index=filtered().findIndex(x=>x.id===item.id);resetSceneryDrift();render(true);return}
  if(i===index)openItem(item,card);
  else{let delta=i-index;const count=filtered().length;if(delta>count/2)delta-=count;if(delta<-count/2)delta+=count;move(delta)}
 });
 cards.append(card);
});
// Card images belong to the carousel gesture, not the browser's image drag.
cards.querySelectorAll('img').forEach(image=>{image.draggable=false});
cards.addEventListener('dragstart',event=>event.preventDefault());
function render(stagger=false, dragPosition=carouselOffset){
 const list=filtered();
 const fieldWidth=cards.clientWidth,fieldHeight=cards.clientHeight;
 const columns=Math.min(distantItems.length,innerWidth<=480?5:innerWidth<=760?6:Math.max(7,Math.min(9,Math.ceil(Math.sqrt(distantItems.length*1.8)))));
 const rows=Math.ceil(distantItems.length/columns);
 const cellWidth=(fieldWidth-36)/columns,cellHeight=(fieldHeight-28)/rows;
 document.querySelectorAll('.card').forEach((card,itemSlot)=>{
  const item=items[itemSlot],fieldSlot=distantSlotById.get(item.id);
  const i=list.findIndex(x=>x.id===card.dataset.id), distant=i<0;
  let offset=i-index+dragPosition;
  if(list.length>5)offset=((offset+list.length/2)%list.length+list.length)%list.length-list.length/2;
  // Large collections should not turn into an ever-growing set of GPU layers.
  const edge=Math.min(3,list.length/2);
  const fade=list.length<=5?1:Math.max(0,Math.min(1,(edge-Math.abs(offset))/.75));
  card.hidden=distant?fieldSlot===undefined:fade===0;
  card.classList.toggle('distant',distant);
  card.classList.toggle('active',!distant&&i===index);
  if(card.hidden){card.tabIndex=-1;card.inert=true;card.style.pointerEvents='none';return}
  const positionSlot=fieldSlot??0;
  const row=Math.floor(positionSlot/columns),column=positionSlot%columns;
  const rowCount=Math.min(columns,distantItems.length-row*columns);
  const scale=Math.min(.43,cellWidth/350,cellHeight/430)*(1-(row%2)*.09);
  const screenX=(column-(rowCount-1)/2)*cellWidth;
  const screenY=(row-(rows-1)/2)*cellHeight+Math.sin(column*1.7+row)*8;
  card.style.setProperty('--field-x',`${screenX/scale}px`);
  card.style.setProperty('--field-y',`${screenY/scale}px`);
  card.style.setProperty('--field-z',`${1300-1300/scale}px`);
  card.style.setProperty('--offset',offset);
  card.style.setProperty('--depth',Math.abs(offset));
  card.style.setProperty('--lift','0px');
  card.style.setProperty('--angle',distant?(column-(rowCount-1)/2)*.35:Math.max(-1,Math.min(1,offset)));
  // Small collections keep their neighbors visible; larger ones fade before wrapping.
  card.style.setProperty('--opacity',distant?(category===null?.60:.30):Math.max(0,1-Math.abs(offset)*.17)*fade);
  card.style.setProperty('--z',distant?0:1000-Math.round(Math.abs(offset)*100));
  card.style.transitionDelay=stagger&&motion?`${distant?fieldSlot*18:Math.abs(offset)*65}ms`:'0ms';
  card.tabIndex=distant||i===index?0:-1;
  card.inert=false;
  card.style.pointerEvents='auto';
  card.setAttribute('aria-label',`${item.title}${i===index&&!distant?(item.externalUrl?', open shader project':', open reading view'):', bring to front'}`);
 });
 document.querySelector('#position').textContent=list.length?`${String(index+1).padStart(2,'0')} / ${String(list.length).padStart(2,'0')}`:`${distantItems.length} of ${items.length} — choose a category`;
 document.querySelectorAll('#previous,#next').forEach(b=>{b.disabled=list.length<2;b.style.visibility=list.length<2?'hidden':'visible'});
 document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.category===category));
}
function move(direction){
 cancelFeatured();const count=filtered().length;if(count<2)return;
 stopCarousel();const previousIndex=index;index=((index+direction)%count+count)%count;
 const startOffset=carouselOffset+(count<=5?index-previousIndex:direction);
 if(!motion){carouselOffset=0;cards.classList.remove('animating');render();return}
 cards.classList.add('animating');const start=performance.now();
 function tick(now){
  const progress=Math.min(1,(now-start)/500);
  carouselOffset=startOffset*Math.pow(1-progress,3);render();
  if(progress<1)carouselFrame=requestAnimationFrame(tick);
  else{carouselFrame=0;cards.classList.remove('animating')}
 }
 carouselFrame=requestAnimationFrame(tick);
}
document.querySelector('#previous').onclick=()=>move(-1);document.querySelector('#next').onclick=()=>move(1);
document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{cancelFeatured();stopCarousel();cards.classList.remove('animating');carouselOffset=0;category=category===b.dataset.category?null:b.dataset.category;index=0;resetSceneryDrift();render(true)});
document.addEventListener('keydown',e=>{
 const editing=e.target.matches?.('input,textarea,select,[contenteditable=true]');
 const searchShortcut=(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k';
 if(!reader.open&&!searchDialog.open&&(searchShortcut||(e.key==='/'&&!editing))){e.preventDefault();openSearch();return}
 if(reader.open||searchDialog.open)return;
 if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1)}
});
let gesture=null,suppressClick=false,clickTimer;
function beginGesture(source,id,x,y){
 if(filtered().length<2)return false;
 cancelFeatured();stopCarousel();cards.classList.remove('animating');carouselOffset=0;clearTimeout(clickTimer);suppressClick=false;
 gesture={source,id,x,y,dragging:false,step:innerWidth<=760?230:280};
 return true;
}
function updateGesture(source,id,x,y,onDragStart){
 if(!gesture||gesture.source!==source||gesture.id!==id)return false;
 const dx=x-gesture.x,dy=y-gesture.y;
 // Fingers rarely travel in a perfectly straight line; wait for clear vertical intent.
 if(!gesture.dragging&&Math.abs(dy)>24&&Math.abs(dy)>Math.abs(dx)){gesture=null;return false}
 if(!gesture.dragging&&Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)){
  gesture.dragging=true;suppressClick=true;
  onDragStart?.();cards.classList.add('dragging');
 }
 if(gesture.dragging){carouselOffset=dx/gesture.step;render()}
 return gesture?.dragging===true;
}
function finishGesture(source,id,x,cancelled=false){
 if(!gesture||gesture.source!==source||gesture.id!==id)return;
 const dx=x-gesture.x,wasDragging=gesture.dragging,step=gesture.step;
 gesture=null;cards.classList.remove('dragging');cards.style.setProperty('--drag','0px');
 if(!cancelled&&wasDragging&&Math.abs(dx)>40){const steps=Math.max(1,Math.round(Math.abs(dx)/step));move(dx<0?steps:-steps)}else if(wasDragging){move(0)}else render();
 if(wasDragging)clickTimer=setTimeout(()=>suppressClick=false,450);
}
cards.addEventListener('pointerdown',e=>{
 if(e.pointerType==='touch'||!e.isPrimary||e.button!==0)return;
 beginGesture('pointer',e.pointerId,e.clientX,e.clientY);
});
cards.addEventListener('pointermove',e=>{
 if(e.pointerType==='touch')return;
 updateGesture('pointer',e.pointerId,e.clientX,e.clientY,()=>cards.setPointerCapture(e.pointerId));
});
function finishPointerGesture(e){
 if(e.pointerType==='touch')return;
 const captured=cards.hasPointerCapture(e.pointerId);
 finishGesture('pointer',e.pointerId,e.clientX,e.type!=='pointerup');
 if(captured)cards.releasePointerCapture(e.pointerId);
}
window.addEventListener('pointerup',finishPointerGesture);
cards.addEventListener('pointercancel',finishPointerGesture);
cards.addEventListener('lostpointercapture',finishPointerGesture);
cards.addEventListener('touchstart',e=>{
 if(e.touches.length!==1)return;
 const touch=e.touches[0];beginGesture('touch',touch.identifier,touch.clientX,touch.clientY);
},{passive:true});
cards.addEventListener('touchmove',e=>{
 if(!gesture||gesture.source!=='touch')return;
 const touch=Array.from(e.changedTouches).find(t=>t.identifier===gesture.id);
 if(touch&&updateGesture('touch',touch.identifier,touch.clientX,touch.clientY))e.preventDefault();
},{passive:false});
function finishTouchGesture(e){
 if(!gesture||gesture.source!=='touch')return;
 const touch=Array.from(e.changedTouches).find(t=>t.identifier===gesture.id);
 if(touch)finishGesture('touch',touch.identifier,touch.clientX,e.type==='touchcancel');
 else if(e.type==='touchcancel')finishGesture('touch',gesture.id,gesture.x,true);
}
window.addEventListener('touchend',finishTouchGesture,{passive:true});
cards.addEventListener('touchcancel',finishTouchGesture,{passive:true});
cards.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation()}},true);
let wheelLocked=false,wheelDistance=0,wheelTimer;
cards.addEventListener('wheel',e=>{
 if(filtered().length<2||Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;
 e.preventDefault();if(wheelLocked)return;
 wheelDistance+=e.deltaX;
 clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>wheelDistance=0,150);
 if(Math.abs(wheelDistance)>45){move(wheelDistance>0?1:-1);wheelDistance=0;wheelLocked=true;setTimeout(()=>wheelLocked=false,450)}
},{passive:false});
function resetSceneryDrift(){document.documentElement.style.setProperty('--drift','0px');document.documentElement.style.setProperty('--mountain-drift','0px')}
function updateMotion(){document.body.classList.toggle('no-motion',!motion);const b=document.querySelector('#motion');b.textContent=motion?'Motion on':'Motion off';b.setAttribute('aria-pressed',motion);resetSceneryDrift()}
document.querySelector('#motion').onclick=()=>{motion=!motion;updateMotion()};matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{motion=!e.matches;updateMotion()});
document.addEventListener('pointermove',e=>{if(!motion||category!==null||gesture||reader.open||e.pointerType!=='mouse')return;document.documentElement.style.setProperty('--drift',`${-(e.clientX/innerWidth-.5)*22}px`);document.documentElement.style.setProperty('--mountain-drift',`${-(e.clientX/innerWidth-.5)*8}px`)});document.documentElement.addEventListener('pointerleave',()=>resetSceneryDrift());
async function route(){
 const hash=location.hash;
 const item=items.find(x=>`#${x.id}`===hash);
 const article=document.querySelector('#article');
 if(!item){
   if(reader.open){reader.close();reader.classList.remove('transition-opened');document.body.classList.remove('reading');returnFocus?.focus()}
  return;
 }
  if(!reader.open){returnFocus=nextReturnFocus||document.activeElement;nextReturnFocus=null;reader.showModal();document.body.classList.add('reading')}
 reader.scrollTop=0;
 if(item.body){
  const date=item.date?`<p class="article-date"><time datetime="${item.date}">${item.date}</time></p>`:'';
  article.innerHTML=`<p class="eyebrow">${item.category.toUpperCase()} / DEANTHECODER</p><h2>${item.title}</h2>${date}<div class="article-content">${item.body}</div>`;
  const destination=item.externalUrl||item.url;
  if(destination){
   const permalink=document.createElement('a');permalink.href=destination;
   permalink.textContent=item.externalUrl?'Open on Shadertoy ↗':'Open standalone article ↗';
   if(item.externalUrl){permalink.target='_blank';permalink.rel='noopener'}
   if(item.externalUrl)article.querySelector('.article-content').before(permalink);
   else article.append(permalink);
  }
  return;
 }
 if(!item.url){
  article.innerHTML=`<p class="eyebrow">${item.category.toUpperCase()} / DEANTHECODER</p><h2>${item.title}</h2><p>${item.description}</p>${item.body}${item.category!=='Articles'?'<a href="https://github.com/DeanTheCoder" target="_blank" rel="noopener">Explore DeanTheCoder on GitHub ↗</a>':''}`;
  return;
 }
 article.innerHTML='<p role="status">Loading article…</p>';
 try{
  const url=new URL(item.url,document.baseURI);
  const response=await fetch(url);
  if(!response.ok)throw new Error('Article unavailable');
  const page=new DOMParser().parseFromString(await response.text(),'text/html');
  const content=page.querySelector('article');
  if(!content)throw new Error('Article content missing');
  // Article assets are relative to the standalone page, not the collection.
  content.querySelectorAll('[src], [href]').forEach(element=>{
   for(const attribute of ['src','href']){
    const value=element.getAttribute(attribute);
    if(value&&!value.startsWith('#'))element.setAttribute(attribute,new URL(value,url).href);
   }
  });
  if(location.hash!==hash||!reader.open)return;
  article.innerHTML=content.innerHTML;
  const permalink=document.createElement('a');
  permalink.href=item.url;permalink.textContent='Open standalone article ↗';
  article.append(permalink);
 }catch(error){
  if(location.hash!==hash||!reader.open)return;
  article.innerHTML='<p>The article could not be loaded here.</p>';
  const fallback=document.createElement('a');fallback.href=item.url;
  fallback.textContent='Open the article directly ↗';article.append(fallback);
 }
}
function closeReader(){
 const target=returnFocus?.isConnected&&returnFocus.offsetParent!==null?returnFocus:null;
 const update=()=>{history.replaceState(null,'',location.pathname+location.search);route();reader.classList.remove('transition-opened')};
 if(!canUseViewTransition(target)){update();return}
 reader.style.viewTransitionName='project-reader';document.body.classList.add('view-transitioning');
 const transition=document.startViewTransition(()=>{
  reader.style.viewTransitionName='';update();target.style.viewTransitionName='project-reader';
 });
 transition.finished.catch(()=>{}).finally(()=>{
  reader.style.viewTransitionName='';target.style.viewTransitionName='';document.body.classList.remove('view-transitioning');
 });
}
reader.querySelector('.close').onclick=closeReader;
reader.addEventListener('cancel',e=>{e.preventDefault();closeReader()});
reader.addEventListener('click',e=>{if(e.target===reader){const r=reader.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeReader()}});
window.addEventListener('resize',()=>render());window.addEventListener('hashchange',route);render();updateMotion();route();

// A direct overview complements the carousel as the collection grows.
const overview = document.querySelector('#overview');
items.forEach(item => {
 const link = document.createElement('a');
 link.className = 'overview-card';
 link.href = '#' + item.id;
 link.innerHTML = `<div class="visual ${item.art}">${cardVisualFor(item)}</div><h3>${item.title}</h3><p>${item.description}</p>${item.externalUrl?'<span>Open shader project ↗</span>':item.url?'<span>Read the article ↗</span>':'<span>Prototype preview</span>'}`;
 attachCardImageFallback(link);
 link.addEventListener('click',event=>{event.preventDefault();openItem(item,link)});
 overview.append(link);
});

// Search is entirely local: article text is already bundled in content.js.
const searchOpen=document.querySelector('#search-open'),searchInput=document.querySelector('#search-input');
const searchResults=document.querySelector('#search-results'),searchStatus=document.querySelector('#search-status');
function plainText(html){const element=document.createElement('div');element.innerHTML=html||'';return element.textContent.replace(/\s+/g,' ').trim()}
function normalise(value){return value.toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'')}
const searchIndex=items.map(item=>{
 const bodyText=plainText(item.body);
 return {item,bodyText,title:normalise(item.title),description:normalise(item.description),body:normalise(bodyText),category:normalise(item.category)};
});
function searchCollection(query){
 const normalised=normalise(query.trim()),terms=normalised.split(/\s+/).filter(Boolean);
 if(!terms.length)return featuredItems().map(item=>({entry:searchIndex.find(entry=>entry.item===item),score:0}));
 return searchIndex.map(entry=>{
  const haystack=`${entry.title} ${entry.description} ${entry.category} ${entry.body}`;
  if(!terms.every(term=>haystack.includes(term)))return null;
  let score=entry.title.includes(normalised)?60:0;
  terms.forEach(term=>{if(entry.title.includes(term))score+=18;if(entry.description.includes(term))score+=7;if(entry.category.includes(term))score+=5;if(entry.body.includes(term))score+=1});
  return {entry,score};
 }).filter(Boolean).sort((a,b)=>b.score-a.score||b.entry.item.date.localeCompare(a.entry.item.date));
}
function searchExcerpt(entry,query){
 if(!query.trim())return entry.item.description;
 const term=normalise(query).split(/\s+/).find(Boolean),position=entry.body.indexOf(term);
 if(position<0)return entry.item.description;
 const start=Math.max(0,position-72),end=Math.min(entry.bodyText.length,position+150);
 return `${start?'…':''}${entry.bodyText.slice(start,end).trim()}${end<entry.bodyText.length?'…':''}`;
}
function renderSearchResults(query=''){
 const matches=searchCollection(query),visible=matches.slice(0,12);searchResults.replaceChildren();
 searchStatus.textContent=query.trim()?`${matches.length} project${matches.length===1?'':'s'} found${matches.length>visible.length?` — showing ${visible.length}`:''}.`:`Search all ${items.length} projects. Featured projects are shown below.`;
 visible.forEach(({entry})=>{
  const item=entry.item,button=document.createElement('button');button.type='button';button.className='search-result';
  const visual=document.createElement('div');visual.className=`search-result-visual visual ${item.art}`;visual.innerHTML=cardVisualFor(item);
  const copy=document.createElement('span');copy.className='search-result-copy';
  const meta=document.createElement('span');meta.className='search-result-meta';meta.textContent=`${item.category} · ${item.date}`;
  const title=document.createElement('strong');title.textContent=item.title;
  const excerpt=document.createElement('span');excerpt.className='search-result-excerpt';excerpt.textContent=searchExcerpt(entry,query);
  copy.append(meta,title,excerpt);button.append(visual,copy);attachCardImageFallback(button);
  button.addEventListener('click',()=>openItem(item,button,searchOpen));searchResults.append(button);
 });
 if(!visible.length){const empty=document.createElement('p');empty.className='search-empty';empty.textContent='Nothing found. Try a project name, technology or phrase from an article.';searchResults.append(empty)}
}
function openSearch(){
 cancelFeatured();renderSearchResults(searchInput.value);searchDialog.showModal();requestAnimationFrame(()=>searchInput.focus());
}
function closeSearch(){searchDialog.close();searchOpen.focus()}
searchOpen.addEventListener('click',openSearch);searchInput.addEventListener('input',()=>renderSearchResults(searchInput.value));
searchDialog.querySelector('.search-close').addEventListener('click',closeSearch);
searchDialog.addEventListener('cancel',event=>{event.preventDefault();closeSearch()});
searchDialog.addEventListener('click',event=>{if(event.target===searchDialog){const r=searchDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeSearch()}});

// Leave a moment to see the landscape; never override an early choice or deep link.
function scheduleFeatured(){
 featuredTimer=setTimeout(()=>{
  if(userChose||category!==null||reader.open||location.hash)return;
  category='Featured';index=0;carouselOffset=0;resetSceneryDrift();render(true);
 },1000);
}
if(document.readyState==='complete')scheduleFeatured();
else window.addEventListener('load',scheduleFeatured,{once:true});
