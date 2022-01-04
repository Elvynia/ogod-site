import { threeCreateGeometry, ThreeRuntimeMesh, ThreeStateEngine } from "@ogod/runtime-three";
import { Observable } from "rxjs";
import { filter, first, map, pluck, switchMap } from "rxjs/operators";
import { Mesh, ShaderMaterial } from 'three';

export class ThreeRuntimeGlowCube extends ThreeRuntimeMesh {

    initialize(state, state$: Observable<ThreeStateEngine>, action$) {
        return state$.pipe(
            filter((s) => s.resource['glow']?.loaded),
            first(),
            map((s) => s.resource['glow']),
            pluck('data$'),
            switchMap((glow$: ShaderMaterial) => {
                state.glowMesh$ = new Mesh(threeCreateGeometry(state.geometry), glow$.clone());
                state.glowMesh$.scale.multiplyScalar(1.2);
                state.glowMesh$.name = state.id;
                return super.initialize(state, state$, action$);
            })
        );
    }

    updateStateGlow(_, state: any) {
        if (state.glow) {
            // state.object$.material.color.setHex(0xffffff);
            state.object$.add(state.glowMesh$);
        } else {
            // state.object$.material.color.setStyle(state.material.args[0].color);
            state.object$.remove(state.glowMesh$)
        }
    }
}
