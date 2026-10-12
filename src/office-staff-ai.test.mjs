import test from 'node:test';import assert from 'node:assert/strict';import {updateStaff,clearStrike} from './office-staff-ai.mjs';
const blocked=(x,y)=>x<0||y<0||x>10||y>10||(x>5&&x<6&&y<8);
test('staff flee, steer around obstacles and remain inside the office',()=>{const p={x:4,y:4,homeX:4,homeY:4,id:1,stun:0};for(let i=0;i<600;i++){updateStaff(p,{x:p.x-.4,y:p.y},1/60,i/60,blocked);assert.ok(!blocked(p.x,p.y));}assert.ok(p.running);});
test('stun gives a catch window and walls block strikes',()=>{const p={x:4,y:4,homeX:4,homeY:4,id:0,stun:.5};updateStaff(p,{x:3,y:4},.1,0,blocked);assert.equal(p.x,4);assert.equal(clearStrike({x:4,y:4},{x:7,y:4},blocked),false);assert.equal(clearStrike({x:3,y:4},{x:4,y:4},blocked),true);});
