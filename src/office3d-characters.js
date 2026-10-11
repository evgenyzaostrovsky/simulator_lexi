import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {KEY_ROWS,MISSING_KEYS,ATTACK_DURATION} from './office3d-combat.mjs';
import {move} from './office3d-controller.mjs';

import {BOAR_SHAPE} from './boar-reference-shape.mjs';

const UP=new T.Vector3(0,1,0);
function material(color,roughness=.85){return new T.MeshStandardMaterial({color,roughness});}
function mesh(parent,geometry,mat,x=0,y=0,z=0){const obj=new T.Mesh(geometry,mat);obj.position.set(x,y,z);obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;}
function ell(parent,mat,x,y,z,sx,sy,sz){const obj=mesh(parent,new T.SphereGeometry(1,28,20),mat,x,y,z);obj.scale.set(sx,sy,sz);return obj;}
function rounded(parent,mat,x,y,z,w,h,d,r=.03){return mesh(parent,new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),mat,x,y,z);}

// Actual geometric tapered locks, distributed over an ellipsoid. No camera-facing
// animal cards: the silhouette, face, fingers and coat remain volumetric at any angle.
function coat(parent,center,radii,count,length,seed=1,comb=[0,-1,-.25]){
  const geo=new T.BufferGeometry();
  // Three narrow curved strands per lock, rather than straight radial spikes.
  const positions=[],shades=[];
  for(let strand=0;strand<3;strand++){
    const point=(t,side)=>[(strand-1)*.28+Math.sin(t*3+strand)*.12+side*.12*(1-t),t*(1-strand*.09),t*t*.22+strand*.035];
    for(let segment=0;segment<4;segment++){
      const a=segment/4,b=(segment+1)/4;
      for(const [t,s] of [[a,-1],[a,1],[b,1],[a,-1],[b,1],[b,-1]]){
        positions.push(...point(t,s));const c=.68+t*.32;shades.push(c,c,c);
      }
    }
  }
  geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('color',new T.Float32BufferAttribute(shades,3));geo.computeVertexNormals();
  const mat=new T.MeshStandardMaterial({color:'#d5bd92',vertexColors:true,roughness:1,side:T.DoubleSide});
  const fur=new T.InstancedMesh(geo,mat,count),dummy=new T.Object3D(),color=new T.Color();
  const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<count;i++){
    const y=1-2*(i+.5)/count,a=i*2.399963,n=new T.Vector3(Math.sqrt(1-y*y)*Math.cos(a),y,Math.sqrt(1-y*y)*Math.sin(a));
    dummy.position.set(center[0]+n.x*radii[0],center[1]+n.y*radii[1],center[2]+n.z*radii[2]);
    const normal=new T.Vector3(n.x/radii[0],n.y/radii[1],n.z/radii[2]).normalize();
    const flow=new T.Vector3(...comb);const tangent=flow.addScaledVector(normal,-flow.dot(normal)).normalize();
    const direction=normal.clone().multiplyScalar(.24).addScaledVector(tangent,.97).normalize();
    dummy.quaternion.setFromUnitVectors(UP,direction);dummy.rotateY((rand()-.5)*1.1);
    const size=.65+rand()*.7;dummy.scale.set(length*.23*size,length*size,length*.3*size);dummy.updateMatrix();fur.setMatrixAt(i,dummy.matrix);
    color.setHSL(.10+rand()*.018,.13+rand()*.15,.49+rand()*.29);fur.setColorAt(i,color);
  }
  fur.castShadow=true;fur.receiveShadow=true;parent.add(fur);return fur;
}

