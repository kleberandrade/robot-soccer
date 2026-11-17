"""Original parametric concept. Millimeters; software mesh checks are not fit/print tests."""
from pathlib import Path
import json, struct
from collections import Counter
import numpy as np
from manifold3d import Manifold as M, CrossSection as C
ROOT=Path(__file__).resolve().parent
P=json.loads((ROOT/'dimensions.json').read_text())
def box(size,at=(0,0,0)):
    return M.cube(size,center=True).translate(at)
def cylinder(height,radius,at=(0,0,0),top=None):
    return M.cylinder(height,radius,radius if top is None else top,48).translate(at)
def rounded(side,height,radius=3,z=0):
    profile=C.square((side-2*radius,side-2*radius),center=True).offset(radius,circular_segments=48)
    return M.extrude(profile,height).translate((0,0,z))
def case_tray():
    s=P['caseSide']; w=P['wall']; h=P['bodyTop']-P['lidThickness']-P['groundClearance']
    tray=rounded(s,h)-rounded(s-2*w,h+1,max(.5,3-w),P['floor'])
    # Wheel windows remove the lower side walls, including tire clearance.
    for sy in [-1,1]:
        tray-=box((36,15,35),(0,sy*P['wheelTrack']/2,12.5))
    pitch=P['casePostPitch']/2
    for x in [-pitch,pitch]:
        for y in [-pitch,pitch]:
            tray+=cylinder(h-P['floor'],3,(x,y,P['floor']))
            tray+=cylinder(1.6,6.4,(x,y,P['deckZ']-P['groundClearance']-1.6))
    # Two N20 bodies sit above the floor; lateral locators leave the battery bay clear.
    length=2*P['motorLength']+P['motorBackGap']+.6
    tray+=box((15,length,5),(0,0,P['floor']+2.5))
    for x in [-6.9,6.9]:
        tray+=box((1.2,length,10),(x,0,P['floor']+5))
    # Strap slots are outside the nominal battery footprint.
    for x in [-10,10]:
        for y in [-26.5,26.5]:
            tray-=box((2.5,3,4),(x,y,1))
    for x in [-pitch,pitch]:
        for y in [-pitch,pitch]:
            tray-=cylinder(14,P['pilotDiameter']/2,(x,y,h-13))
    # Provisional accessible switch opening; adapt to the selected switch.
    tray-=box((5,12,7),(s/2,0,36))
    return tray ^ rounded(s,h)

def case_lid():
    lid=rounded(P['caseSide'],P['lidThickness'])
    pitch=P['casePostPitch']/2
    for x in [-pitch,pitch]:
        for y in [-pitch,pitch]:
            lid-=cylinder(4,P['clearanceDiameter']/2,(x,y,-1))
            lid-=cylinder(1.3,1.2,(x,y,.8),top=2.4)
    return lid

def electronics_deck():
    deck=rounded(P['caseSide']-2*P['wall']-1,P['deckThickness'],2)
    pitch=P['casePostPitch']/2
    for x in [-pitch,pitch]:
        for y in [-pitch,pitch]:
            deck-=cylinder(4,3.3,(x,y,-1))
    for x in [-P['pcbHolePattern'][0]/2,P['pcbHolePattern'][0]/2]:
        for y in [-P['pcbHolePattern'][1]/2,P['pcbHolePattern'][1]/2]:
            deck+=cylinder(P['pcbStandoff'],2.5,(x,y,P['deckThickness']))
            deck-=cylinder(8,P['pilotDiameter']/2,(x,y,-1))
    for x in [-27,27]:
        deck-=box((4,22,4),(x,0,1))
    # The wheel tops reach z=32; the removable plate at z=30 needs side notches.
    for side in [-1,1]:
        deck-=box((2*P['wheelRadius']+4,15,12),(0,side*P['wheelTrack']/2,3))
    return deck

def skid():
    return cylinder(P['groundClearance'],3.5)

def write_mesh(name,solid):
    assert str(solid.status()).endswith('NoError'),(name,solid.status())
    assert solid.volume()>0
    mesh=solid.to_mesh(); vertices=np.asarray(mesh.vert_properties)[:,:3]; triangles=np.asarray(mesh.tri_verts)
    edges=Counter(tuple(sorted((int(t[i]),int(t[(i+1)%3])))) for t in triangles for i in range(3))
    assert all(n==2 for n in edges.values()),f'{name}: non-manifold edge'
    with (ROOT/(name+'.stl')).open('wb') as f:
        f.write(b'ROBOTSOCCER unbuilt parametric concept; millimeters'.ljust(80,b' '));f.write(struct.pack('<I',len(triangles)))
        for t in triangles:
            a,b,c=vertices[t];normal=np.cross(b-a,c-a);normal/=np.linalg.norm(normal)
            f.write(struct.pack('<12fH',*normal,*a,*b,*c,0))
    return {'file':name+'.stl','vertices':len(vertices),'triangles':len(triangles),'volumeMm3':round(solid.volume(),2),'boundsMm':list(solid.bounding_box()),'closedEdges':True}

parts={'tray':case_tray(),'lid':case_lid(),'electronics-deck':electronics_deck(),'skid':skid()}
battery=box(P['batteryMax'],P['batteryCenter'])
tray_assembled=parts['tray'].translate((0,0,P['groundClearance']))
assert (tray_assembled ^ battery).volume()<1e-6,'Battery keepout intersects tray'
assert (parts['electronics-deck'].translate((0,0,P['deckZ'])) ^ battery).volume()<1e-6,'Battery intersects deck'
deck_assembled=parts['electronics-deck'].translate((0,0,P['deckZ']))
lid_assembled=parts['lid'].translate((0,0,P['bodyTop']-P['lidThickness']))
for side in [-1,1]:
    motor=box((P['motorWidth'],P['motorLength'],P['motorHeight']),(0,side*(P['motorLength']+P['motorBackGap'])/2,P['wheelRadius']))
    wheel=M.cylinder(P['wheelWidth'],P['wheelRadius'],circular_segments=48,center=True).rotate((90,0,0)).translate((0,side*P['wheelTrack']/2,P['wheelRadius']))
    for name,solid in [('tray',tray_assembled),('deck',deck_assembled),('lid',lid_assembled),('battery',battery)]:
        assert (solid ^ motor).volume()<1e-6,f'Motor intersects {name}'
        assert (solid ^ wheel).volume()<1e-6,f'Wheel intersects {name}'
# Assembly positions are separate from the flat-on-bed STL origins.
report={'units':'mm','status':'unbuilt concept; no fit, load, thermal or print validation','batteryTrayIntersectionMm3':0,'batteryDeckIntersectionMm3':0,'nominalMotorAndWheelClearance':True,'wheelEnvelopeWidthMm':P['wheelTrack']+P['wheelWidth'],'shellFootprintMm':[P['caseSide'],P['caseSide']],'assemblyOffsets':{'tray':[0,0,4],'lid':[0,0,63],'electronics-deck':[0,0,30],'skid':[0,0,0]},'parts':[write_mesh(n,m) for n,m in parts.items()]}
assert report['wheelEnvelopeWidthMm']<=75
for part in report['parts'][:2]:
    b=part['boundsMm'];assert max(abs(b[0]),abs(b[1]),abs(b[3]),abs(b[4]))<=P['caseSide']/2+1e-6
(ROOT/'mesh-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'parts':len(parts),'closedManifoldMeshes':True,'nominalTireEnvelopeMm':report['wheelEnvelopeWidthMm'],'physicalValidation':False}))
