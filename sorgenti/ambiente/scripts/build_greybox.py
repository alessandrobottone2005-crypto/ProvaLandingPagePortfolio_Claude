"""Fase A only. Run in Blender Python console; writes only sorgenti/ambiente."""
import bpy, math, json, traceback
from pathlib import Path
from mathutils import Vector, Matrix
P=Path('/Volumes/SSD_ALE/Portfolio2026/Projects/ProvaLandingPagePortfolio_Claude')
OUT=P/'sorgenti/ambiente'
# New scene preserves any other open scene in memory.
s=bpy.data.scenes.new('Ambiente Brutalista | Fase A')
bpy.context.window.scene=s
s.unit_settings.system='METRIC'; s.unit_settings.scale_length=1
s.render.engine='CYCLES' if False else 'CYCLES'
# Select installed EEVEE identifier without relying on a version-specific name.
s.render.engine=next(x.identifier for x in s.render.bl_rna.properties['engine'].enum_items if 'EEVEE' in x.identifier)
s.render.resolution_x=1440; s.render.resolution_y=900; s.render.resolution_percentage=100
s.render.image_settings.file_format='PNG'; s.render.image_settings.color_mode='RGB'
s.render.film_transparent=False
s.view_settings.view_transform='AgX'
s.view_settings.exposure=0.7
s.frame_start=1; s.frame_end=100
bpy.context.preferences.filepaths.save_version=3

def col(name):
 c=bpy.data.collections.new(name); s.collection.children.link(c); return c
A=col('ambiente'); R=col('riferimenti'); C=col('stazioni_e_camere'); L=col('luci_anteprima')
def material(name,hexcolor,rough=.8,metal=0):
 m=bpy.data.materials.new(name); m.use_nodes=True
 h=hexcolor.lstrip('#'); vals=[int(h[i:i+2],16)/255 for i in (0,2,4)]
 vals=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in vals]
 b=m.node_tree.nodes.get('Principled BSDF'); b.inputs['Base Color'].default_value=(*vals,1); b.inputs['Roughness'].default_value=rough; b.inputs['Metallic'].default_value=metal
 m.diffuse_color=(*vals,1); return m
con=material('A · cemento greybox','#c9c5c0'); dark=material('A · cemento in ombra','#4d4b4a'); floor=material('A · pavimento scuro','#141414',.22); proxy=material('R · card progetti','#4d4b4a',.7)
def mesh(name,vs,fs,mat,collection=A):
 me=bpy.data.meshes.new(name); me.from_pydata(vs,[],fs); me.update()
 ob=bpy.data.objects.new(name,me); collection.objects.link(ob); ob.data.materials.append(mat); return ob

def box(name,loc,dim,mat=con,collection=A):
 x,y,z=loc; a,b,c=[v/2 for v in dim]
 vs=[(x+dx*a,y+dy*b,z+dz*c) for dx,dy,dz in [(-1,-1,-1),(-1,-1,1),(-1,1,-1),(-1,1,1),(1,-1,-1),(1,-1,1),(1,1,-1),(1,1,1)]]
 return mesh(name,vs,[(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)],mat,collection)

def empty(name,loc,collection=C):
 o=bpy.data.objects.new(name,None); collection.objects.link(o); o.location=loc; o.empty_display_type='PLAIN_AXES'; o.empty_display_size=1; return o

def aim(o,target): o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
def camera(name,parent,loc,fov=18):
 d=bpy.data.cameras.new(name); d.sensor_fit='VERTICAL'; d.sensor_height=24; d.lens=12/math.tan(math.radians(fov/2)); d.clip_start=.1; d.clip_end=60
 o=bpy.data.objects.new(name,d); C.objects.link(o); o.parent=parent; o.location=loc; aim(o,(0,0,0)); o['fov_verticale']=fov; return o
stations={}
for name,x in [('header',0),('spirale',36),('biografia',72),('contatti',108)]:
 st=empty('stazione_'+name,(x,0,0)); stations[name]=st; st['sezione']=name; camera('cam_'+name,st,(0,-20,0))
