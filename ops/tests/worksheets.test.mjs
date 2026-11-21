import test from 'node:test';import assert from 'node:assert/strict';
const {KINDS,SCHOOL_PAGES,isGroup,findGroup,generatePage}=await import('../../src/worksheets.js');
test('les deux feuilles de l’école ont leurs grilles 7×5 comme sur les photos',()=>{
 for(const k of Object.keys(KINDS))for(const g of SCHOOL_PAGES[k]){assert.equal(g.length,7);for(const row of g)assert.equal(row.length,5);}
 assert.equal(SCHOOL_PAGES.doubles[0][0][1],14);assert.equal(SCHOOL_PAGES.doubles[0][0][0],null);assert.equal(SCHOOL_PAGES.doubles[1][6][3],8);assert.equal(SCHOOL_PAGES.doubles[1][6][4],null);
 assert.equal(SCHOOL_PAGES.complements[0][3][0],10);assert.equal(SCHOOL_PAGES.complements[0][2][0],0);assert.equal(SCHOOL_PAGES.complements[1][6][2],9);
});
test('un groupe valide : 2 chiffres ou plus qui font 10; trois cases terme, terme, somme pour les doubles',()=>{
 for(const g of [[3,7],[0,10],[5,5],[5,3,2],[2,2,6],[1,2,3,4],[3,7,0]])assert.equal(isGroup('complements',g),true,g.join('+'));
 for(const g of [[3,6],[10],[7],[5,3,3],[3,7,1],[],[2,2,2,2,2,0],[2.5,7.5]])assert.equal(isGroup('complements',g),false,g.join('+'));
 assert.equal(isGroup('doubles',[4,8,4]),true);assert.equal(isGroup('doubles',[9,18,9]),true);assert.equal(isGroup('doubles',[4,4,9]),false);assert.equal(isGroup('doubles',[4,8]),false);assert.equal(isGroup('doubles',[2,4,6]),false);
});
test('on trouve toujours un groupe de 2, 3, 4 ou 5 cases qui font 10, et rien quand il n’y en a plus',()=>{
 const c=(...v)=>v.map((x,i)=>({k:i,v:x}));
 {const g=findGroup('complements',c(7,1,3,9));assert.equal(g.length,2,'une paire d’abord');assert.equal(g[0].v+g[1].v,10);}
 assert.equal(findGroup('complements',c(5,3,2,9)).reduce((a,x)=>a+x.v,0),10);assert.equal(findGroup('complements',c(5,3,2,9)).length,3);
 assert.equal(findGroup('complements',c(1,2,3,4)).length,4);assert.equal(findGroup('complements',c(1,1,2,9,9)).length,2,'1 + 9');
 assert.equal(findGroup('complements',c(9,9,9,8)),null);assert.equal(findGroup('complements',c(6)),null);assert.ok(findGroup('complements',c(10,0)));
});
test('les feuilles de doubles de l’école se couvrent entièrement par des trios; toute page fabriquée a des groupes à trouver',()=>{
 for(const g of SCHOOL_PAGES.doubles){let free=g.flat().map((v,i)=>({k:i,v})).filter(c=>c.v!==null),n=0;for(let f;(f=findGroup('doubles',free));){n++;const u=new Set(f.map(x=>x.k));free=free.filter(c=>!u.has(c.k));}assert.equal(free.length,0);assert.equal(n,11);}
 for(const k of Object.keys(KINDS))for(let t=0;t<20;t++){const p=generatePage(k),cells=p.flatMap((g,gi)=>g.flat().map((v,i)=>({k:gi+':'+i,v}))).filter(c=>c.v!==null);assert.equal(p.length,2);assert.ok(findGroup(k,cells));}
});
