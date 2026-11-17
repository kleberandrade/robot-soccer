import type { Match } from '../src/sim/engine';
export default function PlanView({state}:{state:Match}){
 const c=state.config;
 return <svg className="plan" role="img" aria-label="Top-down field with six robots and the ball" viewBox={`${-c.length/2-.12} ${-c.width/2-.12} ${c.length+.24} ${c.width+.24}`}>
  <rect x={-c.length/2} y={-c.width/2} width={c.length} height={c.width} fill="#24574e" stroke="#cad9d5" strokeWidth=".006"/>
  <path d={`M0 ${-c.width/2} V${c.width/2}`} stroke="#cad9d5" strokeWidth=".004"/><circle r=".15" fill="none" stroke="#cad9d5" strokeWidth=".004"/>
  {state.robots.map(r=><g key={r.id} transform={`translate(${r.x} ${r.y})`}><rect x="-.0375" y="-.0375" width=".075" height=".075" fill={r.team==='blue'?'#4db9ff':'#ffd36b'}/><text textAnchor="middle" dominantBaseline="central" fontSize=".04" fill="#11222c">{r.id.slice(-1)}</text></g>)}
  <circle cx={state.ball.x} cy={state.ball.y} r=".02135" fill="#ff781f"/>
 </svg>;
}
