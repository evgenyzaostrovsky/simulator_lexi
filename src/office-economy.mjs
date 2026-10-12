export const SAVE_KEY='lexi-office-economy-v1';
export const KEYBOARDS=[{name:'Офисная развалина',power:.24,cost:0},{name:'Механика',power:.38,cost:100},{name:'Усиленная клавиатура',power:.55,cost:250},{name:'Клавиатура директора',power:.8,cost:550},{name:'Адский дедлайн',power:1.1,cost:1000}];
export const BASE_RATES=[1.05,.72,.24,.40];
export function freshEconomy(){return {version:1,round:1,money:0,level:0,work:[0,0,0,0],boost:[0,0,0,0],idle:[0,0,0,0],earned:0};}
export function restoreEconomy(raw){
  const s=freshEconomy();if(!raw||raw.version!==1)return s;
  for(const k of ['round','money','level','earned'])if(!Number.isSafeInteger(raw[k])||raw[k]<(k==='round'?1:0))return s;
  if(raw.round>10000||raw.level>=KEYBOARDS.length||!Array.isArray(raw.work)||raw.work.length!==4||raw.work.some(v=>!Number.isFinite(v)||v<0))return s;
  const boost=Array.isArray(raw.boost)&&raw.boost.length===4?raw.boost.map(v=>Number.isFinite(v)?Math.max(0,Math.min(1.6,v)):0):s.boost;
  const idle=Array.isArray(raw.idle)&&raw.idle.length===4?raw.idle.map(v=>Number.isFinite(v)?Math.max(0,Math.min(600,v)):0):s.idle;
  return {...s,round:raw.round,money:raw.money,level:raw.level,earned:raw.earned,work:raw.work.map(v=>Math.min(v,quota(raw))),boost,idle};
}
export const quota=s=>30+10*(s.round-1);
export const rate=(s,i)=>(BASE_RATES[i]+s.boost[i])*Math.max(.05,Math.exp(-Math.max(0,(s.idle?.[i]||0)-12)/25));
export const status=(s,i)=>s.work[i]>=quota(s)||rate(s,i)>=1?'green':rate(s,i)>=.65?'yellow':'red';
export const complete=s=>s.work.every(v=>v>=quota(s));
export const reward=s=>100+25*(s.round-1);
export function produce(s,dt){if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,1);for(let i=0;i<4;i++){s.work[i]=Math.min(quota(s),s.work[i]+rate(s,i)*dt);s.boost[i]=Math.max(0,s.boost[i]-.008*dt);s.idle[i]=Math.min(600,s.idle[i]+dt);}}
export function motivate(s,i){if(!Number.isInteger(i)||i<0||i>3||s.work[i]>=quota(s))return false;s.boost[i]=Math.min(1.6,s.boost[i]+KEYBOARDS[s.level].power);s.idle[i]=0;return true;}
export function claim(s,inOffice){if(!inOffice||!complete(s))return 0;const bonus=reward(s);s.money+=bonus;s.earned+=bonus;s.round++;s.work.fill(0);s.boost.fill(0);s.idle.fill(0);return bonus;}
export function upgrade(s,inOffice){const next=KEYBOARDS[s.level+1];if(!inOffice||!next||s.money<next.cost)return false;s.money-=next.cost;s.level++;return true;}
