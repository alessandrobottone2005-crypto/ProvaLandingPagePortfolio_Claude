"""
Sala di cemento realistica per il sito, a partire da sorgenti/sala/Ambiente.glb (che non si tocca).

    Blender -b --python sorgenti/sala/scripts/prepara_sala.py -- costruisci anteprime cuoci esporta

- costruisci: importa la sala, toglie il finto specchio, scala ×SCALA, pavimento nuovo, UV, materiali PBR CC0
              neutri, sole dalla fessura del soffitto → salva Sala_Realistica.blend
- anteprime:  render Cycles delle quattro stazioni (desktop) in anteprime/
- cuoci:      lightmap della luce diffusa (diretta + indiretta) per pareti e pavimento, ripulita dal rumore
- esporta:    Sala_Web.glb (geometria + PBR, UV0 = cemento ripetuto, UV1 = luce) e lightmap in export/

Coordinate Blender (z in alto); nel sito (x, z, −y).
"""
import json
import math
import os
import sys

import bpy
import bmesh
import numpy as np
from mathutils import Vector

QUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RADICE = os.path.dirname(os.path.dirname(QUI))
ORIGINALE = os.path.join(QUI, "Ambiente.glb")
BLEND = os.path.join(QUI, "Sala_Realistica.blend")
TEXTURE = os.path.join(QUI, "textures")
EXPORT = os.path.join(QUI, "export")
ANTEPRIME = os.path.join(QUI, "anteprime")
CC0 = os.path.join(RADICE, "sorgenti", "ambiente", "assets_online", "Modular Concrete Interior", "Assets", "Textures")

SCALA = 2.5  # la sala originale (20 × 29 × 9,4 m) diventa 50 × 72 × 23: il volto (≈ 2,4 u) è una scultura nella sala
RIPETIZIONE = {"pareti": 5.0, "pavimento": 7.0}  # metri coperti da una ripetizione della texture del cemento
# camera del sito: campo verticale 40°, distanza dal volto tale che il piano del volto resti identico (20·tan 9°)
CAMPO = 40.0
DISTANZA = 20 * math.tan(math.radians(9)) / math.tan(math.radians(CAMPO / 2))
# sole: quasi verticale, appena inclinato verso +x e verso il fondo (+y)
SOLE_X, SOLE_Y = 9.0, 14.0
LUCE_PARETI = 4096
LUCE_PAVIMENTO = 2048
CAMPIONI_CUOCI = 256

passi = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else ["costruisci"]
for cartella in (TEXTURE, EXPORT, ANTEPRIME):
    os.makedirs(cartella, exist_ok=True)


# ------------------------------------------------------------------ texture

def carica_np(percorso):
    img = bpy.data.images.load(percorso, check_existing=True)
    w, h = img.size
    px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)
    return img, px


def salva_np(px, nome, colore=True):
    h, w = px.shape[:2]
    img = bpy.data.images.new(nome, w, h, alpha=False, float_buffer=False)
    img.colorspace_settings.name = "sRGB" if colore else "Non-Color"
    img.pixels[:] = px.ravel()
    img.filepath_raw = os.path.join(TEXTURE, nome + ".png")
    img.file_format = "PNG"
    img.save()
    return img


def prepara_texture():
    """cemento neutro verso la palette del sito; pavimento con pozzanghere (rugosità bassa a chiazze)"""
    out = {}
    for tipo, cartella in (("pareti", "Wall/ConcreteWall"), ("pavimento", "Floor/ConcreteFloor")):
        ext = "png" if tipo == "pareti" else "jpg"
        _, col = carica_np(os.path.join(CC0, f"{cartella}_Color_2k.{ext}"))
        lum = col[..., :3] @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
        # quasi grigio: resta un filo del colore originale (8%)
        neutro = col.copy()
        for c in range(3):
            neutro[..., c] = lum + (col[..., c] - lum) * 0.08
        out[f"{tipo}_colore"] = salva_np(neutro, f"sala_{tipo}_colore")
        out[f"{tipo}_normale"] = bpy.data.images.load(os.path.join(CC0, f"{cartella}_Normal_2k.{ext}"), check_existing=True)
        out[f"{tipo}_normale"].colorspace_settings.name = "Non-Color"
        _, rug = carica_np(os.path.join(CC0, f"{cartella}_Roughness_2k.{ext}"))
        if tipo == "pavimento":
            h, w = rug.shape[:2]
            y, x = np.mgrid[0:h, 0:w].astype(np.float32) / w * 2 * math.pi
            # chiazze bagnate ripetibili (somma di seni, periodiche sul bordo della texture)
            m = (np.sin(x * 2 + 1.3) * np.sin(y * 3 + 0.4) + 0.6 * np.sin(x * 5 + y * 2) + 0.4 * np.sin(y * 7 - x * 3)) / 2.0
            bagnato = np.clip((m - 0.05) * 3.0, 0, 1)[..., None]
            rug[..., :3] = rug[..., :3] * (1 - bagnato) * 0.75 + 0.06 * bagnato
        out[f"{tipo}_rugosita"] = salva_np(rug, f"sala_{tipo}_rugosita", colore=False)
    return out


