import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { ogodDefineKey, ogodDefineKeys, ogodDefineResource, ogodDefineSystem, ogodFactoryInstanceArrayString, ogodFactoryInstanceBoolean, ogodFactoryInstanceChildren, ogodFactoryInstanceProperty, ogodFactoryParent, ogodFactorySystemChildren, ogodFactorySystemProperty } from '@ogod/element-core';
import {
    threeDefineCamera, threeDefineControlFly, threeDefineEngine, threeDefineGeometry, threeDefineLightAmbient,
    threeDefineLightPoint, threeDefineLightSpot, threeDefineMaterial, threeDefineMesh, threeDefinePoints, threeDefineRenderer,
    threeDefineScene, threeDefineTexture, threeDefineVec3, threeDefineObject, threeDefineLightHemisphere, threeDefineFog, threeDefineGroup
} from '@ogod/element-three';
import { threeDefineBubble } from './app/bubble/define';
import { property, dispatch } from 'hybrids';

const actionHybrid = (action: string = 'default') => ({ action: ogodFactoryInstanceProperty(action) });

threeDefineEngine(undefined, [], [{
    physiWorker: {
        get: (host) => null,
        connect: ({ worker }, key, invalidate) => {
            const messageListener = (evt) => {
                if (evt.data.type === 'PHYSI_WORKER_CREATE') {
                    const channel = new MessageChannel();
                    const physi = new Worker('./assets/worker.worker.js');
                    physi.postMessage({ type: 'PHYSI_WORKER_PORT'}, [ channel.port1 ]);
                    worker.postMessage({ type: 'PHYSI_WORKER_PORT'}, [ channel.port2 ]);
                }
            };
            worker.addEventListener('message', messageListener);
            return () => worker.removeEventListener('message', messageListener);
        }
    }
}]);
threeDefineRenderer();
threeDefineCamera();
threeDefineTexture();
threeDefineScene(undefined, [], [{ runtime: 'physi' }]);
threeDefineFog();
threeDefineVec3();
threeDefineMaterial();
threeDefineMaterial('three-material-ball', [{
    color: property('#F4A259', (host, key) => {
        if (host.hasAttribute(key)) {
            host[key] = host.getAttribute(key);
        }
    })
}], [{
    type: ogodFactoryInstanceProperty('MeshPhong'),
    args: {
        get: (host) => ([{ color: host.color }]),
        connect: (host, key) => {
            host.state[key] = host[key];
            return () => null;
        }
    }
}]);
threeDefineGeometry();
threeDefineMesh();
threeDefineMesh('ngo-interact-cube', [{
    ...actionHybrid(),
    glow: ogodFactoryInstanceBoolean(false)
}], [{
    runtime: 'glow-cube',
    updates: ogodFactoryInstanceArrayString(['glow']),
    watches: ogodFactoryInstanceArrayString(['glow'])
}]);
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
ogodDefineSystem(undefined, [{
    keys: ogodFactoryInstanceChildren('keys', false, undefined, (host, value, last) => {
        const pressed = value[0].state.values.find((key) => key.name === 'interact')?.pressed;
        if (pressed && host.action) {
            dispatch(host, host.action);
        }
    }),
    action: ogodFactorySystemProperty(''),
    scene: ogodFactoryParent('scene'),
    sceneId: ({ scene }) => scene.id
}], [{ runtime: 'actions' }], ['sceneId']);
ogodDefineSystem('voxel-world', [{
    resource: ogodFactorySystemProperty('voxel'),
    cellSize: ogodFactorySystemProperty(32),
    tileSize: ogodFactorySystemProperty(16),
    tileTextureWidth: ogodFactorySystemProperty(256),
    tileTextureHeight: ogodFactorySystemProperty(64),
    tileScale: ogodFactorySystemProperty(32),
    noiseScale: ogodFactorySystemProperty(35),
    heightScale: ogodFactorySystemProperty(3),
    baseAltitude: ogodFactorySystemProperty(2)
}], [{ runtime: 'voxel-world' }]);
ogodDefineResource('three-shader-glow', [{
    scene: ogodFactoryParent('scene'),
    sceneId: ({ scene }) => scene.id
}], [{ runtime: 'shader-glow' }], ['sceneId']);
ogodDefineResource('voxel-resource', [], [{ runtime: 'voxel' }]);
ogodDefineKey();
ogodDefineKeys();
threeDefineControlFly();
threeDefineGroup('three-knowledge-base', [{
    root: ogodFactoryInstanceProperty('')
}], [{ runtime: 'knowledge-base' }]);
threeDefineBubble();

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
