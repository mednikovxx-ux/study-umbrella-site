
;(function(){
 var top=document.getElementById('top'),b=document.getElementById('burger');
 b&&b.addEventListener('click',function(){var o=top.classList.toggle('open');b.setAttribute('aria-expanded',o)});
 function close(){top.classList.remove('open');b&&b.setAttribute('aria-expanded','false')}
 document.querySelectorAll('.nav a').forEach(function(a){a.addEventListener('click',close)});
 document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
 document.addEventListener('click',function(e){if(top&&!top.contains(e.target))close()});
 document.querySelectorAll('[data-pick]').forEach(function(a){a.addEventListener('click',function(){var r=document.getElementById('o-'+a.dataset.pick);if(r)r.checked=true})});
 var f=document.getElementById('lead'),msg=document.getElementById('form-msg');
 if(f)f.addEventListener('submit',function(e){
  e.preventDefault();msg.hidden=false;
  var v=function(n){var i=f.elements[n];return i?i.value.trim():''};
  var phone=v('phone'),handle=v('handle');
  if(!f.checkValidity()){msg.textContent='Заполните имя, телефон и ник в Telegram или ссылку на ВКонтакте и отметьте согласие — без них мы не сможем связаться.';return}
  if(phone.replace(/\D/g,'').length<10){msg.textContent='Проверьте номер телефона: в нём должно быть 10–11 цифр.';f.elements.phone.focus();return}
  if(!/^@?[A-Za-z0-9_]{4,32}$|t\.me\/[A-Za-z0-9_]{4,}|vk\.(com|ru)\/[A-Za-z0-9_.]+/i.test(handle)){msg.textContent='Напишите ник в Telegram (например, @anna_study) или ссылку на страницу ВКонтакте (vk.com/…).';f.elements.handle.focus();return}
  var st=f.querySelector('input[name=start]:checked'),btn=f.querySelector('button[type=submit]');
  var fields={name:v('name'),phone:phone,handle:handle,subject:v('subject'),start:st?st.closest('label').querySelector('span').firstChild.textContent.trim():'',page:location.pathname,website:v('website')};
  btn.disabled=true;msg.textContent='Отправляем…';
  /* text/plain без чтения ответа: Google Apps Script не отдаёт CORS-заголовки */
  fetch(f.dataset.endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'site_lead',fields:fields})})
   .then(function(){if(window.suGoal)window.suGoal('lead');msg.textContent='Спасибо! Заявка принята — менеджер напишет вам в течение рабочего дня.';f.reset()})
   .catch(function(){msg.textContent='Не получилось отправить. Проверьте интернет и попробуйте ещё раз — или напишите нам в Telegram.'})
   .finally(function(){btn.disabled=false});
 });
})();

document.querySelectorAll('.t-nav button').forEach(b=>b.addEventListener('click',()=>{const g=document.querySelector('.t-grid');g.scrollBy({left:+b.dataset.t*(g.querySelector('li:not([hidden])').offsetWidth+32),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}))
;(()=>{const t={lang:['от 1 250 ₽','Английский, испанский, турецкий и другие языки. Разовое занятие 90 минут — 2\u00a0300\u00a0₽, пакеты по 90 минут — стоимость уточняйте у менеджера.'],hum:['от 1 200 ₽','История, обществознание, русский язык, ОГЭ и ЕГЭ. Разовое занятие 90 минут — 2\u00a0000\u00a0₽, пакеты по 90 минут — стоимость уточняйте у менеджера.']};
document.querySelectorAll('[data-seg]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.seg;
document.querySelectorAll('[data-seg]').forEach(x=>x.setAttribute('aria-pressed',x===b));
document.querySelectorAll('[data-seg-table]').forEach(x=>x.hidden=x.dataset.segTable!==k);
var g=document.getElementById('grp-amount');if(g){g.firstChild.nodeValue='от '+(k==='hum'?900:950)+' ₽';g.lastChild.textContent='с человека за урок · от '+(k==='hum'?'7\u00a0600':'8\u00a0000')+' ₽ за курс 4 недели'}var am=document.getElementById('ind-amount');if(!am)return;am.firstChild.nodeValue=t[k][0];am.lastChild.textContent=(k==='hum'?'гуманитарные предметы':'языки')+' · за 60 минут в пакете из 12';document.getElementById('ind-note').textContent=t[k][1];}))})()
document.querySelectorAll('.t-grid').forEach(g=>{const n=g.closest('section')&&g.closest('section').querySelector('.t-nav');if(!n)return;const f=()=>{n.hidden=g.scrollWidth<=g.clientWidth+4};f();addEventListener('resize',f)});

