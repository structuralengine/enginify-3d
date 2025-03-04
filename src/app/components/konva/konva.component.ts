import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Konva from 'konva';
import { InputDataService } from 'src/app/providers/input-data.service';
import { KonvaStageService } from './konva.stage.service';

@Component({
  selector: 'app-konva',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './konva.component.html'
})
export class KonvaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('konvaContainer', { static: false }) containerRef: ElementRef | undefined;

  constructor(private konva: KonvaStageService) { }

  ngAfterViewInit(): void {
    if(!this.containerRef) return;
    const container = this.containerRef.nativeElement as HTMLDivElement;
    if(this.konva.stage) return;
    this.stageInit(container);
  }

  private stageInit(container: HTMLDivElement){
    this.konva.stage = new Konva.Stage({
      container: container,
      width: container.offsetWidth,
      height: container.offsetHeight,
    });
  }

  ngOnDestroy(): void {
    if(this.konva.stage) 
      this.konva.stage.destroy();
  }

  zoomIn() {
    if (!this.konva.stage) return;
    const scale = this.konva.stage.scaleX() * 1.2;
    this.konva.stage.scale({ x: scale, y: scale });
    this.konva.stage.batchDraw();
  }
  
  zoomOut() {
    if (!this.konva.stage) return;
    const scale = this.konva.stage.scaleX() / 1.2;
    this.konva.stage.scale({ x: scale, y: scale });
    this.konva.stage.batchDraw();
  }
  

  // ウインドウがリサイズした時のイベント処理
  @HostListener('window:resize')
  onResize(): void {
    // ウインドウサイズが変更された時にステージを再描画
    if(!this.containerRef) return;
    const container = this.containerRef.nativeElement as HTMLDivElement;
    if(this.konva.stage) {
      this.konva.stage.width(container.offsetWidth);
      this.konva.stage.height(container.offsetHeight);
      this.konva.stage.draw();
    } else {
      this.stageInit(container);
    }
  }
}
