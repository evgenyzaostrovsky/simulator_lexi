export function blocked(x,z,obstacles,r=.48){
  return obstacles.some(o=>Math.hypot(x-Math.max(o.x,Math.min(x,o.x+o.w)),z-Math.max(o.z,Math.min(z,o.z+o.d)))<r);
}
export function move(position,dx,dz,obstacles){
  const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.15));
  for(let i=0;i<count;i++){
    if(!blocked(position.x+dx/count,position.z,obstacles))position.x+=dx/count;
    if(!blocked(position.x,position.z+dz/count,obstacles))position.z+=dz/count;
  }
}
export function roomAt(x,z){return Math.abs(z)<2?'Коридор':z<0?(x<0?'Рабочий офис':'Переговорная'):(x<0?'Комната отдыха':'Кабинет босса');}