function keyboard(parent){
  const root=new T.Group();root.name='Keyboard — missing С Р О Ч Н 1/!';parent.add(root);
  const ivory=material('#c6b795'),cap=material('#e5d8b7'),socket=material('#302b27'),stem=material('#8b7970');
  rounded(root,ivory,0,0,0,1.16,.43,.095);
  rounded(root,socket,0,.018,.048,1.08,.345,.012,.003);
  const atlas=document.createElement('canvas');atlas.width=1024;atlas.height=512;const g=atlas.getContext('2d');
  g.fillStyle='#25251f';g.textAlign='center';g.textBaseline='middle';g.font='bold 42px sans-serif';
  const map=new T.CanvasTexture(atlas);map.colorSpace=T.SRGBColorSpace;
  const labelMat=new T.MeshBasicMaterial({map,transparent:true,depthWrite:false});
  KEY_ROWS.forEach((row,r)=>[...row].forEach((letter,col)=>{
    const x=-.49+col*.08+(r===3?.05:0),y=.145-r*.078;
    if(MISSING_KEYS.has(letter)){
      // Missing caps expose the recessed switch and cross-shaped stem.
      const well=rounded(root,socket,x,y,.06,.065,.063,.012,.003);well.userData.missingKey=letter;
      rounded(root,stem,x,y,.071,.024,.008,.009,.001);
      rounded(root,stem,x,y,.071,.008,.024,.009,.001);
    }else{
      const keycap=rounded(root,cap,x,y,.077,.067,.062,.033,.006);keycap.userData.keycap=letter;
      g.fillText(letter,(col+.5)*1024/12,(r+.5)*512/4);
      const geo=new T.PlaneGeometry(.059,.055),uv=geo.getAttribute('uv');
      for(let i=0;i<uv.count;i++)uv.setXY(i,(col+uv.getX(i))/12,1-(r+1-uv.getY(i))/4);
      mesh(root,geo,labelMat,x,y,.095).castShadow=false;
    }
  }));map.needsUpdate=true;
  rounded(root,cap,0,-.165,.071,.48,.045,.024,.006);
  for(let i=0;i<3;i++)ell(root,material(i===0?'#a7b65d':'#57564b'),.44+i*.028,.188,.052,.006,.006,.003);
  return root;
}

