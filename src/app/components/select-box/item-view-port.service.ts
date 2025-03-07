import { Injectable } from '@angular/core';
import { SceneService } from '../three/scene.service';
import * as THREE from "three";
import { KonvaShapeService } from '../konva/konva.shape.service';
import { KonvaStageService } from '../konva/konva.stage.service';

@Injectable({
  providedIn: 'root'
})
export class ItemViewPortService {

  constructor( 
    private scene: SceneService,
    private stage: KonvaStageService,
    private shape: KonvaShapeService
  ) { }

  public createItem() {
    // three.js のメッシュを作成
    const plane = this.createMesh();
    // ViewPort に表示するアイテムを作成
    const paths: any[] = this.setinViewPort(plane);
    // konva.js の図形を作成
    this.createShape(plane, paths);
  }

  ////////////////////////////////////////////////////////////////////
  // ViewPort に表示するアイテムを作成
  private setinViewPort(plane: THREE.Mesh): any[] {

    // 投影対象となる現在シーンに登録されているオブジェクト
    let objList = this.scene.get();
    // 例外処理（ViewPortに反映しないものはスキップ）
    objList = objList.filter(obj => obj.type == 'Mesh');
    objList = objList.filter(obj => obj.name !== 'view port');
    // ワールド空間での Plane の法線を取得（通常、PlaneGeometry は XY 平面や XZ 平面に配置されているので注意）
    const position = plane.getWorldPosition(new THREE.Vector3());
    const normal = plane.getWorldDirection(new THREE.Vector3());
    // --- 投影面内の座標系を構築 ---
    // 基準として (0,1,0) を使い、これと法線の外積で平面内のX軸を求める
    let xAxis = new THREE.Vector3(0, 1, 0).cross(normal);
    if (xAxis.lengthSq() === 0) {
      // (0,1,0) と normal が平行の場合、代わりに (1,0,0) を利用
      xAxis = new THREE.Vector3(1, 0, 0).cross(normal);
    }
    xAxis.normalize();
    // Y軸は、法線とX軸との外積で求め、右手系となるようにする
    const yAxis = new THREE.Vector3().crossVectors(normal, xAxis).normalize();

    const result = [];

    for (const obj of objList) {
      const mesh = obj as THREE.Mesh;
      const triangles = this.getVisibleTriangles(mesh, position);
      const polygons = this.mergeTrianglesToPolygons(triangles, 0.98);

      const paths = [];
      for (const polygon3D of polygons) {
        const points = polygon3D.vertices.map(P => this.projectPoint(P, normal, xAxis, yAxis));
        const polygon2D = this.sortPointsByAngle(points);
        paths.push(polygon2D);
      }
      result.push({
        paths
      });
    }

    return result;
  }

  // 1. 三角形のグループ化（法線がほぼ同じもの同士をまとめる）
  private groupTrianglesByNormal(
    triangles: {
        a: THREE.Vector3;
        b: THREE.Vector3;
        c: THREE.Vector3;
        normal: THREE.Vector3;
    }[], 
    dotThreshold = 0.98) 
{
    const groups = [];
    for (const tri of triangles) {
      let added = false;
      for (const group of groups) {
        // 代表の法線との内積が閾値以上なら同グループとする
        if (tri.normal.dot(group.normal) >= dotThreshold) {
          group.triangles.push(tri);
          added = true;
          break;
        }
      }
      if (!added) {
        groups.push({
          normal: tri.normal.clone(), // 最初の三角形の法線を代表として使用
          triangles: [tri]
        });
      }
    }
    return groups;
  }

  // 2. グループ内の全頂点を抽出する
  private getVerticesFromGroup(
    group: {
      normal: THREE.Vector3;
      triangles: {
          a: THREE.Vector3;
          b: THREE.Vector3;
          c: THREE.Vector3;
          normal: THREE.Vector3;
      }[]}) : THREE.Vector3[]
  {
    const vertices = [];
    for (const tri of group.triangles) {
      vertices.push(tri.a.clone(), tri.b.clone(), tri.c.clone());
    }
    return vertices;
  }

