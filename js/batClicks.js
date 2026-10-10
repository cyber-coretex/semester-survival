'use strict';
(() => {
  const layer=document.createElement('div');
  layer.className='bat-click-layer';layer.setAttribute('aria-hidden','true');
  document.body.append(layer);
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  document.addEventListener('click',event=>{
    if(document.body.dataset.season!=='halloween'||reducedMotion.matches)return;
    // Keyboard-generated clicks start at the activated button instead of (0, 0).
    const bounds=event.target instanceof Element?event.target.getBoundingClientRect():null;
    const x=event.detail===0&&bounds?bounds.left+bounds.width/2:event.clientX;
    const y=event.detail===0&&bounds?bounds.top+bounds.height/2:event.clientY;
    for(let i=0;i<6;i++){
      // Keep rapid clicking from leaving hundreds of animated elements behind.
      while(layer.childElementCount>=60)layer.firstElementChild.remove();
      const bat=document.createElement('span');bat.className='click-bat';bat.textContent='🦇';
      const angle=-Math.PI+Math.random()*Math.PI;
      const distance=100+Math.random()*180;
      bat.style.left=x+'px';bat.style.top=y+'px';
      bat.style.setProperty('--bat-x',Math.cos(angle)*distance+'px');
      bat.style.setProperty('--bat-y',(Math.sin(angle)*distance-45)+'px');
      bat.style.setProperty('--bat-turn',((Math.random()-.5)*90)+'deg');
      bat.style.fontSize=(19+Math.random()*17)+'px';
      bat.style.animationDuration=(650+Math.random()*450)+'ms';
      layer.append(bat);
      bat.addEventListener('animationend',()=>bat.remove(),{once:true});
      setTimeout(()=>bat.remove(),1300);
    }
  });
})();
