import { Injectable } from '@angular/core';
import { IfcAPI, LogLevel, ms, Schemas, IFC4, IFCUNITASSIGNMENT, IFCAXIS2PLACEMENT3D,IFCLENGTHMEASURE,IFCCARTESIANPOINT,IFCAXIS2PLACEMENT2D,IFCCIRCLEPROFILEDEF,IFCDIRECTION,IFCREAL,IFCPOSITIVELENGTHMEASURE,IFCCOLUMN,IFCEXTRUDEDAREASOLID,IFCGLOBALLYUNIQUEID,IFCLABEL,IFCIDENTIFIER, FlatMesh, PlacedGeometry, Color, Vector } from 'web-ifc';

import * as ts from "typescript";

import * as THREE from "three";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { InputDataService } from 'src/app/providers/input-data.service';
import { SceneService } from './scene.service';


@Injectable({
  providedIn: 'root'
})
export class CodeService {

  private ifcAPI = new IfcAPI();

  constructor(
    private input: InputDataService,
    private scene: SceneService) {
      // Initialize web-ifc
      this.ifcAPI.SetWasmPath('/assets/web-ifc/bin/');
      this.ifcAPI.Init().then(() => {
        console.log('web-ifc Initialization complete');
      }).catch((err) => {
        console.error('web-ifc Initialization failed:', err);
      });
    }

  public async runCode() {
    const model = this.ifcAPI.CreateModel({ schema: Schemas.IFC4 });

    const compiled = ts.transpileModule(this.input.code, { compilerOptions: { module: ts.ModuleKind.CommonJS } })
    const outputText = compiled.outputText;
    // this is where we do evil stuff
    {
      console.log(` --- Starting EVAL!`);
      // 引数名を配列として定義
      const args = [
        'ifcAPI',
        'model',
        'IFC4',
        'IFCAXIS2PLACEMENT3D',
        'IFCLENGTHMEASURE',
        'IFCCARTESIANPOINT',
        'IFCAXIS2PLACEMENT2D',
        'IFCCIRCLEPROFILEDEF',
        'IFCDIRECTION',
        'IFCREAL',
        'IFCPOSITIVELENGTHMEASURE',
        'IFCCOLUMN',
        'IFCEXTRUDEDAREASOLID',
        'IFCGLOBALLYUNIQUEID',
        'IFCLABEL',
        'IFCIDENTIFIER'
      ];
      // Function コンストラクタを使用して関数を生成
      const dynamicFunction = new Function(
        ...args,
        outputText
      );
      // 生成した関数を引数とともに実行
      dynamicFunction(
        this.ifcAPI,
        model,
        IFC4,
        IFCAXIS2PLACEMENT3D,
        IFCLENGTHMEASURE,
        IFCCARTESIANPOINT,
        IFCAXIS2PLACEMENT2D,
        IFCCIRCLEPROFILEDEF,
        IFCDIRECTION,
        IFCREAL,
        IFCPOSITIVELENGTHMEASURE,
        IFCCOLUMN,
        IFCEXTRUDEDAREASOLID,
        IFCGLOBALLYUNIQUEID,
        IFCLABEL,
        IFCIDENTIFIER
      );
      console.log(` --- Ending EVAL!`);
    }

    let ifcData = this.ifcAPI.SaveModel(model);
    console.log(new TextDecoder('ascii').decode(ifcData));

    this.ifcAPI.CloseModel(model);

    let modelID = this.ifcAPI.OpenModel(ifcData);

    this.LoadAllGeometry(modelID);
  }

