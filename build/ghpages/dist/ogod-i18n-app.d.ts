import { LitElement } from "lit-element";
import { ThreeRendererElement } from "@ogod/runtime-three";
import { ThreeRandomGeometryElement } from "./three-random-geometry";
declare const OgodI18nApp_base: typeof LitElement;
export declare class OgodI18nApp extends OgodI18nApp_base {
    geometry: ThreeRandomGeometryElement;
    renderer: ThreeRendererElement;
    private supportedLangs;
    constructor();
    static readonly styles: import("lit-element").CSSResult;
    render(): import("lit-element").TemplateResult;
    connectedCallback(): void;
    changeLanguages(event: any): void;
    changeLogo(): void;
}
export {};
