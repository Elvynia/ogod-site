var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

import { ThreeFixtureElement } from "../node_modules/@ogod/runtime-three/dist/index.js";
import { customElement } from "../node_modules/lit-element/lit-element.js";
import { TorusKnotBufferGeometry } from "../node_modules/three/build/three.module.js";
import { ogodStore, changeInstance, lookupByClassName } from "../node_modules/@ogod/core/dist/index.js";
let ThreeRandomGeometryElement = class ThreeRandomGeometryElement extends ThreeFixtureElement {
  constructor() {
    super();
    this.geometries = [];
  }

  get instanceId() {
    if (this._instanceId === undefined) {
      this._instanceId = lookupByClassName(this, 'ogodInstance', 'name');
    }

    return this._instanceId;
  }

  nextGeometry() {
    ogodStore.dispatch(changeInstance(this.instanceId, {
      geometry: this.randGeometry()
    }));
  }

  async connectedCallback() {
    this.classList.add('threeGeometry');

    for (let i = 0; i <= 25; ++i) {
      this.geometries.push(new TorusKnotBufferGeometry(10, 2, 128, 32, 1, i));
      this.geometries.push(new TorusKnotBufferGeometry(10, 2, 128, 32, i, 1));
    }

    super.connectedCallback();
  }

  computeArgs() {
    return this.randGeometry();
  }

  randGeometry() {
    let rand = this.lastRand;

    while (this.lastRand === rand) {
      rand = Math.round(Math.random() * (this.geometries.length - 1));
    }

    this.lastRand = rand;
    return this.geometries[rand];
  }

};
ThreeRandomGeometryElement = __decorate([customElement('three-random-geometry')], ThreeRandomGeometryElement);
export { ThreeRandomGeometryElement }; //# sourceMappingURL=three-random-geometry.js.map