import test from 'node:test';
import assert from 'node:assert/strict';

for (const route of ['voice/status', 'voice/turn', 'parent/login', 'parent/logout', 'learning/sync', 'learning/evolve', 'learning/run', 'plans/status', 'plans/import', 'plans/list', 'parent/provision', 'parent/activate', 'parent/device/status', 'parent/device/enable', 'parent/device/revoke']) {
  test(`routed /api/${route} preserves request size protection`, async () => {
    const {default: handler} = await import('../../api/entry.mjs');
    let status;
    const res = {on(){}, status(n){status=n;return this;}, end(){}, json(){}, setHeader(){}};
    await handler({url:`/api/${route}`, method:'POST', headers:{}, body:{text:'a'.repeat(1300001)}},res);
    assert.equal(status,413);
  });
}
test('explicit status route responds without credentials or provider calls', async () => {
  const {default: handler} = await import('../../api/entry.mjs');
  let status, body;
  const res = {on(){}, status(n){status=n;return this;}, json(v){body=v;}, setHeader(){}};
  await handler({url:'/api/entry?route=voice/status', method:'GET', headers:{}, body:{}},res);
  assert.equal(status,200);
  assert.equal(typeof body.available,'boolean');
  assert.equal(body.authenticated,false);
});

for(const url of ['/api/parent/activate','/api/entry?route=parent/activate']) test('activation reaches origin guard: '+url,async()=>{
 const {default:handler}=await import('../../api/entry.mjs');let status,body;
 const res={on(){},status(n){status=n;return this;},json(v){body=v;},setHeader(){}};
 await handler({url,method:'POST',headers:{origin:'https://foreign.invalid'},body:{}},res);
 assert.equal(status,403);assert.equal(body.code,'origin_required');
});
