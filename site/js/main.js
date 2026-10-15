
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
(()=>{const b=document.getElementById('consent-bar');if(!b)return;let ok=false;try{ok=localStorage.getItem('su-consent-v1')==='1'}catch(e){}if(ok)return;b.hidden=false;document.getElementById('consent-ok').addEventListener('click',()=>{try{localStorage.setItem('su-consent-v1','1')}catch(e){}b.hidden=true})})();
