import {WIDTH,HEIGHT,platforms,documents,hazards,doors,SCREEN_WIDTH} from './office-engine.mjs';
import {scenery} from './office-scenery.mjs';

const VIEW_W=960,VIEW_H=540,ZOOM=1.16;
const SPRITES=[
  [0,0,384,480],[384,0,384,480],[768,0,352,480],[1120,0,416,480],
  [0,480,384,520],[384,480,384,520],[768,480,352,520],[1120,480,416,520]
];
const load=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(`Не загрузилось изображение: ${src}`));img.src=src;});

export function createRenderer(canvas){
  const g=canvas.getContext('2d'),w=VIEW_W,h=VIEW_H;
  // High-DPI drawing without changing world physics or layout dimensions.
  const ratio=Math.min(window.devicePixelRatio||1,2);
  canvas.width=w*ratio;canvas.height=h*ratio;
  const art=scenery(g),worldW=w/ZOOM,worldH=h/ZOOM;
  const camera={x:0,y:HEIGHT-worldH};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let wall,sprites,meme,ready=false,failed=false;
  load('/rage.png').then(img=>{meme=img;}).catch(()=>{});
  const loaded=Promise.all([load('/art/office-wall.png'),load('/art/characters.png')]).then(images=>{[wall,sprites]=images;ready=true;}).catch(()=>{failed=true;});
  const text=(s,x,y,size=14,color='#eadbbb',align='left')=>{g.fillStyle=color;g.font=`600 ${size}px "Trebuchet MS",sans-serif`;g.textAlign=align;g.fillText(s,x,y);};
  const panel=(x,y,pw,ph)=>{art.shape(x,y,pw,ph,'#233c3cef','#10292aef',5);g.strokeStyle='#e3c89135';g.lineWidth=1;g.strokeRect(x+3,y+3,pw-6,ph-6);};
  let background;
  function buildBackground(){
    background=document.createElement('canvas');background.width=WIDTH;background.height=HEIGHT;
    const b=background.getContext('2d');
    b.fillStyle='#1d3034';b.fillRect(0,0,WIDTH,HEIGHT);
    for(let row=0;row<4;row++){
      const floor=1030-row*220;
      for(let x=0;x<WIDTH;x+=330){
        b.drawImage(wall,x,floor-220,330,220);
        if(row===1){b.fillStyle='#3c654822';b.fillRect(x,floor-220,330,220);}
        if(row===2){b.fillStyle='#1a4d622b';b.fillRect(x,floor-220,330,220);}
      }
      // Deep shadows under ceilings make the traversable floors stand out.
      const grad=b.createLinearGradient(0,floor-220,0,floor);grad.addColorStop(0,'#13232877');grad.addColorStop(.18,'#13232800');grad.addColorStop(.8,'#12262d00');grad.addColorStop(1,'#14272b44');b.fillStyle=grad;b.fillRect(0,floor-220,WIDTH,220);
    }
  }
  function person(p,hero,time,alpha=1,index=0){
    const running=Math.abs(p.vx||0)>45,air=!p.grounded;
    const phase=time*15+index*.9;
    let cell=hero?(p.attack>0?3:running||air?1+(Math.floor(time*10)%2):0):4+index%4;
    const [sx,sy,sw,sh]=SPRITES[cell];
    const fullHeight=hero?121:115,scale=fullHeight/sh,fullWidth=sw*scale;
    const bounce=reduced?0:running&&p.grounded?Math.abs(Math.sin(phase))*4:Math.sin(time*2.6+index)*.7;
    const jumpTilt=hero&&air?Math.max(-.1,Math.min(.1,p.vy*.0002)):0;
    g.save();g.globalAlpha=alpha;
    art.shadow(p.x,p.y+1,hero?24:18);
    g.translate(p.x,p.y-bounce);g.scale(p.face||1,1);
    g.rotate(p.dash>0?.16:p.stun>0?-.16:jumpTilt);
    const squash=hero&&p.attack>0?1.035:1;
    g.scale(squash,1/squash);
    g.drawImage(sprites,sx,sy,sw,sh,-fullWidth*.48,-fullHeight+5,fullWidth,fullHeight);
    g.restore();
    if(!hero&&alpha===1){
      const label=p.done?'✓ ПРИНЯТО':p.panic?'!!!':p.name;
      g.font='600 9px "Trebuchet MS",sans-serif';const lw=g.measureText(label).width+14;
      art.shape(p.x-lw/2,p.y-121,lw,16,'#153332d9','#112b2cdd',3);
      text(label,p.x,p.y-110,9,p.done?'#b6d899':p.panic?'#ffd592':'#e9dec1','center');
      if(p.stun>0){for(let k=0;k<3;k++)text('✦',p.x+Math.cos(time*7+k*2.1)*22,p.y-125+Math.sin(time*7+k*2.1)*5,14,'#ffe7a6','center');}
    }
  }
  function levelObjects(s){
    for(const d of s.documents){if(d.got)continue;const bob=Math.sin(s.time*3+d.pulse)*4;g.save();g.translate(d.x,d.y-42+bob);g.rotate(Math.sin(s.time*2+d.pulse)*.08);art.shape(-16,-21,32,42,'#f1d083','#75533b',3);art.rect(-10,-13,20,2,'#bd6c44');art.rect(-10,-5,14,2,'#bd6c44');art.rect(-10,3,17,2,'#bd6c44');text('!',0,18,18,'#c7462c','center');g.restore();}
    for(const hazard of hazards){g.save();g.translate(hazard.x,hazard.y);if(hazard.type==='spill'){g.fillStyle='#468da070';g.beginPath();g.ellipse(hazard.w/2,0,hazard.w/2,7,0,0,7);g.fill();for(let i=0;i<4;i++)art.rect(15+i*19,-2-(i%2)*4,10,2,'#9ed1c0');}else if(hazard.type==='cable'){art.rect(0,0,hazard.w,5,'#d0a34d');for(let x=8;x<hazard.w;x+=16)art.rect(x,0,6,5,'#4d4135');}else{g.globalAlpha=.65;g.shadowColor='#ee5f4c';g.shadowBlur=12;art.rect(0,-2,hazard.w,4,'#e75a47');g.globalAlpha=1;}g.restore();}
    for(const door of doors){const locked=door.locked;g.save();g.translate(door.x,door.y);art.shape(0,-145,54,145,locked?'#4c3532':'#5f8a6e','#2b2d2b',4);art.shape(9,-132,36,74,locked?'#5a423d':'#87ad8d','#292d2a',2);text(locked?'LOCKED':'OPEN',27,-37,8,locked?'#ffad7e':'#d6efb7','center');if(locked)text('🔒',27,-71,18,'#ffd17c','center');g.restore();}
  }
  function lighting(s){
    g.save();g.globalCompositeOperation='screen';
    for(let x=Math.floor(camera.x/330)*330;x<camera.x+worldW+330;x+=330){
      for(let y=1030;y>=370;y-=220){
        const beam=g.createLinearGradient(x+35,y-200,x+155,y);beam.addColorStop(0,'#ffe8ab14');beam.addColorStop(1,'#ffcd7800');g.fillStyle=beam;g.beginPath();g.moveTo(x+25,y-200);g.lineTo(x+95,y-200);g.lineTo(x+265,y);g.lineTo(x+80,y);g.closePath();g.fill();
      }
    }
    g.restore();
    for(let i=0;i<55;i++){
      const x=(i*137.1+s.time*(3+i%3))%WIDTH,y=170+(i*83.7)%850+(reduced?0:Math.sin(s.time*.6+i)*5);
      if(x<camera.x||x>camera.x+worldW)continue;
      g.globalAlpha=.12+(Math.sin(s.time+i)+1)*.12;art.rect(x,y,i%3===0?1.8:1,1,'#ffe7b2');
    }g.globalAlpha=1;
  }
  function hud(s){
    panel(18,16,240,66);
    // Portrait badge uses the actual hero sprite.
    g.save();g.beginPath();g.arc(48,49,23,0,7);g.clip();art.rect(23,23,50,52,'#816843');g.drawImage(sprites,60,20,240,260,21,19,57,65);g.restore();
    text('ЛЕХА',82,37,13,'#ffe2a3');text('ОТДЕЛ СРОЧНЫХ ЗАДАЧ',82,51,8,'#bdc3ab');
    for(let i=0;i<s.staff.length;i++)art.shape(82+i*17,60,12,5,i<s.score?'#eec071':'#43605b',i<s.score?'#b78947':'#2d4845',1);
    text(`${s.score} / ${s.staff.length}`,244,38,12,'#e9d5a4','right');
    text(`HP ${'♥'.repeat(s.hp)}${'♡'.repeat(3-s.hp)}  •  ДОКУМЕНТЫ ${s.keys}/4`,270,79,10,'#f0d49e');
    panel(w/2-104,16,208,31);text(`ЭКРАН ${s.screen+1}  •  ВРЕМЯ ${Math.ceil(s.screenTimer)}с`,w/2,37,11,s.screenTimer<10?'#ff9d79':'#e8d6a3','center');
    panel(18,h-55,251,37);text('SHIFT',31,h-33,11,'#f0d29b');text(s.player.dashCooldown>0?'ПЕРЕЗАРЯДКА':'РЫВОК ГОТОВ',84,h-33,10,s.player.dashCooldown>0?'#a5af9d':'#c8daa8');
    art.rect(29,h-24,225,2,'#324c48');art.rect(29,h-24,225*Math.max(0,1-s.player.dashCooldown/.7),2,'#d4b879');
    panel(w-180,16,162,82);text('ПЛАН ОФИСА',w-163,31,8,'#b9c3af');
    for(const f of platforms)art.rect(w-166+f.x/WIDTH*130,36+f.y/HEIGHT*48,Math.max(3,f.w/WIDTH*130),2,'#7c9583');
    for(const n of s.staff)art.rect(w-166+n.x/WIDTH*130,33+n.y/HEIGHT*48,3,3,n.done?'#b6cf89':'#e1a26b');
    art.rect(w-166+s.player.x/WIDTH*130,32+s.player.y/HEIGHT*48,5,5,'#fff2cb');
  }
  function draw(s,dt){
    g.setTransform(ratio,0,0,ratio,0,0);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    art.rect(0,0,w,h,'#192e32');
    if(!ready){text(failed?'Не удалось загрузить графику. Обновите страницу.':'ЗАГРУЖАЕМ ОФИС…',w/2,h/2,18,'#eddbb7','center');return;}
    if(!background)buildBackground();
    const tx=Math.max(0,Math.min(WIDTH-worldW,s.screen*SCREEN_WIDTH+(SCREEN_WIDTH-worldW)/2));
    const ty=Math.max(0,Math.min(HEIGHT-worldH,s.player.y-worldH*.72));
    camera.x=tx;camera.y+=(ty-camera.y)*(1-Math.exp(-10*dt));
    g.save();g.scale(ZOOM,ZOOM);g.translate(-camera.x+(s.shake>0&&!reduced?(Math.random()-.5)*7:0),-camera.y);
    g.drawImage(background,0,0);
    for(const f of platforms){
      if(f.x>camera.x+worldW+160||f.x+f.w<camera.x-160)continue;
      if(f.kind==='desk'){art.desk(f.x,f.y+57);continue;}
      for(let x=f.x+100;x<f.x+f.w-130;x+=260){
        if(x<camera.x-160||x>camera.x+worldW+80)continue;
        const overlap=platforms.some(p=>p.kind==='desk'&&Math.abs(p.y+85-f.y)<1&&x+125>p.x&&x<p.x+p.w);
        if(!overlap)art.desk(x,f.y,Math.floor(x/260));
      }
      art.floor(f);
    }
    levelObjects(s);
    art.printer(1810,1030);art.cooler(2430,810);art.plant(745,590);art.plant(1190,370);art.plant(43,1030);art.cabinet(935,810);art.cabinet(1785,810);art.cabinet(1550,590);
    const signs=[[35,1030,'01','ПРИЁМНАЯ'],[920,810,'02','БУХГАЛТЕРИЯ'],[1540,590,'03','РАЗРАБОТКА'],[1110,370,'04','ДИРЕКЦИЯ']];
    for(const [x,y,num,title] of signs){art.shape(x,y-204,150,22,'#304843','#193a38');text(`${num}  /  ${title}`,x+10,y-189,10,'#e7d5a8');}
    for(const ghost of s.ghosts)person({...ghost,vx:300,dash:1,grounded:true},true,s.time,ghost.life*1.5);
    for(let i=0;i<s.staff.length;i++){const n=s.staff[i];if(n.x>camera.x-100&&n.x<camera.x+worldW+100)person(n,false,s.time,1,i);}
    person(s.player,true,s.time);
    if(s.player.attack>0){
      g.save();g.translate(s.player.x,s.player.y-48);g.scale(s.player.face,1);g.globalCompositeOperation='screen';
      const progress=1-s.player.attack/.24;
      for(let k=0;k<3;k++){g.strokeStyle=['#fff7d8','#ffe39e','#e99448'][k];g.lineWidth=7-k*2;g.globalAlpha=(1-progress)*(.9-k*.2);g.shadowColor='#ffd179';g.shadowBlur=9;g.beginPath();g.arc(18,0,74+k*6,-1.35+progress*.8,.8+progress*.8);g.stroke();}g.restore();
    }
    for(const p of s.particles){g.save();g.globalAlpha=Math.min(1,p.life*2);g.translate(p.x,p.y);g.rotate(p.life*8);art.rect(-2,-1,5,3,p.color);g.restore();}
    lighting(s);g.restore();
    const vignette=g.createRadialGradient(w/2,h*.48,170,w/2,h*.48,550);vignette.addColorStop(0,'#071b2200');vignette.addColorStop(1,'#071b2266');g.fillStyle=vignette;g.fillRect(0,0,w,h);
    hud(s);
    if(s.rage>0){
      g.save();g.globalAlpha=Math.min(1,s.rage*3);art.rect(0,0,w,h,'#da612c10');
      for(let i=0;i<2;i++){g.save();g.translate(i?w-112:112,i?210:193);g.rotate(i?.12:-.12);g.shadowColor='#0c1d29';g.shadowBlur=15;art.shape(-76,-55,152,124,'#fff0ce','#c7ab79');g.shadowBlur=0;
        if(meme)g.drawImage(meme,0,200,600,300,-69,-1,138,69);text('СРОЧНО',0,-30,20,'#9c3125','center');text('БЛЕАТЬ!!1',0,-10,16,'#9c3125','center');g.restore();}g.restore();
    }
    if(s.won){panel(w/2-210,95,420,65);text('ДЕДЛАЙН ПОБЕЖДЁН',w/2,125,23,'#f8d99b','center');text('Все сотрудники получили срочные задачи',w/2,146,12,'#d4dec2','center');}
  }
  draw.loaded=loaded;draw.isReady=()=>ready;draw.hasFailed=()=>failed;
  return draw;
}