# ------------------------------------------------------------------ geometria

def uv_ripetuto(obj, nome, metri):
    """proiezione a cubo in metri: il cemento ha la stessa grana su ogni superficie"""
    me = obj.data
    uv = me.uv_layers.get(nome) or me.uv_layers.new(name=nome)
    bm = bmesh.new()
    bm.from_mesh(me)
    livello = bm.loops.layers.uv[nome]
    mw = obj.matrix_world
    for f in bm.faces:
        n = (mw.to_3x3() @ f.normal).normalized()
        a = max(range(3), key=lambda i: abs(n[i]))
        for l in f.loops:
            p = mw @ l.vert.co
            u, v = [(p.y, p.z), (p.x, p.z), (p.x, p.y)][a]
            l[livello].uv = (u / metri, v / metri)
    bm.to_mesh(me)
    bm.free()
    return uv


def uv_luce(obj, nome):
    me = obj.data
    uv = me.uv_layers.get(nome) or me.uv_layers.new(name=nome)
    me.uv_layers.active = uv
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.004, area_weight=1.0, scale_to_bounds=True)
    bpy.ops.object.mode_set(mode="OBJECT")


def materiale(nome, colore, normale, rugosita, forza_normale=1.0):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    uvn = nt.nodes.new("ShaderNodeUVMap")
    uvn.uv_map = "cemento"

    def tex(img):
        t = nt.nodes.new("ShaderNodeTexImage")
        t.image = img
        nt.links.new(uvn.outputs["UV"], t.inputs["Vector"])
        return t

    nt.links.new(tex(colore).outputs["Color"], bsdf.inputs["Base Color"])
    sep = nt.nodes.new("ShaderNodeSeparateColor")
    nt.links.new(tex(rugosita).outputs["Color"], sep.inputs["Color"])
    nt.links.new(sep.outputs["Red"], bsdf.inputs["Roughness"])
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nm.uv_map = "cemento"
    nm.inputs["Strength"].default_value = forza_normale
    nt.links.new(tex(normale).outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], bsdf.inputs["Normal"])
    return m


def centro_fascio(sole_obj, mn, mx):
    """punto del pavimento colpito dalla luce che passa dal centro della fessura, a metà sala"""
    direzione = sole_obj.rotation_euler.to_matrix() @ Vector((0, 0, -1))
    alto = Vector((0, (mn.y + mx.y) / 2, mx.z))
    t = -alto.z / direzione.z
    return Vector((alto.x + direzione.x * t, alto.y + direzione.y * t, 0))


