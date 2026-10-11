import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createBoar,createEmployee} from './office3d-characters.js';
import {MISSING_KEYS} from './office3d-combat.mjs';

test('volumetric hero has missing switches, finite geometry and animated limbs',()=>{
  // CanvasTexture only needs a canvas handle here; rendering is tested in-browser.
  const original=globalThis.document;
  globalThis.document={createElement:()=>({getContext:()=>({fillText(){}})})};
  try{
    const scene=new T.Scene(),hero=createBoar(scene),missing=[],caps=[];
    let furInstances=0;
    hero.root.traverse(o=>{
      if(o.userData.missingKey)missing.push(o.userData.missingKey);
      if(o.userData.keycap)caps.push(o.userData.keycap);
      if(o.isInstancedMesh)furInstances+=o.count;
      if(o.geometry)assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));
    });
    assert.deepEqual(missing.sort(),[...MISSING_KEYS].sort());
    assert.ok(caps.every(k=>!MISSING_KEYS.has(k)));
    assert.ok(furInstances>10000);
    hero.animate(.5,true,.3);hero.root.updateMatrixWorld(true);
    hero.root.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite)));
  }finally{if(original===undefined)delete globalThis.document;else globalThis.document=original;}
});
test('employee recoils once and recovers from stun',()=>{
  const npc=createEmployee(new T.Scene()),player={x:6,y:0,z:1};
  npc.hit(player,[]);assert.ok(npc.stunned);assert.ok(npc.root.position.z<0);
  npc.update(2,2,player,[]);assert.equal(npc.stunned,false);
});
