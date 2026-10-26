// A short, decorative transition; the existing button still owns navigation.
export function mountWelcomeMagic(root){
 const nav=root?.querySelector('.welcome-picture-links');
 if(!nav)return;
 let busy=false,replay=false;
 nav.addEventListener('click',event=>{
  const button=event.target.closest('.picture-link');
  if(!button||replay)return;
  if(busy){event.preventDefault();event.stopImmediatePropagation();return;}
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!root.querySelector('.welcome-motion input')?.checked)return;
  event.preventDefault();event.stopImmediatePropagation();busy=true;
  const bounds=nav.getBoundingClientRect(),box=button.getBoundingClientRect();
  const dust=document.createElement('span');dust.className='welcome-stardust';dust.setAttribute('aria-hidden','true');
  for(let i=0;i<18;i++){
   const star=document.createElement('i');star.textContent=i%3?'✦':'✧';
   star.style.setProperty('--x',`${box.left-bounds.left+box.width*(i%6+.5)/6}px`);
   star.style.setProperty('--y',`${box.top-bounds.top+box.height*(Math.floor(i/6)+.5)/3}px`);
   star.style.setProperty('--drift',`${(i%5-2)*12}px`);
   star.style.setProperty('--delay',`${i%3*35}ms`);dust.append(star);
  }
  nav.append(dust);
  setTimeout(()=>{
   dust.remove();busy=false;
   if(!button.isConnected||document.hidden)return;
   replay=true;try{button.click();}finally{replay=false;}
  },720);
 },true);
}