def costruisci():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=ORIGINALE)
    # il finto specchio: piano trasparente e sala capovolta sotto
    for nome in ("Object_6", "Object_8"):
        bpy.data.objects.remove(bpy.data.objects[nome], do_unlink=True)
    sala = bpy.data.objects["Object_4"]
    bpy.ops.object.select_all(action="DESELECT")
    sala.select_set(True)
    bpy.context.view_layer.objects.active = sala
    bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
    for o in list(bpy.data.objects):
        if o.type == "EMPTY":
            bpy.data.objects.remove(o, do_unlink=True)
    sala.name = sala.data.name = "sala"
    sala.scale *= SCALA
    sala.location *= SCALA
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    for uv in list(sala.data.uv_layers):
        sala.data.uv_layers.remove(uv)

    mn = Vector([min((v.co)[i] for v in sala.data.vertices) for i in range(3)])
    mx = Vector([max((v.co)[i] for v in sala.data.vertices) for i in range(3)])
    bpy.ops.mesh.primitive_plane_add(size=1)
    pav = bpy.context.active_object
    pav.name = pav.data.name = "pavimento"
    pav.scale = (mx.x - mn.x, mx.y - mn.y, 1)
    pav.location = ((mx.x + mn.x) / 2, (mx.y + mn.y) / 2, 0)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    for uv in list(pav.data.uv_layers):
        pav.data.uv_layers.remove(uv)
    # suddiviso: i riflessi e la luce cotta hanno vertici a sufficienza
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.subdivide(number_cuts=15)
    bpy.ops.object.mode_set(mode="OBJECT")

    for o, tipo in ((sala, "pareti"), (pav, "pavimento")):
        uv_ripetuto(o, "cemento", RIPETIZIONE[tipo])
        uv_luce(o, "luce")
        o.data.uv_layers.active = o.data.uv_layers["cemento"]
        o.data.uv_layers["cemento"].active_render = True
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.shade_flat()

    t = prepara_texture()
    sala.data.materials.clear()
    sala.data.materials.append(materiale("cemento_pareti", t["pareti_colore"], t["pareti_normale"], t["pareti_rugosita"]))
    pav.data.materials.append(materiale("cemento_pavimento", t["pavimento_colore"], t["pavimento_normale"], t["pavimento_rugosita"], 0.6))

    # sole stretto dalla fessura (x ±1,48 × SCALA), inclinato verso il fondo della sala
    sole = bpy.data.lights.new("sole", "SUN")
    sole.energy = 5.5
    sole.angle = math.radians(0.6)
    sole.color = (1.0, 0.97, 0.93)
    so = bpy.data.objects.new("sole", sole)
    so.rotation_euler = (math.radians(SOLE_Y), math.radians(-SOLE_X), 0)
    bpy.context.scene.collection.objects.link(so)

    sc = bpy.context.scene
    w = bpy.data.worlds.new("cielo")
    sc.world = w
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.78, 0.78, 0.8, 1)
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.2
    sc.render.engine = "CYCLES"
    sc.cycles.device = "GPU"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.refresh_devices()
    for d in prefs.devices:
        d.use = True
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.exposure = 0.0
    sc.cycles.max_bounces = 8
    sc.cycles.diffuse_bounces = 6

    # segnaposto del computer (scala ×4 del sito ≈ 3,1 m) al centro della sala, nel fascio della fessura
    centro = centro_fascio(so, mn, mx)
    bpy.ops.mesh.primitive_cube_add(size=1, location=centro + Vector((0, 0, 1.55)))
    seg = bpy.context.active_object
    seg.name = "segnaposto_computer"
    seg.scale = (2.4, 3.9, 3.1)
    seg.hide_render = True

    stazioni(mn, mx, centro)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND)
    print("COSTRUITA", tuple(round(v, 2) for v in mn), tuple(round(v, 2) for v in mx))


# ------------------------------------------------------------------ stazioni (punto del volto e occhio della camera)

def stazioni(mn, mx, computer):
    d = DISTANZA
    dati = {
        # header: verso il fondo illuminato, il volto a metà sala
        "header": {"punto": (0, mx.y - 12, 9.0), "occhio": (0, mx.y - 12 - d, 9.0)},
        "computer": {"punto": tuple(computer), "occhio": None},
        # biografia: guarda la parete sinistra in ombra, il volto a sinistra e il testo sul buio
        "biografia": {"punto": (mn.x + 12, mn.y + 20, 8.0), "occhio": (mn.x + 12 + d, mn.y + 20, 8.0)},
        # contatti: dall'inizio della sala verso tutta la sua lunghezza
        "contatti": {"punto": (0, mn.y + 14, 9.5), "occhio": (0, mn.y + 14 - d, 9.5)},
        "sala": {"min": tuple(mn), "max": tuple(mx)},
        "campo": CAMPO,
        "distanza": d,
        "sole": [SOLE_X, SOLE_Y],
        # soffitto interno e mezza larghezza della fessura (misure della sala originale × SCALA)
        "soffitto": 8.96 * SCALA,
        "fessura": 1.48 * SCALA,
    }
    percorso = os.path.join(EXPORT, "stazioni.json")
    if os.path.exists(percorso):
        with open(percorso) as f:
            vecchio = json.load(f)
        if "fattoreLuce" in vecchio:
            dati["fattoreLuce"] = vecchio["fattoreLuce"]
    with open(percorso, "w") as f:
        json.dump({k: ({kk: (list(vv) if vv else None) for kk, vv in v.items()} if isinstance(v, dict) else v) for k, v in dati.items()}, f, indent=2)
    return dati