orb=camera('cam_spirale_orbita',stations['spirale'],(0,-8.25,0),42)
for frame in range(1,101):
 t=(frame-1)/99; az=math.radians(-24+46*t); el=math.radians(10+4*math.sin(math.pi*t)); r=8.25
 orb.location=(r*math.sin(az)*math.cos(el),-r*math.cos(az)*math.cos(el),r*math.sin(el)); aim(orb,(0,0,0)); orb.keyframe_insert('location',frame=frame); orb.keyframe_insert('rotation_euler',frame=frame)
long=camera('cam_spirale_campo_lungo',stations['spirale'],(0,-40*math.cos(math.radians(10)),40*math.sin(math.radians(10))),42)
# Half-round arch ribbon with integrated straight piers, no wedge seams.
def arch(name,y,r=5.6,spring=-.5,width=.8,depth=1):
 inner=[(-r,-3.4)]+[(r*math.cos(math.pi-i*math.pi/40),spring+r*math.sin(math.pi-i*math.pi/40)) for i in range(41)]+[(r,-3.4)]
 outer=[(-r-width,-3.4)]+[((r+width)*math.cos(math.pi-i*math.pi/40),spring+(r+width)*math.sin(math.pi-i*math.pi/40)) for i in range(41)]+[(r+width,-3.4)]
 n=len(inner); vs=[]
 for yy in [y-depth/2,y+depth/2]:
  for seq in [inner,outer]: vs.extend([(x,yy,z) for x,z in seq])
 fs=[]
 for i in range(n-1):
  fs.extend([(i,i+1,n+i+1,n+i),(2*n+i,3*n+i,3*n+i+1,2*n+i+1),(i,2*n+i,2*n+i+1,i+1),(n+i,n+i+1,3*n+i+1,3*n+i)])
 fs.extend([(0,n,3*n,2*n),(n-1,3*n-1,4*n-1,2*n-1)])
 return mesh(name,vs,fs,con)
for i,y in enumerate([3,7,11,15,19,23]): arch('header · arco %02d'%i,y)
box('header · pavimento',(0,-1,-3.55),(34,52,.3),floor)
for side in [-1,1]: box('header · parete', (side*9,12,4),(1,25,15),dark)
box('header · fondo',(0,27,5),(18,1,18),dark)
# Slotted roof; light apertures are physically open.
for y,length in [(-7,15),(4.5,2),(8.5,2),(12.5,2),(16.5,2),(20.5,2),(25,4)]: box('header · copertura',(0,y,9),(18,length,.6),dark)
# Common front gallery and elevated lateral links connect the building.
box('connessioni · galleria camere',(54,-22,-4),(142,8,.6),floor)
box('connessioni · soffitto galleria',(54,-23,12),(142,6,.6),dark)
for x0,x1 in [(10,29.5),(42.5,66),(78,100)]: box('connessioni · passerella',((x0+x1)/2,0,-2.8),(x1-x0,3,.5),dark)
# Spiral: radius 5, +/-17 are strictly empty. Tower begins at y=7.
box('spirale · fondo',(36,14.5,5),(32,1,54),dark)
box('spirale · fondo pozzo',(36,1,-18.5),(33,28,1),floor)
for side in [-1,1]: box('spirale · quinta laterale',(36+side*15,7,5),(1,14,54),dark)
for j in range(8):
 z=-19+j*6.2
 off=[-3.3,2.5,-1.3,3.1][j%4]; w=[8,6.5,10,7][j%4]; dep=[3,5,4,3.5][j%4]
 box('spirale · blocco %02d'%j,(36+off,9.8+dep/2,z),(w,dep,6.05),con)
for side in [-1,1]:
 for j in range(7): box('spirale · contrafforte',(36+side*(10.5+(j%2)),8.5,-17+j*7),(2.8,5,6.7),con if side<0 else dark)
