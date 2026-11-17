import { z } from 'zod';
import { query } from '../../../../../src/db';
import { failure } from '../../../../../src/http';
export const runtime='nodejs';
export async function GET(request:Request,context:{params:Promise<{id:string}>}){
 try{
  const id=z.uuid().parse((await context.params).id),after=z.coerce.number().int().min(0).parse(new URL(request.url).searchParams.get('after')??0);
  const chunks=await query('SELECT revision,action,frames,checkpoint FROM match_chunks WHERE match_id=$1 AND revision>$2 ORDER BY revision LIMIT 20',[id,after]);
  return Response.json({version:1,chunks,next:chunks.at(-1)?.revision??after},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return failure(e);}
}
