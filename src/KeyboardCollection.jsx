import React,{useEffect,useRef} from 'react';
import {KEYBOARDS} from './office-economy.mjs';
import {drawKeyboard} from './office-keyboard-art';
function Preview({level}){const ref=useRef(null);useEffect(()=>{const ctx=ref.current.getContext('2d');ctx.clearRect(0,0,240,145);ctx.save();ctx.translate(30,47);drawKeyboard(ctx,level);ctx.restore();},[level]);return <canvas ref={ref} width={240} height={145} aria-label={KEYBOARDS[level].name}/>;}
export default function KeyboardCollection({level}){return <div className="keyboard-collection" aria-label="Пять вариантов клавиатуры">{KEYBOARDS.map((k,i)=><div key={k.name} className={i===level?'equipped-keyboard':''}><Preview level={i}/><b>{i+1}. {k.name}</b><small>{i===level?'ЭКИПИРОВАНА':i<level?'ОТКРЫТА':`${k.cost} ₽`} · +{k.power.toFixed(2)}</small></div>)}</div>;}
