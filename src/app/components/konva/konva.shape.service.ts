import { Injectable } from '@angular/core';
import Konva from 'konva';
import { Shape } from 'konva/lib/Shape';
import { KonvaLayerService } from './konva.layer.service';

@Injectable({
  providedIn: 'root'
})
export class KonvaShapeService {

  // 図形の移動を制御する
  private transformer: Konva.Transformer;

  constructor(private layer: KonvaLayerService) {
    this.transformer = new Konva.Transformer({
      rotateEnabled: true,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      borderStroke: '#666',
      borderStrokeWidth: 1,
      padding: 5
    });
  }

  // 任意形状の作成
  public addShape(layer_uuid: string, paths: any[]): void {
    const layer = this.layer.getPage(layer_uuid);
    if (!layer) {
      console.error('Layer not found:', layer_uuid);
      return;
    }

    // より視覚的に確認しやすい図形を作成
    const path = new Konva.Path({
      fill: '#FF5733',       // 明るいオレンジ色
      stroke: 'black',       // 黒い枠線
      strokeWidth: 3,        // より太い枠線
      draggable: true,
      opacity: 1,            // 完全に不透明に
      shadowColor: 'black',  // 影を追加して視認性を向上
      shadowBlur: 5,
      shadowOffset: { x: 2, y: 2 },
      shadowOpacity: 0.5
    });
    
    // 中央に配置
    path.x(200);
    path.y(150);
    
    // より大きな三角形
    path.data('M 0 0 L 150 0 L 75 150 Z');

    // 図形をレイヤーに追加
    layer.add(path);
    layer.batchDraw();
    
    // コンソールに図形追加を記録
    console.log('Shape added to layer:', layer_uuid);
    console.log('Shape position:', { x: path.x(), y: path.y() });
    console.log('Shape data:', path.data());
    
    this.setDrag(path);
    
    // 図形が追加されたことを示す視覚的なインジケータを追加
    this.addShapeIndicator(layer);
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

  // 図形が追加されたことを示す視覚的なインジケータを追加
  private addShapeIndicator(layer: Konva.Layer): void {
    // パルス効果のある円を作成
    const indicator = new Konva.Circle({
      x: 50,
      y: 50,
      radius: 20,
      fill: 'green',
      opacity: 0.7
    });
    
    layer.add(indicator);
    
    // パルスアニメーションを作成
    const anim = new Konva.Animation((frame) => {
      if (!frame) return;
      const scale = 1 + Math.sin(frame.time / 200) * 0.2;
      indicator.scale({ x: scale, y: scale });
    }, layer);
    
    // アニメーションを開始
    anim.start();
    
    // 3秒後にアニメーションを停止して円を削除
    setTimeout(() => {
      anim.stop();
      indicator.destroy();
      layer.batchDraw();
    }, 3000);
  }
}
