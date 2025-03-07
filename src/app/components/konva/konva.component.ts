import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Konva from 'konva';
import { InputDataService } from 'src/app/providers/input-data.service';
import { KonvaStageService } from './konva.stage.service';
import interact from 'interactjs';

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
    this.initDraggable();
  }

  ngOnDestroy(): void {
    this.konva.Destroy();
    // interact.jsのインスタンスを破棄
    if (this.containerRef) {
      interact(this.containerRef.nativeElement).unset();
    }
  }

  // ウインドウがリサイズした時のイベント処理
  @HostListener('window:resize')
  onResize(): void {
    this.konva.Resize();
  }

  // interact.jsを使ってドラッグ機能を初期化
  private initDraggable(): void {
    if (!this.containerRef) return;

    const element = this.containerRef.nativeElement;
    let x = 0;
    let y = 0;

    interact(element)
      .draggable({
        inertia: true,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: true
          })
        ],
        autoScroll: true,
        listeners: {
          move(event) {
            x += event.dx;
            y += event.dy;

            event.target.style.transform = `translate(${x}px, ${y}px)`;
          }
        }
      });
  }
}
