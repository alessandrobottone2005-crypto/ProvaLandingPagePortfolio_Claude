"""Build an editable, bevelled logo from Alessandro's original Blender meshes.
Run: Blender --factory-startup -b Logo3DAnimabile.blend --python build_logo.py
"""
import bpy, bmesh, math, json, shutil
from pathlib import Path
from mathutils import Vector, Matrix, Quaternion
import numpy as np
BASE=Path(__file__).resolve().parents[1]
TEX=BASE/'textures'; OUT=BASE/'anteprime'
SOURCE=Path('/Users/alessandrobottonedesigner/Desktop/Logo3DAnimabile.blend')
if not (BASE/'Logo3DAnimabile_originale.blend').exists(): shutil.copy2(SOURCE,BASE/'Logo3DAnimabile_originale.blend')
scene=bpy.context.scene
# Preserve all original vertex positions in world space, then remove accidental parenting.
meshes=[o for o in scene.objects if o.type=='MESH']
world={o.name:o.matrix_world.copy() for o in meshes}
for o in list(scene.objects):
 if o.type!='MESH': bpy.data.objects.remove(o,do_unlink=True)
names={'Circle':'lente_dx','Circle.001':'lente_sx','Circle.002':'pupilla_dx','Circle.003':'pupilla_sx','Circle.004':'sorriso','Circle.005':'palpebra_dx','Circle.006':'palpebra_sx','Cube':'naso','Cube.001':'ponte'}
logo=bpy.data.collections.new('01 · logo animabile');scene.collection.children.link(logo)
for o in meshes:
 old=o.name;m=world[old];o.parent=None;o.matrix_world=Matrix.Identity(4)
 for v in o.data.vertices:v.co=m@v.co
 o.name=names[old];o.data.name=o.name+'_geometria'
 for c in list(o.users_collection):c.objects.unlink(o)
 logo.objects.link(o)
 bm=bmesh.new();bm.from_mesh(o.data)
 bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001)
 boundary=[e for e in bm.edges if e.is_boundary]
 if boundary:bmesh.ops.holes_fill(bm,edges=boundary,sides=0)
 bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(o.data);bm.free()
 # The eyelids sit just ahead of pupils, avoiding coplanar flicker.
 if 'palpebra' in o.name:
  for v in o.data.vertices:v.co.y-=.065
 # Apply modifiers to the production mesh before adding expressive shape keys.
 # An untouched source copy and reconstruction script retain editability.
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
 bevel=o.modifiers.new('Bevel · bordi morbidi','BEVEL');bevel.width=.027 if 'pupilla' not in o.name else .016
 bevel.segments=3;bevel.limit_method='ANGLE';bevel.angle_limit=math.radians(28)
 bevel.affect='EDGES'
 sub=o.modifiers.new('Subdivision Surface · curve continue','SUBSURF');sub.levels=2;sub.render_levels=2
 for mod in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
 for p in o.data.polygons:p.use_smooth=True
 # Planar front UVs have a consistent real-world density; sides use a second projection.
 uv=o.data.uv_layers.new(name='Metal_UV')
 for p in o.data.polygons:
  axis=max(range(3),key=lambda i:abs(p.normal[i]))
  for li in p.loop_indices:
   co=o.data.vertices[o.data.loops[li].vertex_index].co
   uv.data[li].uv=((co.x,co.z) if axis==1 else (co.y,co.z) if axis==0 else (co.x,co.y))
 o['origine']='Logo3DAnimabile.blend · '+old
 o['finitura']='Bevel 3 segmenti + Catmull-Clark 2 livelli applicati prima delle shape key'
# Make physically plausible, matte rough-metal maps from ambientCG Metal032.
def image_array(path):
 im=bpy.data.images.load(str(path),check_existing=True);a=np.array(im.pixels[:],dtype=np.float32).reshape(im.size[1],im.size[0],4);return im,a
def save_map(name,a):
 h,w=a.shape[:2];im=bpy.data.images.new(name,w,h,alpha=False);im.colorspace_settings.name='Non-Color';im.pixels.foreach_set(a.ravel());im.filepath_raw=str(TEX/(name+'.png'));im.file_format='PNG';im.save();return im
