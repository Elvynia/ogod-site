import { ThreeFixtureElement, ThreeMeshEntity } from "@ogod/runtime-three";
import { customElement } from "lit-element";
import { BufferGeometry, BoxBufferGeometry, TorusKnotBufferGeometry, SphereBufferGeometry } from "three";
import { ogodStore, changeInstance, lookupByClassName } from "@ogod/core";

@customElement('three-random-geometry')
export class ThreeRandomGeometryElement extends ThreeFixtureElement {
    private geometries: Array<BufferGeometry>;
    private _instanceId: string;
    private lastRand: number;

    constructor() {
        super();
        this.geometries = [];
    }

    get instanceId(): string {
        if (this._instanceId === undefined) {
            this._instanceId = lookupByClassName(this, 'ogodInstance', 'name');
        }
        return this._instanceId;
    }

    public nextGeometry() {
        ogodStore.dispatch(changeInstance(this.instanceId, <ThreeMeshEntity>{
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

    protected computeArgs() {
        return this.randGeometry();
    }

    private randGeometry(): BufferGeometry {
        let rand = this.lastRand;
        while (this.lastRand === rand) {
            rand = Math.round(Math.random() * (this.geometries.length - 1));
        }
        this.lastRand = rand;
        return this.geometries[rand];
    }
}