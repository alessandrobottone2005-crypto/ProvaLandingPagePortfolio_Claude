import bpy,json
from pathlib import Path
from mathutils import Vector
OUT=Path('/Volumes/SSD_ALE/Portfolio2026/Projects/ProvaLandingPagePortfolio_Claude/sorgenti/ambiente')
path=OUT/'assets_online/Modular Concrete Interior/Modular Concrete Interior.blend'
with bpy.data.libraries.load(str(path),link=False) as (src,dst):dst.objects=src.objects
report=[]
for o in dst.objects:
 if not o or o.type!='MESH':continue
 ps=[o.matrix_world@Vector(v) for v in o.bound_box]
 report.append({'name':o.name,'verts':len(o.data.vertices),'min':[min(v[k] for v in ps) for k in range(3)],'max':[max(v[k] for v in ps) for k in range(3)],'materials':[m.name for m in o.data.materials if m],'mods':[m.type for m in o.modifiers]})
(OUT/'assets_online/mesh-inventory.json').write_text(json.dumps(report,indent=2))
print('ONLINE ASSETS:',[r['name'] for r in report])
