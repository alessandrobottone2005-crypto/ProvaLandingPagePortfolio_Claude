import bpy, math, bmesh
s=bpy.context.scene
s.view_settings.exposure=-.45
bpy.data.lights['sole radente'].energy=.025
for o in bpy.data.collections['luci_anteprima'].objects:
 if o.type=='LIGHT' and o.data.type=='AREA':
  if o.name.startswith('apertura'):
   o.data.energy*=.8; o.data.spread=math.radians(35)
  else: o.data.energy*=.6; o.data.spread=math.radians(100)
# Architectural roof openings for the designated overhead sources.
A=bpy.data.collections['ambiente']; dark=bpy.data.materials['A · cemento in ombra']
def remove_roof_islands(o,test):
 bm=bmesh.new(); bm.from_mesh(o.data); seen=set(); kill=[]
 for v in list(bm.verts):
  if v in seen: continue
  stack=[v]; seen.add(v); island=[]
  while stack:
   q=stack.pop(); island.append(q)
   for ed in q.link_edges:
    n=ed.other_vert(q)
    if n not in seen: seen.add(n); stack.append(n)
  pts=[o.matrix_world@q.co for q in island]; lo=[min(p[k] for p in pts) for k in range(3)]; hi=[max(p[k] for p in pts) for k in range(3)]
  if test(lo,hi): kill.extend(island)
 bmesh.ops.delete(bm,geom=kill,context='VERTS'); bm.to_mesh(o.data); bm.free()
remove_roof_islands(bpy.data.objects['header · A · cemento in ombra'],lambda lo,hi: lo[2]>8 and hi[2]<10)
remove_roof_islands(bpy.data.objects['spirale · A · cemento in ombra'],lambda lo,hi: lo[2]>30 and hi[2]<32)
remove_roof_islands(bpy.data.objects['biografia · A · cemento in ombra'],lambda lo,hi: lo[2]>27 and hi[2]<29)
# box function defined by build script remains available in the console namespace.
for a,b in [(-15,-2),(0,3),(5,10.8),(13.2,17),(20,27)]: box('header · copertura corretta',(0,(a+b)/2,9),(18,b-a,.6),dark,A)
for a,b in [(20,40.8),(43.2,52)]: box('spirale · copertura corretta',((a+b)/2,7,31),(b-a,15,1),dark,A)
for a,b in [(63,67.3),(68.7,81)]: box('biografia · copertura corretta',((a+b)/2,11,28),(b-a,30,1),dark,A)
for zone in ['header','spirale','biografia']:
 obs=[o for o in A.objects if o.name.startswith(zone) and o.active_material==dark]
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs: o.select_set(True)
 bpy.context.view_layer.objects.active=obs[0]; bpy.ops.object.join()
# Test only one image before the final complete set.
s.camera=bpy.data.objects['cam_header']; s.frame_set(1); s.render.resolution_x=1440; s.render.resolution_y=900
s.render.filepath=str(OUT/'anteprime/greybox/test_luce.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Ambiente_Brutalista.blend'))
bpy.ops.render.render(write_still=True)
