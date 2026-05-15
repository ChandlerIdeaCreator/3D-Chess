import * as THREE from 'three';

export function setupLighting(scene) {
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(8, 12, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 10;
    sun.shadow.camera.bottom = -10;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 50;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);

    const fill = new THREE.PointLight(0xffffff, 0.3);
    fill.position.set(-4, 8, -4);
    scene.add(fill);

    const hemi = new THREE.HemisphereLight(0x87CEEB, 0x362907, 0.2);
    scene.add(hemi);

    const rim = new THREE.PointLight(0x8899aa, 0.4);
    rim.position.set(0, 4, -8);
    scene.add(rim);
}
