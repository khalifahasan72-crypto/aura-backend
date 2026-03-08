import './style.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';


gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector('#webgl-canvas') as HTMLCanvasElement;
const scene = new THREE.Scene();
scene.background = null;
scene.fog = new THREE.Fog(0x0b0d10, 5, 20);

const sizes = { width: window.innerWidth, height: window.innerHeight };

// Camera setup
const cameraGroup = new THREE.Group();

// Procedural Pop Sound
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
const playPopSound = () => {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
};

scene.add(cameraGroup);
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 1.2, 8);
camera.lookAt(0, 0, 0);
cameraGroup.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

if ('useLegacyLights' in renderer) { (renderer as any).useLegacyLights = false; }
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
try { renderer.outputColorSpace = THREE.SRGBColorSpace; } catch (e) { (renderer as any).outputEncoding = 3001; }

// Lighting (4-Point Studio Setup)
const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
keyLight.position.set(4, 6, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 1024;
keyLight.shadow.mapSize.height = 1024;
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 25;
keyLight.shadow.bias = -0.001;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
fillLight.position.set(-5, 2.5, 4);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 1.1);
rimLight.position.set(0, 4, -6);
scene.add(rimLight);

const topLight = new THREE.DirectionalLight(0xffffff, 0.3);
topLight.position.set(0, 8, 0);
scene.add(topLight);

// Setup Object Hierarchy
const productGroup = new THREE.Group();
scene.add(productGroup);

const floatGroup = new THREE.Group();
// Base rotation so face + side show depth
floatGroup.rotation.y = -0.25; // ~15 degrees
floatGroup.rotation.x = 0.1; // Slight pitch up for better highlight
productGroup.add(floatGroup);

const toyWrapper = new THREE.Group();
floatGroup.add(toyWrapper);

// Ground Plane (Contact Shadow)
const shadowPlaneGeo = new THREE.PlaneGeometry(15, 15);
const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.16, transparent: true });
const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = -2;
shadowPlane.receiveShadow = true;
productGroup.add(shadowPlane);

// 1. Body
const bodyMaterial = new THREE.MeshStandardMaterial({
  color: 0x0E0F12, // near-black
  roughness: 0.65,
  metalness: 0.1
});
const bodyGeo = new RoundedBoxGeometry(2, 2, 2, 8, 0.2);
bodyGeo.computeVertexNormals();
const bodyMesh = new THREE.Mesh(bodyGeo, bodyMaterial);
bodyMesh.castShadow = true;
bodyMesh.receiveShadow = true;
toyWrapper.add(bodyMesh);

// 2. Button on top
const accentMaterial = new THREE.MeshStandardMaterial({
  color: 0x16324F, // deep navy
  roughness: 0.6,
  metalness: 0.15
});
const buttonGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 32);
const buttonMesh = new THREE.Mesh(buttonGeo, accentMaterial);
buttonMesh.position.set(0, 1 + 0.15, 0); // 1 is half the body height
buttonMesh.castShadow = true;
buttonMesh.receiveShadow = true;
toyWrapper.add(buttonMesh);

// 3. Pop dots on the front (Z+ face)
const popGeo = new THREE.SphereGeometry(0.18, 32, 32);
const popGroup = new THREE.Group();
const popPositions = [
  [-0.4, 0.4, 0], [0.4, 0.4, 0],
  [-0.4, -0.4, 0], [0.4, -0.4, 0],
  [0, 0, 0] // 5 dots total
];
const popMeshes: THREE.Mesh[] = [];

popPositions.forEach(pos => {
  const pop = new THREE.Mesh(popGeo, accentMaterial);
  pop.position.set(pos[0], pos[1], 1.0); // 1.0 is the surface on Z
  pop.scale.z = 0.5; // flatten
  pop.castShadow = true;
  pop.receiveShadow = true;
  popGroup.add(pop);
  popMeshes.push(pop);
});
toyWrapper.add(popGroup);

// Responsive Layout
function updateResponsiveLayout() {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    productGroup.position.set(0, -1.5, 0);
    productGroup.scale.setScalar(0.7);
  } else {
    productGroup.position.set(1.8, 0, 0);
    productGroup.scale.setScalar(1.2);
  }
}
updateResponsiveLayout();

// Intro Animation
function playIntroAnimation() {
  const targetScale = productGroup.scale.x;
  productGroup.scale.setScalar(0);

  const introTl = gsap.timeline();
  introTl.to('#intro', { opacity: 0, duration: 1.5, ease: 'power2.inOut', delay: 0.2 })
    .to(productGroup.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 1.5, ease: 'back.out(1.2)' }, "-=1.0");
}
playIntroAnimation();

// UI Interactions
const magneticBtns = document.querySelectorAll('.magnetic-btn, .magnetic-link');
magneticBtns.forEach((btn) => {
  btn.addEventListener('mousemove', (e: any) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: x * 0.4, y: y * 0.4, duration: 0.3, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
  });
});

