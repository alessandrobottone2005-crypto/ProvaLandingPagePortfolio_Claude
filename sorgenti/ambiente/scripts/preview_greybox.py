import bpy, json, math, traceback
from pathlib import Path
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
OUT=Path('/Volumes/SSD_ALE/Portfolio2026/Projects/ProvaLandingPagePortfolio_Claude/sorgenti/ambiente')
s=bpy.context.scene
A=bpy.data.collections['ambiente']
# Validation geometry only.
verts=[]; faces=[]; tris=0
for o in A.objects:
 off=len(verts); verts.extend([o.matrix_world@v.co for v in o.data.vertices]); faces.extend([tuple(off+i for i in p.vertices) for p in o.data.polygons]); o.data.calc_loop_triangles(); tris+=len(o.data.loop_triangles)
bvh=BVHTree.FromPolygons(verts,faces)
hits=[]
for y in [0,-20]:
 for x in [0,36,72]:
  for dz in [-.25,0,.25]:
   hit=bvh.ray_cast(Vector((x,y,dz)),Vector((1,0,0)),36)
   if hit[0] is not None: hits.append({'x':x,'y':y,'z':dz,'hit':list(hit[0])})
# Conservative triangle AABB distance to cylinder; 0 hits confirms clearance.
cylinder_hits=0
for o in A.objects:
 for t in o.data.loop_triangles:
  ps=[o.matrix_world@o.data.vertices[i].co for i in t.vertices]
  if max(p.z for p in ps)<-17 or min(p.z for p in ps)>17: continue
  x0=min(p.x for p in ps)-36; x1=max(p.x for p in ps)-36; y0=min(p.y for p in ps); y1=max(p.y for p in ps)
  dx=max(x0,-x1,0); dy=max(y0,-y1,0)
  if dx*dx+dy*dy<25-1e-5: cylinder_hits+=1
report={'fase':'A','triangoli':tris,'oggetti_ambiente':len(A.objects),'collisioni_percorsi':hits,'triangoli_potenzialmente_nel_cilindro':cylinder_hits,'stazioni':{},'lame':[],'camera_fov':{}}
for name in ['header','spirale','biografia','contatti']:
 o=bpy.data.objects['stazione_'+name]; report['stazioni'][name]={'posizione':list(o.location),'rotazione_z':o.rotation_euler.z}
for o in s.objects:
 if o.name.startswith('luce_'): report['lame'].append({'nome':o.name,'posizione':list(o.location),'direzione':list(o.rotation_euler.to_matrix()@Vector((0,0,-1))),'larghezza':o['larghezza'],'lunghezza':o['lunghezza'],'intensita':o['intensita']})
 if o.type=='CAMERA': report['camera_fov'][o.name]={'verticale':math.degrees(2*math.atan(o.data.sensor_height/(2*o.data.lens))),'clip_end':o.data.clip_end}
(OUT/'verifica-greybox.json').write_text(json.dumps(report,indent=2))
assert not hits, str(hits)
assert cylinder_hits==0, cylinder_hits
assert tris<=150000 and len(A.objects)<=40
# Save working script in the Scripting workspace for inspection.
for name in ['build_greybox.py','preview_greybox.py']:
 if name not in bpy.data.texts: bpy.data.texts.load(str(OUT/'scripts'/name))
s.camera=bpy.data.objects['cam_header']; s.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Ambiente_Brutalista.blend'))
# Full required set, plus the normal spiral camera for integration review.
jobs=[]
for cam,frame,label in [('cam_header',1,'01_header'),('cam_spirale_orbita',1,'02_spirale_orbita_001'),('cam_spirale_orbita',50,'03_spirale_orbita_050'),('cam_spirale_orbita',100,'04_spirale_orbita_100'),('cam_spirale_campo_lungo',1,'05_spirale_campo_lungo'),('cam_biografia',1,'06_biografia'),('cam_contatti',1,'07_contatti'),('cam_spirale',1,'08_spirale_frontale')]:
 for w,h,fmt in [(1440,900,'desktop'),(390,844,'mobile')]: jobs.append((cam,frame,label,w,h,fmt))
jobs.append(('cam_biografia',1,'09_biografia_affianca_testo',390,844,'mobile'))
# Reference matrices are restored before every view and before saving.
logo_objects=[o for o in bpy.data.collections['riferimenti'].objects if o.get('stazione')]
logo_original={o.name:o.matrix_world.copy() for o in logo_objects}
widths_desktop={'header':6.5,'spirale':2.3,'biografia':2.5,'contatti':4.8}
widths_mobile={'header':2.5,'spirale':1.2,'biografia':48*(40*math.tan(math.radians(9)))/844,'contatti':2.4}
centers={'header':Vector((0,0,0)),'spirale':Vector((36,0,0)),'biografia':Vector((69.5,0,0)),'contatti':Vector((108,0,0))}
mobile_bio=Vector((72+(38-195)*(40*math.tan(math.radians(9)))/844,0,(422-38)*(40*math.tan(math.radians(9)))/844))
def restore_logos():
 for o in logo_objects:o.matrix_world=logo_original[o.name].copy()
 bpy.context.view_layer.update()
def mobile_logos():
 for o in logo_objects:
  name=o['stazione'];c=centers[name];target=mobile_bio if name=='biografia' else c
  o.matrix_world=Matrix.Translation(target)@Matrix.Scale(widths_mobile[name]/widths_desktop[name],4)@Matrix.Translation(-c)@logo_original[o.name]
 bpy.context.view_layer.update()
report['logo_larghezze_desktop']=widths_desktop;report['logo_larghezze_mobile']=widths_mobile
report['biografia_mobile']={'posa':'transizione alto-sinistra, 48 px centrata a (38,38)','centro':list(mobile_bio)}
(OUT/'verifica-greybox.json').write_text(json.dumps(report,indent=2))
preview_state={'i':0}
def render_next():
 try:
  i=preview_state['i']
  if i>=len(jobs):
   restore_logos()
   s.camera=bpy.data.objects['cam_header']; s.frame_set(1); s.render.resolution_x=1440; s.render.resolution_y=900
   bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Ambiente_Brutalista.blend'))
   (OUT/'render-status.json').write_text(json.dumps({'complete':True,'count':i})); return None
  cam,frame,label,w,h,fmt=jobs[i]
  restore_logos()
  if fmt=='mobile':
   mobile_logos()
   if label=='09_biografia_affianca_testo':
    u=40*math.tan(math.radians(9))/844
    for o in logo_objects:
     if o['stazione']=='biografia':o.matrix_world=Matrix.Translation(Vector((72+(55-195)*u,0,0)))@Matrix.Scale(78*u/2.5,4)@Matrix.Translation(-centers['biografia'])@logo_original[o.name]
    bpy.context.view_layer.update()
  s.camera=bpy.data.objects[cam]; s.frame_set(frame); s.render.resolution_x=w; s.render.resolution_y=h
  s.render.filepath=str(OUT/'anteprime/greybox'/f'{label}_{fmt}.png')
  (OUT/'render-status.json').write_text(json.dumps({'complete':False,'index':i,'render':s.render.filepath}))
  bpy.ops.render.render(write_still=True)
  preview_state['i']+=1
  return 1.0
 except Exception:
  restore_logos()
  (OUT/'render-error.txt').write_text(traceback.format_exc()); return None
bpy.app.timers.register(render_next,first_interval=1)
print('VERIFICA_OK_RENDER_QUEUE_STARTED', report['triangoli'])