/* запись из карточек: подставить язык или предмет в форму */
document.querySelectorAll('[data-subj]').forEach(function(a){a.addEventListener('click',function(){var f=document.getElementById('f-subj');if(f)f.value=a.dataset.subj})});
/* липкая кнопка записи на телефоне: прячется на первом экране и у формы */
;(function(){
 var form=document.getElementById('zayavka'),hero=document.querySelector('.hero,.page-hero');if(!form||!('IntersectionObserver' in window))return;
 var b=document.createElement('a');b.className='m-cta';b.href='#zayavka';b.dataset.pick='probnoe';b.textContent='Пробное занятие — бесплатно';b.setAttribute('data-hide','');
 b.addEventListener('click',function(){var r=document.getElementById('o-probnoe');if(r)r.checked=true});
 document.body.appendChild(b);
 var seen={hero:true,form:false};
 var io=new IntersectionObserver(function(es){es.forEach(function(e){seen[e.target===form?'form':'hero']=e.isIntersecting});if(seen.hero||seen.form)b.setAttribute('data-hide','');else b.removeAttribute('data-hide')});
 io.observe(form);if(hero)io.observe(hero);
})();
/* цели для Яндекс.Метрики: вписать номер счётчика в ID */
;(function(){
 var ID=0; /* номер счётчика */function goal(n){if(window.ym&&ID)window.ym(ID,'reachGoal',n)}
 document.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;
  if(/t\.me\//.test(a.href))goal('telegram');else if(/vk\.(ru|com)\//.test(a.href))goal('vk');else if(a.getAttribute('href')==='#zayavka')goal('cta_click')});
 window.suGoal=goal;
})();

/* фильтр статей */
;(function(){
 var bs=document.querySelectorAll('[data-cat]');if(!bs.length)return;
 var posts=document.querySelectorAll('.post'),empty=document.querySelector('.blog-empty');
 document.querySelectorAll('.blog-filter button').forEach(function(b){b.addEventListener('click',function(){
  var c=b.dataset.cat,n=0;
  document.querySelectorAll('.blog-filter button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});
  posts.forEach(function(p){var show=c==='all'||p.dataset.cat===c;p.hidden=!show;if(show)n++});
  if(empty)empty.hidden=n>0;
 })});
})();
/* анкеты в демо-режиме (вакансии) */
document.querySelectorAll('.demo-form').forEach(function(f){var m=f.querySelector('.form-msg');f.addEventListener('submit',function(e){
 e.preventDefault();m.hidden=false;
 if(!f.checkValidity()){m.textContent='Заполните обязательные поля и отметьте согласие.';return}
 if(window.suGoal)window.suGoal('vacancy');
 m.textContent='Анкета заполнена. Сейчас форма в демо-режиме — подключим отправку при запуске сайта.';
})});

/* окошко «Правила пакетов» */
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>{const d=document.getElementById(b.dataset.open);if(d&&d.showModal){d.showModal();document.body.style.overflow='hidden'}}));
document.querySelectorAll('dialog.rules').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-close]'))d.close()});d.addEventListener('close',()=>{document.body.style.overflow=''})});

