import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import Konva from 'konva';

@Component({
  selector: 'app-konva',
  standalone: true,
  imports: [],
  templateUrl: './konva.component.html'
})
export class KonvaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('konvaContainer', { static: false }) containerRef: ElementRef | undefined;
  private stage!: Konva.Stage;
  private layer!: Konva.Layer;

  ngAfterViewInit(): void {
    this.initializeStage();
    this.addShapes();
    this.stage.add(this.layer);
    // ウィンドウリサイズのハンドリング
    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.handleResize);
    this.stage.destroy();
  }

  private initializeStage(): void {
    if(!this.containerRef) return;
    const container = this.containerRef.nativeElement;

    this.stage = new Konva.Stage({
      container: container,
      width: container.offsetWidth,
      height: container.offsetHeight,
    });

    this.layer = new Konva.Layer();
  }

  private addShapes(): void {
    // 円の作成
    const circle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 50,
      fill: 'red',
      draggable: true,
    });

    // 円のクリックイベント
    circle.on('click', () => {
      circle.fill('green');
      this.layer.draw();
    });

    // 四角形の作成
    const rectangle = new Konva.Rect({
      x: 200,
      y: 200,
      width: 100,
      height: 50,
      fill: 'blue',
      draggable: true,
    });

    // 四角形のクリックイベント
    rectangle.on('click', () => {
      rectangle.fill('yellow');
      this.layer.draw();
    });

    // マウスオーバーイベント
    circle.on('mouseover', () => {
      document.body.style.cursor = 'pointer';
      circle.opacity(0.5);
      this.layer.draw();
    });

    // マウスアウトイベント
    circle.on('mouseout', () => {
      document.body.style.cursor = 'default';
      circle.opacity(1);
      this.layer.draw();
    });

    // ドラッグ終了イベント
    circle.on('dragend', () => {
      console.log(`Circle dragged to x: ${circle.x()}, y: ${circle.y()}`);
    });

    // 図形をレイヤーに追加
    this.layer.add(circle);
    this.layer.add(rectangle);
  }

  private handleResize = () => {
    if(!this.containerRef) return;

    const container = this.containerRef.nativeElement;
    this.stage.width(container.offsetWidth);
    this.stage.height(container.offsetHeight);
    this.stage.draw();
  }
}
