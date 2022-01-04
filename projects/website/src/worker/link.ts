import { threeCreateMaterial, ThreeRuntimeMesh } from "@ogod/runtime-three";
import { BufferGeometry, Line } from 'three';

export class ThreeRuntimeLink extends ThreeRuntimeMesh {
    initialize(state, state$, action$) {
        const geo = new BufferGeometry().setFromPoints(state.geometry);
        const mat = threeCreateMaterial(state.material);
        state.object$ = new Line(geo, mat);
        return super.initializeSuccess(state);
    }
}
