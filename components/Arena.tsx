'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls,Line,Html } from '@react-three/drei';
import { Component,type ReactNode } from 'react';
import PlanView from './PlanView';
import type { Match } from '../src/sim/engine';
function Scene({state,trail}:{state:Match,trail:[number,number][]}){
 const c=state.config,l=c.length/2,w=c.width/2;
 const white='#cad9d5';
 return <>
  <ambientLight intensity={1.8}/><directionalLight position={[1,3,2]} intensity={3}/>
  <mesh position={[0,-.045,0]}><boxGeometry args={[c.length+.22,.08,c.width+.22]}/><meshStandardMaterial color="#182f35"/></mesh>
  <mesh rotation={[-Math.PI/2,0,0]}><planeGeometry args={[c.length,c.width]}/><meshStandardMaterial color="#22534b" roughness={.9}/></mesh>
  {Array.from({length:10},(_,i)=><mesh key={i} position={[-l+c.length/20+i*c.length/10,.001,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[c.length/10,c.width]}/><meshStandardMaterial color={i%2?'#24574e':'#285d54'}/></mesh>)}
  <Line points={[[-l,.003,-w],[l,.003,-w],[l,.003,w],[-l,.003,w],[-l,.003,-w]]} color={white} lineWidth={1.8}/>
  <Line points={[[0,.004,-w],[0,.004,w]]} color={white}/>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.005,0]}><ringGeometry args={[.148,.152,64]}/><meshBasicMaterial color={white}/></mesh>
  {[-1,1].map(sign=><group key={sign}>
   <Line points={[[sign*l,.004,-.35],[sign*(l-.15),.004,-.35],[sign*(l-.15),.004,.35],[sign*l,.004,.35]]} color={white}/>
   <Line points={[[sign*l,0,-c.goalWidth/2],[sign*l,.1,-c.goalWidth/2],[sign*l,.1,c.goalWidth/2],[sign*l,0,c.goalWidth/2]]} color={sign<0?'#59b8ff':'#f9ca67'} lineWidth={3}/>
   <Line points={[[sign*l,0,-c.goalWidth/2],[sign*(l+.1),0,-c.goalWidth/2],[sign*(l+.1),0,c.goalWidth/2],[sign*l,0,c.goalWidth/2]]} color={white}/>
  </group>)}
  {trail.length>1?<Line points={trail.map(([x,y])=>[x,.012,y])} color="#ff9f58" transparent opacity={.5} lineWidth={1}/>:null}
  <mesh position={[state.ball.x,.02135,state.ball.y]}><sphereGeometry args={[.02135,24,16]}/><meshStandardMaterial color="#ff781f" roughness={.4}/></mesh>
  {state.robots.map(r=><group key={r.id} position={[r.x,.036,r.y]} rotation={[0,-r.angle,0]}>
   <mesh><boxGeometry args={[.075,.072,.075]}/><meshStandardMaterial color="#101b25"/></mesh>
   <mesh position={[0,.037,0]}><boxGeometry args={[.067,.005,.067]}/><meshStandardMaterial color={r.team==='blue'?'#4db9ff':'#ffd36b'}/></mesh>
   <mesh position={[.022,.041,0]}><boxGeometry args={[.015,.004,.015]}/><meshStandardMaterial color="#f6f8ee"/></mesh>
   <Html position={[0,.105,0]} center distanceFactor={2}><span className={`robot-tag ${r.team}`}>{r.id.slice(-1)}</span></Html>
  </group>)}
  <OrbitControls makeDefault minDistance={1.1} maxDistance={4} maxPolarAngle={Math.PI/2.1}/>
 </>;
}
class Guard extends Component<{children:ReactNode,fallback:ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?this.props.fallback:this.props.children;}
}
export default function Arena({state,trail}:{state:Match,trail:[number,number][]}){
 return <Guard fallback={<PlanView state={state}/>}><Canvas camera={{position:[1.15,1.65,1.3],fov:44}} dpr={[1,1.8]} gl={{antialias:true}} fallback={<PlanView state={state}/>}><Scene state={state} trail={trail}/></Canvas></Guard>;
}
