import { ThreeFixtureElement } from "@ogod/runtime-three";
import { BufferGeometry } from "three";
export declare class ThreeRandomGeometryElement extends ThreeFixtureElement {
    private geometries;
    private _instanceId;
    private lastRand;
    constructor();
    readonly instanceId: string;
    nextGeometry(): void;
    connectedCallback(): Promise<void>;
    protected computeArgs(): BufferGeometry;
    private randGeometry;
}
