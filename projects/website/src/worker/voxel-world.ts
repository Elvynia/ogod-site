import { OgodStateSystem, sceneInitSuccess } from '@ogod/common';
import { OgodRuntimeSystemDefault } from '@ogod/runtime-core';
import { ThreeStateEngine } from '@ogod/runtime-three';
import { BoxMesh, ConvexMesh } from 'physijs';
import { ActionsObservable, ofType } from 'redux-observable';
import { forkJoin, Observable } from 'rxjs';
import { filter, first, map, pluck, switchMap } from 'rxjs/operators';
import { BoxGeometry, BufferAttribute, BufferGeometry, MathUtils, MeshBasicMaterial, MeshLambertMaterial, MeshToonMaterial, Scene, Vector3 } from 'three';
import { SimplexNoise } from './perlin-noise-simplex';
import { NEIGHBOR_OFFSETS, VOXEL_FACES } from './voxel-world-constants';

export interface ThreeStateVoxelWorld extends OgodStateSystem {
    resource: string;
    cellSize: number;
    tileSize: number;
    tileTextureWidth: number;
    tileTextureHeight: number;
    tileScale: number;
    heightScale: number;
    cells: any;
    noiseScale: number;
    baseAltitude: number;
    material$: MeshLambertMaterial;
    scene$: Scene;
    perlin$: any;
}

function* generateMap(state, world) {
    const size = 1;
    for (let i = 0; i < size / 2; ++i) {
        for (let j = 0; j < size / 2; ++j) {
            world.generateCell(state, i, 0, j);
            yield;
        }
    }
}

export class ThreeRuntimeVoxelWorld extends OgodRuntimeSystemDefault {
    cellIdToMesh: any;
    generator: Generator;
    next: any;
    addReady: boolean;

    initialize(state: ThreeStateVoxelWorld, state$: Observable<ThreeStateEngine>, action$: ActionsObservable<any>) {
        this.cellIdToMesh = {};
        this.addReady = true;
        return forkJoin([
            state$.pipe(
                filter((s) => s.resource[state.resource]?.loaded),
                first(),
                map((s) => s.resource[state.resource]),
                pluck('data$')),
            action$.pipe(
                ofType(sceneInitSuccess.type),
                first(),
                map(({ state: sceneState }) => sceneState.scene$)
            )]).pipe(
                switchMap(([material$, scene$]) => {
                    const initState = {
                        ...state,
                        cells: {},
                        material$,
                        scene$,
                        perlin$: new SimplexNoise()
                    } as ThreeStateVoxelWorld;
                    this.generator = generateMap(initState, this);
                    return super.initialize(initState, state$, action$);
                })
            );
    }

    update(delta, state) {
        if (this.addReady && (!this.next || !this.next.done)) {
            this.addReady = false;
            this.next = this.generator.next();
        }
    }

    changes(changes: Partial<ThreeStateVoxelWorld>, state: ThreeStateVoxelWorld) {
        if (changes.tileScale && state.cells) {
            // Object.keys(state.cells).forEach((key: any) => {
            //     const mesh = this.cellIdToMesh[key];
            //     mesh.scale.set(changes.tileScale, changes.tileScale, changes.tileScale);
            //     const cellPos = mesh.name.split(',').map((p) => parseInt(p));
            //     mesh.position.set(cellPos[0] * state.cellSize * changes.tileScale, cellPos[1] * state.cellSize * changes.tileScale,
            //         cellPos[2] * state.cellSize * changes.tileScale);
            //     mesh.__dirtyPosition = true;
            // });
        }
        return super.changes(changes, state);
    }

    generateCell(state: ThreeStateVoxelWorld, cellX: number, cellY: number, cellZ: number) {
        const cellSize = state.cellSize;
        const maxZ = (cellZ + 1) * cellSize;
        const maxX = (cellX + 1) * cellSize;
        for (let z = cellZ * cellSize; z < maxZ; ++z) {
            for (let x = cellX * cellSize; x < maxX; ++x) {
                const n = state.perlin$.noise(x / state.noiseScale, z / state.noiseScale) + state.baseAltitude;
                const height = Math.floor(n * state.heightScale) + cellY * cellSize;
                for (let y = cellY * cellSize; y < height; ++y) {
                    this.setVoxel(state, x, y, z, 3); //this.randInt(1, 17));
                }
            }
        }
        this.updateVoxelGeometry(state, cellX * cellSize + 1, cellY * cellSize + 1, cellZ * cellSize + 1);
    }

    computeVoxelOffset(cellSize: number, x: number, y: number, z: number) {
        const voxelX = MathUtils.euclideanModulo(x, cellSize) | 0;
        const voxelY = MathUtils.euclideanModulo(y, cellSize) | 0;
        const voxelZ = MathUtils.euclideanModulo(z, cellSize) | 0;
        return voxelY * cellSize * cellSize +
            voxelZ * cellSize +
            voxelX;
    }

