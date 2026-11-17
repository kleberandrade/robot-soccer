"""Check committed engineering artifacts without claiming physical validation."""
from pathlib import Path
from collections import Counter
import struct, json, math, csv, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
p=json.loads((ROOT/'case/dimensions.json').read_text())
for name in ['tray','lid','electronics-deck','skid']:
    data=(ROOT/'case'/f'{name}.stl').read_bytes();count=struct.unpack_from('<I',data,80)[0]
    assert len(data)==84+count*50 and count>0,name
    edges=Counter();points=[]
    for i in range(count):
        values=struct.unpack_from('<12fH',data,84+i*50)
        tri=[tuple(round(v,5) for v in values[j:j+3]) for j in [3,6,9]]
        assert all(math.isfinite(v) for q in tri for v in q)
        for j in range(3):edges[tuple(sorted((tri[j],tri[(j+1)%3])))]+=1
        points.extend(tri)
    assert all(n==2 for n in edges.values()),f'{name} has an open/non-manifold edge'
    assert min(q[2] for q in points)>=-1e-5
    if name in ['tray','lid']:assert max(abs(q[a]) for q in points for a in [0,1])<=p['caseSide']/2+1e-5
for name in ['electronics.svg','wiring.svg','case/dimensions.svg']:ET.parse(ROOT/name)
assert (ROOT/'electronics.svg').read_bytes()==(ROOT/'wiring.svg').read_bytes()
with (ROOT/'connections.csv').open() as f:
    rows=list(csv.DictReader(f))
assert len(rows)==20
pins={r['net']:r for r in rows}
assert 'P6' in pins['A_PWM']['from'] and '23' in pins['A_PWM']['to']
assert 'P21' in pins['STBY']['from'] and '19' in pins['STBY']['to']
print('Verified 4 closed STL parts, shell bounds, SVG syntax and the connection schedule.')