  /**
   * Loads all geometry for the model with id "modelID" into the supplied scene
   * @scene Threejs Scene object
   * @modelID Model handle retrieved by OpenModel, model must not be closed
  */
  public LoadAllGeometry(modelID: number) {

    let geometries: THREE.BufferGeometry[] = [];
    let transparentGeometries: THREE.BufferGeometry[] = [];

    this.ifcAPI.StreamAllMeshes(modelID, (mesh: FlatMesh) => {
      // only during the lifetime of this function call, the geometry is available in memory
      const placedGeometries: Vector<PlacedGeometry> = mesh.geometries;

      for (let i = 0; i < placedGeometries.size(); i++) {
        const placedGeometry: PlacedGeometry = placedGeometries.get(i);
        let mesh = this.getPlacedGeometry(modelID, placedGeometry);
        let geom = mesh.geometry.applyMatrix4(mesh.matrix);
        if (placedGeometry.color.w !== 1) {
          transparentGeometries.push(geom as any);
        }
        else {
          geometries.push(geom as any);
        }
      }

      //console.log(this.ifcAPI.wasmModule.HEAPU8.length);
    });

    console.log("Loading " + geometries.length + " geometries and " + transparentGeometries.length + " transparent geometries");
    if (geometries.length > 0) {
      const combinedGeometry = mergeBufferGeometries(geometries);
      let mat = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide });
      mat.vertexColors = true;
      const mergedMesh = new THREE.Mesh(combinedGeometry, mat);
      this.scene.add(mergedMesh);
    }

    if (transparentGeometries.length > 0) {
      const combinedGeometryTransp = mergeBufferGeometries(transparentGeometries);
      let matTransp = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide });
      matTransp.vertexColors = true;
      matTransp.transparent = true;
      matTransp.opacity = 0.5;
      const mergedMeshTransp = new THREE.Mesh(combinedGeometryTransp, matTransp);
      this.scene.add(mergedMeshTransp);
    }
  }
  
  private getPlacedGeometry(modelID: number, placedGeometry: PlacedGeometry) {
    const geometry = this.getBufferGeometry(modelID, placedGeometry);
    const material = this.getMeshMaterial(placedGeometry.color);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.matrix = this.getMeshMatrix(placedGeometry.flatTransformation);
    mesh.matrixAutoUpdate = false;
    return mesh;
  }

  private getBufferGeometry(modelID: number, placedGeometry: PlacedGeometry) {
    // WARNING: geometry must be deleted when requested from WASM
    const geometry = this.ifcAPI.GetGeometry(modelID, placedGeometry.geometryExpressID);
    const verts = this.ifcAPI.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
    const indices = this.ifcAPI.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
    const bufferGeometry = this.ifcGeometryToBuffer(placedGeometry.color, verts, indices);

    //@ts-ignore
    geometry.delete();
    return bufferGeometry;
  }

  private materials: { [key: string]: THREE.MeshPhongMaterial } = {};

  private getMeshMaterial(color: Color) {
    let colID = `${color.x}${color.y}${color.z}${color.w}`;
    if (this.materials[colID]) {
      return this.materials[colID];
    }

    const col = new THREE.Color(color.x, color.y, color.z);
    const material = new THREE.MeshPhongMaterial({ color: col, side: THREE.DoubleSide });
    material.transparent = color.w !== 1;
    if (material.transparent) material.opacity = color.w;

    this.materials[colID] = material;

    return material;
  }

  private getMeshMatrix(matrix: Array<number>) {
    const mat = new THREE.Matrix4();
    mat.fromArray(matrix);
    return mat;
  }

  private ifcGeometryToBuffer(color: Color, vertexData: Float32Array, indexData: Uint32Array) {
    const geometry = new THREE.BufferGeometry();
    /*
    const buffer32 = new THREE.InterleavedBuffer(vertexData, 6);
    geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(buffer32, 3, 0));
    geometry.setAttribute('normal', new THREE.InterleavedBufferAttribute(buffer32, 3, 3));
    */

    let posFloats = new Float32Array(vertexData.length / 2);
    let normFloats = new Float32Array(vertexData.length / 2);
    let colorFloats = new Float32Array(vertexData.length / 2);

    for (let i = 0; i < vertexData.length; i += 6) {
      posFloats[i / 2 + 0] = vertexData[i + 0];
      posFloats[i / 2 + 1] = vertexData[i + 1];
      posFloats[i / 2 + 2] = vertexData[i + 2];

      normFloats[i / 2 + 0] = vertexData[i + 3];
      normFloats[i / 2 + 1] = vertexData[i + 4];
      normFloats[i / 2 + 2] = vertexData[i + 5];

      colorFloats[i / 2 + 0] = color.x;
      colorFloats[i / 2 + 1] = color.y;
      colorFloats[i / 2 + 2] = color.z;
    }

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(posFloats, 3));
    geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(normFloats, 3));
    geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(colorFloats, 3));
    geometry.setIndex(new THREE.BufferAttribute(indexData, 1));
    return geometry;
  }

}


