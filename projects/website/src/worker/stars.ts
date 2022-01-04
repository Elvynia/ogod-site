import { ThreeRuntimePoints } from "@ogod/runtime-three";
import { Vector3, Group, BufferGeometry, PointsMaterial, Float32BufferAttribute, Points } from 'three';

export class ThreeRuntimeStars extends ThreeRuntimePoints {

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
