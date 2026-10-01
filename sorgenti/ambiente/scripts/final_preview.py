import bpy, math
from pathlib import Path
OUT=Path('/Volumes/SSD_ALE/Portfolio2026/Projects/ProvaLandingPagePortfolio_Claude/sorgenti/ambiente')
bpy.ops.wm.open_mainfile(filepath=str(OUT/'Ambiente_Brutalista.blend'))
s=bpy.context.scene
s.view_settings.exposure=-1.2
bpy.data.lights['sole radente'].energy=.008
for o in bpy.data.collections['luci_anteprima'].objects:
 if o.type=='LIGHT' and o.data.type=='AREA': o.data.energy*=.18 if o.name.startswith('riflesso') else .35
s.camera=bpy.data.objects['cam_header']; s.frame_set(1); s.render.resolution_x=1440; s.render.resolution_y=900
s.render.filepath=str(OUT/'anteprime/greybox/test_scuro.png')
bpy.ops.render.render(write_still=True)
