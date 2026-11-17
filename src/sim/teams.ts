import { clamp, direction, type Observation, type Strategy, type Robot, type Command } from './engine';
function navigate(r:Robot,x:number,y:number):Command{
 const dx=x-r.x,dy=y-r.y,d=Math.hypot(dx,dy);
 const error=Math.atan2(Math.sin(Math.atan2(dy,dx)-r.angle),Math.cos(Math.atan2(dy,dx)-r.angle));
 const v=Math.min(.5,d*3)*Math.max(0,Math.cos(error)),turn=clamp(error*2,-.5,.5);
 return {id:r.id,left:clamp(v-turn,-.6,.6),right:clamp(v+turn,-.6,.6)};
}
export function autonomous(o:Observation,strategy:Strategy):Command[]{
 const s=o.state,sign=direction(o.team,s.period),b=s.ball;
 return s.robots.filter(r=>r.team===o.team).map(r=>{
  if(r.role==='keeper')return navigate(r,-sign*s.config.length*.44,clamp(b.y,-s.config.goalWidth*.4,s.config.goalWidth*.4));
  if(r.role==='defender'&&strategy==='balanced')return navigate(r,-sign*s.config.length*.27,clamp(b.y*.7,-s.config.width*.35,s.config.width*.35));
  const behind=(b.x-r.x)*sign<0;
  return navigate(r,behind?b.x-sign*.11:b.x+sign*.06,behind?b.y+(b.y>0?-.12:.12):b.y);
 });
}
