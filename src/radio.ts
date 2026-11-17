import { createHmac } from 'node:crypto';
import { z } from 'zod';
export const RadioCommand=z.object({id:z.number().int().min(0).max(2),sequence:z.number().int().min(0).max(0xffffffff),left:z.number().int().min(-600).max(600),right:z.number().int().min(-600).max(600),ttl:z.number().int().min(1).max(250)}).strict();
export function encodeRadio(input:unknown,key:string){
 const c=RadioCommand.parse(input);
 if(!/^[a-fA-F0-9]{64}$/.test(key))throw new Error('Radio key must be 32 bytes in hex');
 const header=Buffer.alloc(14);header.write('RS');header[2]=1;header[3]=c.id;header.writeUInt32LE(c.sequence,4);header.writeInt16LE(c.left,8);header.writeInt16LE(c.right,10);header.writeUInt16LE(c.ttl,12);
 return Buffer.concat([header,createHmac('sha256',Buffer.from(key,'hex')).update(header).digest().subarray(0,16)]);
}
