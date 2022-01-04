import { threeCreateGeometry, threeCreateMaterial, ThreeRuntimeInstance, ThreeStateMesh } from "@ogod/runtime-three";
import { Color, Vector3, Mesh, Float32BufferAttribute } from 'three';

export class ThreeRuntimeColorPlane extends ThreeRuntimeInstance {

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
}
