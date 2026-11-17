"""Original vector reference drawings; no vendor figures are copied."""
from pathlib import Path
from html import escape
import csv
ROOT=Path(__file__).resolve().parents[1]
INK='#273b42';GREEN='#397966';BLUE='#387caa';GOLD='#bb7a28';GRAY='#81938f'
def document(w,h,title):
    return [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img"><title>{escape(title)}</title><rect width="{w}" height="{h}" fill="#fbfcf9"/><style>text{{font-family:Arial,sans-serif;fill:{INK}}}.mono{{font-family:monospace}}</style>']
def text(s,x,y,label,size=15,color=INK,anchor='start'):
    s.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" text-anchor="{anchor}">{escape(str(label))}</text>')
def line(s,x1,y1,x2,y2,color=INK,width=2,dash=False):
    s.append(f'<path d="M{x1} {y1}L{x2} {y2}" fill="none" stroke="{color}" stroke-width="{width}"'+(' stroke-dasharray="6 4"' if dash else '')+'/>')
def rect(s,x,y,w,h,fill='#fff',stroke=INK,dash=False):
    s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{fill}" stroke="{stroke}" stroke-width="1.5"'+(' stroke-dasharray="6 4"' if dash else '')+'/>')
def dot(s,x,y,color=INK):s.append(f'<circle cx="{x}" cy="{y}" r="3" fill="{color}"/>')
def gnd(s,x,y):
    line(s,x,y,x,y+8);line(s,x-12,y+8,x+12,y+8);line(s,x-8,y+13,x+8,y+13);line(s,x-4,y+18,x+4,y+18)
def cap(s,x,y,name,value,color=INK):
    line(s,x,y,x,y+20,color);line(s,x-10,y+20,x+10,y+20,color);line(s,x-10,y+28,x+10,y+28,color);line(s,x,y+28,x,y+44,color);gnd(s,x,y+44);text(s,x+15,y+22,name,12);text(s,x+15,y+38,value,12)
def resistor(s,x,y,name,value):
    line(s,x,y,x,y+12);rect(s,x-6,y+12,12,26);line(s,x,y+38,x,y+50);text(s,x+12,y+22,name,12);text(s,x+12,y+38,value,12)
def net(s,x,y,name):
    line(s,x,y,x+35,y,GREEN);text(s,x+40,y+5,name,12,GREEN)
S=document(1800,1280,'ROBOTSOCCER detailed electrical reference, revision B')
text(S,65,50,'ROBOTSOCCER',23);text(S,65,83,'Electrical reference / ESP32-C3-MINI-1 + TB6612FNG',18);text(S,1730,50,'REV B  ·  ORIGINAL DESIGN',13,anchor='end');text(S,1730,80,'PROPOSAL — NOT A PCB NETLIST OR BENCH-VALIDATED CIRCUIT',12,GRAY,'end');line(S,65,105,1730,105,'#c7d5cd')
text(S,65,135,'01  PROTECTED POWER PATH',14,GREEN)
rect(S,65,165,175,80,'#edf3eb',GOLD,True);text(S,85,192,'J1 / 2S LiPo pack',15);text(S,85,215,'Per-cell BMS required',13);text(S,85,234,'6.4–8.4 V target',12)
line(S,150,245,150,275);gnd(S,150,275);text(S,168,270,'Protected P− / GND',12);text(S,224,187,'+',14,GOLD);line(S,240,195,300,195,GOLD,3);rect(S,300,184,52,22);text(S,298,175,'F1 / 1 A',12);line(S,352,195,425,195,GOLD,3)
line(S,425,195,452,178);line(S,455,195,510,195,GOLD,3);dot(S,425,195);dot(S,455,195);text(S,410,163,'SW1 / power',12)
rect(S,510,165,150,70,'#fff',GOLD,True);text(S,525,190,'D1 / reverse',13);text(S,525,211,'polarity stage',13)
line(S,660,195,700,195,GOLD,3);rect(S,700,165,180,70,'#edf3eb',GOLD,True);text(S,716,190,'PROT1 / UV cutoff',13);text(S,716,211,'6.4 V + hysteresis',13)
line(S,880,195,1070,195,GOLD,3);dot(S,965,195,GOLD);line(S,965,195,965,305,GOLD,3);line(S,965,305,1070,305,GOLD,3);text(S,900,178,'VBAT_SW',12,GOLD)
for y,name,out in [(160,'REG1 / D24V10F5','5 V motor'),(270,'REG2 / D24V10F3','3.3 V logic')]:
    rect(S,1070,y,160,70,'#eef3ef');text(S,1083,y+24,name,13);text(S,1083,y+47,'VIN    GND    VOUT',11);gnd(S,1148,y+70) if y==160 else (line(S,1070,328,1040,328),gnd(S,1040,328))
line(S,1230,195,1510,195,GOLD,3);text(S,1515,178,'+5V_MOTOR',14,GOLD);line(S,1320,195,1320,390,GOLD,3);line(S,1120,390,1320,390,GOLD,3);line(S,1120,390,1120,450,GOLD,3);text(S,1130,434,'VM 13,14,24',12,GOLD)
for x,n,v in [(1390,'C1','10 µF'),(1480,'C2','100 nF'),(1610,'Cbulk','470 µF / ≥10 V')]:
    dot(S,x,195,GOLD);line(S,1510,195,1610,195,GOLD,3);cap(S,x,195,n,v,GOLD)
line(S,1230,305,1550,305,BLUE,3);line(S,1550,305,1550,355,BLUE,3);line(S,200,355,1550,355,BLUE,3);text(S,1560,310,'+3V3',14,BLUE)
for x,name,value in [(205,'C5','10 µF'),(300,'C6','100 nF'),(1435,'C3','10 µF'),(1550,'C4','100 nF')]:dot(S,x,355,BLUE);cap(S,x,355,name,value,BLUE)
line(S,395,355,395,450,BLUE,3);text(S,405,432,'3V3 / P3',12,BLUE);line(S,1000,355,1000,450,BLUE,3);text(S,1010,432,'VCC / 20',12,BLUE)
text(S,65,465,'02  CONTROL',14,GREEN);rect(S,100,480,450,370,'#f2f5f1');text(S,325,513,'U1 / ESP32-C3-MINI-1',20,anchor='middle')
rect(S,850,480,390,370,'#f2f5f1');text(S,1045,513,'U2 / TB6612FNG',20,anchor='middle')
# Supply pin leads terminate on the top of the functional symbols.
line(S,395,450,395,480,BLUE,3);line(S,1000,450,1000,480,BLUE,3);line(S,1120,450,1120,480,GOLD,3)
signals=[('GPIO0 / P12','AIN1 / 21'),('GPIO1 / P13','AIN2 / 22'),('GPIO3 / P6','PWMA / 23'),('GPIO4 / P18','BIN1 / 17'),('GPIO5 / P19','BIN2 / 16'),('GPIO6 / P20','PWMB / 15'),('GPIO7 / P21','STBY / 19')]
for i,(left,right) in enumerate(signals):
    y=550+40*i;text(S,535,y+5,left,14,anchor='end');line(S,550,y,850,y,GREEN);text(S,865,y+5,right,14);text(S,695,y-8,('PWM / 20 kHz' if 'PWM' in right else ''),10,GRAY,'middle')
# All named nets share connectivity even where no continuous wire is drawn.
for y,label,pin in [(550,'ESP_EN','EN / P8'),(590,'ESP_IO9','GPIO9 / P23'),(630,'ESP_IO2','GPIO2 / P5'),(670,'ESP_IO8','GPIO8 / P22'),(710,'UART_TX','TXD0 / P31'),(750,'UART_RX','RXD0 / P30')]:
    text(S,115,y+5,pin,13);line(S,65,y,100,y,GREEN);text(S,60,y-8,label,11,GREEN,'end')
text(S,325,827,'P = module pad number; GPIO ≠ pad number',12,GRAY,'middle')
line(S,325,850,325,880);gnd(S,325,880);text(S,345,882,'GND: P1,2,11,14,36–53',12)
line(S,1045,850,1045,880);gnd(S,1045,880);text(S,1065,882,'GND 18 + PGND 3,4,9,10',12)
dot(S,735,790,GREEN);resistor(S,735,790,'R1','10 kΩ');line(S,735,840,735,850);gnd(S,735,850);text(S,770,872,'External standby pulldown',12,GRAY)
text(S,1370,465,'03  MOTOR OUTPUTS',14,GREEN)
for center,one,two,pins1,pins2,name,capname in [(590,550,630,'AO1 / 1,2','AO2 / 5,6','M1 / left','C7'),(750,710,790,'BO1 / 11,12','BO2 / 7,8','M2 / right','C8')]:
    text(S,1225,one-8,pins1,12,anchor='end');text(S,1225,two-8,pins2,12,anchor='end');line(S,1240,one,1500,one,GOLD,2.5);line(S,1500,one,1500,center-28,GOLD,2.5);line(S,1240,two,1500,two,GOLD,2.5);line(S,1500,two,1500,center+28,GOLD,2.5)
    S.append(f'<circle cx="1500" cy="{center}" r="28" fill="#fff" stroke="{INK}" stroke-width="2"/>');text(S,1500,center+7,'M',20,anchor='middle');text(S,1455,center+57,name,13)
    line(S,1500,one,1640,one,GOLD);line(S,1500,two,1640,two,GOLD);line(S,1640,one,1640,center-5,GOLD);line(S,1625,center-5,1655,center-5,GOLD);line(S,1625,center+5,1655,center+5,GOLD);line(S,1640,center+5,1640,two,GOLD);text(S,1668,center,capname,12);text(S,1668,center+18,'100 nF',12)
text(S,1380,855,'Tie duplicated output pins as labeled.',12,GRAY);text(S,1380,875,'Verify installed motor polarity with wheels raised.',12,GRAY);text(S,1380,895,'Do not route motor return through MCU ground traces.',12,GRAY)
line(S,65,940,1730,940,'#c7d5cd');text(S,65,975,'04  RESET, BOOT AND PROGRAMMING',14,GREEN)
line(S,145,1000,835,1000,BLUE,2);text(S,850,1005,'+3V3',12,BLUE)
for x,ref,netname in [(160,'R2','ESP_EN'),(420,'R3','ESP_IO9'),(645,'R4','ESP_IO2'),(820,'R5','ESP_IO8')]:
    resistor(S,x,1000,ref,'10 kΩ');line(S,x,1050,x,1080);dot(S,x,1080,GREEN);text(S,x+14,1070 if netname=='ESP_EN' else 1085,netname,12,GREEN)
cap(S,160,1080,'C9','1 µF');line(S,160,1080,295,1080);line(S,295,1080,295,1098);line(S,295,1098,309,1115);line(S,295,1118,295,1138);gnd(S,295,1138);text(S,245,1172,'SW2 / RESET',12)
line(S,420,1080,420,1098);line(S,420,1098,434,1115);line(S,420,1118,420,1138);gnd(S,420,1138);text(S,390,1172,'SW3 / BOOT',12)
rect(S,1010,1000,330,170,'#fff');text(S,1030,1025,'J4 / 3.3 V UART service header',14)
for i,t in enumerate(['1 GND       2 VREF_3V3 (sense only)','3 UART_RX   4 UART_TX','5 ESP_EN    6 ESP_IO9']):text(S,1030,1058+i*32,t,13)
text(S,1390,1025,'Manual boot sequence:',13);text(S,1390,1050,'Hold BOOT, pulse RESET, release BOOT.',12);text(S,1390,1080,'Motor rail off while programming.',12);text(S,1390,1105,'Never backfeed 3V3 from the programmer.',12);text(S,1390,1135,'GPIO4–7: do not use JTAG with motors armed.',12)
line(S,65,1200,1730,1200,'#c7d5cd');text(S,65,1225,'Dashed power blocks require real-part selection. All GND symbols share one star-return net; crossings without dots are not connections.',12,GRAY);text(S,65,1248,'Decoupling must be placed at IC pins. Verify current, thermal behavior, cutoff and VM transients before operation.',12,GRAY);text(S,1730,1248,'Sheet 1 / 1 · Component pads checked against primary datasheets',11,GRAY,'end')
S.append('</svg>');(ROOT/'electronics.svg').write_text('\n'.join(S)+'\n');(ROOT/'wiring.svg').write_text('\n'.join(S)+'\n')
# An explicit connection schedule supplements the drawing and the chip-GPIO pin map.
rows=[['A_DIR1','ESP GPIO0 / module P12','TB AIN1 / 21','3.3 V logic'],['A_DIR2','ESP GPIO1 / module P13','TB AIN2 / 22','3.3 V logic'],['A_PWM','ESP GPIO3 / module P6','TB PWMA / 23','20 kHz PWM'],['B_DIR1','ESP GPIO4 / module P18','TB BIN1 / 17','3.3 V logic'],['B_DIR2','ESP GPIO5 / module P19','TB BIN2 / 16','3.3 V logic'],['B_PWM','ESP GPIO6 / module P20','TB PWMB / 15','20 kHz PWM'],['STBY','ESP GPIO7 / module P21','TB STBY / 19','External R1 10 kohm to GND'],['MOTOR_5V','REG1 5 V output','TB VM / 13+14+24','C1 10uF + C2 100nF near driver; 470uF bulk'],['LOGIC_3V3','REG2 3.3 V output','ESP P3 + TB VCC20','Local 10uF + 100nF at each device'],['GND','Protected supply return','ESP P1+P2+P11+P14+P36..P53; TB18+3+4+9+10','Common star return; keep motor loops short'],['M1_A','TB AO1 / 1+2','Left motor terminal A','Join both duplicate pins'],['M1_B','TB AO2 / 5+6','Left motor terminal B','100nF across motor terminals'],['M2_A','TB BO1 / 11+12','Right motor terminal A','Join both duplicate pins'],['M2_B','TB BO2 / 7+8','Right motor terminal B','100nF across motor terminals'],['ESP_EN','ESP EN / P8','R2 to 3V3; C9 and RESET to GND','10kohm / 1uF startup network'],['ESP_IO9','ESP GPIO9 / P23','R3 to 3V3; BOOT to GND','10kohm; boot strapping'],['ESP_IO2','ESP GPIO2 / P5','R4 to 3V3','10kohm boot strap recommendation'],['ESP_IO8','ESP GPIO8 / P22','R5 to 3V3','10kohm; required high for joint download'],['UART_RX','J4 TX from programmer','ESP RXD0 / P30','3.3 V logic only'],['UART_TX','ESP TXD0 / P31','J4 RX to programmer','Motor supply off while programming']]
with (ROOT/'connections.csv').open('w',newline='') as f:w=csv.writer(f);w.writerow(['net','from','to','implementation_note']);w.writerows(rows)
D=document(1400,800,'ROBOTSOCCER case concept dimensions, millimeters')
text(D,60,55,'CASE CONCEPT / REV A',24);text(D,60,85,'Millimeters · nominal geometry only · no physical fit or print validation',15,GRAY)
# Top view: world forward x is up; axle is across the page.
cx,cy,scale=330,365,3
rect(D,cx-105,cy-105,210,210,'#e8efea');text(D,cx,220,'TOP / LID REMOVED',15,anchor='middle')
for side in [-1,1]:
    rect(D,cx+side*97.5-10.5,cy-48,21,96,'#687b7c');rect(D,cx+side*45-39,cy-18,78,36,'#c4b895')
rect(D,cx-67.5,cy+24,135,75,'#b8d0dc');text(D,cx,cy+64,'BATTERY',13,anchor='middle');text(D,cx,cy+84,'25 × 45 × 18 max',11,anchor='middle')
for x in [-87,87]:
    for y in [-87,87]:D.append(f'<circle cx="{cx+x}" cy="{cy+y}" r="9" fill="none" stroke="{INK}"/>')
line(D,cx-105,cy-125,cx+105,cy-125);line(D,cx-105,cy-117,cx-105,cy-135);line(D,cx+105,cy-117,cx+105,cy-135);text(D,cx,cy-137,'70 shell',14,anchor='middle')
line(D,cx-108,cy+145,cx+108,cy+145);line(D,cx-108,cy+137,cx-108,cy+153);line(D,cx+108,cy+137,cx+108,cy+153);text(D,cx,cy+175,'72 tire envelope / track 65 + width 7',14,anchor='middle')
line(D,cx-145,cy-105,cx-145,cy+105);text(D,cx-157,cy,'70',14,anchor='end');text(D,cx,cy-170,'FRONT',13,GREEN,'middle')
# Side section at a consistent 3 pixels per millimeter.
x0,y0=800,540
rect(D,x0-105,y0-195,210,6,'#607f78');rect(D,x0-105,y0-189,210,171,'#e0e9df');rect(D,x0-100.2,y0-189,200.4,171,'#fbfcf9');rect(D,x0-105,y0-18,210,6,'#526a65')
rect(D,x0-98,y0-78,75,54,'#b8d0dc');rect(D,x0-18,y0-63,36,30,'#c4b895');D.append(f'<circle cx="{x0}" cy="{y0-48}" r="48" fill="none" stroke="{INK}" stroke-width="2"/>')
rect(D,x0-98.7,y0-94.8,197.4,4.8,'#c5b89b');rect(D,x0-67.5,y0-111.6,135,4.8,'#467f63');line(D,x0-145,y0,x0+145,y0,GRAY);text(D,x0,315,'SIDE SECTION / ASSEMBLED',15,anchor='middle')
line(D,x0+140,y0-195,x0+140,y0);text(D,x0+155,y0-90,'65 total',14);text(D,x0-130,y0-7,'4 clearance',12,anchor='end');text(D,x0+115,y0-92,'Deck at 30',12);text(D,x0+115,y0-111,'45 × 40 carrier',12);text(D,x0+115,y0-195,'2 mm lid',12)
text(D,60,650,'DETAILS TO VERIFY',14,GREEN);text(D,60,680,'Walls 1.6 · floor 2 · post pitch 58 · PCB hole pattern 39 × 34 (proposed) · wheel Ø32',14);text(D,60,710,'Battery bay, motor terminals, actual hub/shaft ends, switch opening and antenna clearance require measurement.',13,GRAY);text(D,60,740,'75 mm bare / 80 mm uniform envelopes apply to the complete robot, not just its printed shell.',13,GRAY)
D.append('</svg>');(ROOT/'case/dimensions.svg').write_text('\n'.join(D)+'\n')
print('Generated original schematic, connection schedule and case drawing.')
