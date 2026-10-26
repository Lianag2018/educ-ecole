// The original illustration stays visible until a real frame is playing.
export function mountWelcomeVideo(root){
 const video=root?.querySelector('[data-welcome-video]'),toggle=root?.querySelector('.welcome-motion input');
 if(!video||!toggle)return {destroy(){}};
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 let alive=true;
 const playing=()=>{if(alive)video.classList.add('welcome-video-ready');};
 const failed=()=>{video.classList.remove('welcome-video-ready');video.pause();};
 const update=()=>{
  if(!alive)return;
  if(!toggle.checked||reduce.matches||document.hidden){video.pause();return;}
  video.muted=true;video.play().catch(()=>{});
 };
 video.addEventListener('playing',playing);video.addEventListener('error',failed);
 toggle.addEventListener('change',update);reduce.addEventListener('change',update);document.addEventListener('visibilitychange',update);
 update();
 return {destroy(){alive=false;video.pause();video.removeEventListener('playing',playing);video.removeEventListener('error',failed);toggle.removeEventListener('change',update);reduce.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);video.removeAttribute('src');video.load();}};
}
