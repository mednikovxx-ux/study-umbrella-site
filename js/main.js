
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
  if(!f.checkValidity()){msg.textContent='Заполните имя и контакт и отметьте согласие — без них мы не сможем связаться.';return}
  /* ПОДКЛЮЧИТЬ: отправку заявки в Telegram-бота, CRM или таблицу заявок */
  if(window.suGoal)window.suGoal('lead');
  msg.textContent='Заявка заполнена. Сейчас форма работает в демо-режиме и никуда не отправляется — подключим её к Telegram-боту или таблице заявок при запуске.';
 });
})();

document.querySelectorAll('.t-nav button').forEach(b=>b.addEventListener('click',()=>{const g=document.querySelector('.t-grid');g.scrollBy({left:+b.dataset.t*(g.querySelector('li').offsetWidth+32),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}))
;(()=>{const t={lang:['от 1 250 ₽','Английский, испанский, турецкий и другие языки. Занятие 90 минут — 2 300 ₽, в пакете — 2 100 ₽.'],hum:['от 1 200 ₽','История, обществознание, русский язык, ОГЭ и ЕГЭ. Занятие 90 минут — 2 000 ₽, в пакете — 1 850 ₽.']};
document.querySelectorAll('[data-seg]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.seg;
document.querySelectorAll('[data-seg]').forEach(x=>x.setAttribute('aria-pressed',x===b));
document.querySelectorAll('[data-seg-table]').forEach(x=>x.hidden=x.dataset.segTable!==k);
var am=document.getElementById('ind-amount');if(!am)return;am.firstChild.nodeValue=t[k][0];document.getElementById('ind-note').textContent=t[k][1];}))})()
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
