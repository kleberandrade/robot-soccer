import { it,expect } from 'vitest';
import { createHmac } from 'node:crypto';
import { encodeRadio } from '../src/radio';
it('encodes signed wheel speeds, identity, TTL and an authenticated header',()=>{
 const key='01'.repeat(32),p=encodeRadio({id:2,sequence:123,left:-600,right:600,ttl:200},key);
 expect(p.length).toBe(30);expect(p.subarray(0,4)).toEqual(Buffer.from([82,83,1,2]));expect(p.readUInt32LE(4)).toBe(123);expect(p.readInt16LE(8)).toBe(-600);expect(p.readInt16LE(10)).toBe(600);expect(p.readUInt16LE(12)).toBe(200);
 expect(p.subarray(14)).toEqual(createHmac('sha256',Buffer.from(key,'hex')).update(p.subarray(0,14)).digest().subarray(0,16));
});
it('rejects unsafe speeds, invalid IDs, expired TTL and short keys',()=>{
 const c={id:0,sequence:1,left:0,right:0,ttl:200},key='01'.repeat(32);
 for(const bad of [{...c,left:601},{...c,right:-601},{...c,id:3},{...c,ttl:0},{...c,ttl:251},{...c,sequence:-1}])expect(()=>encodeRadio(bad,key)).toThrow();
 expect(()=>encodeRadio(c,'short')).toThrow();
});
