import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,updateGame,physics,platforms} from './office-engine.mjs';
const advance=(s,input,n)=>{for(let i=0;i<n;i++)updateGame(s,input,1/60);};
test('double jump reaches and lands on the next office floor',()=>{
  const s=createGame();s.player.x=200;const input={jump:true};advance(s,input,24);input.jump=true;advance(s,input,90);
  assert.equal(s.player.y,810);assert.equal(s.player.grounded,true);
});
test('all four floors can be climbed using double jumps',()=>{
  const s=createGame();s.player.x=400;
  for(const y of [810,590,370]){const input={jump:true};advance(s,input,24);input.jump=true;advance(s,input,90);assert.equal(s.player.y,y);}
});
test('falling at dash speed cannot tunnel through a platform',()=>{
  const p={x:200,y:770,vx:0,vy:2200};physics(p,1/30);assert.equal(p.y,810);assert.equal(p.vy,0);
});
test('attack is directional and each employee counts only once',()=>{
  const s=createGame();s.player.x=480;s.staff[0].x=530;s.player.face=-1;updateGame(s,{attack:true},1/60);assert.equal(s.score,0);
  advance(s,{},30);s.player.face=1;s.staff[0].x=530;updateGame(s,{attack:true},1/60);assert.equal(s.score,1);assert(s.rage>0);assert(s.staff[0].vx>0);
  advance(s,{},100);s.staff[0].x=530;s.staff[0].y=s.player.y;updateGame(s,{attack:true},1/60);assert.equal(s.score,1);
});
test('dash covers distance and has a cooldown',()=>{
  const s=createGame();const x=s.player.x;advance(s,{dash:true},8);assert(s.player.x-x>90);assert(s.player.dashCooldown>0);
});
test('drop passes through upper floors and lands safely',()=>{
  const s=createGame();s.player.x=600;s.player.y=370;advance(s,{drop:true},120);assert.equal(s.player.y,810);
});
