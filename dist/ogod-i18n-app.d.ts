import { LitElement } from "lit-element";
import { ThreeRendererElement } from "@ogod/runtime-three";
import { ThreeRandomGeometryElement } from "./three-random-geometry";
declare const OgodI18nApp_base: typeof LitElement;
export declare class OgodI18nApp extends OgodI18nApp_base {
    geometry: ThreeRandomGeometryElement;
    renderer: ThreeRendererElement;
    private supportedLangs;
    private width;
    private height;
    constructor();
    createRenderRoot(): Element | ShadowRoot;
    static readonly styles: import("lit-element").CSSResult;
    render(): import("lit-element").TemplateResult;
    connectedCallback(): void;
    changeLanguages(event: any): void;
    changeLogo(): void;
    toggleMenu(event: any): void;
    closeMenu(): void;
    private addBaseHref;
}
export {};
