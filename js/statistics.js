Survival.statistics = function(events, now) {
  const subjects = {}, days = new Map();
  for (const e of events) {
    if (!subjects[e.subject]) subjects[e.subject] = {VL:{total:0,past:0},UE:{total:0,past:0},OTHER:{total:0,past:0}};
    const bucket = subjects[e.subject][e.type]; bucket.total++; if (e.end <= now) bucket.past++;
    const key = Survival.dateKey(new Date(e.start));
    days.set(key, Math.max(days.get(key)||0,e.end));
  }
  return {subjects,total:events.length,past:events.filter(e=>e.end<=now).length,days:days.size,pastDays:[...days.values()].filter(end=>end<=now).length};
};
