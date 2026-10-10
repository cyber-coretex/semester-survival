'use strict';
// Only the repository owner edits this list and publishes it with git push.
// Example: {title:'Raumwechsel',text:'...',date:'2026-10-10',important:true}
window.SURVIVAL_NEWS = [
  { title: 'Kurztest C/C++', text: 'C/C++-Kurztest am 17.10.2026.', date: '2026-10-17', important: true },
  { title: 'Kurztest Java', text: 'Java-Kurztest am 07.11.2026.', date: '2026-11-07', important: true }
];
(() => {
  const panel=document.getElementById('breaking-news');
  const content=document.getElementById('news-items');
  const messages=window.SURVIVAL_NEWS;
  content.innerHTML=messages.length?messages.map(n=>`<div class="news-item ${n.important?'important':''}"><strong>${Survival.escape(n.title)}</strong>${n.date?`<time>${Survival.escape(n.date)}</time>`:''}<p>${Survival.escape(n.text)}</p></div>`).join(''):'<p>Keine aktuellen Meldungen.</p>';
  document.getElementById('news-toggle').addEventListener('click',()=>{
    const collapsed=panel.classList.toggle('collapsed');
    content.hidden=collapsed;
    document.getElementById('news-toggle').textContent=collapsed?'+':'−';
    document.getElementById('news-toggle').setAttribute('aria-expanded',String(!collapsed));
  });
})();
