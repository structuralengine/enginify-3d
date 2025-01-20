'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { IfcAPI, IFC4 } from 'web-ifc';
import Controls from './components/Controls';
import IFCViewer, { IFCViewerHandle } from './components/IFCViewer';
import { exampleCode } from './lib/exampleCode';
import { initializeIFC, createModel, clearMemory, setLogLevel } from '@/app/lib/ifc-utils';

// Dynamically import Monaco editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('./components/MonacoEditor'), {
  ssr: false
});

export default function Home() {
  const [code, setCode] = useState(exampleCode);
  const [logLevel, setLogLevel] = useState('4');
  const viewerRef = useRef<IFCViewerHandle>(null);

  const handleRunCode = async () => {
    try {
      console.log('Initializing IFC API...');
      const ifcAPI = await viewerRef.current?.initializeIFC();
      if (!ifcAPI) {
        console.error('Failed to initialize IFC API');
        return;
      }
      console.log('IFC API initialized successfully');

      console.log('Creating new model...');
      const modelID = await createModel();
      console.log('Model created with ID:', modelID);
      
      console.log('Preparing to run code...');
      
      try {
        // Create function with API, model, and IFC constants in scope
        const constants: Record<string, number> = {};
        
        // Import and use constants from web-ifc package
        const WebIFC = await import('web-ifc');
        console.log('WebIFC module:', WebIFC);
        console.log('IFC4 namespace:', WebIFC.IFC4);
        if (WebIFC.IFC4) {
          console.log('IfcProfileTypeEnum:', WebIFC.IFC4.IfcProfileTypeEnum);
          console.log('AREA enum value:', WebIFC.IFC4.IfcProfileTypeEnum?.AREA);
        } else {
          console.log('IFC4 namespace not found - will need to use string literals');
        }
        
        // Add essential IFC constants
        const {
          IFCDIRECTION,
          IFCREAL,
          IFCCARTESIANPOINT,
          IFCLENGTHMEASURE,
          IFCAXIS2PLACEMENT2D,
          IFCCIRCLEPROFILEDEF,
          IFCLABEL,
          IFCPOSITIVELENGTHMEASURE,
          IFCCOLUMN,
          IFCGLOBALLYUNIQUEID,
          IFCIDENTIFIER,
          IFCAXIS2PLACEMENT3D,
          IFCEXTRUDEDAREASOLID
        } = WebIFC;
        
        Object.assign(constants, {
          IFCDIRECTION,
          IFCREAL,
          IFCCARTESIANPOINT,
          IFCLENGTHMEASURE,
          IFCAXIS2PLACEMENT2D,
          IFCCIRCLEPROFILEDEF,
          IFCLABEL,
          IFCPOSITIVELENGTHMEASURE,
          IFCCOLUMN,
          IFCGLOBALLYUNIQUEID,
          IFCIDENTIFIER,
          IFCAXIS2PLACEMENT3D,
          IFCEXTRUDEDAREASOLID
        });
        
        console.log('IFC constants loaded:', constants);
        
        // Execute the code with constants and IFC4
        const constantsCode = Object.entries(constants)
          .map(([key, value]) => `const ${key} = ${value};`)
          .join('\n') + '\nconst IFC4 = WebIFC.IFC4;';
        
        console.log('Generated constants code:', constantsCode);
        
        // Create async function to execute code with proper scoping
        const executeCode = async (
          ifcAPI: any,
          model: number,
          constants: Record<string, number>,
          userCode: string
        ): Promise<void> => {
          try {
            // Execute the code with proper async context
            // Wrap the entire code in an async IIFE with constants in scope
            const wrappedCode = `
              (async () => {
                try {
                  ${constantsCode}
                  ${userCode}
                } catch (error) {
                  console.error('Error in executed code:', error);
                  throw error;
                }
              })()
            `;
            
            // Execute the wrapped code
            return await eval(wrappedCode);
          } catch (error) {
            console.error('Error evaluating code:', error);
            throw error;
          }
        };
        
        console.log('Running code with IFC constants...');
        await executeCode(ifcAPI, modelID, constants, code);
        console.log('Code executed successfully');

        console.log('Loading geometry...');
        const flatMeshes = ifcAPI.LoadAllGeometry(modelID);
        if (!flatMeshes || flatMeshes.size() === 0) {
          console.error('No geometry loaded for model');
          return;
        }
        
        // Get the first mesh's first geometry
        const firstMesh = flatMeshes.get(0);
        if (firstMesh.geometries.size() === 0) {
          console.error('No geometries in first mesh');
          return;
        }
        
        // Get geometry data using the first placed geometry's ID
        const firstGeometryID = firstMesh.geometries.get(0).geometryExpressID;
        const geometry = ifcAPI.GetGeometry(modelID, firstGeometryID);
        
        console.log('Loading model in viewer...');
        await viewerRef.current?.loadIFCModel(modelID, geometry);
        console.log('Model loaded successfully');
      } catch (error) {
        console.error('Error in code execution:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error running code:', error);
      console.error('Error details:', (error as any).stack);
    }
  };

  const handleClearMemory = () => {
    clearMemory();
    viewerRef.current?.clearScene();
  };

  const handleResetEditor = () => {
    setCode(exampleCode);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Initialize IFC viewer
      const ifcAPI = await viewerRef.current?.initializeIFC();
      if (!ifcAPI) return;

      // Load the file data
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Open the model from data
      const modelID = ifcAPI.OpenModel(uint8Array, {
        COORDINATE_TO_ORIGIN: true,
        CIRCLE_SEGMENTS: 32
      });
      
      console.log('Model opened with ID:', modelID);
      
      // Get all geometry for the model
      const flatMeshes = ifcAPI.LoadAllGeometry(modelID);
      if (!flatMeshes || flatMeshes.size() === 0) {
        console.error('No geometry loaded for model');
        return;
      }
      
      // Get the first mesh's first geometry
      const firstMesh = flatMeshes.get(0);
      if (firstMesh.geometries.size() === 0) {
        console.error('No geometries in first mesh');
        return;
      }
      
      // Get geometry data using the first placed geometry's ID
      const firstGeometryID = firstMesh.geometries.get(0).geometryExpressID;
      const geometry = ifcAPI.GetGeometry(modelID, firstGeometryID);
      
      // Load the model in the viewer
      await viewerRef.current?.loadIFCModel(modelID, geometry);
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  const handleLogLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLevel = event.target.value;
    setLogLevel(newLevel);
    setLogLevel(newLevel);
  };

  return (
    <main className="flex h-screen">
      <div className="w-2/5 border-r">
        <MonacoEditor value={code} onChange={setCode} />
      </div>
      <div className="w-3/5 flex flex-col">
        <div className="h-[90%]" id="3dcontainer">
          <IFCViewer ref={viewerRef} />
        </div>
        <Controls
          onRunCode={handleRunCode}
          onClearMemory={handleClearMemory}
          onResetEditor={handleResetEditor}
          onFileChange={handleFileChange}
          onLogLevelChange={handleLogLevelChange}
          logLevel={logLevel}
        />
      </div>
    </main>
  );
}
