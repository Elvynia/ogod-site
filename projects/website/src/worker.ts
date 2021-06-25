import { OgodDefaultRegistry, OgodRuntimeEngine } from '@ogod/runtime-core';
import { OgodThreeRegistry, threeCreateGeometry, threeCreateMaterial, ThreeRuntimeInstance, ThreeStateMesh, threeWorkerStream, ThreeRuntimePoints, ThreeStatePoints } from '@ogod/runtime-three';
import { BoxBufferGeometry, BufferGeometry, Color, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial, MeshPhongMaterial, PlaneBufferGeometry, Points, PointsMaterial, SphereBufferGeometry, Vector3 } from 'three';

declare var self: OgodRuntimeEngine;

self.debugMode = true;
self.onmessage = threeWorkerStream({
    ...OgodDefaultRegistry,
    ...OgodThreeRegistry,
    'geometry.BoxBuffer': BoxBufferGeometry,
    'geometry.SphereBuffer': SphereBufferGeometry,
    'geometry.PlaneBuffer': PlaneBufferGeometry,
    'material.MeshBasic': MeshBasicMaterial,
    'material.MeshPhong': MeshPhongMaterial,
    'instance.ColorPlane': class ThreeRuntimeColorPlane extends ThreeRuntimeInstance {

        initialize(state: ThreeStateMesh) {
            const mat = threeCreateMaterial(state.material);
            mat.vertexColors = true;
            let geo = threeCreateGeometry(state.geometry);
            let position = geo.attributes.position;
            const color = new Color();
            const vertex = new Vector3();
            for (let i = 0, l = position.count; i < l; i++) {
                vertex.fromBufferAttribute(position, i);
                vertex.x += Math.random() * 20 - 10;
                vertex.y += Math.random() * 2;
                position.setXYZ(i, vertex.x, vertex.y, vertex.z);
            }
            geo = geo.toNonIndexed(); // ensure each face has unique vertices
            position = geo.attributes.position;
            const colorsFloor = [];
            for (let i = 0, l = position.count; i < l; i++) {
                color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
                colorsFloor.push(color.r, color.g, color.b);
            }
            geo.setAttribute('color', new Float32BufferAttribute(colorsFloor, 3));
            state.object$ = new Mesh(geo, mat) as any;
            return this.initializeSuccess(state);
        }
    },
    'instance.Stars': class ThreeRuntimeStars extends ThreeRuntimePoints {

        initialize(state, state$, action$) {
            state.object$ = new Group();

            const r = 6371, starsGeometry = [new BufferGeometry(), new BufferGeometry()];
            const vertices1 = [];
            const vertices2 = [];
            const vertex = new Vector3();
            for (let i = 0; i < 250; i++) {
                vertex.x = Math.random() * 2 - 1;
                vertex.y = Math.random() * 2 - 1;
                vertex.z = Math.random() * 2 - 1;
                vertex.multiplyScalar(r);
                vertices1.push(vertex.x, vertex.y, vertex.z);
            }
            for (let i = 0; i < 1500; i++) {
                vertex.x = Math.random() * 2 - 1;
                vertex.y = Math.random() * 2 - 1;
                vertex.z = Math.random() * 2 - 1;
                vertex.multiplyScalar(r);
                vertices2.push(vertex.x, vertex.y, vertex.z);
            }
            starsGeometry[0].setAttribute('position', new Float32BufferAttribute(vertices1, 3));
            starsGeometry[1].setAttribute('position', new Float32BufferAttribute(vertices2, 3));

            const starsMaterials = [
                new PointsMaterial({ color: 0x555555, size: 2, sizeAttenuation: false }),
                new PointsMaterial({ color: 0x555555, size: 1, sizeAttenuation: false }),
                new PointsMaterial({ color: 0x333333, size: 2, sizeAttenuation: false }),
                new PointsMaterial({ color: 0x3a3a3a, size: 1, sizeAttenuation: false }),
                new PointsMaterial({ color: 0x1a1a1a, size: 2, sizeAttenuation: false }),
                new PointsMaterial({ color: 0x1a1a1a, size: 1, sizeAttenuation: false })
            ];
            for (let i = 10; i < 30; i++) {
                const stars = new Points(starsGeometry[i % 2], starsMaterials[i % 6]);
                stars.rotation.x = Math.random() * 6;
                stars.rotation.y = Math.random() * 6;
                stars.rotation.z = Math.random() * 6;
                stars.scale.setScalar(i * 10);
                stars.matrixAutoUpdate = false;
                stars.updateMatrix();
                state.object$.add(stars);
            }
            return this.initializeSuccess(state);
        }
    }
}, '/');
