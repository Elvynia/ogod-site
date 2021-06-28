import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { ogodDefineKey, ogodDefineKeys, ogodDefineSystem, ogodFactoryInstanceProperty, ogodFactorySystemChildren, ogodFactorySystemProperty } from '@ogod/element-core';
import {
    threeDefineCamera, threeDefineControlFly, threeDefineEngine, threeDefineGeometry, threeDefineLightAmbient,
    threeDefineLightPoint, threeDefineLightSpot, threeDefineMaterial, threeDefineMesh, threeDefinePoints, threeDefineRenderer,
    threeDefineScene, threeDefineTexture, threeDefineVec3, threeDefineObject, threeDefineLightHemisphere, threeDefineFog
} from '@ogod/element-three';
import { threeDefineBubble } from './app/bubble/define';

threeDefineEngine();
threeDefineRenderer();
threeDefineCamera();
threeDefineTexture();
threeDefineScene();
threeDefineFog();
threeDefineVec3();
threeDefineMaterial();
threeDefineMaterial('three-material-ball', [], [{
    type: ogodFactoryInstanceProperty('MeshPhong'),
    args: {
        get: () => ([{ color: 0xF4A259 }]),
        connect: (host, key) => {
            host.state[key] = host[key];
            return () => null;
        }
    }
}]);
threeDefineGeometry();
threeDefineMesh();
threeDefineMesh('ngo-color-plane', [], [{ runtime: 'color-plane' }]);
threeDefineMesh('ngo-stars', [], [{ runtime: 'stars' }]);
threeDefinePoints('three-points', [], [{
    params: {
        get: () => ({
            color: 0xff0000,
            transparent: true,
            depthTest: false
        }),
        connect: (host, key) => {
            host.state[key] = host[key];
            return () => null;
        }
    }
}]);
threeDefineObject();
threeDefineLightAmbient();
threeDefineLightPoint();
threeDefineLightSpot();
threeDefineLightHemisphere();
ogodDefineKey();
ogodDefineKeys();
threeDefineControlFly();
ogodDefineSystem('three-knowledge-base', [{
    root: ogodFactorySystemProperty(''),
    position: ogodFactorySystemChildren('vec3', false)
}], [{ runtime: 'knowledge-base' }]);
threeDefineBubble();

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
