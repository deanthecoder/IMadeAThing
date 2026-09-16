const items = [
 {"id": "g33kboy", "featured": true, "title": "G33kBoy", "category": "Retro", "description": "Making a Game Boy emulator \u2014 and getting Tetris to play.", "art": "gameboy-art", "visual": "<img src=\"assets/articles/game-boy-tetris/image-1.png\" alt=\"Tetris running in G33kBoy\">", "url": "articles/game-boy-tetris/index.html"},
 {id:'browse',title:'Browse',category:'Tools',description:'A different window on your files. Built for people who live at the keyboard.',art:'browser-art',visual:'<div class="window"><div class="window-bar">● ● ● &nbsp; Browse / Projects</div><div class="files">▸ Projects &nbsp; &nbsp; Name &nbsp; Modified<br>▸ Documents &nbsp; src &nbsp; &nbsp; Today<br>▸ Downloads &nbsp; docs &nbsp; Yesterday<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; README.md</div></div>',body:'<p>A file browser is one of those tools you use so often that the small details matter: how quickly you can get somewhere, how clearly you can see what is there, and how little the interface gets in your way.</p><h3>A place for the project story</h3><p>This prototype demonstrates how a project introduction and its README could sit together in a comfortable reading view. The finished page could include screenshots, installation instructions and a few notes about the decisions behind the code.</p>'},
 {id:'g33kshell',title:'G33kShell',category:'Tools',description:'A home for commands, shortcuts and the satisfaction of a good terminal.',art:'terminal',visual:'<small>dean@workbench ~</small><b>&gt; G33k_</b><span>$ make something useful</span>',body:'<p>Some ideas begin with a simple question: could the tool I use every day work a little more like I think?</p><h3>The command line, made personal</h3><p>This is a sample project panel for G33kShell. In the finished collection, the project README can be rendered here, with code blocks, images and links, while the surrounding scene stays quietly in the background.</p><pre>&gt; curiosity + code\nBuilding something useful…</pre>'},
 {id:'zxbasic',title:'ZXBasic',category:'Retro',description:'A blinking cursor. A little BASIC. An entire afternoon gone.',art:'spectrum',visual:'<strong>Sinclair BASIC</strong><pre>10 PRINT "HELLO, WORLD"\n20 GO TO 10\n\n<span>0 OK, 0:1 ▉</span></pre>',body:'<p>There is something wonderfully direct about a BASIC prompt. No ceremony: type an instruction and see what happens.</p><h3>Small machines, big ideas</h3><p>This sample reading view is a place for the ZXBasic project, screenshots and development notes. Retro projects are particularly good at turning a small technical detail into an interesting story.</p><pre>10 PRINT "HELLO, WORLD"\n20 GO TO 10</pre>'},
 {id:'experiments',title:'The workbench',category:'Experiments',description:'Small ideas, curious detours and code written to see what happens.',art:'code-art',visual:'<span>// a question worth asking</span><br><strong>while</strong> (curious)<br>{<br>&nbsp; <i>build</i>(something);<br>}',body:'<p>Not every experiment needs to become a product. Sometimes the useful result is understanding how something works.</p><h3>Room to play</h3><p>This sample entry represents the smaller experiments in the collection. A finished entry could link to its repository and describe the question, the approach and what came out of it.</p>'},
 {id:'small-tools',title:'In praise of small tools',category:'Articles',description:'Why the projects that solve one tiny annoyance are often the keepers.',art:'note-art',visual:'FIELD NOTES / 001<b>One problem.<br>One good tool.</b>',body:'<p class="eyebrow">SAMPLE ARTICLE · 2 MIN READ</p><p>A good small tool begins with an irritation. Something takes five clicks when it should take one. A familiar command is just awkward enough that you keep looking it up. A file is never where you expect it to be.</p><h3>Start with the friction</h3><p>The useful first step is to notice exactly where the interruption happens. Build the smallest thing that removes it, then use that thing for a while. Real use has a habit of exposing the difference between an appealing feature and an actual improvement.</p><h3>Leave room for simplicity</h3><p>Finishing can mean deciding that the tool already does enough. There is a particular pleasure in software that opens quickly, does its job and gets out of the way.</p>'},
 {id:'depth',title:'Depth without the drama',category:'Articles',description:'A few thoughts on making interfaces feel alive without getting in the way.',art:'note-art',visual:'FIELD NOTES / 002<b>A little motion.<br>A lot of restraint.</b>',body:'<p class="eyebrow">SAMPLE ARTICLE · 2 MIN READ</p><p>Movement is most useful when it explains a change. A card coming forward tells you what is selected. A panel expanding tells you where the detail view came from.</p><h3>Let the interface come to rest</h3><p>Once that explanation is complete, the movement can stop. The reader should be free to focus on the content, without a background continually asking for attention.</p><h3>Give people control</h3><p>Small movements can feel surprisingly large to someone sensitive to motion. Respect their system preference, offer a simple switch and make sure the experience works just as well when everything stays still.</p>'}
];
const cards=document.querySelector('#cards'), reader=document.querySelector('#reader');
let category=null,index=0,motion=!matchMedia('(prefers-reduced-motion: reduce)').matches,returnFocus=null;
let carouselFrame=0, carouselOffset=0, featuredTimer, userChose=false;
function cancelFeatured(){userChose=true;clearTimeout(featuredTimer)}
function stopCarousel(){cancelAnimationFrame(carouselFrame);carouselFrame=0}
const filtered=()=>items.filter(x=>category!==null&&(category==='All'||(category==='Featured'?x.featured:x.category===category)));
items.forEach(item=>{const card=document.createElement('button');card.className='card';card.dataset.id=item.id;card.innerHTML=`<div class="visual ${item.art}">${item.visual}<span class="kind">${item.category==='Articles'?'DEV NOTE':item.category.toUpperCase()}</span></div><div class="card-body"><h2>${item.title}</h2><p>${item.description}</p><span class="open-label">${item.category==='Articles'?'Read the note':'Explore project'} &nbsp; ↗</span></div>`;card.addEventListener('click',()=>{if(suppressClick)return;cancelFeatured();const i=filtered().findIndex(x=>x.id===item.id);if(i<0){stopCarousel();carouselOffset=0;category=item.category;index=filtered().findIndex(x=>x.id===item.id);resetSceneryDrift();render(true);return}if(i===index){location.hash=item.id;}else{let delta=i-index;const count=filtered().length;if(delta>count/2)delta-=count;if(delta<-count/2)delta+=count;move(delta)}});cards.append(card)});
// Card images belong to the carousel gesture, not the browser's image drag.
cards.querySelectorAll('img').forEach(image=>{image.draggable=false});
cards.addEventListener('dragstart',event=>event.preventDefault());
function render(stagger=false, dragPosition=carouselOffset){
 const list=filtered();
 const fieldWidth=cards.clientWidth,fieldHeight=cards.clientHeight;
 const columns=Math.min(items.length,innerWidth<=760?2:Math.max(3,Math.min(6,Math.ceil(Math.sqrt(items.length*1.5)))));
 const rows=Math.ceil(items.length/columns);
 const cellWidth=(fieldWidth-36)/columns,cellHeight=(fieldHeight-28)/rows;
 document.querySelectorAll('.card').forEach((card,slot)=>{
  const i=list.findIndex(x=>x.id===card.dataset.id), distant=i<0;
  let offset=i-index+dragPosition;
  if(list.length>5)offset=((offset+list.length/2)%list.length+list.length)%list.length-list.length/2;
  card.hidden=false;
  card.classList.toggle('distant',distant);
  card.classList.toggle('active',!distant&&i===index);
  const row=Math.floor(slot/columns),column=slot%columns;
  const rowCount=Math.min(columns,items.length-row*columns);
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
  const edge=Math.min(3,list.length/2);
  const fade=list.length<=5?1:Math.max(0,Math.min(1,(edge-Math.abs(offset))/.75));
  card.style.setProperty('--opacity',distant?(category===null?.60:.30):Math.max(0,1-Math.abs(offset)*.17)*fade);
  card.style.setProperty('--z',distant?0:1000-Math.round(Math.abs(offset)*100));
  card.style.transitionDelay=stagger&&motion?`${distant?slot*18:Math.abs(offset)*65}ms`:'0ms';
  card.tabIndex=distant||i===index?0:-1;
  card.inert=!distant&&fade===0;
  card.style.pointerEvents=!distant&&fade===0?'none':'auto';
  card.setAttribute('aria-label',`${items[slot].title}${i===index&&!distant?', open reading view':', bring to front'}`);
 });
 document.querySelector('#position').textContent=list.length?`${String(index+1).padStart(2,'0')} / ${String(list.length).padStart(2,'0')}`:'Choose a category or a card to explore';
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
document.addEventListener('keydown',e=>{if(reader.open)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1)}});
let gesture=null,suppressClick=false,clickTimer;
cards.addEventListener('pointerdown',e=>{
 if(!e.isPrimary||e.button!==0||filtered().length<2)return;
 cancelFeatured();stopCarousel();cards.classList.remove('animating');carouselOffset=0;clearTimeout(clickTimer);suppressClick=false;
 gesture={id:e.pointerId,x:e.clientX,y:e.clientY,dragging:false,step:innerWidth<=760?230:280};
});
cards.addEventListener('pointermove',e=>{
 if(!gesture||gesture.id!==e.pointerId)return;
 const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
 if(!gesture.dragging&&Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){gesture=null;return}
 if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)){
  gesture.dragging=true;suppressClick=true;
  cards.setPointerCapture(e.pointerId);cards.classList.add('dragging');
 }
 if(gesture.dragging){carouselOffset=dx/gesture.step;render()}
});
function finishGesture(e){
 if(!gesture||gesture.id!==e.pointerId)return;
 const dx=e.clientX-gesture.x,wasDragging=gesture.dragging,step=gesture.step;
 gesture=null;cards.classList.remove('dragging');cards.style.setProperty('--drag','0px');
 if(cards.hasPointerCapture(e.pointerId))cards.releasePointerCapture(e.pointerId);
 if(e.type==='pointerup'&&wasDragging&&Math.abs(dx)>40){const steps=Math.max(1,Math.round(Math.abs(dx)/step));move(dx<0?steps:-steps)}else if(wasDragging){move(0)}else render();
 if(wasDragging)clickTimer=setTimeout(()=>suppressClick=false,350);
}
window.addEventListener('pointerup',finishGesture);
cards.addEventListener('pointercancel',finishGesture);
cards.addEventListener('lostpointercapture',finishGesture);
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
  if(reader.open){reader.close();document.body.classList.remove('reading');returnFocus?.focus()}
  return;
 }
 if(!reader.open){returnFocus=document.activeElement;reader.showModal();document.body.classList.add('reading')}
 reader.scrollTop=0;
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
function closeReader(){history.replaceState(null,'',location.pathname+location.search);route()}
document.querySelector('.close').onclick=closeReader;reader.addEventListener('cancel',e=>{e.preventDefault();closeReader()});reader.addEventListener('click',e=>{if(e.target===reader){const r=reader.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeReader()}});window.addEventListener('resize',()=>render());window.addEventListener('hashchange',route);render();updateMotion();route();

// A direct overview complements the carousel as the collection grows.
const overview = document.querySelector('#overview');
items.forEach(item => {
 const link = document.createElement('a');
 link.className = 'overview-card';
 link.href = '#' + item.id;
 link.innerHTML = `<div class="visual ${item.art}">${item.visual}</div><h3>${item.title}</h3><p>${item.description}</p>${item.url ? '<span>Read the article ↗</span>' : '<span>Prototype preview</span>'}`;
 overview.append(link);
});

// Leave a moment to see the landscape; never override an early choice or deep link.
function scheduleFeatured(){
 featuredTimer=setTimeout(()=>{
  if(userChose||category!==null||reader.open||location.hash)return;
  category='Featured';index=0;carouselOffset=0;resetSceneryDrift();render(true);
 },1000);
}
if(document.readyState==='complete')scheduleFeatured();
else window.addEventListener('load',scheduleFeatured,{once:true});
