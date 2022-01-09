import { engineCanvasResize, OgodActionScene } from '@ogod/common';
import { threeCreateCamera, threeCreateFog, ThreeRuntimeEngine, ThreeRuntimeScene, ThreeStateEngine, ThreeStateScene } from '@ogod/runtime-three';
import { Scene, BoxMesh } from 'physijs';
import { ActionsObservable, ofType } from 'redux-observable';
import { Observable } from 'rxjs';
import { BoxGeometry, MeshBasicMaterial } from 'three';
import { filter, map, switchMap, take, first } from 'rxjs/operators';
import { tap } from 'rxjs/operators';

declare const self: ThreeRuntimeEngine;

export class PhysiRuntimeScene extends ThreeRuntimeScene {

    initialize(state: ThreeStateScene, state$: Observable<ThreeStateEngine>, action$: ActionsObservable<any>): Observable<OgodActionScene> {
        if (state.camera) {
            state.camera$ = threeCreateCamera(state.camera);
        }
        action$.pipe(
            ofType(engineCanvasResize.type),
        ).subscribe(({ width, height }) => {
            if (state.camera$) {
                state.camera$.aspect = width / height;
                state.camera$.updateProjectionMatrix();
            }
        });
        self.postMessage({ type: 'PHYSI_WORKER_CREATE' });
        return action$.pipe(
            ofType('PHYSI_WORKER_PORT'),
            first(),
            tap((action) => {
                const ctor: any = Scene;
                state.scene$ = new ctor(null, action.ports[0]);
                state.scene$.setGravity(0, -10, 0);
                if (state.background) {
                    this.updateStateBackground(0, state);
                }
                if (state.fog) {
                    state.scene$.fog = threeCreateFog(state.fog);
                }
                setTimeout(() => {
                    const box = new BoxMesh(
                        new BoxGeometry(50, 50, 50) as any,
                        new MeshBasicMaterial({ color: 0xffffff }) as any
                    );
                    box.name = 'testbox'
                    box.position.set(100, 500, 100);
                    box.addEventListener('collision', function (event) {
                        console.log('COLLIDE')
                    });
                    state.scene$.add(box);
                }, 5000)
            }),
            map(() => this.initializeSuccess(state)));
    }

    start(state, state$) {
        self.update$.pipe().subscribe(() => state.scene$.simulate());
        return super.start(state, state$);
    }


}
