import { loadEngineScene, ogodState$, ogodStore } from '@ogod/core';
import { ThreePointsRuntime, ThreeSceneRuntime } from '@ogod/runtime-three';
import { customElement, html, LitElement, query } from 'lit-element';
import { animationFrameScheduler, defer, interval } from 'rxjs';
import { filter, map, take, takeWhile, tap, switchMap } from 'rxjs/operators';
import { Color } from 'three';

@customElement('ogod-site-intro')
export class OgodSiteIntro extends LitElement {

    private heading: HTMLElement;
    private sceneColor: Color;

    render() {
        return html`
        <three-points name="intropoints">
            <three-points-material size="10" color="white" transparent></three-points-material>
        </three-points>
        <slot></slot>
        `;
    }

    firstUpdated() {
        this.heading = this.querySelector('.heading');
    }

    async connectedCallback() {
        this.style.display = 'block';
        super.connectedCallback();
        ogodState$().pipe(
            map((state) => state.instances['intropoints']),
            filter((instance) => instance && instance.entity.initialized),
            map(({ runtime }) => (<ThreePointsRuntime>runtime).instance),
            take(1),
            switchMap((threeObj) => ogodState$().pipe(
                map((state) => state.scenes['start']),
                filter((scene) => scene && scene.entity.loaded),
                map((scene) => (<ThreeSceneRuntime>scene.runtime).instance),
                map((scene) => ({
                    scene,
                    threeObj
                })),
                take(1)
            ))
        ).subscribe((arg) => {
            // TODO: move the functions somewhere !
            let msElapsed = (scheduler = animationFrameScheduler) => defer(() => {
                const start = scheduler.now();
                return interval(0, scheduler).pipe(
                    map(() => scheduler.now() - start)
                );
            });
            let duration = (time) => msElapsed().pipe(
                map((ms) => ms / time),
                takeWhile((val) => val <= 1)
            );
            let distance = (dist) => (time) => dist * time;
            function elasticOut(t) {
                return Math.sin(-13.0 * (t + 1.0) * Math.PI / 2) * Math.pow(2.0, -10.0 * t) + 1.0
            }
            function backIn(t) {
                var s = 1.70158
                return t * t * ((s + 1) * t - s)
            }
            function qinticOut(t) {
                return --t * t * t * t * t + 1
              }
            duration(6000).pipe(
                map(elasticOut),
                map(distance(400))
            ).subscribe({
                next: (frame) => arg.threeObj.position.setY(-frame),
                complete: () => {
                    duration(4000).pipe(
                        map(backIn),
                        map(distance(1500))
                    ).subscribe({
                        next: (frame) => arg.threeObj.position.setZ(frame),
                        complete: () => duration(2000).pipe(
                            map(qinticOut)
                        ).subscribe({
                            next: (frame) => {
                                if (!this.sceneColor) {
                                    this.sceneColor = arg.scene.background as Color;
                                }
                                (arg.scene.background as Color).set(new Color(
                                    this.sceneColor.r - (this.sceneColor.r * frame),
                                    this.sceneColor.g - (this.sceneColor.g * frame),
                                    this.sceneColor.b - (this.sceneColor.b * frame)
                                ));
                                this.heading.style.opacity = (1 - frame).toString()
                            },
                            complete: () => ogodStore.dispatch(loadEngineScene('main', 'logos'))
                        })
                    });
                }
            });
        });
    }
}