_,rough=image_array(TEX/'Metal032/Metal032_2K-JPG_Roughness.jpg')
# Deterministic micro-grain, texture roughness remapped to 0.65–0.83.
rng=np.random.default_rng(20260927);grain=rng.random(rough.shape[:2],dtype=np.float32)
r=rough.copy();r[:,:,:3]=np.clip(.65+.15*rough[:,:,:3]+.035*(grain[:,:,None]-.5),.62,.84);r[:,:,3]=1
roughim=save_map('MetalloGrezzo_Roughness',r)
_,norm=image_array(TEX/'Metal032/Metal032_2K-JPG_NormalGL.jpg')
n=norm.copy();gx=np.roll(grain,1,1)-np.roll(grain,-1,1);gy=np.roll(grain,1,0)-np.roll(grain,-1,0)
x=(norm[:,:,0]*2-1)*.3+gx*.17;y=(norm[:,:,1]*2-1)*.3+gy*.17;z=np.ones_like(x);l=np.sqrt(x*x+y*y+z*z)
n[:,:,0]=x/l*.5+.5;n[:,:,1]=y/l*.5+.5;n[:,:,2]=z/l*.5+.5;n[:,:,3]=1
normalim=save_map('MetalloGrezzo_NormalGL',n)
# Neutral, unpainted aluminium/steel: texture changes are restrained, no rust or tint.
_,col=image_array(TEX/'Metal032/Metal032_2K-JPG_Color.jpg');lum=col[:,:,:3].mean(axis=2);c=col.copy()
v=np.clip(.52+.16*(lum-lum.mean()),.42,.65)
c[:,:,0]=v*1.015;c[:,:,1]=v;c[:,:,2]=v*.977;c[:,:,3]=1
colorim=save_map('MetalloGrezzo_BaseColor',c)
mat=bpy.data.materials.new('metallo grezzo · argento opaco');mat.use_nodes=True
nd=mat.node_tree.nodes;lk=mat.node_tree.links;bs=nd.get('Principled BSDF');bs.inputs['Metallic'].default_value=1
bs.inputs['Roughness'].default_value=.74;mat.diffuse_color=(.55,.54,.52,1)
for name,im,socket,pos in [('colore',colorim,'Base Color',(-650,250)),('rugosità',roughim,'Roughness',(-650,0))]:
 t=nd.new('ShaderNodeTexImage');t.name=name;t.label=name;t.image=im;t.location=pos;lk.new(t.outputs['Color'],bs.inputs[socket])
t=nd.new('ShaderNodeTexImage');t.image=normalim;t.location=(-650,-250);t.label='grana fine e micrograffi'
nor=nd.new('ShaderNodeNormalMap');nor.location=(-300,-200);nor.inputs['Strength'].default_value=.65
lk.new(t.outputs['Color'],nor.inputs['Color']);lk.new(nor.outputs['Normal'],bs.inputs['Normal'])
for o in meshes:o.data.materials.clear();o.data.materials.append(mat)
# Runtime-compatible control hierarchy; no Blender-only drivers are required.
def empty(name,parent=None,loc=(0,0,0)):
 o=bpy.data.objects.new(name,None);logo.objects.link(o);o.empty_display_type='PLAIN_AXES';o.empty_display_size=.18;o.parent=parent;o.location=loc;return o
root=empty('logo_root');head=empty('testa',root)
for o in meshes:o.parent=head
pupils=[];lids=[]
for side in ['sx','dx']:
 o=bpy.data.objects['pupilla_'+side];cx=sum(v.co.x for v in o.data.vertices)/len(o.data.vertices)
 ctrl=empty('sguardo_'+side,head,(cx,0,.523));o.parent=ctrl
 for v in o.data.vertices:v.co-=Vector((cx,0,.523))
 basis=o.shape_key_add(name='Basis');closed=o.shape_key_add(name='chiusura')
 for v in closed.data:
  v.co.x*=.005;v.co.y=-.15+(v.co.y+.15)*.02;v.co.z=-.245+v.co.z*.005
 pupils.append(o)
 lid=bpy.data.objects['palpebra_'+side];lid.shape_key_add(name='Basis');closed=lid.shape_key_add(name='chiusura');openkey=lid.shape_key_add(name='apertura')
 # Arc inversion keeps end positions and cross section; it closes down over the collapsed pupil.
 center=sum(v.co.x for v in lid.data.vertices)/len(lid.data.vertices)
 for base,a,b in zip(lid.data.vertices,closed.data,openkey.data):
  q=max(0,1-((base.co.x-center)/.70)**2)
  a.co.z-=.49*q;b.co.z+=.14*q
 lids.append(lid)
