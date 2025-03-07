import { Injectable } from '@angular/core';
import Konva from 'konva';
import { Shape } from 'konva/lib/Shape';
import { KonvaStageService } from './konva.stage.service';

@Injectable({
  providedIn: 'root'
})
export class KonvaShapeService {

  // 図形の移動を制御する
  private transformer: Konva.Transformer;

  constructor(private stage: KonvaStageService) {
    this.transformer = new Konva.Transformer({
      rotateEnabled: true,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      borderStroke: '#666',
      borderStrokeWidth: 1,
      padding: 5
    });
  }

  // 任意形状の作成
  public addShape(stageid: string, paths: any[]): void {
    const stage = this.stage.getPage(stageid);
    if (!stage) return;

    // Stageからレイヤーを取得
    let layer = stage.getLayers()[0]; // 最初のレイヤーを取得
    
    // レイヤーがなければ新しく作成
    if (!layer) {
      layer = new Konva.Layer({
        name: 'layer-' + Date.now(),
        opacity: 0.8,
        fill: '#000000',
        visible: true,
        clearBeforeDraw: true
      });
      // レイヤーをステージに追加
      stage.add(layer);
      layer.listening(true);
      console.log('New layer created');
    }

    // より視覚的に確認しやすい図形を作成
    const path = new Konva.Path({
      fill: '#FF5733', // 明るいオレンジ色
      stroke: 'black', // 黒い枠線
      strokeWidth: 2,  // 枠線の太さ
      draggable: true,
      opacity: 0.8,    // 少し透明に
    });
    
    // 中央に配置
    path.x(200);
    path.y(150);
    
    // より大きな三角形
    path.data('M 0 0 L 100 0 L 50 100 Z');

    // 図形をレイヤーに追加
    layer.add(path);
    layer.batchDraw();
    
    this.setDrag(path);
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
