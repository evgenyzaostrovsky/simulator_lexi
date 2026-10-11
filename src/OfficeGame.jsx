import React,{useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {createOffice,createBoar} from './office3d-world';
import {move,roomAt} from './office3d-controller.mjs';
import './game.css';
import './office3d.css';
import {roomLabel} from './office3d-labels.mjs';
import {createEmployee} from './office3d-characters';
import {canHit,ATTACK_DURATION,IMPACT_TIME} from './office3d-combat.mjs';

export default function OfficeGame(){
  const host=useRef(null),start=useRef(()=>{});
  const [active,setActive]=useState(false),[error,setError]=useState(''),[room,setRoom]=useState('Кабинет босса'),[away,setAway]=useState(false),[fallback,setFallback]=useState(false);
  const [hits,setHits]=useState(0),[near,setNear]=useState(false),[rage,setRage]=useState(false);
  useEffect(()=>{
    const el=host.current;let renderer;
    try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch{setError('Не удалось запустить WebGL. Попробуйте браузер с включённым аппаратным ускорением.');return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;el.appendChild(renderer.domElement);
    const scene=new T.Scene();scene.background=new T.Color('#777c76');scene.add(new T.HemisphereLight('#e3efff','#61503a',1.6));
    const sun=new T.DirectionalLight('#fff0d3',2.4);sun.position.set(-8,14,-12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-17,right:17,top:17,bottom:-17,near:.5,far:50});sun.shadow.normalBias=.025;scene.add(sun);
    const {obstacles,cameraObjects}=createOffice(scene),boar=createBoar(scene),employee=createEmployee(scene),camera=new T.PerspectiveCamera(58,1,.07,80);
    const keys=new Set(),ray=new T.Raycaster(),target=new T.Vector3(),desired=new T.Vector3(),direction=new T.Vector3();
    boar.root.rotation.y=Math.PI;
    let yaw=0,pitch=.28,velocity=0,attack=0,locked=false,dragMode=false,dragging=false,frame,last=performance.now(),elapsed=0,awayTime=0,lastRoom='',lastAway=false,wasNear=false,rageTime=0;
    const canvas=renderer.domElement;
    const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(el);resize();
    const enableDrag=()=>{dragMode=true;locked=true;setActive(true);setFallback(true);};
    start.current=()=>{if(dragMode){enableDrag();return;}try{const result=canvas.requestPointerLock();result?.catch(enableDrag);}catch{enableDrag();}};
    const lock=()=>{locked=document.pointerLockElement===canvas;setActive(locked);keys.clear();};
    const mouse=e=>{if(locked&&(!dragMode||dragging)){yaw-=e.movementX*.0024;pitch=T.MathUtils.clamp(pitch+e.movementY*.002,-.12,.95);}};
    const down=e=>{if(!locked)return;if(e.code==='Escape'){locked=false;setActive(false);keys.clear();return;}if(['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight','KeyE'].includes(e.code))e.preventDefault();keys.add(e.code);if(!e.repeat&&e.code==='Space'&&boar.root.position.y<=.001)velocity=5;if(!e.repeat&&e.code==='KeyE'&&attack<=0)attack=ATTACK_DURATION;};
    const up=e=>keys.delete(e.code),blur=()=>{keys.clear();dragging=false;if(dragMode){locked=false;setActive(false);}},dragStart=()=>{dragging=true;},dragEnd=()=>{dragging=false;};
    canvas.addEventListener('mousedown',dragStart);window.addEventListener('mouseup',dragEnd);
    document.addEventListener('pointerlockchange',lock);document.addEventListener('mousemove',mouse);window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);
    function tick(now){
      frame=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.04);last=now;
      let moving=false;
      if(locked){elapsed+=dt;let x=Number(keys.has('KeyD'))-Number(keys.has('KeyA')),z=Number(keys.has('KeyS'))-Number(keys.has('KeyW'));const length=Math.hypot(x,z);moving=length>0;
        if(moving){x/=length;z/=length;const dx=x*Math.cos(yaw)+z*Math.sin(yaw),dz=-x*Math.sin(yaw)+z*Math.cos(yaw),speed=keys.has('ShiftLeft')||keys.has('ShiftRight')?5.2:2.8;move(boar.root.position,dx*speed*dt,dz*speed*dt,[...obstacles,{x:employee.root.position.x-.2,z:employee.root.position.z-.2,w:.4,d:.4}]);const angle=Math.atan2(dx,dz);boar.root.rotation.y+=Math.atan2(Math.sin(angle-boar.root.rotation.y),Math.cos(angle-boar.root.rotation.y))*Math.min(1,dt*14);}
        velocity-=13*dt;boar.root.position.y=Math.max(0,boar.root.position.y+velocity*dt);if(boar.root.position.y===0)velocity=0;const previousAttack=attack;attack=Math.max(0,attack-dt);
        const impact=ATTACK_DURATION-IMPACT_TIME;
        if(previousAttack>impact&&attack<=impact&&!employee.stunned&&canHit(boar.root.position,boar.root.rotation.y,employee.root.position,obstacles)){
          employee.hit(boar.root.position,obstacles);setHits(n=>n+1);rageTime=.65;setRage(true);
        }
        if(rageTime>0){rageTime=Math.max(0,rageTime-dt);if(rageTime===0)setRage(false);}
        employee.update(dt,elapsed,boar.root.position,obstacles);
        const inRange=!employee.stunned&&canHit(boar.root.position,boar.root.rotation.y,employee.root.position,obstacles);
        employee.ring.visible=inRange;if(inRange!==wasNear){wasNear=inRange;setNear(inRange);}

        const r=roomAt(boar.root.position.x,boar.root.position.z);if(r!==lastRoom){lastRoom=r;setRoom(r);}awayTime=r==='Кабинет босса'?0:awayTime+dt;const reminder=awayTime>60;if(reminder!==lastAway){lastAway=reminder;setAway(reminder);}
      }
      boar.animate(elapsed,moving,attack,yaw);target.copy(boar.root.position);target.y+=1.2;desired.set(Math.sin(yaw)*4.4,.45+Math.sin(pitch)*4.4,Math.cos(yaw)*4.4).add(target);direction.copy(desired).sub(target);const distance=direction.length();direction.normalize();scene.updateMatrixWorld(true);ray.set(target,direction);ray.far=distance;const hit=ray.intersectObjects(cameraObjects,false)[0];camera.position.copy(target).addScaledVector(direction,hit?Math.max(.2,hit.distance-.2):distance);camera.lookAt(target);renderer.render(scene,camera);
    }
    frame=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener('mousedown',dragStart);window.removeEventListener('mouseup',dragEnd);if(document.pointerLockElement===canvas)document.exitPointerLock();document.removeEventListener('pointerlockchange',lock);document.removeEventListener('mousemove',mouse);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});materials.forEach(m=>{Object.values(m).forEach(v=>{if(v?.isTexture)textures.add(v);});m.dispose();});textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());renderer.dispose();canvas.remove();};
  },[]);
  return <section className="office-game office-three"><div className="office-three-heading"><div><small>СИМУЛЯТОР ЛЕХИ / 3D</small><h2>Офис. После дедлайна.</h2></div><span>Свободное исследование</span></div><div ref={host} className="office-three-viewport">{rage&&<div key={hits} className="office-strike-flash" aria-live="polite"><b>СРОЧНО , БЛЕАТЬ ! ! 1</b><span>+1 • ДЕДЛАЙН ДОСТАВЛЕН</span></div>}<div className="office-three-hud"><strong>{roomLabel(room)}</strong><span>Сотрудник в коридоре • попаданий: {hits}</span><span>{near?'E — ударить клавиатурой':'Подойдите к сотруднику и повернитесь к нему'}</span>{fallback&&<span>Камера: удерживайте левую кнопку мыши и двигайте мышь</span>}<span>{away?'Пора к боссу • кабинет справа от коридора':'Четыре комнаты • один очень срочный сотрудник'}</span></div>{!active&&<div className="office-three-pause"><div><small>ЛЕХА НА РАБОТЕ</small><h2>Дедлайн сам себя<br/>не сорвёт.</h2><p>Объёмный Леха уже на работе. Сотрудник ждёт в коридоре.<br/>Подойдите к нему лицом и нажмите E. На клаве нет С, Р, О, Ч, Н и 1/!.</p>{error?<p role="alert">{error}</p>:<button onClick={()=>start.current()}>Войти в офис →</button>}<p>WASD — движение · Shift — бег · Пробел — прыжок<br/>Мышь — камера · E — удар клавиатурой · Esc — пауза</p></div></div>}</div><p className="office-three-controls">W A S D / движение　 SHIFT / ускорение　 ПРОБЕЛ / прыжок　 E / удар　 МЫШЬ / камера　 ESC / пауза</p></section>;
}
