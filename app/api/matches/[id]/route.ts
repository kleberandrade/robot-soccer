import { z } from 'zod';
import { getMatch,saveMatch } from '../../../../src/db';
import { UpdateSchema,applyUpdate } from '../../../../src/service';
import { authorized,body,failure } from '../../../../src/http';
export const runtime='nodejs';export const maxDuration=10;
type Context={params:Promise<{id:string}>};
async function idOf(c:Context){return z.uuid().parse((await c.params).id);}
export async function GET(_request:Request,c:Context){
 try{const row=await getMatch(await idOf(c));return row?Response.json(row,{headers:{'Cache-Control':'no-store'}}):Response.json({error:'Match not found'},{status:404});}catch(e){return failure(e);}
}
export async function PATCH(request:Request,c:Context){
 if(!authorized(request))return Response.json({error:'Operator authentication required'},{status:401});
 try{
  const id=await idOf(c),update=UpdateSchema.parse(await body(request)),current=await getMatch(id);
  if(!current)return Response.json({error:'Match not found'},{status:404});
  if(current.revision!==update.revision)return Response.json({error:'Revision conflict. Reload the match.'},{status:409});
  const result=applyUpdate(current.state,update);
  const saved=await saveMatch(id,current.revision,result.state,result.frames,update.action);
  return saved?Response.json({...saved,frames:result.frames}):Response.json({error:'Revision conflict. Reload the match.'},{status:409});
 }catch(e){return failure(e);}
}
