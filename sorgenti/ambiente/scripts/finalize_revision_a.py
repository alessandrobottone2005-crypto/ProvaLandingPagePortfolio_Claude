import bpy,json,math
from pathlib import Path
from mathutils import Vector
out=Path(bpy.path.abspath('//'));s=bpy.context.scene
check=json.loads((out/'verifica-greybox.json').read_text())
check['logo_larghezze_desktop_misurate']={}
for name,expected in [('header',6.5),('spirale',2.3),('biografia',2.5),('contatti',4.8)]:
 obs=[o for o in bpy.data.collections['riferimenti'].objects if o.get('stazione')==name]
 xs=[(o.matrix_world@v.co).x for o in obs for v in o.data.vertices]
 width=max(xs)-min(xs);assert abs(width-expected)<.001,(name,width)
 check['logo_larghezze_desktop_misurate'][name]=width
check['biografia_mobile_affianca_testo']={'larghezza_px':78,'centro_px':[55,422],'larghezza_u':78*40*math.tan(math.radians(9))/844}
check['materiali_ambiente']=sorted(set(m.name for o in bpy.data.collections['ambiente'].objects for m in o.data.materials if m))
(out/'verifica-greybox.json').write_text(json.dumps(check,indent=2))
for name in ['preview_greybox.py','revise_phase_a.py','refine_revision_a.py','finalize_revision_a.py']:
 t=bpy.data.texts.get(name) or bpy.data.texts.new(name);t.clear();t.write((out/'scripts'/name).read_text())
s.frame_set(1);s.camera=bpy.data.objects['cam_header'];s.render.resolution_x=1440;s.render.resolution_y=900
for o in s.objects:o.select_set(False)
a=bpy.context.area;a.type='VIEW_3D';a.spaces.active.region_3d.view_perspective='CAMERA';a.spaces.active.overlay.show_overlays=False;a.spaces.active.shading.type='RENDERED'
bpy.ops.wm.save_as_mainfile(filepath=str(out/'Ambiente_Brutalista.blend'))
(out/'revisione-A-completa.txt').write_text('Revisione A verificata. 17 anteprime. Desktop ripristinato. Attende approvazione prima della Fase B.\n')
