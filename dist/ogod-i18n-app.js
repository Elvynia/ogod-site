var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

import { LitElement, html, css, query } from "../node_modules/lit-element/lit-element.js";
import { i18nMixin, translate } from "../node_modules/lit-element-i18n/lit-element-i18n.js";
import { OgodActionAttribute } from "../node_modules/@ogod/core/dist/feature/ogod-action.js";
import { CustomAttributeRegistry } from "../node_modules/custom-attributes/index.js";
import { ogodState$ } from "../node_modules/@ogod/core/dist/index.js";
import { filter, map, switchMap, take, mapTo } from "../node_modules/rxjs/_esm5/operators/index.js";
import { interval } from "../node_modules/rxjs/_esm5/index.js";
import i18next from "../node_modules/i18next/dist/es/index.js";
import { ENGINE_ID_LOGO, ENGINE_ID_MAIN, SCENE_ID_START, SCENE_ID_LOGOS } from "./constants.js";

function mixi(Base) {
  return i18nMixin(Base);
}

export class OgodI18nApp extends mixi(LitElement) {
  constructor() {
    super();
    this.supportedLangs = ['fr', 'en'];
    this.languageResources = '/assets/locales/{{lng}}/{{ns}}.json';
  }

  createRenderRoot() {
    let root = super.createRenderRoot();
    const attributes = new CustomAttributeRegistry(root);
    attributes.define('ogod-action', OgodActionAttribute);
    return root;
  }

  static get styles() {
    return css`
        @import url('node_modules/bulma/css/bulma.min.css');

        a.navbar-item.no-padding {
            padding: 0;
        }

        ogod-engine#logo-engine {
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
            color: #216498;
        }

        `;
  }

  render() {
    return html`
        <nav class="navbar is-info" role="navigation" aria-label="main navigation">
            <div class="navbar-brand">
                <a class="navbar-item no-padding" @click="${this.changeLogo}">
                    <ogod-engine id="${ENGINE_ID_LOGO}" init-scene="ogod-default-scene" pauseonescape>
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
                <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" @click="${this.openMenu}">
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>
            <div class="navbar-menu">
                <div class="navbar-start" @click="${this.closeMenu}">
                    <a ogod-action='{ "type": "ENGINE_SCENE_LOAD", "payload": { "id": "${ENGINE_ID_MAIN}", "sceneId": "${SCENE_ID_START}"}}'
                        class="navbar-item">${translate('app:introScene')}</a>
                    <a class="navbar-item" href="https://github.com/Elvynia/ogod-site" target="_blank">
                        ${translate('app:sources')}
                    </a>
                    <div class="navbar-item has-dropdown is-hoverable">
                        <a class="navbar-link">
                            ${translate('projects')}
                        </a>
                        <div class="navbar-dropdown">
                            <a class="navbar-item" href="https://github.com/Elvynia/ogod-core" target="_blank">
                                OGOD Core
                            </a>
                            <a class="navbar-item" href="https://github.com/Elvynia/ogod-pixi" target="_blank"">
                                OGOD Pixi.js
                            </a>
                            <a class="navbar-item" href="https://github.com/Elvynia/ogod-three" target="_blank">
                                OGOD Three.js
                            </a>
                        </div>
                    </div>
                    <div class="navbar-item has-dropdown is-hoverable">
                        <a class="navbar-link">
                            ${translate('more')}
                        </a>
                        <div class="navbar-dropdown">
                            <a class="navbar-item" href="https://www.linkedin.com/in/j%C3%A9r%C3%A9my-masson-a800a8aa/"
                                target="_blank">
                                LinkedIn
                            </a>
                        </div>
                    </div>
                </div>
                <div class="navbar-end">
                    <div class="navbar-item has-dropdown is-hoverable">
                        <a class="navbar-link">
                            ${translate('language')}
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
        <ogod-engine id="${ENGINE_ID_MAIN}" init-scene="${SCENE_ID_START}" pauseonescape>
            <three-renderer width="100%" height="100%">
                <three-scene id="${SCENE_ID_START}" class="ogodCenter"
                    load-map='{ "instances": ["intropoints"] }' background="#a4b0f5">
                    <ogod-site-intro>
                        <div class="heading">
                            <h1>${translate('welcome')}</h1>
                            <h2>
                                <span>O</span>f <span>G</span>ames and <span>O</span>pen <span>D</span>evelopment !
                            </h2>
                        </div>
                    </ogod-site-intro>
                </three-scene>
                <three-scene id="${SCENE_ID_LOGOS}">
                    <three-textures name="webcomponent_logos" path="assets/webcomponent/logo" end="4" ext=".png"></three-textures>
                    <three-spiralcolor-points name="webcomponent_points" resource="webcomponent_logos"></three-spiralcolor-points>
                </three-scene>
            </three-renderer>
        </ogod-engine>
        `;
  }

  connectedCallback() {
    super.connectedCallback();
    ogodState$().pipe(map(state => state.engines[ENGINE_ID_LOGO]), filter(engine => engine && engine.entity.renderer && engine.entity.renderer.entity.initialized), map(engine => engine.entity.renderer.entity.camera), take(1), switchMap(camera => interval(100).pipe(filter(() => i18next.isInitialized), take(1), mapTo(camera)))).subscribe(camera => {
      let userLang = navigator.language.split('-')[0];

      if (this.supportedLangs.indexOf(userLang) >= 0) {
        this.changeLanguages(userLang);
      }

      camera.position.z = 30;
    });
  }

  changeLanguages(event) {
    let lang;

    if (typeof event === 'string') {
      lang = event;
    } else {
      lang = event.target.id;
    }

    this.changeLanguage(lang);
  }

  changeLogo() {
    this.geometry.nextGeometry();
  }

  openMenu() {
    this.shadowRoot.querySelector('.navbar-menu').classList.add('is-active');
  }

  closeMenu() {
    this.shadowRoot.querySelector('.navbar-menu').classList.remove('is-active');
  }

}

__decorate([query('three-random-geometry')], OgodI18nApp.prototype, "geometry", void 0);

__decorate([query('#logoRenderer')], OgodI18nApp.prototype, "renderer", void 0);

customElements.define('ogod-i18n-app', OgodI18nApp); //# sourceMappingURL=ogod-i18n-app.js.map