box('spirale · traverso alto',(36,7,31),(32,15,1),dark)
# Biography: diagonal perspective suspended walkway and massive dark right wall.
box('biografia · muro sinistro',(65.5,11,8),(3,28,40),con)
box('biografia · muro destro',(77.5,11,8),(5,28,40),dark)
box('biografia · fondo',(72,25,9),(18,1,42),dark)
walk=box('biografia · passerella',(69.5,8,-2.2),(2.8,30,.65),con)
box('biografia · copertura',(72,11,28),(18,30,1),dark)
# Contacts: single watertight staircase profile extruded along X.
vs=[]; profile=[(-4,-3.5),(5,-3.5)]
for i in range(28): profile.extend([(5+i*.58,-3.5+(i+1)*.25),(5+(i+1)*.58,-3.5+(i+1)*.25)])
profile.extend([(22,3.5),(22,-4.2),(-4,-4.2)])
for x in [102.2,113.8]: vs.extend([(x,y,z) for y,z in profile])
n=len(profile); fs=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
mesh('contatti · scalinata',vs,fs,con)
box('contatti · atrio',(108,-12,-3.65),(34,24,.3),floor)
for side in [-1,1]:
 box('contatti · muro',(108+side*9,9,8),(1,32,25),dark)
 for i in range(8): box('contatti · monoliti',(108+side*(6.7+(i%2)*.5),5+i*2.15,1+i*.55),(1.2,1.6,9+i*.7),con)
box('contatti · uscita sinistra',(100,23,8),(10,1,20),dark)
box('contatti · uscita destra',(116,23,8),(10,1,20),dark)
box('contatti · architrave',(108,23,15),(6,1,6),con)
# Daylight backdrop is a preview reference, not export geometry.
sky=material('R · cielo grigio','#c9c5c0',1); bs=sky.node_tree.nodes.get('Principled BSDF'); bs.inputs['Emission Color'].default_value=(.55,.53,.5,1); bs.inputs['Emission Strength'].default_value=.65
box('R · cielo uscita',(108,28,8),(20,.1,24),sky,R)
# Preview illumination and matching named light anchors.
def area(name,pos,target,power,size,size_y=None):
 d=bpy.data.lights.new(name,'AREA'); d.energy=power; d.color=(1,.98,.95); d.shape='RECTANGLE'; d.size=size; d.size_y=size_y or size
 o=bpy.data.objects.new(name,d); L.objects.link(o); o.location=pos; aim(o,target); return o
beams=[((0,-1,8.65),(0,1,-3.4),1.3,12,.85,3000),((-3,12,8.65),(1,16,-3.4),1.2,15,.65,2400),((34,-1,30),(37,5,-18),2,50,1,18000),((42,7,30),(34,11,-16),1.5,47,.75,12000),((68,3,27.4),(69.5,9,-3),1,33,.55,4000),((108,22,13),(108,9,-3.5),3,22,.95,5500)]
for i,(pos,target,w,length,intensity,power) in enumerate(beams,1):
 e=empty('luce_%02d'%i,pos,L); aim(e,target); e['larghezza']=w; e['lunghezza']=length; e['intensita']=intensity
 area('apertura_%02d'%i,pos,target,power,w,w*3)
# Aperture fills illuminate metallic reference; no colored lights.
for name,x in [('header',0),('spirale',36),('biografia',72),('contatti',108)]:
 area('riflesso apertura · '+name,(x-3,-5,7),(x,0,0),700 if name!='biografia' else 260,4,6)
sun=bpy.data.lights.new('sole radente','SUN'); sun.energy=1.4; sun.angle=math.radians(.7); sun.color=(1,.98,.95)
o=bpy.data.objects.new('sole radente',sun); L.objects.link(o); o.rotation_euler=(math.radians(19),math.radians(-24),math.radians(-15))
w=bpy.data.worlds.new('World · nebbia SOLO anteprima'); s.world=w; w.use_nodes=True
nd=w.node_tree.nodes; nd.get('Background').inputs['Color'].default_value=(.3,.3,.3,1); nd.get('Background').inputs['Strength'].default_value=.002
v=nd.new('ShaderNodeVolumePrincipled'); v.name='NEBBIA ANTEPRIMA — disattivare per bake'; v.inputs['Density'].default_value=.01; v.inputs['Color'].default_value=(.65,.65,.65,1); v.inputs['Anisotropy'].default_value=.3
w.node_tree.links.new(v.outputs['Volume'],nd.get('World Output').inputs['Volume'])
# Append = same operation as File > Append; never opens or saves original file.
logo_path=P/'sorgenti/logo-3d/Logo3DAnimabile_MetalloGrezzo_V2.blend'
bpy.ops.wm.append(directory=str(logo_path)+'/Collection/',filename='01 · logo animabile',link=False)
root=bpy.data.objects.get('logo_root'); assert root
items=[root,*root.children_recursive]
for ob in items:
 ob.animation_data_clear()
 if ob.type=='MESH' and ob.data.shape_keys:
  ob.data.shape_keys.animation_data_clear()
  for k in ob.data.shape_keys.key_blocks: k.value=0
