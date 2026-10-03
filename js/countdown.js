// Pure functions keep timer calculations independent of the UI.
Survival.dayState = function(events, now) {
  if (!events.length) return {label:'NO UNIVERSITY TODAY.',timer:'ENJOY YOUR FREEDOM.',percent:0};
  const first = Math.min(...events.map(e=>e.start)), last = Math.max(...events.map(e=>e.end));
  const remaining = Math.max(0, (now < first ? first : last) - now);
  const seconds = Math.ceil(remaining/1000);
  return {label:now < first ? 'UNI STARTS IN' : now < last ? 'FREEDOM IN' : 'YOU SURVIVED TODAY.',timer:now >= last ? 'FREEDOM ACHIEVED.' : [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(x=>String(x).padStart(2,'0')).join(':'),percent:Math.max(0,Math.min(100,(now-first)/(last-first)*100)),last};
};

Survival.duration = function(ms) {
  const seconds=Math.ceil(Math.max(0,ms)/1000);
  return [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':');
};

Survival.lessonState = function(events, now) {
  const active=events.filter(e=>e.start<=now&&e.end>now).sort((a,b)=>a.end-b.end);
  if(active.length)return {label:'AKTUELLE STUNDE ENDET IN',items:active.map(e=>({event:e,timer:Survival.duration(e.end-now)}))};
  const today=Survival.dateKey(new Date(now));
  const next=events.filter(e=>e.start>now&&Survival.dateKey(new Date(e.start))===today).sort((a,b)=>a.start-b.start)[0];
  if(next)return {label:'NÄCHSTE STUNDE STARTET IN',items:[{event:next,timer:Survival.duration(next.start-now)}]};
  return {label:'AKTUELL KEINE STUNDE',items:[]};
};

Survival.remainingWeeks = function(events, config, now) {
  const start=new Date(config.startDate+'T00:00:00').getTime();
  const end=new Date(config.endDate+'T23:59:59.999').getTime();
  const days=new Set();
  // Uni weekend = Friday through Sunday. Group by Friday, not each event/day.
  for(const event of events){
    if(event.start<start||event.start>end||event.end<=now)continue;
    const local=new Date(event.start),weekday=local.getDay();
    if(![5,6,0].includes(weekday))continue;
    const friday=new Date(Date.UTC(local.getFullYear(),local.getMonth(),local.getDate()-(weekday===0?2:weekday-5)));
    days.add(friday.toISOString().slice(0,10));
  }
  const dayStamp=ms=>{const d=new Date(ms);return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate());};
  const calendarDays=now>end?0:Math.max(0,(dayStamp(end)-dayStamp(Math.max(start,now)))/86400000+1);
  return {weekends:days.size,calendarWeeks:Math.ceil(calendarDays/7),calendarDays};
};
