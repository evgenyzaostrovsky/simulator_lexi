import React,{useEffect,useRef,useState} from 'react';
import './office-isometric.css';
import {officeDecor} from './office-isometric-decor';
import {drawOfficeRage,RAGE_DURATION} from './office-isometric-rage';
import {SAVE_KEY,freshEconomy,restoreEconomy,quota,rate,status,complete,reward,produce,motivate,claim,upgrade} from './office-economy.mjs';
import OfficePlan from './OfficePlan';
import KeyboardCollection from './KeyboardCollection';
import {drawHeldKeyboard,drawKeyboardImpact} from './office-keyboard-art';
import {updateStaff,clearStrike} from './office-staff-ai.mjs';

const rooms=[{x:5,y:4,label:'ОБЩИЙ , ОТДЕЛ !'},{x:16,y:4,label:'КАБИНЕТ , ЛЕХИ !'},{x:5,y:14,label:'ЗОНА , ОТДЫХА !'},{x:16,y:14,label:'ТИХИЙ , ОФИС !'}];
const desks=[[3,3],[6,3],[3,6],[6,6],[14,3],[17,3],[14,13],[17,13],[14,16],[17,16]];
const walls=[];
for(let y=0;y<18;y++)if(y<7||y>10)walls.push([10,y]);
for(let x=0;x<22;x++)if(![5,6,7,15,16,17].includes(x))walls.push([x,9]);
const solid=(x,y)=>x<.6||y<.6||x>21.4||y>17.4||walls.some(([a,b])=>Math.abs(x-a)<.73&&Math.abs(y-b)<.73)||desks.some(([a,b])=>Math.abs(x-a)<1&&Math.abs(y-b)<.65);
export default function OfficeIsometric(){
  const actions=useRef({});
  const ref=useRef(null),[hud,setHud]=useState({count:0,rage:0,room:'КАБИНЕТ , ЛЕХИ !',round:1,level:0,progress:0,target:120,rate:0,bonus:100,money:0,inOffice:true,ready:false}),[error,setError]=useState('');
  useEffect(()=>{
    const canvas=ref.current,ctx=canvas.getContext('2d'),keys=new Set(),hero={x:16,y:6,z:0,vz:0,face:1,attack:0,dash:0,cool:0};
    let economy=freshEconomy();try{economy=restoreEconomy(JSON.parse(localStorage.getItem(SAVE_KEY)));}catch{}
    const inOffice=()=>hero.x>10.8&&hero.y<8.3;
    const save=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(economy));}catch{setError('Браузер не даёт сохранить прогресс. Не закрывай игру до завершения смены.');}};
    const staff=[[7,4],[4,13],[16,12],[18,15]].map(([x,y],i)=>({x,y,homeX:x,homeY:y,stun:0,done:false,id:i}));
    const images={},particles=[];let running=true,active=false,frame=0,time=0,last=0,impact=false,shake=0,ui=0,rageTime=0;
    const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
    actions.current={claim:()=>{if(claim(economy,inOffice())){save();ui=0;}},upgrade:()=>{if(upgrade(economy,inOffice())){save();ui=0;}}};
    const saveTimer=setInterval(save,2000);
    const meme=new Image();meme.onload=()=>images.rage=meme;meme.src='/rage.png';
    for(const [key,url] of Object.entries({boar:'/art/boar-hero.png',staff:'/art/characters.png',desk:'/art/office-desk-cartoon.png'})){const img=new Image();img.onload=()=>images[key]=img;img.onerror=()=>{if(key!=='desk')setError('Не удалось загрузить персонажей. Обновите страницу.');};img.src=url;}
    const resize=()=>{const r=Math.min(devicePixelRatio||1,1.5);canvas.width=canvas.clientWidth*r;canvas.height=canvas.clientHeight*r;};resize();const observer=new ResizeObserver(resize);observer.observe(canvas);
    const down=e=>{if(document.activeElement!==canvas)return;if(['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight','KeyE'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat)return;
      if(e.code==='KeyE'&&hero.attack<=0){hero.attack=.65;impact=false;}if(e.code==='Space'&&hero.z===0)hero.vz=160;
      if(e.code.startsWith('Shift')&&hero.cool<=0){hero.dash=.18;hero.cool=1.1;}};
    const up=e=>keys.delete(e.code),blur=()=>{keys.clear();active=false;};
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);
    const focus=()=>active=true;canvas.addEventListener('focus',focus);canvas.addEventListener('blur',blur);
    let width=960,height=600,cx=0,cy=0;
    const project=(x,y,z=0)=>[width/2+(x-y)*36-cx,height*.53+(x+y)*18-cy-z];
    function poly(points,fill,stroke){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
    const decor=officeDecor(ctx,project,poly);
    function tile(x,y,color){poly([project(x,y),project(x+1,y),project(x+1,y+1),project(x,y+1)],color,'#ffffff08');}
    function box(x,y,w,d,h,top,side='#242b2e'){const a=project(x,y,h),b=project(x+w,y,h),c=project(x+w,y+d,h),e=project(x,y+d,h);poly([e,c,project(x+w,y+d),project(x,y+d)],side,'#0b1015');poly([b,c,project(x+w,y+d),project(x+w,y)],'#171d24','#0b1015');poly([a,b,c,e],top,'#6f777533');}
    function text(s,x,y,size=12,color='#d1c2a4'){ctx.font=`${size}px Georgia`;ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(s,x,y);}
    function actor(p,isHero){const [x,y]=project(p.x,p.y),img=images[isHero?'boar':'staff'];ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(x,y,24,10,0,0,7);ctx.fill();if(!img)return;
      const moving=isHero?(keys.has('KeyW')||keys.has('KeyS')||keys.has('KeyA')||keys.has('KeyD')):p.running;const cell=isHero?(hero.attack>0?3:moving?1+Math.floor(time*9)%2:0):4+p.id%4;
      const sw=isHero?img.width/2:[384,384,352,416][p.id],sh=isHero?img.height/2:520,sx=isHero?(cell%2)*sw:[0,384,768,1120][p.id],sy=isHero?Math.floor(cell/2)*sh:480;
      const h=isHero?108:97,w=isHero?108:72;ctx.save();ctx.translate(x,y-(p.z||0)-(moving?Math.abs(Math.sin(time*12))*3:0));ctx.scale(isHero?hero.face:1,1);if(p.stun>0)ctx.rotate(-.22);ctx.drawImage(img,sx,sy,sw,sh,-w/2,-h,w,h);if(isHero)drawHeldKeyboard(ctx,economy.level,cell,img,sx,sy,sw,sh,w,h);ctx.restore();
      if(!isHero){const state=status(economy,p.id),color={green:'#3dba59',yellow:'#e7ac25',red:'#df4335'}[state];ctx.fillStyle='#fff4db';ctx.fillRect(x-47,y-123,94,23);ctx.fillStyle=color;ctx.beginPath();ctx.arc(x-37,y-111,5,0,7);ctx.fill();text(`${Math.floor(economy.work[p.id])}/${quota(economy)} · ${rate(economy,p.id).toFixed(1)}/с`,x+7,y-108,10,'#43563f');ctx.fillStyle='#b8ab87';ctx.fillRect(x-32,y-98,64,4);ctx.fillStyle=color;ctx.fillRect(x-32,y-98,64*economy.work[p.id]/quota(economy),4);}
    }
    function burst(x,y){for(let i=0;i<24;i++)particles.push({x,y,z:30+Math.random()*30,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,life:.4+Math.random()*.3});}
    function tick(now){if(!running)return;const dt=Math.min((now-last)/1000||0,.035);last=now;if(!document.hidden)produce(economy,dt);if(!document.hidden&&active){time+=dt;hero.cool=Math.max(0,hero.cool-dt);hero.dash=Math.max(0,hero.dash-dt);hero.attack=Math.max(0,hero.attack-dt);shake=Math.max(0,shake-dt);
      let sx=Number(keys.has('KeyD'))-Number(keys.has('KeyA')),sy=Number(keys.has('KeyS'))-Number(keys.has('KeyW'));let dx=sx+sy,dy=sy-sx,len=Math.hypot(dx,dy);if(hero.dash>0&&!len){dx=hero.face;dy=-hero.face;len=Math.SQRT2;}if(sx)hero.face=Math.sign(sx);if(len){const speed=hero.dash>0?15:3;const steps=5;for(let i=0;i<steps;i++){const nx=hero.x+dx/len*speed*dt/steps,ny=hero.y+dy/len*speed*dt/steps;if(!solid(nx,hero.y))hero.x=nx;if(!solid(hero.x,ny))hero.y=ny;}}
      if(hero.dash>0)particles.push({x:hero.x,y:hero.y,z:5,vx:0,vy:0,life:.3});hero.vz-=430*dt;hero.z=Math.max(0,hero.z+hero.vz*dt);if(!hero.z)hero.vz=0;
      rageTime=Math.max(0,rageTime-dt);
      if(hero.attack>0&&hero.attack<.32&&!impact){impact=true;for(const p of staff)if(Math.hypot(hero.x-p.x,hero.y-p.y)<2.1&&clearStrike(hero,p,solid)&&motivate(economy,p.id)){p.stun=.55;shake=reducedMotion?0:.38;rageTime=RAGE_DURATION;burst(p.x,p.y);}}
      for(const p of staff)updateStaff(p,hero,dt,time,solid);
      for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=50*dt;if(p.life<=0)particles.splice(i,1);}
    }
    width=canvas.clientWidth;height=canvas.clientHeight;ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);ctx.fillStyle='#b7cfbd';ctx.fillRect(0,0,width,height);cx=(hero.x-hero.y)*36;cy=(hero.x+hero.y)*18;ctx.save();if(shake>0)ctx.translate(Math.sin(now)*4,Math.cos(now)*3);
    for(let y=0;y<18;y++)for(let x=0;x<22;x++)decor.floor(x,y);
    poly([project(12,2),project(20,2),project(20,7),project(12,7)],'#b8664977','#f7d88f');
    decor.wall(0,0,false,22,108);decor.wall(0,0,true,18,108);
    for(const x of [2,7,13,18])decor.window(x,0);for(const y of [3,12])decor.window(0,y,true);
    for(const room of rooms){const [x,y]=project(room.x,room.y);const glow=ctx.createRadialGradient(x,y,0,x,y,160);glow.addColorStop(0,'#c0924824');glow.addColorStop(1,'#c0924800');ctx.fillStyle=glow;ctx.fillRect(x-160,y-160,320,320);text(room.label,x,y+35,11,'#d4bd8580');}
    const renderables=walls.map(([x,y])=>({depth:x+y,draw:()=>decor.wall(x,y,x===10,1,42)}));
    desks.forEach(([x,y])=>renderables.push({depth:x+y+.5,draw:()=>{const [a,b]=project(x,y);if(images.desk){ctx.drawImage(images.desk,a-79,b-88,158,105);}else box(x-.8,y-.45,1.6,.9,27,'#d2a066','#a67748');}}));
    for(const [x,y] of [[1,1],[20,1],[1,16],[20,16]])renderables.push({depth:x+y,draw:()=>{box(x,y,.6,.6,17,'#685847');const [a,b]=project(x+.3,y+.3,19);for(let i=0;i<7;i++){ctx.fillStyle=i%2?'#546a53':'#314c41';ctx.beginPath();ctx.ellipse(a+Math.sin(i*2)*12,b-15-Math.cos(i)*8,5,20,Math.sin(i),0,7);ctx.fill();}}});
    renderables.push({depth:22,draw:()=>{const [x,y]=project(18,4,38);ctx.fillStyle='#fff5d9';ctx.fillRect(x-76,y-43,152,52);text('КАБИНЕТ , ЛЕХИ !',x,y-28,12,'#456e51');text(complete(economy)?'ПЛАН ГОТОВ · ПРЕМИЯ !':`ПЛАН: ${Math.floor(economy.work.reduce((a,b)=>a+b,0))}/${quota(economy)*4}`,x,y-9,11,'#ad6333');}});
    for(const p of staff)renderables.push({depth:p.x+p.y,draw:()=>actor(p,false)});renderables.push({depth:hero.x+hero.y,draw:()=>actor(hero,true)});renderables.sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());
    for(const p of particles){const [x,y]=project(p.x,p.y,p.z);ctx.globalAlpha=Math.min(1,p.life*3);ctx.fillStyle=p.life>.2?'#ffbb59':'#d64b24';ctx.beginPath();ctx.arc(x,y,2+p.life*5,0,7);ctx.fill();}ctx.globalAlpha=1;
    if(hero.attack>0){const [x,y]=project(hero.x,hero.y,45);ctx.save();ctx.translate(x,y);ctx.strokeStyle=`rgba(255,204,123,${Math.sin(hero.attack/.65*Math.PI)})`;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,0,65,30,-.4,Math.PI*.1,Math.PI*1.1);ctx.stroke();ctx.restore();}
    ctx.restore();
    if(hero.attack>0){const [x,y]=project(hero.x,hero.y,45);drawKeyboardImpact(ctx,x,y,economy.level,hero.attack);}
    drawOfficeRage(ctx,width,height,rageTime,images.rage,reducedMotion);
    if(!active){ctx.fillStyle='#fff8e6e8';ctx.fillRect(width/2-215,height-65,430,42);text('НАЖМИ НА ОФИС, ЧТОБЫ ИГРАТЬ',width/2,height-38,16,'#4c6352');}
    if(now-ui>150){ui=now;setHud({count:staff.filter(p=>status(economy,p.id)==='green').length,rage:hero.cool,room:rooms[(hero.y>9?2:0)+(hero.x>10?1:0)].label,round:economy.round,level:economy.level,progress:economy.work.reduce((a,b)=>a+b,0),target:quota(economy)*4,rate:staff.reduce((a,p)=>a+(economy.work[p.id]<quota(economy)?rate(economy,p.id):0),0),bonus:reward(economy),money:economy.money,inOffice:inOffice(),ready:complete(economy)});}frame=requestAnimationFrame(tick);}
    frame=requestAnimationFrame(tick);return()=>{running=false;save();clearInterval(saveTimer);actions.current={};cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);canvas.removeEventListener('focus',focus);canvas.removeEventListener('blur',blur);};
  },[]);
  return <section className="iso-game"><div className="iso-heading"><span>ОФИСНЫЙ МАЙНЕР · СМЕНА {hud.round}</span><h2>ПЛАН , ГОРИТ !</h2><p>{hud.room}</p></div>
    <OfficePlan hud={hud} onClaim={()=>actions.current.claim?.()} onUpgrade={()=>actions.current.upgrade?.()}/>
    <KeyboardCollection level={hud.level}/>
    <div className="iso-viewport"><canvas ref={ref} tabIndex={0} aria-label="Изометрический офис. Нажмите для управления WASD."/>{error&&<p role="alert">{error}</p>}<div className="iso-quest"><small>ОБЩИЙ ПЛАН</small><b>{hud.ready?'План выполнен! Забери премию в кабинете':'Ускоряй отстающих сотрудников'}</b><span>{Math.floor(hud.progress)} / {hud.target} · 🟢 {hud.count} / 4</span><span>⌨ Ур. {hud.level+1} · {hud.money} ₽</span></div></div>
    <div className="iso-hud"><div className="iso-orb">ЛЁХА<small>ЯРОСТЬ</small></div><div className="iso-controls"><span><kbd>W A S D</kbd> движение</span><span><kbd>E</kbd> мотивировать</span><span><kbd>Пробел</kbd> прыжок</span><span><kbd>Shift</kbd> {hud.rage>0?'восстановление':'огненный рывок'}</span></div><div className="iso-seal">{Math.floor(hud.progress/hud.target*100)}<small>ПЛАН %</small></div></div><p className="plan-save">Автосохранение в этом браузере · Выработка идёт, пока вкладка видна. Офлайн-доход пока не начисляется.</p></section>;
}
