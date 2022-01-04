import { ShaderMaterial, Color, FrontSide, AdditiveBlending } from 'three';
import { OgodRuntimeResourceDefault } from "@ogod/runtime-core";
import { Observable } from 'rxjs';
import { ThreeRuntimeEngine, ThreeStateEngine } from '@ogod/runtime-three';
import { filter, first, map, pluck, startWith, switchMap, tap } from 'rxjs/operators';

export const SHADER_FRAGMENT = `uniform vec3 glowColor;
varying float intensity;
void main()
{
	vec3 glow = glowColor * intensity;
    gl_FragColor = vec4( glow, 1.0 );
}`;
export const SHADER_VERTEX = `uniform vec3 viewVector;
uniform float c;
uniform float p;
varying float intensity;
void main()
{
    vec3 vNormal = normalize( normalMatrix * normal );
	vec3 vNormel = normalize( normalMatrix * viewVector );
	intensity = pow( c - dot(vNormal, vNormel), p );

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

declare var self: ThreeRuntimeEngine;

export class ThreeRuntimeShaderGlow extends OgodRuntimeResourceDefault {

    initialize(state, state$: Observable<ThreeStateEngine>) {
        return state$.pipe(
            filter((s) => s.scene[state.sceneId]?.loaded),
            first(),
            map((s) => s.scene[state.sceneId]),
            pluck('camera$'),
            switchMap((camera: any) => {
                state.data$ = new ShaderMaterial({
                    uniforms: {
                        "c": { type: "f", value: 1.0 },
                        "p": { type: "f", value: 1.4 },
                        glowColor: { type: "c", value: new Color(0xdddd00) },
                        viewVector: { type: "v3", value: camera.position }
                    },
                    vertexShader: SHADER_VERTEX,
                    fragmentShader: SHADER_FRAGMENT,
                    side: FrontSide,
                    blending: AdditiveBlending,
                    transparent: true
                });
                return super.initialize(state, state$);
            })
        )
    }
}
