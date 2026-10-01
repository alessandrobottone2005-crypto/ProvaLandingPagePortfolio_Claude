import bpy,math
from pathlib import Path
from mathutils import Vector
OUT=Path(bpy.path.abspath('//'));s=bpy.context.scene
# Recess the central gallery floor to the well bottom: full-height helix remains visible.
f=bpy.data.objects['connessioni · A · pavimento scuro'];mat=f.data.materials[0]
vs=[];fs=[]
for lo,hi in [((-17,-42,-4.3),(20.5,-18,-3.7)),((20.5,-42,-19),(51.5,-6,-18)),((51.5,-42,-4.3),(125,-18,-3.7))]:
 offset=len(vs)
 vs.extend([(x,y,z) for x,y,z in [(lo[0],lo[1],lo[2]),(lo[0],lo[1],hi[2]),(lo[0],hi[1],lo[2]),(lo[0],hi[1],hi[2]),(hi[0],lo[1],lo[2]),(hi[0],lo[1],hi[2]),(hi[0],hi[1],lo[2]),(hi[0],hi[1],hi[2])]])
 fs.extend([tuple(offset+i for i in face) for face in [(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)]])
me=bpy.data.meshes.new('galleria · pavimento raccordato al pozzo');me.from_pydata(vs,[],fs);me.update();me.materials.append(mat);f.data=me
fill=bpy.data.objects['riflesso apertura · spirale'];fill.location=(35,-4,3.5);fill.rotation_euler=(Vector((36,0,0))-fill.location).to_track_quat('-Z','Y').to_euler();fill.data.energy=850;fill.data.size=3;fill.data.size_y=4
exec((OUT/'scripts/preview_greybox.py').read_text())
