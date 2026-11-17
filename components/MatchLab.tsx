'use client';
import dynamic from 'next/dynamic';
import Plan from './PlanView';
import { useEffect,useRef,useState } from 'react';
import { CONFIG,createMatch,referee,advance,type Match,type Action,type Strategy } from '../src/sim/engine';
import type { MatchRow } from '../src/db';
const Arena=dynamic(()=>import('./Arena'),{ssr:false,loading:()=> <div className="arena-loading">Preparing 3D field…</div>});
type Packet=MatchRow&{frames?:Match[]};
const time=(ticks:number)=>`${Math.floor(ticks/3600).toString().padStart(2,'0')}:${Math.floor(ticks/60)%60<10?'0':''}${Math.floor(ticks/60)%60}`;
export default function MatchLab(){
 const [shown,setShown]=useState<Match>(()=>createMatch()),[row,setRow]=useState<MatchRow|null>(null);
 const live=useRef<Match>(shown),server=useRef<MatchRow|null>(null),queue=useRef<Match[]>([]),inflight=useRef(false),generation=useRef(0);
 const [token,setToken]=useState(''),tokenRef=useRef('');tokenRef.current=token;
 const [message,setMessage]=useState('Local preview. Connect a dedicated database to save server matches.'),[busy,setBusy]=useState(false);
 const [trail,setTrail]=useState<[number,number][]>([]),[trails,setTrails]=useState(true),[plan,setPlan]=useState(false);
 const [config,setConfig]=useState({...CONFIG}),[strategies,setStrategies]=useState<Record<'blue'|'yellow',Strategy>>({blue:'balanced',yellow:'press'}),[matchId,setMatchId]=useState('');
 function receive(packet:Packet){server.current=packet;live.current=packet.state;setRow(packet);if(packet.frames?.length)queue.current.push(...packet.frames);else{queue.current=[];setShown(packet.state);}}
 async function request(url:string,method='GET',data?:unknown):Promise<Packet>{
  const response=await fetch(url,{method,headers:{'Content-Type':'application/json',...(tokenRef.current?{Authorization:`Bearer ${tokenRef.current}`}:{})},body:data?JSON.stringify(data):undefined,cache:'no-store'});
  const packet=await response.json();if(!response.ok)throw new Error(packet.error??'Request failed');return packet;
 }
 useEffect(()=>{
  const timer=setInterval(async()=>{
   const s=live.current;
   if(!server.current){if(['running','halftime','timeout'].includes(s.phase)){const next=advance(s,6);live.current=next;setShown(next);}return;}
   const frame=queue.current.shift();if(frame){setShown(frame);return;}
   if(inflight.current)return;
   const ownGeneration=generation.current;inflight.current=true;
   try{
    const current=server.current;
    const packet=tokenRef.current&&['running','halftime','timeout'].includes(current.state.phase)
     ?await request(`/api/matches/${current.id}`,'PATCH',{revision:current.revision,action:'advance',ticks:120})
     :await request(`/api/matches/${current.id}`);
    if(ownGeneration===generation.current)receive(packet);
   }catch(e){setMessage(e instanceof Error?e.message:'Connection lost');}finally{inflight.current=false;}
  },100);
  return ()=>clearInterval(timer);
 // The timer reads current values from refs, avoiding stale closures and interval churn.
 },[]);
 useEffect(()=>{if(trails)setTrail(t=>[...t.slice(-100),[shown.ball.x,shown.ball.y]]);},[shown.tick,trails,shown.ball.x,shown.ball.y]);
 async function action(action:Action){
  if(inflight.current)return;setBusy(true);inflight.current=true;
  try{queue.current=[];if(server.current){const c=server.current;receive(await request(`/api/matches/${c.id}`,'PATCH',{revision:c.revision,action}));}else{live.current=referee(live.current,action);setShown(live.current);}if(action==='reset')setTrail([]);}
  catch(e){setMessage(e instanceof Error?e.message:'Action failed');}finally{inflight.current=false;setBusy(false);}
 }
 async function connect(load=false){
  if(inflight.current)return;inflight.current=true;setBusy(true);generation.current++;
  try{const p=load?await request(`/api/matches/${matchId}`):await request('/api/matches','POST',{config,strategies});receive(p);setMatchId(p.id);setTrail([]);setMessage(`Server match connected · ${p.id}`);}
  catch(e){setMessage(e instanceof Error?e.message:'Connection failed');}finally{inflight.current=false;setBusy(false);}
 }
 const active=shown.phase==='running',canReferee=!row||Boolean(token),teamRobots=(team:string)=>shown.robots.filter(r=>r.team===team);
 return <main className="shell">
  <header className="topbar"><a className="brand" href="/"><span className="brand-icon">R<span>·</span>S</span> ROBOT-SOCCER</a><nav aria-label="Main navigation"><a className="selected" href="#arena">Match lab</a><a href="https://github.com/kleberandrade/robot-soccer#readme">Documentation ↗</a><a href="https://github.com/kleberandrade/robot-soccer/tree/master/hardware">Hardware ↗</a></nav><span className="edition">VSSS / 3 × 3</span></header>
  <section className="intro"><div><p className="eyebrow">AUTONOMOUS ROBOTICS / OPEN LABORATORY</p><h1>Small robots.<br/><span>Big match energy.</span></h1><p className="intro-copy">Build a team. Test a strategy. Watch six autonomous robots find their way to goal.</p></div><div className="intro-stat"><strong>06</strong><span>ROBOTS ON THE FIELD</span><small>One ball. Two teams. No human driving.</small></div></section>
  <section className="workspace" id="arena">
   <div className="match-column"><div className="arena-card"><div className="arena-top"><div><span className="live-dot"/> <strong>{row?'SERVER MATCH':'LOCAL PREVIEW'}</strong><span className="muted"> / {row?'PostgreSQL checkpoints':'not saved'}</span></div><span className="phase">{shown.phase}</span></div>
    <div className="scoreboard"><div className="team-name"><span className="team-dot blue"/><div><strong>AMERICANA</strong><small>{shown.strategies.blue} · blue team</small></div></div><div className="score"><span>{shown.score.blue}</span><i>:</i><span>{shown.score.yellow}</span><small>{time(shown.elapsedTicks)} <b>H{shown.period}</b></small></div><div className="team-name away"><div><strong>CIRCUIT</strong><small>{shown.strategies.yellow} · yellow team</small></div><span className="team-dot yellow"/></div></div>
    <div className="arena-view" aria-label="Live robot soccer field">{plan?<Plan state={shown}/>:<Arena state={shown} trail={trails?trail:[]}/>}<div className="arena-legend">{shown.config.length.toFixed(2)} × {shown.config.width.toFixed(2)} m <span>FIXED STEP 60 Hz</span></div></div>
    <div className="viewbar"><span>↔ Drag to orbit <span className="muted">· Scroll to zoom</span></span><div><button className="quiet" aria-pressed={trails} onClick={()=>setTrails(!trails)}>Ball trail</button><button className="quiet" aria-pressed={plan} onClick={()=>setPlan(!plan)}>{plan?'3D view':'2D fallback'}</button></div></div>
   </div>
   <div className="controls-card"><div><p className="eyebrow">REFEREE DESK</p><p>{shown.phase==='halftime'?`Interval · ${time(shown.phaseTicks)} / ${time(shown.config.intervalSeconds*60)}`:shown.phase==='timeout'?`Technical timeout · ${time(shown.phaseTicks)} / ${time(shown.config.timeoutSeconds*60)}`:'Teams drive autonomously. You manage the match.'}</p></div><div className="controls"><button className="primary" disabled={busy||!canReferee||!['ready','paused','running'].includes(shown.phase)} onClick={()=>action(active?'pause':'start')}>{active?'Ⅱ Pause':'▶ Start match'}</button><button disabled={busy||!canReferee} onClick={()=>action('reset')}>↺ Reset</button><button disabled={!active||shown.timeouts.blue||busy||!canReferee} onClick={()=>action('timeout-blue')}>Blue timeout</button><button disabled={!active||shown.timeouts.yellow||busy||!canReferee} onClick={()=>action('timeout-yellow')}>Yellow timeout</button></div></div>
   <div className="statusbar" role="status"><span className={row?'connected':'muted'}>● {row?'Connected to server':'Preview mode'}</span><span>{message}</span></div>
   </div>
   <aside><section className="panel"><div className="panel-heading"><span className="eyebrow">01 / LINEUP</span><span className="pill">AUTONOMOUS</span></div><h2>Meet the teams</h2>{(['blue','yellow'] as const).map(team=><div className="roster" key={team}><div className="roster-title"><span className={`team-dot ${team}`}/><strong>{team==='blue'?'Americana':'Circuit'}</strong><span>{team.toUpperCase()}</span></div>{teamRobots(team).map(r=><div className="robot-row" key={r.id}><span className={`number ${team}`}>{r.id.slice(-1)}</span><span>{r.role}</span><code>{((r.left+r.right)/2).toFixed(2)} m/s</code></div>)}</div>)}</section>
   <details className="panel config-panel"><summary>02 / Configure & connect</summary><p className="help">Configuration applies to a new match. Preview is local; server matches use a dedicated PostgreSQL database.</p><div className="form-grid">{(['length','width','halfSeconds','intervalSeconds','timeoutSeconds'] as const).map(key=><label key={key}>{({length:'Length (m)',width:'Width (m)',halfSeconds:'Half (s)',intervalSeconds:'Interval (s)',timeoutSeconds:'Timeout (s)'})[key]}<input type="number" step={key==='length'||key==='width'?.1:1} value={config[key]} onChange={e=>setConfig({...config,[key]:Number(e.target.value)})}/></label>)}</div>{(['blue','yellow'] as const).map(team=><label key={team}>{team} strategy<select value={strategies[team]} onChange={e=>setStrategies({...strategies,[team]:e.target.value as Strategy})}><option value="balanced">Balanced roles</option><option value="press">High press</option></select></label>)}<button disabled={busy} onClick={()=>{try{const next=createMatch(config,strategies);generation.current++;server.current=null;setRow(null);queue.current=[];live.current=next;setShown(next);setTrail([]);setMessage('Local preview configured.');}catch{setMessage('Invalid configuration: check field sizes and timings.');}}}>Apply to preview</button><label>Operator token<input type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)} placeholder="Server token · never stored"/></label><button className="primary full" disabled={busy||token.length<32} onClick={()=>connect()}>Create server match</button><label>Existing match ID<input value={matchId} onChange={e=>setMatchId(e.target.value)} placeholder="UUID"/></label><button disabled={busy||!matchId} onClick={()=>connect(true)}>Connect / spectate</button>{row?<a className="replay-link" href={`/api/matches/${row.id}/replay`} target="_blank" rel="noreferrer">Open replay chunks ↗</a>:null}</details>
   <section className="note"><span>THE LAB, NOT THE LEAGUE</span><p>Perfect simulated observations. Approximate contact physics. Competition rules and physical robots require separate validation.</p><a href="https://github.com/kleberandrade/robot-soccer/tree/master/docs">Read the scope & assumptions ↗</a></section></aside>
  </section><footer><span>ROBOT-SOCCER <b> / </b> Built to experiment.</span><span>Origin: Fatec Americana · MIT · v0.1</span></footer>
 </main>;
}