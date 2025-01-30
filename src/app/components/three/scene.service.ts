import { Injectable } from '@angular/core';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";

@Injectable({
  providedIn: "root"
})
export class SceneService {

  // コンテナ
  private container: HTMLCanvasElement | undefined = undefined;
  // シーン
  private scene: THREE.Scene | null  = null;
  // レンダラー
  private renderer: THREE.WebGLRenderer | null = null;
  // カメラ
  private camera: THREE.OrthographicCamera | null = null;
  private frustumSize = 50; // カメラの視錐台（フラスタム）のサイズ

  // レイキャスタ―
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  // マウス位置の記憶
  private controls: OrbitControls | null = null;
  private onUpPosition = new THREE.Vector2();
  private onDownPosition = new THREE.Vector2();

  // 物体移動コントローラー
  private transformControl:TransformControls | null = null;
  private transformTarget = []; // 物体移動ターゲット

  // 設置元から呼び出される初期化
  public OnInit(_ontainer: HTMLCanvasElement): boolean {

    this.container = _ontainer;

    if(this.renderer !== null) {
      this.container.appendChild( this.renderer.domElement );
      this.onWindowResize();
      return false; // 初期化済ならスキップ
    }

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xf0f0f0 );

    // レンダラーをバインド
    this.render = this.render.bind(this);

    // カメラの設定
    const SCREEN_WIDTH = this.container.clientWidth;
    const SCREEN_HEIGHT = this.container.clientHeight;
    const cameraMatrix = this.getCameraMatrix(SCREEN_WIDTH, SCREEN_HEIGHT);
    const near: number = 0.1;
    const far: number = 1000;
    this.camera = new THREE.OrthographicCamera( 
      cameraMatrix.left, cameraMatrix.right, 
      cameraMatrix.top, cameraMatrix.bottom, 
      near, far );
    this.camera.position.set( 15, 15, 15 );
    this.scene.add( this.camera );

    // ライトの設定
    this.scene.add( new THREE.AmbientLight( 0xf0f0f0, 3 ) );
    const light = new THREE.SpotLight( 0xffffff, 4.5 );
    light.position.set( 1000, 1000, 1000 );
    light.angle = Math.PI * 0.2;
    light.decay = 0;
    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 1000;
    light.shadow.bias = - 0.000222;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    this.scene.add( light );

    // 床の設定
    const planeGeometry = new THREE.PlaneGeometry( 100, 100 );
    planeGeometry.rotateX( - Math.PI / 2 );
    const planeMaterial = new THREE.ShadowMaterial( { color: 0x000000, opacity: 0.2 } );

    const plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.position.y = -0.2;
    plane.receiveShadow = true;
    this.scene.add( plane );

    const helper = new THREE.GridHelper( 100, 100 );
    helper.position.y = -0.199;
    (helper.material as THREE.Material).opacity = 0.25;
    (helper.material as THREE.Material).transparent = true;
    this.scene.add( helper );

    // レンダラーの設定
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild( this.renderer.domElement );

    // 視点移動コントロールの設定
    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    // this.controls.enableDamping = true; // スムーズな操作のため
    this.controls.addEventListener( 'change', this.render );
    this.camera.updateMatrix();
    this.controls.update();

    // 物体移動コントロールの設定
    this.transformControl = new TransformControls( this.camera, this.renderer.domElement );
    this.transformControl.addEventListener( 'change', this.render );
    this.transformControl.addEventListener( 'dragging-changed', ( event ) => {
      if(this.controls === null)  return;
      this.controls.enabled = ! event.value;
    });
    this.scene.add( this.transformControl );
    this.transformControl.addEventListener( 'objectChange', this.updateObject );

    this.render();

    return true;
  }
  
  // 再描画
  public render() {
    if(this.renderer === null || this.scene === null || this.camera === null) {
      return;
    }

    this.renderer.render( this.scene, this.camera );
  }

  // 物体移動後の処理
  private updateObject() {

  }

  // マウスDown
  public onPointerDown( event: MouseEvent ) {
    this.onDownPosition.x = event.clientX;
    this.onDownPosition.y = event.clientY;
  }

  // マウスUp
  public onPointerUp( event: MouseEvent ) {
    if(this.transformControl === null) {
      return;
    }
    this.onUpPosition.x = event.clientX;
    this.onUpPosition.y = event.clientY;
    if ( this.onDownPosition.distanceTo( this.onUpPosition ) === 0 ) {
      this.transformControl.detach();
      this.render();
    }
  }

  // マウスMove
  public onPointerMove( event: MouseEvent ) {
    if(this.transformControl === null || this.camera === null) {
      return;
    }

    this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    this.raycaster.setFromCamera( this.pointer, this.camera );
    const intersects = this.raycaster.intersectObjects( this.transformTarget, false );
    if ( intersects.length > 0 ) {
      const object = intersects[ 0 ].object;
      if ( object !== this.transformControl.object ) {
        this.transformControl.attach( object );
      }
    }
  }

  // ウィンドウリサイズ
  public onWindowResize(): void {
    if(this.container === undefined || this.renderer === null|| this.camera === null) {
      return;
    }
    
    const SCREEN_WIDTH = this.container.clientWidth;
    const SCREEN_HEIGHT = this.container.clientHeight;
    const cameraMatrix = this.getCameraMatrix(SCREEN_WIDTH, SCREEN_HEIGHT);

    this.camera.left = cameraMatrix.left;
    this.camera.right = cameraMatrix.right;
    this.camera.top = cameraMatrix.top;
    this.camera.bottom = cameraMatrix.bottom;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    
    this.render();
  }

  private getCameraMatrix(SCREEN_WIDTH: number, SCREEN_HEIGHT: number): {left: number, right: number, top: number, bottom: number} {
    const aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    
    return {
      'left': this.frustumSize * aspect / -2,
      'right': this.frustumSize * aspect / 2,
      'top': this.frustumSize / 2,
      'bottom': this.frustumSize / -2
    }

  }

  // シーンにオブジェクトを追加する
  public add(...threeObject: THREE.Object3D[]): void {
    if(!this.scene) return;
    for (const obj of threeObject) {
      this.scene.add(obj);
    }
  }
}
