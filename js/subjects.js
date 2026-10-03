'use strict';
window.Survival = {
  defaults: { startDate: '2026-09-10', endDate: '2027-01-31', totalWeeks: 20 },
  mappings: [ {patterns:['SWC3','Software Construction'],subject:'C++'}, {patterns:['MAS3','Mathematik','Mathe'],subject:'Mathematik'}, {patterns:['UX','Usability'],subject:'Usability'} ],
  classify(event, mappings) {
    const text = event.title + ' ' + event.description;
    const match = mappings.find(m => m.patterns.some(p => text.toLocaleLowerCase().includes(p.toLocaleLowerCase())));
    const type = /(?:\b(?:VL|VO|Vorlesung)\b|\d(?:VL|VO)(?=[_\s(]|$))/i.test(event.title) ? 'VL' : /(?:\b(?:UE|Übung|Uebung|Labor|PR)\b|\d(?:UE|PR)(?=[_\s(]|$))/i.test(event.title) ? 'UE' : 'OTHER';
    const code = event.title.match(/([A-Z]{2,5}\d)(?:VL|VO|UE|PR|IL)(?=[_\s(]|$)/i);
    return {...event, subject: match ? match.subject : code ? code[1].toUpperCase() : event.title.replace(/\b(VL|VO|UE|PR|Labor|Übung)\b/gi,'').trim() || 'Sonstiges', type};
  },
  dateKey(date) {return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;},
  time(ms) {return new Date(ms).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});},
  escape(text) {return String(text ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
};
