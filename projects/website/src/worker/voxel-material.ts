import { OgodRuntimeResourceDefault } from '@ogod/runtime-core';
import { ThreeRuntimeEngine, ThreeStateEngine } from '@ogod/runtime-three';
import { Observable, from } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { CanvasTexture, DoubleSide, ImageBitmapLoader, MeshLambertMaterial, NearestFilter } from 'three';

declare var self: ThreeRuntimeEngine;

export class ThreeRuntimeVoxelMaterial extends OgodRuntimeResourceDefault {

    initialize(state, state$: Observable<ThreeStateEngine>) {
        const loader = new ImageBitmapLoader();
        return from(loader.loadAsync((self.baseHref + state.path).replace(/\/\//g, '/'))).pipe(
            map((image) => {
                const texture = new CanvasTexture(image);
                texture.magFilter = NearestFilter;
                texture.minFilter = NearestFilter;
                return texture;
            }),
            map((texture) => new MeshLambertMaterial({
                map: texture,
                // side: DoubleSide,
                alphaTest: 0.1,
                transparent: true,
            })),
            switchMap((material) => super.initialize({
                ...state,
                data$: material
            }, state$))
        );
    }
}
