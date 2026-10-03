// ICS dates: floating times use the browser zone; UTC and TZID preserve the instant.
Survival.parseICS = function(source, config) {
  const unescape = s => (s||'').replace(/\\n/gi,'\n').replace(/\\([,;\\])/g,'$1');
  const lines = source.replace(/\r\n/g,'\n').replace(/\n[ \t]/g,'').split('\n');
  const records=[]; let record=null;
  for(const line of lines){
    if(line==='BEGIN:VEVENT'){record={};continue;}
    if(line==='END:VEVENT'){if(record)records.push(record);record=null;continue;}
    if(!record)continue;
    const colon=line.indexOf(':');if(colon<0)continue;
    const [name,...params]=line.slice(0,colon).split(';');
    (record[name.toUpperCase()] ||= []).push({value:line.slice(colon+1),params:Object.fromEntries(params.map(p=>{const i=p.indexOf('=');return [p.slice(0,i).toUpperCase(),p.slice(i+1).replace(/^"|"$/g,'')];}))});
  }
  if(!/BEGIN:VCALENDAR/i.test(source)||!records.length)throw Error('Keine VEVENT-Termine in dieser ICS-Datei gefunden.');
  function date(property, value=property.value){
    const m=/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(value);
    if(!m)throw Error('Ungültiges Kalenderdatum: '+value);
    const parts=m.slice(1,7).map(x=>Number(x||0));
    const [y,mo,d,h,mi,s]=parts;
    if(m[7])return new Date(Date.UTC(y,mo-1,d,h,mi,s));
    const tz=property.params.TZID;
    if(!tz)return new Date(y,mo-1,d,h,mi,s);
    let formatter;
    try{formatter=new Intl.DateTimeFormat('en-GB',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});}catch{throw Error('Unbekannte Zeitzone: '+tz+'. Bitte als UTC oder mit IANA-Zeitzone exportieren.');}
    const target=Date.UTC(y,mo-1,d,h,mi,s);let instant=target;
    for(let i=0;i<4;i++){const p=Object.fromEntries(formatter.formatToParts(new Date(instant)).map(x=>[x.type,x.value]));const observed=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);const delta=target-observed;if(!delta)break;instant+=delta;}
    return new Date(instant);
  }
  const events=[],seen=new Set(),overrides=new Map();let skipped=0;
  for(const r of records)if(r['RECURRENCE-ID'])overrides.set((r.UID?.[0].value||'')+'|'+date(r['RECURRENCE-ID'][0]).getTime(),r);
  function add(r,start,end,id){if(r.STATUS?.[0].value==='CANCELLED')return;if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)throw Error('Ungültige Start-/Endzeit: '+(r.SUMMARY?.[0].value||''));if(seen.has(id))return;seen.add(id);events.push({id,title:unescape(r.SUMMARY?.[0].value)||'Ohne Titel',description:unescape(r.DESCRIPTION?.[0].value),location:unescape(r.LOCATION?.[0].value),start,end});if(events.length>30000)throw Error('Kalender ist zu groß (maximal 30.000 Termine).');}
  for(const r of records){
    if(r['RECURRENCE-ID']||r.STATUS?.[0].value==='CANCELLED')continue;
    const sp=r.DTSTART?.[0];if(!sp)continue;
    if(sp.params.VALUE==='DATE'||/^\d{8}$/.test(sp.value)){skipped++;continue;}
    const first=date(sp).getTime(); let duration;
    if(r.DTEND)duration=date(r.DTEND[0]).getTime()-first;
    else if(r.DURATION){const m=/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(r.DURATION[0].value);if(!m)throw Error('Nicht unterstützte Dauer.');duration=((+m[1]||0)*86400+(+m[2]||0)*3600+(+m[3]||0)*60+(+m[4]||0))*1000;}
    else throw Error('Termin ohne Endzeit: '+unescape(r.SUMMARY?.[0].value));
    const uid=r.UID?.[0].value||String(first)+'|'+r.SUMMARY?.[0].value;
    const excluded=new Set((r.EXDATE||[]).flatMap(p=>p.value.split(',').map(v=>date(p,v).getTime())));
    const starts=new Set([first]);
    if(r.RRULE){
      const rule=Object.fromEntries(r.RRULE[0].value.split(';').map(p=>p.split('=')));
      const allowed=['FREQ','INTERVAL','COUNT','UNTIL','BYDAY','BYMONTHDAY','WKST'];
      if(Object.keys(rule).some(k=>!allowed.includes(k))||!['DAILY','WEEKLY','MONTHLY','YEARLY'].includes(rule.FREQ)||rule.BYDAY&&rule.FREQ!=='WEEKLY')throw Error('Diese Wiederholungsregel wird nicht unterstützt: '+r.RRULE[0].value);
      if(rule.BYMONTHDAY&&(rule.FREQ!=='MONTHLY'||rule.BYMONTHDAY.split(',').some(v=>!/^\d+$/.test(v)||+v<1||+v>31)))throw Error('BYMONTHDAY wird nur mit MONTHLY und Tagen 1–31 unterstützt.');
      const interval=Number(rule.INTERVAL||1),count=Number(rule.COUNT||Infinity);
      if(!(interval>=1&&Number.isInteger(interval))||!(count>=1))throw Error('Ungültige Wiederholungsregel.');
      const end=rule.UNTIL?date({value:rule.UNTIL,params:sp.params}).getTime():new Date(config.endDate+'T23:59:59').getTime();
      const raw=/^(\d{4})(\d{2})(\d{2})T(.*)$/.exec(sp.value);
      const base=new Date(Date.UTC(+raw[1],+raw[2]-1,+raw[3]));
      const weekdays=['SU','MO','TU','WE','TH','FR','SA'];
      const bydays=rule.BYDAY?rule.BYDAY.split(','):[weekdays[base.getUTCDay()]];
      if(bydays.some(x=>!weekdays.includes(x)))throw Error('Ungültige Wochentagsregel.');
      const wkst=weekdays.indexOf(rule.WKST||'MO');
      const weekBase=base.getTime()-((base.getUTCDay()-wkst+7)%7)*86400000;
      let generated=1, reached=false;
      for(let n=1;n<=36600&&generated<count;n++){
        const day=new Date(base.getTime()+n*86400000);
        const value=String(day.getUTCFullYear())+String(day.getUTCMonth()+1).padStart(2,'0')+String(day.getUTCDate()).padStart(2,'0')+'T'+raw[4];
        const instant=date(sp,value).getTime();if(instant>end){reached=true;break;}
        const monthDelta=(day.getUTCFullYear()-base.getUTCFullYear())*12+day.getUTCMonth()-base.getUTCMonth();
        const monthDays=rule.BYMONTHDAY?rule.BYMONTHDAY.split(',').map(Number):[base.getUTCDate()];
        const matches=rule.FREQ==='DAILY'?n%interval===0:rule.FREQ==='WEEKLY'?Math.floor((day.getTime()-weekBase)/604800000)%interval===0&&bydays.includes(weekdays[day.getUTCDay()]):rule.FREQ==='MONTHLY'?monthDelta%interval===0&&monthDays.includes(day.getUTCDate()):(day.getUTCFullYear()-base.getUTCFullYear())%interval===0&&day.getUTCMonth()===base.getUTCMonth()&&day.getUTCDate()===base.getUTCDate();
        if(matches){starts.add(instant);generated++;}
      }
      if(!reached&&generated<count)throw Error('Wiederholungszeitraum ist zu groß (maximal 100 Jahre).');
    }
    for(const p of r.RDATE||[])for(const v of p.value.split(','))starts.add(date(p,v).getTime());
    for(const start of starts){const key=uid+'|'+start;const override=overrides.get(key);if(override){if(override.STATUS?.[0].value==='CANCELLED')continue;const os=date(override.DTSTART[0]).getTime();const oe=override.DTEND?date(override.DTEND[0]).getTime():os+duration;add({...r,...override},os,oe,key);}else if(!excluded.has(start))add(r,start,start+duration,key);}
  }
  return {events:events.sort((a,b)=>a.start-b.start),skipped};
};
