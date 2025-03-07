import { ElementRef, Injectable } from '@angular/core';
import Konva from 'konva';

@Injectable({
  providedIn: 'root'
})
export class KonvaStageService {

  private container: HTMLDivElement | undefined = undefined;
  private containerSize = { width:0, height:0 };
  private stages: { [key: string]: Konva.Stage } = {};
  private currentStage: string = "";

  public Init(_containerRef: ElementRef | undefined){
    if(!_containerRef) return;
    this.container = _containerRef.nativeElement as HTMLDivElement;
    this.containerSize.width = this.container.offsetWidth;
    this.containerSize.height = this.container.offsetHeight;
  }
  
  // ウインドウがリサイズした時のイベント処理
  public Resize(): void {
    // ウインドウサイズが変更された時にステージを再描画
    if(!this.container) return;
    this.containerSize.width = this.container.offsetWidth;
    this.containerSize.height = this.container.offsetHeight;  
  }

  public Destroy(): void {
    for (const key in this.stages) {
      const item = this.stages[key];
      item.destroy();
    }
    this.stages = {};
  }

  // Initialize Konva stage with fixed dimensions
  public addPage(uuid: string, width: number, height: number) {
    if(!this.container) return;
    const stage = new Konva.Stage({
      id: uuid,
      container: this.container,
      width: width * 100,
      height: height * 100,
      x: 0,
      y: 0
    });

    this.stages[uuid] = stage;
    this.currentStage = stage.id();
  }

  public removePage(id: string | null = null): void {
    if(!id){
      id = this.currentStage;
    }
    const page = this.getPage(id);
    if (!page) return;
    
    page.destroy();
    delete this.stages[id];
  }

  public getPage(id: string | null = null): Konva.Stage | undefined {
    if(!id){
      id = this.currentStage;
    }
    if(id in this.stages)
      return this.stages[id];
    return undefined;
  }

}
