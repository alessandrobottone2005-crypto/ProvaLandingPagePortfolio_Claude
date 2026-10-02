# esporta le statuette di cuphead e mugman per il sito (blocco modello3d), senza mai salvare il .blend:
#   /Applications/Blender.app/Contents/MacOS/Blender -b "sorgenti/progetti/cuphead-mugman-art-toys/Cuphead&Mugman.blend" \
#     --python scripts/blender/esporta-cuphead.py -- <uscita.glb> [rapporto decimate, 0.32]
# - tiene solo la collezione «Statue» (il tavolo da poker resta nel file originale);
# - i colori nel .blend sono una miscela (nodo mix) tra la texture plastica e un colore: l’esportatore gltf
#   non la legge, quindi resta il colore scelto (bianco latte, rosso, blu: la texture lo scuriva, in cycles lo
#   compensavano le luci); il nero tiene la sua texture; la ruvidità (glossiness invertita) diventa il suo
#   valore medio; la normal map della plastica resta;
# - riduce i triangoli con un decimate (≈ 1,25 milioni → ≈ 400 mila) e gira le statuette verso lo spettatore
#   come le inquadra la camera del render, mantenendo la loro composizione.
import sys
import bpy
import numpy as np

argomenti = sys.argv[sys.argv.index('--') + 1:]
uscita = argomenti[0]
rapporto = float(argomenti[1]) if len(argomenti) > 1 else 0.32

statue = [o for o in bpy.data.collections['Statue'].all_objects if o.type == 'MESH']
for o in list(bpy.data.objects):
    if o not in statue:
        bpy.data.objects.remove(o, do_unlink=True)

def media(immagine, canali=3):
    px = np.array(immagine.pixels[:], dtype=np.float32).reshape(-1, 4)[:, :canali]
    return px.mean(axis=0)

def collegato(ingresso):
    return ingresso.links[0].from_node if ingresso.is_linked else None

for materiale in {s.material for o in statue for s in o.material_slots if s.material}:
    albero = materiale.node_tree
    bsdf = next(n for n in albero.nodes if n.type == 'BSDF_PRINCIPLED')
    colore = collegato(bsdf.inputs['Base Color'])
    if colore and colore.type == 'MIX':
        pieno = np.array(colore.inputs['B'].default_value[:3])
        for l in list(bsdf.inputs['Base Color'].links):
            albero.links.remove(l)
        bsdf.inputs['Base Color'].default_value = (*pieno.tolist(), 1)
        print(f'{materiale.name}: colore pieno {np.round(pieno, 3)}')
    ruvido = collegato(bsdf.inputs['Roughness'])
    if ruvido and ruvido.type == 'INVERT':
        lucido = collegato(ruvido.inputs['Color'])
        valore = 1 - float(media(lucido.image, 1)[0]) if lucido and lucido.image else 0.5
        for l in list(bsdf.inputs['Roughness'].links):
            albero.links.remove(l)
        bsdf.inputs['Roughness'].default_value = valore
        print(f'{materiale.name}: ruvidità {valore:.2f}')

# girate verso lo spettatore: la direzione verso la camera del render diventa il davanti della scena web (+y in blender, verso la camera del blocco)
import math
from mathutils import Matrix, Vector
camera = bpy.data.objects.get('Camera')
verso = Vector((0, -1, 0))
if camera:
    sguardo = camera.matrix_world.to_3x3() @ Vector((0, 0, -1))
    verso = Vector((-sguardo.x, -sguardo.y, 0)).normalized()
delta = math.pi / 2 - math.atan2(verso.y, verso.x)
centro = sum((o.location for o in statue), Vector()) / len(statue)
giro = Matrix.Rotation(delta, 4, 'Z')
for o in statue:
    o.location = centro + giro @ (o.location - centro)
    o.rotation_euler.z += delta
    o.animation_data_clear()  # LinguaAction è vuota: nessuna animazione da esportare
    d = o.modifiers.new('web', 'DECIMATE')
    d.ratio = rapporto
bpy.context.view_layer.update()
punti = [o.matrix_world @ Vector(c) for o in statue for c in o.bound_box]
spostamento = Vector((-(min(p.x for p in punti) + max(p.x for p in punti)) / 2,
                      -(min(p.y for p in punti) + max(p.y for p in punti)) / 2,
                      -min(p.z for p in punti)))
for o in statue:
    o.location += spostamento

dg = bpy.context.evaluated_depsgraph_get()
totale = 0
for o in statue:
    m = o.evaluated_get(dg).to_mesh()
    m.calc_loop_triangles()
    totale += len(m.loop_triangles)
    o.evaluated_get(dg).to_mesh_clear()
print(f'triangoli dopo il decimate: {totale}')

bpy.ops.export_scene.gltf(
    filepath=uscita,
    export_format='GLB',
    export_apply=True,
    export_animations=False,
    export_cameras=False,
    export_lights=False,
    export_yup=True,
)
print('esportato', uscita)
# nessun salvataggio: il .blend originale resta intatto
