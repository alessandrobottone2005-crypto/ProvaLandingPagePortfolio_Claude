import bpy, math
from mathutils import Vector
from pathlib import Path
OUT=Path(bpy.data.filepath).parent
for zone,x,power in [('header',0,230),('spirale',36,270),('biografia',69.5,340),('contatti',108,350)]:
 o=bpy.data.objects['riflesso apertura · '+zone]
 o.location=(x-2,-4,4.5)
 o.rotation_euler=(Vector((x,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
 o.data.energy=power; o.data.size=2; o.data.size_y=3; o.data.spread=math.radians(42)
bpy.data.lights['apertura_05'].energy=3300
exec((OUT/'scripts/preview_greybox.py').read_text())
