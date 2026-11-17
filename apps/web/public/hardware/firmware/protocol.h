#pragma once
#include <cstdint>
#include <cstddef>
struct WheelCommand { uint32_t sequence; int16_t left; int16_t right; uint16_t ttl; };
inline uint16_t read16(const uint8_t* p) { return uint16_t(p[0]) | uint16_t(p[1]) << 8; }
inline bool decodeCommand(const uint8_t* p,size_t n,uint8_t robot,WheelCommand& out) {
 if(n!=30 || p[0]!='R' || p[1]!='S' || p[2]!=1 || p[3]!=robot) return false;
 const int16_t left=int16_t(read16(p+8)),right=int16_t(read16(p+10));
 const uint16_t ttl=read16(p+12);
 if(left < -600 || left > 600 || right < -600 || right > 600 || ttl==0 || ttl>250) return false;
 out={uint32_t(p[4]) | uint32_t(p[5])<<8 | uint32_t(p[6])<<16 | uint32_t(p[7])<<24,left,right,ttl};
 return true;
}
