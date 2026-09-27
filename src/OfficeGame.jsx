import React, {useEffect, useRef, useState} from 'react';
import './game.css';

const W = 960, H = 620;
const furniture = [
  ...[110,360,610].flatMap(x => [150,370].map(y => ({x,y,w:140,h:62,type:'desk'}))),
  {x:815,y:120,w:60,h:70,type:'cooler'}, {x:802,y:355,w:85,h:65,type:'printer'},
  {x:40,y:75,w:38,h:40,type:'plant'}, {x:890,y:520,w:38,h:40,type:'plant'}
];
const homes = [[170,239],[420,239],[670,239],[170,459],[420,459],[670,459],[835,220],[845,455]];
const names = ['Бухгалтер','Дизайнер','Разработчик','Менеджер','Аналитик','Стажёр','У кулера','Печатает'];
const colors = ['#e69555','#79afab','#bfa0c5','#e9bd4c','#779abb','#d87972','#99b55e','#9e94ba'];
const blocked = (x,y,r=17) => x<28 || x>W-28 || y<100 || y>H-28 || furniture.some(o=>x+r>o.x && x-r<o.x+o.w && y+r>o.y && y-r<o.y+o.h);
function move(p,dx,dy) { if(!blocked(p.x+dx,p.y))p.x+=dx; if(!blocked(p.x,p.y+dy))p.y+=dy; }

