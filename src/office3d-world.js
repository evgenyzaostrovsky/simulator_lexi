import * as T from 'three';

export function createOffice(scene){
  const obstacles=[],cameraObjects=[];
  function texture(kind){
    const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle=kind==='wood'?'#866849':'#b7b1a1';g.fillRect(0,0,256,256);
    for(let i=0;i<2400;i++){g.strokeStyle=kind==='wood'?`rgba(35,23,12,${Math.random()*.12})`:`rgba(45,44,37,${Math.random()*.08})`;g.beginPath();const x=Math.random()*256,y=Math.random()*256;g.moveTo(x,y);g.lineTo(x+(kind==='wood'?45:2),y+1);g.stroke();}
    if(kind==='wood'){g.strokeStyle='#4a382f';for(let y=0;y<256;y+=64){g.strokeRect(0,y,256,64);g.strokeRect((y/64%2)*128,y,128,64);}}
    const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(kind==='wood'?8:3,kind==='wood'?6:3);return map;
  }
  const materials={wood:new T.MeshStandardMaterial({map:texture('wood'),roughness:.65}),wall:new T.MeshStandardMaterial({map:texture('plaster'),roughness:.95}),dark:new T.MeshStandardMaterial({color:'#263432',roughness:.6}),metal:new T.MeshStandardMaterial({color:'#737e79',metalness:.65,roughness:.32}),leather:new T.MeshStandardMaterial({color:'#40564b',roughness:.78}),cream:new T.MeshStandardMaterial({color:'#dfd8c4',roughness:.65}),screen:new T.MeshStandardMaterial({color:'#76adb0',emissive:'#31565e',emissiveIntensity:.6})};
  function box(x,y,z,w,h,d,m,solid=false){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),materials[m]||m);mesh.position.set(x,y+h/2,z);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);if(solid){obstacles.push({x:x-w/2,z:z-d/2,w,d});}cameraObjects.push(mesh);return mesh;}
  function sign(text,x,z,rotation=0){const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.fillStyle='#213b37';g.fillRect(0,0,512,128);g.strokeStyle='#bda57c';g.strokeRect(7,7,498,114);g.font='bold 36px sans-serif';g.textAlign='center';g.fillStyle='#eee2bb';g.fillText(text,256,77);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const mesh=new T.Mesh(new T.PlaneGeometry(2.4,.6),new T.MeshBasicMaterial({map,side:T.FrontSide}));mesh.position.set(x,2.55,z);mesh.rotation.y=rotation;scene.add(mesh);const reverse=mesh.clone();reverse.rotation.y+=Math.PI;reverse.position.z+=rotation===0?-.025:.025;scene.add(reverse);cameraObjects.push(mesh,reverse);}
  box(0,-.15,0,24,.15,20,'wood');
  // Four enclosed rooms, connected by a central corridor; all doorways are 2.4m wide.
  box(0,0,-10,24,3.8,.2,'wall',true);box(0,0,10,24,3.8,.2,'wall',true);box(-12,0,0,.2,3.8,20,'wall',true);box(12,0,0,.2,3.8,20,'wall',true);
  for(const z of [-2,2])for(const [x,w] of [[-9.6,4.8],[0,9.6],[9.6,4.8]])box(x,0,z,w,3.8,.18,'wall',true);
  for(const z of [-6,6])box(0,0,z,.18,3.8,8,'wall',true);
  // Door trim and signs face the corridor.
  for(const z of [-2,2])for(const x of [-6,6]){box(x-1.25,0,z,.14,2.9,.3,'dark');box(x+1.25,0,z,.14,2.9,.3,'dark');box(x,2.8,z,2.65,.18,.3,'dark');}
  sign('РАБОЧИЙ ОФИС',-6,-1.88);sign('ПЕРЕГОВОРНАЯ',6,-1.88);sign('КОМНАТА ОТДЫХА',-6,1.88,Math.PI);sign('КАБИНЕТ БОССА',6,1.88,Math.PI);
  function desk(x,z,boss=false){box(x,.77,z,boss?3.8:2.4,.13,1.2,'wood',true);for(const dx of [-1,1])box(x+dx,0,z,.1,.78,.85,'metal');box(x,.9,z-.25,.9,.62,.07,'dark');box(x,.96,z-.205,.8,.48,.02,'screen');box(x,.9,z+.3,.65,.03,.23,'cream');box(x+.85,.9,z+.2,.13,.2,.13,'cream');chair(x,z+1.25);}
  function chair(x,z){box(x,.48,z,.65,.13,.65,'leather',true);box(x,.6,z+.27,.65,.66,.12,'leather');box(x,.1,z,.1,.4,.1,'metal');box(x,0,z,.7,.07,.12,'metal');box(x,0,z,.12,.07,.7,'metal');}
  desk(-9,-7);desk(-4,-7);desk(-9,-4.4);desk(6,7,true);
  box(6,.78,-6,4,.16,1.8,'wood',true);for(const x of [4.5,6,7.5]){chair(x,-4.5);chair(x,-7.5);}
  for(const x of [-9.5,-8,-6.5]){box(x,.3,7,.95,.5,1,'leather',true);box(x,.8,7.45,1,.55,.18,'leather');}box(-8,.3,5,2,.2,1,'wood',true);
  box(-3,0,8,1.8,2.5,.5,'wood',true);for(let y=.5;y<2.5;y+=.6)box(-3,y,7.72,1.65,.035,.03,'cream');
  box(10,0,7,2.5,2.6,.5,'wood',true);for(let i=0;i<15;i++)box(9+i*.13,.5+(i%3)*.6,6.7,.09,.43,.24,i%2?'cream':'leather');
  box(-3,0,3.8,.6,1.1,.6,'cream',true);const bottle=new T.Mesh(new T.CylinderGeometry(.23,.23,.55,20),new T.MeshPhysicalMaterial({color:'#78acb4',transparent:true,opacity:.65,roughness:.15}));bottle.position.set(-3,1.4,3.8);scene.add(bottle);
  for(const x of [-9,-4,4,9]){box(x,1.1,-9.88,2.8,1.7,.06,'dark');box(x,1.18,-9.82,2.6,1.52,.02,'screen');for(let y=1.3;y<2.75;y+=.13)box(x,y,-9.76,2.6,.025,.025,'cream');}
  for(const [x,z] of [[-10,8],[10,3],[10,-8],[-2,-8]]){box(x,0,z,.4,.5,.4,'wood',true);for(let i=0;i<8;i++){const leaf=new T.Mesh(new T.SphereGeometry(.25,8,6),new T.MeshStandardMaterial({color:i%2?'#385e40':'#668457'}));leaf.scale.set(.5,2,.7);leaf.position.set(x+Math.sin(i*2)*.25,.8+(i%3)*.16,z+Math.cos(i*2)*.25);leaf.rotation.z=Math.sin(i)*.6;scene.add(leaf);}}
  for(const [x,z] of [[-6,-6],[6,-6],[-6,6],[6,6],[0,0]]){box(x,3.65,z,2,.05,.65,new T.MeshStandardMaterial({color:'#fff0cd',emissive:'#ffe0aa',emissiveIntensity:1}));const light=new T.PointLight('#ffe5bf',35,14,2);light.position.set(x,3.3,z);scene.add(light);}
  return {obstacles,cameraObjects};
}

