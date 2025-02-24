import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils';
import gsap from 'gsap';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from 'lil-gui';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import vertextextShader from './shaders/textVertex.glsl';
// for text
import {Text} from 'troika-three-text'
// //blob details
// import {blobs} from './public/configval.js'
const blobs = [
 
  {
      name: 'Purple Mirror',
      background: '#5300B1',
      config: { "uPositionFrequency": 0.6, "uPositionStrength": 0.8, "uSmallWavePositionFrequency": 1.5, "uSmallWavePositionStrength": 0.3, "roughness": 0.2, "metalness": 0.8, "envMapIntensity": 1.8, "clearcoat": 0.7, "clearcoatRoughness": 0.1, "transmission": 0.1, "flatShading": false, "wireframe": false, "map": "pink-floyd" },
  },
  {
    name: 'Color Fusion',
    background: '#9D73F7',
    config: { "uPositionFrequency": 1.0, "uPositionStrength": 0.3, "uSmallWavePositionFrequency": 0.5, "uSmallWavePositionStrength": 0.7, "roughness": 1.0, "metalness": 0.0, "envMapIntensity": 0.5, "clearcoat": 0.0, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "cosmic-fusion" },
},
  {
      name: 'Alien Goo',
      background: '#3D643C',
      config: { "uPositionFrequency": 0.584, "uPositionStrength": 0.276, "uSmallWavePositionFrequency": 0.899, "uSmallWavePositionStrength": 1.266, "roughness": 0, "metalness": 1, "envMapIntensity": 2, "clearcoat": 0, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "purple-rain" },
  },
  {
    name: 'Lucky Day',
    background: '#D473F7',
    config: { "uPositionFrequency": 0.8, "uPositionStrength": 0.4, "uSmallWavePositionFrequency": 0.7, "uSmallWavePositionStrength": 0.9, "roughness": 0.8, "metalness": 0.2, "envMapIntensity": 1.0, "clearcoat": 0.3, "clearcoatRoughness": 0.2, "transmission": 0.1, "flatShading": false, "wireframe": false, "map": "lucky-day" },
},
{
  name: 'Sirens',
  background: '#7843F7',
  config: { "uPositionFrequency": 0.1, "uPositionStrength": 0.3, "uSmallWavePositionFrequency": 0.3, "uSmallWavePositionStrength": 0.1, "roughness": 0.3, "metalness": 0.4, "envMapIntensity": 1.5, "clearcoat": 0.9, "clearcoatRoughness": 0.2, "transmission": 0.3, "flatShading": false, "wireframe": false, "map": "sirens" },
},
{
  name: 'White',
  background: '#17070A',
  config: { "uPositionFrequency": 0.45, "uPositionStrength": 0.968, "uSmallWavePositionFrequency": 0.45, "uSmallWavePositionStrength": 0.272, "roughness": 0.3, "metalness": 0.8, "envMapIntensity": 2.0, "clearcoat": 0.9, "clearcoatRoughness": 0.1, "transmission": 0.4, "flatShading": false, "wireframe": false, "map": "synthwave" },
},
{
  name: 'Passion',
  background: '#345E24',
  config: { "uPositionFrequency": 1.8, "uPositionStrength": 0.9, "uSmallWavePositionFrequency": 2.0, "uSmallWavePositionStrength": 0.5, "roughness": 0.1, "metalness": 0.9, "envMapIntensity": 2.5, "clearcoat": 0.8, "clearcoatRoughness": 0.1, "transmission": 0.3, "flatShading": false, "wireframe": false, "map": "passion" },
},

];
// Setup scene
let currentIndex = 0;
let material; // Declare material in global scope
let sphere; // Declare sphere globally
const scene = new THREE.Scene();
scene.background = new THREE.Color(blobs[currentIndex].background);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

// Loading manager
const loadingManager = new THREE.LoadingManager();
let loadingText;
loadingManager.onProgress = (url, loaded, total) => {
  if (!loadingText) {
    loadingText = document.createElement('div');
    loadingText.style.position = 'fixed';
    loadingText.style.top = '50%';
    loadingText.style.left = '50%';
    loadingText.style.transform = 'translate(-50%, -50%)';
    loadingText.style.color = 'white';
    loadingText.style.fontSize = '24px';
    document.body.appendChild(loadingText);
  }
  
  loadingText.textContent = `Loading: ${Math.round((loaded / total) * 100)}%`;
  
  if (loaded === total) {
    loadingText.remove();
    loadingText = null;
  }
};
loadingManager.onError = (url) => {
  const errorText = document.createElement('div');
  errorText.style.position = 'fixed';
  errorText.style.top = '50%';
  errorText.style.left = '50%';
  errorText.style.transform = 'translate(-50%, -50%)';
  errorText.style.color = 'red';
  errorText.style.fontSize = '24px';
  errorText.textContent = `Error loading ${url}`;
  document.body.appendChild(errorText);
  setTimeout(() => errorText.remove(), 3000);
};

