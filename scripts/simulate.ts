import { createMatch,referee,advance } from '../src/sim/engine';
import { createHash } from 'node:crypto';
let state=referee(createMatch(),'start');
while(state.phase!=='finished')state=advance(state,120);
console.log(JSON.stringify({score:state.score,seconds:state.elapsedTicks/60,ticks:state.tick,sha256:createHash('sha256').update(JSON.stringify(state)).digest('hex')},null,2));
