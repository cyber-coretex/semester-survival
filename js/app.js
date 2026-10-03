'use strict';
(() => {
  const S=Survival,$=id=>document.getElementById(id),key='semester-survival-v1';
  let state={events:[],mappings:S.mappings,config:S.defaults,theme:'auto',filename:''};
  try{const saved=localStorage.getItem(key);if(saved){const parsed=JSON.parse(saved);if(!Array.isArray(parsed.events)||!Array.isArray(parsed.mappings)||!parsed.config)throw Error();state={...state,...parsed};}}catch{$('message').textContent='Gespeicherte Daten konnten nicht gelesen werden. Bitte Kalender neu importieren.';}
  // Import this requested export once, including for an existing installation.
  if(window.SURVIVAL_BUNDLED_ICS && state.bundledVersion!=='levis-corrected-2026-10-03'){
    try{const parsed=S.parseICS(window.SURVIVAL_BUNDLED_ICS,state.config);state={...state,events:parsed.events,filename:'LEVIS Stundenplan (1).ics',bundledVersion:'levis-corrected-2026-10-03'};try{localStorage.setItem(key,JSON.stringify(state));}catch{$('message').textContent='Kalender geladen; Browserspeicher ist nicht verfügbar.';}}catch(err){$('message').textContent='LEVIS-Import: '+err.message;}
  }
  state.group = state.group === '2' ? '2' : '1';
  let events=[],month=new Date(),selected=S.dateKey(new Date()),view='dashboard';month.setDate(1);
  function notify(text){$('message').textContent=text;}
  function save(next){try{localStorage.setItem(key,JSON.stringify(next));state=next;return true;}catch{notify('Speichern nicht möglich. Bitte lokalen HTTP-Server verwenden oder Browserspeicher freigeben.');return false;}}
  function remap(){events=state.events.filter(e=>{const group=e.title.match(/Gr\.?\s*([12])/i);return !state.group||state.group==='all'||!group||group[1]===state.group;}).map(e=>S.classify(e,state.mappings));}
  function dayEvents(day){return events.filter(e=>S.dateKey(new Date(e.start))===day);}
  function eventHTML(list,now){return list.length?list.map(e=>`<div class="event ${e.end<=now?'past':e.start<=now?'active':''}"><span>${e.end<=now?'[x]':e.start<=now?'[&gt;]':'[ ]'}</span><span>${S.time(e.start)}–${S.time(e.end)}</span><div>${S.escape(e.subject)} · ${e.type}<span class="detail">${S.escape(e.title)}${e.location?' · '+S.escape(e.location):''}</span>${e.description?`<details><summary>Beschreibung</summary><span class="detail">${S.escape(e.description)}</span></details>`:''}</div></div>`).join(''):'<p>Keine Lehrveranstaltungen.</p>';}
  function renderCalendar(now){
    $('month-title').textContent=month.toLocaleDateString('de-DE',{month:'long',year:'numeric'});
    const year=month.getFullYear(),mo=month.getMonth(),offset=(month.getDay()+6)%7,total=new Date(year,mo+1,0).getDate();
    let html=['Mo','Di','Mi','Do','Fr','Sa','So'].map(d=>`<div class="weekday">${d}</div>`).join('')+'<div></div>'.repeat(offset);
    for(let d=1;d<=total;d++){const date=S.dateKey(new Date(year,mo,d)),list=dayEvents(date);html+=`<button data-date="${date}" aria-label="${date}, ${list.length} Termine" class="${list.length?'has-events ':''}${date===selected?'selected ':''}${date===S.dateKey(new Date(now))?'today':''}">${d}${list.length?`<small>${list.length} Termine</small>`:''}</button>`;}
    $('month-grid').innerHTML=html;$('selected-date').textContent=new Date(selected+'T12:00:00').toLocaleDateString('de-DE',{dateStyle:'full'});$('selected-events').innerHTML=eventHTML(dayEvents(selected),now);
  }
  function render(now=Date.now()){
    const today=dayEvents(S.dateKey(new Date(now))),day=S.dayState(today,now),stats=S.statistics(events,now);
    S.applyDesign(state.config,state.theme,now);
    $('today').textContent=new Date(now).toLocaleDateString('de-DE',{dateStyle:'full'});
    $('timer-label').textContent=events.length?day.label:'KALENDER IMPORTIEREN';$('timer').textContent=events.length?day.timer:'--:--:--';
    $('timer-note').textContent=events.length?'ANOTHER DAY CLOSER TO FREEDOM.':'Unter Settings deinen Semester-Stundenplan als ICS-Datei importieren.';
    $('day-progress').value=day.percent;$('day-percent').textContent=`${Math.floor(day.percent)}% COMPLETE`;
    // Rebuild only when event status changes, preserving opened descriptions.
    const signature=today.map(e=>e.id+':'+(e.end<=now?'past':e.start<=now?'active':'future')).join('|');
    if($('today-events').dataset.signature!==signature||!$('today-events').innerHTML){$('today-events').innerHTML=eventHTML(today,now);$('today-events').dataset.signature=signature;}
    $('day-end').textContent=day.last?'END OF DAY: '+S.time(day.last):'';
    const percent=stats.total?Math.round(stats.past/stats.total*100):0;$('semester-progress').value=percent;$('semester-total').textContent=`${percent}% · ${stats.past} survived · ${stats.total-stats.past} remaining · ${stats.total} total events`;
    $('subjects').innerHTML=Object.entries(stats.subjects).map(([subject,types])=>`<div class="card"><h3>${S.escape(subject)}</h3>${Object.entries(types).filter(([type,v])=>v.total||type!=='OTHER').map(([type,v])=>`<p><strong>${type}</strong><br>${v.past} / ${v.total} survived<br>${v.total-v.past} remaining</p>`).join('')}</div>`).join('')||'<p>Noch kein Stundenplan importiert.</p>';
    $('stats').innerHTML=`<p>Uni-Tage: ${stats.days} gesamt · ${stats.pastDays} überstanden · ${stats.days-stats.pastDays} verbleibend</p><p>Events: ${stats.total} gesamt · ${stats.past} überstanden · ${stats.total-stats.past} verbleibend</p><div class="table-scroll"><table><thead><tr><th>Fach</th><th>Gesamt</th><th>VL gesamt / übrig</th><th>UE gesamt / übrig</th><th>Sonstige gesamt / übrig</th></tr></thead><tbody>${Object.entries(stats.subjects).map(([subject,t])=>`<tr><td>${S.escape(subject)}</td><td>${Object.values(t).reduce((sum,v)=>sum+v.total,0)}</td>${['VL','UE','OTHER'].map(type=>`<td>${t[type].total} / ${t[type].total-t[type].past}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    if(view==='calendar')renderCalendar(now);
  }
  function form(){ $('start-date').value=state.config.startDate;$('end-date').value=state.config.endDate;$('weeks').value=state.config.totalWeeks;document.querySelectorAll('[name=study-group]').forEach(input=>input.checked=input.value===state.group);$('mapping').value=JSON.stringify(state.mappings,null,2);$('import-info').textContent=state.filename?`${state.filename} · ${state.events.length} Termine gespeichert · ${events.length} nach Gruppenfilter`: 'Kein Kalender gespeichert.';}
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.view;document.querySelectorAll('main > section').forEach(section=>section.hidden=section.id!==view);document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-current',b===button?'page':'false'));render();}));
  document.querySelectorAll('[name=study-group]').forEach(input=>input.addEventListener('change',()=>{
    if(save({...state,group:input.value})){remap();form();$('today-events').dataset.signature='';render();}else{form();}
  }));
  $('file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>10*1024*1024)throw Error('Datei zu groß (maximal 10 MB).');const parsed=S.parseICS(await file.text(),state.config);if(!parsed.events.length)throw Error('Keine zeitgebundenen Lehrveranstaltungen gefunden.');if(save({...state,events:parsed.events,filename:file.name})){remap();$('today-events').dataset.signature='';form();render();notify(`${parsed.events.length} Termine importiert.${parsed.skipped?' '+parsed.skipped+' ganztägige Termine ausgelassen.':''}`);}}catch(err){notify('Import fehlgeschlagen: '+err.message);}finally{e.target.value='';}});
  $('reimport').onclick=()=>$('file').click();
  $('delete').onclick=()=>{if(!confirm('Importierten Kalender und alle Einstellungen löschen?'))return;try{localStorage.removeItem(key);state={events:[],mappings:S.mappings,config:S.defaults,theme:'auto',filename:'',bundleDisabled:true,bundledVersion:'levis-corrected-2026-10-03',group:state.group};localStorage.setItem(key,JSON.stringify(state));remap();form();render();notify('Alle gespeicherten App-Daten gelöscht. Automatischer LEVIS-Import deaktiviert.');}catch{notify('Browserspeicher konnte nicht gelöscht werden.');}};
  $('config-form').onsubmit=e=>{e.preventDefault();try{const mappings=JSON.parse($('mapping').value);if(!Array.isArray(mappings)||mappings.some(m=>typeof m.subject!=='string'||!m.subject.trim()||!Array.isArray(m.patterns)||!m.patterns.length||m.patterns.some(p=>typeof p!=='string'||!p.trim())))throw Error('Mapping benötigt subject und eine Liste nicht leerer patterns.');const config={startDate:$('start-date').value,endDate:$('end-date').value,totalWeeks:Number($('weeks').value)};if(config.endDate<config.startDate)throw Error('Semesterende muss nach Semesterbeginn liegen.');if(save({...state,mappings,config,group:state.group})){remap();form();$('today-events').dataset.signature='';render();notify('Einstellungen gespeichert. Bei geändertem Semesterende unbefristete Serien bitte erneut importieren.');}}catch(err){notify(err.message);}};
  $('prev-month').onclick=()=>{month.setMonth(month.getMonth()-1);renderCalendar(Date.now());};$('next-month').onclick=()=>{month.setMonth(month.getMonth()+1);renderCalendar(Date.now());};
  $('month-grid').onclick=e=>{const b=e.target.closest('[data-date]');if(b){selected=b.dataset.date;renderCalendar(Date.now());}};
  $('meme-board').innerHTML=(window.SURVIVAL_MEMES||[]).length ? window.SURVIVAL_MEMES.map(m=>`<figure><img src="${S.escape(m.file)}" alt="${S.escape(m.caption||'Uni-Meme')}" loading="lazy"><figcaption>${S.escape(m.caption||'')}</figcaption></figure>`).join('') : '<div class="meme-empty">[ hier bald fragwürdige memes ]<br><br>Bilder in den Ordner memes legen und in js/memes.js eintragen.</div>';
  remap();form();render();document.querySelector('[data-view="dashboard"]').setAttribute('aria-current','page');setInterval(()=>render(),1000);
})();
