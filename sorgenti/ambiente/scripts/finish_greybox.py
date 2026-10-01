import bpy, math
from pathlib import Path
OUT=Path(bpy.data.filepath).parent
s=bpy.context.scene
s.view_settings.exposure=-.7
# Explicit levels allow deterministic reruns.
for i,power in enumerate([1300,550,5600,3600,1000,1500],1): bpy.data.lights['apertura_%02d'%i].energy=power
for o in s.objects:
 if o.type=='LIGHT' and o.name.startswith('riflesso apertura'): o.data.energy=120 if 'biografia' not in o.name else 70
bpy.data.lights['sole radente'].energy=.008
# A diagonal overhead slit produces the central hero highlight.
from mathutils import Vector
for name in ['luce_01','apertura_01']:
 o=bpy.data.objects[name]; o.location=(-3,-1,8.65); o.rotation_euler=(Vector((0,2,-3.4))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.data.lights['apertura_01'].spread=math.radians(22)
exec((OUT/'scripts/preview_greybox.py').read_text())
