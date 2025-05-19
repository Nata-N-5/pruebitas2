import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local');
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

///////////////CUBEMAP PARA QUE REA REFLECTIVO XD
const path = '/';
				const format = '.png';
				const urls = [
					path + 'px' + format, path + 'nx' + format,
					path + 'py' + format, path + 'ny' + format,
					path + 'pz' + format, path + 'nz' + format
				];

				const reflectionCube = new THREE.CubeTextureLoader().load( urls );
				const refractionCube = new THREE.CubeTextureLoader().load( urls );
				refractionCube.mapping = THREE.CubeRefractionMapping;
                scene.background = reflectionCube;




// Iluminación
scene.add(new THREE.AmbientLight(0x909090));
const pointLight = new THREE.PointLight(0xefefff, 1);
pointLight.position.set(0, 50, 0);
scene.add(pointLight);

// Cámara
camera.position.z = 3;

// Cubo
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.set(0, 0, 0);
// Puntero
let px=0;
let py=0;
function onPointerMove(event) {
      console.log("x="+event.clientX+"y="+event.clientY)
    px= event.clientX;
    py= event.clientY;
}
// XDDDDDDDDDDDDDDDDDDDDDDD

const textureLoader = new THREE.TextureLoader();
const texturePaths = [
    '/tierra.jpg',
    '/marte.jpg',
    '/urano.jpg'
];
const textures = texturePaths.map(path => textureLoader.load(path));

// Planetas
const planets = [];

function createPlanet() {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);

    // Elegir una textura aleatoria
    const randomTexture = textures[Math.floor(Math.random() * textures.length)];
    const material = new THREE.MeshStandardMaterial({ map: randomTexture });

    const planet = new THREE.Mesh(geometry, material);

    // Posición aleatoria
    planet.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6
    );

    scene.add(planet);
    planets.push(planet);

    // Desaparecer después de 5 segundos
    setTimeout(() => {
        scene.remove(planet);//Quitando el objeto de la escena
        planets.splice(planets.indexOf(planet), 1); //Removiendo la referencia del array
    }, 5000);
}

// Crear planetas cada 2 segundos
setInterval(createPlanet, 2000);


// Animación
function animate() {
     planets.forEach(p => {
        p.rotation.y += 0.01;
    });

    if(px>window.innerWidth/2){
         cube.rotation.y +=0.01;
        
    }else{
        cube.rotation.y -=0.01;
    }

    renderer.render(scene, camera);
}
window.addEventListener('pointermove', onPointerMove);
renderer.setAnimationLoop(animate);









// --- Puntero SVG para modo desktop ---
const crosshair = document.createElement('div');
crosshair.style.position = 'fixed';
crosshair.style.width = '60px';
crosshair.style.height = '60px';
crosshair.style.pointerEvents = 'none';
crosshair.style.zIndex = '1000';
crosshair.style.left = '0px';
crosshair.style.top = '0px';

crosshair.innerHTML = `
  <svg width="60" height="60" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" stroke="limegreen" stroke-width="2" fill="none"/>
    <circle cx="50" cy="50" r="30" stroke="limegreen" stroke-width="2" fill="none"/>
    <circle cx="50" cy="50" r="15" stroke="limegreen" stroke-width="2" fill="none"/>
    <line x1="50" y1="0" x2="50" y2="20" stroke="limegreen" stroke-width="2"/>
    <line x1="50" y1="80" x2="50" y2="100" stroke="limegreen" stroke-width="2"/>
    <line x1="0" y1="50" x2="20" y2="50" stroke="limegreen" stroke-width="2"/>
    <line x1="80" y1="50" x2="100" y2="50" stroke="limegreen" stroke-width="2"/>
    <circle cx="50" cy="50" r="5" stroke="limegreen" stroke-width="2" fill="none"/>
    <line x1="50" y1="45" x2="50" y2="55" stroke="limegreen" stroke-width="2"/>
    <line x1="45" y1="50" x2="55" y2="50" stroke="limegreen" stroke-width="2"/>
  </svg>
`;
document.body.appendChild(crosshair);

// Mueve el SVG con el puntero mouse
window.addEventListener('pointermove', (event) => {
  crosshair.style.left = (event.clientX - 30) + 'px';
  crosshair.style.top = (event.clientY - 30) + 'px';
});

// --- Puntero 3D fijo delante de la cámara (para VR sin controladores) ---
const pointerCamGeometry = new THREE.RingGeometry(0.02, 0.03, 32);
const pointerCamMaterial = new THREE.MeshBasicMaterial({color: 'limegreen', opacity: 0.7, transparent: true});
const pointerCamera = new THREE.Mesh(pointerCamGeometry, pointerCamMaterial);
pointerCamera.rotation.x = - Math.PI / 2; // plano horizontal
pointerCamera.position.set(0, 0, -1);    // delante cámara
pointerCamera.visible = false;            // oculto inicialmente
camera.add(pointerCamera);
scene.add(camera);

// --- Puntero 3D pegado al controlador VR ---
const controller = renderer.xr.getController(0);
scene.add(controller);

const pointerCtrlGeometry = new THREE.RingGeometry(0.02, 0.03, 32);
const pointerCtrlMaterial = new THREE.MeshBasicMaterial({color: 'limegreen', opacity: 0.7, transparent: true});
const pointerController = new THREE.Mesh(pointerCtrlGeometry, pointerCtrlMaterial);
pointerController.rotation.x = - Math.PI / 2;
pointerController.position.set(0, 0, -0.05); // un poco delante del controlador
pointerController.visible = false;
controller.add(pointerController);

// --- Detectar si el controlador está conectado ---
let controllerConnected = false;

controller.addEventListener('connected', (event) => {
  controllerConnected = true;
  pointerController.visible = true;
  pointerCamera.visible = false;
});

controller.addEventListener('disconnected', (event) => {
  controllerConnected = false;
  pointerController.visible = false;
  pointerCamera.visible = true; // fallback a puntero cámara si está en VR
});

// --- Eventos para controlar visibilidad de punteros ---
renderer.xr.addEventListener('sessionstart', () => {
  crosshair.style.display = 'none';

  if(controllerConnected){
    pointerController.visible = true;
    pointerCamera.visible = false;
  } else {
    pointerController.visible = false;
    pointerCamera.visible = true;
  }
});

renderer.xr.addEventListener('sessionend', () => {
  crosshair.style.display = 'block';
  pointerController.visible = false;
  pointerCamera.visible = false;
});

