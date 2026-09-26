import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

const samples = ['Сегодня всё должно быть идеально', 'Леха снова забыл поставить запятые', 'Срочно проверь этот важный текст'];
const rageAngles = [-17, 12, -7, 21, 4, -25];

function insertCommas(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return text;
  const points = Math.max(1, Math.floor(words.length / 3));
  const indexes = [...Array(words.length - 1).keys()].sort(() => Math.random() - .5).slice(0, points);
  return words.map((word, i) => word + (indexes.includes(i) ? ',' : '')).join(' ');
}

function App() {
  const [text, setText] = useState('');
  const [raging, setRaging] = useState(false);
  const generate = () => setText(samples[Math.floor(Math.random() * samples.length)]);
  const commafy = () => setText(insertCommas(text));
  return <main className={raging ? 'app raging' : 'app'}>
    <div className="grain" />
    <header><div className="logo-mark">L</div><div><div className="eyebrow">ЛАБОРАТОРИЯ ПУНКТУАЦИИ</div><h1>СИМУЛЯТОР <span>ЛЕХИ</span></h1></div><div className="status"><i/> ONLINE</div></header>
    <section className="hero"><div className="hero-copy"><div className="label">01 / ВВЕДИТЕ ТЕКСТ</div><h2>Сделаем красиво.<br/><em>Поставим запятые.</em></h2><p>Вставьте свой текст без запятых — Леха разберётся.</p></div><div className="sticker">БЕЗ<br/>ЗАПЯТЫХ<br/><b>ЛЕГКО</b></div></section>
    <section className="workbench"><div className="field-head"><span>ТЕКСТ ДЛЯ ОБРАБОТКИ</span><span className="counter">{text.length} / 500</span></div><textarea maxLength="500" value={text} onChange={e=>setText(e.target.value.replaceAll(',', ''))} placeholder="Напишите что-нибудь без запятых..."/><div className="actions"><button className="comma-btn" onClick={commafy}><span>✦</span> ВБРОСИТЬ ЗАПЯТЫЕ <kbd>⌘ ↵</kbd></button><button className="generate" onClick={generate}>сгенерировать текст <span>↗</span></button></div></section>
    <button className="urgent" onClick={()=>{setRaging(true); setTimeout(()=>setRaging(false), 3800)}}><span>СРОЧНО!!!</span><small>НАЖМИ, ЕСЛИ ГОРОД ГОРИТ</small></button>
    <footer><span>ЛЕХА НЕ ОДОБРЯЕТ ТИШИНУ</span><span>© 2026 / ВЕРСИЯ 1.0</span></footer>
    {raging && <div className="rage-overlay">{rageAngles.map((angle,i)=><div key={i} className="rage-card" style={{'--angle':`${angle}deg`,'--delay':`${i*45}ms`}}><div className="rage-text">СРОЧНО<br/>БЛЕАТЬ!!1</div><img src="/rage.png"/></div>)}<div className="rage-flash">СРОЧНО БЛЕАТЬ!!1</div></div>}
  </main>
}
createRoot(document.getElementById('root')).render(<App/>);