  // 3. あるグループの法線を用いて、全頂点を2D平面へ投影する
  private projectPointsTo2D(vertices: THREE.Vector3[], normal: THREE.Vector3)
    : { points2D: { pos: THREE.Vector2; original: THREE.Vector3 }[]; origin: THREE.Vector3; u: THREE.Vector3; v: THREE.Vector3 }
  {
    // 代表となる原点（ここでは最初の頂点）
    const origin = vertices[0].clone();
    // 法線と平行でない任意のベクトルを用意（通常は (0,1,0) でOK、ただし法線とほぼ平行なら (1,0,0)）
    let arbitrary = new THREE.Vector3(0, 1, 0);
    if (Math.abs(normal.dot(arbitrary)) > 0.99) {
      arbitrary.set(1, 0, 0);
    }
    // u,v は原点を通る平面内の基底
    const u = new THREE.Vector3().crossVectors(normal, arbitrary).normalize();
    const v = new THREE.Vector3().crossVectors(normal, u).normalize();

    // 各頂点を原点基準で (u,v) 座標に投影
    const points2D = vertices.map(vertex => {
      const relative = vertex.clone().sub(origin);
      const x = relative.dot(u);
      const y = relative.dot(v);
      return { 
        pos: new THREE.Vector2(x, y),
        original: vertex.clone() // （必要なら元の3D座標も保持）
      };
    });

    return { points2D, origin, u, v };
  }

