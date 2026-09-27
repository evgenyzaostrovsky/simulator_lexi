import React, {useLayoutEffect, useRef} from 'react';
export default function CommaFlight({text, button, onComplete}) {
  const layer = useRef(null);
  useLayoutEffect(() => {
    const root = layer.current;
    const targets = [...root.querySelectorAll('.comma-target')];
    const particles = targets.map(() => Array.from({length: 10}, () => {
      const node = document.createElement('span');
      node.className = 'comet-particle'; node.textContent = ','; root.append(node); return node;
    }));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 180 : 1000;
    let frame;
    const start = performance.now();
    function draw(now) {
      const bounds = root.getBoundingClientRect();
      const source = button.current.getBoundingClientRect();
      const sx = source.left + source.width / 2 - bounds.left;
      const sy = source.top + source.height / 2 - bounds.top;
      targets.forEach((target, index) => {
        const rect = target.getBoundingClientRect();
        const tx = rect.left - bounds.left, ty = rect.top - bounds.top;
        const elapsed = now - start - index * 65;
        target.style.opacity = elapsed >= duration ? '1' : '0';
        particles[index].forEach((node, tail) => {
          const t = Math.max(0, Math.min(1, (elapsed - tail * 22) / duration));
          const arc = Math.sin(t * Math.PI);
          const x = sx + (tx - sx) * t + (index % 2 ? 70 : -70) * arc;
          const y = sy + (ty - sy) * t - 110 * arc;
          node.style.transform = `translate(${x}px, ${y}px) scale(${1 - tail * .065})`;
          node.style.opacity = !reduced && t > 0 && t < 1 && elapsed < duration ? String(1 - tail / 10) : '0';
        });
      });
      if (now - start >= duration + (targets.length - 1) * 65 + 60) onComplete();
      else frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); particles.flat().forEach(node => node.remove()); };
  }, [text, button, onComplete]);
  return <div ref={layer} className="flight-text" aria-hidden="true">{text.split(',').map((part, index) => <React.Fragment key={index}>{index > 0 && <span className="comma-target">,</span>}{part}</React.Fragment>)}</div>;
}
