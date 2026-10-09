/* Движок теста на уровень: задания берёт из window.LEVEL_TEST (level-test-en.js, level-test-es.js).
   Перед началом человек оставляет имя и контакты; результат уходит в школу сам, как только тест пройден.
   Ответы хранятся в браузере (localStorage), чтобы не потерять их при обновлении страницы.
   Итог: идём от A1 вверх, уровень засчитан, если на его заданиях ≥ 60% верных. */
;(function(){
 var T=window.LEVEL_TEST,root=document.getElementById('lt');
 if(!T||!root)return;
 var ORDER=['A1','A2','B1','B2','C1'],PASS=.6,NEAR=.4;
 var LANG=T.lang||'en',TF=T.tfn||{o:['True','False','Not stated'],title:'True, False или Not stated?'},TFN=TF.o,TFN_RU=['верно','неверно','не сказано'];
 var SCALE={A0:'с нуля',A1:'начальный',A2:'базовый',B1:'средний',B2:'выше среднего',C1:'продвинутый'};
 var st=load()||{step:-1,ans:{},plays:{},wtask:null,wtext:'',sent:false};

 function load(){try{return JSON.parse(localStorage.getItem(T.key))}catch(e){return null}}
 function save(){try{localStorage.setItem(T.key,JSON.stringify(st))}catch(e){}}
 function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 /* Сравнение вписанных ответов: без регистра, знаков препинания и диакритики (más = mas, başarılı = basarili) */
 function norm(s){return String(s||'').toLowerCase().replace(/ı/g,'i').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’`]/g,"'").replace(/[.,!?¡¿;:"“”«»]/g,' ').replace(/\s+/g,' ').trim()}
 /* Для китайского (T.chars) считаем иероглифы, плюс слова пиньинем, если иероглифы не печатают */
 function words(s){s=String(s);if(T.chars){var h=(s.match(/\p{Script=Han}/gu)||[]).length;return h+(s.replace(/\p{Script=Han}/gu,' ').match(/[\p{L}’'-]+/gu)||[]).length}return (s.match(/[\p{L}’'-]+/gu)||[]).length}
 var UNIT=T.chars?'иероглифов':'слов';
 /* Подпись уровня: у китайского HSK 1–5 вместо A1–C1 */
 function lab(l){return (T.labels&&T.labels[l])||l}
 /* «HSK 3» / «TOPIK 3» в кружке: название мелко сверху, цифра крупно */
 function badge(t){var m=t.match(/^(\S+) (\d)$/);return m?'<small>'+m[1]+'</small>'+m[2]:'<em class="lt-bw">'+esc(t)+'</em>'}

 /* Все автопроверяемые задания с id, по порядку */
 var ITEMS=[];
 T.parts.forEach(function(p,pi){p.tasks.forEach(function(t,ti){
  var add=function(list,kind,g){list.forEach(function(it,i){it.id=p.id+'-'+ti+(g!=null?'-'+g:'')+'-'+i;it.kind=kind;it.part=pi;it.task=t;ITEMS.push(it)})};
  if(t.type==='reading')t.groups.forEach(function(g,gi){add(g.items,g.type,gi)});
  else if(t.type!=='writing')add(t.items,t.type==='mc'||t.type==='audio'?'mc':t.type,null);
 })});
 function ok(it){
  var v=st.ans[it.id];if(v==null||v==='')return false;
  if(it.kind==='mc'||it.kind==='tfn')return v===it.a;
  return it.a.map(norm).indexOf(norm(v))>=0;
 }

 /* Уровень по набору заданий: снизу вверх, пока на уровне ≥ 60% верных.
    Уровни, которых в части нет, пропускаем. */
 function levelOf(by){
  var lvl=null,first=null,next=null;
  for(var i=0;i<ORDER.length;i++){var b=by[ORDER[i]];if(!b)continue;if(!first)first=ORDER[i];if(b.ok/b.n>=PASS)lvl=ORDER[i];else{next=ORDER[i];break}}
  return{lvl:lvl,first:first,near:next&&by[next].ok/by[next].n>=NEAR?next:null};
 }
 function score(){
  var by={},parts=T.parts.map(function(){return{ok:0,n:0,by:{}}});
  ITEMS.forEach(function(it){
   var b=by[it.l]||(by[it.l]={ok:0,n:0}),P=parts[it.part],pb=P.by[it.l]||(P.by[it.l]={ok:0,n:0});
   b.n++;P.n++;pb.n++;if(ok(it)){b.ok++;P.ok++;pb.ok++}
  });
  parts.forEach(function(P){if(P.n){var x=levelOf(P.by);P.lvl=x.lvl;P.label=x.lvl?lab(x.lvl):'ниже '+lab(x.first);P.rank=x.lvl?ORDER.indexOf(x.lvl):-1}});
  var all=levelOf(by),lvl=all.lvl||'A0';
  var tot=ITEMS.filter(ok).length;
  /* что подтянуть: части, где уровень ниже общего */
  var rank=ORDER.indexOf(lvl),weak=[],strong=[];
  parts.forEach(function(P,i){if(!P.n)return;if(P.rank<rank)weak.push(i);else if(P.rank>rank)strong.push(i)});
  return{lvl:lvl,near:all.near,by:by,parts:parts,ok:tot,n:ITEMS.length,weak:weak,strong:strong};
 }

 /* ---------- экраны ---------- */
 function render(){
  if(audio){audio.pause();cur=null} /* ушли с части с аудио — звук останавливаем */
  if(st.step<0)return intro();
  if(st.step>=T.parts.length)return results();
  part(st.step);
 }
 function steps(){
  return '<ol class="lt-steps">'+T.parts.map(function(p,i){return '<li class="'+(i<st.step?'done':i===st.step?'now':'')+'"><span>'+(i+1)+'</span>'+esc(p.title)+'</li>'}).join('')+'</ol>';
 }
 function intro(){
  var w=st.who||{};
  root.innerHTML='<div class="lt-card lt-intro"><h2>Как устроен тест</h2><ol class="lt-plan">'+T.parts.map(function(p){return '<li><b>'+esc(p.title)+'</b><span>'+esc(p.time)+'</span></li>'}).join('')+'</ol>'+
   '<p>Всего около 50 минут. Можно прерваться: ответы сохраняются в этом браузере. Для аудирования понадобятся наушники или колонки.</p>'+
   '<p>Не подглядывайте в словарь и переводчик — тогда результат покажет ваш настоящий уровень, а не уровень переводчика 🙂</p></div>'+
   '<form class="lt-card lt-send lt-who" id="lt-who" novalidate><h2>Перед началом — пара слов о вас</h2><p>Результат сразу появится на экране, а копия уйдёт в школу: преподаватель посмотрит ошибки'+(T.parts.some(function(p){return p.id==='wr'})?' и проверит письмо':'')+', а менеджер свяжется с вами и предложит бесплатное пробное занятие.</p>'+fields(w)+
   '<label class="consent"><input type="checkbox" required'+(st.who?' checked':'')+'><span>Соглашаюсь с <a href="/study-umbrella-site/privacy/">политикой конфиденциальности</a> и даю согласие на обработку персональных данных</span></label>'+
   '<p class="form-msg" role="status" hidden></p><div class="lt-nav"><button class="btn primary" type="submit">'+(st.who&&Object.keys(st.ans).length?'Продолжить тест':'Начать тест')+'</button></div></form>';
 }
 function fields(w){
  return '<div class="lt-fields two"><div class="field"><label for="lt-name">Как к вам обращаться</label><input id="lt-name" name="name" autocomplete="given-name" value="'+esc(w.name||'')+'" required></div>'+
   '<div class="field"><label for="lt-contact">Телефон или ник в Telegram</label><input id="lt-contact" name="contact" placeholder="+7 900 000-00-00  или  @username" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+esc(w.handle||w.phone||'')+'" required></div></div>'+
   '<div class="hp" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></div>';
 }
 /* Контакт: ник в Telegram (или ссылка ВКонтакте) либо телефон. bad() возвращает текст ошибки или пустую строку */
 var NICK=/^@?[A-Za-z0-9_]{4,32}$|t\.me\/[A-Za-z0-9_]{4,}|vk\.(com|ru)\/[A-Za-z0-9_.]+/i;
 function contact(c){c=c.trim();if(NICK.test(c)&&/[A-Za-z]/.test(c))return{handle:c,phone:''};var d=c.replace(/\D/g,'');return d.length>=10&&d.length<=12&&!/[A-Za-zА-Яа-я]/.test(c)?{phone:c,handle:''}:null}
 function bad(f){
  if(!f.checkValidity())return 'Напишите имя, телефон или ник в Telegram и отметьте согласие.';
  if(!contact(f.elements.contact.value))return 'Проверьте контакт: телефон из 10–11 цифр или ник в Telegram, например @anna_study.';
  return '';
 }

 function part(pi){
  var p=T.parts[pi],h=steps()+'<div class="lt-card"><p class="lt-kicker">Часть '+(pi+1)+' из '+T.parts.length+' · '+esc(p.time)+'</p><h2>'+esc(p.title)+'</h2><p class="lt-intro-text">'+esc(p.intro)+'</p>';
  p.tasks.forEach(function(t,ti){h+=task(t,ti)});
  h+='<p class="lt-warn" id="lt-warn" hidden></p><div class="lt-nav">'+(pi>0?'<button class="btn light" type="button" data-go="'+(pi-1)+'">Назад</button>':'')+
   '<button class="btn primary" type="button" data-next>'+(pi===T.parts.length-1?'Узнать результат':'Дальше')+'</button></div></div>';
  root.innerHTML=h;
  root.querySelectorAll('textarea.lt-wr').forEach(count);
  scrollTo({top:root.getBoundingClientRect().top+scrollY-90,behavior:'smooth'});
 }
 function mcItem(it,n,opts,dk){
  var v=st.ans[it.id];
  return '<fieldset class="lt-q"><legend><span class="lt-n">'+n+'</span>'+esc(it.q).replace('___','<span class="lt-blank">_____</span>')+'</legend><div class="lt-opts">'+
   opts.map(function(o,i){return '<label class="lt-opt"><input type="radio" name="'+it.id+'" value="'+i+'"'+(v===i?' checked':'')+'><span>'+esc(o)+'</span></label>'}).join('')+
   (dk?'<label class="lt-opt lt-dk"><input type="radio" name="'+it.id+'" value="-1"'+(v===-1?' checked':'')+'><span>Не знаю</span></label>':'')+'</div></fieldset>';
 }
 function task(t,ti){
  if(t.type==='mc')return t.items.map(function(it,i){return mcItem(it,i+1,it.o,true)}).join('');
  if(t.type==='gap'){
   var html=esc(t.text).replace(/\{(\d+)(?:\|(\p{Lu}+))?\}/gu,function(_,n,base){
    var it=t.items[n-1],v=st.ans[it.id]||'';
    return '<span class="lt-gap"><span class="lt-n">'+n+'</span><input class="lt-in" data-id="'+it.id+'" value="'+esc(v)+'" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Пропуск '+n+(base?', слово '+base:'')+'">'+(base?'<b class="lt-base">'+base+'</b>':'')+'</span>';
   });
   return '<div class="lt-task"><h3>'+esc(t.title)+'</h3><p class="lt-text">'+html+'</p></div>';
  }
  if(t.type==='kwt')return '<div class="lt-task"><h3>'+esc(t.title)+'</h3>'+t.items.map(function(it,i){
   return '<div class="lt-kwt"><p><span class="lt-n">'+(i+1)+'</span>'+esc(it.s)+'</p><p class="lt-key">'+it.key+'</p><p class="lt-kwt-line">'+esc(it.before)+' <input class="lt-in wide" data-id="'+it.id+'" value="'+esc(st.ans[it.id]||'')+'" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Ответ '+(i+1)+'"> '+esc(it.after)+'</p></div>';
  }).join('')+'</div>';
  if(t.type==='reading'){
   var n=0,qs=t.groups.map(function(g){
    if(g.type==='tfn')return '<h3>'+esc(TF.title)+'</h3>'+g.items.map(function(it){return mcItem(it,++n,TFN,false)}).join('');
    return '<h3>Выберите правильный ответ</h3>'+g.items.map(function(it){return mcItem(it,++n,it.o,true)}).join('');
   }).join('');
   return '<div class="lt-read"><article class="lt-article"><h3>'+esc(t.heading)+'</h3>'+t.text.map(function(p){return '<p>'+esc(p)+'</p>'}).join('')+'</article><div>'+qs+'</div></div>';
  }
  if(t.type==='audio'){
   var left=st.plays[t.src]==null?2:st.plays[t.src];
   return '<div class="lt-task lt-audio"><div class="lt-player"><button class="btn secondary" type="button" data-play="'+t.src+'"'+(left?'':' disabled')+'>'+(left?'▶ Слушать':'Прослушано')+'</button><span class="lt-left">'+(left?'осталось прослушиваний: '+left:'больше прослушиваний нет')+'</span><span class="lt-bar"><i></i></span><b>'+esc(t.title)+'</b></div>'+
    t.items.map(function(it,i){return mcItem(it,i+1,it.o,false)}).join('')+'</div>';
  }
  if(t.type==='writing'){
   if(!st.wtask)st.wtask=suggestTask(t);
   var w=t.options.filter(function(o){return o.id===st.wtask})[0]||t.options[0];
   return '<div class="lt-task"><div class="lt-wtabs" role="group" aria-label="Задание">'+t.options.map(function(o){return '<button type="button" class="lt-wtab" data-wtask="'+o.id+'" aria-pressed="'+(o.id===w.id)+'">'+esc(o.label)+'<small>'+o.level+'</small></button>'}).join('')+'</div>'+
    '<div class="lt-wtask" lang="'+LANG+'"><p>'+esc(w.task)+'</p>'+(w.quote?'<blockquote>'+esc(w.quote)+'</blockquote>':'')+'<ul>'+w.points.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div>'+
    '<textarea class="lt-wr" lang="'+LANG+'" spellcheck="false" rows="12" data-min="'+w.min+'" data-max="'+w.max+'" aria-label="Ваш текст">'+esc(st.wtext)+'</textarea><p class="lt-count"></p>'+
    '<details class="lt-check"><summary>Проверьте себя перед отправкой</summary><ul>'+w.check.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></details></div>';
  }
  return '';
 }
 function suggestTask(t){var l=score().lvl;return l==='B2'||l==='C1'?'essay':l==='B1'?'email':'msg'}
 function count(ta){
  var n=words(ta.value),min=+ta.dataset.min,max=+ta.dataset.max,p=ta.nextElementSibling;
  p.textContent=(T.chars?'Иероглифов: ':'Слов: ')+n+' (нужно '+min+'–'+max+')';
  p.className='lt-count'+(n&&n<min*.9?' low':n>max*1.1?' high':n?' good':'');
 }

 function results(){
  var r=score(),L=T.levels[r.lvl],rk=ORDER.indexOf(r.lvl);
  /* шкала A1–C1: пройденные уровни закрашены, ваш — отмечен, «близко» — пунктиром */
  var scale='<ol class="lt-scale'+(lab('A1').length>2?' long':'')+'" aria-label="Шкала уровней">'+ORDER.map(function(l,i){
   var c=i<rk?'past':i===rk?'now':l===r.near?'near':'';
   return '<li class="'+c+'"><i></i><b>'+lab(l)+'</b><span>'+SCALE[l]+'</span>'+(i===rk?'<em>вы здесь</em>':l===r.near?'<em>почти</em>':'')+'</li>';
  }).join('')+'</ol>';
  var bars=ORDER.map(function(l){var b=r.by[l];if(!b)return'';var pc=Math.round(b.ok/b.n*100);return '<li><b>'+lab(l)+'</b><span class="lt-meter"><i style="width:'+pc+'%"'+(b.ok/b.n>=PASS?' class="pass"':'')+'></i></span><span>'+b.ok+' из '+b.n+'</span></li>'}).join('');
  var parts=T.parts.map(function(p,i){var x=r.parts[i];if(!x.n)return'';return '<li><span>'+esc(p.title)+'</span><b>'+x.ok+' / '+x.n+'</b><em class="lt-plvl'+(r.weak.indexOf(i)>=0?' weak':r.strong.indexOf(i)>=0?' strong':'')+'">'+x.label+'</em></li>'}).join('');
  var advice=(r.weak.length?'<p class="lt-advice">📉 Подтянуть в первую очередь: <b>'+r.weak.map(function(i){return esc(T.parts[i].title)+' ('+r.parts[i].label+')'}).join(', ')+'</b>. Здесь результат ниже общего уровня.</p>':'')+
   (r.strong.length?'<p class="lt-advice">📈 Сильная сторона: <b>'+r.strong.map(function(i){return esc(T.parts[i].title)+' ('+r.parts[i].label+')'}).join(', ')+'</b>.</p>':'')+
   (!r.weak.length&&!r.strong.length&&r.lvl!=='A0'?'<p class="lt-advice">⚖️ Все части примерно на одном уровне.</p>':'');
  var wn=words(st.wtext),hasW=T.parts.some(function(p){return p.id==='wr'});
  var wrong=ITEMS.filter(function(it){return !ok(it)});
  root.innerHTML='<div class="lt-card lt-result"><p class="lt-kicker">'+(st.who?esc(st.who.name)+', ваш':'Ваш')+' уровень</p>'+
   '<div class="lt-level"><span'+(lab(r.lvl).length>2?' class="long"':'')+'>'+badge(lab(r.lvl))+'</span><div><h2>'+esc(L.name)+'</h2><p class="lt-score">Верно '+r.ok+' из '+r.n+'</p></div></div>'+
   scale+(r.near?'<p class="lt-near">Близко к '+lab(r.near)+': больше половины заданий этого уровня уже получаются.</p>':'')+'<p class="lt-desc">'+esc(L.text)+'</p></div>'+
   '<div class="lt-card"><h2>Подробно</h2><div class="lt-res-grid"><div><h3>По частям</h3><ul class="lt-parts">'+parts+(hasW?(wn?'<li><span>Письмо</span><b>'+wn+' '+UNIT+' · проверит преподаватель</b></li>':'<li><span>Письмо</span><b>не выполнено</b></li>'):'')+'</ul>'+advice+'</div>'+
   '<div><h3>По уровням</h3><ul class="lt-levels">'+bars+'</ul><p class="lt-small">Уровень засчитан, если верно 60% и больше его заданий. Общий уровень считается по всем частям вместе, уровень части — только по её заданиям.'+(hasW?' Письмо в уровень не входит: его проверяет преподаватель.':'')+'</p></div></div>'+
   '<p class="lt-note">Это ориентир, а не сертификат: онлайн-тест не проверяет говорение'+(hasW?' и не оценивает письмо':'')+'. Точный уровень и план покажет преподаватель на бесплатном пробном занятии.</p>'+
   (wrong.length?'<details class="lt-review"><summary>Посмотреть ошибки ('+wrong.length+')</summary><ol>'+wrong.map(review).join('')+'</ol></details>':'')+
   '</div>'+sendForm()+shareCard(r)+mailForm()+
   '<div class="lt-nav lt-again"><button class="btn light" type="button" data-restart>Пройти тест заново</button></div>';
  if(!st.done){st.done=1;save();if(window.suGoal)window.suGoal('level_test')}
  if(st.who&&!st.sent&&!sending)send(st.who);
  scrollTo({top:root.getBoundingClientRect().top+scrollY-90,behavior:'smooth'});
 }
 /* Блок «Поделиться» (наполняет main.js) и переход в бота: ?start=lt_<язык>_<уровень> */
 function shareCard(r){var gen=String(T.subject||'').toLowerCase().replace(/ий$/,'ого');
  var o={start:'lt_'+LANG+'_'+r.lvl,kicker:'мой результат',title:'Уровень '+gen,big:lab(r.lvl),sub:SCALE[r.lvl]+' · верно '+r.ok+' из '+r.n,text:'Мой уровень '+gen+' — '+lab(r.lvl)+' ('+SCALE[r.lvl]+').'};
  return '<div class="lt-card lt-share" data-share="'+esc(JSON.stringify(o))+'"></div>'}
 function review(it){
  var v=st.ans[it.id],q,your,right;
  if(it.kind==='mc'||it.kind==='tfn'){
   var o=it.kind==='tfn'?TFN:it.o;q=it.q;your=v==null?'нет ответа':v===-1?'не знаю':o[v];right=o[it.a]+(it.kind==='tfn'?' ('+TFN_RU[it.a]+')':'');
  }else{
   q=it.kind==='kwt'?it.s+' → '+it.before+' … '+it.after+' ('+it.key+')':it.task.title+', пропуск '+(+it.id.split('-').pop()+1);your=v?v:'нет ответа';right=it.a[0];
  }
  return '<li><p lang="'+LANG+'">'+esc(q)+'</p><p><span class="lt-bad">'+esc(your)+'</span> → <span class="lt-good">'+esc(right)+'</span></p></li>';
 }
 /* Карточка отправки: результат уходит сам; форма — только если контактов нет (старое прохождение) */
 var sending=false,failed=false;
 function sendForm(){
  if(st.sent)return '<div class="lt-card lt-send"><h2>Результат уже в школе 👌</h2><p>Менеджер свяжется с вами в течение рабочего дня и предложит время бесплатного пробного занятия.'+(words(st.wtext)?' Письмо проверит преподаватель.':'')+'</p></div>';
  if(st.who)return '<div class="lt-card lt-send"><h2>'+(failed?'Не получилось отправить результат':'Отправляем результат в школу…')+'</h2>'+
   (failed?'<p>Проверьте интернет и нажмите кнопку ещё раз.</p><button class="btn primary" type="button" data-resend>Отправить ещё раз</button>':'<p>Это займёт пару секунд.</p>')+'</div>';
  return '<form class="lt-card lt-send" id="lt-send" novalidate><h2>Хотите разбор и план?</h2><p>Отправьте результат'+(words(st.wtext)?' и письмо':'')+' в школу: преподаватель посмотрит ошибки и на бесплатном пробном занятии (30 минут) скажет, с чего начать и сколько времени нужно до вашей цели.</p>'+fields({})+
   '<label class="consent"><input type="checkbox" required><span>Соглашаюсь с <a href="/study-umbrella-site/privacy/">политикой конфиденциальности</a> и даю согласие на обработку персональных данных</span></label>'+
   '<button class="btn primary" type="submit">Отправить результат</button><p class="form-msg" role="status" hidden></p></form>';
 }
 /* Копия результата себе на почту (письмо отправляет таблица школы, Apps Script) */
 function mailForm(){
  if(st.mailed)return '<div class="lt-card lt-mail"><h3>📬 Результат отправлен на '+esc(st.mailed)+'</h3><p class="lt-small">Письмо придёт в течение пары минут. Если его нет — загляните в папку «Спам».</p><button class="btn light" type="button" data-remail>Отправить на другой адрес</button></div>';
  return '<form class="lt-card lt-mail" id="lt-mail" novalidate><h3>📬 Прислать результат на почту</h3><p class="lt-small">Пришлём уровень, баллы по частям'+(words(st.wtext)?' и ваше письмо':'')+', чтобы результат не потерялся.</p>'+
   '<div class="lt-mail-row"><div class="field"><label for="lt-email">Электронная почта</label><input id="lt-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="name@mail.ru" value="'+esc(st.email||'')+'" required></div><button class="btn secondary" type="submit">Отправить</button></div>'+
   '<p class="form-msg" role="status" hidden></p></form>';
 }
 /* Заявка «начал тест» — сразу после анкеты, чтобы школа узнала о человеке, даже если он бросит тест */
 function started(){
  var w=st.who;
  fetch(root.dataset.endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'site_lead',fields:{id:st.lead,name:w.name,phone:w.phone,handle:w.handle,subject:T.subject+' · начал тест',start:'Тест на уровень',page:location.pathname,website:w.website||'',test:'Начал тест на уровень ('+T.subject.toLowerCase()+'), результата пока нет.'}})})
   .then(function(){if(window.suGoal)window.suGoal('test_start')},function(){});
 }
 function send(who){
  var r=score();sending=true;failed=false;
  var fields={id:st.lead||'',name:who.name,phone:who.phone,handle:who.handle,subject:T.subject+' · тест: '+lab(r.lvl)+(r.near?' → '+lab(r.near):'')+' ('+r.ok+'/'+r.n+')',start:'Тест на уровень',page:location.pathname,website:who.website||'',test:summary(r)};
  return fetch(root.dataset.endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'site_lead',fields:fields})})
   .then(function(){sending=false;st.sent=true;save();if(window.suGoal)window.suGoal('lead')},function(){sending=false;failed=true})
   .then(function(){var c=root.querySelector('.lt-send');if(c&&st.step>=T.parts.length)c.outerHTML=sendForm()});
 }
 function summary(r){
  var w=T.parts[T.parts.length-1].tasks[0].options.filter(function(o){return o.id===st.wtask})[0];
  var lines=['Тест на уровень ('+T.subject.toLowerCase()+'): '+lab(r.lvl)+(r.near?', близко к '+lab(r.near):'')+'. Верно '+r.ok+' из '+r.n+'.',
   T.parts.map(function(p,i){return r.parts[i].n?p.title+' '+r.parts[i].ok+'/'+r.parts[i].n+' ('+r.parts[i].label+')':''}).filter(Boolean).join(', ')+'.',
   r.weak.length?'Подтянуть: '+r.weak.map(function(i){return T.parts[i].title}).join(', ')+'.':'',
   'По уровням: '+ORDER.map(function(l){var b=r.by[l];return b?lab(l)+' '+b.ok+'/'+b.n:''}).filter(Boolean).join(', ')+'.'];
  lines=lines.filter(Boolean);
  if(words(st.wtext))lines.push('','Письмо — '+(w?w.label+' ('+w.level+')':'')+', '+UNIT+': '+words(st.wtext)+':',st.wtext.trim());
  else lines.push('Письмо не выполнено.');
  return lines.join('\n');
 }

 /* ---------- события ---------- */
 root.addEventListener('change',function(e){
  var t=e.target;
  if(t.type==='radio'){st.ans[t.name]=+t.value;save()}
 });
 root.addEventListener('input',function(e){
  var t=e.target;
  if(t.dataset.id){st.ans[t.dataset.id]=t.value;save()}
  if(t.classList.contains('lt-wr')){st.wtext=t.value;save();count(t)}
 });
 root.addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  if(b.dataset.go!=null){st.step=+b.dataset.go;save();render()}
  else if(b.hasAttribute('data-next')){
   var p=T.parts[st.step],miss=ITEMS.filter(function(it){return it.part===st.step&&(st.ans[it.id]==null||st.ans[it.id]==='')}).length,w=document.getElementById('lt-warn');
   if(miss&&w.hidden){w.hidden=false;w.textContent='Без ответа: '+miss+'. Их можно оставить — они засчитаются как неверные. Нажмите ещё раз, чтобы идти дальше.';return}
   if(p.id==='wr'&&!words(st.wtext)&&w.hidden){w.hidden=false;w.textContent='Письмо пустое. Можно пропустить его — тогда в результате будет только автоматическая часть. Нажмите ещё раз, чтобы увидеть результат.';return}
   st.step++;save();render();
  }
  else if(b.dataset.wtask){st.wtask=b.dataset.wtask;save();part(st.step)}
  else if(b.dataset.play)play(b);
  else if(b.hasAttribute('data-remail')){st.mailed=null;save();b.closest('.lt-mail').outerHTML=mailForm()}
  else if(b.hasAttribute('data-resend')){b.closest('.lt-send').outerHTML=(failed=false,sendForm());send(st.who)}
  else if(b.hasAttribute('data-restart')){if(!confirm('Начать заново? Ответы этого прохождения сотрутся.'))return;st={step:0,ans:{},plays:{},wtask:null,wtext:'',sent:false,who:st.who,email:st.email,lead:null};save();render()}
 });
 root.addEventListener('submit',function(e){
  var f=e.target;
  if(f.id==='lt-mail'){
   e.preventDefault();var em=f.elements.email.value.trim(),m=f.querySelector('.form-msg'),b=f.querySelector('button');m.hidden=false;
   if(!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(em)){m.textContent='Проверьте адрес почты: например, name@mail.ru.';return}
   var r=score();b.disabled=true;m.textContent='Отправляем…';
   fetch(root.dataset.endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'test_mail',fields:{email:em,name:st.who?st.who.name:'',subject:T.subject+' · '+lab(r.lvl),page:location.origin+location.pathname,test:summary(r)}})})
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
 /* Аудио: два прослушивания, без перемотки */
 var audio=new Audio();audio.preload='none';var cur=null;
 function play(b){
  var src=b.dataset.play,left=st.plays[src]==null?2:st.plays[src];
  if(!left||cur)return;
  cur=b;b.disabled=true;b.textContent='Звучит…';
  var box=b.closest('.lt-player'),bar=box.querySelector('.lt-bar i');
  audio.src=src;audio.currentTime=0;
  audio.play().then(function(){st.plays[src]=left-1;save();box.querySelector('.lt-left').textContent=left-1?'осталось прослушиваний: '+(left-1):'больше прослушиваний нет'})
   .catch(function(){cur=null;b.disabled=false;b.textContent='▶ Слушать';box.querySelector('.lt-left').textContent='Не получилось включить звук. Попробуйте ещё раз.'});
  audio.ontimeupdate=function(){if(audio.duration)bar.style.width=(audio.currentTime/audio.duration*100)+'%'};
  audio.onended=function(){var l=st.plays[src];cur=null;bar.style.width='0';b.disabled=!l;b.textContent=l?'▶ Слушать ещё раз':'Прослушано'};
 }
 render();
})();
