
import { instanceChanges, instanceDestroy, instanceInit, instanceStart, OgodActionActor, OgodActionInstance, OgodStateEngine, OgodStateInstance, OGOD_CATEGORY } from '@ogod/common';
import { ogodContainerUpdateGroup$, ogodReactiveUpdate, OgodRuntimeEngine } from '@ogod/runtime-core';
import { ThreeRuntimeGroup, ThreeStateMesh } from '@ogod/runtime-three';
import { ActionsObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { Vector3 } from 'three';

declare var self: OgodRuntimeEngine;

export class ThreeRuntimeKnowledgeBase extends ThreeRuntimeGroup {

    initialize(state: any, state$: Observable<OgodStateEngine>, action$: ActionsObservable<any>): Observable<OgodActionInstance> {
        return state$.pipe(
            map((s) => s.instance[state.id] as any),
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

    start(state: any, state$: Observable<OgodStateEngine>): OgodActionActor<OgodStateInstance> {
        console.log('[GROUP] Start custom', state.id);
        state.running = true;
        state.sub$['ogodContainerUpdate'] = ogodContainerUpdateGroup$(state, state$).subscribe(({ added, removed }) => {
            added.forEach((instance: any) => {
                this.add(state, instance);
                if (instance.bubble) {
                    state.graph.points.push(this.createPoint(instance.bubble.id));
                }
            });
            removed.forEach((id) => {
                const instance = self.store.getState().instance[id] as any;
                this.remove(state, id, instance);
                if (instance.bubble) {
                    state.graph.points.splice(state.graph.points.findIndex((p) => p.id === instance.bubble.id), 1);
                }
            });
            this.updateGraph(state);
        });
        state.sub$['ogodReactiveUpdate'] = ogodReactiveUpdate(this, state);
        return instanceStart({
            id: state.id,
            state
        });
    }

    destroy(state: any, state$: Observable<OgodStateEngine>) {
        state.graph?.points.forEach((p) => self.store.dispatch(instanceDestroy({
            id: 'bubble-' + p.id
        })));
        state.graph?.links.forEach((l) => self.store.dispatch(instanceDestroy({
            id: l.id
        })));
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
            this.setPointPosition(state, state.graph.root);
            this.setPointSize(state, state.graph.root);
            this.updateBubble('bubble-' + state.root, state.graph.root);
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
                updates.forEach((point) => {
                    this.setPointPosition(state, point);
                    this.setPointSize(state, point);
                    this.updateBubble('bubble-' + point.id, point);
                });
                this.setPointSize(state, state.graph.root);
                this.setPointPosition(state, state.graph.root);
                this.updateBubble('bubble-' + state.root, state.graph.root);
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
                            groups: ['ogod-instance-knowledge-base'],
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

    protected updateBubble(id, point) {
        self.store.dispatch(instanceChanges({
            id,
            changes: {
                size: point.size,
                position: point.position
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

    protected setPointSize(state, point) {
        point.size = ((state.graph.maxLevel + 1 - point.level) + point.children.length) * 1.5;
    }

    protected setPointPosition(state, point) {
        const space = 20;
        if (point.level === 0) {
            point.position = new Vector3();
        } else {
            const index = point.parent.children.findIndex((p) => p.id === point.id);
            const pair = index % 2 === 0;
            const zpair = point.level % 2 === 0;
            const pos = (index + 1) * space;
            point.position = {
                x: point.parent.position.x + (pair ? pos : (zpair ? 0 : -pos)),
                y: point.level * space,
                z: point.parent.position.z + (pair ? (zpair ? -pos : 0) : pos)
            };
            console.log('POINT %s POS:', point.id, point.position, point.parent.position);
        }
    }
}
