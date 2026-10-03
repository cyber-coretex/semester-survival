'use strict';
// Owner-maintained shared purchase log. Edit this file and publish the change.
// Date is optional: Cyber's actual purchase date has not been provided.
window.SURVIVAL_COFFEE = {
  oldDailyPrice: 3.80,
  packGrams: 250,
  packPrice: 9,
  purchases: [{ buyer: 'cyber', date: null, packs: 1 }]
};

Survival.coffeeStatistics = function(events, config, coffee, now) {
  const first=new Date(config.startDate+'T00:00:00').getTime();
  const last=new Date(config.endDate+'T23:59:59').getTime();
  const days=new Map();
  for(const event of events){if(event.start<first||event.start>last)continue;const key=Survival.dateKey(new Date(event.start));days.set(key,Math.max(days.get(key)||0,event.end));}
  const completedDays=[...days.values()].filter(end=>end<=now).length;
  // Future-dated purchases do not count as already incurred costs.
  const purchases=coffee.purchases.filter(p=>!p.date||new Date(p.date+'T00:00:00').getTime()<=now);
  const packs=purchases.reduce((sum,p)=>sum+p.packs,0);
  const formerCostCents=Math.round(coffee.oldDailyPrice*100)*completedDays;
  const expenseCents=Math.round(coffee.packPrice*100)*packs;
  return {completedDays,totalDays:days.size,packs,purchases,formerCostCents,expenseCents,savingCents:formerCostCents-expenseCents,semesterBaselineCents:days.size*Math.round(coffee.oldDailyPrice*100)};
};
