import * as THREE from 'three';

interface ThreeColor {
  r: number;
  g: number;
  b: number;
}

interface WorldScene {
  three: THREE.Scene;
  setup(): void;
  config: {
    backgroundColor: ThreeColor;
    directionalLight: { intensity: number };
    ambientLight: { intensity: number };
  };
}

interface WorldCamera {
  controls: {
    setLookAt(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): void;
  };
}

interface WorldRenderer {
  onBeforeUpdate: { add(callback: () => void): void };
  onAfterUpdate: { add(callback: () => void): void };
}

interface World {
  scene: WorldScene;
  camera: WorldCamera;
  renderer: WorldRenderer;
}

interface OBCComponents {
  init(): void;
  get(type: unknown): { create(): World };
  dispose(): void;
}

interface BUIManager {
  init(): void;
}

interface BUIComponent {
  create(callback: () => Element): Element;
}

declare global {
  interface Window {
    threeReady: boolean;
    componentsReady: boolean;
    uiReady: boolean;
    OBC: {
      Components: new () => OBCComponents;
      Worlds: unknown;
      SimpleScene: new (components: OBCComponents) => WorldScene;
      SimpleCamera: new (components: OBCComponents) => WorldCamera;
      SimpleRenderer: new (components: OBCComponents, container: HTMLElement) => WorldRenderer;
    };
    BUI: {
      Manager: BUIManager;
      Component: BUIComponent;
      html: (strings: TemplateStringsArray, ...values: unknown[]) => Element;
    };
  }
}

export {};