export function createBoar(scene){
  const root=new T.Group();root.name='Leha — reference sculpt';root.position.set(6,0,4.5);scene.add(root);
  const body=new T.Group();root.add(body);
  const fur=material('#a9987c'),face=material('#494443'),hoof=material('#29282a',.55),inner=material('#3c3430'),eye=material('#c3a782',.3),black=material('#09090b',.28);
  // A subtle, non-image pore bump prevents the muzzle from looking like smooth plastic.
  const pores=new Uint8Array(128*128*4);let noise=123;
  for(let i=0;i<pores.length;i+=4){noise=(Math.imul(noise,1664525)+1013904223)>>>0;pores[i]=pores[i+1]=pores[i+2]=80+(noise%130);pores[i+3]=255;}
  const bump=new T.DataTexture(pores,128,128);bump.wrapS=bump.wrapT=T.RepeatWrapping;bump.repeat.set(3,3);bump.needsUpdate=true;face.bumpMap=bump;face.bumpScale=.012;
  const {belly,shoulders}=BOAR_SHAPE;
  ell(body,fur,...belly.center,...belly.radii);coat(body,belly.center,belly.radii,9000,.21,2);
  ell(body,fur,...shoulders.center,...shoulders.radii);coat(body,shoulders.center,shoulders.radii,3500,.24,4,[0,-.4,-1]);
  // Low heavy head blends into the hump, rather than sitting on a visible neck.
  const head=new T.Group();head.name='Forward-set head';head.position.set(...BOAR_SHAPE.head);body.add(head);
  ell(head,fur,0,0,0,...BOAR_SHAPE.skull);coat(head,[0,0,0],BOAR_SHAPE.skull,2700,.055,6,[0,-.3,-1]);
  for(const side of [-1,1]){
    ell(head,fur,side*.25,-.17,.13,.19,.16,.23);
    coat(head,[side*.25,-.17,.13],[.19,.16,.23],650,.065,15+side,[side*.2,-1,-.2]);
  }
  // Continuous tapered muzzle: broad bridge narrowing into the snout, not stacked balls.
  const rings=[
    [-.05,.32,.24,-.08],[.12,.29,.21,-.085],[.30,.235,.175,-.095],
    [.48,.205,.155,-.078],[.61,.225,.164,-.048],
  ],v=[],uvs=[],indices=[],segments=40;
  for(let i=0;i<rings.length;i++){const [z,rx,ry,cy]=rings[i];for(let j=0;j<=segments;j++){const a=j/segments*Math.PI*2;v.push(Math.cos(a)*rx,cy+Math.sin(a)*ry,z);uvs.push(j/segments,i/(rings.length-1));}}
  for(let i=0;i<rings.length-1;i++)for(let j=0;j<segments;j++){const a=i*(segments+1)+j,b=a+segments+1;indices.push(a,a+1,b,b,a+1,b+1);}
  const bridge=new T.BufferGeometry();bridge.setAttribute('position',new T.Float32BufferAttribute(v,3));bridge.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));bridge.setIndex(indices);bridge.computeVertexNormals();mesh(head,bridge,face).name='Tapered muzzle';
  // Short grey hair over the bridge, but a bare dark leathery nose disc.
  coat(head,[0,-.035,.28],[.23,.155,.29],1800,.025,72,[0,-.25,-1]);
  const nose=ell(head,face,0,-.047,.614,.231,.172,.065);nose.rotation.x=-.08;
  for(const x of [-.098,.098]){
    const rim=mesh(head,new T.TorusGeometry(.061,.012,10,28),face,x,-.035,.672);rim.scale.set(.74,1.13,.7);rim.rotation.z=x>0?-.18:.18;
    const hole=ell(head,new T.MeshBasicMaterial({color:'#080707'}),x,-.035,.674,.039,.061,.006);hole.rotation.z=x>0?-.18:.18;
  }
  ell(head,hoof,0,-.222,.35,.178,.016,.23);
  for(const side of [-1,1]){
    const socket=ell(head,inner,side*.282,.066,.278,.10,.052,.048);socket.rotation.z=side*.16;
    ell(head,eye,side*.279,.062,.339,.054,.026,.014);
    ell(head,black,side*.274,.062,.352,.020,.023,.007);
    ell(head,material('#fff0ce',.2),side*.275-.009,.070,.359,.006,.006,.003);
    // Upper eyelids cut into the eyes; inward-sloping brows give the same scowl.
    const lid=ell(head,face,side*.281,.081,.353,.072,.015,.012);lid.rotation.z=side*.30;
    const brow=ell(head,fur,side*.27,.115,.291,.151,.046,.071);brow.rotation.z=side*.29;
    coat(head,[side*.27,.122,.289],[.15,.039,.07],380,.035,side+80,[side,-.1,-.15]);
    const ear=new T.Group();ear.name=side<0?'Left folded ear':'Right folded ear';ear.position.set(side*.31,.22,-.17);ear.rotation.set(-.40,side*.65,-side*.43);head.add(ear);
    const shape=new T.Shape();shape.moveTo(-.13,0);shape.quadraticCurveTo(-.15,.16,-.07,BOAR_SHAPE.earHeight);shape.quadraticCurveTo(.06,.26,.16,.035);shape.closePath();
    mesh(ear,new T.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.02,bevelThickness:.025}),fur);
    const inside=mesh(ear,new T.ShapeGeometry(shape),inner,0,.015,.074);inside.scale.set(.72,.80,1);
    coat(ear,[-.008,.095,.002],[.12,.12,.045],300,.04,side+10,[0,1,-.5]);
    for(const [x,y] of [[-.10,.06],[-.10,.15],[-.06,.23],[.07,.12]])coat(ear,[x,y,.045],[.028,.037,.017],65,.032,Math.round(y*100)+side,[0,1,0]);
  }
  const legs=[];
  for(const side of [-1,1]){
    const leg=new T.Group();leg.position.set(side*BOAR_SHAPE.legSpacing,.50,-.025);root.add(leg);legs.push(leg);
    ell(leg,face,0,-.16,0,.18,.25,.20);
    coat(leg,[0,-.10,-.015],[.18,.22,.18],800,.085,side+30,[side*.3,-1,.1]);
    for(const toe of [-1,1]){
      const foot=rounded(leg,hoof,toe*.082,-.42,.12,.15,.16,.32,.036);foot.rotation.y=side*.12;
      const ridge=ell(leg,face,toe*.082,-.375,.13,.065,.095,.115);ridge.rotation.x=.22;
    }
  }
  const arms=new T.Group();arms.position.y=1.17;body.add(arms);
  for(const side of [-1,1]){
    ell(arms,fur,side*.61,.10,.19,.23,.30,.25);
    coat(arms,[side*.61,.10,.19],[.23,.30,.25],1400,.15,side+40,[side*.1,-1,.2]);
    ell(arms,fur,side*.57,-.035,.44,.20,.19,.32);
    coat(arms,[side*.57,-.035,.44],[.20,.19,.32],1200,.12,side+60,[side*.15,-.6,.7]);
  }
  const board=keyboard(arms);board.position.set(0,-.115,.79);board.rotation.x=.10;board.scale.set(1.06,1.05,1);
  for(const side of [-1,1]){
    ell(arms,face,side*.57,-.105,.80,.16,.14,.115);
    for(let i=0;i<3;i++){const finger=ell(arms,hoof,side*(.52+i*.022),-.04-i*.061,.891,.09,.027,.036);finger.rotation.z=side*-.32;}
  }
  const tailCurve=new T.CatmullRomCurve3([new T.Vector3(0,.70,-.64),new T.Vector3(.1,.69,-.76),new T.Vector3(.15,.77,-.77),new T.Vector3(.1,.8,-.73)]);
  mesh(body,new T.TubeGeometry(tailCurve,16,.017,6,false),fur);
  return {root,animate(time,moving,attack){
    const phase=1-attack/ATTACK_DURATION,swing=attack>0?Math.sin(phase*Math.PI):0;
    legs.forEach((leg,i)=>leg.rotation.x=moving?Math.sin(time*11+i*Math.PI)*.46:0);
    body.position.y=moving?Math.abs(Math.sin(time*11))*.035:Math.sin(time*2)*.006;
    body.rotation.z=moving?Math.sin(time*11)*.025:0;
    arms.rotation.x=-swing*.9;arms.position.z=swing*.32;
    head.rotation.y=Math.sin(time*.7)*.018;head.rotation.x=attack>0?swing*.12:-.025;
  }};
}