export function createBoar(scene){
  const root=new T.Group();scene.add(root);root.position.set(6,0,4.5);
  const fur=new T.MeshStandardMaterial({color:'#bfae8c',roughness:1}),dark=new T.MeshStandardMaterial({color:'#39312b',roughness:.9});
  function ell(parent,x,y,z,a,b,c,m=fur){const mesh=new T.Mesh(new T.SphereGeometry(1,20,14),m);mesh.position.set(x,y,z);mesh.scale.set(a,b,c);mesh.castShadow=true;parent.add(mesh);return mesh;}
  ell(root,0,1,0,.5,.63,.35);ell(root,0,1.65,.13,.38,.38,.36);ell(root,0,1.55,.47,.27,.19,.24,dark);
  for(const x of [-.1,.1])ell(root,x,1.57,.68,.047,.05,.015,dark);
  for(const x of [-.19,.19]){ell(root,x,1.78,.42,.045,.045,.025,dark);const ear=new T.Mesh(new T.ConeGeometry(.14,.34,5),fur);ear.position.set(x*1.6,2,.05);ear.rotation.z=-x*2;root.add(ear);}
  const legs=[];for(const x of [-.22,.22]){const pivot=new T.Group();pivot.position.set(x,.65,0);root.add(pivot);ell(pivot,0,-.25,0,.14,.3,.15);ell(pivot,0,-.54,.09,.16,.1,.21,dark);legs.push(pivot);}
  const arms=new T.Group();arms.position.set(0,1.32,0);root.add(arms);for(const x of [-.43,.43])ell(arms,x,-.14,.32,.14,.28,.17);
  const keyboard=new T.Mesh(new T.BoxGeometry(.95,.07,.34),new T.MeshStandardMaterial({color:'#c9c3aa'}));keyboard.position.set(0,-.3,.55);arms.add(keyboard);
  const capGeometry=new T.BoxGeometry(.05,.018,.055),capMat=new T.MeshStandardMaterial({color:'#706d60'});for(let i=0;i<13;i++)for(let j=0;j<4;j++){const cap=new T.Mesh(capGeometry,capMat);cap.position.set(-.42+i*.07,-.255,.43+j*.075);arms.add(cap);}
  // Instanced bristles give the silhouette actual fur depth without hundreds of draw calls.
  const bristles=new T.InstancedMesh(new T.ConeGeometry(.008,.085,3),fur,650),dummy=new T.Object3D();
  for(let i=0;i<650;i++){const a=i*2.39996,b=Math.acos(1-2*(i+.5)/650),n=new T.Vector3(Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a));dummy.position.set(n.x*.5,1+n.y*.63,n.z*.36);dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),n);dummy.updateMatrix();bristles.setMatrixAt(i,dummy.matrix);}root.add(bristles);
  return {root,animate(time,moving,attack){legs.forEach((leg,i)=>leg.rotation.x=moving?Math.sin(time*12+i*Math.PI)*.55:0);arms.rotation.x=attack>0?-Math.sin((1-attack/.5)*Math.PI)*1.5:0;}};
}
