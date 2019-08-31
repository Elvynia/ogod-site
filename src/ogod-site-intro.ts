import { loadEngineScene, ogodState$, ogodStore, OgodInstanceEntity } from '@ogod/core';
import { ThreePointsRuntime, ThreeSceneRuntime, ThreePointsEntity, ThreePointsElement } from '@ogod/runtime-three';
import { customElement, html, LitElement } from 'lit-element';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { Color } from 'three';
import { backIn, distance, duration, elasticOut, sineOut } from './animation';
import { ENGINE_ID_MAIN, SCENE_ID_START } from './constants';
import { Subscription } from 'rxjs';

export const INSTANCE_ID_INTRO = 'intropoints';

export class OgodSiteIntroEntity extends ThreePointsEntity {
    heading: HTMLElement;
}

export class OgodSiteIntroRuntime extends ThreePointsRuntime {

    private sub: Subscription;
    private sceneColor: Color;

    start(entity: OgodSiteIntroEntity): OgodInstanceEntity {
        this.startAnimation(entity.heading);
        return super.start(entity);
    }

    private startAnimation(heading: HTMLElement) {
        heading.style.opacity = '1';
        this.stopAnimation();
        this.sub = ogodState$().pipe(
            map((state) => state.instances[INSTANCE_ID_INTRO]),
            filter((instance) => instance && instance.entity.initialized),
            map(({ runtime }) => (<ThreePointsRuntime>runtime).instance),
            take(1),
            switchMap((threeObj) => ogodState$().pipe(
                map((state) => state.scenes[SCENE_ID_START]),
                filter((scene) => scene && scene.entity.loaded),
                map((scene) => (<ThreeSceneRuntime>scene.runtime).instance),
                map((scene) => ({
                    scene,
                    threeObj
                })),
                take(1)
            ))
        ).subscribe((arg) => {
            if (this.sceneColor) {
                (arg.scene.background as Color).set(this.sceneColor);
                this.sceneColor = undefined;
                arg.threeObj.position.set(0, 0, 0);
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
                        complete: () => duration(1500).pipe(
                            map(sineOut)
                        ).subscribe({
                            next: (frame) => {
                                if (!this.sceneColor) {
                                    this.sceneColor = new Color().set(arg.scene.background as Color);
                                }
                                (arg.scene.background as Color).set(new Color(
                                    this.sceneColor.r - (this.sceneColor.r * frame),
                                    this.sceneColor.g - (this.sceneColor.g * frame),
                                    this.sceneColor.b - (this.sceneColor.b * frame)
                                ));
                                heading.style.opacity = (1 - frame).toString()
                            },
                            complete: () => ogodStore.dispatch(loadEngineScene(ENGINE_ID_MAIN, 'logos'))
                        })
                    });
                }
            });
        });
    }

    private stopAnimation() {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }
}

@customElement('ogod-site-intro')
export class OgodSiteIntroElement extends ThreePointsElement {

    constructor() {
        super();
        this.name = INSTANCE_ID_INTRO;
        this.impl = () => new OgodSiteIntroRuntime();
    }

    getEntity(): OgodSiteIntroEntity {
        return {
            ...super.getEntity(),
            heading: this.querySelector('.heading')
        }
    }

    render() {
        return html`
        <slot>
            <three-buffer-geometry></three-buffer-geometry>
            <three-points-material size="10" color="white" transparent></three-points-material>
        </slot>`;
    }

    async connectedCallback() {
        this.style.display = 'block';
        super.connectedCallback();
    }

    
}