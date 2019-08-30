import { LitElement, html, css, query } from "lit-element";
import { i18nMixin, translate } from 'lit-element-i18n';
import { ThreeRendererElement } from "@ogod/runtime-three";
import { ThreeRandomGeometryElement } from "./three-random-geometry";
type Constructor<T = {}> = new (...args: any[]) => T;

function mixi<TBase extends Constructor>(Base: TBase): TBase {
    return i18nMixin(Base);
}

export class OgodI18nApp extends mixi(LitElement) {

    @query('three-random-geometry')
    geometry: ThreeRandomGeometryElement;

    @query('#logoRenderer')
    renderer: ThreeRendererElement;

    private supportedLangs: Array<string>;

    constructor() {
        super();
        this.supportedLangs = ['fr', 'en'];
        (<any>this).languageResources = '/assets/locales/{{lng}}/{{ns}}.json';
    }

    static get styles() {
        return css`
        @import url('node_modules/bulma/css/bulma.min.css');

        a.navbar-item.no-padding {
            padding: 0;
        }

        ogod-engine#ogod-logo {
            user-select: none;
        }

        h1, h2, h3 {
            text-align: center;
            color: #8e170c;
        }

        h1 {
            font-size: 3rem;
        }

        h2 {
            font-size: 1.5rem;
        }

        div.heading {
            width: 100%;
        }

        div.heading h2 span {
            font-weight: bold;
            color: #961890;
        }

        `;
    }

    render() {
        return html`
        <nav class="navbar is-info" role="navigation" aria-label="main navigation">
            <div class="navbar-brand">
                <a class="navbar-item no-padding" @click="${this.changeLogo}">
                    <ogod-engine id="ogod-logo" init-scene="ogod-default-scene" pauseonescape>
                        <three-renderer id="logoRenderer" width="65px" height="65px" alpha>
                            <three-scene>
                                <three-spot-light name="ambient" color="#ffffff" intensity="0.6">
                                    <ogod-property name="POSITION" value='{ "x": 1, "y": 30, "z": 60 }'></ogod-property>
                                </three-spot-light>
                                <three-mesh name="logo">
                                    <three-phong-material args='{ "color": "#8e170c" }'></three-basic-material>
                                    <three-random-geometry></three-random-geometry>
                                </three-mesh>
                            </three-scene>
                        </three-renderer>
                    </ogod-engine>
                </a>
                <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" onclick="document.querySelector('.navbar-menu').classList.toggle('is-active');">
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>
            <div class="navbar-menu">
                <div class="navbar-start" onclick="document.querySelector('.navbar-menu').classList.remove('is-active');">
                    <a class="navbar-item">Previous scene </a>
                    <div class="navbar-item has-dropdown is-hoverable">
                        <a class="navbar-link">
                            More
                        </a>
                        <div class="navbar-dropdown">
                            <a class="navbar-item" href="https://github.com/Elvynia/ogod-core">
                                Github
                            </a>
                            <a class="navbar-item" href="https://github.com/Elvynia/ogod-core/issues">
                                Report an issue
                            </a>
                            <hr class="navbar-divider">
                            <a class="navbar-item" href="https://www.linkedin.com/in/j%C3%A9r%C3%A9my-masson-a800a8aa/">
                                Contact
                            </a>
                        </div>
                    </div>
                </div>
                <div class="navbar-end">
                    <div class="navbar-item has-dropdown is-hoverable">
                        <a class="navbar-link">
                            ${translate('app:language')}
                        </a>
                        <div class="navbar-dropdown">
                            <a id="fr" class="navbar-item" @click='${this.changeLanguages}'>
                                Français
                            </a>
                            <a id="en" class="navbar-item" @click='${this.changeLanguages}'>
                                English
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        <ogod-engine id="main" init-scene="start" pauseonescape>
            <three-renderer width="100%" height="100%">
                <three-scene id="start" class="ogodCenter"
                    load-map='{ "instances": ["intropoints"] }' background="#a4b0f5">
                    <ogod-site-intro>
                        <div class="heading">
                            <h1>${translate('app:welcome')}</h1>
                            <h2>
                                <span>O</span>f <span>G</span>ames and <span>O</span>pen <span>D</span>evelopment !
                            </h2>
                        </div>
                    </ogod-site-intro>
                </three-scene>
                <three-scene id="logos">
                    <three-textures name="webcomponent_logos" path="assets/webcomponent/logo" end="4" ext=".png"></three-textures>
                    <three-spiralcolor-points name="webcomponent_points" resource="webcomponent_logos"></three-spiralcolor-points>
                </three-scene>
            </three-renderer>
        </ogod-engine>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        // FIXME: waiting for languages to load + renderer to have camera. Use ogodState$.
        setTimeout(() => {
            let userLang = navigator.language.split('-')[0];
            if (this.supportedLangs.indexOf(userLang) >= 0) {
                this.changeLanguages(userLang);
            }
            this.renderer.getCamera().position.z = 30;
        }, 1000);
    }

    changeLanguages(event) {
        let lang;
        if (typeof event === 'string') {
            lang = event;
        } else {
            lang = event.target.id;
        }
        (<any>this).changeLanguage(lang);
    }

    changeLogo() {
        this.geometry.nextGeometry();
    }
}

customElements.define('ogod-i18n-app', OgodI18nApp);