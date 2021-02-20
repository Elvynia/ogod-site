import { OgodDefaultRegistry, OgodRuntimeEngine } from '@ogod/runtime-core';
import { OgodThreeRegistry, threeWorkerStream } from '@ogod/runtime-three';
import { BoxBufferGeometry, MeshBasicMaterial, MeshPhongMaterial, PlaneBufferGeometry, SphereBufferGeometry } from 'three';

declare var self: OgodRuntimeEngine;

self.debugMode = true;
self.onmessage = threeWorkerStream({
    ...OgodDefaultRegistry,
    ...OgodThreeRegistry,
    'geometry.BoxBuffer': BoxBufferGeometry,
    'geometry.SphereBuffer': SphereBufferGeometry,
    'geometry.PlaneBuffer': PlaneBufferGeometry,
    'material.MeshBasic': MeshBasicMaterial,
    'material.MeshPhong': MeshPhongMaterial
}, '/');
