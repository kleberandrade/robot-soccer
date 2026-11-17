#include <Arduino.h>
#include <WiFi.h>
#include <WiFiUdp.h>
#include <mbedtls/md.h>
#include "protocol.h"
#if __has_include("secrets.h")
#include "secrets.h"
#else
#include "secrets.example.h"
#endif
// ESP32-C3-MINI-1 carrier. Driver STBY has an external 10k pulldown.
constexpr int A1=0,A2=1,APWM=3,B1=4,B2=5,BPWM=6,STBY=7;
WiFiUDP radio;
uint8_t key[32];bool configured=false,seen=false,armed=false;
uint32_t lastSequence=0,lastCommandAt=0;uint16_t ttl=0;
int16_t appliedLeft=0,appliedRight=0;
int hexDigit(char c){if(c>='0'&&c<='9')return c-'0';if(c>='a'&&c<='f')return c-'a'+10;if(c>='A'&&c<='F')return c-'A'+10;return -1;}
bool loadKey(){
 if(strlen(RADIO_KEY_HEX)!=64)return false;
 for(int i=0;i<32;i++){int a=hexDigit(RADIO_KEY_HEX[2*i]),b=hexDigit(RADIO_KEY_HEX[2*i+1]);if(a<0||b<0)return false;key[i]=(a<<4)|b;}
 return true;
}
void stopMotors(){digitalWrite(STBY,LOW);ledcWrite(0,0);ledcWrite(1,0);appliedLeft=0;appliedRight=0;armed=false;}
void motor(int a,int b,int channel,int speed){digitalWrite(a,speed>0?HIGH:LOW);digitalWrite(b,speed<0?HIGH:LOW);ledcWrite(channel,abs(speed)*255/600);}
bool authenticated(const uint8_t* packet){
 uint8_t digest[32];const auto* info=mbedtls_md_info_from_type(MBEDTLS_MD_SHA256);
 if(mbedtls_md_hmac(info,key,32,packet,14,digest)!=0)return false;
 uint8_t diff=0;for(int i=0;i<16;i++)diff|=digest[i]^packet[14+i];return diff==0;
}
void setup(){
 pinMode(STBY,OUTPUT);digitalWrite(STBY,LOW);
 for(int pin:{A1,A2,B1,B2}){pinMode(pin,OUTPUT);digitalWrite(pin,LOW);}
 ledcSetup(0,20000,8);ledcSetup(1,20000,8);ledcAttachPin(APWM,0);ledcAttachPin(BPWM,1);stopMotors();
 Serial.begin(115200);configured=loadKey();
 if(!configured){Serial.println("Safe mode: configure radio key before operation");return;}
 WiFi.mode(WIFI_STA);WiFi.begin(WIFI_SSID,WIFI_PASSWORD);radio.begin(20011);
}
void loop(){
 if(!configured){delay(5);return;}
 if(WiFi.status()!=WL_CONNECTED){stopMotors();delay(5);return;}
 if(armed&&uint32_t(millis()-lastCommandAt)>=ttl)stopMotors();
 const int size=radio.parsePacket();
 if(size){
  uint8_t bytes[31];const int n=radio.read(bytes,sizeof(bytes));WheelCommand cmd;
  if(size==30&&decodeCommand(bytes,n,ROBOT_ID,cmd)&&authenticated(bytes)&&(!seen||cmd.sequence>lastSequence)){
   seen=true;lastSequence=cmd.sequence;ttl=cmd.ttl;lastCommandAt=millis();
   motor(A1,A2,0,cmd.left);motor(B1,B2,1,cmd.right);digitalWrite(STBY,HIGH);armed=true;appliedLeft=cmd.left;appliedRight=cmd.right;
   char telemetry[128];snprintf(telemetry,sizeof(telemetry),"{\"version\":1,\"id\":%u,\"sequence\":%lu,\"left\":%d,\"right\":%d}",ROBOT_ID,(unsigned long)lastSequence,appliedLeft,appliedRight);
   radio.beginPacket(radio.remoteIP(),radio.remotePort());radio.write((const uint8_t*)telemetry,strlen(telemetry));radio.endPacket();
  }
 }
 delay(1);
}
