import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Konva from 'konva';
import { InputDataService } from 'src/app/providers/input-data.service';
import { KonvaStageService } from './konva.stage.service';
import { ItemViewPortService } from '../select-box/item-view-port.service';


@Component({
  selector: 'app-konva',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './konva.component.html'
})
export class KonvaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('konvaContainer', { static: false }) containerRef: ElementRef | undefined;

  constructor(private konva: KonvaStageService,
    private test: ItemViewPortService
  ) { }

  ngAfterViewInit(): void {
    this.konva.Init(this.containerRef);

    // 一時的にテスト用のアイテムを作成
    this.test.createItem();
    // this.test.createItem();
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
