import {test} from 'node:test';
import assert from 'node:assert/strict';
import {move,blocked,roomAt} from './office3d-controller.mjs';
test('solid wall blocks movement even at large displacement',()=>{const p={x:0,z:0};move(p,10,0,[{x:2,z:-2,w:.2,d:4}]);assert.ok(p.x<1.53);assert.equal(blocked(p.x,p.z,[{x:2,z:-2,w:.2,d:4}]),false);});
test('player slides along wall',()=>{const p={x:0,z:0};move(p,4,3,[{x:2,z:-2,w:.2,d:8}]);assert.ok(p.x<1.53);assert.ok(Math.abs(p.z-3)<.001);});
test('all four office doors allow round trip to corridor',()=>{const walls=[];for(const z of [-2,2])for(const [x,w] of [[-9.6,4.8],[0,9.6],[9.6,4.8]])walls.push({x:x-w/2,z:z-.09,w,d:.18});for(const x of [-6,6])for(const z of [-4,4]){const p={x,z:0};move(p,0,z,walls);assert.ok(Math.abs(p.z-z)<.001);move(p,0,-z,walls);assert.ok(Math.abs(p.z)<.001);}});
test('room names match floor plan',()=>{assert.equal(roomAt(6,4),'Кабинет босса');assert.equal(roomAt(-6,4),'Комната отдыха');assert.equal(roomAt(6,-4),'Переговорная');assert.equal(roomAt(-6,-4),'Рабочий офис');assert.equal(roomAt(6,0),'Коридор');});