export default function OfficeGame() {
  const canvas = useRef(null), controls = useRef({keys:new Set(),attack:false,target:null});
  const [score,setScore] = useState(0), [message,setMessage] = useState('Подойди к сотруднику и нажми ПРОБЕЛ');
  const [round,setRound] = useState(0);
  useEffect(()=>{
    setScore(0); setMessage('Подойди к сотруднику и нажми ПРОБЕЛ');
    const c = canvas.current, g = c.getContext('2d'), input = controls.current;
    input.keys.clear(); input.target=null; input.attack=false;
    const player={x:480,y:550,face:1};
    const staff=homes.map(([x,y],i)=>({x,y,hx:x,hy:y,panic:0,stun:0,done:false,color:colors[i],name:names[i]}));
    const meme=new Image(); meme.src='/rage.png';
    let last=0, time=0, swing=0, cooldown=0, rage=0, hits=0, frame;
    function keydown(e){
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyW','KeyA','KeyS','KeyD'].includes(e.code)){
        e.preventDefault();input.keys.add(e.code);input.target=null;
        if(e.code==='Space'&&!e.repeat)input.attack=true;
      }
    }
    const keyup=e=>input.keys.delete(e.code);
    const clear=()=>{input.keys.clear();input.attack=false;last=0;};
    window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',clear);
    const box=(x,y,w,h,fill,stroke='#493e34')=>{g.fillStyle=fill;g.strokeStyle=stroke;g.lineWidth=3;g.beginPath();g.roundRect(x,y,w,h,5);g.fill();g.stroke();};
    const label=(s,x,y,size=14,color='#493e34')=>{g.fillStyle=color;g.font=`bold ${size}px sans-serif`;g.textAlign='center';g.fillText(s,x,y);};
    function person(p,isPlayer){
      g.save();g.translate(p.x,p.y);
      g.fillStyle='#463e3638';g.beginPath();g.ellipse(0,4,23,10,0,0,7);g.fill();
      const bob=isPlayer?Math.sin(time*13)*1.5:Math.sin(time*9+p.hx)*1.5;
      g.translate(0,bob);
      box(-15,-12,12,17,'#554a45');box(3,-12,12,17,'#554a45');
      box(-22,-46,44,36,isPlayer?'#a4b757':p.color);
      if(isPlayer){g.strokeStyle='#657632';g.lineWidth=2;for(let i=-16;i<22;i+=9){g.beginPath();g.moveTo(i,-43);g.lineTo(i,-14);g.stroke();}for(let y=-38;y<-14;y+=9){g.beginPath();g.moveTo(-20,y);g.lineTo(20,y);g.stroke();}}
      box(-17,-73,34,33,'#f0bf90');
      g.fillStyle=isPlayer?'#6c5542':'#5b4338';g.beginPath();g.ellipse(-1,-72,18,7,0,Math.PI,Math.PI*2);g.fill();
      g.fillStyle='#332b26';g.fillRect(-10,-61,4,4);g.fillRect(6,-61,4,4);
      g.strokeStyle='#43352a';g.lineWidth=3;g.beginPath();g.moveTo(-12,-65);g.lineTo(-4,-62);g.moveTo(5,-62);g.lineTo(13,-65);g.stroke();
      label(isPlayer?'⌢':p.panic>0?'o':'−',0,-47,16);
      if(isPlayer){g.save();g.translate(25,-28);g.rotate(swing>0?-1+Math.sin(swing*15)*1.6:.3);box(-3,-9,49,22,'#dedbd0');g.fillStyle='#665e56';for(let x=2;x<43;x+=7)for(let y=-5;y<9;y+=6)g.fillRect(x,y,4,3);g.restore();}
      if(p.stun>0)label('✦  ✧  ✦',0,-86,21,'#f2bd26');
      else if(!isPlayer && p.panic>0)label('!!!',0,-85,20,'#b73728');
      if(p.done)label('✓',24,-65,20,'#287c51');
      label(isPlayer?'ЛЕХА':p.name,0,25,11);
      g.restore();
    }
    function object(o){
      g.fillStyle='#493e342a';g.fillRect(o.x+8,o.y+12,o.w,o.h);
      if(o.type==='desk'){
        box(o.x,o.y,o.w,o.h,'#bd8651');box(o.x,o.y-12,o.w,o.h,'#e2b779');
        box(o.x+44,o.y-42,52,35,'#4d575a');box(o.x+49,o.y-38,42,24,'#9bc7bb');
        box(o.x+58,o.y-7,22,7,'#626b6b');box(o.x+40,o.y+15,60,15,'#e0d9bd');
        box(o.x+112,o.y+8,13,16,'#f7ead4');
      }else if(o.type==='cooler'){box(o.x,o.y,o.w,o.h,'#ece5ce');box(o.x+13,o.y-30,34,43,'#94cadb');box(o.x+12,o.y+23,35,22,'#687e84');label('ВОДА',o.x+30,o.y+64,10);}
      else if(o.type==='printer'){box(o.x,o.y,o.w,o.h,'#979f96');box(o.x+7,o.y-16,o.w-14,39,'#dedfd0');box(o.x+20,o.y-29,45,23,'#fff8e9');box(o.x+15,o.y+32,55,13,'#4f5954');}
      else {box(o.x+6,o.y+7,28,30,'#ba7957');for(let i=0;i<5;i++){g.fillStyle=i%2?'#7d9f54':'#4d7950';g.beginPath();g.ellipse(o.x+20+Math.sin(i*2)*12,o.y-5+Math.cos(i*2)*12,12,22,i,0,7);g.fill();}}
    }
    function tick(now){
      const dt=Math.min((now-(last||now))/1000,.04);last=now;time+=dt;
      cooldown=Math.max(0,cooldown-dt);swing=Math.max(0,swing-dt);rage=Math.max(0,rage-dt);
      let dx=Number(input.keys.has('KeyD')||input.keys.has('ArrowRight'))-Number(input.keys.has('KeyA')||input.keys.has('ArrowLeft'));
      let dy=Number(input.keys.has('KeyS')||input.keys.has('ArrowDown'))-Number(input.keys.has('KeyW')||input.keys.has('ArrowUp'));
      if(input.target&&!dx&&!dy){dx=input.target.x-player.x;dy=input.target.y-player.y;if(Math.hypot(dx,dy)<5){input.target=null;dx=dy=0;}}
      const length=Math.hypot(dx,dy);if(length)move(player,dx/length*205*dt,dy/length*205*dt);
      if(input.attack){input.attack=false;if(!cooldown){cooldown=.65;swing=.4;const victim=staff.filter(p=>p.stun<=0&&Math.hypot(p.x-player.x,p.y-player.y)<88).sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y))[0];if(victim){victim.stun=2;victim.panic=5;rage=1.2;if(!victim.done){victim.done=true;hits++;setScore(hits);}setMessage(hits===8?'Все получили срочную задачу! Офис твой.':`${victim.name}: «Да делаю я уже!»`);}else setMessage('Мимо! Подойди ближе к сотруднику.');}}
      staff.forEach((p,i)=>{p.stun=Math.max(0,p.stun-dt);const distance=Math.hypot(p.x-player.x,p.y-player.y);if(distance<170)p.panic=2.5;else p.panic=Math.max(0,p.panic-dt);if(p.stun)return;
        let ax=p.panic?p.x-player.x:p.hx-p.x,ay=p.panic?p.y-player.y:p.hy-p.y;
        let n=Math.hypot(ax,ay);if(n<3)return;const speed=p.panic?128:45;
        const oldx=p.x,oldy=p.y;move(p,ax/n*speed*dt,ay/n*speed*dt);
        if(Math.hypot(p.x-oldx,p.y-oldy)<speed*dt*.25){const sign=i%2?1:-1;move(p,-ay/n*speed*dt*sign,ax/n*speed*dt*sign);}
      });
      g.clearRect(0,0,W,H);g.fillStyle='#e6d4ad';g.fillRect(0,0,W,H);
      for(let y=90;y<H;y+=42)for(let x=0;x<W;x+=80){g.fillStyle=((x/80+y/42)|0)%2?'#d4c49f':'#e0ceaa';g.fillRect(x,y,79,41);}
      box(0,0,W,86,'#849d8c');box(0,70,W,20,'#53695b');
      [130,420,710].forEach(x=>{box(x,8,115,53,'#e9e5cf');box(x+6,14,103,41,'#acd2d0');g.strokeStyle='#e9e5cf';g.beginPath();g.moveTo(x+58,14);g.lineTo(x+58,55);g.stroke();});
      label('ОТДЕЛ ОЧЕНЬ СРОЧНЫХ ДЕЛ',480,82,12,'#fff2cd');
      if(input.target){g.strokeStyle='#b95336';g.lineWidth=2;g.beginPath();g.ellipse(input.target.x,input.target.y,16,8,0,0,7);g.stroke();}
      [...furniture.map(o=>({y:o.y+o.h,draw:()=>object(o)})),...staff.map(p=>({y:p.y,draw:()=>person(p,false)})),{y:player.y,draw:()=>person(player,true)}].sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
      if(swing>0){g.strokeStyle='#fff0a0';g.lineWidth=7;g.beginPath();g.arc(player.x,player.y-20,64,-1.3,1.2);g.stroke();}
      if(rage>0){g.fillStyle='#c530252f';g.fillRect(0,0,W,H);for(let i=0;i<3;i++){g.save();g.translate(150+i*320,160+(i%2)*210);g.rotate((i-1)*.22);g.globalAlpha=.8;box(-110,-65,220,210,'#fff5db');if(meme.complete&&meme.naturalWidth)g.drawImage(meme,0,200,600,300,-105,5,210,130);label('СРОЧНО',0,-28,26,'#c12d24');label('БЛЕАТЬ!!1',0,0,24,'#c12d24');g.restore();}}
      frame=requestAnimationFrame(tick);
    }
    frame=requestAnimationFrame(tick);
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',clear);};
  },[round]);
  const direction=(code)=>({onPointerDown:e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);controls.current.target=null;controls.current.keys.add(code);},onPointerUp:()=>controls.current.keys.delete(code),onPointerCancel:()=>controls.current.keys.delete(code),onLostPointerCapture:()=>controls.current.keys.delete(code)});
  return <section className="office-game"><div className="game-heading"><div><div className="label">02 / ОФИСНЫЙ ПЕРЕПОЛОХ</div><h2>Дедлайн уже вчера.</h2></div><strong>СРОЧНЫЕ ЗАДАЧИ<br/><b>{score} / 8</b></strong></div><p>WASD / стрелки — ходить · клик по полу — идти · пробел — удар клавиатурой</p><canvas ref={canvas} width={W} height={H} aria-label="Офисная игра. Управляйте Лехой стрелками и нажимайте пробел рядом с сотрудниками." onPointerDown={e=>{const r=e.currentTarget.getBoundingClientRect();controls.current.target={x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}}/><div className="game-controls"><div className="dpad"><button {...direction('ArrowLeft')} aria-label="Влево">←</button><button {...direction('ArrowUp')} aria-label="Вверх">↑</button><button {...direction('ArrowDown')} aria-label="Вниз">↓</button><button {...direction('ArrowRight')} aria-label="Вправо">→</button></div><button className="hit-button" onClick={()=>controls.current.attack=true}>УДАРИТЬ КЛАВОЙ</button><button onClick={()=>setRound(v=>v+1)}>Заново ↻</button></div><p className="game-message" role="status">{message}</p></section>;
}
