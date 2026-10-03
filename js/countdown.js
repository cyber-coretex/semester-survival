// Pure functions keep timer calculations independent of the UI.
Survival.dayState = function(events, now) {
  if (!events.length) return {label:'NO UNIVERSITY TODAY.',timer:'ENJOY YOUR FREEDOM.',percent:0};
  const first = Math.min(...events.map(e=>e.start)), last = Math.max(...events.map(e=>e.end));
  const remaining = Math.max(0, (now < first ? first : last) - now);
  const seconds = Math.ceil(remaining/1000);
  return {label:now < first ? 'UNI STARTS IN' : now < last ? 'FREEDOM IN' : 'YOU SURVIVED TODAY.',timer:now >= last ? 'FREEDOM ACHIEVED.' : [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(x=>String(x).padStart(2,'0')).join(':'),percent:Math.max(0,Math.min(100,(now-first)/(last-first)*100)),last};
};
