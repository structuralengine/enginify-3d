import { ElementRef, Injectable } from '@angular/core';
import Konva from 'konva';
import interact from 'interactjs';

@Injectable({
  providedIn: 'root'
})
export class KonvaStageService {

  private container: HTMLDivElement | undefined = undefined;
  public stage: Konva.Stage | null = null;

  public Init(_containerRef: ElementRef | undefined){
    if(!_containerRef) return;
    this.container = _containerRef.nativeElement as HTMLDivElement;
    this.stage = new Konva.Stage({
      container: this.container,
      width: this.container.offsetWidth,
      height: this.container.offsetHeight,
    });
  }
  
  // ウインドウがリサイズした時のイベント処理
  public Resize(): void {
    // ウインドウサイズが変更された時にステージを再描画
    if(!this.container) return;
    if(!this.stage) return;
    this.stage.width(this.container.offsetWidth);
    this.stage.height(this.container.offsetHeight);
  }
  
  public Destroy(): void {
    if (this.stage) {
      this.stage.destroy();
    }
  }

  public Zoom(value: number) {
    if (!this.stage) return;
    // ズーム量の計算（上方向で拡大、下方向で縮小）
    const oldScale = this.stage.scaleX();
    const scale = value < 0 ? oldScale * 1.1 : oldScale / 1.1;
    this.stage.scale({ x: scale, y: scale });
    this.stage.batchDraw();
  } 

}
