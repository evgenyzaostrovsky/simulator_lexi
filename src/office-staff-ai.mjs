export function clearStrike(a,b,solid){const distance=Math.hypot(a.x-b.x,a.y-b.y),steps=Math.ceil(distance/.12);for(let i=1;i<steps;i++)if(solid(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps))return false;return true;}
export function updateStaff(p,hero,dt,time,solid){
  p.stun=Math.max(0,p.stun-dt);p.running=false;if(p.stun)return;
  const dx=p.x-hero.x,dy=p.y-hero.y,distance=Math.hypot(dx,dy);let angle,speed;
  if(distance<4.8){angle=Math.atan2(dy,dx)+Math.sin(time*3+p.id*2)*.48;const sprint=(time+p.id*2.1)%8<1.2;speed=sprint?3.8:1.65+p.id*.18;}
  else{const hx=p.homeX-p.x,hy=p.homeY-p.y;if(Math.hypot(hx,hy)<.3)return;angle=Math.atan2(hy,hx);speed=.9;}
  const steps=Math.max(1,Math.ceil(speed*dt/.10));
  for(let i=0;i<steps;i++)for(const turn of [0,.65,-.65,1.3,-1.3,Math.PI]){const a=angle+turn,nx=p.x+Math.cos(a)*speed*dt/steps,ny=p.y+Math.sin(a)*speed*dt/steps;if(!solid(nx,ny)){p.face=Math.cos(a)-Math.sin(a)<0?-1:1;p.x=nx;p.y=ny;p.running=true;break;}}
}
