"""Estrae il logo dalla V2 senza salvare o modificare il .blend originale."""
import bpy, os, json
from mathutils import Vector
base=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.context.scene.frame_set(1)
root=bpy.data.objects['logo_root']
bpy.ops.object.select_all(action='DESELECT')
for o in [root, *root.children_recursive]:
 o.select_set(True)
 o.animation_data_clear()
 if o.type=='MESH' and o.data.shape_keys:
  o.data.shape_keys.animation_data_clear()
  for k in o.data.shape_keys.key_blocks: k.value=0
root.rotation_euler=(0,0,0)
bpy.context.view_layer.objects.active=root
bpy.ops.export_scene.gltf(filepath=os.path.join(base,'Logo3DAnimabile_V2_Web.glb'),export_format='GLB',use_selection=True,export_animations=False,export_morph=True,export_image_format='AUTO')
