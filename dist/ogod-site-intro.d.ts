import { OgodInstanceEntity } from '@ogod/core';
import { ThreePointsRuntime, ThreePointsEntity, ThreePointsElement } from '@ogod/runtime-three';
export declare const INSTANCE_ID_INTRO = "intropoints";
export declare class OgodSiteIntroEntity extends ThreePointsEntity {
    heading: HTMLElement;
}
export declare class OgodSiteIntroRuntime extends ThreePointsRuntime {
    private sub;
    private sceneColor;
    start(entity: OgodSiteIntroEntity): OgodInstanceEntity;
    private startAnimation;
    private stopAnimation;
}
export declare class OgodSiteIntroElement extends ThreePointsElement {
    constructor();
    getEntity(): OgodSiteIntroEntity;
    render(): import("lit-element").TemplateResult;
    connectedCallback(): Promise<void>;
}
