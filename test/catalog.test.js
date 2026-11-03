import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCar } from '../src/car.js';
import { systems, matchesPart, explosionOffset } from '../src/catalog.js';

const { parts } = createCar();
test('every component has a unique identity and valid system',()=>{
  assert.ok(parts.length > 70);
  assert.equal(new Set(parts.map(p=>p.id)).size,parts.length);
  for(const p of parts){assert.ok(systems.some(s=>s.id===p.system));assert.equal(p.position.length,3);assert.equal(p.explode.length,3);assert.ok(p.group.children.length);p.group.traverse(obj=>{if(obj.isMesh)assert.equal(obj.userData.part,p);});}
});
test('all four wheels have five individually selectable bolts',()=>{
  const bolts=parts.filter(p=>p.system==='fasteners');assert.equal(bolts.length,20);
  for(const corner of ['Front left','Front right','Rear left','Rear right'])assert.equal(bolts.filter(p=>p.name.startsWith(corner)).length,5);
});
test('system and search filters combine and ignore query case',()=>{
  const wheel=parts.find(p=>p.name==='Front left wheel & tire');
  assert.ok(matchesPart(wheel,'all','  WHEEL  '));
  assert.ok(matchesPart(wheel,'brakes','aluminum'));
  assert.ok(!matchesPart(wheel,'body','wheel'));
  assert.ok(!matchesPart(wheel,'all','windshield'));
});
test('explosion preserves assembly at zero, reaches offset at full, and clamps',()=>{
  const p=parts.find(p=>p.name==='Front hood');
  assert.ok(explosionOffset(p,0).every(value => value === 0));
  assert.deepEqual(explosionOffset(p,1),p.explode);
  assert.deepEqual(explosionOffset(p,2),p.explode);
  assert.deepEqual(explosionOffset(p,.5),p.explode.map(v=>v/2));
});
