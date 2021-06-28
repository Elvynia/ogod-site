import { ogodDefineInstance, ogodFactoryInstanceProperty } from "@ogod/element-core";
import { threeHybridInstance, threeHybridMesh } from "@ogod/element-three";

export function threeDefineBubble() {
    return ogodDefineInstance('three-bubble',
        [threeHybridInstance(), threeHybridMesh(), { bubble: ogodFactoryInstanceProperty(null) }],
        [{ runtime: 'bubble' }]
    );
}
