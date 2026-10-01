import bpy
from pathlib import Path
out=Path(bpy.data.filepath).parent
s=bpy.context.scene; s.frame_set(1); s.camera=bpy.data.objects['cam_header']
for o in s.objects: o.select_set(False)
for name in ['preview_greybox.py','finish_greybox.py','logo_readability.py']:
 t=bpy.data.texts.get(name) or bpy.data.texts.new(name)
 t.clear(); t.write((out/'scripts'/name).read_text())
a=bpy.context.area; a.type='VIEW_3D'; a.spaces.active.region_3d.view_perspective='CAMERA'; a.spaces.active.overlay.show_overlays=False; a.spaces.active.shading.type='RENDERED'
bpy.ops.wm.save_as_mainfile(filepath=str(out/'Ambiente_Brutalista.blend'))