const sections = document.querySelectorAll('.section');
sections.forEach((section) => {
  const content = section.querySelector('.content');
  if (content) {
    gsap.fromTo(content,
      { opacity: 0, y: 100 },
      {
        opacity: 1, y: 0, ease: 'none',
        scrollTrigger: {
          trigger: section, start: 'top 80%', end: 'top 30%', scrub: 1.5
        }
      }
    );
  }
});

// Raycaster Interactions
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-9999, -9999);
let isHovering = false;

const hoverState = { weight: 0 };
const idleDummy = new THREE.Object3D();
const hoverDummy = new THREE.Object3D();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  updateResponsiveLayout();
});

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(toyWrapper.children, true);

  if (intersects.length > 0) {
    if (!isHovering) {
      isHovering = true;
      document.body.style.cursor = 'pointer';
      gsap.to(toyWrapper.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 0.4, ease: 'power2.out' });
      gsap.to(hoverState, { weight: 1, duration: 0.3, ease: 'power2.inOut' });
    }
  } else {
    if (isHovering) {
      isHovering = false;
      document.body.style.cursor = 'default';
      gsap.to(toyWrapper.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'power2.out' });
      gsap.to(hoverState, { weight: 0, duration: 0.4, ease: 'power2.inOut' });
    }
  }
});

window.addEventListener('click', () => {
  if (isHovering) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([buttonMesh, ...popMeshes], true);

    if (intersects.length > 0) {
      const clicked = intersects[0].object;

      if (clicked === buttonMesh) {
        // Press button
        const tl = gsap.timeline();
        tl.to(buttonMesh.position, { y: 1 + 0.05, duration: 0.1, ease: 'power1.in' })
          .to(buttonMesh.position, { y: 1 + 0.15, duration: 0.3, ease: 'elastic.out(1.5, 0.3)' });
      } else if (popMeshes.includes(clicked as THREE.Mesh)) {
        // Press pop dot
        const tl = gsap.timeline();
        tl.to(clicked.scale, { z: 0.2, x: 0.9, y: 0.9, duration: 0.1, ease: 'power1.in' })
          .to(clicked.scale, { z: 0.5, x: 1, y: 1, duration: 0.4, ease: 'elastic.out(1.5, 0.3)' });
      }
    } else {
      // General body press
      const tl = gsap.timeline();
      tl.to(toyWrapper.position, { z: -0.2, duration: 0.1, ease: 'power1.in' })
        .to(toyWrapper.position, { z: 0, duration: 0.4, ease: 'elastic.out(1.5, 0.3)' });
    }
  }
});

// --- FEATURES AVATAR ---
const featuresCanvas = document.querySelector('#features-canvas') as HTMLCanvasElement;
let fRenderer: THREE.WebGLRenderer | null = null;
let fScene: THREE.Scene | null = null;
let fCamera: THREE.PerspectiveCamera | null = null;
let avatarGroup: THREE.Group | null = null;
let torso: THREE.Mesh | null = null;
let head: THREE.Mesh | null = null;
let leftPupil: THREE.Mesh | null = null;
let rightPupil: THREE.Mesh | null = null;
let leftArmPivot: THREE.Group | null = null;
let rightArmPivot: THREE.Group | null = null;
let leftLegPivot: THREE.Group | null = null;
let rightLegPivot: THREE.Group | null = null;
let fHovering = false;
let updateFeatures = (_dt: number, _time: number) => { };

