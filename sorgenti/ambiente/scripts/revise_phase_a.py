"""Apply review A once, through Blender console. No B textures/bake/export."""
import bpy, math, json
from pathlib import Path
from mathutils import Vector
OUT=Path(bpy.path.abspath('//')); s=bpy.context.scene
assert s.name=='Ambiente Brutalista | Fase A'
assert not s.get('revisione_A_applicata'), 'Revision already applied'
A=bpy.data.collections['ambiente']
def islands(o):
 adj=[set() for v in o.data.vertices]
 for e in o.data.edges:
  a,b=e.vertices; adj[a].add(b); adj[b].add(a)
 seen=set()
 for start in range(len(adj)):
  if start in seen: continue
  stack=[start]; ids=[]; seen.add(start)
  while stack:
   i=stack.pop();ids.append(i)
   for j in adj[i]:
    if j not in seen: seen.add(j);stack.append(j)
  ps=[o.matrix_world@o.data.vertices[i].co for i in ids]
  lo=Vector([min(p[k] for p in ps) for k in range(3)]);hi=Vector([max(p[k] for p in ps) for k in range(3)])
  yield ids,lo,hi

def reshape(o,ids,lo,hi,newlo,newhi):
 inv=o.matrix_world.inverted()
 for i in ids:
  p=o.matrix_world@o.data.vertices[i].co
  q=Vector([newlo[k]+(p[k]-lo[k])/(hi[k]-lo[k])*(newhi[k]-newlo[k]) for k in range(3)])
  o.data.vertices[i].co=inv@q

o=bpy.data.objects['spirale · A · cemento greybox']
blocks=[(ids,lo,hi) for ids,lo,hi in islands(o) if hi.x-lo.x>6 and abs(lo.y-9.8)<.1]
assert len(blocks)==8,len(blocks)
for j,(ids,lo,hi) in enumerate(sorted(blocks,key=lambda v:v[1].z)):
 side=-1 if j%2==0 else 1
 width=[4.4,5.2,3.8,4.8][j%4]; dep=[5,6.5,4.5,6][j%4]
 x0,x1=(21.5,21.5+width) if side<0 else (50.5-width,50.5)
 y0=2.3+(j%3)*.65
 reshape(o,ids,lo,hi,(x0,y0,lo.z),(x1,y0+dep,hi.z))
# Dedicated near-black concrete for the empty backing wall.
back=bpy.data.materials['A · pavimento scuro'].copy();back.name='A · fondo pozzo #141414';back.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.85
ob=bpy.data.objects['spirale · A · cemento in ombra']; ob.data.materials.append(back); idx=len(ob.data.materials)-1
for ids,lo,hi in islands(ob):
 if hi.x-lo.x>30 and lo.y>13 and hi.z-lo.z>50:
  ids=set(ids)
  for p in ob.data.polygons:
   if all(i in ids for i in p.vertices):p.material_index=idx
# Extend foreground floor to form a deliberate rim around the well.
f=bpy.data.objects['connessioni · A · pavimento scuro']
for ids,lo,hi in list(islands(f)):
 if hi.x-lo.x>140:reshape(f,ids,lo,hi,(lo.x,-42,lo.z),(hi.x,-6,hi.z))
# Side return galleries and closed walls. Joined by material below.
new=[]
def box(name,lo,hi,mat):
 vs=[(x,y,z) for x,y,z in [(lo[0],lo[1],lo[2]),(lo[0],lo[1],hi[2]),(lo[0],hi[1],lo[2]),(lo[0],hi[1],hi[2]),(hi[0],lo[1],lo[2]),(hi[0],lo[1],hi[2]),(hi[0],hi[1],lo[2]),(hi[0],hi[1],hi[2])]]
 me=bpy.data.meshes.new(name);me.from_pydata(vs,[],[(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)]);me.update()
 o=bpy.data.objects.new(name,me);A.objects.link(o);me.materials.append(mat);new.append(o);return o
shade=bpy.data.materials['A · cemento in ombra']
for x0,x1 in [(21.5,29.5),(42.5,50.5)]:
 box('spirale · ritorno passerella',(x0,1.5,-3.05),(x1,14,-2.55),shade)
 box('spirale · sostegno pozzo',(x0,-1.5,-22),(x1,14,-3.05),shade)
for x0,x1 in [(20.5,21.5),(50.5,51.5)]:
 box('spirale · parete continua',(x0,-18,-22),(x1,-2,32),shade)
 box('spirale · architrave passaggio',(x0,-2,2),(x1,2,32),shade)
 box('spirale · basamento passaggio',(x0,-2,-22),(x1,2,-3.05),shade)
# Well base reaches the surrounding walls; front rim hides any exposed model edge.
f=bpy.data.objects['spirale · A · pavimento scuro']
for ids,lo,hi in list(islands(f)):reshape(f,ids,lo,hi,(19.5,-40,lo.z),(52.5,15,hi.z))
# Consolidate new walls into the existing dark spiral object.
bpy.ops.object.select_all(action='DESELECT')
for o in new+[ob]:o.select_set(True)
bpy.context.view_layer.objects.active=ob;bpy.ops.object.join()
# Smooth, acromatic darkening of the arch surfaces toward the upper right.
h=bpy.data.objects['header · A · cemento greybox'];m=h.data.materials[0].copy();m.name='A · archi ombra alto destra';h.data.materials[0]=m
n=m.node_tree.nodes;l=m.node_tree.links;bs=n.get('Principled BSDF');base=tuple(bs.inputs['Base Color'].default_value)
g=n.new('ShaderNodeNewGeometry');sep=n.new('ShaderNodeSeparateXYZ');l.new(g.outputs['Position'],sep.inputs[0])
def ramp(socket,a,b):
 r=n.new('ShaderNodeMapRange');r.clamp=True;r.interpolation_type='SMOOTHERSTEP';r.inputs['From Min'].default_value=a;r.inputs['From Max'].default_value=b;l.new(socket,r.inputs['Value']);return r.outputs['Result']
x=ramp(sep.outputs['X'],-1,4);z=ramp(sep.outputs['Z'],.8,3.3)
mul=n.new('ShaderNodeMath');mul.operation='MULTIPLY';l.new(x,mul.inputs[0]);l.new(z,mul.inputs[1])
mix=n.new('ShaderNodeMixRGB');mix.blend_type='MIX';mix.inputs[1].default_value=base;mix.inputs[2].default_value=(.007,.007,.007,1);l.new(mul.outputs[0],mix.inputs[0]);l.new(mix.outputs[0],bs.inputs['Base Color'])
# Beam 03 now falls on the face from above; 04 grazes the side blocks.
for name,target in [('luce_03',(36,0,0)),('apertura_03',(36,0,0)),('luce_04',(48,6,-16)),('apertura_04',(48,6,-16))]:
 o=bpy.data.objects[name];o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
bpy.data.objects['apertura_03'].data.spread=math.radians(16)
bpy.data.objects['apertura_04'].data.spread=math.radians(25)
s.render.engine=next(x.identifier for x in s.render.bl_rna.properties['engine'].enum_items if 'EEVEE' in x.identifier)
s['revisione_A_applicata']='29 settembre 2026; blocchi laterali, fondo libero, raccordi pozzo, header in ombra, mobile responsive'
bpy.context.view_layer.update()
exec((OUT/'scripts/preview_greybox.py').read_text())
