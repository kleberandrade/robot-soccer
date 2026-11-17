#include "../firmware/include/protocol.h"
#include <cassert>
int main(){
 uint8_t p[30]={'R','S',1,2,123,0,0,0,0xA8,0xFD,0x58,2,200,0};WheelCommand c;
 assert(decodeCommand(p,30,2,c));assert(c.left==-600&&c.right==600&&c.sequence==123&&c.ttl==200);
 assert(!decodeCommand(p,29,2,c));assert(!decodeCommand(p,30,1,c));
 p[2]=2;assert(!decodeCommand(p,30,2,c));p[2]=1;
 p[12]=251;assert(!decodeCommand(p,30,2,c));p[12]=0;assert(!decodeCommand(p,30,2,c));p[12]=200;
 p[10]=0x59;assert(!decodeCommand(p,30,2,c));
}