if (featuresCanvas) {
  fScene = new THREE.Scene();
  fCamera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
  fCamera.position.set(0, 0, 10);

  fRenderer = new THREE.WebGLRenderer({ canvas: featuresCanvas, antialias: true, alpha: true });
  fRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  if ('useLegacyLights' in fRenderer) { (fRenderer as any).useLegacyLights = false; }
  fRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  fRenderer.toneMappingExposure = 1.0;
  try { fRenderer.outputColorSpace = THREE.SRGBColorSpace; } catch (e) { (fRenderer as any).outputEncoding = 3001; }

  // 4-Point Studio Lighting
  const fKeyLight = new THREE.DirectionalLight(0xffffff, 1.6);
  fKeyLight.position.set(4, 6, 5);
  fKeyLight.castShadow = true;
  fKeyLight.shadow.mapSize.width = 1024;
  fKeyLight.shadow.mapSize.height = 1024;
  fKeyLight.shadow.camera.near = 0.5;
  fKeyLight.shadow.camera.far = 25;
  fKeyLight.shadow.bias = -0.001;
  fScene.add(fKeyLight);
  const fFillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fFillLight.position.set(-5, 2.5, 4);
  fScene.add(fFillLight);
  const fRimLight = new THREE.DirectionalLight(0xffffff, 1.1);
  fRimLight.position.set(0, 4, -6);
  fScene.add(fRimLight);
  const fTopLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fTopLight.position.set(0, 8, 0);
  fScene.add(fTopLight);

  avatarGroup = new THREE.Group();
  fScene.add(avatarGroup);

  const fShadowPlaneGeo = new THREE.PlaneGeometry(15, 15);
  const fShadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.16, transparent: true });
  const fShadowPlane = new THREE.Mesh(fShadowPlaneGeo, fShadowPlaneMat);
  fShadowPlane.rotation.x = -Math.PI / 2;
  fShadowPlane.position.y = -2.05;
  fShadowPlane.receiveShadow = true;
  avatarGroup.add(fShadowPlane);

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.5, metalness: 0.1 });
  const clothesMat = new THREE.MeshStandardMaterial({ color: 0x16324F, roughness: 0.5, metalness: 0.15 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0xFFD100, roughness: 0.5, metalness: 0.1 });

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.4, 32);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.y = 1.0 + 0.1;
  avatarGroup.add(neck);

  const headGeo = new RoundedBoxGeometry(1.0, 1.0, 1.0, 4, 0.2);
  headGeo.computeVertexNormals();
  head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.0 + 0.3 + 0.4;
  head.castShadow = true;
  head.receiveShadow = true;

  // Face
  const faceGroup = new THREE.Group();
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const lEye = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.05), eyeMat);
  lEye.position.set(-0.25, 0.1, 0.51);
  leftPupil = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.02), pupilMat);
  leftPupil.position.set(0, 0, 0.03);
  lEye.add(leftPupil);

  const rEye = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.05), eyeMat);
  rEye.position.set(0.25, 0.1, 0.51);
  rightPupil = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.02), pupilMat);
  rightPupil.position.set(0, 0, 0.03);
  rEye.add(rightPupil);

  const smileGeo = new THREE.BoxGeometry(0.4, 0.08, 0.05);
  const smile = new THREE.Mesh(smileGeo, eyeMat);
  smile.position.set(0, -0.25, 0.51);

  const smileLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.05), eyeMat);
  smileLeft.position.set(-0.2, 0.02, 0);
  smileLeft.rotation.z = -0.4;
  const smileRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.05), eyeMat);
  smileRight.position.set(0.2, 0.02, 0);
  smileRight.rotation.z = 0.4;
  smile.add(smileLeft, smileRight);

  faceGroup.add(lEye, rEye, smile);
  head.add(faceGroup);

  // Hair - Roblox Style Blocky Hair
  const hairGroup = new THREE.Group();
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
  const hairBase = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.4, 1.05), hairMat);
  hairBase.position.y = 0.45;

  const hairBangs = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.2, 0.2), hairMat);
  hairBangs.position.set(0, 0.35, 0.45);

  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.8), hairMat);
  hairTop.position.y = 0.65;

  hairGroup.add(hairBase, hairBangs, hairTop);
  head.add(hairGroup);

  avatarGroup.add(head);

  const torsoGeo = new THREE.BoxGeometry(1.5, 2.0, 0.8);
  torsoGeo.computeVertexNormals();
  torso = new THREE.Mesh(torsoGeo, clothesMat);
  torso.position.y = 0;
  torso.castShadow = true;
  torso.receiveShadow = true;
  avatarGroup.add(torso);

  const armGeo = new THREE.BoxGeometry(0.6, 2.0, 0.6);
  armGeo.computeVertexNormals();
  leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.75 - 0.3 - 0.05, 0.8, 0);
  const leftArm = new THREE.Mesh(armGeo, skinMat);
  leftArm.position.y = -0.8;
  leftArm.castShadow = true;
  leftArm.receiveShadow = true;
  leftArmPivot.add(leftArm);
  avatarGroup.add(leftArmPivot);

  rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.75 + 0.3 + 0.05, 0.8, 0);
  const rightArm = new THREE.Mesh(armGeo, skinMat);
  rightArm.position.y = -0.8;
  rightArm.castShadow = true;
  rightArm.receiveShadow = true;
  rightArmPivot.add(rightArm);
  avatarGroup.add(rightArmPivot);

  const legGeo = new THREE.BoxGeometry(0.65, 2.0, 0.6);
  legGeo.computeVertexNormals();

  leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.35, -1.0, 0);
  const leftLeg = new THREE.Mesh(legGeo, darkMat);
  leftLeg.position.y = -1.0;
  leftLeg.castShadow = true;
  leftLeg.receiveShadow = true;
  leftLegPivot.add(leftLeg);
  avatarGroup.add(leftLegPivot);

  rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.35, -1.0, 0);
  const rightLeg = new THREE.Mesh(legGeo, darkMat);
  rightLeg.position.y = -1.0;
  rightLeg.castShadow = true;
  rightLeg.receiveShadow = true;
  rightLegPivot.add(rightLeg);
  avatarGroup.add(rightLegPivot);

  function resizeFeatures() {
    const parent = featuresCanvas.parentElement;
    if (parent && fRenderer && fCamera && avatarGroup) {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      fRenderer.setSize(width, height);
      fCamera.aspect = width / height;
      fCamera.updateProjectionMatrix();

      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        avatarGroup.position.set(0, 1.5, 0);
        avatarGroup.scale.setScalar(0.7);
      } else {
        avatarGroup.position.set(-2.5, 0.5, 0);
        avatarGroup.scale.setScalar(1);
      }
    }
  }
  window.addEventListener('resize', resizeFeatures);
  resizeFeatures();

  const fRaycaster = new THREE.Raycaster();
  const fMouse = new THREE.Vector2(-9999, -9999);

  featuresCanvas.addEventListener('mousemove', (e) => {
    const rect = featuresCanvas.getBoundingClientRect();
    fMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    fMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (fCamera && avatarGroup) {
      fRaycaster.setFromCamera(fMouse, fCamera);
      const intersects = fRaycaster.intersectObjects(avatarGroup.children, true);

      if (intersects.length > 0) {
        if (!fHovering) {
          fHovering = true;
          featuresCanvas.style.cursor = 'pointer';
        }
      } else {
        if (fHovering) {
          fHovering = false;
          featuresCanvas.style.cursor = 'default';
        }
      }
    }
  });

  featuresCanvas.addEventListener('mouseleave', () => {
    fHovering = false;
    featuresCanvas.style.cursor = 'default';
    fMouse.set(-9999, -9999);
  });

  let draggedPart: THREE.Object3D | null = null;
  let dragStartRot = new THREE.Quaternion();
  let dragPlane = new THREE.Plane();
  let dragStartIntersect = new THREE.Vector3();
  let hasDragged = false;

  featuresCanvas.addEventListener('mousedown', (e) => {
    if (fCamera && avatarGroup && fHovering) {
      const rect = featuresCanvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const my = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      fRaycaster.setFromCamera(new THREE.Vector2(mx, my), fCamera);

      const meshesToTest: THREE.Object3D[] = [];
      avatarGroup.traverse(child => {
        if (child instanceof THREE.Mesh) meshesToTest.push(child);
      });
      const intersects = fRaycaster.intersectObjects(meshesToTest, false);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        if (obj === head || obj.parent === head || obj.parent?.parent === head) draggedPart = head;
        else if (obj.parent === leftArmPivot) draggedPart = leftArmPivot;
        else if (obj.parent === rightArmPivot) draggedPart = rightArmPivot;
        else if (obj.parent === leftLegPivot) draggedPart = leftLegPivot;
        else if (obj.parent === rightLegPivot) draggedPart = rightLegPivot;

        if (draggedPart) {
          hasDragged = false;
          dragStartRot.copy(draggedPart.quaternion);

          const pivotWorld = new THREE.Vector3();
          draggedPart.getWorldPosition(pivotWorld);

          const cameraDir = new THREE.Vector3();
          fCamera.getWorldDirection(cameraDir);
          dragPlane.setFromNormalAndCoplanarPoint(cameraDir.negate(), pivotWorld);

          fRaycaster.ray.intersectPlane(dragPlane, dragStartIntersect);
        }
      }
    }
  });

  window.addEventListener('mouseup', () => {
    draggedPart = null;
  });

  window.addEventListener('mousemove', (e) => {
    if (draggedPart && fCamera) {
      hasDragged = true;
      const rect = featuresCanvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const my = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      fRaycaster.setFromCamera(new THREE.Vector2(mx, my), fCamera);

      const currentIntersect = new THREE.Vector3();
      if (fRaycaster.ray.intersectPlane(dragPlane, currentIntersect) && dragStartIntersect) {

        const pivotWorld = new THREE.Vector3();
        draggedPart.getWorldPosition(pivotWorld);

        if (draggedPart.parent) {
          const pStart = draggedPart.parent.worldToLocal(dragStartIntersect.clone());
          const pCurrent = draggedPart.parent.worldToLocal(currentIntersect.clone());
          const pPivot = draggedPart.parent.worldToLocal(pivotWorld.clone());

          const vStart = pStart.sub(pPivot).normalize();
          const vCurrent = pCurrent.sub(pPivot).normalize();

          const deltaQuat = new THREE.Quaternion().setFromUnitVectors(vStart, vCurrent);
          draggedPart.quaternion.copy(dragStartRot.clone().premultiply(deltaQuat));

          // Apply action figure collision & joint constraints
          const euler = new THREE.Euler().setFromQuaternion(draggedPart.quaternion, 'XYZ');

          if (draggedPart === head) {
            // Head: Nod up/down slightly, twist left/right
            euler.x = THREE.MathUtils.clamp(euler.x, -0.4, 0.5);
            euler.y = THREE.MathUtils.clamp(euler.y, -1.2, 1.2);
            euler.z = 0; // No tilting head sideways like a ball joint
          } else if (draggedPart === leftArmPivot) {
            // Left Arm: Full spin forward/backwards (X), can raise outward (Z) but NOT into body
            euler.x = THREE.MathUtils.clamp(euler.x, -Math.PI, Math.PI);
            euler.y = 0;
            euler.z = THREE.MathUtils.clamp(euler.z, -Math.PI + 0.2, 0);
          } else if (draggedPart === rightArmPivot) {
            // Right Arm: Full spin, raise outward NOT into body
            euler.x = THREE.MathUtils.clamp(euler.x, -Math.PI, Math.PI);
            euler.y = 0;
            euler.z = THREE.MathUtils.clamp(euler.z, 0, Math.PI - 0.2);
          } else if (draggedPart === leftLegPivot) {
            // Left Leg: Sit down (forward), bend back slightly, no splits
            euler.x = THREE.MathUtils.clamp(euler.x, -Math.PI / 1.5, Math.PI / 4);
            euler.y = 0;
            euler.z = THREE.MathUtils.clamp(euler.z, -0.2, 0);
          } else if (draggedPart === rightLegPivot) {
            // Right Leg: Sit down, bend back slightly
            euler.x = THREE.MathUtils.clamp(euler.x, -Math.PI / 1.5, Math.PI / 4);
            euler.y = 0;
            euler.z = THREE.MathUtils.clamp(euler.z, 0, 0.2);
          }

          draggedPart.quaternion.setFromEuler(euler);
        }
      }
    }
  });

  featuresCanvas.addEventListener('click', () => {
    if (fHovering && leftArmPivot && !hasDragged) {
      const tl = gsap.timeline();
      tl.to(leftArmPivot.rotation, { z: -Math.PI * 0.8, x: -Math.PI * 0.2, duration: 0.4, ease: 'back.out(1.5)' })
        .to(leftArmPivot.rotation, { z: -Math.PI * 0.6, duration: 0.2, yoyo: true, repeat: 3 })
        .to(leftArmPivot.rotation, { z: 0, x: 0, duration: 0.5, ease: 'power2.inOut' });
    }
  });

  const tooltipInner = document.getElementById('features-tooltip-inner');
  const tooltipContainer = document.getElementById('features-tooltip');
  if (tooltipInner && tooltipContainer) {
    tooltipInner.addEventListener('click', () => {
      tooltipInner.style.pointerEvents = 'none';
      playPopSound();
      // Slower Dust/Disintegrate into pieces
      const text = tooltipInner.innerText;
      tooltipInner.innerHTML = '';
      tooltipInner.style.background = 'transparent';
      tooltipInner.style.border = 'none';
      tooltipInner.style.backdropFilter = 'none';
      tooltipInner.style.boxShadow = 'none';
      tooltipInner.style.display = 'flex';
      tooltipInner.style.gap = '2px';

      // Split text into individual characters as "dust particles"
      const chars = text.split('').map(char => {
        const span = document.createElement('span');
        span.innerText = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.color = 'white';
        span.style.textShadow = '0 0 10px white';
        tooltipInner.appendChild(span);
        return span;
      });

      const tl = gsap.timeline({
        onComplete: () => {
          tooltipContainer.style.display = 'none';
        }
      });

      // Make it slower and go everywhere
      chars.forEach((char) => {
        tl.to(char, {
          x: (Math.random() - 0.5) * 600,
          y: (Math.random() - 0.5) * 600,
          rotation: (Math.random() - 0.5) * 720,
          opacity: 0,
          filter: 'blur(10px)',
          scale: Math.random() * 2,
          duration: 3 + Math.random() * 2, // Slower: up to 5 seconds
          ease: 'power1.out'
        }, 0);
      });
    });
  }

  let fTargetRotX = 0;
  let fTargetRotY = 0;
  let fCurrentRotX = 0;
  let fCurrentRotY = 0;

  updateFeatures = (_dt: number, time: number) => {
    if (!avatarGroup || !torso || !head || !fRenderer || !fScene || !fCamera) return;

    avatarGroup.position.y += Math.sin(time * 2) * 0.002;
    torso.scale.y = 1 + Math.sin(time * 2) * 0.02;
    torso.scale.x = 1 + Math.sin(time * 2 + Math.PI) * 0.01;
    head.position.y = 1.0 + 0.3 + 0.4 + Math.sin(time * 2) * 0.05;

    // Head and eye following
    const isMouseOff = fMouse.x < -1 || fMouse.x > 1 || fMouse.y < -1 || fMouse.y > 1;

    if (!isMouseOff && !draggedPart) {
      // Calculate delta from projected head position for true "look at"
      const headPos = new THREE.Vector3();
      head.getWorldPosition(headPos);
      const headScreenPos = headPos.clone().project(fCamera);

      const dx = fMouse.x - headScreenPos.x;
      const dy = fMouse.y - headScreenPos.y;

      // Map screen delta to rotation
      fTargetRotX = THREE.MathUtils.clamp(-dy * 1.0, -0.6, 0.6);
      fTargetRotY = THREE.MathUtils.clamp(dx * 1.0, -1.2, 1.2);

      // Update pupils
      if (leftPupil && rightPupil) {
        const px = THREE.MathUtils.clamp(dx * 0.08, -0.05, 0.05);
        const py = THREE.MathUtils.clamp(dy * 0.08, -0.08, 0.08);
        leftPupil.position.x += (px - leftPupil.position.x) * 0.1;
        leftPupil.position.y += (py - leftPupil.position.y) * 0.1;
        rightPupil.position.x += (px - rightPupil.position.x) * 0.1;
        rightPupil.position.y += (py - rightPupil.position.y) * 0.1;
      }
    } else if (!draggedPart) {
      fTargetRotX = 0;
      fTargetRotY = Math.sin(time * 0.5) * 0.1;

      if (leftPupil && rightPupil) {
        leftPupil.position.lerp(new THREE.Vector3(0, 0, 0.03), 0.05);
        rightPupil.position.lerp(new THREE.Vector3(0, 0, 0.03), 0.05);
      }
    }

    fCurrentRotX += (fTargetRotX - fCurrentRotX) * 0.05;
    fCurrentRotY += (fTargetRotY - fCurrentRotY) * 0.05;

    head.rotation.x = fCurrentRotX;
    head.rotation.y = fCurrentRotY;

    fRenderer.render(fScene, fCamera);
  };
}

