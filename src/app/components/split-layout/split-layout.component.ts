import { Component, ElementRef, HostListener, ViewChild  } from '@angular/core';
import { CodeComponent } from '../code/code.component';
import { ThreeComponent } from '../three/three.component';
import { SceneService } from '../three/scene.service';

@Component({
  selector: 'app-split-layout',
  standalone: true,
  imports: [CodeComponent, ThreeComponent],
  templateUrl: './split-layout.component.html'
})
export class SplitLayoutComponent {
  @ViewChild("left", { static: true }) private leftPane: ElementRef | undefined;

  private isDragging = false;
  private startX = 0;
  private startWidth = 0;

  constructor(private scene: SceneService){}

  // マウスクリック時のイベント
  public onMouseDown(e: MouseEvent) {
    if(!this.leftPane) return;

    this.isDragging = true;
    this.startX = e.clientX;
    // 現在の左ペイン幅を取得
    this.startWidth = this.leftPane.nativeElement.getBoundingClientRect().width;
    // テキスト選択を防ぐ
    document.body.style.userSelect = 'none';
  }


  // マウス移動時のイベント
  @HostListener("mousemove", ["$event"])
  public onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    if(!this.leftPane) return;

    // ドラッグ距離に応じて新しい幅を計算
    const delta = e.clientX - this.startX;
    const newWidth = this.startWidth + delta;
    // 適度に最小幅や最大幅の制御を入れてもOK
    this.leftPane.nativeElement.style.width = newWidth + 'px';
    this.scene.onWindowResize();
  }

    // マウスクリック時のイベント
    @HostListener("pointerup", ["$event"])
    public onMouseUp(e: MouseEvent) {
      if(this.isDragging = false) return;
      this.isDragging = false;
      document.body.style.userSelect = '';
      this.scene.onWindowResize();
    }


}
