export const RAGE_DURATION=1.35;

export function drawOfficeRage(ctx,width,height,remaining,image,reduced=false){
  if(remaining<=0)return;
  const elapsed=RAGE_DURATION-remaining,fade=Math.min(1,remaining/.35),entrance=Math.min(1,elapsed/.12);
  ctx.save();ctx.globalAlpha=fade;
  const glow=ctx.createRadialGradient(width/2,height/2,height*.22,width/2,height/2,width*.65);
  glow.addColorStop(0,'#ed271800');glow.addColorStop(.6,'#eb341b25');glow.addColorStop(1,'#b20d09d9');
  ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
  // One impact flash, never a repeating strobe. Leave the player visible centrally.
  if(!reduced&&elapsed<.16){ctx.fillStyle=`rgba(255,115,45,${.27*(1-elapsed/.16)})`;ctx.fillRect(0,0,width,height);}
  const size=Math.min(180,width*.22,height*.34);
  const cards=[[.12,.29,-.24],[.88,.30,.20],[.16,.77,.14],[.86,.78,-.19]];
  if(image)cards.forEach(([x,y,angle],i)=>{
    const pop=reduced?1:Math.min(1,Math.max(0,(elapsed-i*.045)/.16));if(!pop)return;
    ctx.save();ctx.translate(width*x,height*y);ctx.rotate(angle);ctx.scale(.65+.35*pop,.65+.35*pop);ctx.globalAlpha=fade*pop*(i<2?.95:.72);
    ctx.shadowColor='#6d140a80';ctx.shadowBlur=16;ctx.fillStyle='#fff0cd';ctx.fillRect(-size/2,-size*.48,size,size*.96);ctx.shadowBlur=0;
    ctx.strokeStyle='#752316';ctx.lineWidth=4;ctx.strokeRect(-size/2,-size*.48,size,size*.96);
    // Crop the old caption; the game's requested phrase replaces it.
    ctx.drawImage(image,0,image.height*.36,image.width,image.height*.64,-size/2+4,-size*.20,size-8,size*.64);
    ctx.fillStyle='#b62617';ctx.textAlign='center';ctx.font=`900 ${Math.max(12,size*.12)}px Arial`;ctx.fillText('СРОЧНО',0,-size*.31);ctx.fillText('БЛЕАТЬ!!1',0,-size*.18);ctx.restore();
  });
  ctx.translate(width/2,height*.17);if(!reduced)ctx.rotate(Math.sin(elapsed*22)*.016);
  ctx.scale(.92+.08*entrance,.92+.08*entrance);ctx.font=`900 ${Math.min(48,width*.055)}px Arial`;ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=7;ctx.strokeStyle='#722011';ctx.strokeText('СРОЧНО БЛЕАТЬ!!1',0,0);ctx.fillStyle='#fff0a5';ctx.fillText('СРОЧНО БЛЕАТЬ!!1',0,0);
  ctx.restore();
}