def solo_stazioni():
    """riscrive stazioni.json dalla scena salvata, senza ricostruire né ricuocere"""
    apri()
    sala = bpy.data.objects["sala"]
    mn = Vector([min(v.co[i] for v in sala.data.vertices) for i in range(3)])
    mx = Vector([max(v.co[i] for v in sala.data.vertices) for i in range(3)])
    seg = bpy.data.objects["segnaposto_computer"].location
    stazioni(mn, mx, Vector((seg.x, seg.y, 0)))


def apri():
    if bpy.data.filepath != BLEND:
        bpy.ops.wm.open_mainfile(filepath=BLEND)


# ------------------------------------------------------------------ anteprime

def anteprime():
    apri()
    sc = bpy.context.scene
    with open(os.path.join(EXPORT, "stazioni.json")) as f:
        st = json.load(f)
    sc.cycles.samples = 96
    sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = 1440, 900
    sc.render.resolution_percentage = 50
    seg = bpy.data.objects["segnaposto_computer"]
    seg.hide_render = False
    viste = {
        "header": (st["header"]["occhio"], st["header"]["punto"]),
        "computer_alto": (Vector(st["computer"]["punto"]) + Vector((0, -14, 12)), st["computer"]["punto"]),
        "computer_vicino": (Vector(st["computer"]["punto"]) + Vector((0, -7, 2.4)), Vector(st["computer"]["punto"]) + Vector((0, 0, 2.1))),
        "biografia": (st["biografia"]["occhio"], st["biografia"]["punto"]),
        "contatti": (st["contatti"]["occhio"], st["contatti"]["punto"]),
    }
    for nome, (occhio, punto) in viste.items():
        cam = bpy.data.cameras.new(nome)
        cam.lens_unit = "FOV"
        cam.angle_y = math.radians(CAMPO)
        cam.sensor_fit = "VERTICAL"
        o = bpy.data.objects.new(nome, cam)
        sc.collection.objects.link(o)
        o.location = occhio
        o.rotation_euler = (Vector(punto) - Vector(occhio)).to_track_quat("-Z", "Y").to_euler()
        sc.camera = o
        sc.render.filepath = os.path.join(ANTEPRIME, f"{nome}.png")
        bpy.ops.render.render(write_still=True)
    seg.hide_render = True


# ------------------------------------------------------------------ cottura della luce

def denoise(img):
    """OIDN del compositore sull'immagine cotta (la cottura non ripulisce da sola)"""
    sc = bpy.context.scene
    motore = sc.render.engine
    sc.render.engine = "BLENDER_WORKBENCH"
    sc.render.resolution_x, sc.render.resolution_y = img.size
    sc.render.resolution_percentage = 100
    sc.use_nodes = True
    albero = sc.compositing_node_group if hasattr(sc, "compositing_node_group") else sc.node_tree
    if albero is None:
        albero = bpy.data.node_groups.new("denoise", "CompositorNodeTree")
        sc.compositing_node_group = albero
    albero.nodes.clear()
    ni = albero.nodes.new("CompositorNodeImage")
    ni.image = img
    dn = albero.nodes.new("CompositorNodeDenoise")
    if hasattr(albero, "interface") and not any(s.in_out == "OUTPUT" for s in albero.interface.items_tree):
        albero.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    uscita = albero.nodes.new("NodeGroupOutput") if hasattr(albero, "interface") else albero.nodes.new("CompositorNodeComposite")
    albero.links.new(ni.outputs["Image"], dn.inputs["Image"])
    albero.links.new(dn.outputs[0], uscita.inputs[0])
    sc.render.image_settings.file_format = "OPEN_EXR"
    sc.render.image_settings.color_depth = "32"
    destinazione = img.filepath_raw.replace(".exr", "_pulita.exr")
    sc.render.filepath = destinazione
    for o in sc.objects:
        o.hide_render = True
    bpy.ops.render.render(write_still=True)
    for o in sc.objects:
        o.hide_render = o.name == "segnaposto_computer"
    sc.render.engine = motore
    return destinazione


