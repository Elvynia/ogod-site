import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { ogodDefineKey, ogodDefineKeys, ogodFactoryInstanceProperty } from '@ogod/element-core';
import {
    threeDefineCamera, threeDefineControlFly, threeDefineEngine, threeDefineGeometry, threeDefineLightAmbient,
    threeDefineLightPoint, threeDefineLightSpot, threeDefineMaterial, threeDefineMesh, threeDefinePoints, threeDefineRenderer,
    threeDefineScene, threeDefineTexture, threeDefineVec3, threeDefineObject, threeDefineLightHemisphere, threeDefineFog
} from '@ogod/element-three';

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
threeDefineMesh('ngo-color-plane', [], [{ runtime: 'ColorPlane' }]);
threeDefineMesh('ngo-stars', [], [{ runtime: 'Stars' }]);
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

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
