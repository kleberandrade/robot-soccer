import { describe, it, expect } from 'vitest';
import { createMatch, referee, step, advance, parseCommands, observe, DT, CONFIG } from '../src/sim/engine';
import { autonomous } from '../src/sim/teams';

describe('match rules',()=>{
 it('starts safe, pauses, resumes and resets',()=>{
  let s=createMatch(); expect(s.robots).toHaveLength(6); expect(step(s,[])).toEqual(s);
  s=referee(s,'start'); s=advance(s,60); expect(s.elapsedTicks).toBe(60);
  s=referee(s,'pause'); expect(advance(s,60)).toEqual(s);
  s=referee(s,'start'); expect(advance(s,1).elapsedTicks).toBe(61);
  expect(referee(s,'reset')).toEqual(createMatch());
 });
 it('uses fixed timestep and reproduces identical matches without mutating inputs',()=>{
  const initial=referee(createMatch(),'start'), copy=structuredClone(initial);
  const a=Array.from({length:10}).reduce<typeof initial>(s=>advance(s,120),initial), b=Array.from({length:10}).reduce<typeof initial>(s=>advance(s,120),initial);
  expect(a).toEqual(b); expect(initial).toEqual(copy); expect(DT).toBe(1/60);
  expect(a.robots.some((r,i)=>r.x!==initial.robots[i].x)).toBe(true);
 });
 it('changes ends after a timed interval and finishes after two periods',()=>{
  let s=referee(createMatch({...CONFIG,halfSeconds:1,intervalSeconds:1}),'start');
  s=advance(s,60); expect(s.phase).toBe('halftime'); expect(s.period).toBe(1);
  s=advance(s,60); expect(s.phase).toBe('running'); expect(s.period).toBe(2);
  s=advance(s,60); expect(s.phase).toBe('finished'); expect(s.elapsedTicks).toBe(120);
 });
 it('allows one timed timeout per team and freezes match time',()=>{
  let s=referee(createMatch({...CONFIG,timeoutSeconds:1}),'start');
  s=referee(s,'timeout-blue'); expect(s.phase).toBe('timeout');
  expect(()=>referee(s,'start')).toThrow(); s=advance(s,60);
  expect(s.phase).toBe('running'); expect(s.elapsedTicks).toBe(0);
  expect(()=>referee(s,'timeout-blue')).toThrow();
 });
 it('scores only inside goal mouth and restarts positions',()=>{
  const s=referee(createMatch(),'start'); s.ball={x:CONFIG.length/2+.022,y:0,vx:1,vy:0};
  const out=step(s,[]); expect(out.score.blue).toBe(1); expect(out.ball.x).toBe(0);
  s.ball={x:CONFIG.length/2-.022,y:.45,vx:2,vy:0};
  const wall=step(s,[]); expect(wall.score.blue).toBe(0); expect(wall.ball.vx).toBeLessThan(0);
 });
 it('resolves robot contacts and keeps all bodies within bounds',()=>{
  let s=referee(createMatch(),'start');
  s.robots[0].x=s.robots[1].x; s.robots[0].y=s.robots[1].y;
  s=step(s,[]);
  expect(Math.hypot(s.robots[0].x-s.robots[1].x,s.robots[0].y-s.robots[1].y)).toBeGreaterThan(.1);
  for(let i=0;i<25;i++) s=advance(s,120);
  for(const r of s.robots){expect(Math.abs(r.x)).toBeLessThanOrEqual(s.config.length/2-.053+1e-8);expect(Math.abs(r.y)).toBeLessThanOrEqual(s.config.width/2-.053+1e-8);}
 });
 it('pushes ball on robot contact and counts opposite goals after changing ends',()=>{
  const s=referee(createMatch(),'start'); const r=s.robots[0];
  s.ball={x:r.x+.06,y:r.y,vx:0,vy:0};
  expect(step(s,[{id:r.id,left:.5,right:.5}]).ball.vx).toBeGreaterThan(0);
  s.period=2; s.ball={x:-s.config.length/2-.022,y:0,vx:-1,vy:0};
  expect(step(s,[]).score.blue).toBe(1);
 });
});
describe('protocol and autonomy boundaries',()=>{
 it('rejects cross-team, duplicate, non-finite and excessive commands',()=>{
  for(const payload of [[{id:'yellow-0',left:0,right:0}],[{id:'blue-0',left:NaN,right:0}],[{id:'blue-0',left:2,right:0}],[{id:'blue-0',left:0,right:0},{id:'blue-0',left:0,right:0}]]) expect(()=>parseCommands('blue',payload)).toThrow();
  expect(parseCommands('blue',[{id:'blue-0',left:-.5,right:.5}])).toHaveLength(1);
 });
 it('gives teams independent observations and bounded role-based commands',()=>{
  const s=createMatch(); const blue=observe(s,'blue'); blue.state.ball.x=99;
  expect(s.ball.x).toBe(0); expect(observe(s,'yellow').state.ball.x).toBe(0);
  expect(parseCommands('blue',autonomous(observe(s,'blue'),'balanced'))).toHaveLength(3);
 });
 it('rejects invalid configs, non-integer batches and batches above two seconds',()=>{
  expect(()=>createMatch({...CONFIG,length:0})).toThrow();
  expect(()=>advance(createMatch(),121)).toThrow();expect(()=>advance(createMatch(),1.5)).toThrow();
 });
});
