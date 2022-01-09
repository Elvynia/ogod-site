import { Raycaster, Vector2 } from 'three';
import { OgodRuntimeEngine, OgodRuntimeSystemDefault } from "@ogod/runtime-core";
import { ActionsObservable, ofType } from 'redux-observable';
import { sceneInitSuccess } from '@ogod/common';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ThreeStateEngine, ThreeStateScene } from '@ogod/runtime-three';

declare var self: OgodRuntimeEngine;

export class ThreeRuntimeActionsSystem extends OgodRuntimeSystemDefault {

    initialize(state, state$: Observable<ThreeStateEngine>, action$: ActionsObservable<any>) {
        state.targets = [];
        state.raycaster = new Raycaster();
        state.center = new Vector2(0, 0);
        return state$.pipe(
            filter((s) => s.scene[state.sceneId]?.loaded),
            map((s) => s.scene[state.sceneId]),
            first(),
            map((sceneState: ThreeStateScene) => {
                return {
                    ...state,
                    camera$: sceneState.camera$
                };
            }),
            switchMap((s) => super.initialize(s, state$, action$))
        );
    }

    add(state, instance) {
        super.add(state, instance);
        state.targets.push(instance.object$);
    }

    remove(state, id, instance) {
        super.remove(state, id, instance);
        state.targets = state.targets.filter((o) => o.name !== id);
    }

    update(delta: number, state) {
        state.camera$.updateMatrixWorld();
        state.raycaster.setFromCamera(state.center, state.camera$);

        var intersections = state.raycaster.intersectObjects(state.targets);
        var intersection = (intersections.length) > 0 ? intersections[0] : null;
        if (intersection) {
            if (state.currentTarget && state.currentTarget !== intersection.object.name) {
                this.clearTarget(state);
            }
            state.currentTarget = intersection.object.name;
            const target: any = self.store.getState().instance[state.currentTarget];
            state.action = target.action;
            target.glow = true;
        } else if (state.currentTarget) {
            this.clearTarget(state);
            state.action = '';
        }
    }

    clearTarget(state) {
        (self.store.getState().instance[state.currentTarget] as any).glow = false;
        state.currentTarget = null;
    }
}
