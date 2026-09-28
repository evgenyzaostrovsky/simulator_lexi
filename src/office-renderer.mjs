import {WIDTH,HEIGHT,platforms} from './office-engine.mjs';
export function createRenderer(canvas){
  const g=canvas.getContext('2d'),w=960,h=540;
  const camera={x:0,y:HEIGHT-h};
  const meme=new Image();meme.src='/rage.png';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rect(x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h);}
  function box(x,y,w,h,color){g.fillStyle=color;g.strokeStyle='#192a30';g.lineWidth=2;g.beginPath();g.roundRect(x,y,w,h,3);g.fill();g.stroke();}
  function text(s,x,y,size=14,color='#d5e6da',align='left'){g.fillStyle=color;g.font=`bold ${size}px sans-serif`;g.textAlign=align;g.fillText(s,x,y);}
  function desk(x,y){
    box(x,y-57,112,9,'#b1946f');rect(x+7,y-48,7,48,'#68665c');rect(x+99,y-48,7,48,'#68665c');
    box(x+27,y-104,47,36,'#34434a');rect(x+32,y-99,37,26,'#74bea9');rect(x+46,y-68,8,11,'#607773');
    rect(x+37,y-91,22,2,'#bee3bf');rect(x+37,y-85,13,2,'#bee3bf');box(x+83,y-75,13,17,'#eadab6');
    box(x+20,y-60,55,4,'#c6c7b3');
  }
  function furniture(x,y,kind){
    if(kind==='cooler'){box(x,y-70,37,70,'#c1cbbf');box(x+6,y-103,25,35,'#6dabc0');rect(x+7,y-47,23,24,'#344f59');rect(x+10,y-46,5,5,'#d65f59');rect(x+24,y-46,5,5,'#70a1cf');}
    if(kind==='printer'){box(x,y-56,68,56,'#7b9390');box(x-4,y-77,76,29,'#b0bfb2');box(x+17,y-94,37,20,'#ece5c9');rect(x+9,y-39,49,11,'#293e47');}
    if(kind==='plant'){box(x,y-24,28,24,'#b68260');for(let i=0;i<5;i++){g.fillStyle=i%2?'#77966a':'#4d7767';g.beginPath();g.ellipse(x+14+Math.sin(i*2)*12,y-43+Math.cos(i*2)*9,9,24,i,0,7);g.fill();}}
  }
  function character(p,hero,time,alpha=1){
    g.save();g.globalAlpha=alpha;g.translate(p.x,p.y);g.scale(p.face||1,1);
    const step=Math.sin(time*19)*Math.min(9,Math.abs(p.vx||0)/28);
    const lean=p.dash>0?.25:p.attack>0?.14:0;g.transform(1,0,-lean,1,0,0);
    g.fillStyle='#06151c55';g.beginPath();g.ellipse(0,0,23,4,0,0,7);g.fill();
    box(-12+step,-21,10,21,'#344553');box(3-step,-21,11,21,'#283d49');
    box(-20,-53,39,35,hero?'#94a652':p.color);
    if(hero){for(let x=-16;x<18;x+=8)rect(x,-51,2,30,'#536d45');for(let y=-47;y<-20;y+=8)rect(-18,y,35,2,'#b7bc76');}
    box(-14,-79,32,30,'#e6b68d');
    g.fillStyle='#554336';g.beginPath();g.ellipse(-5,-78,12,5,-.1,Math.PI,Math.PI*2);g.fill();
    box(15,-67,10,10,'#e6b68d');rect(9,-70,4,4,'#292c29');
    g.strokeStyle='#47362d';g.lineWidth=3;g.beginPath();g.moveTo(3,-74);g.lineTo(15,-71);g.stroke();rect(9,-55,11,2,'#73443b');
    box(-17,-47,11,23,'#e6b68d');
    if(hero){g.save();g.translate(19,-37);g.rotate(p.attack>0?-1.6+(1-p.attack/.24)*2.5:-.45);box(0,-10,58,21,'#dad7bd');for(let x=5;x<54;x+=7)for(let y=-6;y<9;y+=6)rect(x,y,4,3,'#56636a');g.restore();}
    g.restore();
    if(!hero){text(p.done?'✓ ПРИНЯТО':p.panic?'!!!':p.name,p.x,p.y-90,11,p.done?'#94ce96':p.panic?'#ffb466':'#c1cdc1','center');if(p.stun>0)text('✦  ✧',p.x,p.y-107,17,'#ffdb73','center');}
  }
  return function draw(s,dt){
    const tx=Math.max(0,Math.min(WIDTH-w,s.player.x-w*.4));
    const ty=Math.max(0,Math.min(HEIGHT-h,s.player.y-h*.68));
    camera.x+=(tx-camera.x)*(1-Math.exp(-8*dt));camera.y+=(ty-camera.y)*(1-Math.exp(-7*dt));
    const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#102b3b');sky.addColorStop(1,'#304b50');g.fillStyle=sky;g.fillRect(0,0,w,h);
    for(let i=0;i<20;i++){const x=i*100-camera.x*.18;rect(x,110+(i%3)*30,65,430,'#122e3b');for(let y=140;y<h;y+=40)for(let k=0;k<3;k++)rect(x+9+k*18,y,7,13,'#365964');}
    g.save();g.translate(-camera.x+(s.shake>0&&!reduced?(Math.random()-.5)*9:0),-camera.y);
    // Office walls, windows and fluorescent fixtures behind the traversable floors.
    for(let row=0;row<4;row++){
      const floor=1030-row*220;
      for(let x=0;x<WIDTH;x+=260){
        rect(x,floor-217,258,217,row%2?'#29464a':'#304e4e');
        box(x+29,floor-187,151,98,'#142e3c');
        rect(x+34,floor-182,141,88,'#244b5c');
        rect(x+103,floor-185,4,94,'#628280');rect(x+32,floor-132,145,3,'#628280');
        rect(x+37,floor-180,43,86,'#3a67712d');
        rect(x+69,floor-210,95,5,'#d1d5ae');
        const light=g.createLinearGradient(0,floor-205,0,floor);light.addColorStop(0,'#f8e6a215');light.addColorStop(1,'#f8e6a200');g.fillStyle=light;g.fillRect(x+30,floor-205,175,200);
      }
    }
    for(const f of platforms){
      if(f.kind==='desk'){desk(f.x,f.y+57);continue;}
      for(let x=f.x+80;x<f.x+f.w-100;x+=245){
        const overlaps=platforms.some(p=>p.kind==='desk'&&Math.abs(p.y+85-f.y)<1&&x+112>p.x&&x<p.x+p.w);
        if(!overlaps)desk(x,f.y);
      }
      box(f.x,f.y,f.w,22,'#617572');rect(f.x,f.y,f.w,5,'#b2b39b');rect(f.x,f.y+22,f.w,13,'#152d38');
      for(let x=f.x+20;x<f.x+f.w;x+=75)rect(x,f.y+8,28,3,'#3b5456');
    }
    furniture(1810,1030,'printer');furniture(2440,810,'cooler');furniture(740,590,'plant');furniture(1190,370,'plant');
    text('01 / ПРИЁМНАЯ',45,889,17,'#d0c994');text('02 / БУХГАЛТЕРИЯ',940,655,17,'#d0c994');text('03 / РАЗРАБОТКА',1550,443,17,'#d0c994');text('04 / ДИРЕКЦИЯ',1130,215,17,'#d0c994');
    text('↑ ДВОЙНОЙ ПРЫЖОК',160,935,12,'#e7cf8a');
    for(const ghost of s.ghosts)character({...ghost,vx:0,dash:1},true,s.time,ghost.life*.8);
    for(const n of s.staff)character(n,false,s.time);
    character(s.player,true,s.time);
    if(s.player.attack>0){g.save();g.translate(s.player.x,s.player.y-37);g.scale(s.player.face,1);g.strokeStyle='#ffe5a0';g.lineWidth=8;g.shadowColor='#ffb643';g.shadowBlur=12;g.beginPath();g.arc(15,0,78,-1.1,1.1);g.stroke();g.restore();}
    for(const p of s.particles){g.globalAlpha=Math.min(1,p.life*3);rect(p.x,p.y,5,3,p.color);}g.globalAlpha=1;
    g.restore();
    // Compact HUD stays fixed while the camera follows the player.
    box(18,17,206,54,'#142c36');text('ЛЕХА / СРОЧНЫЙ ОТДЕЛ',30,37,11,'#c4cbb4');text(`${s.score} / ${s.staff.length} задач выдано`,30,58,15,'#ffcc75');
    box(18,h-48,238,32,'#142c36');text(s.player.dashCooldown>0?'РЫВОК · перезарядка':'SHIFT · РЫВОК ГОТОВ',30,h-27,11,s.player.dashCooldown>0?'#8fa49f':'#c6dcaa');
    // Floor map, with live player and employee markers.
    box(w-166,18,148,72,'#102833');for(const f of platforms)rect(w-155+f.x/WIDTH*128,26+f.y/HEIGHT*55,Math.max(3,f.w/WIDTH*128),2,'#718e86');
    for(const n of s.staff)rect(w-155+n.x/WIDTH*128,23+n.y/HEIGHT*55,3,3,n.done?'#8dbe8a':'#e7ac72');rect(w-155+s.player.x/WIDTH*128,23+s.player.y/HEIGHT*55,5,5,'#fff2c6');
    if(s.rage>0){
      g.save();g.globalAlpha=Math.min(1,s.rage*3);rect(0,0,w,h,'#df53241c');
      for(let i=0;i<2;i++){g.save();g.translate(i?w-125:125,i?180:155);g.rotate(i?.13:-.13);box(-83,-54,166,137,'#f1dfb5');
        if(meme.complete&&meme.naturalWidth)g.drawImage(meme,0,200,600,300,-78,-3,156,78);
        text('СРОЧНО',0,-30,19,'#c03924','center');text('БЛЕАТЬ!!1',0,-10,17,'#c03924','center');g.restore();}
      g.restore();
    }
    if(s.won){box(w/2-210,90,420,63,'#142c36');text('ДЕДЛАЙН ПОБЕЖДЁН',w/2,119,22,'#ffcf79','center');text('Все сотрудники получили срочные задачи',w/2,141,12,'#cbdeca','center');}
  };
}