// --- SPECS POP & PRINT MINI-GAME ---
const specsCanvas = document.querySelector('#specs-canvas') as HTMLCanvasElement;
let sRenderer: THREE.WebGLRenderer | null = null;
let sScene: THREE.Scene | null = null;
let sCamera: THREE.PerspectiveCamera | null = null;
let popGameGroup: THREE.Group | null = null;
let sHoverDummy = new THREE.Object3D();
let sIdleDummy = new THREE.Object3D();
const sHoverState = { weight: 0 };
let sHovering = false;
let updateSpecs = (_dt: number, _time: number) => { };

if (specsCanvas) {
  sScene = new THREE.Scene();
  sCamera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
  sCamera.position.set(0, 1.5, 10);
  sCamera.lookAt(0, 0, 0);

  sRenderer = new THREE.WebGLRenderer({ canvas: specsCanvas, antialias: true, alpha: true });
  sRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  if ('useLegacyLights' in sRenderer) { (sRenderer as any).useLegacyLights = false; }
  sRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  sRenderer.toneMappingExposure = 1.0;
  try { sRenderer.outputColorSpace = THREE.SRGBColorSpace; } catch (e) { (sRenderer as any).outputEncoding = 3001; }

  // 4-Point Studio Lighting
  const sKeyLight = new THREE.DirectionalLight(0xffffff, 1.6);
  sKeyLight.position.set(4, 6, 5);
  sKeyLight.castShadow = true;
  sKeyLight.shadow.mapSize.width = 1024;
  sKeyLight.shadow.mapSize.height = 1024;
  sKeyLight.shadow.camera.near = 0.5;
  sKeyLight.shadow.camera.far = 25;
  sKeyLight.shadow.bias = -0.001;
  sScene.add(sKeyLight);

  const sFillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  sFillLight.position.set(-5, 2.5, 4);
  sScene.add(sFillLight);

  const sRimLight = new THREE.DirectionalLight(0xffffff, 1.1);
  sRimLight.position.set(0, 4, -6);
  sScene.add(sRimLight);

  const sTopLight = new THREE.DirectionalLight(0xffffff, 0.3);
  sTopLight.position.set(0, 8, 0);
  sScene.add(sTopLight);

  popGameGroup = new THREE.Group();
  sScene.add(popGameGroup);

  const toyWrapper = new THREE.Group();
  popGameGroup.add(toyWrapper);

  const sShadowPlaneGeo = new THREE.PlaneGeometry(15, 15);
  const sShadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.16, transparent: true });
  const sShadowPlane = new THREE.Mesh(sShadowPlaneGeo, sShadowPlaneMat);
  sShadowPlane.rotation.x = -Math.PI / 2;
  sShadowPlane.position.y = -0.5;
  sShadowPlane.receiveShadow = true;
  popGameGroup.add(sShadowPlane);

  // Materials
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0E0F12, roughness: 0.65, metalness: 0.1 });
  const dotMatUnpopped = new THREE.MeshStandardMaterial({ color: 0x16324F, roughness: 0.5, metalness: 0.15 });

  // Base
  const baseGeo = new RoundedBoxGeometry(2.5, 2.5, 0.5, 8, 0.2);
  baseGeo.computeVertexNormals();
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  toyWrapper.add(baseMesh);

  // Grid of Dots
  const dotGeo = new THREE.SphereGeometry(0.2, 32, 16);
  const gameDots: { mesh: THREE.Mesh, popped: boolean, originalZ: number }[] = [];
  const gridSize = 4;
  const spacing = 0.55;
  const offset = (gridSize - 1) * spacing / 2;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const dot = new THREE.Mesh(dotGeo, dotMatUnpopped.clone());
      dot.position.set(i * spacing - offset, j * spacing - offset, 0.25);
      dot.scale.z = 0.5; // flatten hemisphere look
      toyWrapper.add(dot);
      gameDots.push({ mesh: dot, popped: false, originalZ: 0.25 });
    }
  }

  function resizeSpecs() {
    const parent = specsCanvas.parentElement;
    if (parent && sRenderer && sCamera && popGameGroup) {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      sRenderer.setSize(width, height);
      sCamera.aspect = width / height;
      sCamera.updateProjectionMatrix();

      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        popGameGroup.position.set(0, 1.5, 0);
        popGameGroup.scale.setScalar(0.75);
      } else {
        popGameGroup.position.set(2.5, 0, 0);
        popGameGroup.scale.setScalar(1);
      }
    }
  }
  window.addEventListener('resize', resizeSpecs);
  resizeSpecs();

  const sRaycaster = new THREE.Raycaster();
  const sMouse = new THREE.Vector2(-9999, -9999);
  let hoveredDot: THREE.Mesh | null = null;

  featuresCanvas.parentElement?.addEventListener('mouseleave', () => {
    // Shared listener logic for safety, but we want specs specific
  });

  specsCanvas.addEventListener('mousemove', (e) => {
    const rect = specsCanvas.getBoundingClientRect();
    sMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    sMouse.y = -((e.clientY - rect.top) / rect.height) * 2 - 1; // Wait, correct below
    sMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (sCamera && popGameGroup) {
      sRaycaster.setFromCamera(sMouse, sCamera);
      const meshes = gameDots.map(d => d.mesh);
      const intersects = sRaycaster.intersectObjects([baseMesh, ...meshes], true);

      if (intersects.length > 0) {
        if (!sHovering) {
          sHovering = true;
          specsCanvas.style.cursor = 'pointer';
          gsap.to(toyWrapper.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 0.4, ease: 'power2.out' });
          gsap.to(sHoverState, { weight: 1, duration: 0.3, ease: 'power2.inOut' });
        }

        // Dot specific hover
        const obj = intersects[0].object as THREE.Mesh;
        if (meshes.includes(obj)) {
          if (hoveredDot !== obj) {
            if (hoveredDot) {
              const matchedPrev = gameDots.find(d => d.mesh === hoveredDot);
              if (matchedPrev && !matchedPrev.popped) gsap.to(hoveredDot.scale, { x: 1, y: 1, duration: 0.2 });
            }
            hoveredDot = obj;
            const matched = gameDots.find(d => d.mesh === obj);
            if (matched && !matched.popped) gsap.to(obj.scale, { x: 1.15, y: 1.15, duration: 0.2, ease: 'power1.out' });
          }
        } else if (hoveredDot) {
          const matched = gameDots.find(d => d.mesh === hoveredDot);
          if (matched && !matched.popped) gsap.to(hoveredDot.scale, { x: 1, y: 1, duration: 0.2 });
          hoveredDot = null;
        }

      } else {
        if (sHovering) {
          sHovering = false;
          specsCanvas.style.cursor = 'default';
          gsap.to(toyWrapper.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'power2.out' });
          gsap.to(sHoverState, { weight: 0, duration: 0.4, ease: 'power2.inOut' });
          if (hoveredDot) {
            const matched = gameDots.find(d => d.mesh === hoveredDot);
            if (matched && !matched.popped) gsap.to(hoveredDot.scale, { x: 1, y: 1, duration: 0.2 });
            hoveredDot = null;
          }
        }
      }
    }
  });

  specsCanvas.addEventListener('mouseleave', () => {
    if (sHovering) {
      sHovering = false;
      specsCanvas.style.cursor = 'default';
      gsap.to(toyWrapper.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'power2.out' });
      gsap.to(sHoverState, { weight: 0, duration: 0.4, ease: 'power2.inOut' });
      if (hoveredDot) {
        const matched = gameDots.find(d => d.mesh === hoveredDot);
        if (matched && !matched.popped) gsap.to(hoveredDot.scale, { x: 1, y: 1, duration: 0.2 });
        hoveredDot = null;
      }
    }
    sMouse.set(-9999, -9999);
  });

  const celebrationEl = document.getElementById('pop-celebration');

  function checkWin() {
    if (gameDots.every(d => d.popped)) {
      if (celebrationEl) {
        gsap.to(celebrationEl, { opacity: 1, y: -20, duration: 0.4, ease: 'back.out(1.5)' });
      }
      gsap.to(toyWrapper.rotation, { z: Math.PI * 2, duration: 1.0, ease: 'power2.inOut' });

      setTimeout(() => {
        if (celebrationEl) {
          gsap.to(celebrationEl, { opacity: 0, y: 0, duration: 0.4, ease: 'power2.in' });
        }
        gameDots.forEach((d, i) => {
          d.popped = false;
          gsap.to(d.mesh.position, { z: d.originalZ, duration: 0.4, delay: i * 0.02, ease: 'back.out(1.5)' });
          (d.mesh.material as THREE.MeshStandardMaterial).color.setHex(0x5a7ca3);
        });
      }, 1500);
    }
  }

  specsCanvas.addEventListener('click', () => {
    if (sHovering && hoveredDot) {
      const dotData = gameDots.find(d => d.mesh === hoveredDot);
      if (dotData && !dotData.popped) {
        dotData.popped = true;
        playPopSound();

        // Pop animation
        const tl = gsap.timeline();
        tl.to(hoveredDot.scale, { x: 0.8, y: 0.8, z: 0.1, duration: 0.1, ease: 'power1.in' })
          .to(hoveredDot.position, { z: 0.1, duration: 0.1, ease: 'power1.in' }, 0)
          .to(hoveredDot.scale, { x: 1, y: 1, z: 0.3, duration: 0.3, ease: 'elastic.out(1.5, 0.5)' });

        (hoveredDot.material as THREE.MeshStandardMaterial).color.setHex(0x3a4f6b);

        checkWin();
      }
    } else if (sHovering) {
      // Tap base
      const tl = gsap.timeline();
      tl.to(toyWrapper.position, { z: -0.2, duration: 0.1 })
        .to(toyWrapper.position, { z: 0, duration: 0.3, ease: 'elastic.out(1.5, 0.5)' });
    }
  });

  let sCurrentRotX = 0;
  let sCurrentRotY = 0;

  updateSpecs = (_dt: number, time: number) => {
    if (!popGameGroup || !sRenderer || !sScene || !sCamera) return;

    popGameGroup.position.y += Math.sin(time * 1.5) * 0.001;

    let targetX = 0;
    let targetY = 0;
    const deadzone = 0.05;

    let mx = sMouse.y * 0.5;
    let my = sMouse.x * 0.5;

    if (sHovering) {
      if (Math.abs(mx) > deadzone) targetX = THREE.MathUtils.clamp(mx > 0 ? mx - deadzone : mx + deadzone, -0.15, 0.15);
      if (Math.abs(my) > deadzone) targetY = THREE.MathUtils.clamp(my > 0 ? my - deadzone : my + deadzone, -0.2, 0.2);
    }

    sCurrentRotX += (targetX - sCurrentRotX) * 0.08;
    sCurrentRotY += (targetY - sCurrentRotY) * 0.08;

    sHoverDummy.rotation.x = sCurrentRotX;
    sHoverDummy.rotation.y = sCurrentRotY;

    sIdleDummy.rotation.x = 0;
    if (sHoverState.weight >= 0.99) {
      sIdleDummy.rotation.y = sHoverDummy.rotation.y;
    } else {
      sIdleDummy.rotation.y = -0.15 + Math.sin(time * 0.5) * 0.1;
    }

    toyWrapper.quaternion.copy(sIdleDummy.quaternion);
    toyWrapper.quaternion.slerp(sHoverDummy.quaternion, sHoverState.weight);

    sRenderer.render(sScene, sCamera);
  };
}