  // 4. 2Dの点集合から凸包（Monotone Chainアルゴリズム）を求める
  private convexHull2D(points: {
    pos: THREE.Vector2;
    original: THREE.Vector3;
    }[]) 
  {
    // points は {x, y, original} を含むオブジェクトの配列
    // まず、x（同値ならy）の昇順にソート
    const pts = points.slice().sort((a, b) => {
      if (a.pos.x === b.pos.x) return a.pos.y - b.pos.y;
      return a.pos.x - b.pos.x;
    });

    // 外積（z成分）の計算
    function cross(o: THREE.Vector2, a: THREE.Vector2, b: THREE.Vector2) {
      return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    }

    const lower = [];
    for (const p of pts) {
      while (lower.length >= 2 && cross(lower[lower.length - 2].pos, lower[lower.length - 1].pos, p.pos) <= 0) {
        lower.pop();
      }
      lower.push(p);
    }
    const upper = [];
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2].pos, upper[upper.length - 1].pos, p.pos) <= 0) {
        upper.pop();
      }
      upper.push(p);
    }
    // 最後の点（重複）を除外して連結
    upper.pop();
    lower.pop();
    return lower.concat(upper);
  }

  // 5. 得られた2D凸包の点を元の3D空間へ再射影する
  private mapHullPointsTo3D(
    hullPoints2D: {
      pos: THREE.Vector2;
      original: THREE.Vector3;
    }[], 
    origin: THREE.Vector3, 
    u: THREE.Vector3, 
    v: THREE.Vector3) : THREE.Vector3[]
  {
    return hullPoints2D.map(p => {
      // 点 p(x, y) を 3D座標に変換： origin + x*u + y*v
      return origin.clone().add(u.clone().multiplyScalar(p.pos.x)).add(v.clone().multiplyScalar(p.pos.y));
    });
  }

  // 6. すべての三角形群から、凸包による1つのポリゴンに統合する関数
  private mergeTrianglesToPolygons(
    visibleTriangles: { a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3; normal: THREE.Vector3; }[], 
    dotThreshold = 0.98) 
      : { normal: THREE.Vector3; vertices: THREE.Vector3[] }[]
  {
    // (1) 法線でグループ化
    const groups = this.groupTrianglesByNormal(visibleTriangles, dotThreshold);
    const polygons: {
      normal: THREE.Vector3; vertices: THREE.Vector3[]; // 凸包を構成する頂点（順序は凸包アルゴリズムにより得られる）
    }[] = [];

    // 各グループごとに凸包計算を実施
    groups.forEach(group => {
      // グループ内の全頂点を取得
      const vertices = this.getVerticesFromGroup(group);

      // (2) 2Dへ投影（このグループの法線を平面の法線とする）
      const { points2D, origin, u, v } = this.projectPointsTo2D(vertices, group.normal);

      // (3) 2D凸包計算
      const hull2D = this.convexHull2D(points2D);

      // (4) 2D凸包を3Dに再射影して、ポリゴンの頂点集合とする
      const hull3D = this.mapHullPointsTo3D(hull2D, origin, u, v);

      polygons.push({
        normal: group.normal.clone(),
        vertices: hull3D // 凸包を構成する頂点（順序は凸包アルゴリズムにより得られる）
      });
    });

    return polygons;
  }



  /**
   * ポリゴンを構成する3頂点を、指定された投影面の法線に基づく平面のX,Y座標に変換する
   * （※投影面は原点を通ると仮定）
   * @param polygon 頂点a,b,cを持つポリゴン（polygon.normal は使用しません）
   * @param planeNormal 投影面の法線ベクトル（例: { x: 0.6548614604158615, y: 0, z: -0.7557489448633091 }）
   * @param xAxis 投影面内のX軸ベクトル
   * @param yAxis 投影面内のY軸ベクトル
   * @returns 投影面におけるX,Y座標に変換された頂点
   * --- 各頂点の投影処理 ---
   * 各頂点 P を、投影面上に直交投影する：
   *   P_proj = P - (P・planeNormal) * planeNormal
   * その後、投影面内での座標は、
   *   X = P_proj ・ xAxis,  Y = P_proj ・ yAxis
   */
  private projectPoint(
    P: THREE.Vector3,
    planeNormal: THREE.Vector3,
    xAxis: THREE.Vector3,
    yAxis: THREE.Vector3
  ): THREE.Vector2 {
    const distance = P.dot(planeNormal);
    const projected = P.clone().sub(planeNormal.clone().multiplyScalar(distance));
    return new THREE.Vector2(projected.dot(xAxis), projected.dot(yAxis));
  };

  /**
   * 重心からの偏角で点群をソートして、一筆書き可能な外周順（閉じた多角形）に並び替えます。
   * ※点群が外周の頂点（または外周近く）であることを前提としています。
   */
  private sortPointsByAngle(points: THREE.Vector2[]): THREE.Vector2[] {
    // 重心（centroid）の算出
    const centroid = points.reduce(
      (acc, p) => ({
        x: acc.x + p.x,
        y: acc.y + p.y,
      }),
      { x: 0, y: 0 }
    );
    centroid.x /= points.length;
    centroid.y /= points.length;

    // 各点の偏角を centroid を原点として算出し、ソートします。
    // もし偏角が同じ場合は、重心からの距離が短い順に並べ替えます。
    const sorted = points.slice().sort((a, b) => {
      const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
      const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
      
      if (angleA === angleB) {
        const distA = (a.x - centroid.x) ** 2 + (a.y - centroid.y) ** 2;
        const distB = (b.x - centroid.x) ** 2 + (b.y - centroid.y) ** 2;
        return distA - distB;
      }
      return angleA - angleB;
    });

    return sorted;
  }

  /**
   * 指定したメッシュのBufferGeometryについて、
   * 投影面位置から見たときに前面（バックフェイスカリングされず描画される面）となる三角形を取得する関数
   *
   * @param {THREE.Mesh} mesh - BufferGeometryを持つメッシュ
   * @param {THREE.Vector3} position - 投影面位置
   * @returns {Array} visibleTriangles - 前面と判定された三角形の情報リスト
   *         各要素は { a: Vector3, b: Vector3, c: Vector3, normal: Vector3 } のオブジェクト
  */
  private getVisibleTriangles(mesh: THREE.Mesh, position: THREE.Vector3) {
    const geometry = mesh.geometry;
    // BufferGeometryのposition属性を取得（Float32Arrayなど）
    const positions = (geometry.attributes.position as THREE.BufferAttribute).array;
    // インデックスが設定されている場合はそれを利用
    const indices = geometry.index ? geometry.index.array : null;

    const visibleTriangles = [];
    const matrixWorld = mesh.matrixWorld;

    // 作業用のベクトルを作成
    const vA = new THREE.Vector3();
    const vB = new THREE.Vector3();
    const vC = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const edge1 = new THREE.Vector3();
    const edge2 = new THREE.Vector3();
    const cameraToVertex = new THREE.Vector3();

    // 三角形の数を決定
    const numTriangles = indices ? indices.length / 3 : positions.length / 9;

    for (let i = 0; i < numTriangles; i++) {
      let a, b, c;
      if (indices) {
        // インデックスがある場合、各三角形はインデックス配列の連続3要素となる
        a = indices[i * 3] * 3;
        b = indices[i * 3 + 1] * 3;
        c = indices[i * 3 + 2] * 3;
      } else {
        // インデックスが無い場合は、連続した3頂点が1三角形となる
        a = i * 9;
        b = a + 3;
        c = a + 6;
      }

      // 各頂点のローカル座標を取得
      vA.set(positions[a], positions[a + 1], positions[a + 2]);
      vB.set(positions[b], positions[b + 1], positions[b + 2]);
      vC.set(positions[c], positions[c + 1], positions[c + 2]);

      // ワールド座標へ変換（mesh.matrixWorldを適用）
      vA.applyMatrix4(matrixWorld);
      vB.applyMatrix4(matrixWorld);
      vC.applyMatrix4(matrixWorld);

      // 三角形の法線を計算
      // ※ 頂点の順番がカウンタークロックワイズであれば、計算された法線は外向きとなる
      edge1.subVectors(vB, vA);
      edge2.subVectors(vC, vA);
      normal.crossVectors(edge1, edge2).normalize();

      // 投影面位置から頂点vAへの方向ベクトル（正規化）
      cameraToVertex.subVectors(position, vA).normalize();

      // バックフェイスカリングの判定
      // OpenGL/three.jsでは、通常、投影面位置から見たときに
      // (camera.position - vA)と法線の内積が **負** なら前面と判断される（描画される）
      if (cameraToVertex.dot(normal) < 0) {
        // 前面と判定された場合、その三角形の頂点情報と法線を配列に追加
        visibleTriangles.push({
          a: vA.clone(),
          b: vB.clone(),
          c: vC.clone(),
          normal: normal.clone()
        });
      }
    }

    return visibleTriangles;
  }


  ////////////////////////////////////////////////////////////////////
  // konva.js の図形を作成
  createShape(plane: THREE.Mesh, paths: any[]) {
    const uuid: string = plane.uuid;
    
    // PlaneGeometryからパラメータを取得
    // ジオメトリがPlaneGeometryの場合、parametersから幅と高さを取得
    if (plane.geometry instanceof THREE.PlaneGeometry) {
      const geometry = plane.geometry as THREE.PlaneGeometry;
      const w = geometry.parameters.width;
      const h = geometry.parameters.height;
      this.stage.addPage(uuid, w, h);
      this.shape.addShape(uuid, paths);
    }

  }


  ////////////////////////////////////////////////////////////////////
  // three.js のメッシュを作成
  private createMesh(): THREE.Mesh{
  // 1. 平面のジオメトリを作成
  const planeGeometry = new THREE.PlaneGeometry(40, 30);

  // 2. 半透明マテリアル
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.1
  });

  // 3. メッシュを作成してシーンに追加
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.set(5, 10, 10);

  // --- 枠線（エッジ）を作成する ---
  // EdgesGeometry はジオメトリのエッジを抽出したジオメトリを返す
  const edgesGeometry = new THREE.EdgesGeometry(planeGeometry);

  // LineBasicMaterial で線の色などを設定
  const edgesMaterial = new THREE.LineBasicMaterial({
    color: 0x0000ff // 白い枠線
  });

  // エッジジオメトリを使って LineSegments を作成
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);

  // 枠線オブジェクトを plane に子オブジェクトとして追加
  // ※位置を合わせたい場合は plane の子にすると楽です
  plane.add(edges);

  plane.name = 'view port';
  // シーンに登録する
  this.scene.add( plane );

  return plane;
  }

}
