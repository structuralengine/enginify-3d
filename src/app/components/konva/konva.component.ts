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
    this.konva.Init(this.containerRef);
  }

  ngOnDestroy(): void {
    this.konva.Destroy();
  }

  // マウスホイールイベント
  onMouseWheel(e: WheelEvent) {
    this.konva.Zoom(e.deltaY);
  }

  // ウインドウがリサイズした時のイベント処理
  @HostListener('window:resize')
  onResize(): void {
    this.konva.Resize();
  }

}