root.rotation_euler=(0,0,0)
bpy.context.view_layer.update()
# Preserve world-space evaluated appearance, using linked meshes across four references.
source=[]
for ob in items:
 if ob.type=='MESH':
  eo=ob.evaluated_get(bpy.context.evaluated_depsgraph_get()); me=bpy.data.meshes.new_from_object(eo); source.append((ob.name,me,ob.matrix_world.copy()))
pts=[mat@v.co for _,me,mat in source for v in me.vertices]
lo=Vector(tuple(min(p[i] for p in pts) for i in range(3))); hi=Vector(tuple(max(p[i] for p in pts) for i in range(3))); center=(lo+hi)/2
for name,width,dx in [('header',6.5,0),('spirale',2.3,0),('biografia',2.5,-2.5),('contatti',4.8,0)]:
 factor=width/(hi.x-lo.x)
 for oname,me,mat in source:
  ob=bpy.data.objects.new('logo_'+name+' · '+oname,me); R.objects.link(ob)
  ob.matrix_world=Matrix.Translation(stations[name].location+Vector((dx,0,0)))@Matrix.Scale(factor,4)@Matrix.Translation(-center)@mat
  ob['riferimento']='Copia collegata mesh V2, posa neutra'; ob['stazione']=name
for ob in items: bpy.data.objects.remove(ob,do_unlink=True)
# Repoint any unpacked reference texture only in the new file.
for im in bpy.data.images:
 if im.source=='FILE' and not im.packed_file:
  orig=Path(bpy.path.abspath(im.filepath, start=str(logo_path.parent)))
  if orig.exists(): im.filepath=str(orig)
for i in range(20):
 t=i/19; a=2*math.pi*2.5*t
 o=box('proxy card %02d'%(i+1),(0,0,0),(1.4,.055,1.65),proxy,R); o.location=(36+3.5*math.sin(a),3.5*math.cos(a),-14+28*t); o.rotation_euler[2]=-a
# Consolidate architecture by zone and material, applying restrained greybox bevels.
for zone in ['header','spirale','biografia','contatti','connessioni']:
 for mat in [con,dark,floor]:
  obs=[o for o in A.objects if o.name.startswith(zone) and o.active_material==mat]
  if not obs: continue
  bpy.ops.object.select_all(action='DESELECT')
  for o in obs: o.select_set(True)
  bpy.context.view_layer.objects.active=obs[0]; bpy.ops.object.join(); o=obs[0]; o.name=zone+' · '+mat.name
  b=o.modifiers.new('Smusso 0.035u','BEVEL'); b.width=.035; b.segments=2
  bpy.ops.object.modifier_apply(modifier=b.name)
# Clear empty source collection from active scene, preserving any unrelated original scene.
for c in list(s.collection.children):
 if c not in [A,R,C,L]: s.collection.children.unlink(c)
s.frame_set(1); s.camera=bpy.data.objects['cam_header']
s['fase']='A — GREYBOX, attende approvazione; nessun bake o export'
s['conversione_assi']='Blender (x,y,z) -> sito (x,z,-y)'
s['note']='Architettura collegata; segmenti stazioni/camere liberi. Nebbia e logo sono riferimenti.'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Ambiente_Brutalista.blend'))
(OUT/'build-complete.txt').write_text('Fase A creata.\n')
print('GREYBOX_BUILD_COMPLETE')
