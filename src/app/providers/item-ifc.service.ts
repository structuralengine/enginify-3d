import { Injectable } from '@angular/core';
import { SceneService } from '../components/three/scene.service';
import * as THREE from "three";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { IfcAPI, FlatMesh, PlacedGeometry, Color, Vector } from 'web-ifc';



@Injectable({
  providedIn: 'root'
})
export class ItemIfcService {

  constructor( private scene: SceneService) { }

  /**
   * Loads all geometry for the model with id "modelID" into the supplied scene
   * @scene Threejs Scene object
   * @modelID Model handle retrieved by OpenModel, model must not be closed
  */
  public LoadAllGeometry(ifcAPI: IfcAPI, modelID: number) {

    let geometries: THREE.BufferGeometry[] = [];
    let transparentGeometries: THREE.BufferGeometry[] = [];

    ifcAPI.StreamAllMeshes(modelID, (mesh: FlatMesh) => {
      // only during the lifetime of this function call, the geometry is available in memory
      const placedGeometries: Vector<PlacedGeometry> = mesh.geometries;

      for (let i = 0; i < placedGeometries.size(); i++) {
        const placedGeometry: PlacedGeometry = placedGeometries.get(i);
        let mesh = this.getPlacedGeometry(ifcAPI, modelID, placedGeometry);
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
      let mat = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide });
      mat.vertexColors = true;
      geometries.forEach(geom => {

        const newMesh = new THREE.Mesh(geom, mat);
        newMesh.name = `ifc`;

        // 座標データを取得 ----------------------------
        const positions = (geom.attributes.position as THREE.BufferAttribute).array;
        // 平均を計算
        const avg = new THREE.Vector3();
        for (let i = 0; i < positions.length; i += 3) {
          avg.add(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
        }
        avg.divideScalar(positions.length / 3);
        // --------------------------------------------
        (newMesh as any).center = avg; // 平均座標を保持

        this.scene.add(newMesh)
      });
    }

    if (transparentGeometries.length > 0) {
      let matTransp = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide });
      matTransp.vertexColors = true;
      matTransp.transparent = true;
      matTransp.opacity = 0.5;
      transparentGeometries.forEach(geom => {
        const mergedMeshTransp = new THREE.Mesh(geom, matTransp);
        mergedMeshTransp.name = "transparent-ifc";
        this.scene.add(mergedMeshTransp);
      });
    }

    this.scene.render();

  }
  
  private getPlacedGeometry(ifcAPI: IfcAPI, modelID: number, placedGeometry: PlacedGeometry) {
    const geometry = this.getBufferGeometry(ifcAPI, modelID, placedGeometry);
    const material = this.getMeshMaterial(placedGeometry.color);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.matrix = this.getMeshMatrix(placedGeometry.flatTransformation);
    mesh.matrixAutoUpdate = false;
    return mesh;
  }

  private getBufferGeometry(ifcAPI: IfcAPI, modelID: number, placedGeometry: PlacedGeometry) {
    // WARNING: geometry must be deleted when requested from WASM

    const geometry = ifcAPI.GetGeometry(modelID, placedGeometry.geometryExpressID);
    const verts = ifcAPI.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
    const indices = ifcAPI.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
    const org_color = placedGeometry.color;
    const my_color: Color = {
        x: 0.1,
        y: 0.1,
        z: 0.1,
        w: org_color.w
    }
    const bufferGeometry = this.ifcGeometryToBuffer(my_color, verts, indices);

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
    /*
    // 各頂点の色データを作成
    const colors = [];

    for (let i = 0; i < vertexData.length; i++) {
        // ランダムな色を生成 (0から1の範囲)
        const r = Math.random();
        const g = Math.random();
        const b = Math.random();
        colors.push(r, g, b);
    }

    // color 属性をジオメトリに設定
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    */

    geometry.setIndex(new THREE.BufferAttribute(indexData, 1));
    return geometry;
  }

}


