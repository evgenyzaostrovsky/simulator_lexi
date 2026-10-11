import {test} from 'node:test';
import assert from 'node:assert/strict';
import {canHit,MISSING_KEYS,KEY_ROWS,ATTACK_DURATION,IMPACT_TIME} from './office3d-combat.mjs';
const player={x:0,y:0,z:0};
test('strike requires range and facing',()=>{assert.equal(canHit(player,0,{x:0,z:1.4},[]),true);assert.equal(canHit(player,0,{x:0,z:2.5},[]),false);assert.equal(canHit(player,0,{x:0,z:-1},[]),false);assert.equal(canHit(player,Math.PI,{x:0,z:-1},[]),true);});
test('cannot hit through walls or from above',()=>{assert.equal(canHit(player,0,{x:0,z:1.4},[{x:-1,z:.7,w:2,d:.1}]),false);assert.equal(canHit({...player,y:1.5},0,{x:0,z:1.4},[]),false);});
test('requested missing caps exist exactly once in Russian layout',()=>{assert.deepEqual([...MISSING_KEYS],['С','Р','О','Ч','Н','1']);for(const key of MISSING_KEYS)assert.equal([...KEY_ROWS.join('')].filter(k=>k===key).length,1);});
test('a swing has exactly one impact crossing',()=>{let remaining=ATTACK_DURATION,count=0;while(remaining>0){const before=remaining;remaining=Math.max(0,remaining-.016);if(before>ATTACK_DURATION-IMPACT_TIME&&remaining<=ATTACK_DURATION-IMPACT_TIME)count++;}assert.equal(count,1);});
