import { OgodStateEngine } from "@ogod/common";
import { OgodRuntimeEngine } from "@ogod/runtime-core";
import { ThreeRuntimeMesh, ThreeStateScene } from "@ogod/runtime-three";
import { ActionsObservable } from "redux-observable";
import { Observable } from "rxjs";
import { filter, first, map, pluck, switchMap } from "rxjs/operators";
import { PerspectiveCamera, SphereBufferGeometry, Vector3 } from 'three';

declare var self: OgodRuntimeEngine;

export class ThreeRuntimeBubble extends ThreeRuntimeMesh {
    camera$: PerspectiveCamera;

    initialize(state: any, state$: Observable<OgodStateEngine>, action$: ActionsObservable<any>) {
        state$.pipe(
            map((s) => s.scene[state.cameraScene] as ThreeStateScene),
            filter((s) => !!s?.camera$),
            pluck('camera$'),
            first()
        ).subscribe((camera$) => this.camera$ = camera$);
        return state$.pipe(
            map((s: any) => s.instance[state.id]),
            filter((s: any) => s.size && s.position),
            first(),
            switchMap((s: any) => super.initialize({
                ...s,
                geometry: {
                    ...s.geometry,
                    args: [s.size, s.geometry.args[1], s.geometry.args[2]]
                },
                precision: 1
            }, state$, action$))
        );
    }

    changes(changes, state) {
        if (state.loaded) {
            if (changes.size) {
                state.object$.geometry.dispose();
                state.object$.geometry = new SphereBufferGeometry(changes.size, state.geometry.args[1], state.geometry.args[2]);
            }
            return super.changes(changes, state);
        } else {
            return this.changesSuccess(changes, state);
        }
    }

    update(delta: number, state: any) {
        if (this.camera$) {
            let pos = new Vector3();
            state.object$.getWorldPosition(pos);
            this.camera$.updateMatrixWorld();
            pos.project(this.camera$);
            if (pos.x <= 1 && pos.y >= -1 && pos.x >= -1 && pos.y <= 1 && pos.z < 1) {
                pos.x = pos.x * self.canvas.width / 2 + self.canvas.width / 2;
                pos.y = -pos.y * self.canvas.height / 2 + self.canvas.height / 2;
                if (!state.textPosition || Math.abs(pos.x - state.textPosition.x) > state.precision
                    || Math.abs(pos.y - state.textPosition.y) > state.precision) {
                    state.textPosition = pos.clone();
                }
            } else {
                state.textPosition = null;
            }
        }
    }
}
