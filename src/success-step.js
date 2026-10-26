// Independent of voice availability; never advance a hidden page.
export function scheduleSuccess(next,{delay=4000,set=setTimeout,clear=clearTimeout,hidden=()=>document.hidden}={}){
 let active=true;
 const timer=set(()=>{if(!active)return;active=false;if(!hidden())next();},delay);
 return ()=>{active=false;clear(timer);};
}
