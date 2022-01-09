// FIXME: Interop compatibility if rxjs loaded multiple times.
if (typeof Symbol === 'function') {
    if (!Symbol.observable) {
        (Symbol as any).observable = Symbol('observable');
    }
}
import { OgodDefaultRegistry, OgodRuntimeEngine } from '@ogod/runtime-core';
import { OgodThreeRegistry, threeWorkerStream } from '@ogod/runtime-three';
import { ShaderMaterial, BoxBufferGeometry, BufferGeometry, LineBasicMaterial, MeshBasicMaterial, MeshPhongMaterial, PlaneBufferGeometry, SphereBufferGeometry } from 'three';
import { ThreeRuntimeActionsSystem } from './worker/action-system';
import { ThreeRuntimeBubble } from './worker/bubble';
import { ThreeRuntimeColorPlane } from './worker/color-plane';
import { ThreeRuntimeGlowCube } from './worker/glow-cube';
import { ThreeRuntimeKnowledgeBase } from './worker/knowledge-base';
import { ThreeRuntimeLink } from './worker/link';
import { ThreeRuntimeShaderGlow } from './worker/shader-glow';
import { ThreeRuntimeStars } from './worker/stars';
import { ThreeRuntimeVoxelMaterial } from './worker/voxel-material';
import { ThreeRuntimeVoxelWorld } from './worker/voxel-world';
import { PhysiRuntimeScene } from './worker/physi-scene';

declare var self: OgodRuntimeEngine;

self.debugMode = true;
self.onmessage = threeWorkerStream({
    ...OgodDefaultRegistry,
    ...OgodThreeRegistry,
    'resource.shader-glow': ThreeRuntimeShaderGlow,
    'resource.voxel': ThreeRuntimeVoxelMaterial,
    'geometry.BoxBuffer': BoxBufferGeometry,
    'geometry.SphereBuffer': SphereBufferGeometry,
    'geometry.BasicBuffer': BufferGeometry,
    'geometry.PlaneBuffer': PlaneBufferGeometry,
    'material.MeshBasic': MeshBasicMaterial,
    'material.MeshPhong': MeshPhongMaterial,
    'material.LineBasic': LineBasicMaterial,
    'material.shader': ShaderMaterial,
    'instance.color-plane': ThreeRuntimeColorPlane,
    'instance.stars': ThreeRuntimeStars,
    'instance.bubble': ThreeRuntimeBubble,
    'instance.link': ThreeRuntimeLink,
    'instance.knowledge-base': ThreeRuntimeKnowledgeBase,
    'instance.glow-cube': ThreeRuntimeGlowCube,
    'system.actions': ThreeRuntimeActionsSystem,
    'system.voxel-world': ThreeRuntimeVoxelWorld,
    'scene.physi': PhysiRuntimeScene
}, '/');
