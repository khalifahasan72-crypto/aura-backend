import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ModelViewerProps {
    modelPath: string;
    height?: string | number;
    armorColor?: string;
    jointColor?: string;
}

const colorMap: Record<string, number> = {
    'white': 0xffffff,
    'black': 0x050505,
    'neon green': 0x39ff14,
    'red': 0xff0000,
    'blue': 0x0000ff,
    'silver': 0xc0c0c0,
    'grey': 0x808080,
    'gold': 0xffd700
};

const applyColors = (model: THREE.Object3D, armorColor?: string, jointColor?: string) => {
    model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            let mat = child.material as THREE.MeshStandardMaterial;
            if (!mat) return;

            if (!child.userData.materialCloned) {
                mat = mat.clone();
                child.material = mat;
                child.userData.materialCloned = true;
            }

            const matName = mat.name ? mat.name.toLowerCase() : '';
            const meshName = child.name ? child.name.toLowerCase() : '';

            // check joints
            if (jointColor && (['joints', 'joint', 'connector', 'inner'].some(t => matName.includes(t) || meshName.includes(t)))) {
                const hex = colorMap[jointColor.toLowerCase()] ?? 0x222222;
                mat.color.setHex(hex);
            }
            // check armor
            else if (armorColor && (['armor', 'body', 'shell', 'outer'].some(t => matName.includes(t) || meshName.includes(t)))) {
                const hex = colorMap[armorColor.toLowerCase()] ?? 0xffffff;
                mat.color.setHex(hex);
            }
        }
    });
};

export default function ModelViewer({ modelPath, height = '100%', armorColor, jointColor }: ModelViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const modelRef = useRef<THREE.Group | THREE.Mesh | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        let width = container.clientWidth;
        let h = container.clientHeight;

        if (h === 0 && typeof height === 'string' && height.endsWith('px')) {
            h = parseInt(height);
        }

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 100);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        const ambLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(2, 5, 3);
        scene.add(dirLight);

        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const material = new THREE.MeshStandardMaterial({ color: 0x3d5a80, roughness: 0.2, metalness: 0.1 });
        const fallback = new THREE.Mesh(geometry, material);

        const loader = new GLTFLoader();
        loader.load(
            encodeURI(modelPath),
            (gltf) => {
                const activeModel = gltf.scene;
                modelRef.current = activeModel;

                // Color application
                applyColors(activeModel, armorColor, jointColor);

                const box = new THREE.Box3().setFromObject(activeModel);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());

                activeModel.position.x += (activeModel.position.x - center.x);
                activeModel.position.y += (activeModel.position.y - center.y);
                activeModel.position.z += (activeModel.position.z - center.z);

                const maxDim = Math.max(size.x, size.y, size.z);
                if (maxDim > 0) {
                    const scale = 2.5 / maxDim;
                    activeModel.scale.set(scale, scale, scale);
                }

                scene.add(activeModel);
            },
            undefined,
            (_err) => {
                console.error('Failed to load model:', modelPath, _err);
                modelRef.current = fallback;
                scene.add(fallback);
            }
        );

        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            if (modelRef.current) {
                modelRef.current.rotation.y += 0.005;
            }
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!containerRef.current) return;
            const newW = containerRef.current.clientWidth;
            const newH = containerRef.current.clientHeight;
            if (newW === 0 || newH === 0) return;
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
        };
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(frameId);
            renderer.forceContextLoss();
            container.removeChild(renderer.domElement);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
            controls.dispose();
            modelRef.current = null;
        };
    }, [modelPath, height]); // Only reinitialize system if essential props change

    // React to live color updates
    useEffect(() => {
        if (modelRef.current) {
            applyColors(modelRef.current, armorColor, jointColor);
        }
    }, [armorColor, jointColor]);

    return (
        <div
            ref={containerRef}
            style={{ width: '100%', height, background: '#0a0b0c', borderRadius: '8px', overflow: 'hidden' }}
        />
    );
}
