import test from 'node:test';
import assert from 'node:assert/strict';

for (const route of ['voice/status', 'voice/turn', 'parent/login', 'parent/logout']) {
  test(`explicit /api/${route} preserves request size protection`, async () => {
    const {default: handler} = await import(`../../api/${route}.mjs`);
    let status;
    const res = {on(){}, status(n){status=n;return this;}, end(){}, json(){}, setHeader(){}};
    await handler({url:`/api/${route}`, method:'POST', headers:{}, body:{text:'a'.repeat(1300001)}},res);
    assert.equal(status,413);
  });
}
test('explicit status route responds without credentials or provider calls', async () => {
  const {default: handler} = await import('../../api/voice/status.mjs');
  let status, body;
  const res = {on(){}, status(n){status=n;return this;}, json(v){body=v;}, setHeader(){}};
  await handler({url:'/api/voice/status', method:'GET', headers:{}, body:{}},res);
  assert.equal(status,200);
  assert.equal(typeof body.available,'boolean');
  assert.equal(body.authenticated,false);
});
