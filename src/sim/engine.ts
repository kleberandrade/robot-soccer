import { z } from 'zod';
import { autonomous } from './teams';
export const DT=1/60;
export const ROBOT_RADIUS=.053, BALL_RADIUS=.02135, WHEEL_BASE=.065;
export const ConfigSchema=z.object({length:z.number().min(1).max(3),width:z.number().min(.8).max(2),goalWidth:z.number().min(.2).max(.6),halfSeconds:z.number().int().min(1).max(600),intervalSeconds:z.number().int().min(1).max(600),timeoutSeconds:z.number().int().min(1).max(120)}).strict();
export const CONFIG={length:1.5,width:1.2,goalWidth:.4,halfSeconds:300,intervalSeconds:600,timeoutSeconds:120};
export type Config=z.infer<typeof ConfigSchema>;
export type Team='blue'|'yellow';
export type Strategy='balanced'|'press';
export type Phase='ready'|'running'|'paused'|'halftime'|'timeout'|'finished';
export type Robot={id:string,team:Team,role:'striker'|'defender'|'keeper',x:number,y:number,angle:number,left:number,right:number};
export type Ball={x:number,y:number,vx:number,vy:number};
export type Match={version:1,config:Config,tick:number,elapsedTicks:number,period:1|2,phase:Phase,phaseTicks:number,score:Record<Team,number>,timeouts:Record<Team,boolean>,strategies:Record<Team,Strategy>,robots:Robot[],ball:Ball};
export type Command={id:string,left:number,right:number};
export type Observation={version:1,team:Team,state:Match};
export type Action='start'|'pause'|'reset'|'timeout-blue'|'timeout-yellow';
const CommandSchema=z.array(z.object({id:z.string(),left:z.number().min(-.6).max(.6),right:z.number().min(-.6).max(.6)}).strict()).max(3);
export const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function direction(team:Team,period:number){return (team==='blue'?1:-1)*(period===1?1:-1);}
function kickoff(s:Match){
 s.ball={x:0,y:0,vx:0,vy:0};
 s.robots=(['blue','yellow'] as Team[]).flatMap(team=>{
  const sign=direction(team,s.period);
  return (['striker','defender','keeper'] as const).map((role,i)=>({id:`${team}-${i}`,team,role,x:-sign*s.config.length*[.16,.3,.44][i],y:i===1?s.config.width*.2:0,angle:sign===1?0:Math.PI,left:0,right:0}));
 });
}
export function createMatch(config:Config=CONFIG,strategies:Record<Team,Strategy>={blue:'balanced',yellow:'press'}):Match{
 const s:Match={version:1,config:ConfigSchema.parse(config),tick:0,elapsedTicks:0,period:1,phase:'ready',phaseTicks:0,score:{blue:0,yellow:0},timeouts:{blue:false,yellow:false},strategies:{...strategies},robots:[],ball:{x:0,y:0,vx:0,vy:0}};
 kickoff(s);return s;
}
export function referee(state:Match,action:Action):Match{
 const s=structuredClone(state);
 if(action==='reset')return createMatch(s.config,s.strategies);
 if(action==='start'){
  if(s.phase!=='ready'&&s.phase!=='paused')throw new Error('Only ready or paused matches can start');
  s.phase='running';return s;
 }
 if(s.phase!=='running')throw new Error('Referee action requires a running match');
 if(action==='pause'){s.phase='paused';return s;}
 const team=action==='timeout-blue'?'blue':'yellow';
 if(s.timeouts[team])throw new Error('Timeout already used');
 s.timeouts[team]=true;s.phase='timeout';s.phaseTicks=0;return s;
}
export function parseCommands(team:Team,input:unknown):Command[]{
 const commands=CommandSchema.parse(input),ids=new Set<string>();
 for(const c of commands){
  if(![0,1,2].some(i=>c.id===`${team}-${i}`)||ids.has(c.id))throw new Error('Command ownership or duplicate ID');
  ids.add(c.id);
 }
 return commands;
}
export function observe(s:Match,team:Team):Observation{return {version:1,team,state:structuredClone(s)};}
function boundRobot(r:Robot,c:Config){r.x=clamp(r.x,-c.length/2+ROBOT_RADIUS,c.length/2-ROBOT_RADIUS);r.y=clamp(r.y,-c.width/2+ROBOT_RADIUS,c.width/2-ROBOT_RADIUS);}
function moveRobot(r:Robot,c:Config,command?:Command){
 r.left=command?.left??0;r.right=command?.right??0;
 const speed=(r.left+r.right)/2,omega=(r.right-r.left)/WHEEL_BASE;
 r.x+=speed*Math.cos(r.angle+omega*DT/2)*DT;r.y+=speed*Math.sin(r.angle+omega*DT/2)*DT;
 r.angle=Math.atan2(Math.sin(r.angle+omega*DT),Math.cos(r.angle+omega*DT));boundRobot(r,c);
}
function separateRobots(a:Robot,b:Robot,c:Config){
 const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
 if(d>=2*ROBOT_RADIUS)return;
 const nx=d?dx/d:1,ny=d?dy/d:0,overlap=(2*ROBOT_RADIUS-d)/2;
 a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;
 boundRobot(a,c);boundRobot(b,c);
}
function collideBall(b:Ball,r:Robot){
 const dx=b.x-r.x,dy=b.y-r.y,d=Math.hypot(dx,dy),min=ROBOT_RADIUS+BALL_RADIUS;
 if(d>=min)return;
 const nx=d?dx/d:1,ny=d?dy/d:0;
 b.x=r.x+nx*min;b.y=r.y+ny*min;
 const speed=(r.left+r.right)/2,relative=(b.vx-speed*Math.cos(r.angle))*nx+(b.vy-speed*Math.sin(r.angle))*ny;
 if(relative<0){b.vx-=1.5*relative*nx;b.vy-=1.5*relative*ny;}
}
function wallBall(s:Match){
 const b=s.ball,c=s.config;
 if(Math.abs(b.y)>c.width/2-BALL_RADIUS){b.y=clamp(b.y,-c.width/2+BALL_RADIUS,c.width/2-BALL_RADIUS);b.vy*=-.75;}
 if(Math.abs(b.y)<=c.goalWidth/2-BALL_RADIUS){
  if(Math.abs(b.x)>c.length/2+BALL_RADIUS){
   const team=direction('blue',s.period)===Math.sign(b.x)?'blue':'yellow';s.score[team]++;kickoff(s);
  }
  return;
 }
 if(Math.abs(b.x)>c.length/2-BALL_RADIUS){b.x=clamp(b.x,-c.length/2+BALL_RADIUS,c.length/2-BALL_RADIUS);b.vx*=-.75;}
}
function phaseClock(s:Match){
 s.phaseTicks++;
 const seconds=s.phase==='halftime'?s.config.intervalSeconds:s.config.timeoutSeconds;
 if(s.phaseTicks<seconds*60)return;
 if(s.phase==='halftime'){s.period=2;kickoff(s);}
 s.phase='running';s.phaseTicks=0;
}
function matchClock(s:Match){
 s.elapsedTicks++;
 if(s.elapsedTicks<s.config.halfSeconds*60*s.period)return;
 s.phase=s.period===1?'halftime':'finished';s.phaseTicks=0;
}
export function step(state:Match,commands:Command[]):Match{
 if(['ready','paused','finished'].includes(state.phase))return structuredClone(state);
 const s=structuredClone(state);s.tick++;
 if(s.phase!=='running'){phaseClock(s);return s;}
 // Even trusted teams cross the same ownership and numeric validation boundary.
 const valid=(['blue','yellow'] as Team[]).flatMap(team=>parseCommands(team,commands.filter(c=>c.id.startsWith(`${team}-`))));
 if(valid.length!==commands.length)throw new Error('Unknown robot ID');
 for(const r of s.robots)moveRobot(r,s.config,valid.find(c=>c.id===r.id));
 for(let pass=0;pass<3;pass++)for(let i=0;i<6;i++)for(let j=i+1;j<6;j++)separateRobots(s.robots[i],s.robots[j],s.config);
 s.ball.x+=s.ball.vx*DT;s.ball.y+=s.ball.vy*DT;s.ball.vx*=.99;s.ball.vy*=.99;
 for(const r of s.robots)collideBall(s.ball,r);
 wallBall(s);matchClock(s);return s;
}
export function advance(state:Match,ticks:number):Match{
 if(!Number.isInteger(ticks)||ticks<1||ticks>120)throw new Error('Batch must contain 1–120 ticks');
 let s=state;
 for(let i=0;i<ticks;i++){
  const commands=(['blue','yellow'] as Team[]).flatMap(team=>parseCommands(team,autonomous(observe(s,team),s.strategies[team])));
  s=step(s,commands);
 }
 return s;
}
