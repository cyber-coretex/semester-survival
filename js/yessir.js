'use strict';
(() => {
  const popup=document.getElementById('yessir-window');
  const close=document.getElementById('yessir-close');
  let reopening=null;
  close.addEventListener('click',()=>{
    if(reopening!==null)return;
    const restoreFocus=document.activeElement===close;
    popup.hidden=true;
    // It actually closes for a moment, then immediately returns. Only one window.
    reopening=setTimeout(()=>{
      popup.hidden=false;
      if(restoreFocus)close.focus({preventScroll:true});
      reopening=null;
    },180);
  });
})();