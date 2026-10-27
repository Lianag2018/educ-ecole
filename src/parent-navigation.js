const sections=[['week','Cette semaine'],['documents','Devoirs et documents'],['progress','Progrès'],['settings','Réglages et accès']];
export function parentNavigation(){return `<nav class="parent-sections" aria-label="Sections de l’espace parent">${sections.map(([id,label])=>`<button type="button" data-parent-section="${id}" aria-controls="parent-${id}">${label}</button>`).join('')}</nav>`;}
// Keep mounted forms intact when changing sections: no lost file selection,
// interrupted import or discarded draft. Grouping uses explicit semantic tags.
export function mountParentNavigation(root,selected='week',onSelect=()=>{}){
 const host=root.querySelector('.parent');if(!host)return;
 const panels=new Map();
 for(const [id,label] of sections){const panel=document.createElement('section');panel.id='parent-'+id;panel.className='parent-section';panel.setAttribute('aria-label',label);host.append(panel);panels.set(id,panel);}
 for(const node of root.querySelectorAll('[data-parent-group]'))panels.get(node.dataset.parentGroup)?.append(node);
 const login=document.createElement('div');login.className='parent-login-slot';panels.get('settings').append(login);
 const buttons=[...root.querySelectorAll('[data-parent-section]')];
 function show(id){if(!panels.has(id))id='week';for(const [key,panel]of panels)panel.hidden=key!==id;for(const b of buttons){if(b.dataset.parentSection===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}onSelect(id);}
 for(const button of buttons)button.addEventListener('click',()=>show(button.dataset.parentSection));
 show(selected);
}
