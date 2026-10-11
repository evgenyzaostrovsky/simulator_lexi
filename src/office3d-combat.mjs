import {blocked} from './office3d-controller.mjs';

export const ATTACK_DURATION=.55;
export const IMPACT_TIME=.25;
export const MISSING_KEYS=new Set(['С','Р','О','Ч','Н','1']);
export const KEY_ROWS=['Ё1234567890-','ЙЦУКЕНГШЩЗХЪ','ФЫВАПРОЛДЖЭ','ЯЧСМИТЬБЮ'];

export function canHit(attacker,angle,target,obstacles){
  const dx=target.x-attacker.x,dz=target.z-attacker.z,distance=Math.hypot(dx,dz);
  if(distance>1.85||Math.abs((target.y||0)-(attacker.y||0))>1.05)return false;
  if(distance>.001&&(Math.sin(angle)*dx+Math.cos(angle)*dz)/distance<.3)return false;
  // Test the entire strike path so a nearby employee cannot be hit through a wall.
  const steps=Math.max(1,Math.ceil(distance/.06));
  for(let i=1;i<=steps;i++)if(blocked(attacker.x+dx*i/steps,attacker.z+dz*i/steps,obstacles,.025))return false;
  return true;
}
