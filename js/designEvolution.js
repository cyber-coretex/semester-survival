Survival.seasonForDate = function(now) {
  const date=new Date(now),month=date.getMonth()+1,day=date.getDate();
  if(month===10&&day<31)return 'halloween';
  if(month===11||(month===10&&day===31))return 'prechristmas';
  if(month===12)return 'christmas';
  return 'normal';
};
Survival.applyDesign = function(config, theme, now) {
  // Semester time controls the sunrise; the HTML style stays the same.
  const d = new Date(now), parts = config.startDate.split('-').map(Number);
  const week = Math.max(1,Math.min(config.totalWeeks,Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(parts[0],parts[1]-1,parts[2]))/604800000)+1));
  const start=new Date(config.startDate+'T00:00:00').getTime(),end=new Date(config.endDate+'T23:59:59').getTime();
  const progress=Math.max(0,Math.min(1,(now-start)/Math.max(1,end-start)));
  document.body.className = 'html-style';
  const style=document.documentElement.style;
  const blend=(a,b)=>'rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*progress)).join(',')+')';
  style.setProperty('--sun-rise',`${-65+progress*255}px`);
  style.setProperty('--forest-sky-top',blend([5,8,25],[95,180,239]));
  style.setProperty('--forest-sky-bottom',blend([28,18,41],[255,218,139]));
  style.setProperty('--forest-back',blend([15,21,29],[72,139,112]));
  style.setProperty('--forest-front',blend([5,13,16],[24,88,52]));
  style.setProperty('--forest-ground',blend([6,12,17],[68,141,65]));
  style.setProperty('--forest-night',String(Math.pow(1-progress,2)*.55));
  style.setProperty('--forest-stars',String(Math.max(0,1-progress*1.5)));
  style.setProperty('--forest-flowers',String(progress*progress));
  style.setProperty('--forest-glow',String(.1+progress*.8));
  const season=Survival.seasonForDate(now);
  if(document.body.dataset.season!==season){
    document.body.dataset.season=season;
    const decorations={halloween:'🕸️ 🦇 🎃 👻 🎃 🦇 🕸️',prechristmas:'🌲 🕯️ ✨ 🎀 ✨ 🕯️ 🌲',christmas:'🎄 🎁 ❄️ 🎅 ❄️ 🎁 🎄',normal:'✦ ✧ ✦'};
    document.getElementById('season-decoration').textContent=decorations[season];
  }
  document.getElementById('era').textContent = `Woche ${week} / ${config.totalWeeks} · Die Sonne geht langsam auf.`;
  document.getElementById('sun-caption').textContent=`${Math.round(progress*100)}% der Semesterzeit geschafft. Irgendwann wird alles gut. Vermutlich.`;
};