export function createEmployee(scene){
  const root=new T.Group();root.position.set(6,0,0);scene.add(root);
  const body=new T.Group();root.add(body);
  const skin=material('#bc8a6d'),shirt=material('#718da0'),pants=material('#303b48'),hair=material('#46372b'),black=material('#26292e');
  const legs=[];for(const side of [-1,1]){const leg=new T.Group();leg.position.set(side*.14,.87,0);root.add(leg);ell(leg,pants,0,-.34,0,.105,.37,.12);rounded(leg,black,0,-.80,.075,.20,.13,.34);legs.push(leg);}
  ell(body,shirt,0,1.2,0,.29,.40,.19);
  ell(body,skin,0,1.76,0,.19,.25,.18);ell(body,hair,0,1.91,-.03,.195,.12,.16);
  ell(body,skin,0,1.73,.19,.048,.065,.065);
  for(const x of [-.085,.085]){
    ell(body,black,x,1.8,.167,.015,.022,.012);
    const glasses=mesh(body,new T.TorusGeometry(.064,.009,6,20),black,x,1.795,.175);glasses.scale.y=.72;
  }
  rounded(body,black,0,1.795,.177,.05,.009,.009,.001);
  const tie=rounded(body,material('#8e4436'),0,1.30,.20,.065,.34,.018,.006);tie.rotation.z=.08;
  const arms=[];for(const side of [-1,1]){const arm=new T.Group();arm.position.set(side*.29,1.47,0);body.add(arm);ell(arm,shirt,0,-.24,0,.085,.26,.09);ell(arm,skin,0,-.5,.02,.07,.095,.07);arms.push(arm);}
  rounded(body,material('#e2d8be'),.14,1.25,.19,.11,.15,.012,.002);
  const ring=mesh(scene,new T.RingGeometry(.48,.52,48),new T.MeshBasicMaterial({color:'#e6b85f',side:T.DoubleSide,transparent:true,opacity:.7,depthWrite:false}),6,.03,0);ring.rotation.x=-Math.PI/2;
  ring.visible=false;
  let stun=0;
  return {root,ring,get stunned(){return stun>0;},hit(attacker,obstacles){stun=1.7;const dx=root.position.x-attacker.x,dz=root.position.z-attacker.z,d=Math.hypot(dx,dz)||1;move(root.position,dx/d*.72,dz/d*.72,obstacles);},update(dt,time,player,obstacles){
    stun=Math.max(0,stun-dt);let walking=false;
    if(stun<=0){const dx=6-root.position.x,dz=-root.position.z,d=Math.hypot(dx,dz);if(d>.08){move(root.position,dx/d*dt*.8,dz/d*dt*.8,obstacles);walking=true;}}
    root.rotation.y=Math.atan2(player.x-root.position.x,player.z-root.position.z);
    body.rotation.x=stun>0?-Math.sin(Math.min(1,stun/1.7)*Math.PI)*.7:0;
    body.rotation.z=stun>0?Math.sin(time*24)*stun*.04:0;
    legs.forEach((leg,i)=>leg.rotation.x=walking?Math.sin(time*9+i*Math.PI)*.3:0);
    arms.forEach((arm,i)=>arm.rotation.x=stun>0?-1.2:Math.sin(time*2+i)*.07);
    ring.position.set(root.position.x,.035,root.position.z);
  }};
}
