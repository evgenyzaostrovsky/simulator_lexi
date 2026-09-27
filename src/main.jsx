import React, {useState, useRef, useCallback, useLayoutEffect} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';
import './flight.css';
import CommaFlight from './CommaFlight';
import {samples, insertCommas} from './comma-text';
import OfficeGame from './OfficeGame';

const rageAngles = [-17, 12, -7, 21, 4, -25];


function App() {
  const [tab, setTab] = useState('text');
  const [text, setText] = useState('');
  const [raging, setRaging] = useState(false);
  const [flight, setFlight] = useState(null);
  const input = useRef(null);
  const button = useRef(null);
  const finish = useCallback(() => { setText(flight); setFlight(null); }, [flight]);
  useLayoutEffect(() => {
    const resize = () => { input.current.style.height = 'auto'; input.current.style.height = `${input.current.scrollHeight + 2}px`; };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(input.current.parentElement);
    document.fonts.ready.then(resize);
    return () => observer.disconnect();
  }, [text, flight]);
  const generate = () => setText(samples[Math.floor(Math.random() * samples.length)]);
  const commafy = () => { if (flight !== null) return; const result = insertCommas(text); if (result.includes(',')) setFlight(result); };
  return <main className={raging ? 'app raging' : 'app'}>
    <div className="grain" />
    <header><div className="logo-mark">L</div><div><div className="eyebrow">ЛАБОРАТОРИЯ ПУНКТУАЦИИ</div><h1>СИМУЛЯТОР <span>ЛЕХИ</span></h1></div><div className="status"><i/> ONLINE</div></header>
    <nav className="mode-tabs" aria-label="Режим"><button aria-selected={tab==='text'} onClick={()=>setTab('text')}>Запятые</button><button aria-selected={tab==='game'} onClick={()=>setTab('game')}>Игра · Офисный переполох</button></nav>
    <div hidden={tab!=='text'}>
    <section className="hero"><div className="hero-copy"><div className="label">01 / ВВЕДИТЕ ТЕКСТ</div><h2>Сделаем красиво.<br/><em>Поставим запятые.</em></h2><p>Вставьте свой текст без запятых — Леха разберётся.</p></div><div className="sticker">БЕЗ<br/>ЗАПЯТЫХ<br/><b>ЛЕГКО</b></div></section>
    <section className="workbench"><div className="field-head"><span>ТЕКСТ ДЛЯ ОБРАБОТКИ</span><span className="counter">{(flight ?? text).length} / 500</span></div><div className={`textarea-wrap ${flight !== null ? 'is-flying' : ''}`}><textarea ref={input} aria-label="Текст для обработки" maxLength="500" readOnly={flight !== null} value={flight ?? text} onChange={e=>setText(e.target.value.replaceAll(',', ''))} placeholder="Напишите что-нибудь без запятых..."/>{flight !== null && <CommaFlight text={flight} button={button} onComplete={finish}/>}</div><div className="actions"><button ref={button} disabled={flight !== null || !text.trim()} className="comma-btn" onClick={commafy}><span>✦</span> ВБРОСИТЬ ЗАПЯТЫЕ</button><button disabled={flight !== null} className="generate" onClick={generate}>сгенерировать текст <span>↗</span></button></div></section>
    <button className="urgent" onClick={()=>{setRaging(true); setTimeout(()=>setRaging(false), 3800)}}><span>СРОЧНО!!!</span><small>НАЖМИ, ЕСЛИ ГОРОД ГОРИТ</small></button>
    </div>
    {tab==='game' && <OfficeGame/>}
    <footer><span>ЛЕХА НЕ ОДОБРЯЕТ ТИШИНУ</span><span>© 2026 / ВЕРСИЯ 1.0</span></footer>
    {raging && <div className="rage-overlay">{rageAngles.map((angle,i)=><div key={i} className="rage-card" style={{'--angle':`${angle}deg`,'--delay':`${i*45}ms`}}><div className="rage-text">СРОЧНО<br/>БЛЕАТЬ!!1</div><img src="/rage.png"/></div>)}<div className="rage-flash">СРОЧНО БЛЕАТЬ!!1</div></div>}
  </main>
}
createRoot(document.getElementById('root')).render(<App/>);
