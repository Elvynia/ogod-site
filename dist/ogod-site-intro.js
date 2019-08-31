var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

import { loadEngineScene, ogodState$, ogodStore } from "../node_modules/@ogod/core/dist/index.js";
import { ThreePointsRuntime, ThreePointsEntity, ThreePointsElement } from "../node_modules/@ogod/runtime-three/dist/index.js";
import { customElement, html } from "../node_modules/lit-element/lit-element.js";
import { filter, map, switchMap, take } from "../node_modules/rxjs/_esm5/operators/index.js";
import { Color } from "../node_modules/three/build/three.module.js";
import { backIn, distance, duration, elasticOut, sineOut } from "./animation.js";
import { ENGINE_ID_MAIN, SCENE_ID_START } from "./constants.js";
export const INSTANCE_ID_INTRO = 'intropoints';
export class OgodSiteIntroEntity extends ThreePointsEntity {}
export class OgodSiteIntroRuntime extends ThreePointsRuntime {
  start(entity) {
    this.startAnimation(entity.heading);
    return super.start(entity);
  }

  startAnimation(heading) {
    heading.style.opacity = '1';
    this.stopAnimation();
    this.sub = ogodState$().pipe(map(state => state.instances[INSTANCE_ID_INTRO]), filter(instance => instance && instance.entity.initialized), map(({
      runtime
    }) => runtime.instance), take(1), switchMap(threeObj => ogodState$().pipe(map(state => state.scenes[SCENE_ID_START]), filter(scene => scene && scene.entity.loaded), map(scene => scene.runtime.instance), map(scene => ({
      scene,
      threeObj
    })), take(1)))).subscribe(arg => {
      if (this.sceneColor) {
        arg.scene.background.set(this.sceneColor);
        this.sceneColor = undefined;
        arg.threeObj.position.set(0, 0, 0);
      }

      duration(6000).pipe(map(elasticOut), map(distance(400))).subscribe({
        next: frame => arg.threeObj.position.setY(-frame),
        complete: () => {
          duration(4000).pipe(map(backIn), map(distance(1500))).subscribe({
            next: frame => arg.threeObj.position.setZ(frame),
            complete: () => duration(1500).pipe(map(sineOut)).subscribe({
              next: frame => {
                if (!this.sceneColor) {
                  this.sceneColor = new Color().set(arg.scene.background);
                }

                arg.scene.background.set(new Color(this.sceneColor.r - this.sceneColor.r * frame, this.sceneColor.g - this.sceneColor.g * frame, this.sceneColor.b - this.sceneColor.b * frame));
                heading.style.opacity = (1 - frame).toString();
              },
              complete: () => ogodStore.dispatch(loadEngineScene(ENGINE_ID_MAIN, 'logos'))
            })
          });
        }
      });
    });
  }

  stopAnimation() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

}
let OgodSiteIntroElement = class OgodSiteIntroElement extends ThreePointsElement {
  constructor() {
    super();
    this.name = INSTANCE_ID_INTRO;

    this.impl = () => new OgodSiteIntroRuntime();
  }

  getEntity() {
    return Object.assign({}, super.getEntity(), {
      heading: this.querySelector('.heading')
    });
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

};
OgodSiteIntroElement = __decorate([customElement('ogod-site-intro')], OgodSiteIntroElement);
export { OgodSiteIntroElement }; //# sourceMappingURL=ogod-site-intro.js.map