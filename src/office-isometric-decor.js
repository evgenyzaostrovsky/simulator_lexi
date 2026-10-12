// Canvas surfaces keep the same 2:1 projection as movement and collision geometry.
export function officeDecor(ctx,project,poly){
  const line=(points,color,width=1)=>{ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();ctx.lineWidth=1;};
  function wall(x,y,alongY=false,length=1,height=68){
    const point=(t,z)=>project(x+(alongY?0:t),y+(alongY?t:0),z);
    const a=point(0,0),b=point(length,0),c=point(length,height),d=point(0,height);
    const gradient=ctx.createLinearGradient(d[0],d[1],a[0],a[1]);gradient.addColorStop(0,alongY?'#f3e8bb':'#fff0cc');gradient.addColorStop(1,alongY?'#b4c8ad':'#ccd7b7');
    poly([a,b,c,d],gradient,'#8b967a');
    poly([point(0,0),point(length,0),point(length,24),point(0,24)],alongY?'#7da48f':'#94b69b','#597f6d');
    for(let t=.12;t<length;t+=.3)line([point(t,3),point(t,22)],'#bed3b088');
    for(const z of [3,24,27,height])line([point(0,z),point(length,z)],z===27?'#fcf0c9':'#6e8c74',z===27?3:2);
    for(let t=.18;t<length;t+=.45){const p=point(t,43);ctx.fillStyle='#baab8133';ctx.beginPath();ctx.ellipse(p[0],p[1],2,4,0,0,7);ctx.fill();}
  }
  function window(x,y,alongY=false){
    const p=(t,z)=>project(x+(alongY?0:t),y+(alongY?t:0),z);
    poly([p(0,35),p(2,35),p(2,95),p(0,95)],'#f9edcd','#876e50');
    poly([p(.10,39),p(1.9,39),p(1.9,91),p(.10,91)],'#a9dae0','#668d91');
    line([p(.25,85),p(.8,47)],'#ffffff88',4);line([p(.9,87),p(1.4,54)],'#ffffff66',2);
    line([p(1,36),p(1,94)],'#fff5d9',4);line([p(0,63),p(2,63)],'#fff5d9',4);line([p(-.12,34),p(2.12,34)],'#ad8862',5);
    for(const t of [-.1,1.9])poly([p(t,96),p(t+.24,96),p(t+.3,36),p(t-.03,36)],'#d48758','#b06c4b');
  }
  function floor(x,y){
    const boss=x>10&&y<9,breakroom=x<10&&y>9;
    const color=boss?((x+y)%2?'#c99b63':'#d7ac75'):breakroom?((x+y)%2?'#e5cf9d':'#bdcbb5'):((x+y)%2?'#dfd5b8':'#eadfc4');
    poly([project(x,y),project(x+1,y),project(x+1,y+1),project(x,y+1)],color,'#aa9b783b');
    if(boss)for(let i=1;i<4;i++)line([project(x,y+i/4),project(x+1,y+i/4)],'#99734435');
    else line([project(x+.03,y+.97),project(x+.97,y+.97)],'#fff6db66');
  }
  return {wall,window,floor};
}
