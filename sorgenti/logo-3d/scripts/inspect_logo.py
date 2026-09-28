import bpy, json
from mathutils import Vector
out=[]
for o in bpy.data.objects:
 d={'name':o.name,'type':o.type,'location':list(o.location),'rotation':list(o.rotation_euler),'scale':list(o.scale),'dimensions':list(o.dimensions),'parent':o.parent.name if o.parent else None,'modifiers':[(m.name,m.type) for m in o.modifiers]}
 if o.type=='MESH':
  d.update(vertices=len(o.data.vertices),faces=len(o.data.polygons),bounds=[list(o.matrix_world@Vector(c)) for c in o.bound_box],shape_keys=list(o.data.shape_keys.key_blocks.keys()) if o.data.shape_keys else [],materials=[m.name if m else None for m in o.data.materials])
 out.append(d)
print(json.dumps(out,indent=2))
