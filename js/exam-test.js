/* Движок пробного теста в формате ОГЭ/ЕГЭ: задания берёт из window.EXAM_TEST (exam-istoriya-ege.js, exam-istoriya-oge.js).
   Баллы — по правилам ФИПИ: за задание на 2 балла одна ошибка = 1 балл, на 3 балла каждая ошибка −1.
   Развёрнутые ответы (open) не оцениваются автоматически: их проверит преподаватель.
   Анкета перед тестом и отправка в школу — как в тесте на уровень языка (level-test.js). */
;(function(){
 var T=window.EXAM_TEST,root=document.getElementById('lt');
 if(!T||!root)return;
 var L='АБВГДЕ';
 var st=load()||{step:-1,ans:{},sent:false};

 function load(){try{return JSON.parse(localStorage.getItem(T.key))}catch(e){return null}}
 function save(){try{localStorage.setItem(T.key,JSON.stringify(st))}catch(e){}}
 function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function norm(s){return String(s||'').toLowerCase().replace(/ё/g,'е').replace(/[«»"“”.,!?;:]/g,' ').replace(/\s+/g,' ').trim()}
 function digits(s){return String(s||'').replace(/\D/g,'')}

 /* Все задания по порядку, с id */
 var TASKS=[];
 var AB=['верно только А','верно только Б','верны оба суждения','оба суждения неверны'];
 T.parts.forEach(function(p,pi){p.tasks.forEach(function(t,ti){t.id=p.id+'-'+ti;t.part=pi;if(t.type==='ab'){t.type='single';t.o=AB}TASKS.push(t)})});
 var AUTO=TASKS.filter(function(t){return t.type!=='open'});

 /* Баллы за задание */
 function points(t){
  var v=st.ans[t.id];
  if(t.type==='match'||t.type==='table'){
   var a=v||{},err=0;t.a.forEach(function(x,i){if(a[i]!==x)err++});return Math.max(0,t.max-err);
  }
  if(t.type==='multi'){
   var sel=(v||[]).slice().sort(),ok=sel.filter(function(x){return t.a.indexOf(x)>=0}).length;
   var err=sel.length===t.a.length?t.a.length-ok:(sel.length-ok)+(t.a.length-ok);
   return Math.max(0,t.max-err);
  }
  if(t.type==='seq')return digits(v)===t.a?t.max:0;
  if(t.type==='short')return t.a.map(norm).indexOf(norm(v))>=0?t.max:0;
  if(t.type==='single')return v===t.a?t.max:0;
  return 0;
 }
 function answered(t){var v=st.ans[t.id];if(v==null||v==='')return false;if(t.type==='match'||t.type==='table')return Object.keys(v).length>0;if(t.type==='multi')return v.length>0;return true}
 function score(){
  var got=0,max=0,by={};
  AUTO.forEach(function(t){var p=points(t);got+=p;max+=t.max;var b=by[t.topic]||(by[t.topic]={got:0,max:0});b.got+=p;b.max+=t.max});
  return{got:got,max:max,by:by};
 }

 /* ---------- экраны ---------- */
 function render(){
  if(st.step<0)return intro();
  if(st.step>=T.parts.length)return results();
  part(st.step);
 }
 function steps(){return '<ol class="lt-steps">'+T.parts.map(function(p,i){return '<li class="'+(i<st.step?'done':i===st.step?'now':'')+'"><span>'+(i+1)+'</span>'+esc(p.title)+'</li>'}).join('')+'</ol>'}
 function intro(){
  var w=st.who||{};
  root.innerHTML='<div class="lt-card lt-intro"><h2>Как устроен тест</h2><ol class="lt-plan">'+T.parts.map(function(p){return '<li><b>'+esc(p.title)+'</b><span>'+esc(p.time)+'</span></li>'}).join('')+'</ol>'+
   T.intro.map(function(x){return '<p>'+x+'</p>'}).join('')+'</div>'+
   '<form class="lt-card lt-send lt-who" id="lt-who" novalidate><h2>Перед началом — пара слов о вас</h2><p>Результат сразу появится на экране, а копия уйдёт в школу: преподаватель проверит развёрнутые ответы, а менеджер свяжется с вами и предложит бесплатное пробное занятие.</p>'+fields(w)+
   '<label class="consent"><input type="checkbox" required'+(st.who?' checked':'')+'><span>Соглашаюсь с <a href="/study-umbrella-site/privacy/">политикой конфиденциальности</a> и даю согласие на обработку персональных данных</span></label>'+
   '<p class="form-msg" role="status" hidden></p><div class="lt-nav"><button class="btn primary" type="submit">'+(st.who&&Object.keys(st.ans).length?'Продолжить тест':'Начать тест')+'</button></div></form>';
 }
 function fields(w){
  return '<div class="lt-fields two"><div class="field"><label for="lt-name">Как к вам обращаться</label><input id="lt-name" name="name" autocomplete="given-name" value="'+esc(w.name||'')+'" required></div>'+
   '<div class="field"><label for="lt-contact">Телефон или ник в Telegram</label><input id="lt-contact" name="contact" placeholder="+7 900 000-00-00  или  @username" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+esc(w.handle||w.phone||'')+'" required></div></div>'+
   '<div class="hp" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></div>';
 }
 var NICK=/^@?[A-Za-z0-9_]{4,32}$|t\.me\/[A-Za-z0-9_]{4,}|vk\.(com|ru)\/[A-Za-z0-9_.]+/i;
 function contact(c){c=c.trim();if(NICK.test(c)&&/[A-Za-z]/.test(c))return{handle:c,phone:''};var d=c.replace(/\D/g,'');return d.length>=10&&d.length<=12&&!/[A-Za-zА-Яа-я]/.test(c)?{phone:c,handle:''}:null}
 function bad(f){
  if(!f.checkValidity())return 'Напишите имя, телефон или ник в Telegram и отметьте согласие.';
  if(!contact(f.elements.contact.value))return 'Проверьте контакт: телефон из 10–11 цифр или ник в Telegram, например @anna_study.';
  return '';
 }
 function part(pi){
  var p=T.parts[pi],h=steps()+'<div class="lt-card"><p class="lt-kicker">Часть '+(pi+1)+' из '+T.parts.length+' · '+esc(p.time)+'</p><h2>'+esc(p.title)+'</h2><p class="lt-intro-text">'+esc(p.intro)+'</p>';
  p.tasks.forEach(function(t){h+=task(t)});
  h+='<p class="lt-warn" id="lt-warn" hidden></p><div class="lt-nav">'+(pi>0?'<button class="btn light" type="button" data-go="'+(pi-1)+'">Назад</button>':'')+
   '<button class="btn primary" type="button" data-next>'+(pi===T.parts.length-1?'Узнать результат':'Дальше')+'</button></div></div>';
  root.innerHTML=h;
  scrollTo({top:root.getBoundingClientRect().top+scrollY-90,behavior:'smooth'});
 }
 function head(t){return '<div class="ex-task" id="'+t.id+'"><p class="ex-num"><b>'+t.n+'</b><span>'+(t.type==='open'?'развёрнутый ответ · проверит преподаватель':t.max+' '+(t.max===1?'балл':'балла'))+'</span></p><p class="ex-q">'+t.q+'</p>'+(t.src?'<blockquote class="ex-src">'+t.src+'</blockquote>':'')}
 function list(o){return '<ol class="ex-list">'+o.map(function(x,i){return '<li><b>'+(i+1)+')</b> '+x+'</li>'}).join('')+'</ol>'}
 function sel(t,i){
  var v=(st.ans[t.id]||{})[i];
  return '<select class="ex-sel" data-id="'+t.id+'" data-i="'+i+'" aria-label="Ответ для '+L[i]+'"><option value="">—</option>'+t.o.map(function(_,k){return '<option value="'+(k+1)+'"'+(v===k+1?' selected':'')+'>'+(k+1)+'</option>'}).join('')+'</select>';
 }
 function task(t){
  var h=head(t);
  if(t.type==='match'){
   h+='<div class="ex-match"><div><p class="ex-col">'+esc(t.left)+'</p><ul class="ex-left">'+t.l.map(function(x,i){return '<li><b>'+L[i]+')</b> '+x+sel(t,i)+'</li>'}).join('')+'</ul></div><div><p class="ex-col">'+esc(t.right)+'</p>'+list(t.o)+'</div></div>';
  }else if(t.type==='table'){
   var g=0;
   h+='<div class="ex-tablewrap"><table class="ex-table"><thead><tr>'+t.cols.map(function(c){return '<th>'+c+'</th>'}).join('')+'</tr></thead><tbody>'+t.rows.map(function(r){return '<tr>'+r.map(function(c){if(c!==null)return '<td>'+c+'</td>';var i=g++;return '<td class="ex-gap">('+L[i]+') '+sel(t,i)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>'+
    '<p class="ex-col">Пропущенные элементы:</p>'+list(t.o);
  }else if(t.type==='multi'){
   var v=st.ans[t.id]||[],dg=t.o.every(function(x,i){return x===String(i+1)}); /* «укажите цифры» — компактные кнопки (1) (2) (3) */
   h+='<div class="ex-checks'+(dg?' ex-digits':'')+'">'+t.o.map(function(x,i){return '<label class="ex-check"><input type="checkbox" data-id="'+t.id+'" value="'+(i+1)+'"'+(v.indexOf(i+1)>=0?' checked':'')+'><span>'+(dg?'('+x+')':'<b>'+(i+1)+')</b> '+x)+'</span></label>'}).join('')+'</div>';
  }else if(t.type==='single'){
   var s=st.ans[t.id];
   h+='<div class="ex-checks">'+t.o.map(function(x,i){return '<label class="ex-check"><input type="radio" name="'+t.id+'" data-id="'+t.id+'" value="'+(i+1)+'"'+(s===i+1?' checked':'')+'><span><b>'+(i+1)+')</b> '+x+'</span></label>'}).join('')+'</div>';
  }else if(t.type==='seq'){
   h+=list(t.o)+'<label class="ex-ans">Ответ — цифры подряд, без пробелов: <input class="lt-in" data-id="'+t.id+'" inputmode="numeric" maxlength="'+t.o.length+'" value="'+esc(st.ans[t.id]||'')+'" autocomplete="off"></label>';
  }else if(t.type==='short'){
   h+='<label class="ex-ans">Ответ: <input class="lt-in wide" data-id="'+t.id+'" value="'+esc(st.ans[t.id]||'')+'" autocomplete="off" spellcheck="false"></label>';
  }else if(t.type==='open'){
   h+='<textarea class="lt-wr ex-open" data-id="'+t.id+'" rows="6" aria-label="Ответ на задание '+t.n+'">'+esc(st.ans[t.id]||'')+'</textarea>';
  }
  return h+'</div>';
 }

 function results(){
  var r=score(),pc=Math.round(r.got/r.max*100);
  var verdict=pc>=80?['Хорошая база','Задания с кратким ответом получаются уверенно. Дальше — '+(T.next||'развёрнутые ответы: на них обычно и теряют баллы.')]:
   pc>=50?['Есть основа, но есть и пробелы','Часть тем уже держится, часть — нет. Ниже видно, какие периоды и типы заданий проседают: с них и стоит начать.']:
   ['Нужна системная подготовка','Пока многие задания даются с трудом — это нормальная точка старта. Начнём с хронологии и опорных фактов, а потом перейдём к работе с источниками.'];
  var topics=Object.keys(r.by).map(function(k){var b=r.by[k],p=Math.round(b.got/b.max*100);return '<li><b>'+esc(k)+'</b><span class="lt-meter"><i style="width:'+p+'%"'+(p>=70?' class="pass"':'')+'></i></span><span>'+b.got+' из '+b.max+'</span></li>'}).join('');
  var weak=Object.keys(r.by).filter(function(k){return r.by[k].got/r.by[k].max<.5});
  var rows=AUTO.map(function(t){var p=points(t);return '<li><span>№ '+t.n+' · '+esc(t.what)+'</span><em class="lt-plvl'+(p===t.max?' strong':p===0?' weak':'')+'">'+p+' из '+t.max+'</em></li>'}).join('');
  var opens=TASKS.filter(function(t){return t.type==='open'}),done=opens.filter(answered).length;
  var wrong=AUTO.filter(function(t){return points(t)<t.max});
  root.innerHTML='<div class="lt-card lt-result"><p class="lt-kicker">'+(st.who?esc(st.who.name)+', ваш':'Ваш')+' результат</p>'+
   '<div class="lt-level"><span class="long ex-score">'+r.got+'<small>из '+r.max+'</small></span><div><h2>'+verdict[0]+'</h2><p class="lt-score">'+esc(T.scoreNote)+'</p></div></div>'+
   '<div class="ex-bar"><i style="width:'+pc+'%"></i></div><p class="lt-desc">'+verdict[1]+'</p></div>'+
   '<div class="lt-card"><h2>Подробно</h2><div class="lt-res-grid"><div><h3>По заданиям</h3><ul class="lt-parts">'+rows+'</ul></div>'+
   '<div><h3>По темам</h3><ul class="lt-levels ex-topics">'+topics+'</ul>'+(weak.length?'<p class="lt-advice">📉 Подтянуть в первую очередь: <b>'+weak.map(esc).join(', ')+'</b>.</p>':'')+
   '<p class="lt-small">'+esc(T.rules)+'</p>'+(opens.length?'<p class="lt-small">Развёрнутые ответы: '+(done?'заполнено '+done+' из '+opens.length+' — проверит преподаватель.':'не заполнены.')+'</p>':'')+'</div></div>'+
   '<p class="lt-note">'+T.note+'</p>'+
   (wrong.length?'<details class="lt-review"><summary>Посмотреть ошибки ('+wrong.length+')</summary><ol>'+wrong.map(review).join('')+'</ol></details>':'')+
   '</div>'+sendForm()+shareCard(r)+mailForm()+
   '<div class="lt-nav lt-again"><button class="btn light" type="button" data-restart>Пройти тест заново</button></div>';
  if(!st.done){st.done=1;save();if(window.suGoal)window.suGoal('exam_test')}
  if(st.who&&!st.sent&&!sending)send(st.who);
  scrollTo({top:root.getBoundingClientRect().top+scrollY-90,behavior:'smooth'});
 }
 function shown(t,v){
  if(t.type==='match'||t.type==='table'){v=v||{};return t.a.map(function(_,i){return v[i]||'–'}).join('')}
  if(t.type==='multi')return (v||[]).slice().sort().join('')||'нет ответа';
  if(t.type==='single')return v?String(v):'нет ответа';
  return v||'нет ответа';
 }
 function right(t){
  if(t.type==='match'||t.type==='table')return t.a.join('');
  if(t.type==='multi')return t.a.slice().sort().join('');
  if(t.type==='short')return t.a[0];
  return String(t.a);
 }
 function review(t){return '<li><p>№ '+t.n+' · '+esc(t.what)+'</p><p><span class="lt-bad">'+esc(shown(t,st.ans[t.id]))+'</span> → <span class="lt-good">'+esc(right(t))+'</span>'+(t.why?'<br><span class="lt-small">'+t.why+'</span>':'')+'</p></li>'}

 function summary(r){
  var lines=[T.subject+' · '+T.exam+': '+r.got+' из '+r.max+' первичных баллов за задания с автопроверкой.',
   'По заданиям: '+AUTO.map(function(t){return '№'+t.n+' '+points(t)+'/'+t.max}).join(', ')+'.',
   'По темам: '+Object.keys(r.by).map(function(k){return k+' '+r.by[k].got+'/'+r.by[k].max}).join(', ')+'.'];
  TASKS.filter(function(t){return t.type==='open'}).forEach(function(t){var v=String(st.ans[t.id]||'').trim();lines.push('','№'+t.n+' (развёрнутый ответ): '+(v||'не выполнено'))});
  return 'Пробный '+T.exam+' по предмету «'+T.subject.toLowerCase()+'».\n'+lines.join('\n');
 }
 var sending=false,failed=false;
 /* Блок «Поделиться» (наполняет main.js) и переход в бота: ?start=ex_<предмет>_<экзамен>_<баллы>_<из> */
 function shareCard(r){var subj=String(T.subject||''),code=/ист/i.test(subj)?'ist':/общ/i.test(subj)?'obsh':'rus',ex=T.exam==='ОГЭ'?'oge':'ege';
  var dat={'История':'истории','Обществознание':'обществознанию'}[subj]||'русскому языку';
  var o={start:'ex_'+code+'_'+ex+'_'+r.got+'_'+r.max,kicker:'пробный '+T.exam,title:T.exam+' по '+dat,big:r.got+' из '+r.max,sub:'баллов за задания с кратким ответом',text:'Мой пробный '+T.exam+' по '+dat+': '+r.got+' из '+r.max+' баллов.'};
  return '<div class="lt-card lt-share" data-share="'+esc(JSON.stringify(o))+'"></div>'}
 function sendForm(){
  if(st.sent)return '<div class="lt-card lt-send"><h2>Результат уже в школе 👌</h2><p>Менеджер свяжется с вами в течение рабочего дня и предложит время бесплатного пробного занятия. Развёрнутые ответы проверит преподаватель.</p></div>';
  if(st.who)return '<div class="lt-card lt-send"><h2>'+(failed?'Не получилось отправить результат':'Отправляем результат в школу…')+'</h2>'+(failed?'<p>Проверьте интернет и нажмите кнопку ещё раз.</p><button class="btn primary" type="button" data-resend>Отправить ещё раз</button>':'<p>Это займёт пару секунд.</p>')+'</div>';
  return '<form class="lt-card lt-send" id="lt-send" novalidate><h2>Хотите разбор и план?</h2><p>Отправьте результат в школу: преподаватель посмотрит ошибки и на бесплатном пробном занятии скажет, с чего начать.</p>'+fields({})+
   '<label class="consent"><input type="checkbox" required><span>Соглашаюсь с <a href="/study-umbrella-site/privacy/">политикой конфиденциальности</a> и даю согласие на обработку персональных данных</span></label>'+
   '<button class="btn primary" type="submit">Отправить результат</button><p class="form-msg" role="status" hidden></p></form>';
 }
 function mailForm(){
  if(st.mailed)return '<div class="lt-card lt-mail"><h3>📬 Результат отправлен на '+esc(st.mailed)+'</h3><p class="lt-small">Письмо придёт в течение пары минут. Если его нет — загляните в папку «Спам».</p><button class="btn light" type="button" data-remail>Отправить на другой адрес</button></div>';
  return '<form class="lt-card lt-mail" id="lt-mail" novalidate><h3>📬 Прислать результат на почту</h3><p class="lt-small">Пришлём баллы по заданиям и темам, чтобы результат не потерялся.</p>'+
   '<div class="lt-mail-row"><div class="field"><label for="lt-email">Электронная почта</label><input id="lt-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="name@mail.ru" value="'+esc(st.email||'')+'" required></div><button class="btn secondary" type="submit">Отправить</button></div>'+
   '<p class="form-msg" role="status" hidden></p></form>';
 }
 function post(action,fields){return fetch(root.dataset.endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:action,fields:fields})})}
 /* Заявка «начал тест» — сразу после анкеты; итог потом уходит с тем же id и дописывается в ту же строку таблицы */
 function started(){
  var w=st.who;
  post('site_lead',{id:st.lead,name:w.name,phone:w.phone,handle:w.handle,subject:T.subject+' · '+T.exam+' · начал тест',start:'Пробный тест',page:location.pathname,website:w.website||'',test:'Начал тест: пробный '+T.exam+' ('+T.subject.toLowerCase()+'), результата пока нет.'})
   .then(function(){if(window.suGoal)window.suGoal('test_start')},function(){});
 }
 function send(who){
  var r=score();sending=true;failed=false;
  return post('site_lead',{id:st.lead||'',name:who.name,phone:who.phone,handle:who.handle,subject:T.subject+' · '+T.exam+': '+r.got+'/'+r.max,start:'Пробный тест',page:location.pathname,website:who.website||'',test:summary(r)})
   .then(function(){sending=false;st.sent=true;save();if(window.suGoal)window.suGoal('lead')},function(){sending=false;failed=true})
   .then(function(){var c=root.querySelector('.lt-send');if(c&&st.step>=T.parts.length)c.outerHTML=sendForm()});
 }

 /* ---------- события ---------- */
 root.addEventListener('change',function(e){
  var t=e.target,id=t.dataset.id;if(!id)return;
  if(t.tagName==='SELECT'){var a=st.ans[id]||{};if(t.value)a[t.dataset.i]=+t.value;else delete a[t.dataset.i];st.ans[id]=a}
  else if(t.type==='checkbox'){var v=st.ans[id]||[],n=+t.value;v=v.filter(function(x){return x!==n});if(t.checked)v.push(n);st.ans[id]=v}
  else if(t.type==='radio')st.ans[id]=+t.value;
  save();
 });
 root.addEventListener('input',function(e){var t=e.target;if((t.tagName==='INPUT'&&t.type!=='checkbox'&&t.type!=='radio'||t.tagName==='TEXTAREA')&&t.dataset.id){st.ans[t.dataset.id]=t.value;save()}});
 root.addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  if(b.dataset.go!=null){st.step=+b.dataset.go;save();render()}
  else if(b.hasAttribute('data-next')){
   var miss=T.parts[st.step].tasks.filter(function(t){return t.type!=='open'&&!answered(t)}).length,w=document.getElementById('lt-warn');
   if(miss&&w.hidden){w.hidden=false;w.textContent='Без ответа: '+miss+'. Их можно оставить — за них будет 0 баллов. Нажмите ещё раз, чтобы идти дальше.';return}
   st.step++;save();render();
  }
  else if(b.hasAttribute('data-remail')){st.mailed=null;save();b.closest('.lt-mail').outerHTML=mailForm()}
  else if(b.hasAttribute('data-resend')){b.closest('.lt-send').outerHTML=(failed=false,sendForm());send(st.who)}
  else if(b.hasAttribute('data-restart')){if(!confirm('Начать заново? Ответы этого прохождения сотрутся.'))return;st={step:0,ans:{},sent:false,who:st.who,email:st.email,lead:null};save();render()}
 });
 root.addEventListener('submit',function(e){
  var f=e.target;
  if(f.id==='lt-mail'){
   e.preventDefault();var em=f.elements.email.value.trim(),m=f.querySelector('.form-msg'),b=f.querySelector('button');m.hidden=false;
   if(!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(em)){m.textContent='Проверьте адрес почты: например, name@mail.ru.';return}
   var r=score();b.disabled=true;m.textContent='Отправляем…';
   post('test_mail',{email:em,name:st.who?st.who.name:'',subject:T.subject+' · '+T.exam+' · '+r.got+'/'+r.max,page:location.origin+location.pathname,test:summary(r)})
    .then(function(){st.mailed=st.email=em;save();f.outerHTML=mailForm();if(window.suGoal)window.suGoal('test_mail')})
    .catch(function(){b.disabled=false;m.textContent='Не получилось отправить. Проверьте интернет и попробуйте ещё раз.'});
   return;
  }
  if(f.id!=='lt-who'&&f.id!=='lt-send')return;e.preventDefault();
  var msg=f.querySelector('.form-msg'),err=bad(f);
  if(err){msg.hidden=false;msg.textContent=err;return}
  var v=function(n){return f.elements[n].value.trim()},c=contact(v('contact'));
  st.who={name:v('name'),phone:c.phone,handle:c.handle,website:v('website')};
  if(f.id==='lt-who'){if(st.step<0)st.step=0;st.lead='T'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);save();started();render();return}
  save();f.outerHTML=sendForm();send(st.who);
 });
 render();
})();