const clock = new THREE.Clock();
let lastTime = 0;
let currentHoverRotX = 0;
let currentHoverRotY = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const dt = elapsedTime - lastTime;
  lastTime = elapsedTime;

  floatGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.1;

  let targetHoverX = 0;
  let targetHoverY = 0;
  const deadzone = 0.05;

  let mx = mouse.y * 0.5; // X rotation comes from Y mouse movement
  let my = mouse.x * 0.5; // Y rotation comes from X mouse movement

  if (Math.abs(mx) > deadzone) {
    mx = mx > 0 ? mx - deadzone : mx + deadzone;
    targetHoverX = THREE.MathUtils.clamp(mx, -0.12, 0.12);
  }

  if (Math.abs(my) > deadzone) {
    my = my > 0 ? my - deadzone : my + deadzone;
    targetHoverY = THREE.MathUtils.clamp(my, -0.18, 0.18);
  }

  // Very slow and heavy follow
  currentHoverRotX += (targetHoverX - currentHoverRotX) * 0.08;
  currentHoverRotY += (targetHoverY - currentHoverRotY) * 0.08;

  hoverDummy.rotation.x = currentHoverRotX;
  hoverDummy.rotation.y = currentHoverRotY;

  // Gentle idle
  idleDummy.rotation.x = Math.sin(elapsedTime * 0.5) * 0.1;

  if (hoverState.weight >= 0.99) {
    idleDummy.rotation.y = hoverDummy.rotation.y;
  } else {
    idleDummy.rotation.y += dt * 0.3; // subtle rotation
  }

  toyWrapper.quaternion.copy(idleDummy.quaternion);
  toyWrapper.quaternion.slerp(hoverDummy.quaternion, hoverState.weight);

  const parallaxX = mouse.x * 0.2;
  const parallaxY = mouse.y * 0.2;
  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 0.05;
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 0.05;

  renderer.render(scene, camera);

  updateFeatures(dt, elapsedTime);
  updateSpecs(dt, elapsedTime);

  window.requestAnimationFrame(tick);
};

tick();
