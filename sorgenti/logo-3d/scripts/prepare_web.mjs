import { NodeIO } from '@gltf-transform/core'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
const base = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const io = new NodeIO()
const path = resolve(base, 'Logo3DAnimabile_MetalloGrezzo.glb')
const doc = await io.read(path)
// Blender NLA export omits animated translation from the default pose.
for (const [name, position] of Object.entries({sguardo_sx: [-1.1431725,.523,0], sguardo_dx: [1.1370915,.523,0]})) {
  doc.getRoot().listNodes().find(node => node.getName() === name).setTranslation(position)
}
// Each reusable clip begins at zero; the Blender demo keeps its sequential NLA timing.
for (const animation of doc.getRoot().listAnimations()) {
 const samplers=animation.listSamplers()
 const offset=Math.min(...samplers.map(s=>s.getInput().getArray()[0]))
 for (const sampler of samplers) {
  const input=sampler.getInput().clone()
  input.setArray(Float32Array.from(input.getArray(), t=>t-offset))
  sampler.setInput(input)
 }
}
await io.write(path,doc)
console.log('Neutral pupil transforms restored; seven clips normalized to t=0.')
