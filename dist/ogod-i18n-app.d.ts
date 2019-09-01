import { LitElement } from "lit-element";
import { ThreeRendererElement } from "@ogod/runtime-three";
import { ThreeRandomGeometryElement } from "./three-random-geometry";
declare const OgodI18nApp_base: typeof LitElement;
export declare class OgodI18nApp extends OgodI18nApp_base {
    geometry: ThreeRandomGeometryElement;
    renderer: ThreeRendererElement;
    private supportedLangs;
    constructor();
    createRenderRoot(): Element | ShadowRoot;
    static readonly styles: import("lit-element").CSSResult;
    render(): import("lit-element").TemplateResult;
    connectedCallback(): void;
    changeLanguages(event: any): void;
    changeLogo(): void;
    openMenu(): void;
    closeMenu(): void;
}
export {};
