import bpy,bmesh,math,json
from pathlib import Path
BASE=Path(__file__).resolve().parents[1];scene=bpy.context.scene
# Reload modified map files before packing: replace earlier packed bytes.
for name in ['MetalloGrezzo_BaseColor','MetalloGrezzo_Roughness','MetalloGrezzo_NormalGL']:
 im=bpy.data.images[name]
 if im.packed_file:im.unpack(method='REMOVE')
 im.filepath=str(BASE/'textures'/(name+'.png'));im.reload();im.pack()
# Maintain constant eyelid cross section while inverting the arc for closed eyes.
for side,cx in [('sx',-1.1199472),('dx',1.18058515)]:
 o=bpy.data.objects['palpebra_'+side];key=o.data.shape_keys.key_blocks['chiusura'];cz=-.1052863;radius=.8677
 for v,k in zip(o.data.vertices,key.data):
  x,z=v.co.x-cx,v.co.z-cz;r=math.hypot(x,z);t=math.atan2(x,z)
  k.co.x=cx+(2*radius-r)*math.sin(t);k.co.z=1.-cz+(r-2*radius)*math.cos(t)
# Correctly declare UV coordinates for predictable export, including legacy source UV layers.
mat=bpy.data.materials['metallo grezzo · argento opaco'];nodes=mat.node_tree.nodes;uv=nodes.new('ShaderNodeUVMap');uv.uv_map='Metal_UV';uv.location=(-950,100)
for n in nodes:
 if n.type=='TEX_IMAGE':mat.node_tree.links.new(uv.outputs['UV'],n.inputs['Vector'])
scene.frame_set(1);scene.camera.location=(0,-8,0);scene.camera.rotation_euler=(-scene.camera.location).to_track_quat('-Z','Y').to_euler()
# GPU rendering is local to this file/process; do not alter the user's preferences.
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='METAL';prefs.get_devices()
for d in prefs.devices:d.use=d.type=='METAL'
scene.cycles.device='GPU';scene.cycles.samples=48
scene.render.resolution_x=1100;scene.render.resolution_y=900
scene.render.resolution_percentage=100;scene.frame_start=1;scene.frame_end=290
# Save a clean initial view; original UI file remains untouched.
bpy.ops.object.select_all(action='DESELECT');o=bpy.data.objects['testa'];o.select_set(True);bpy.context.view_layer.objects.active=o
scene.render.filepath='//anteprime/logo-fronte.png'
bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'Logo3DAnimabile_MetalloGrezzo.blend'))
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.data.collections['01 · logo animabile'].objects:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(BASE/'Logo3DAnimabile_MetalloGrezzo.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_nla_strips=True,export_morph=True,export_morph_normal=True,export_yup=True,export_materials='EXPORT',export_extras=True)
report={'objects':{},'original_preserved':str(BASE/'Logo3DAnimabile_originale.blend'),'texture_sources':['https://ambientcg.com/a/Metal032','https://polyhaven.com/a/studio_small_08']}
for o in bpy.data.collections['01 · logo animabile'].objects:
 if o.type!='MESH':continue
 bm=bmesh.new();bm.from_mesh(o.data);report['objects'][o.name]={'vertices':len(bm.verts),'faces':len(bm.faces),'non_manifold_edges':sum(not e.is_manifold for e in bm.edges),'shape_keys':list(o.data.shape_keys.key_blocks.keys()) if o.data.shape_keys else []};bm.free()
report['expressions']={}
for f in [1,79,100,135,202,225,270,290]:
 scene.frame_set(f);report['expressions'][f]={o.name:{k.name:round(k.value,4) for k in list(o.data.shape_keys.key_blocks)[1:]} for o in bpy.data.collections['01 · logo animabile'].objects if o.type=='MESH' and o.data.shape_keys}
(BASE/'verifica.json').write_text(json.dumps(report,indent=2))
for label,loc,frame in [('logo-fronte',(0,-8,0),1),('logo-tre-quarti',(2.7,-8,1.4),1),('logo-sonno',(0,-8,0),215),('logo-occhiolino',(0,-8,0),100)]:
 scene.frame_set(frame);scene.camera.location=loc;scene.camera.rotation_euler=(-scene.camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(BASE/'anteprime'/(label+'.png'));bpy.ops.render.render(write_still=True)
# A compact 12-second preview: 12 fps, every second frame of the 24 fps master.
scene.camera.location=(.85,-8,.5);scene.camera.rotation_euler=(-scene.camera.location).to_track_quat('-Z','Y').to_euler()
scene.render.resolution_x=660;scene.render.resolution_y=540;scene.cycles.samples=12
folder=BASE/'anteprime/frames';folder.mkdir(exist_ok=True)
for i,f in enumerate(range(1,291,2),1):
 scene.frame_set(f);scene.render.filepath=str(folder/f'{i:04d}.png');bpy.ops.render.render(write_still=True)
print('FINAL_LOGO_COMPLETE')
