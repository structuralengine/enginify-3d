'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Scene } from './IFCViewer/Scene';
import { IfcAPI } from 'web-ifc';

export interface IFCViewerHandle {
  initializeIFC: () => Promise<IfcAPI | undefined>;
  loadIFCModel: (modelID: number, geometry: { GetVertexData(): number, GetVertexDataSize(): number, GetIndexData(): number, GetIndexDataSize(): number }) => Promise<void>;
  clearScene: () => void;
}

const IFCViewer = forwardRef<IFCViewerHandle>((_, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    sceneRef.current = new Scene(containerRef.current);

    // Handle resize
    const handleResize = () => {
      sceneRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      sceneRef.current?.dispose();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    initializeIFC: async () => {
      return sceneRef.current?.initializeIFC();
    },
    loadIFCModel: async (modelID: number, geometry: any) => {
      await sceneRef.current?.loadIFCModel(modelID, geometry);
    },
    clearScene: () => {
      sceneRef.current?.clearScene();
    }
  }));

  return <div ref={containerRef} className="w-full h-full" />;
});

IFCViewer.displayName = 'IFCViewer';
export default IFCViewer;