/* анимации: блоки плавно появляются при прокрутке */
;(()=>{if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
document.documentElement.classList.add('anim');
/* одни и те же блоки на всех страницах: главная, языки, ОГЭ/ЕГЭ, о школе, вакансии, блог */
const sel='.sec-head,.aud-card,.dir,.plan,.step,.t-grid>li,.combo,.club,.review,.choice,.trust-row>li,.f-list>li,.rep-row,.page-hero .hero-text,.lang,.post,.other-card,.callout,.story-pic,.story-text,.promo,.faq-list>*,.t-filter';
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;io.unobserve(el);el.classList.add('in');
 setTimeout(()=>{el.classList.remove('rv','in');el.style.removeProperty('--d')},1400+(parseInt(el.style.getPropertyValue('--d'))||0))}),{rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll(sel).forEach(el=>{const sib=[...el.parentElement.children].filter(x=>x.matches(sel));
 el.style.setProperty('--d',Math.min(sib.indexOf(el),5)*90+'ms');el.classList.add('rv');io.observe(el)});
document.querySelectorAll('[data-seg]').forEach(b=>b.addEventListener('click',()=>{
 document.querySelectorAll('.amount[id],[data-seg-table]:not([hidden])').forEach(el=>{el.classList.remove('swap');void el.offsetWidth;el.classList.add('swap')})}));
})();

/* фильтр преподавателей по предмету */
document.querySelectorAll('.t-filter').forEach(f=>{const g=f.closest('section').querySelector('.t-grid');if(!g)return;f.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;f.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const k=b.dataset.tf;g.querySelectorAll(':scope>li').forEach(li=>{li.hidden=k!=='all'&&!(li.dataset.subj||'').split(' ').includes(k)});g.scrollLeft=0;dispatchEvent(new Event('resize'))})});

/* плашка согласия: показываем, пока посетитель не нажал «Хорошо» */
(()=>{const b=document.getElementById('consent-bar');if(!b)return;let ok=false;try{ok=localStorage.getItem('su-consent-v1')==='1'}catch(e){}if(ok)return;b.hidden=false;document.getElementById('consent-ok').addEventListener('click',()=>{try{localStorage.setItem('su-consent-v1','1')}catch(e){}b.hidden=true;document.dispatchEvent(new Event('su-consent'))})})();

/* «Поделиться результатом» под тестами: тесты ставят <div class="lt-share" data-share='{...}'>, здесь блок наполняется.
   Ссылки в Telegram и ВК, системное «Поделиться», картинка для сторис (canvas 1080×1920) и переход в бота с результатом (?start=...). */
