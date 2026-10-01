import bpy,json
from pathlib import Path
out=Path(bpy.path.abspath('//'))
s=bpy.context.scene
r={'engine':s.render.engine,'exposure':s.view_settings.exposure,'objects':[],'lights':[]}
for o in bpy.data.collections['ambiente'].objects:
 r['objects'].append({'name':o.name,'matrix':[list(v) for v in o.matrix_world],'vertices':len(o.data.vertices)})
for o in s.objects:
 if o.type=='LIGHT':r['lights'].append({'name':o.name,'energy':o.data.energy,'position':list(o.location)})
(out/'revision-before.json').write_text(json.dumps(r,indent=2))
print('REVISION_INSPECTION_OK')
