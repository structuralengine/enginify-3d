'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Stats from 'stats.js';

interface ThreeColor {
  r: number;
  g: number;
  b: number;
}

interface World {
  scene: {
    three: THREE.Scene;
    setup(): void;
    config: {
      backgroundColor: ThreeColor;
      directionalLight: { intensity: number };
      ambientLight: { intensity: number };
    };
  };
  camera: {
    controls: { setLookAt(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): void };
  };
  renderer: {
    onBeforeUpdate: { add(callback: () => void): void };
    onAfterUpdate: { add(callback: () => void): void };
  };
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
    OBC: {
      Components: new () => OBCComponents;
      Worlds: unknown;
      SimpleScene: new (components: OBCComponents) => World['scene'];
      SimpleCamera: new (components: OBCComponents) => World['camera'];
      SimpleRenderer: new (components: OBCComponents, container: HTMLElement) => World['renderer'];
    };
    BUI: {
      Manager: BUIManager;
      Component: BUIComponent;
      html: (strings: TemplateStringsArray, ...values: unknown[]) => Element;
    };
  }
}

export default function IFCViewer() {
  const initialized = useRef(false);
  const componentsRef = useRef<OBCComponents | null>(null);
  const worldRef = useRef<World | null>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const container = document.getElementById('world-container');
    if (!container) {
      console.error('Container element not found');
      return;
    }
    
    try {
      componentsRef.current = new window.OBC.Components();
      const worlds = componentsRef.current.get(window.OBC.Worlds);
      worldRef.current = worlds.create();

      console.log('Setting up scene components...');
      worldRef.current.scene = new window.OBC.SimpleScene(componentsRef.current);
      worldRef.current.camera = new window.OBC.SimpleCamera(componentsRef.current);
      worldRef.current.renderer = new window.OBC.SimpleRenderer(componentsRef.current, container);
    } catch (error) {
      console.error('Error initializing world:', error);
      if (componentsRef.current) {
        componentsRef.current.dispose();
      }
      return;
    }

    if (!worldRef.current || !componentsRef.current) return;

    const material = new THREE.MeshLambertMaterial({ color: "#6528D7" });
    const geometry = new THREE.BoxGeometry();
    const cube = new THREE.Mesh(geometry, material);
    worldRef.current.scene.three.add(cube);

    worldRef.current.camera.controls.setLookAt(3, 3, 3, 0, 0, 0);
    worldRef.current.scene.setup();
    
    componentsRef.current.init();

    // Add Stats.js
    const stats = new Stats();
    stats.showPanel(2);
    document.body.append(stats.dom);
    stats.dom.style.left = "0px";
    stats.dom.style.zIndex = "unset";
    if (!worldRef.current) return;
    worldRef.current.renderer.onBeforeUpdate.add(() => stats.begin());
    worldRef.current.renderer.onAfterUpdate.add(() => stats.end());

    // Initialize UI
    window.BUI.Manager.init();

    // Create UI panel
    const panel = window.BUI.Component.create(() => {
      return window.BUI.html`
        <bim-panel label="Worlds Tutorial" class="options-menu">
          <bim-panel-section collapsed label="Controls">
            <bim-color-input
              label="Background Color" 
              color="#202932"
              @input="${({ target }: { target: { color: string } }) => {
                if (!worldRef.current) return;
                worldRef.current.scene.config.backgroundColor = new THREE.Color(target.color);
              }}">
            </bim-color-input>
            <bim-number-input
              slider
              step="0.1"
              label="Directional lights intensity"
              value="1.5"
              min="0.1"
              max="10"
              @change="${({ target }: { target: { value: number } }) => {
                if (!worldRef.current) return;
                worldRef.current.scene.config.directionalLight.intensity = target.value;
              }}">
            </bim-number-input>
            <bim-number-input
              slider
              step="0.1"
              label="Ambient light intensity"
              value="1"
              min="0.1"
              max="5"
              @change="${({ target }: { target: { value: number } }) => {
                if (!worldRef.current) return;
                worldRef.current.scene.config.ambientLight.intensity = target.value;
              }}">
            </bim-number-input>
          </bim-panel-section>
        </bim-panel>
      `;
    });
    document.body.append(panel);

    // Add mobile menu button
    const button = window.BUI.Component.create(() => {
      return window.BUI.html`
        <bim-button
          class="phone-menu-toggler"
          icon="solar:settings-bold"
          @click="${() => {
            if (panel.classList.contains("options-menu-visible")) {
              panel.classList.remove("options-menu-visible");
            } else {
              panel.classList.add("options-menu-visible");
            }
          }}">
        </bim-button>
      `;
    });
    document.body.append(button);

    return () => {
      // Cleanup
      if (componentsRef.current) {
        componentsRef.current.dispose();
      }
      document.body.removeChild(stats.dom);
      document.body.removeChild(panel);
      document.body.removeChild(button);
    };
  }, []);

  return (
    <main className="full-screen">
      <div id="world-container" className="full-screen" />
    </main>
  );
}
