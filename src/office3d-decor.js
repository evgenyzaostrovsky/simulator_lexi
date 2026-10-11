import * as T from 'three';

export function decorateOffice(scene,box,materials){
  const walnut=new T.MeshStandardMaterial({color:'#42352d',roughness:.6});
  const brass=new T.MeshStandardMaterial({color:'#ac8a55',metalness:.75,roughness:.3});
  const paper=new T.MeshStandardMaterial({color:'#eee6d3',roughness:1});
  const felt=new T.MeshStandardMaterial({color:'#324a47',roughness:1});
  // Low wall panelling and skirting; never span the openings.
  for(const z of [-2,2])for(const [x,w] of [[-9.6,4.8],[0,9.6],[9.6,4.8]])for(const face of [-1,1]){
    box(x,0,z+face*.105,w,1.05,.035,walnut);
    box(x,1.05,z+face*.13,w,.035,.055,brass);
    box(x,0,z+face*.13,w,.12,.055,walnut);
    for(let dx=-w/2+.3;dx<w/2;dx+=.55)box(x+dx,.16,z+face*.13,.024,.72,.018,brass);
  }
  for(const z of [-9.86,9.86]){box(0,0,z,23.8,.16,.08,walnut);box(0,1.02,z,23.8,.05,.05,brass);}
  for(const x of [-11.86,11.86])box(x,0,0,.08,.16,19.8,walnut);
  // Carpet runners distinguish the corridor and executive office.
  function rug(x,z,w,d){box(x,.006,z,w,.018,d,brass);box(x,.025,z,w-.13,.01,d-.13,felt);for(const offset of [-1,1])box(x+offset*(w/2-.15),.036,z,.015,.002,d-.3,brass);}
  rug(0,0,20,2.1);rug(6,6.3,7,5.9);rug(-8,6,5,4.5);
  // Screens with legible miniature desktop content and paper on desks.
  const c=document.createElement('canvas');c.width=512;c.height=320;const g=c.getContext('2d');
  g.fillStyle='#152b33';g.fillRect(0,0,512,320);g.fillStyle='#25434a';g.fillRect(12,15,488,32);g.fillStyle='#cfb680';g.font='18px monospace';g.fillText('LEXI OS / DEADLINE: NOW',25,37);
  for(let i=0;i<9;i++){g.fillStyle=i%3?'#7d9e99':'#d8b77c';g.fillRect(26,70+i*23,100+(i*61)%270,5);}g.fillStyle='#a9533b';g.fillRect(370,235,110,50);
  const screenMap=new T.CanvasTexture(c);screenMap.colorSpace=T.SRGBColorSpace;const display=new T.MeshBasicMaterial({map:screenMap,toneMapped:false});
  for(const [x,z] of [[-9,-7],[-4,-7],[-9,-4.4],[6,7]]){
    const screen=new T.Mesh(new T.PlaneGeometry(.8,.48),display);screen.position.set(x,1.2,z-.188);scene.add(screen);
    box(x,.9,z-.25,.12,.12,.09,materials.metal);
    for(let row=0;row<4;row++)for(let key=0;key<12;key++)box(x-.29+key*.05,.935,z+.22+row*.045,.035,.01,.03,walnut);
    for(let page=0;page<4;page++){const sheet=box(x-.75,.91+page*.005,z+.2,.42,.003,.3,paper);sheet.rotation.y=page*.045;}
    box(x+.55,.91,z+.33,.09,.04,.14,materials.dark);
    const mug=new T.Mesh(new T.CylinderGeometry(.07,.06,.17,24),paper);mug.position.set(x+.86,1,z+.2);scene.add(mug);
    const handle=new T.Mesh(new T.TorusGeometry(.045,.012,8,16),paper);handle.position.set(x+.93,1,z+.2);scene.add(handle);
  }
  // Desk lamp, printer and coffee corner: distinct silhouettes in each room.
  box(7.45,.91,7,.35,.04,.24,brass);box(7.45,.95,7,.04,.5,.04,brass);
  const shade=new T.Mesh(new T.ConeGeometry(.22,.18,32,1,true),felt);shade.position.set(7.45,1.5,7);scene.add(shade);
  const lamp=new T.PointLight('#ffc275',3,3);lamp.position.set(7.45,1.4,7);scene.add(lamp);
  box(-10,.65,-3,.9,.45,.6,materials.cream);box(-10,1.1,-3,.85,.05,.55,materials.dark);box(-10,1.155,-3,.6,.006,.35,paper);
  box(-4,0,6,1.25,.86,.7,walnut,true);box(-4,.86,6,1.3,.08,.75,materials.cream);box(-4, .94,6,.5,.5,.4,materials.metal);box(-4,1.04,6.22,.32,.26,.02,materials.dark);
  // Framed office prints on the far wall, with actual typography.
  function poster(text,x){const c=document.createElement('canvas');c.width=384;c.height=512;const g=c.getContext('2d');g.fillStyle='#e7dcc1';g.fillRect(0,0,384,512);g.fillStyle='#2d4941';g.fillRect(20,20,344,472);g.strokeStyle='#c3a473';g.lineWidth=3;g.strokeRect(32,32,320,448);g.fillStyle='#dec696';g.textAlign='center';g.font='bold 34px sans-serif';text.forEach((t,i)=>g.fillText(t,192,160+i*60));g.font='14px monospace';g.fillText('LEXI / EST. 2026',192,435);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;box(x,1.5,9.79,1.5,2,.08,walnut);const p=new T.Mesh(new T.PlaneGeometry(1.36,1.86),new T.MeshStandardMaterial({map,roughness:1}));p.position.set(x,2.5,9.735);p.rotation.y=Math.PI;scene.add(p);}
  poster(['СРОЧНО','ЗНАЧИТ','ВЧЕРА'],4);poster(['БОЛЬШЕ','ЗАПЯТЫХ','МЕНЬШЕ СЛОВ'],8);
  // Overhead structural grid gives the office a finished enclosed silhouette.
  for(let x=-12;x<=12;x+=4)box(x,3.8,0,.12,.12,20,materials.dark);
  for(let z=-10;z<=10;z+=4)box(0,3.8,z,24,.12,.12,materials.dark);
}
