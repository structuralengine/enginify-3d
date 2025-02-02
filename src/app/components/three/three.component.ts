import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SelectBoxComponent } from '../select-box/select-box.component';
import { SceneService } from './scene.service';
import { CodeService } from './code.service';

@Component({
  selector: 'app-three',
  standalone: true,
  templateUrl: './three.component.html',
  imports: [CommonModule, SelectBoxComponent]
  
})
export class ThreeComponent implements OnInit, AfterViewInit {
  @ViewChild("screen", { static: true }) private screen: ElementRef | undefined;
  @ViewChild("box", { static: true }) private box: ElementRef | undefined;

  private isDragging = false;

  constructor(
    private scene: SceneService,
    private code: CodeService) { }

  ngOnInit(): void {
    this.box_visible(false);
  }

  ngAfterViewInit() {
    if (this.screen) {
        if(this.scene.OnInit(this.screen.nativeElement as HTMLCanvasElement))
          this.code.runCode();
      }
  }

  // マウスクリック時のイベント
  public onDoubleClick(event: MouseEvent) {
    this.box_visible(true, event.offsetX, event.offsetY);
  }

  // @HostListener("pointerdown", ["$event"])
  public onMouseDown(event: MouseEvent) {
    this.scene.onPointerDown(event);
    this.isDragging = true;
    this.box_visible(false);
  }

  // マウスクリック時のイベント
  @HostListener("pointerup", ["$event"])
  public onMouseUp(event: MouseEvent) {
    if (!this.isDragging) return;
    this.scene.onPointerUp(event);
  }

  // マウス移動時のイベント
  @HostListener("mousemove", ["$event"])
  public onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    this.scene.onPointerMove(event);
  }

  // ウインドウがリサイズした時のイベント処理
  @HostListener("window:resize", ["$event"])
  public onResize(event: Event) {
    this.scene.onWindowResize();
  }

  public box_visible(visible: boolean, x?: number, y?: number) {
    if (!this.box) return;
    const box_element = this.box.nativeElement as HTMLElement;
    const box_style = box_element.style;
    if(visible) {
      box_style.visibility = "visible";
      box_style.top = y + "px";
      box_style.left = x + "px";
    } else {
      box_style.visibility = "hidden";
    }

  }

}
