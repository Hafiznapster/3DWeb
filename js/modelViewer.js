import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class ModelViewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.controls = null;
        this.model = null;
        this.mixer = null;
        this.clock = new THREE.Clock();

        this.init();
        this.setupLights();
        this.loadModel();
        this.animate();
    }

    init() {
        // Setup renderer
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.set(0, 1.5, 4);

        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';

        // Setup controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 10;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 1.0;
        this.controls.enableZoom = false;
        this.controls.enablePan = false;
        this.controls.target.set(0, 0.5, 0);

        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional lights
        const frontLight = new THREE.DirectionalLight(0xffffff, 1.2);
        frontLight.position.set(0, 2, 4);
        this.scene.add(frontLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.8);
        backLight.position.set(0, 1, -2);
        this.scene.add(backLight);

        // Add rim lights for better definition
        const rightLight = new THREE.DirectionalLight(0x00ffff, 0.6);
        rightLight.position.set(2, 0, 0);
        this.scene.add(rightLight);

        const leftLight = new THREE.DirectionalLight(0xff00ff, 0.6);
        leftLight.position.set(-2, 0, 0);
        this.scene.add(leftLight);
    }

    loadModel() {
        const loader = new GLTFLoader();

        loader.load(
            './robot_playground.glb',
            (gltf) => {
                this.model = gltf.scene;
                this.model.scale.set(1.2, 1.2, 1.2);
                this.model.position.set(0, -0.5, 0);
                this.scene.add(this.model);

                // Setup animations if they exist
                if (gltf.animations && gltf.animations.length) {
                    this.mixer = new THREE.AnimationMixer(this.model);
                    const action = this.mixer.clipAction(gltf.animations[0]);
                    action.play();
                }

                // Center camera on model
                const box = new THREE.Box3().setFromObject(this.model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                // Adjust model position to center it
                this.model.position.x = this.model.position.x - center.x;
                this.model.position.z = this.model.position.z - center.z;
                
                // Adjust camera position based on model size
                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = this.camera.fov * (Math.PI / 180);
                let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));
                
                // Set camera position
                this.camera.position.z = cameraZ * 0.8;
                this.camera.updateProjectionMatrix();
                
                // Update controls target
                this.controls.target.set(0, center.y * 0.8, 0);
                this.controls.update();
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error happened:', error);
            }
        );
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Update controls
        this.controls.update();

        // Update animations
        if (this.mixer) {
            this.mixer.update(this.clock.getDelta());
        }

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

export { ModelViewer };