    computeCellId(cellSize: number, x: number, y: number, z: number) {
        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        const cellZ = Math.floor(z / cellSize);
        return `${cellX},${cellY},${cellZ}`;
    }

    addCellForVoxel(state: ThreeStateVoxelWorld, x: number, y: number, z: number) {
        const cellId = this.computeCellId(state.cellSize, x, y, z);
        let cell = state.cells[cellId];
        if (!cell) {
            cell = new Uint8Array(state.cellSize * state.cellSize * state.cellSize);
            state.cells[cellId] = cell;
        }
        return cell;
    }

    getCellForVoxel(state: ThreeStateVoxelWorld, x: number, y: number, z: number) {
        return state.cells[this.computeCellId(state.cellSize, x, y, z)];
    }

    getVoxel(state: ThreeStateVoxelWorld, x: number, y: number, z: number) {
        const cell = this.getCellForVoxel(state, x, y, z);
        if (!cell) {
            return 0;
        }
        const voxelOffset = this.computeVoxelOffset(state.cellSize, x, y, z);
        return cell[voxelOffset];
    }

    setVoxel(state: ThreeStateVoxelWorld, x: number, y: number, z: number, v: number, addCell = true) {
        let cell = this.getCellForVoxel(state, x, y, z);
        if (!cell) {
            if (!addCell) {
                return;
            }
            cell = this.addCellForVoxel(state, x, y, z);
        }
        const voxelOffset = this.computeVoxelOffset(state.cellSize, x, y, z);
        cell[voxelOffset] = v;
    }

    generateGeometryDataForCell(state: ThreeStateVoxelWorld, cellX: number, cellY: number, cellZ: number) {
        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];
        const startX = cellX * state.cellSize;
        const startY = cellY * state.cellSize;
        const startZ = cellZ * state.cellSize;

