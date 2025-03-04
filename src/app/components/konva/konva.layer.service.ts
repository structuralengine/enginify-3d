import { Injectable } from '@angular/core';
import Konva from 'konva';
import { KonvaStageService } from './konva.stage.service';
import { Layer } from 'konva/lib/Layer';

@Injectable({
  providedIn: 'root'
})
export class KonvaLayerService {

  private pages: { [key: string]: Konva.Layer } = {};

  // ビューポートの移動を制御する
  private transformer: Konva.Transformer;

  constructor(private konva: KonvaStageService) {
    this.transformer = new Konva.Transformer({
      rotateEnabled: true,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      borderStroke: '#666',
      borderStrokeWidth: 1,
      padding: 5
    });
   }

  // Initialize Konva stage with fixed dimensions
  public addPage(uuid: string, width: number, height: number) {
    if(!this.konva.stage) return;

    const layer = new Konva.Layer({
      name: uuid,
      visible: true,
      clearBeforeDraw: true,
      // x: 0,
      // y: 0,
      // clip: {
      //   x: 0,
      //   y: 0,
      //   width: width,
      //   height: height
      // }
    });
    layer.add(this.transformer);
    layer.batchDraw();
    this.pages[uuid] = layer;

    this.konva.stage.add(layer);

  }

  public removePage(pageId: string): void {
    
    const page = this.getPage(pageId);
    if (!page) return;
    
    page.destroy();
    delete this.pages[pageId];
  }

  public getPage(pageId: string): Layer | undefined {
    if(pageId in this.pages)
      return this.pages[pageId];
    return undefined;
  }

}
