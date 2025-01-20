import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { IfcAPI } from 'web-ifc';

export class Scene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private ifcAPI: IfcAPI | null = null;

  constructor(container: HTMLElement) {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;
    this.camera.position.y = 5;
    this.camera.position.x = 5;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // Grid
    const grid = new THREE.GridHelper(10, 10);
    this.scene.add(grid);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 5, 5);
    this.scene.add(directionalLight);

    // Start animation loop
    this.animate();
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public resize = () => {
    const container = this.renderer.domElement.parentElement;
    if (!container) return;

    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  };

  public dispose = () => {
    this.renderer.dispose();
    this.scene.clear();
  };

  public addObject = (object: THREE.Object3D) => {
    this.scene.add(object);
  };

  public clearScene = () => {
    while(this.scene.children.length > 0) { 
      this.scene.remove(this.scene.children[0]);
    }
    // Re-add grid
    const grid = new THREE.GridHelper(10, 10);
    this.scene.add(grid);

    // Re-add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 5, 5);
    this.scene.add(directionalLight);
  };

  public async initializeIFC() {
    if (!this.ifcAPI) {
      this.ifcAPI = new IfcAPI();
      const wasmPath = window.location.origin + '/web-ifc.wasm';
      await this.ifcAPI.Init(() => wasmPath);
    }
    return this.ifcAPI;
  }

  public async loadIFCModel(modelID: number, geometry: { GetVertexData(): number, GetVertexDataSize(): number, GetIndexData(): number, GetIndexDataSize(): number }) {
    if (!this.ifcAPI) return;
    
    // Convert IFC geometry to Three.js geometry
    const bufferGeometry = new THREE.BufferGeometry();
    const vertexData = new Float32Array(this.ifcAPI!.wasmModule.HEAPF32.buffer, geometry.GetVertexData(), geometry.GetVertexDataSize() / 4);
    const indexData = new Uint32Array(this.ifcAPI!.wasmModule.HEAPU32.buffer, geometry.GetIndexData(), geometry.GetIndexDataSize() / 4);
    
    bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertexData, 3));
    bufferGeometry.setIndex(new THREE.Uint32BufferAttribute(indexData, 1));
    
    // Create mesh
    const material = new THREE.MeshPhongMaterial({ 
      color: 0xcccccc,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(bufferGeometry, material);
    
    // Add to scene
    this.scene.add(mesh);
  }
}
