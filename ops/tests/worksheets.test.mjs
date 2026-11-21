import test from 'node:test';import assert from 'node:assert/strict';
const {KINDS,SCHOOL_PAGES,isGroup,findGroup,generatePage}=await import('../../src/worksheets.js');
test('les deux feuilles de l’école ont leurs grilles 7×5 comme sur les photos',()=>{
 for(const k of Object.keys(KINDS))for(const g of SCHOOL_PAGES[k]){assert.equal(g.length,7);for(const row of g)assert.equal(row.length,5);}
 assert.equal(SCHOOL_PAGES.doubles[0][0][1],14);assert.equal(SCHOOL_PAGES.doubles[0][0][0],null);assert.equal(SCHOOL_PAGES.doubles[1][6][3],8);assert.equal(SCHOOL_PAGES.doubles[1][6][4],null);
 assert.equal(SCHOOL_PAGES.complements[0][3][0],10);assert.equal(SCHOOL_PAGES.complements[0][2][0],0);assert.equal(SCHOOL_PAGES.complements[1][6][2],9);
});
test('un groupe valide : deux cases qui font 10; trois cases terme, terme, somme',()=>{
 assert.equal(isGroup('complements',[3,7]),true);assert.equal(isGroup('complements',[0,10]),true);assert.equal(isGroup('complements',[5,5]),true);assert.equal(isGroup('complements',[3,6]),false);assert.equal(isGroup('complements',[3,7,0]),false);
 assert.equal(isGroup('doubles',[4,8,4]),true);assert.equal(isGroup('doubles',[9,18,9]),true);assert.equal(isGroup('doubles',[4,4,9]),false);assert.equal(isGroup('doubles',[4,8]),false);assert.equal(isGroup('doubles',[2,4,6]),false);
});
test('les feuilles de doubles de l’école se couvrent entièrement par des trios; toute page fabriquée a des groupes à trouver',()=>{
 for(const g of SCHOOL_PAGES.doubles){let free=g.flat().map((v,i)=>({k:i,v})).filter(c=>c.v!==null),n=0;for(let f;(f=findGroup('doubles',free));){n++;const u=new Set(f.map(x=>x.k));free=free.filter(c=>!u.has(c.k));}assert.equal(free.length,0);assert.equal(n,11);}
 for(const k of Object.keys(KINDS))for(let t=0;t<20;t++){const p=generatePage(k),cells=p.flatMap((g,gi)=>g.flat().map((v,i)=>({k:gi+':'+i,v}))).filter(c=>c.v!==null);assert.equal(p.length,2);assert.ok(findGroup(k,cells));}
});
