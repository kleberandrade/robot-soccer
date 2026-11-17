import { timingSafeEqual } from 'node:crypto';
export function authorized(request:Request){
 const expected=process.env.MATCH_ADMIN_TOKEN;
 if(!expected||expected.length<32)return false;
 const actual=request.headers.get('authorization')??'';
 const wanted=`Bearer ${expected}`;
 return actual.length===wanted.length&&timingSafeEqual(Buffer.from(actual),Buffer.from(wanted));
}
export async function body(request:Request):Promise<unknown>{
 // Read a bounded stream; Content-Length alone is not a trustworthy limit.
 const reader=request.body?.getReader();if(!reader)throw new Error('Body required');
 const decoder=new TextDecoder();let size=0,text='';
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();throw new Error('Body exceeds 4096 bytes');}text+=decoder.decode(value,{stream:true});}
 return JSON.parse(text+decoder.decode());
}
export function failure(error:unknown){
 if(error instanceof Error&&(error.name==='ZodError'||/Body|JSON|Only |requires|Timeout|Unexpected|Expected/.test(error.message)))return Response.json({error:'Invalid request or referee transition'},{status:400});
 console.error('Match request failed:',error instanceof Error?error.name:'unknown');
 return Response.json({error:'Persistence unavailable. Check server configuration.'},{status:503});
}
