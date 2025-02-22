import { Injectable } from '@angular/core';
import Konva from 'konva';
import { Shape } from 'konva/lib/Shape';

@Injectable({
  providedIn: 'root'
})
export class KonvaService {
  public stage!: Konva.Stage;
  private layer: any = {};
  private transformer: Konva.Transformer;

  constructor() {
    this.transformer = new Konva.Transformer({
      rotateEnabled: true,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      borderStroke: '#666',
      borderStrokeWidth: 1,
      padding: 5
    });
  }

  // レイヤの作成
  public addLayer(uuid: string): void {

    const layer = new Konva.Layer({
      name: uuid,             // レイヤーの名前
      opacity: 0.8,           // 透過度（0〜1）
      visible: true,          // 表示/非表示の設定
      clearBeforeDraw: true,  // 描画前に自動的にレイヤーをクリアするかどうか
      hitGraphEnabled: true,  // ヒットグラフ（クリック判定用の領域）の有効/無効
      x: 50, // レイヤーの配置位置（ステージ上でのオフセット）
      y: 50,
      clip: {
        x: 0,
        y: 0,
        width: 300,
        height: 300
      }
    });

    this.layer[uuid]= layer;
    this.stage.add(layer);
  }

  // 任意形状の作成
  public addShape(layer_uuid: string, paths: any[]): void {

    const path = new Konva.Path({
      fill: 'blue',
      draggable: true,
    });
    path.x(50);
    path.y(50);
    path.data('M 200 100 L 50 50 L 50 100 Z');

    this.setDrag(path);

    // 図形をレイヤーに追加
    if(!(layer_uuid in this.layer)) {
      this.addLayer(layer_uuid);
    }
    const layer = this.layer[layer_uuid];
    layer.add(path);
  }

  private setDrag(shape: Shape): void {
    // Selection handling
    shape.on('click tap', () => {
      this.selectShape(shape);
    });

    // Double click for color change
    shape.on('dblclick', () => {
      const colors = ['red', 'green', 'blue', 'yellow'];
      const currentColor = shape.fill();
      // Handle case where fill is a gradient
      const currentColorStr = typeof currentColor === 'string' ? currentColor : colors[0];
      const nextColor = colors[(colors.indexOf(currentColorStr) + 1) % colors.length];
      shape.fill(nextColor);
      shape.getLayer()?.batchDraw();
    });

    // Mouse interactions
    shape.on('mouseover', () => {
      document.body.style.cursor = 'pointer';
      shape.opacity(0.5);
      shape.getLayer()?.batchDraw();
    });

    shape.on('mouseout', () => {
      document.body.style.cursor = 'default';
      shape.opacity(1);
      shape.getLayer()?.batchDraw();
    });

    // Drag events
    shape.on('dragstart', () => {
      shape.moveToTop();
      this.transformer.moveToTop();
    });

    shape.on('dragmove', () => {
      this.transformer.getLayer()?.batchDraw();
    });

    shape.on('dragend', () => {
      console.log(`Shape dragged to x: ${shape.x()}, y: ${shape.y()}`);
    });
  }


  public addCircle(): void {
    // 円の作成
    const circle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 50,
      fill: 'red',
      draggable: true,
    });

    this.setDrag(circle);

    // Add shape to the first layer
    const firstLayer = Object.values(this.layer)[0];
    if (firstLayer) {
      firstLayer.add(circle);
      firstLayer.batchDraw();
    }

  }

  public addRectangle(): void {
    const rectangle = new Konva.Rect({
      x: 200,
      y: 200,
      width: 100,
      height: 50,
      fill: 'blue',
      draggable: true,
    });

    this.setDrag(rectangle);
    
    // Add shape to the first layer
    const firstLayer = Object.values(this.layer)[0];
    if (firstLayer) {
      firstLayer.add(rectangle);
      firstLayer.batchDraw();
    }
  }
  public selectShape(shape: Konva.Shape): void {
    this.transformer.nodes([shape]);
    const layer = shape.getLayer();
    if (layer && !layer.find('.transformer').length) {
      layer.add(this.transformer);
      layer.batchDraw();
    }
  }

  public clearSelection(): void {
    this.transformer.nodes([]);
    this.transformer.getLayer()?.batchDraw();
  }
}
