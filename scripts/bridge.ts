import { createInterface } from 'node:readline';
import { createSocket } from 'node:dgram';
import { z } from 'zod';
import { parseCommands } from '../src/sim/engine';
import { encodeRadio } from '../src/radio';
const Envelope=z.object({version:z.literal(1),team:z.enum(['blue','yellow']),commands:z.unknown()}).strict();
const sending=process.argv.includes('--send');
const endpoints=z.array(z.object({host:z.ipv4(),key:z.string().regex(/^[a-fA-F0-9]{64}$/)})).length(3);
const targets=sending?endpoints.parse(JSON.parse(process.env.ROBOT_ENDPOINTS??'null')):null;
const team=z.enum(['blue','yellow']).parse(process.env.TEAM??'blue');
const socket=sending?createSocket('udp4'):null;
let sequence=Math.floor(Date.now()/1000);
socket?.on('message',(msg)=>console.error('Telemetry:',msg.toString().slice(0,256)));
const lines=createInterface({input:process.stdin,crlfDelay:Infinity});
for await(const line of lines){
 try{
  if(line.length>4096)throw new Error('Input too large');
  const input=Envelope.parse(JSON.parse(line));if(input.team!==team)throw new Error('Wrong team');
  const commands=parseCommands(team,input.commands);sequence++;
  for(const c of commands){const id=Number(c.id.slice(-1)),target=targets?.[id];const bytes=encodeRadio({id,sequence,left:Math.round(c.left*1000),right:Math.round(c.right*1000),ttl:200},target?.key??'00'.repeat(32));
   if(socket&&target)socket.send(bytes,20011,target.host);
   else console.log(JSON.stringify({dryRun:true,id,bytes:bytes.length,left:c.left,right:c.right}));
  }
 }catch(e){console.error(e instanceof Error?e.message:'Invalid input');process.exitCode=1;}
}
socket?.close();
