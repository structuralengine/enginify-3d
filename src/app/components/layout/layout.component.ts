import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild  } from '@angular/core';
import { ThreeComponent } from '../three/three.component';
import { SceneService } from '../three/scene.service';
import { InputDataService } from '../../providers/input-data.service';
import { KonvaComponent } from '../konva/konva.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [ThreeComponent, KonvaComponent],
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit {
  @ViewChild("layout", { static: true }) private layout: ElementRef | undefined;
  @ViewChild("three", { static: true }) private three: ElementRef | undefined;

  private container: HTMLCanvasElement | undefined;
  
  private padding_top = 12;
  private padding_right = 25;
  private min_width = 200;
  private min_height = 200;

  constructor(private scene: SceneService,
    public data: InputDataService
  ) { }

  ngOnInit(): void {
    if(this.layout === undefined) return;
    this.container = this.layout.nativeElement as HTMLCanvasElement
    this.onWindowResize();
  }

  public changeRange(event: any) {
    this.data.range = event.target.value;

    if(this.container === undefined) return;
    this.onWindowResize();
    this.scene.onWindowResize();
  }

  // ウインドウがリサイズした時のイベント処理
  @HostListener("window:resize", ["$event"])
  public onResize(event: Event) {
    this.onWindowResize();
  }

  // ウィンドウリサイズ
  public onWindowResize(): void {
    if(this.container === undefined) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const top = this.container.offsetTop;

    const ratio = this.data.range / 100;
    this.data.boxWidth = this.min_width + (width - this.min_width) *  (1 - ratio);
    this.data.boxHeight = this.min_height + (height - this.min_height) *  (1 - ratio);

    this.data.boxTop = top + this.padding_top * ratio;
    this.data.boxLeft = (width - this.padding_right - this.min_width) * ratio;

    if (this.three) {
      const three_element = this.three.nativeElement as HTMLElement;
      const three_style = three_element.style;

      three_style.width = this.data.boxWidth + "px";
      three_style.height = this.data.boxHeight + "px";
      three_style.top = this.data.boxTop + "px";
      three_style.left = this.data.boxLeft + "px";
      }
  }

}