        for (let y = 0; y < state.cellSize; ++y) {
            const voxelY = startY + y;
            for (let z = 0; z < state.cellSize; ++z) {
                const voxelZ = startZ + z;
                for (let x = 0; x < state.cellSize; ++x) {
                    const voxelX = startX + x;
                    const voxel = this.getVoxel(state, voxelX, voxelY, voxelZ);
                    if (voxel) {
                        // voxel 0 is sky (empty) so for UVs we start at 0
                        const uvVoxel = voxel - 1;
                        // There is a voxel here but do we need faces for it?
                        for (const { dir, corners, uvRow } of VOXEL_FACES) {
                            const neighbor = this.getVoxel(state,
                                voxelX + dir[0],
                                voxelY + dir[1],
                                voxelZ + dir[2]);
                            if (!neighbor) {
                                // this voxel has no neighbor in this direction so we need a face.
                                const ndx = positions.length / 3;
                                for (const { pos, uv } of corners) {
                                    positions.push(pos[0] + x, pos[1] + y, pos[2] + z);
                                    normals.push(...dir);
                                    uvs.push(
                                        (uvVoxel + uv[0]) * state.tileSize / state.tileTextureWidth,
                                        (1 - (uvRow + 1 - uv[1])) * state.tileSize / state.tileTextureHeight);
                                }
                                indices.push(
                                    ndx, ndx + 1, ndx + 2,
                                    ndx + 2, ndx + 1, ndx + 3,
                                );
                            }
                        }
                    }
                }
            }
        }
        return {
            positions,
            normals,
            uvs,
            indices,
        };
    }

    // from
    // http://www.cse.chalmers.se/edu/year/2010/course/TDA361/grid.pdf
    intersectRay(state: ThreeStateVoxelWorld, start: Vector3, end: Vector3) {
        let dx = end.x - start.x;
        let dy = end.y - start.y;
        let dz = end.z - start.z;
        const lenSq = dx * dx + dy * dy + dz * dz;
        const len = Math.sqrt(lenSq);

        dx /= len;
        dy /= len;
        dz /= len;

        let t = 0.0;
        let ix = Math.floor(start.x);
        let iy = Math.floor(start.y);
        let iz = Math.floor(start.z);

        const stepX = (dx > 0) ? 1 : -1;
        const stepY = (dy > 0) ? 1 : -1;
        const stepZ = (dz > 0) ? 1 : -1;

        const txDelta = Math.abs(1 / dx);
        const tyDelta = Math.abs(1 / dy);
        const tzDelta = Math.abs(1 / dz);

        const xDist = (stepX > 0) ? (ix + 1 - start.x) : (start.x - ix);
        const yDist = (stepY > 0) ? (iy + 1 - start.y) : (start.y - iy);
        const zDist = (stepZ > 0) ? (iz + 1 - start.z) : (start.z - iz);

        // location of nearest voxel boundary, in units of t
        let txMax = (txDelta < Infinity) ? txDelta * xDist : Infinity;
        let tyMax = (tyDelta < Infinity) ? tyDelta * yDist : Infinity;
        let tzMax = (tzDelta < Infinity) ? tzDelta * zDist : Infinity;

        let steppedIndex = -1;

        // main loop along raycast vector
        while (t <= len) {
            const voxel = this.getVoxel(state, ix, iy, iz);
            if (voxel) {
                return {
                    position: [
                        start.x + t * dx,
                        start.y + t * dy,
                        start.z + t * dz,
                    ],
                    normal: [
                        steppedIndex === 0 ? -stepX : 0,
                        steppedIndex === 1 ? -stepY : 0,
                        steppedIndex === 2 ? -stepZ : 0,
                    ],
                    voxel,
                };
            }

            // advance t to next nearest voxel boundary
            if (txMax < tyMax) {
                if (txMax < tzMax) {
                    ix += stepX;
                    t = txMax;
                    txMax += txDelta;
                    steppedIndex = 0;
                } else {
                    iz += stepZ;
                    t = tzMax;
                    tzMax += tzDelta;
                    steppedIndex = 2;
                }
            } else {
                if (tyMax < tzMax) {
                    iy += stepY;
                    t = tyMax;
                    tyMax += tyDelta;
                    steppedIndex = 1;
                } else {
                    iz += stepZ;
                    t = tzMax;
                    tzMax += tzDelta;
                    steppedIndex = 2;
                }
            }
        }
        return null;
    }

    updateCellGeometry(state: ThreeStateVoxelWorld, x: number, y: number, z: number) {
        const cellX = Math.floor(x / state.cellSize);
        const cellY = Math.floor(y / state.cellSize);
        const cellZ = Math.floor(z / state.cellSize);
        const cellId = this.computeCellId(state.cellSize, x, y, z);
        const { positions, normals, uvs, indices } = this.generateGeometryDataForCell(state, cellX, cellY, cellZ);
        let mesh = this.cellIdToMesh[cellId];
        const geometry: BufferGeometry = mesh?.geometry || new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
        geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
        geometry.setIndex(indices);
        geometry.scale(state.tileScale, state.tileScale, state.tileScale);
        geometry.computeBoundingSphere();
        if (!mesh) {
            mesh = new ConvexMesh(geometry as any, state.material$ as any, 0);
            mesh.addEventListener('ready', (event) => this.addReady = true);
            mesh.name = cellId;
            mesh.position.set(cellX * state.cellSize * state.tileScale, cellY * state.cellSize * state.tileScale, cellZ * state.cellSize * state.tileScale);
            state.scene$.add(mesh);
            this.cellIdToMesh[cellId] = mesh;
        }
    }

    updateVoxelGeometry(state: ThreeStateVoxelWorld, x: number, y: number, z: number) {
        const updatedCellIds = {};
        for (const offset of NEIGHBOR_OFFSETS) {
            const ox = x + offset[0];
            const oy = y + offset[1];
            const oz = z + offset[2];
            const cellId = this.computeCellId(state.cellSize, ox, oy, oz);
            if (!updatedCellIds[cellId]) {
                updatedCellIds[cellId] = true;
                this.updateCellGeometry(state, ox, oy, oz);
            }
        }
    }

    randInt(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    // placeVoxel(event) {
    //     const pos = getCanvasRelativePosition(event);
    //     const x = (pos.x / canvas.clientWidth) * 2 - 1;
    //     const y = (pos.y / canvas.clientHeight) * -2 + 1;  // note we flip Y

    //     const start = new THREE.Vector3();
    //     const end = new THREE.Vector3();
    //     start.setFromMatrixPosition(camera.matrixWorld);
    //     end.set(x, y, 1).unproject(camera);

    //     const intersection = world.intersectRay(start, end);
    //     if (intersection) {
    //         const voxelId = event.shiftKey ? 0 : currentVoxel;
    //         // the intersection point is on the face. That means
    //         // the math imprecision could put us on either side of the face.
    //         // so go half a normal into the voxel if removing (currentVoxel = 0)
    //         // our out of the voxel if adding (currentVoxel  > 0)
    //         const pos = intersection.position.map((v, ndx) => {
    //             return v + intersection.normal[ndx] * (voxelId > 0 ? 0.5 : -0.5);
    //         });
    //         world.setVoxel(...pos, voxelId);
    //         updateVoxelGeometry(...pos);
    //         requestRenderIfNotRequested();
    //     }
    // }
}
