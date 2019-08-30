var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

import { loadEngineScene, ogodState$, ogodStore } from "../node_modules/@ogod/core/dist/index.js";
import { customElement, html, LitElement } from "../node_modules/lit-element/lit-element.js";
import { animationFrameScheduler, defer, interval } from "../node_modules/rxjs/_esm5/index.js";
import { filter, map, take, takeWhile, switchMap } from "../node_modules/rxjs/_esm5/operators/index.js";
import { Color } from "../node_modules/three/build/three.module.js";
let OgodSiteIntro = class OgodSiteIntro extends LitElement {
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
    ogodState$().pipe(map(state => state.instances['intropoints']), filter(instance => instance && instance.entity.initialized), map(({
      runtime
    }) => runtime.instance), take(1), switchMap(threeObj => ogodState$().pipe(map(state => state.scenes['start']), filter(scene => scene && scene.entity.loaded), map(scene => scene.runtime.instance), map(scene => ({
      scene,
      threeObj
    })), take(1)))).subscribe(arg => {
      let msElapsed = (scheduler = animationFrameScheduler) => defer(() => {
        const start = scheduler.now();
        return interval(0, scheduler).pipe(map(() => scheduler.now() - start));
      });

      let duration = time => msElapsed().pipe(map(ms => ms / time), takeWhile(val => val <= 1));

      let distance = dist => time => dist * time;

      function elasticOut(t) {
        return Math.sin(-13.0 * (t + 1.0) * Math.PI / 2) * Math.pow(2.0, -10.0 * t) + 1.0;
      }

      function backIn(t) {
        var s = 1.70158;
        return t * t * ((s + 1) * t - s);
      }

      function qinticOut(t) {
        return --t * t * t * t * t + 1;
      }

      duration(6000).pipe(map(elasticOut), map(distance(400))).subscribe({
        next: frame => arg.threeObj.position.setY(-frame),
        complete: () => {
          duration(4000).pipe(map(backIn), map(distance(1500))).subscribe({
            next: frame => arg.threeObj.position.setZ(frame),
            complete: () => duration(2000).pipe(map(qinticOut)).subscribe({
              next: frame => {
                if (!this.sceneColor) {
                  this.sceneColor = arg.scene.background;
                }

                arg.scene.background.set(new Color(this.sceneColor.r - this.sceneColor.r * frame, this.sceneColor.g - this.sceneColor.g * frame, this.sceneColor.b - this.sceneColor.b * frame));
                this.heading.style.opacity = (1 - frame).toString();
              },
              complete: () => ogodStore.dispatch(loadEngineScene('main', 'logos'))
            })
          });
        }
      });
    });
  }

};
OgodSiteIntro = __decorate([customElement('ogod-site-intro')], OgodSiteIntro);
export { OgodSiteIntro }; //# sourceMappingURL=ogod-site-intro.js.map