smile=bpy.data.objects['sorriso'];smile.shape_key_add(name='Basis');sk=smile.shape_key_add(name='sorriso_ampio')
for v in sk.data:
 v.co.x=.071+(v.co.x-.071)*1.15;v.co.z+=.10*((v.co.x-.071)/.66)**2-.025
root['guida']='Sguardo: traslazione x/z dei due sguardo_*; chiusura: shape key 0..1 di palpebre e pupille; sorriso: sorriso_ampio.'
head['guida']='Rotazione per inseguimento cursore. Coordinate Blender: fronte -Y, alto +Z; glTF: fronte +Z, alto +Y.'
# Independent, reusable clips in aligned NLA tracks. Demo plays them sequentially.
clips=[('sguardo',1,72),('battito',73,86),('occhiolino',87,114),('sorriso',115,154),('sonno',155,202),('respiro_sonno',203,250),('risveglio',251,290)]
actors=[head]+[bpy.data.objects['sguardo_'+s] for s in ['sx','dx']]+[o.data.shape_keys for o in lids+pupils+[smile]]
def reset():
 head.rotation_euler=(0,0,0);head.location=(0,0,0)
 for s in ['sx','dx']:
  o=bpy.data.objects['sguardo_'+s];o.location.x=sum(v.co.x for v in bpy.data.objects['lente_'+s].data.vertices)/len(bpy.data.objects['lente_'+s].data.vertices);o.location.z=.523
 for o in lids+pupils+[smile]:
  for k in list(o.data.shape_keys.key_blocks)[1:]:k.value=0
for name,start,end in clips:
 reset()
 for a in actors:a.animation_data_clear()
 for f in range(start,end+1):
  t=(f-start)/(end-start);blink=wink=sleep=wide=sm=0;gx=gz=rx=ry=rz=0
  if name=='sguardo':gx=.105*math.sin(t*math.tau);gz=.055*math.sin(t*math.tau*2);rx=.04*math.sin(t*math.tau*2);rz=.10*math.sin(t*math.tau)
  if name=='battito':blink=max(0,1-abs(t-.43)/.32)
  if name=='occhiolino':wink=math.sin(math.pi*t)**2;ry=-.045*wink;sm=.45*wink
  if name=='sorriso':sm=math.sin(math.pi*t)**1.5;wide=.35*sm
  if name=='sonno':sleep=t*t*(3-2*t);rx=.10*sleep;ry=.055*sleep
  if name=='respiro_sonno':sleep=1;rx=.10+.012*math.sin(t*math.tau);ry=.055
  if name=='risveglio':sleep=(1-min(1,t*2.2))**2;wide=.75*math.sin(math.pi*min(1,t*1.6));rx=.10*sleep;ry=.055*sleep
  head.rotation_euler=(rx,ry,rz);head.keyframe_insert('rotation_euler',frame=f)
  for side in ['sx','dx']:
   o=bpy.data.objects['sguardo_'+side];base=sum(v.co.x for v in bpy.data.objects['lente_'+side].data.vertices)/len(bpy.data.objects['lente_'+side].data.vertices);o.location=(base+gx,0,.523+gz);o.keyframe_insert('location',frame=f)
   close=max(blink,sleep,wink if side=='dx' else 0)
   for part in ['palpebra_','pupilla_']:
    keys=bpy.data.objects[part+side].data.shape_keys.key_blocks;keys['chiusura'].value=close;keys['chiusura'].keyframe_insert('value',frame=f)
    if part=='palpebra_':keys['apertura'].value=wide*(1-close);keys['apertura'].keyframe_insert('value',frame=f)
  sk.value=sm;sk.keyframe_insert('value',frame=f)
 for a in actors:
  action=a.animation_data.action;action.name=name+' · '+a.name;action.use_fake_user=True
  track=a.animation_data.nla_tracks.new();track.name=name;strip=track.strips.new(name,start,action);strip.name=name;strip.extrapolation='NOTHING';strip.blend_type='REPLACE'
  a.animation_data.action=None
 # Keep previous tracks while clearing only the active action next iteration.
 # Temporarily stash complete track specs, reconstructed once all actions are made.
# Rebuild all NLA tracks because the loop cleared active animation data between clips.
for a in actors:
 a.animation_data_clear();a.animation_data_create()
 for name,start,end in clips:
  action=bpy.data.actions.get(name+' · '+a.name)
  if action:
   tr=a.animation_data.nla_tracks.new();tr.name=name;st=tr.strips.new(name,start,action);st.extrapolation='NOTHING';st.blend_type='REPLACE'
