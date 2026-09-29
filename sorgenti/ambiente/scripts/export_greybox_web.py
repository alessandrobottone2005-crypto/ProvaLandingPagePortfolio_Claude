"""Esporta la collection «ambiente» della greybox per la prova nel sito, senza salvare il .blend.

Uso: Blender -b Ambiente_Brutalista.blend --python scripts/export_greybox_web.py
Scrive ambiente-greybox.glb (non compressa) e ambiente-greybox.json accanto al .blend.
"""
import bpy, os, json
from mathutils import Vector
base=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
scena=bpy.context.scene
scena.frame_set(1)
ambiente=bpy.data.collections['ambiente']
bpy.ops.object.select_all(action='DESELECT')
oggetti=[o for o in ambiente.all_objects if o.type=='MESH']
for o in oggetti:
 o.hide_viewport=False
 o.hide_set(False)
 o.select_set(True)
bpy.context.view_layer.objects.active=oggetti[0]
bpy.ops.export_scene.gltf(filepath=os.path.join(base,'ambiente-greybox.glb'),export_format='GLB',use_selection=True,
 export_apply=True,export_materials='EXPORT',export_cameras=False,export_lights=False,export_animations=False,export_yup=True)

def tre(v): return [round(x,4) for x in v]
stazioni={}
for nome in ['header','spirale','biografia','contatti']:
 e=bpy.data.objects['stazione_'+nome]
 stazioni[nome]={'posizione':tre(e.matrix_world.translation),'rotazione_z':round(e.matrix_world.to_euler().z,5)}
soli=[]
for o in scena.objects:
 if o.type=='LIGHT' and o.data.type=='SUN':
  soli.append({'nome':o.name,'direzione':tre((o.matrix_world.to_3x3()@Vector((0,0,-1))).normalized()),
   'energia':round(o.data.energy,4),'colore':tre(o.data.color),'angolo':round(o.data.angle,5),'visibile':not o.hide_render})
# Le Area nelle aperture illuminano davvero la greybox (il sole è quasi spento); i «riflesso» sono solo ausili.
aperture=[]
for o in scena.objects:
 if o.type=='LIGHT' and o.data.type=='AREA' and o.name.startswith('apertura'):
  aperture.append({'nome':o.name,'posizione':tre(o.matrix_world.translation),
   'direzione':tre((o.matrix_world.to_3x3()@Vector((0,0,-1))).normalized()),
   'potenza':round(o.data.energy,2),'colore':tre(o.data.color),'dimensioni':[round(o.data.size,3),round(o.data.size_y,3)]})
lame=[]
for o in scena.objects:
 if o.name.startswith('luce_'):
  lame.append({'nome':o.name,'posizione':tre(o.matrix_world.translation),
   'direzione':tre((o.matrix_world.to_3x3()@Vector((0,0,-1))).normalized()),
   **{k:o[k] for k in ('larghezza','lunghezza','intensita') if k in o}})
triangoli=sum(len(p.vertices)-2 for o in oggetti for p in o.data.polygons)
dati={'coordinate':'blender (x,y,z); nel sito (x,z,-y)','stazioni':stazioni,'sole':soli,'aperture':sorted(aperture,key=lambda a:a['nome']),'esposizione':round(scena.view_settings.exposure,3),'lame':sorted(lame,key=lambda l:l['nome']),
 'oggetti':len(oggetti),'triangoli_prima_dei_modificatori':triangoli}
with open(os.path.join(base,'ambiente-greybox.json'),'w') as f: json.dump(dati,f,indent=2)
print('esportati',len(oggetti),'oggetti; soli',len(soli))