def cuoci():
    apri()
    sc = bpy.context.scene
    sc.cycles.samples = CAMPIONI_CUOCI
    sc.render.bake.use_pass_direct = True
    sc.render.bake.use_pass_indirect = True
    sc.render.bake.use_pass_color = False
    sc.render.bake.margin = 6
    risultati = {}
    for nome, lato in (("sala", LUCE_PARETI), ("pavimento", LUCE_PAVIMENTO)):
        o = bpy.data.objects[nome]
        img = bpy.data.images.new(f"luce_{nome}", lato, lato, float_buffer=True, alpha=False)
        img.filepath_raw = os.path.join(EXPORT, f"luce_{nome}.exr")
        img.file_format = "OPEN_EXR"
        m = o.data.materials[0]
        nodo = m.node_tree.nodes.new("ShaderNodeTexImage")
        nodo.image = img
        uvn = m.node_tree.nodes.new("ShaderNodeUVMap")
        uvn.uv_map = "luce"
        m.node_tree.links.new(uvn.outputs["UV"], nodo.inputs["Vector"])
        m.node_tree.nodes.active = nodo
        o.data.uv_layers.active = o.data.uv_layers["luce"]
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.bake(type="DIFFUSE")
        img.save()
        o.data.uv_layers.active = o.data.uv_layers["cemento"]
        m.node_tree.nodes.remove(nodo)
        m.node_tree.nodes.remove(uvn)
        risultati[nome] = denoise(img)
        print("CUOCI", nome, risultati[nome])
    bpy.ops.wm.save_mainfile()
    return risultati


# ------------------------------------------------------------------ esportazione

def codifica_luce():
    """lightmap HDR → PNG 8 bit in curva sRGB, divisa per un fattore comune (scritto in stazioni.json):
    nel sito la texture si legge in sRGB e si moltiplica per lo stesso fattore"""
    fattore = 0.0
    dati = {}
    for nome in ("sala", "pavimento"):
        _, px = carica_np(os.path.join(EXPORT, f"luce_{nome}_pulita.exr"))
        dati[nome] = px
        fattore = max(fattore, float(np.percentile(px[..., :3], 99.9)))
    for nome, px in dati.items():
        lin = np.clip(px[..., :3] / fattore, 0, 1)
        srgb = np.where(lin <= 0.0031308, lin * 12.92, 1.055 * np.power(lin, 1 / 2.4) - 0.055)
        out = np.ones_like(px)
        out[..., :3] = srgb
        img = bpy.data.images.new(f"luce_{nome}_web", px.shape[1], px.shape[0], alpha=False)
        img.colorspace_settings.name = "Non-Color"
        img.pixels[:] = out.ravel()
        img.filepath_raw = os.path.join(EXPORT, f"luce_{nome}.png")
        img.file_format = "PNG"
        img.save()
    percorso = os.path.join(EXPORT, "stazioni.json")
    with open(percorso) as f:
        st = json.load(f)
    st["fattoreLuce"] = fattore
    with open(percorso, "w") as f:
        json.dump(st, f, indent=2)
    print("LUCE fattore", fattore)


def esporta():
    apri()
    codifica_luce()
    bpy.ops.object.select_all(action="DESELECT")
    for nome in ("sala", "pavimento"):
        o = bpy.data.objects[nome]
        o.select_set(True)
        # UV0 = cemento ripetuto, UV1 = luce cotta; via le UV predefinite del piano
        uv = o.data.uv_layers
        for extra in [u for u in uv if u.name not in ("cemento", "luce")]:
            uv.remove(extra)
        if uv[0].name != "cemento":
            raise RuntimeError("il primo livello UV deve essere «cemento»")
    bpy.ops.export_scene.gltf(
        filepath=os.path.join(EXPORT, "Sala_Web.glb"),
        use_selection=True,
        export_format="GLB",
        export_texcoords=True,
        export_normals=True,
        export_tangents=False,
        export_lights=False,
        export_cameras=False,
        export_apply=True,
        export_image_format="AUTO",
    )
    print("ESPORTATA")


for passo in passi:
    {"costruisci": costruisci, "stazioni": solo_stazioni, "anteprime": anteprime, "cuoci": cuoci, "esporta": esporta}[passo]()
