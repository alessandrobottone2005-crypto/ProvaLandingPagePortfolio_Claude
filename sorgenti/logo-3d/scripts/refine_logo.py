import bpy,bmesh,math,json
import numpy as np
from pathlib import Path
from mathutils import Vector
BASE=Path(__file__).resolve().parents[1];TEX=BASE/'textures';scene=bpy.context.scene
# A cast/sandblasted finish: broad irregular grain plus restrained scratches.
def arr(name):
 im=bpy.data.images.get(name);return im,np.array(im.pixels[:],np.float32).reshape(im.size[1],im.size[0],4)
def noise(n,size,rng):
 small=rng.random((n,n),dtype=np.float32);x=np.arange(size)*n/size;i=x.astype(int);f=x-i
 a=small[i[:,None]%n,i[None,:]%n];b=small[i[:,None]%n,(i[None,:]+1)%n];c=small[(i[:,None]+1)%n,i[None,:]%n];d=small[(i[:,None]+1)%n,(i[None,:]+1)%n]
 return (a*(1-f)[None,:]+b*f[None,:])*(1-f)[:,None]+(c*(1-f)[None,:]+d*f[None,:])*f[:,None]
def update(im,a):
 im.pixels.foreach_set(a.astype(np.float32).ravel());im.filepath_raw=str(TEX/(im.name+'.png'));im.file_format='PNG';im.save();im.pack()
rng=np.random.default_rng(311);size=2048
height=noise(230,size,rng)*.55+noise(580,size,rng)*.3+noise(45,size,rng)*.15
im,a=arr('MetalloGrezzo_Roughness');a[:,:,:3]=.82*(.52+.17*height)[:,:,None]+.18*np.array(bpy.data.images.load(str(TEX/'Metal032/Metal032_2K-JPG_Roughness.jpg'),check_existing=True).pixels[:],np.float32).reshape(size,size,4)[:,:,:3];update(im,a)
im,a=arr('MetalloGrezzo_BaseColor');v=.40+.12*(height-.5)+.028*(noise(18,size,rng)-.5);a[:,:,:3]=v[:,:,None]*np.array([1.025,1.,.969]);update(im,a)
im,a=arr('MetalloGrezzo_NormalGL');src=np.array(bpy.data.images.load(str(TEX/'Metal032/Metal032_2K-JPG_NormalGL.jpg'),check_existing=True).pixels[:],np.float32).reshape(size,size,4);x=(np.roll(height,1,1)-np.roll(height,-1,1))*.8+(src[:,:,0]*2-1)*.35;y=(np.roll(height,1,0)-np.roll(height,-1,0))*.8+(src[:,:,1]*2-1)*.35;z=np.ones_like(x);l=np.sqrt(x*x+y*y+z*z);a[:,:,0]=x/l*.5+.5;a[:,:,1]=y/l*.5+.5;a[:,:,2]=z/l*.5+.5;update(im,a)
# Reduce repetition density so the grain remains perceptible at hero scale.
for o in bpy.data.objects:
 if o.type=='MESH' and o.name!='fondale · carbone':
  uv=o.data.uv_layers.get('Metal_UV');uv.active_render=True;o.data.uv_layers.active=uv
  for p in o.data.polygons:
   axis=max(range(3),key=lambda i:abs(p.normal[i]))
   for li in p.loop_indices:
    c=o.data.vertices[o.data.loops[li].vertex_index].co
    x,z=(c.x,c.z) if axis==1 else (c.y,c.z) if axis==0 else (c.x,c.y);uv.data[li].uv=(x*.38,z*.38)
mat=bpy.data.materials['metallo grezzo · argento opaco'];mat.node_tree.nodes.get('Normal Map').inputs['Strength'].default_value=.55
# Replace the nose's concave subdivision pinch with a clean planar cap and bevel.
old=bpy.data.objects['naso'];parent=old.parent
with bpy.data.libraries.load(str(BASE/'Logo3DAnimabile_originale.blend'),link=False) as (src,dst):dst.objects=['Cube']
o=dst.objects[0];bpy.data.collections['01 · logo animabile'].objects.link(o)
m=o.matrix_basis.copy()
for v in o.data.vertices:v.co=m@v.co
o.location=(0,0,0);o.rotation_euler=(0,0,0);o.scale=(1,1,1)
bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.dissolve_limit(bm,angle_limit=.001,verts=list(bm.verts),edges=list(bm.edges));bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(o.data);bm.free()
bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
mod=o.modifiers.new('Bevel · profilo naso','BEVEL');mod.width=.03;mod.segments=4;mod.limit_method='ANGLE'
bpy.ops.object.modifier_apply(modifier=mod.name)
for p in o.data.polygons:p.use_smooth=True
mod=o.modifiers.new('Normali · facce piane','WEIGHTED_NORMAL');mod.keep_sharp=True;bpy.ops.object.modifier_apply(modifier=mod.name)
o.data.materials.clear();o.data.materials.append(mat);uv=o.data.uv_layers.new(name='Metal_UV');uv.active_render=True;o.data.uv_layers.active=uv
for p in o.data.polygons:
 axis=max(range(3),key=lambda i:abs(p.normal[i]))
 for li in p.loop_indices:
  c=o.data.vertices[o.data.loops[li].vertex_index].co
  x,z=(c.x,c.z) if axis==1 else (c.y,c.z) if axis==0 else (c.x,c.y);uv.data[li].uv=(x*.38,z*.38)
bpy.data.objects.remove(old,do_unlink=True);o.name='naso';o.parent=parent
o['finitura']='Bevel 4 segmenti e normali ponderate: mantiene piano il profilo concavo a L.'
# More directional illumination reveals the raw metal without mirror highlights.
bpy.data.lights['Key'].energy=260;bpy.data.lights['Key'].size=3
bpy.data.lights['Fill'].energy=75;bpy.data.lights['Rim'].energy=400
scene.world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.48
scene.cycles.samples=48
scene.frame_set(1);bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'Logo3DAnimabile_MetalloGrezzo.blend'))
for label,loc,frame in [('logo-fronte',(0,-8,0),1),('logo-tre-quarti',(2.7,-8,1.4),1),('logo-sonno',(0,-8,0),215),('logo-occhiolino',(0,-8,0),100)]:
 scene.frame_set(frame);scene.camera.location=loc;scene.camera.rotation_euler=(-scene.camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(BASE/'anteprime'/(label+'.png'));bpy.ops.render.render(write_still=True)
scene.frame_set(1)
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.data.collections['01 · logo animabile'].objects:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(BASE/'Logo3DAnimabile_MetalloGrezzo.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_nla_strips=True,export_morph=True,export_morph_normal=True,export_yup=True,export_materials='EXPORT',export_extras=True)
print('REFINEMENT_COMPLETE')
