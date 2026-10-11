import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {KEY_ROWS,MISSING_KEYS,ATTACK_DURATION} from './office3d-combat.mjs';
import {move} from './office3d-controller.mjs';

const UP=new T.Vector3(0,1,0);
function material(color,roughness=.85){return new T.MeshStandardMaterial({color,roughness});}
function mesh(parent,geometry,mat,x=0,y=0,z=0){const obj=new T.Mesh(geometry,mat);obj.position.set(x,y,z);obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;}
function ell(parent,mat,x,y,z,sx,sy,sz){const obj=mesh(parent,new T.SphereGeometry(1,28,20),mat,x,y,z);obj.scale.set(sx,sy,sz);return obj;}
function rounded(parent,mat,x,y,z,w,h,d,r=.03){return mesh(parent,new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),mat,x,y,z);}

// Actual geometric tapered locks, distributed over an ellipsoid. No camera-facing
// animal cards: the silhouette, face, fingers and coat remain volumetric at any angle.
function coat(parent,center,radii,count,length,seed=1){
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute([
    -.42,0,0,.42,0,0,.21,.62,.14, -.42,0,0,.21,.62,.14,0,1,.32,
    0,0,-.3,0,0,.3,.12,.62,.16, 0,0,-.3,.12,.62,.16,0,1,.32,
  ],3));geo.computeVertexNormals();
  const mat=new T.MeshStandardMaterial({color:'#ddd0b4',roughness:1,side:T.DoubleSide});
  const fur=new T.InstancedMesh(geo,mat,count),dummy=new T.Object3D(),color=new T.Color();
  const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<count;i++){
    const y=1-2*(i+.5)/count,a=i*2.399963,n=new T.Vector3(Math.sqrt(1-y*y)*Math.cos(a),y,Math.sqrt(1-y*y)*Math.sin(a));
    dummy.position.set(center[0]+n.x*radii[0],center[1]+n.y*radii[1],center[2]+n.z*radii[2]);
    const normal=new T.Vector3(n.x/radii[0],n.y/radii[1],n.z/radii[2]).normalize();
    const direction=normal.multiplyScalar(.8).add(new T.Vector3(0,-.45,-.22)).normalize();
    dummy.quaternion.setFromUnitVectors(UP,direction);dummy.rotateY(rand()*Math.PI*2);
    const size=.6+rand()*.8;dummy.scale.set(length*.20*size,length*size,length*.2*size);dummy.updateMatrix();fur.setMatrixAt(i,dummy.matrix);
    color.setHSL(.105+rand()*.025,.18+rand()*.15,.36+rand()*.36);fur.setColorAt(i,color);
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
  const root=new T.Group();root.name='Leha — volumetric boar';root.position.set(6,0,4.5);scene.add(root);
  const body=new T.Group();root.add(body);
  const fur=material('#a99472'),face=material('#51443d'),hoof=material('#272421',.55),inner=material('#655349'),eye=material('#d7b783',.35),black=material('#10100e',.25);
  ell(body,fur,0,1.04,-.04,.64,.78,.47);coat(body,[0,1.04,-.04],[.64,.78,.47],8500,.15,2);
  // Hunched neck and prominent shoulder mane from the reference.
  ell(body,fur,0,1.58,-.12,.48,.45,.4);coat(body,[0,1.58,-.12],[.48,.45,.4],2200,.20,4);
  const head=new T.Group();head.position.set(0,1.74,.17);body.add(head);
  ell(head,fur,0,0,.02,.41,.36,.37);coat(head,[0,0,.02],[.41,.36,.37],2500,.085,6);
  ell(head,face,0,-.10,.34,.27,.19,.34);
  ell(head,face,0,-.065,.57,.245,.18,.09);
  for(const x of [-.103,.103]){
    const rim=mesh(head,new T.TorusGeometry(.065,.018,10,24),inner,x,-.045,.644);rim.scale.set(.83,1.15,.65);
    ell(head,black,x,-.045,.644,.045,.065,.012);
  }
  // Muzzle crease and lower lip keep the snout distinct from a sphere.
  ell(head,hoof,0,-.224,.39,.18,.017,.17);
  for(const side of [-1,1]){
    ell(head,face,side*.267,.047,.27,.12,.085,.065);
    ell(head,eye,side*.266,.048,.319,.070,.047,.034);
    ell(head,black,side*.259,.049,.349,.025,.038,.012);
    ell(head,material('#fff5d5',.2),side*.26-.012,.066,.359,.009,.01,.006);
    const brow=ell(head,fur,side*.265,.112,.32,.132,.040,.053);brow.rotation.z=side*.3;
    const ear=new T.Group();ear.position.set(side*.30,.26,-.03);ear.rotation.z=-side*.38;head.add(ear);
    // Curved pointed ears with a dark recessed interior.
    const shape=new T.Shape();shape.moveTo(-.12,0);shape.quadraticCurveTo(-.15,.22,0,.40);shape.quadraticCurveTo(.18,.18,.12,0);shape.closePath();
    mesh(ear,new T.ExtrudeGeometry(shape,{depth:.055,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.022}),fur,0,0,0);
    const inside=mesh(ear,new T.ShapeGeometry(shape),inner,0,.03,.084);inside.scale.set(.65,.76,1);
    coat(ear,[0,.13,.02],[.10,.16,.045],260,.045,side+10);
  }
  const legs=[];
  for(const side of [-1,1]){
    const leg=new T.Group();leg.position.set(side*.30,.59,0);root.add(leg);legs.push(leg);
    ell(leg,fur,0,-.18,0,.20,.31,.21);coat(leg,[0,-.18,0],[.20,.30,.21],650,.08,side+30);
    for(const toe of [-1,1])ell(leg,hoof,toe*.070,-.49,.115,.078,.10,.20);
  }
  const arms=new T.Group();arms.position.y=1.24;body.add(arms);
  for(const side of [-1,1]){
    const upper=ell(arms,fur,side*.52,.025,.16,.21,.32,.22);upper.rotation.z=side*.22;
    coat(arms,[side*.52,.025,.16],[.21,.32,.22],900,.10,side+40);
    const lower=ell(arms,fur,side*.48,-.12,.43,.19,.19,.32);lower.rotation.y=side*-.3;
    coat(arms,[side*.48,-.12,.43],[.19,.19,.30],850,.08,side+60);
  }
  const board=keyboard(arms);board.position.set(0,-.15,.70);board.rotation.x=.12;
  for(const side of [-1,1]){
    ell(arms,face,side*.53,-.15,.71,.15,.15,.10);
    for(let i=0;i<3;i++){const finger=ell(arms,hoof,side*(.48+i*.03),-.09-i*.065,.80,.085,.028,.05);finger.rotation.z=side*-.25;}
  }
  const tailCurve=new T.CatmullRomCurve3([new T.Vector3(0,.82,-.45),new T.Vector3(.12,.80,-.60),new T.Vector3(.17,.91,-.62),new T.Vector3(.09,.95,-.59)]);
  mesh(body,new T.TubeGeometry(tailCurve,16,.022,6,false),fur);
  return {root,animate(time,moving,attack){
    const phase=1-attack/ATTACK_DURATION;
    const swing=attack>0?Math.sin(phase*Math.PI):0;
    legs.forEach((leg,i)=>leg.rotation.x=moving?Math.sin(time*11+i*Math.PI)*.46:0);
    body.position.y=moving?Math.abs(Math.sin(time*11))*.035:Math.sin(time*2)*.008;
    body.rotation.z=moving?Math.sin(time*11)*.025:0;
    arms.rotation.x=-swing*.9;arms.position.z=swing*.32;
    head.rotation.y=Math.sin(time*.7)*.045;head.rotation.x=attack>0?swing*.12:0;
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
