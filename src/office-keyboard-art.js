export const KEYBOARD_STYLES=[
  {body:'#c9b589',edge:'#766546',key:'#f1e0b8',accent:'#796b52'},
  {body:'#284759',edge:'#122d3b',key:'#9ae4e1',accent:'#39d5ee'},
  {body:'#8b9396',edge:'#353e48',key:'#303b49',accent:'#f3a642'},
  {body:'#d8ab43',edge:'#825525',key:'#fff0bc',accent:'#a83532'},
  {body:'#652b35',edge:'#251c2d',key:'#f4984b',accent:'#ffe077'},
];
export function drawKeyboard(ctx,level){
  const s=KEYBOARD_STYLES[level]||KEYBOARD_STYLES[0];ctx.save();
  if(level>=2){
    ctx.shadowColor=s.accent;ctx.shadowBlur=level===4?20:8;
    ctx.fillStyle=s.edge;ctx.fillRect(-8,-6,196,94);ctx.shadowBlur=0;
    for(const x of [-9,178]){ctx.fillStyle=level===2?'#627483':level===3?'#e0b34d':'#341e2f';ctx.fillRect(x,-6,11,94);
      for(let y=2;y<80;y+=24){ctx.fillStyle=level===3?'#ffe59a':s.accent;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(x<0?-12:23),y+8);ctx.lineTo(x+11,y+17);ctx.closePath();ctx.fill();}}
  }
  ctx.fillStyle=s.edge;ctx.fillRect(-3,-3,186,88);ctx.fillStyle=s.body;ctx.fillRect(0,0,180,80);
  const shine=ctx.createLinearGradient(0,0,0,80);shine.addColorStop(0,'#ffffff50');shine.addColorStop(.5,'#ffffff00');shine.addColorStop(1,'#00000025');ctx.fillStyle=shine;ctx.fillRect(0,0,180,80);
  for(let r=0;r<4;r++)for(let c=0;c<12;c++){
    const missing=level===0&&[[0,0],[1,5],[2,6],[2,7],[3,2],[3,3]].some(([a,b])=>a===r&&b===c);
    ctx.fillStyle=s.edge;ctx.fillRect(7+c*13.8,7+r*14,12,12);ctx.fillStyle=missing?'#493f32':s.key;ctx.fillRect(8+c*13.8,7+r*14,10,9);
    if(!missing){ctx.fillStyle=level===2?'#ecbf70':'#63564688';ctx.fillRect(10+c*13.8,9+r*14,3,1);}
  }
  ctx.fillStyle=s.key;ctx.fillRect(45,66,78,8);
  if(level>0){ctx.fillStyle=s.accent;ctx.fillRect(5,77,170,3);}
  if(level===2){for(const x of [2,172])for(const y of [2,70]){ctx.fillStyle='#d4e0e3';ctx.fillRect(x,y,6,6);ctx.fillStyle='#576474';ctx.fillRect(x+2,y+2,2,2);}}
  if(level===3){ctx.fillStyle='#b32d31';ctx.fillRect(157,61,14,13);ctx.fillStyle='#ffeaa5';ctx.font='bold 12px serif';ctx.fillText('♛',157,72);}
  if(level===4){ctx.fillStyle=s.accent;for(const x of [0,173]){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+4,-10);ctx.lineTo(x+8,0);ctx.fill();}ctx.fillStyle='#ff5937';ctx.fillRect(5,61,30,12);}
  if(level===3){ctx.fillStyle='#eac15f';ctx.beginPath();ctx.moveTo(55,0);ctx.lineTo(50,-17);ctx.lineTo(74,-8);ctx.lineTo(90,-25);ctx.lineTo(106,-8);ctx.lineTo(130,-17);ctx.lineTo(125,0);ctx.fill();ctx.fillStyle='#ce3b35';ctx.beginPath();ctx.arc(90,-8,5,0,7);ctx.fill();}
  if(level===4){
    for(let i=0;i<9;i++){const x=10+i*20;ctx.fillStyle=i%2?'#ff672f':'#ffb840';ctx.beginPath();ctx.moveTo(x-7,-3);ctx.quadraticCurveTo(x-12,-14,x+3,-31-i%3*5);ctx.quadraticCurveTo(x-1,-12,x+10,-3);ctx.fill();}
    ctx.strokeStyle='#ffeaa0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(12,76);ctx.lineTo(46,68);ctx.lineTo(61,76);ctx.lineTo(94,65);ctx.lineTo(109,75);ctx.lineTo(163,66);ctx.stroke();
  }
  ctx.restore();
}
// Pose anchors in a 640px sprite cell. Hand masks retain the original grip.
const poses=[
 {a:[340,291],b:[518,279],c:[352,378],hands:[[[308,315],[369,321],[403,355],[385,397],[330,384]],[[510,316],[545,312],[549,381],[487,385],[490,352]]]},
 {a:[379,290],b:[562,306],c:[378,375],hands:[[[340,323],[402,325],[433,362],[415,398],[352,384]],[[559,322],[592,335],[592,389],[535,388],[534,363]]]},
 {a:[417,247],b:[591,282],c:[412,331],hands:[[[362,273],[419,289],[465,312],[457,351],[393,348]],[[574,305],[609,308],[609,368],[559,375],[548,347]]]},
 {a:[399,183],b:[579,109],c:[432,274],hands:[[[332,214],[381,209],[424,223],[417,264],[382,292],[346,266]],[[394,169],[413,156],[441,164],[443,183],[421,190]]]},
];
export function drawHeldKeyboard(ctx,level,cell,img,sx,sy,sw,sh,w,h){
  const p=poses[cell]||poses[0],X=x=>-w/2+x/640*w,Y=y=>-h+y/640*h;
  ctx.save();ctx.transform((p.b[0]-p.a[0])/180*w/640,(p.b[1]-p.a[1])/180*h/640,(p.c[0]-p.a[0])/80*w/640,(p.c[1]-p.a[1])/80*h/640,X(p.a[0]),Y(p.a[1]));drawKeyboard(ctx,level);ctx.restore();
  for(const hand of p.hands){ctx.save();ctx.beginPath();hand.forEach(([x,y],i)=>i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y)));ctx.closePath();ctx.clip();ctx.drawImage(img,sx,sy,sw,sh,-w/2,-h,w,h);ctx.restore();}
}

export function drawKeyboardImpact(ctx,x,y,level,remaining){
  if(level<1||remaining<=0)return;
  const t=1-remaining/.65,s=KEYBOARD_STYLES[level];ctx.save();ctx.translate(x,y);ctx.globalAlpha=Math.sin(t*Math.PI);ctx.strokeStyle=s.accent;ctx.lineWidth=2+level;ctx.shadowColor=s.accent;ctx.shadowBlur=level*4;
  const radius=44+level*7+t*22;
  for(let ring=0;ring<(level>=3?3:1);ring++){ctx.beginPath();ctx.ellipse(0,0,radius+ring*8,(radius+ring*8)*.42,-.4,t*2,Math.PI*1.25+t*2);ctx.stroke();}
  if(level>=2)for(let i=0;i<level*4;i++){const a=i*2.4+t*3,px=Math.cos(a)*radius,py=Math.sin(a)*radius*.5;ctx.fillStyle=i%2?'#fff4bd':s.accent;ctx.fillRect(px,py,level===4?5:3,level===4?5:3);}
  ctx.restore();
}