(()=>{const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const botA=document.querySelector('a[href^="https://t.me/"][href*="bot"]');const BOT=botA?botA.href.split('?')[0]:'https://t.me/Umbrella_study_test_bot';
function fill(el){if(el.dataset.done)return;el.dataset.done=1;let o;try{o=JSON.parse(el.dataset.share)}catch(e){return}
 const url=location.origin+location.pathname,text=o.text+' Проверь себя бесплатно:';
 el.innerHTML='<h3>Поделиться результатом</h3><p class="lt-small">Отправьте друзьям или выложите в сторис — пусть тоже проверят себя.</p><div class="sh-row">'+
  (navigator.share?'<button type="button" class="btn secondary" data-sh="native">Поделиться</button>':'')+
  '<a class="btn light" target="_blank" rel="noopener" href="https://t.me/share/url?url='+encodeURIComponent(url)+'&text='+encodeURIComponent(text)+'">Telegram</a>'+
  '<a class="btn light" target="_blank" rel="noopener" href="https://vk.com/share.php?url='+encodeURIComponent(url)+'&title='+encodeURIComponent(text)+'">ВКонтакте</a>'+
  '<button type="button" class="btn light" data-sh="img">Картинка для сторис</button>'+
  '<button type="button" class="btn light" data-sh="copy">Скопировать ссылку</button></div>'+
  '<div class="sh-bot"><div><b>Разобрать результат в Telegram</b><span class="lt-small">Бот запомнит результат и поможет записаться на бесплатное пробное, 30 минут онлайн.</span></div><a class="btn primary" target="_blank" rel="noopener" href="'+BOT+'?start='+encodeURIComponent(o.start)+'">Открыть бота</a></div>';
 el.addEventListener('click',async e=>{const b=e.target.closest('[data-sh],a');if(!b)return;const k=b.dataset.sh;
  if(window.suGoal)window.suGoal(k?'share_'+k:(b.href.includes(BOT)?'test_bot':'share_link'));
  if(k==='copy'){try{await navigator.clipboard.writeText(url);b.textContent='Ссылка скопирована ✓'}catch(_){prompt('Скопируйте ссылку',url)}}
  if(k==='native'){try{await navigator.share({title:document.title,text,url})}catch(_){}}
  if(k==='img'){const blob=await card(o);const f=new File([blob],'study-umbrella-result.png',{type:'image/png'});
   if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],text:text+' '+url});return}catch(_){}}
   const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=f.name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}});
}
async function card(o){const W=1080,H=1920,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
 try{await document.fonts.load('120px "Kyiv Type Serif"');await document.fonts.load('48px "Onest"');await document.fonts.load('64px "Caveat"')}catch(_){}
 x.fillStyle='#F5F0E8';x.fillRect(0,0,W,H);x.fillStyle='#F7DCD9';x.beginPath();x.arc(W-60,H*0.62,430,0,7);x.fill();x.fillStyle='#DDE7E1';x.beginPath();x.arc(80,H-60,300,0,7);x.fill();
 const t=(s,y,font,col,al)=>{x.font=font;x.fillStyle=col;x.textAlign=al||'left';x.fillText(s,al==='center'?W/2:96,y)};
 const wrap=(s,y,font,col,lh,max)=>{x.font=font;const w=s.split(' ');let line='';for(const word of w){const tt=line?line+' '+word:word;if(x.measureText(tt).width>max&&line){t(line,y,font,col);y+=lh;line=word}else line=tt}if(line)t(line,y,font,col);return y+lh};
 t('Study Umbrella',190,'700 54px "Onest", sans-serif','#1E2B2F');
 t(o.kicker,520,'700 60px "Caveat", cursive','#B8303C');
 let y=wrap(o.title,640,'700 84px "Kyiv Type Serif", serif','#1E2B2F',100,W-192);
 x.font='700 300px "Kyiv Type Serif", serif';let big=o.big;let size=300;while(x.measureText(big).width>W-192&&size>120){size-=20;x.font='700 '+size+'px "Kyiv Type Serif", serif'}
 t(big,y+size*0.85,x.font,'#B8303C');y+=size+40;
 y=wrap(o.sub,y+20,'500 52px "Onest", sans-serif','#5A6669',66,W-192);
 t('А какой результат у тебя?',H-330,'700 56px "Onest", sans-serif','#1E2B2F');
 t('Бесплатный тест — '+location.host,H-250,'500 44px "Onest", sans-serif','#5A6669');
 return new Promise(r=>c.toBlob(r,'image/png'))}
const run=()=>document.querySelectorAll('.lt-share[data-share]').forEach(fill);run();
const lt=document.getElementById('lt');if(lt)new MutationObserver(run).observe(lt,{childList:true,subtree:true});})();
/* кнопки «Отправить статью другу» (место ставит build_pages.py) и цели Метрики для ссылок с data-goal */
(()=>{const url=location.origin+location.pathname,title=(document.querySelector('h1')||{}).textContent||document.title;
document.querySelectorAll('[data-art-share]').forEach(el=>{el.insertAdjacentHTML('beforeend',
 '<a class="btn light" target="_blank" rel="noopener" data-goal="share_tg" href="https://t.me/share/url?url='+encodeURIComponent(url)+'&text='+encodeURIComponent(title.trim())+'">Telegram</a>'+
 '<a class="btn light" target="_blank" rel="noopener" data-goal="share_vk" href="https://vk.com/share.php?url='+encodeURIComponent(url)+'&title='+encodeURIComponent(title.trim())+'">ВКонтакте</a>')});
document.addEventListener('click',e=>{const a=e.target.closest('[data-goal]');if(a&&window.suGoal)window.suGoal(a.dataset.goal)});})();
/* страницы языков: уровни переключают темы (tools/subject_pages.py) */
document.querySelectorAll('.sp-levels').forEach(g=>g.addEventListener('click',e=>{const b=e.target.closest('[data-sp-lv]');if(!b)return;const sec=g.closest('section');
 g.querySelectorAll('[data-sp-lv]').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));sec.querySelectorAll('[data-sp-panel]').forEach(p=>p.hidden=p.dataset.spPanel!==b.dataset.spLv)}));
