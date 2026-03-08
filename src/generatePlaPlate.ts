import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';

export function createPlateGroup(font: Font | null) {
    const group = new THREE.Group();

    // Create a canvas-based bump/normal map for 3D printed layer lines
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#808080'; // Flat normal
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#999999';
        for (let y = 0; y < size; y += 4) {
            ctx.fillRect(0, y, size, 2);
        }
    }

    const layerTexture = new THREE.CanvasTexture(canvas);
    layerTexture.wrapS = THREE.RepeatWrapping;
    layerTexture.wrapT = THREE.RepeatWrapping;
    layerTexture.repeat.set(1, 40); // high frequency for realistic prints

    // Dark Charcoal PLA Base
    const baseMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.85,
        metalness: 0.0,
        bumpMap: layerTexture,
        bumpScale: 0.005
    });

    // Base parameters
    const bWidth = 5;
    const bHeight = 1.0;
    const bDepth = 0.5;
    const baseGeo = new RoundedBoxGeometry(bWidth, bHeight, bDepth, 8, 0.05);
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;

    // Angle it like a desk plate
    baseMesh.rotation.x = -Math.PI / 8;
    group.add(baseMesh);

    // Light Matte Text
    const textMat = new THREE.MeshStandardMaterial({
        color: 0xEDEFF2,
        roughness: 0.9,
        metalness: 0.0,
        bumpMap: layerTexture,
        bumpScale: 0.003
    });

    if (font) {
        const textGeo = new TextGeometry('AURA 3D', {
            font: font,
            size: 0.45,
            depth: 0.1, // extrude amount
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.015,
            bevelSize: 0.01,
            bevelOffset: 0,
            bevelSegments: 4
        });

        // Center the text geometry
        textGeo.computeBoundingBox();
        const xOffset = -0.5 * (textGeo.boundingBox!.max.x - textGeo.boundingBox!.min.x);
        const yOffset = -0.5 * (textGeo.boundingBox!.max.y - textGeo.boundingBox!.min.y);
        textGeo.translate(xOffset, yOffset, 0);

        const textMesh = new THREE.Mesh(textGeo, textMat);
        // Position text on the angled front face of the base
        textMesh.position.set(0, 0.05, (bDepth / 2) + 0.01);

        // Add text to the baseMesh to inherit rotation
        baseMesh.add(textMesh);
        textMesh.castShadow = true;
        textMesh.receiveShadow = true;
    }

    return group;
}