reset();scene.frame_start=1;scene.frame_end=290;scene.render.fps=24
for name,start,end in clips:scene.timeline_markers.new(name,frame=start)
# Neutral studio, separate from the exportable logo.
studio=bpy.data.collections.new('02 · studio e illuminazione');scene.collection.children.link(studio)
def studio_obj(name,data,loc):
 o=bpy.data.objects.new(name,data);studio.objects.link(o);o.location=loc;return o
def aim(o,point=(0,0,0)):o.rotation_euler=(Vector(point)-o.location).to_track_quat('-Z','Y').to_euler()
cam=studio_obj('Camera · fronte',bpy.data.cameras.new('Camera'),(0,-8,0));aim(cam);cam.data.type='ORTHO';cam.data.ortho_scale=5.3;scene.camera=cam
for name,loc,power,size in [('Key',(-3,-4,5),450,4),('Fill',(4,-2,1),230,3),('Rim',(2,2,4),550,3)]:
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;o=studio_obj(name,d,loc);aim(o)
scene.world=bpy.data.worlds.new('studio · HDRI CC0');scene.world.use_nodes=True
nodes=scene.world.node_tree.nodes;links=scene.world.node_tree.links;env=nodes.new('ShaderNodeTexEnvironment');env.image=bpy.data.images.load(str(TEX/'studio_small_08_1k.hdr'));links.new(env.outputs['Color'],nodes.get('Background').inputs['Color']);nodes.get('Background').inputs['Strength'].default_value=.35
# Solid charcoal backdrop, invisible in GLB.
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,2,0),rotation=(math.pi/2,0,0));back=bpy.context.object;back.name='fondale · carbone'
for c0 in list(back.users_collection):c0.objects.unlink(back)
studio.objects.link(back);bm=bpy.data.materials.new('fondale #141414');bm.use_nodes=True;p=bm.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(.007,.007,.007,1);p.inputs['Roughness'].default_value=1;back.data.materials.append(bm)
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=1100;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.frame_set(1)
# Show camera composition when opening the file, with material preview available.
for screen in bpy.data.screens:
 for area in screen.areas:
  if area.type=='VIEW_3D':
   area.spaces.active.region_3d.view_perspective='CAMERA';area.spaces.active.shading.type='MATERIAL'
bpy.ops.object.select_all(action='DESELECT');head.select_set(True);bpy.context.view_layer.objects.active=head
for im in bpy.data.images:
 if im.source=='FILE' and im.filepath:im.pack()
readme=bpy.data.texts.new('LEGGIMI · logo animabile');readme.write('Logo di Alessandro Bottone — metallo grezzo opaco.\nSpazio: demo 1–290 (24 fps).\nNLA: sguardo, battito, occhiolino, sorriso, sonno, respiro_sonno, risveglio.\nLe shape key e i controlli sguardo_sx/dx sono pronti per il runtime web.\nMateriale PBR derivato da ambientCG Metal032 (CC0); HDRI Poly Haven Studio Small 08 (CC0).\nOriginale conservato separatamente. Script ricostruibile nella cartella scripts.\n')
bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'Logo3DAnimabile_MetalloGrezzo.blend'))
# Export only the model. All expression geometry is already baked and morph-safe.
bpy.ops.object.select_all(action='DESELECT')
for o in logo.objects:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(BASE/'Logo3DAnimabile_MetalloGrezzo.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_nla_strips=True,export_morph=True,export_morph_normal=True,export_yup=True,export_materials='EXPORT',export_extras=True)
scene.render.filepath=str(OUT/'logo-fronte.png');bpy.ops.render.render(write_still=True)
cam.location=(2,-8,1.2);aim(cam);scene.render.filepath=str(OUT/'logo-tre-quarti.png');bpy.ops.render.render(write_still=True)
# Automated mesh report.
report={'objects':{o.name:{'vertices':len(o.data.vertices),'polygons':len(o.data.polygons),'shape_keys':list(o.data.shape_keys.key_blocks.keys()) if o.data.shape_keys else []} for o in meshes},'clips':clips,'roughness_range':[float(r[:,:,:3].min()),float(r[:,:,:3].max())]}
(BASE/'verifica.json').write_text(json.dumps(report,indent=2))
print('LOGO_BUILD_COMPLETE')
