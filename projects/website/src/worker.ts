// FIXME: Interop compatibility if rxjs loaded multiple times.
if (typeof Symbol === 'function') {
    if (!Symbol.observable) {
        (Symbol as any).observable = Symbol('observable');
    }
}
import { instanceChanges, instanceDestroy, instanceInit, OgodActionSystem, OgodStateEngine, OgodStateSystem, OGOD_CATEGORY, systemStart } from '@ogod/common';
import { ogodContainerUpdate$, OgodDefaultRegistry, ogodReactiveUpdate, OgodRuntimeEngine, OgodRuntimeSystemDefault } from '@ogod/runtime-core';
import { OgodThreeRegistry, threeCreateGeometry, threeCreateMaterial, ThreeRuntimeInstance, ThreeRuntimeMesh, ThreeRuntimePoints, ThreeStateMesh, ThreeStateScene, threeWorkerStream } from '@ogod/runtime-three';
import { ActionsObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { filter, first, map, pluck, switchMap } from 'rxjs/operators';
import { BoxBufferGeometry, BufferGeometry, Color, Float32BufferAttribute, Group, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshPhongMaterial, PerspectiveCamera, PlaneBufferGeometry, Points, PointsMaterial, SphereBufferGeometry, Vector3 } from 'three';

declare var self: OgodRuntimeEngine;

self.debugMode = true;
self.onmessage = threeWorkerStream({
    ...OgodDefaultRegistry,
    ...OgodThreeRegistry,
    'geometry.BoxBuffer': BoxBufferGeometry,
    'geometry.SphereBuffer': SphereBufferGeometry,
    'geometry.BasicBuffer': BufferGeometry,
    'geometry.PlaneBuffer': PlaneBufferGeometry,
    'material.MeshBasic': MeshBasicMaterial,
    'material.MeshPhong': MeshPhongMaterial,
    'material.LineBasic': LineBasicMaterial,
    'instance.color-plane': class ThreeRuntimeColorPlane extends ThreeRuntimeInstance {

        initialize(state: ThreeStateMesh) {
            const mat = threeCreateMaterial(state.material);
            mat.vertexColors = true;
            let geo = threeCreateGeometry(state.geometry);
            let position = geo.attributes.position;
            const color = new Color();
            const vertex = new Vector3();
            for (let i = 0, l = position.count; i < l; i++) {
                vertex.fromBufferAttribute(position, i);
                vertex.x += Math.random() * 20 - 10;
                vertex.y += Math.random() * 2;
                position.setXYZ(i, vertex.x, vertex.y, vertex.z);
            }
            geo = geo.toNonIndexed(); // ensure each face has unique vertices
            position = geo.attributes.position;
            const colorsFloor = [];
            for (let i = 0, l = position.count; i < l; i++) {
                color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
                colorsFloor.push(color.r, color.g, color.b);
            }
            geo.setAttribute('color', new Float32BufferAttribute(colorsFloor, 3));
            state.object$ = new Mesh(geo, mat) as any;
            return this.initializeSuccess(state);
        }
    },
    'instance.stars': class ThreeRuntimeStars extends ThreeRuntimePoints {

        initialize(state, state$, action$) {
            state.object$ = new Group();

            const r = 6371, starsGeometry = [new BufferGeometry(), new BufferGeometry()];
            const vertices1 = [];
            const vertices2 = [];
            const vertex = new Vector3();
            for (let i = 0; i < 250; i++) {
                vertex.x = Math.random() * 2 - 1;
                vertex.y = Math.random() * 2 - 1;
                vertex.z = Math.random() * 2 - 1;
                vertex.multiplyScalar(r);
                vertices1.push(vertex.x, vertex.y, vertex.z);
            }
            for (let i = 0; i < 1500; i++) {
                vertex.x = Math.random() * 2 - 1;
                vertex.y = Math.random() * 2 - 1;
                vertex.z = Math.random() * 2 - 1;
                vertex.multiplyScalar(r);
                vertices2.push(vertex.x, vertex.y, vertex.z);
            }
            starsGeometry[0].setAttribute('position', new Float32BufferAttribute(vertices1, 3));
            starsGeometry[1].setAttribute('position', new Float32BufferAttribute(vertices2, 3));

            const starsMaterials = [
                new PointsMaterial({ color: 0x555555, size: 2, sizeAttenuation: false }),
                new PointsMaterial({ color: 0x555555, size: 1, sizeAttenuation: false }),
                new PointsMaterial({ color: 0x333333, size: 2, sizeAttenuation: false }),
                new PointsMaterial({ color: 0x3a3a3a, size: 1, sizeAttenuation: false }),
                new PointsMaterial({ color: 0x1a1a1a, size: 2, sizeAttenuation: false }),
                new PointsMaterial({ color: 0x1a1a1a, size: 1, sizeAttenuation: false })
            ];
            for (let i = 10; i < 30; i++) {
                const stars = new Points(starsGeometry[i % 2], starsMaterials[i % 6]);
                stars.rotation.x = Math.random() * 6;
                stars.rotation.y = Math.random() * 6;
                stars.rotation.z = Math.random() * 6;
                stars.scale.setScalar(i * 10);
                stars.matrixAutoUpdate = false;
                stars.updateMatrix();
                state.object$.add(stars);
            }
            return this.initializeSuccess(state);
        }
    },
    'instance.bubble': class ThreeRuntimeBubble extends ThreeRuntimeMesh {
        camera$: PerspectiveCamera;

        initialize(state: ThreeStateMesh, state$: Observable<OgodStateEngine>, action$: ActionsObservable<any>) {
            state$.pipe(
                map((s) => s.scene[state.scenes[0]] as ThreeStateScene),
                filter((s) => !!s?.camera$),
                pluck('camera$'),
                first()
            ).subscribe((camera$) => this.camera$ = camera$);
            return state$.pipe(
                map((s: any) => s.instance[state.id]),
                filter((s: any) => s.size && s.position),
                first(),
                switchMap((s: any) => super.initialize({
                    ...s,
                    geometry: {
                        ...s.geometry,
                        args: [s.size, s.geometry.args[1], s.geometry.args[2]]
                    }
                }, state$, action$))
            );
        }

        changes(changes, state) {
            if (state.loaded) {
                if (changes.size) {
                    state.object$.geometry.dispose();
                    state.object$.geometry = new SphereBufferGeometry(changes.size, state.geometry.args[1], state.geometry.args[2]);
                }
                return super.changes(changes, state);
            } else {
                return this.changesSuccess(changes, state);
            }
        }

        update(delta: number, state: ThreeStateMesh) {
            // if (this.camera$) {
            //     let pos = state.object$.position.clone();
            //     this.camera$.updateMatrixWorld();
            //     pos.project(this.camera$ as any);
            //     if (pos.x <= 1 && pos.y >= -1) {
            //         console.log(state.id + ' visible!',pos.x, pos.y)
            //         pos.x = (pos.x + 1) * self.canvas.width / 2;
            //         pos.y = - (pos.y - 1) * self.canvas.height / 2;
            //         pos.z = 0;
            //         (state as any).textPosition = pos.clone();
            //     } else {
            //         (state as any).textPosition = null;
            //     }
            // }
        }
    },
    'instance.link': class ThreeRuntimeLink extends ThreeRuntimeMesh {
        initialize(state, state$, action$) {
            const geo = new BufferGeometry().setFromPoints(state.geometry);
            const mat = threeCreateMaterial(state.material);
            state.object$ = new Line(geo, mat);
            return super.initializeSuccess(state);
        }
    },
    'system.knowledge-base': class ThreeRuntimeKnowledgeBase extends OgodRuntimeSystemDefault {

        initialize(state: any, state$: Observable<OgodStateEngine>, action$: ActionsObservable<any>): Observable<OgodActionSystem> {
            return state$.pipe(
                map((s) => s.system[state.id] as any),
                filter((s) => !!s.root),
                first(),
                switchMap((s) => super.initialize({
                    ...s,
                    graph: {
                        links: [],
                        points: [],
                        maxLevel: 0
                    }
                }, state$ as any, action$))
            );
        }

        start(state, state$) {
            console.log('[SYSTEM] Start custom', state.id);
            state.running = true;
            if (state.aspects) {
                state.sub$['ogodContainerUpdate'] = ogodContainerUpdate$(this, state, state$ as any).subscribe(({ added, removed }) => {
                    added.forEach((instance: any) => {
                        this.add(state, instance);
                        state.graph.points.push(this.createPoint(instance.bubble.id));
                    });
                    removed.forEach((id) => {
                        const instance: any = self.store.getState().instance[id];
                        this.remove(state, id, instance);
                        state.graph.points.splice(state.graph.points.findIndex((p) => p.id === instance.bubble.id), 1);
                    });
                    this.updateGraph(state);
                });
            }
            state.sub$['ogodReactiveUpdate'] = ogodReactiveUpdate(this as any, state);
            return systemStart({ id: state.id, state });
        }

        destroy(state: any, state$: Observable<OgodStateEngine>) {
            state.graph?.points.forEach((p) => self.store.dispatch(instanceDestroy({
                id: 'bubble-' + p.id
            })));
            state.graph?.links.forEach((l) => self.store.dispatch(instanceDestroy({
                id: l.id
            })));
            console.log('DESTROY SYS')
            return super.destroy(state, state$);
        }

        protected createPoint(id: string) {
            return {
                id,
                parent: null,
                children: [],
                links: [],
                pending: true
            };
        }

        protected updateGraph(state) {
            const instances = self.store.getState().instance;
            if (!state.graph.root) {
                state.graph.root = state.graph.points.find((p) => p.id === state.root);
                state.graph.root.level = 0;
                state.graph.root.pending = false;
                this.updateBubble('bubble-' + state.root, this.getPointSize(state, state.graph.root), this.getPointPosition(state, state.graph.root));
            }
            if (state.graph.root) {
                const updates = [];
                let pendings = state.graph.points.filter((p) => p.pending);
                let safe = 100;
                while (pendings.length && safe) {
                    pendings.forEach((p) => {
                        const id = 'bubble-' + p.id;
                        const bubble = (instances[id] as any).bubble;
                        let current = state.graph.root;
                        if (this.recursivePlaceInGraph(current, p, bubble)) {
                            if (state.graph.maxLevel < p.level) {
                                state.graph.maxLevel = p.level;
                            }
                            updates.push(p);
                        } else {
                            console.warn('Knowledge base cannot handle bubble:', bubble);
                        }
                    });
                    pendings = state.graph.points.filter((p) => p.pending);
                    --safe
                }
                if (!safe) {
                    console.log('failsafe used')
                } else {
                    updates.forEach((point) => this.updateBubble('bubble-' + point.id, this.getPointSize(state, point), this.getPointPosition(state, point)));
                    this.updateBubble('bubble-' + state.root, this.getPointSize(state, state.graph.root), this.getPointPosition(state, state.graph.root));
                    this.updateLinks(state);
                }
            }
        }

        protected updateLinks(state) {
            const instances = self.store.getState().instance;
            state.graph.points.forEach((point) => {
                const bubbleParent = instances['bubble-' + point.id] as ThreeStateMesh;
                point.children.forEach((p) => {
                    const bubble = instances['bubble-' + p.id] as ThreeStateMesh;
                    const linkId = 'link-' + point.id + '-' + p.id;
                    // FIXME: Search in point links instead of all.
                    const linkIndex = state.graph.links.findIndex((l) => l.id === linkId);
                    if (linkIndex >= 0) {
                        // Update
                    } else {
                        // Create
                        const link = {
                            id: linkId,
                            points: [point, p]
                        };
                        state.graph.links.push(link);
                        point.links.push(link);
                        p.links.push(link);
                        self.store.dispatch(instanceInit({
                            id: linkId,
                            state: {
                                active: true,
                                category: OGOD_CATEGORY.INSTANCE,
                                runtime: 'link',
                                id: linkId,
                                scenes: ['ogod-scene-default'],
                                tick: false,
                                reflects: [],
                                updates: [],
                                watches: [],
                                geometry: [
                                    new Vector3(bubbleParent.position.x, bubbleParent.position.y, bubbleParent.position.z),
                                    new Vector3(bubble.position.x, bubble.position.y, bubble.position.z),
                                ],
                                material: {
                                    type: 'LineBasic',
                                    args: [{
                                        color: 0xDB2B39,
                                        linewidth: 3
                                    }]
                                }
                            } as any
                        }));
                    }
                });
            });
        }

        protected updateBubble(id, size, position) {
            self.store.dispatch(instanceChanges({
                id,
                changes: {
                    size,
                    position
                } as any
            }));
        }

        protected recursivePlaceInGraph(root, point, bubble) {
            if (bubble.tags.includes(root.id)) {
                point.parent = root;
                root.children.push(point);
                point.pending = false;
                point.level = 1;
                let parent = root.parent;
                while (parent) {
                    ++point.level;
                    parent = parent.parent;
                }
                // console.log('FOUND for %s : ', bubble.id, root.id);
                return true;
            } else if (root.children) {
                for (let child of root.children) {
                    if (this.recursivePlaceInGraph(child, point, bubble)) {
                        return true;
                    }
                }
            }
        }

        protected getPointSize(state, point) {
            return ((state.graph.maxLevel + 1 - point.level) + point.children.length) * 1.5;
        }

        protected getPointPosition(state, point) {
            const space = 20;
            if (point.level === 0) {
                return state.position;
            } else {
                const index = point.parent.children.findIndex((p) => p.id === point.id);
                const pair = index % 2 === 0;
                return {
                    x: pair ? state.position.x + (index + 1) * space : state.position.x,
                    y: state.position.y + point.level * space,
                    z: pair ? state.position.z : state.position.z + (index + 1) * 8
                }
            }
        }
    }
}, '/');
