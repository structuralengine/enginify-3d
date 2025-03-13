import { Injectable } from '@angular/core';
import Konva from 'konva';
import { KonvaStageService } from './konva.stage.service';
import { Layer } from 'konva/lib/Layer';
import interact from 'interactjs';

@Injectable({
  providedIn: 'root'
})
export class KonvaLayerService {

  private pages: { [key: string]: Konva.Layer } = {};

  constructor(private konva: KonvaStageService) {
   }

  // Initialize Konva stage with fixed dimensions
  public addPage(uuid: string, width: number, height: number) {
    if(!this.konva.stage) return;

    const layer = new Konva.Layer({
      name: uuid,
      visible: true,
      clearBeforeDraw: true,
      crip:{
        x: 0,
        y: 0,
        width: width,
        height: height
      }
    });
    this.konva.stage.add(layer);

    // レイヤーに矩形を追加
    const rect = new Konva.Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 1
    });

    layer.add(rect);

    // レイヤーのキャンバス要素を取得
    const canvas = layer.getCanvas()._canvas as HTMLCanvasElement;
    if (canvas) {
      // canvas.style.backgroundColor = '#ffffff';
      // canvas.style.position = 'absolute';  
      // canvas.style.width = `${width}px`;   
      // canvas.style.height = `${height}px`; 
      // target elements with the "draggable" class
      // interact(canvas)
      // .draggable({
      //   listeners: { move: this.dragMoveListener },
      //   inertia: true,
      //   modifiers: [
      //     interact.modifiers.restrictRect({
      //       restriction: 'parent',
      //       endOnly: true
      //     })
      //   ]
      // })
    }

    layer.batchDraw();
    this.pages[uuid] = layer;
  }

  private dragMoveListener(event: any) {
    const target = event.target
    // keep the dragged position in the data-x/data-y attributes
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
  
    // translate the element
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'
  
    // update the posiion attributes
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
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
