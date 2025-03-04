import { AfterViewInit, Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
export class KonvaComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('konvaContainer', { static: false }) containerRef: ElementRef | undefined;

  constructor(private konva: KonvaStageService, private injector: Injector) { }
  
  ngOnInit(): void {
    // Add a button to the DOM to trigger shape creation
    const button = document.createElement('button');
    button.innerText = 'Create Shape';
    button.style.position = 'absolute';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '1000';
    button.style.padding = '10px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    
    // Add click event listener
    button.addEventListener('click', () => {
      // Get the ItemViewPortService
      const itemViewPortService = this.injector.get(ItemViewPortService);
      // Call createItem
      itemViewPortService.createItem();
      console.log('createItem called manually');
    });
    
    // Add the button to the DOM
    document.body.appendChild(button);
  }

  ngAfterViewInit(): void {
    console.log('KonvaComponent: ngAfterViewInit called');
    if(!this.containerRef) {
      console.error('KonvaComponent: containerRef is undefined');
      return;
    }
    const container = this.containerRef.nativeElement as HTMLDivElement;
    console.log('KonvaComponent: container dimensions', {
      width: container.offsetWidth,
      height: container.offsetHeight,
      clientWidth: container.clientWidth,
      clientHeight: container.clientHeight
    });
    
    if(this.konva.stage) {
      console.log('KonvaComponent: stage already initialized');
      return;
    }
    
    this.stageInit(container);
    console.log('KonvaComponent: stage initialized', this.konva.stage);
    
    // Update debug info
    const stageInfoElement = document.getElementById('stage-size');
    if (stageInfoElement && this.konva.stage) {
      stageInfoElement.textContent = `W: ${this.konva.stage.width()}, H: ${this.konva.stage.height()}`;
    }
  }

  private stageInit(container: HTMLDivElement){
    // Ensure container has dimensions
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      console.error('KonvaComponent: Container has zero dimensions, using default values');
      this.konva.stage = new Konva.Stage({
        container: container,
        width: 800,
        height: 600,
      });
    } else {
      this.konva.stage = new Konva.Stage({
        container: container,
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
    }
    
    // Add a background rect to the stage to make it visible
    const layer = new Konva.Layer();
    const background = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.konva.stage.width(),
      height: this.konva.stage.height(),
      fill: '#e0e0e0',
      opacity: 0.3
    });
    layer.add(background);
    this.konva.stage.add(layer);
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
