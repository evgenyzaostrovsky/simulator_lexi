// Furniture is drawn separately from the painted wall so platform edges stay legible.
export function scenery(g){
  const rect=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  function gradient(x,y,w,h,a,b){const c=g.createLinearGradient(x,y,x+w*.3,y+h);c.addColorStop(0,a);c.addColorStop(1,b);return c;}
  function shape(x,y,w,h,a,b=a,r=2){g.fillStyle=gradient(x,y,w,h,a,b);g.strokeStyle='#302a25';g.lineWidth=1.2;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();g.stroke();}
  function line(points,c,width=1){g.strokeStyle=c;g.lineWidth=width;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();}
  function shadow(x,y,w){g.fillStyle='#171f2448';g.beginPath();g.ellipse(x,y,w,5,0,0,7);g.fill();}
  function desk(x,y,seed=0){
    shadow(x+62,y,79);
    // Legs, cabinet and brass pulls.
    shape(x+7,y-48,8,48,'#b99a6b','#554638');shape(x+108,y-48,8,48,'#b99a6b','#554638');
    shape(x+78,y-48,30,43,'#a78559','#635038');
    for(let j=0;j<3;j++){shape(x+80,y-46+j*13,26,12,'#b79561','#7b6243');shape(x+89,y-42+j*13,9,2,'#d6bd83','#816e42');}
    shape(x-3,y-57,128,10,'#d7b87a','#866444',2);line([[x,y-54],[x+122,y-54]],'#ebd5a2');
    for(let i=0;i<4;i++)line([[x+12+i*20,y-51],[x+22+i*20,y-50]],'#6e563969');
    // Monitor, bezel, power button and screen content.
    shape(x+23,y-104,48,35,'#69716c','#252d2e',4);rect(x+27,y-100,40,26,gradient(x+27,y-100,40,26,'#b7d4bf','#4e898b'));
    rect(x+30,y-97,34,4,'#deebcc');rect(x+30,y-90,10,11,'#3d737a');
    for(let j=0;j<3;j++)rect(x+43,y-90+j*4,17-j*3,1,'#cfe0c3');rect(x+63,y-72,2,1,'#92e4af');
    shape(x+43,y-69,7,10,'#767e70','#333e3e');shape(x+35,y-61,26,3,'#9ba195','#485350');
    line([[x+68,y-75],[x+73,y-60],[x+73,y-24],[x+90,y-16]],'#302c2b',1.5);
    shape(x+26,y-60,45,4,'#d2c7a4','#7d806d');for(let j=0;j<12;j++)rect(x+28+j*3.3,y-59,2,1,'#6a7166');
    // Coffee and a stack of slightly misaligned reports.
    g.save();g.translate(x+91,y-60);g.rotate(-.08);shape(-7,-3,22,3,'#eee1bb','#b3a580');rect(-4,-4,15,1,'#f5edcf');g.restore();
    shape(x+8,y-72,10,13,'#eee2bd','#aa9b74',3);g.strokeStyle='#e6d6ae';g.lineWidth=2;g.beginPath();g.arc(x+20,y-67,4,-1.5,1.5);g.stroke();rect(x+10,y-72,6,2,'#705244');
    if(seed%2){line([[x+17,y-21],[x+32,y-21]],'#222c2e',4);shape(x+19,y-46,23,7,'#718a76','#334f49',3);shape(x+13,y-69,8,26,'#7c9683','#344d47',4);rect(x+28,y-39,3,31,'#454d45');line([[x+16,y-2],[x+30,y-8],[x+44,y-2]],'#3f473f',2);}
  }
  function cooler(x,y){
    shadow(x+21,y,27);shape(x,y-66,41,66,'#e0ddc3','#7f9588',4);shape(x+8,y-105,25,40,'#acd4d1','#41778b',6);
    for(let j=0;j<4;j++)line([[x+10,y-94+j*7],[x+30,y-94+j*7]],'#d0e3ca66');rect(x+13,y-99,3,25,'#e5f3d5a0');
    shape(x+7,y-50,27,27,'#455e60','#203d44');shape(x+11,y-45,6,4,'#d56a58','#a14338');shape(x+25,y-45,6,4,'#79b6cc','#377c99');
    shape(x+17,y-36,9,11,'#f2e6c9','#b9c5af');for(let j=0;j<4;j++)rect(x+9,y-16+j*3,22,1,'#71897d');
  }
  function printer(x,y){
    shadow(x+37,y,46);shape(x,y-53,75,50,'#afbbaa','#5c746e',4);shape(x-4,y-73,83,23,'#dbdfc5','#82998a',4);
    shape(x+12,y-76,52,6,'#344e52','#1a343b');g.save();g.translate(x+28,y-74);g.rotate(-.1);shape(-4,-23,32,24,'#f2e8cf','#c4c7b0');for(let i=0;i<4;i++)rect(0,-18+i*4,21-i*2,1,'#929e91');g.restore();
    shape(x+8,y-42,58,13,'#283e42','#1b303a');shape(x+20,y-32,37,13,'#e9e0c2','#a0afa0');rect(x+8,y-65,14,6,'#84b8a1');rect(x+62,y-63,3,3,'#a8dd9b');
    for(let i=0;i<5;i++)rect(x+8,y-20+i*2,7,1,'#50685e');
  }
  function plant(x,y){
    shadow(x+15,y,23);shape(x,y-25,30,25,'#c09766','#83553e',4);shape(x-2,y-27,34,6,'#d0a273','#906347');
    for(let i=0;i<7;i++){const a=i*2.4;const tx=x+15+Math.sin(a)*22,ty=y-45-Math.cos(a)*14;line([[x+15,y-25],[tx,ty]],'#405f43',2);g.save();g.translate(tx,ty);g.rotate(a);g.fillStyle=gradient(-8,-16,16,32,'#a1b276','#31574b');g.beginPath();g.ellipse(0,0,8,18,0,0,7);g.fill();line([[0,-15],[0,13]],'#afba8066');g.restore();}
  }
  function cabinet(x,y){
    shadow(x+24,y,33);shape(x,y-95,52,95,'#84998a','#435e59',3);for(let i=0;i<3;i++){shape(x+3,y-91+i*29,46,27,'#93a390','#526c60');shape(x+16,y-86+i*29,20,8,'#d0c3a1','#a89c7b');shape(x+18,y-74+i*29,16,3,'#c1c0a8','#6c8174');}
    shape(x+6,y-101,39,5,'#bdac85','#918263');
  }
  function floor(f){
    shape(f.x,f.y,f.w,27,'#8a6b49','#352e28',0);rect(f.x,f.y,f.w,4,'#d2ba84');rect(f.x,f.y+4,f.w,3,'#a98d61');
    for(let x=f.x+7;x<f.x+f.w-10;x+=43){line([[x,f.y+1],[x+2,f.y+5]],'#796342');line([[x+4,f.y+10],[Math.min(x+32,f.x+f.w-2),f.y+11]],'#ad88513a');rect(x,f.y+18,2,2,'#1e2528');}
    rect(f.x,f.y+27,f.w,9,'#19282d');line([[f.x,f.y+35],[f.x+f.w,f.y+35]],'#54625c');
  }
  return {desk,cooler,printer,plant,cabinet,floor,rect,shape,line,shadow,gradient};
}
