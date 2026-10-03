Survival.applyDesign = function(config, theme, now) {
  // Semester time controls the sunrise; the HTML style stays the same.
  const d = new Date(now), parts = config.startDate.split('-').map(Number);
  const week = Math.max(1,Math.min(config.totalWeeks,Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(parts[0],parts[1]-1,parts[2]))/604800000)+1));
  const start=new Date(config.startDate+'T00:00:00').getTime(),end=new Date(config.endDate+'T23:59:59').getTime();
  const progress=Math.max(0,Math.min(1,(now-start)/Math.max(1,end-start)));
  document.body.className = 'html-style';
  document.documentElement.style.setProperty('--sun-rise',`${-62+progress*122}px`);
  document.getElementById('era').textContent = `Woche ${week} / ${config.totalWeeks} · Die Sonne geht langsam auf.`;
  document.getElementById('sun-caption').textContent=`${Math.round(progress*100)}% der Semesterzeit geschafft. Irgendwann wird alles gut. Vermutlich.`;
};
