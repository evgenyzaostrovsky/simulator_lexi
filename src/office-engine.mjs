export const WIDTH = 2600, HEIGHT = 1100;
export const platforms = [
  {x:0,y:1030,w:2600,kind:'floor'},
  {x:80,y:810,w:690,kind:'floor'}, {x:890,y:810,w:740,kind:'floor'}, {x:1760,y:810,w:760,kind:'floor'},
  {x:0,y:590,w:570,kind:'floor'}, {x:700,y:590,w:700,kind:'floor'}, {x:1520,y:590,w:700,kind:'floor'},
  {x:220,y:370,w:730,kind:'floor'}, {x:1080,y:370,w:670,kind:'floor'}, {x:1880,y:370,w:650,kind:'floor'},
  {x:330,y:945,w:130,kind:'desk'}, {x:1150,y:725,w:130,kind:'desk'}, {x:1880,y:505,w:130,kind:'desk'},
];
const roles = ['Стажёр','Менеджер','Бухгалтер','Дизайнер','У кулера','Аналитик','Разработчик','У принтера','Директор'];
const positions = [[520,1030],[2090,1030],[420,810],[1390,810],[2220,810],[300,590],[1150,590],[2080,590],[1480,370]];
export const documents = [[640,1030],[1200,810],[1840,590],[2480,370]];
export const hazards = [{x:790,y:1018,w:92,h:12,type:'spill'},{x:1260,y:798,w:110,h:12,type:'cable'},{x:1860,y:578,w:105,h:12,type:'laser'},{x:1680,y:358,w:105,h:12,type:'laser'}];
export const doors = [{x:780,y:1030,h:150,locked:true},{x:1580,y:810,h:150,locked:true},{x:2380,y:590,h:150,locked:true}];
export const SCREEN_WIDTH = 800;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createGame(){return {
  player:{x:110,y:1030,vx:0,vy:0,face:1,grounded:true,jumps:0,coyote:.1,dash:0,dashCooldown:0,attack:0,attackCooldown:0,drop:0,invuln:0},
  staff:positions.map(([x,y],i)=>({x,y,vx:0,vy:0,face:-1,home:x,floor:y,stun:0,panic:0,done:false,name:roles[i],color:['#d99e59','#9baabd','#c48e94'][i%3]})),
  score:0,documents:documents.map(([x,y],i)=>({x,y,got:false,pulse:i})),keys:0,checkpoints:[110,110,110],checkpoint:0,screen:0,screenTimer:45,hp:3,time:0,rage:0,shake:0,freeze:0,particles:[],ghosts:[],message:'Экран 1: собери документ и найди выход.',won:false
};}
export function physics(p,dt,drop=false){
  const oldY=p.y;p.x=clamp(p.x+p.vx*dt,24,WIDTH-24);p.vy+=1500*dt;p.y+=p.vy*dt;p.grounded=false;
  if(p.vy>=0){
    const land=platforms.filter(f=>p.x+12>f.x&&p.x-12<f.x+f.w&&oldY<=f.y+.5&&p.y>=f.y&&(!drop||f.y===1030)).sort((a,b)=>a.y-b.y)[0];
    if(land){p.y=land.y;p.vy=0;p.grounded=true;p.jumps=0;}
  }
  if(p.y>HEIGHT+100){p.y=1030;p.vy=0;p.grounded=true;p.jumps=0;}
}
function burst(s,x,y,n,color){for(let i=0;i<n;i++)s.particles.push({x,y,vx:(Math.random()-.5)*450,vy:-Math.random()*350,life:.4+Math.random()*.45,color});}
export function updateGame(s,input,dt){
  dt=Math.min(dt,1/30);s.time+=dt;s.rage=Math.max(0,s.rage-dt);s.shake=Math.max(0,s.shake-dt);
  if(s.freeze>0){s.freeze-=dt;return;}
  const p=s.player;
  s.screenTimer=Math.max(0,s.screenTimer-dt);
  const roomStart=s.screen*SCREEN_WIDTH+22,roomEnd=Math.min(WIDTH-22,(s.screen+1)*SCREEN_WIDTH-10);
  if(p.x<roomStart)p.x=roomStart;
  if(s.screenTimer<=0){p.x=roomStart;p.y=platforms.find(f=>f.y===1030)?.y||1030;p.vy=0;p.grounded=true;s.screenTimer=45;s.hp=3;s.message='Время вышло. Начало текущего экрана.';s.shake=.25;}
  for(const k of ['dash','dashCooldown','attack','attackCooldown','drop','coyote'])p[k]=Math.max(0,p[k]-dt);
  if(p.grounded)p.coyote=.1;
  if(input.jump){input.jump=false;if(p.jumps<2){p.vy=-620;p.jumps=p.grounded||p.coyote>0?1:Math.max(1,p.jumps)+1;p.grounded=false;p.coyote=0;burst(s,p.x,p.y,8,'#d5d8bb');}}
  if(input.drop){input.drop=false;p.drop=.25;p.y+=3;p.grounded=false;}
  if(input.dash){input.dash=false;if(!p.dashCooldown){p.dash=.17;p.dashCooldown=.7;}}
  const axis=Number(Boolean(input.right))-Number(Boolean(input.left));
  if(axis)p.face=axis;
  p.vx=p.dash>0?p.face*830:axis*295;
  if(p.dash>0){p.vy=0;s.ghosts.push({x:p.x,y:p.y,face:p.face,life:.22});}
  const previousX=p.x;
  physics(p,dt,p.drop>0);
  if(p.x>roomEnd){
    const needs=s.screen+1;
    if(s.keys>=needs&&s.screen<Math.ceil(WIDTH/SCREEN_WIDTH)-1){s.screen++;s.screenTimer=45;p.x=s.screen*SCREEN_WIDTH+35;s.message=`Экран ${s.screen+1}: документ найден. Ищи следующий выход.`;}
    else {p.x=roomEnd;p.vx=0;s.message=`Выход закрыт. Найди документ ${needs}/4 в этой комнате.`;}
  }
  for(const doc of s.documents){if(!doc.got&&Math.abs(doc.x-p.x)<30&&Math.abs(doc.y-p.y)<55){doc.got=true;s.keys++;s.message=`Документ ${s.keys}/4 забран. Двери ждут пропуск.`;burst(s,doc.x,doc.y-30,12,'#ffe18a');}}
  for(const hazard of hazards){if(Math.abs(p.x-(hazard.x+hazard.w/2))<hazard.w/2+15&&Math.abs(p.y-hazard.y)<34&&p.drop<=0&&p.invuln<=0){p.invuln=1.2;s.hp--;p.vx=-p.face*330;p.vy=-280;s.shake=.25;s.message='Осторожно! Леха потерял HP на опасной зоне.';if(s.hp<=0){p.x=s.checkpoint;p.y=platforms.find(f=>f.y===s.checkpoints[s.checkpoint]?f.y:1030)||1030;p.hp=3;s.hp=3;s.message='Рестарт с чекпоинта. Офис стал ещё злее.';}}}
  p.invuln=Math.max(0,p.invuln||0-dt);
  for(const door of doors)door.locked=s.keys<Math.min(4,doors.indexOf(door)+1);
  const nextCheckpoint=s.keys>1?Math.min(2,Math.floor(s.keys/2)):0;if(nextCheckpoint>s.checkpoint){s.checkpoint=nextCheckpoint;s.checkpoints[nextCheckpoint]=p.x;s.message='Чекпоинт сохранён. Теперь дверь выше открыта.';}
  if(input.attack){input.attack=false;if(!p.attackCooldown){p.attack=.24;p.attackCooldown=.32;
    let hit=false;
    for(const n of s.staff){if(n.stun>0)continue;const dx=n.x-p.x;
      if(Math.abs(dx)<105&&dx*p.face>=-18&&Math.abs(n.y-p.y)<65){
        n.stun=.9;n.vx=p.face*420;n.vy=-230;hit=true;
        if(!n.done){n.done=true;s.score++;}
        burst(s,n.x,n.y-40,22,'#ffd96a');s.message=`${n.name}: «Всё! Уже делаю!»`;
      }
    }
    if(hit){s.freeze=.055;s.shake=.23;s.rage=.8;}else s.message='Подойди ближе и повернись к сотруднику.';
  }}
  for(const n of s.staff){
    n.stun=Math.max(0,n.stun-dt);
    if(n.stun>0)n.vx*=Math.pow(.1,dt);
    else {
      const near=Math.abs(n.y-p.y)<100&&Math.abs(n.x-p.x)<300;
      n.panic=near?2:Math.max(0,n.panic-dt);
      const dir=n.panic?Math.sign(n.x-p.x)||1:Math.abs(n.home-n.x)>20?Math.sign(n.home-n.x):0;
      n.vx=dir*(n.panic?170:35);if(dir)n.face=dir;
      const floor=platforms.find(f=>Math.abs(f.y-n.y)<1&&n.x>=f.x&&n.x<=f.x+f.w);
      if(floor&&(n.x+dir*22<floor.x||n.x+dir*22>floor.x+floor.w))n.vx=0;
    }
    physics(n,dt);
  }
  for(const particle of s.particles){particle.life-=dt;particle.x+=particle.vx*dt;particle.y+=particle.vy*dt;particle.vy+=850*dt;}
  s.particles=s.particles.filter(a=>a.life>0);
  for(const ghost of s.ghosts)ghost.life-=dt;s.ghosts=s.ghosts.filter(a=>a.life>0);
  if(s.score===s.staff.length&&s.keys===s.documents.length){s.won=true;s.message='Все получили срочные задачи. Офис твой!';}
}