// Load HDRI environment map
new RGBELoader(loadingManager).load(
  'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_04_1k.hdr',
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  },
  undefined,
  (error) => console.error('Failed to load HDRI:', error)
);

// Uniforms for shader
const uniforms = {
  uTime: { value: 0 },
  uPositionStrength: { value: blobs[0].config.uPositionStrength },
  uPositionFrequency: { value: blobs[0].config.uPositionFrequency },
  uTimeFrequency: { value: 0.1 },
  uSmallWavePositionFrequency: { value: blobs[0].config.uSmallWavePositionFrequency },
  uSmallWaveTimeFrequency: { value: 0.2 },
  uSmallWavePositionStrength: { value: blobs[0].config.uSmallWavePositionStrength },
  uTexture: { value: null } // Add texture uniform
};

//nav loading
window.addEventListener("load", () => {
  gsap.to("#navbar", { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
});

// // GUI setup
// const gui = new GUI();
// const waveFolder = gui.addFolder('Wave Parameters');
// waveFolder.add(uniforms.uPositionStrength, 'value', 0, 2).name('Position Strength');
// waveFolder.add(uniforms.uPositionFrequency, 'value', 0, 5).name('Position Frequency');
// waveFolder.add(uniforms.uTimeFrequency, 'value', 0, 5).name('Time Frequency');
// const smallWaveFolder = gui.addFolder('Small Wave Parameters');
// smallWaveFolder.add(uniforms.uSmallWavePositionFrequency, 'value', 0, 5).name('Position Frequency');
// smallWaveFolder.add(uniforms.uSmallWaveTimeFrequency, 'value', 0, 5).name('Time Frequency');
// smallWaveFolder.add(uniforms.uSmallWavePositionStrength, 'value', 0, 2).name('Position Strength');

// Load texture first
const textureLoader = new THREE.TextureLoader(loadingManager);
textureLoader.load('./images.jpg', (texture) => {
    console.log('Texture loaded:', texture);
    uniforms.uTexture.value = texture; // Set texture uniform
    
    // Create sphere with shader material
    material = new CustomShaderMaterial({ // Assign to global material variable
      baseMaterial: THREE.MeshPhysicalMaterial,
      vertexShader,
      map: textureLoader.load(`./gradients/${blobs[currentIndex].config.map}.png`),
      fragmentShader,
      uniforms,
      metalness: blobs[currentIndex].config.metalness,
      roughness: blobs[currentIndex].config.roughness,
      envMapIntensity: blobs[currentIndex].config.envMapIntensity,
      clearcoat: blobs[currentIndex].config.clearcoat,
      clearcoatRoughness: blobs[currentIndex].config.clearcoatRoughness,
      transmission: blobs[currentIndex].config.transmission,
      flatShading: blobs[currentIndex].config.flatShading,
      wireframe: blobs[currentIndex].config.wireframe,
    });

    // Geometry setup
    const mergedGeometry = mergeVertices(new THREE.IcosahedronGeometry(2, 100));
    mergedGeometry.computeVertexNormals();
    mergedGeometry.computeTangents();

    sphere = new THREE.Mesh(mergedGeometry, material);
    scene.add(sphere);
});
//text material
const textMaterial = new THREE.ShaderMaterial({
    side:THREE.DoubleSide,
    vertexShader:vertextextShader,
    fragmentShader:`
    void main(){
        gl_FragColor = vec4(1.0);
    }
    `,
    uniforms:{
      progress:{value:0},
      direction:{value:1}
    }
});
//text for blob
const texts = blobs.map((blob,index) => {
    const text = new Text();
    text.text = blob.name;
    text.fontSize = window.innerWidth/2000;
    text.material = textMaterial;
    text.color = blob.background;
    if(index !== 0)text.scale.set(0,0,0);
    text.font = './aften_screen.woff';
    text.anchorX = 'center';
    text.anchorY = 'middle';
    text.position.set(0,0,3);
    text.glyphGeometryDetail = 1;
    text.sync();
    scene.add(text);
    return text;
});
//animation for text on wheel
let isAnimating = false;
window.addEventListener('wheel',(e) => {
    if(isAnimating)return;
    isAnimating = true;
    let direction = Math.sign(e.deltaY);
    let next = (currentIndex + direction + blobs.length)%blobs.length;
    texts[next].scale.set(1,1,1);
    texts[next].position.x = -direction*5;

    gsap.to(textMaterial.uniforms.progress,{value:0.5,duration:1,ease:'linear',
      onComplete:() => {
        isAnimating = false;
        textMaterial.uniforms.progress.value = 0;
        currentIndex = next;
      }
    });
    
    // Add sphere rotation animation
    gsap.to(sphere.rotation, {
      y: sphere.rotation.y + direction * Math.PI * 2,
      duration: 1,
      ease: 'power2.out'
    });

    gsap.to(texts[currentIndex].position,{x:direction*5,duration:1,ease:'power2.out'});
    gsap.to(texts[next].position,{x:0,duration:1,ease:'power2.out'});
    const bg = new THREE.Color(blobs[next].background);
    gsap.to(scene.background,{r:bg.r,g:bg.g,b:bg.b,duration:1,ease:'linear'});
    updateBlob(blobs[next].config);
});
function updateBlob(config) {
  if (!material) return; // Guard clause in case material isn't initialized yet
  
  if (config.uPositionFrequency !== undefined) gsap.to(uniforms.uPositionFrequency, { value: config.uPositionFrequency, duration: 1, ease: 'power2.inOut' });
  if (config.uPositionStrength !== undefined) gsap.to(uniforms.uPositionStrength, { value: config.uPositionStrength, duration: 1, ease: 'power2.inOut' });
  if (config.uSmallWavePositionFrequency !== undefined) gsap.to(uniforms.uSmallWavePositionFrequency, { value: config.uSmallWavePositionFrequency, duration: 1, ease: 'power2.inOut' });
  if (config.uSmallWavePositionStrength !== undefined) gsap.to(uniforms.uSmallWavePositionStrength, { value: config.uSmallWavePositionStrength, duration: 1, ease: 'power2.inOut' });
  if (config.uSmallWaveTimeFrequency !== undefined) gsap.to(uniforms.uSmallWaveTimeFrequency, { value: config.uSmallWaveTimeFrequency, duration: 1, ease: 'power2.inOut' });
  if (config.map !== undefined) {
    setTimeout(() => {
      material.map = textureLoader.load(`./gradients/${blobs[currentIndex].config.map}.png`);
    }, 400);
  }
  if (config.roughness !== undefined) gsap.to(material, { roughness: config.roughness, duration: 1, ease: 'power2.inOut' });
  if (config.metalness !== undefined) gsap.to(material, { metalness: config.metalness, duration: 1, ease: 'power2.inOut' });
  if (config.envMapIntensity !== undefined) gsap.to(material, { envMapIntensity: config.envMapIntensity, duration: 1, ease: 'power2.inOut' });
  if (config.clearcoat !== undefined) gsap.to(material, { clearcoat: config.clearcoat, duration: 1, ease: 'power2.inOut' });
  if (config.clearcoatRoughness !== undefined) gsap.to(material, { clearcoatRoughness: config.clearcoatRoughness, duration: 1, ease: 'power2.inOut' });
  if (config.transmission !== undefined) gsap.to(material, { transmission: config.transmission, duration: 1, ease: 'power2.inOut' });
  if (config.flatShading !== undefined) material.flatShading = config.flatShading;
  if (config.wireframe !== undefined) material.wireframe = config.wireframe;
  
  material.needsUpdate = true;
}
// Position camera
camera.position.z = 5;
// Adjust camera FOV and sphere scale based on screen width
function adjustForMobile() {
  const isMobile = window.innerWidth < 768; // Adjust the breakpoint as needed
  camera.fov = isMobile ? 90 : 75; // Increase FOV for mobile
  camera.updateProjectionMatrix();

  if (sphere) {
    sphere.scale.set(isMobile ? 1.5 : 1, isMobile ? 1.5 : 1, isMobile ? 1.5 : 1);
  }
}

// Call the function initially and on window resize
adjustForMobile();
// Animation loop
function animate() {
  requestAnimationFrame(animate);
  uniforms.uTime.value += 0.01;
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  adjustForMobile();
});