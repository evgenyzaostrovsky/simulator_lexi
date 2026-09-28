import React,{useEffect,useRef,useState} from 'react';
import {createGame,updateGame} from './office-engine.mjs';
import {createRenderer} from './office-renderer.mjs';
import './game.css';

export default function OfficeGame(){
  const canvas=useRef(null),controls=useRef({left:false,right:false,jump:false,attack:false,dash:false,drop:false});
  const [round,setRound]=useState(0),[hud,setHud]=useState({score:0,message:'Догони всех девятерых. Дедлайн не ждёт.'}),[paused,setPaused]=useState(false);
  const pause=useRef(false);
  useEffect(()=>{
    const s=createGame(),draw=createRenderer(canvas.current),input=controls.current;
    for(const key in input)input[key]=false;pause.current=false;setPaused(false);setHud({score:0,message:s.message});
    let frame,last=0,published='';
    const keys=new Set();
    const action={Space:'jump',KeyW:'jump',ArrowUp:'jump',KeyJ:'attack',KeyX:'attack',ShiftLeft:'dash',ShiftRight:'dash',ArrowDown:'drop',KeyS:'drop'};
    function down(e){
      if(e.code==='Escape'){e.preventDefault();pause.current=!pause.current;setPaused(pause.current);keys.clear();input.left=input.right=false;return;}
      if(['KeyA','KeyD','ArrowLeft','ArrowRight',...Object.keys(action)].includes(e.code)){
        e.preventDefault();keys.add(e.code);
        input.left=keys.has('KeyA')||keys.has('ArrowLeft');input.right=keys.has('KeyD')||keys.has('ArrowRight');
        if(action[e.code]&&!e.repeat&&!pause.current)input[action[e.code]]=true;
      }
    }
    function up(e){keys.delete(e.code);input.left=keys.has('KeyA')||keys.has('ArrowLeft');input.right=keys.has('KeyD')||keys.has('ArrowRight');}
    function blur(){keys.clear();for(const key in input)input[key]=false;pause.current=true;setPaused(true);}
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);
    function tick(now){
      const dt=Math.min((now-(last||now))/1000,.033);last=now;
      if(!pause.current)updateGame(s,input,dt);
      draw(s,pause.current?0:dt);
      const status=s.score+s.message;if(status!==published){published=status;setHud({score:s.score,message:s.message});}
      frame=requestAnimationFrame(tick);
    }
    frame=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);};
  },[round]);
  const hold=key=>({onPointerDown:e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);controls.current[key]=true;},onPointerUp:()=>controls.current[key]=false,onPointerCancel:()=>controls.current[key]=false,onLostPointerCapture:()=>controls.current[key]=false});
  return <section className="office-game"><div className="game-heading"><div><div className="label">02 / ОФИСНЫЙ ЭКШЕН</div><h2>Дедлайн уже вчера.</h2></div><strong>СРОЧНЫЕ ЗАДАЧИ<br/><b>{hud.score} / 9</b></strong></div>
    <p>A / D или ← → — бег · пробел — двойной прыжок · Shift — рывок · J / X — удар · ↓ — спуститься · Esc — пауза</p>
    <div className="game-stage"><canvas ref={canvas} width="960" height="540" aria-label="Офисный платформер с видом сбоку"/>{paused&&<button className="pause-overlay" onClick={()=>{pause.current=false;setPaused(false);}}>ПАУЗА · ПРОДОЛЖИТЬ ▶</button>}</div>
    <div className="game-controls"><div className="dpad"><button {...hold('left')} aria-label="Бежать влево">←</button><button {...hold('right')} aria-label="Бежать вправо">→</button></div><button onClick={()=>controls.current.jump=true}>Прыжок ↑</button><button onClick={()=>controls.current.dash=true}>Рывок ⇢</button><button onClick={()=>controls.current.drop=true}>Спуститься ↓</button><button className="hit-button" onClick={()=>controls.current.attack=true}>УДАРИТЬ КЛАВОЙ</button><button onClick={()=>setRound(v=>v+1)}>Заново ↻</button></div>
    <p className="game-message" role="status">{hud.message}</p><p>Два нажатия прыжка помогут подняться на следующий этаж. Леха бьёт в ту сторону, куда смотрит.</p>
  </section>;
}
