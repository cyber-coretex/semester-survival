'use strict';
(() => {
  const S=Survival,$=id=>document.getElementById(id),key='semester-survival-v1';
  // Only the published source defines calendar, mappings, semester and coffee log.
  // localStorage keeps the visitor's group preference, never a mutable calendar.
  let group='1';
  try{const saved=JSON.parse(localStorage.getItem(key)||'{}');group=saved.group==='2'?'2':'1';}catch{}
  const config={...S.defaults},mappings=S.mappings;
  let rawEvents=[];
  try{rawEvents=S.parseICS(window.SURVIVAL_BUNDLED_ICS,config).events;}catch(err){$('message').textContent='Der veröffentlichte Kalender konnte nicht geladen werden: '+err.message;}
  let events=[],month=new Date(),selected=S.dateKey(new Date()),view='dashboard';month.setDate(1);
  const money=cents=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(cents/100);
  function remap(){events=rawEvents.filter(e=>{const match=e.title.match(/Gr\.?\s*([12])/i);return !match||match[1]===group;}).map(e=>S.classify(e,mappings));}
  function dayEvents(day){return events.filter(e=>S.dateKey(new Date(e.start))===day);}
  function status(event,now){return event.end<=now?'past':event.start<=now?'active':'future';}
  function eventHTML(list,now){return list.length?list.map(e=>`<div class="event ${status(e,now)}"><span>${e.end<=now?'[x]':e.start<=now?'[&gt;]':'[ ]'}</span><span>${S.time(e.start)}–${S.time(e.end)}</span><div>${S.escape(e.subject)} · ${e.type}<span class="detail">${S.escape(e.title)}${e.location?' · '+S.escape(e.location):''}</span>${e.description?`<details data-event-id="${S.escape(e.id)}"><summary>Beschreibung auf / zu</summary><span class="detail">${S.escape(e.description)}</span></details>`:''}</div></div>`).join(''):'<p>Keine Lehrveranstaltungen. Der Server empfiehlt: existieren.</p>';}
  // Update only when event content/status changes, and retain expanded descriptions.
  function renderEvents(container,list,now){
    const signature=JSON.stringify(list.map(e=>[e.id,status(e,now),e.title,e.description,e.location,e.subject,e.type]));
    if(container.dataset.signature===signature)return;
    const open=new Set([...container.querySelectorAll('details[open]')].map(d=>d.dataset.eventId));
    container.innerHTML=eventHTML(list,now);container.dataset.signature=signature;
    container.querySelectorAll('details').forEach(d=>d.open=open.has(d.dataset.eventId));
  }
  function renderCalendar(now){
    $('month-title').textContent=month.toLocaleDateString('de-DE',{month:'long',year:'numeric'});
    const year=month.getFullYear(),mo=month.getMonth(),offset=(month.getDay()+6)%7,total=new Date(year,mo+1,0).getDate();
    const signature=[year,mo,group,selected,S.dateKey(new Date(now))].join('|');
    if($('month-grid').dataset.signature!==signature){
      let html=['Mo','Di','Mi','Do','Fr','Sa','So'].map(d=>`<div class="weekday">${d}</div>`).join('')+'<div></div>'.repeat(offset);
      for(let d=1;d<=total;d++){const date=S.dateKey(new Date(year,mo,d)),list=dayEvents(date);html+=`<button data-date="${date}" aria-label="${date}, ${list.length} Termine" class="${list.length?'has-events ':''}${date===selected?'selected ':''}${date===S.dateKey(new Date(now))?'today':''}">${d}${list.length?`<small>${list.length} Termine</small>`:''}</button>`;}
      $('month-grid').innerHTML=html;$('month-grid').dataset.signature=signature;
    }
    $('selected-date').textContent=new Date(selected+'T12:00:00').toLocaleDateString('de-DE',{dateStyle:'full'});renderEvents($('selected-events'),dayEvents(selected),now);
  }
  function renderCoffee(now){
    const coffee=window.SURVIVAL_COFFEE,c=S.coffeeStatistics(events,config,coffee,now);
    $('coffee-savings').textContent=money(c.savingCents);
    $('coffee-days').textContent=`${c.completedDays} abgeschlossene Uni-Tage in Gruppe ${group}`;
    $('coffee-formula').textContent=`${c.completedDays} × ${money(Math.round(coffee.oldDailyPrice*100))} − ${c.packs} × ${money(Math.round(coffee.packPrice*100))} = ${money(c.savingCents)}`;
    $('coffee-costs').innerHTML=`<p>Früher: <strong>${money(c.formerCostCents)}</strong> pro Person für Kaffee an den vergangenen Uni-Tagen.</p><p>Gemeinschaftskaffee: <strong>${money(c.expenseCents)}</strong> tatsächliche Gesamtausgaben für ${c.packs} Packung(en) à ${coffee.packGrams} g.</p><p>Semester insgesamt: ${c.totalDays} Uni-Tage × ${money(Math.round(coffee.oldDailyPrice*100))} = <strong>${money(c.semesterBaselineCents)}</strong> frühere Kosten pro Person. Künftige Packungen sind noch nicht eingerechnet.</p>`;
    $('coffee-buyers').innerHTML=coffee.purchases.map((p,i)=>`<tr><td>${i+1}</td><td>${S.escape(p.buyer)}</td><td>${p.date?S.escape(new Date(p.date+'T12:00:00').toLocaleDateString('de-DE')):'Noch nicht angegeben'}</td><td>${p.packs} × ${coffee.packGrams} g</td><td>${money(p.packs*Math.round(coffee.packPrice*100))}</td></tr>`).join('');
    const counts=new Map();for(const p of c.purchases)counts.set(p.buyer,(counts.get(p.buyer)||0)+p.packs);
    $('coffee-hall').innerHTML=[...counts].map(([buyer,packs])=>`<span class="buyer-badge">☕ ${S.escape(buyer)} · ${packs} Packung(en)</span>`).join('')||'Noch keine Packung gekauft.';
  }
  function render(now=Date.now()){
    const today=dayEvents(S.dateKey(new Date(now))),day=S.dayState(today,now),stats=S.statistics(events,now);
    S.applyDesign(config,'auto',now);
    const weeks=S.remainingWeeks(events,config,now);
    $('weekends-left').textContent=weeks.weekends;
    $('calendar-weeks-left').textContent=`${weeks.calendarWeeks} Wochen bis Semesterende (${weeks.calendarDays} Tage)`;
    const lesson=S.lessonState(events,now);
    $('lesson-label').textContent=lesson.label;
    const lessonSignature=lesson.label+'|'+lesson.items.map(item=>item.event.id).join('|');
    if($('lesson-timers').dataset.signature!==lessonSignature){
      $('lesson-timers').dataset.signature=lessonSignature;
      $('lesson-timers').innerHTML=lesson.items.length?lesson.items.map(item=>`<div class="lesson-item"><strong class="lesson-time"></strong><span>${S.escape(item.event.subject)} · ${item.event.type} · bis ${S.time(item.event.end)}</span></div>`).join(''):'<p>hirn.exe kann kurz runterfahren.</p>';
    }
    $('lesson-timers').querySelectorAll('.lesson-time').forEach((timer,index)=>timer.textContent=lesson.items[index].timer);
    $('today').textContent=new Date(now).toLocaleDateString('de-DE',{dateStyle:'full'});
    $('timer-label').textContent=events.length?day.label:'KALENDER NICHT VERFÜGBAR';$('timer').textContent=events.length?day.timer:'--:--:--';
    $('timer-note').textContent='BITTE WARTEN. IHRE MOTIVATION WIRD GESUCHT ...';
    $('day-progress').value=day.percent;$('day-percent').textContent=`${Math.floor(day.percent)}% COMPLETE`;
    renderEvents($('today-events'),today,now);$('day-end').textContent=day.last?'END OF DAY: '+S.time(day.last):'';
    const percent=stats.total?Math.round(stats.past/stats.total*100):0;$('semester-progress').value=percent;$('semester-total').textContent=`${percent}% · ${stats.past} survived · ${stats.total-stats.past} remaining · ${stats.total} total events`;
    // Semester numbers only change at event endings or when switching groups.
    const statsSignature=group+'|'+stats.past;
    if($('subjects').dataset.signature!==statsSignature){
      $('subjects').dataset.signature=statsSignature;
      $('subjects').innerHTML=Object.entries(stats.subjects).map(([subject,types])=>`<div class="card"><h3>${S.escape(subject)}</h3>${Object.entries(types).filter(([type,v])=>v.total||type!=='OTHER').map(([type,v])=>`<p><strong>${type}</strong><br>${v.past} / ${v.total} survived<br>${v.total-v.past} remaining</p>`).join('')}</div>`).join('')||'<p>Noch kein veröffentlichter Stundenplan.</p>';
      $('stats').innerHTML=`<p>Uni-Tage: ${stats.days} gesamt · ${stats.pastDays} überstanden · ${stats.days-stats.pastDays} verbleibend</p><p>Events: ${stats.total} gesamt · ${stats.past} überstanden · ${stats.total-stats.past} verbleibend</p><div class="table-scroll"><table><thead><tr><th>Fach</th><th>Gesamt</th><th>VL gesamt / übrig</th><th>UE gesamt / übrig</th><th>Sonstige gesamt / übrig</th></tr></thead><tbody>${Object.entries(stats.subjects).map(([subject,t])=>`<tr><td>${S.escape(subject)}</td><td>${Object.values(t).reduce((sum,v)=>sum+v.total,0)}</td>${['VL','UE','OTHER'].map(type=>`<td>${t[type].total} / ${t[type].total-t[type].past}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    if(view==='calendar')renderCalendar(now);
    if(view==='coffee')renderCoffee(now);
  }
  function syncGroup(){document.querySelectorAll('[name=study-group]').forEach(input=>input.checked=input.value===group);}
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.view;document.querySelectorAll('main > section').forEach(section=>section.hidden=section.id!==view);document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-current',b===button?'page':'false'));render();}));
  document.querySelectorAll('[name=study-group]').forEach(input=>input.addEventListener('change',()=>{
    group=input.value;try{localStorage.setItem(key,JSON.stringify({group}));}catch{$('message').textContent='Gruppenwahl gilt für diesen Besuch; Browserspeicher ist nicht verfügbar.';}remap();syncGroup();render();
  }));
  $('prev-month').onclick=()=>{month.setMonth(month.getMonth()-1);renderCalendar(Date.now());};$('next-month').onclick=()=>{month.setMonth(month.getMonth()+1);renderCalendar(Date.now());};
  $('month-grid').onclick=e=>{const b=e.target.closest('[data-date]');if(b){selected=b.dataset.date;renderCalendar(Date.now());}};
  $('tear-week').addEventListener('click',()=>{
    const sheet=$('tear-week');
    if(sheet.classList.contains('tearing'))return;
    sheet.classList.add('tearing');
    // Cosmetic only: a click never changes the actual remaining weekends.
    setTimeout(()=>sheet.classList.remove('tearing'),650);
  });
  const memes=window.SURVIVAL_MEMES||[];
  $('meme-section').hidden=!memes.length;
  $('meme-board').innerHTML=memes.map(m=>`<figure><img src="${S.escape(m.file)}" alt="Uni-Meme" loading="lazy"></figure>`).join('');
  // Drop legacy editable data so old browser imports cannot override the source.
  try{localStorage.setItem(key,JSON.stringify({group}));}catch{}
  remap();syncGroup();render();document.querySelector('[data-view="dashboard"]').setAttribute('aria-current','page');setInterval(()=>render(),1000);
})();