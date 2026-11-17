import { z } from 'zod';
import { CONFIG, ConfigSchema, createMatch, advance, referee, type Match } from './sim/engine';
export const CreateSchema=z.object({config:ConfigSchema.default(CONFIG),strategies:z.object({blue:z.enum(['balanced','press']),yellow:z.enum(['balanced','press'])}).strict().default({blue:'balanced',yellow:'press'})}).strict();
export const UpdateSchema=z.object({revision:z.number().int().min(0),action:z.enum(['advance','start','pause','reset','timeout-blue','timeout-yellow']),ticks:z.number().int().min(1).max(120).default(120)}).strict();
export type Update=z.infer<typeof UpdateSchema>;
export function newMatch(input:unknown){const p=CreateSchema.parse(input);return createMatch(p.config,p.strategies);}
export function applyUpdate(state:Match,update:Update){
 if(update.action!=='advance')return {state:referee(state,update.action),frames:[] as Match[]};
 const frames:Match[]=[];let s=state;
 for(let t=0;t<update.ticks;t+=6){s=advance(s,Math.min(6,update.ticks-t));frames.push(s);}
 return {state:s,frames};
}
