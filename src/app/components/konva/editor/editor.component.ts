import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KonvaService } from '../konva.service';
import Konva from 'konva';
import { MobxAngularModule } from 'mobx-angular';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, MobxAngularModule],
  template: `
    <div class="editor-container">
      <div class="toolbar">
        <button (click)="addShape()">Add Shape</button>
        <button (click)="addCircle()">Add Circle</button>
        <button (click)="addRectangle()">Add Rectangle</button>
        <div class="zoom-controls">
          <button (click)="zoomIn()">+</button>
          <button (click)="zoomOut()">-</button>
        </div>
      </div>
      <div class="workspace">
        <div #stageContainer class="stage-container" [style.width.px]="800" [style.height.px]="600"></div>
      </div>
      <div class="side-panel">
        <div class="pages">
          <button (click)="addPage()">Add Page</button>
          <div *ngFor="let page of pages">
            Page {{page}}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .editor-container {
      display: grid;
      grid-template-columns: 200px 1fr 200px;
      height: 90vh;
      gap: 1rem;
      padding: 1rem;
    }

    .toolbar {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .workspace {
      border: 1px solid #ccc;
      overflow: hidden;
      position: relative;
      width: 100%;
      height: 100%;
    }

    .stage-container {
      position: relative;
      margin: auto;
      background: #f5f5f5;
      border: 1px solid #ddd;
    }

    .side-panel {
      padding: 1rem;
      border-left: 1px solid #ccc;
    }

    .zoom-controls {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    button {
      padding: 0.5rem;
      background: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background: #e0e0e0;
    }
  `]
})
export class EditorComponent implements AfterViewInit {
  @ViewChild('stageContainer') stageContainer!: ElementRef;
  pages: number[] = [1];
  
  constructor(private konvaService: KonvaService) {}
  
  ngAfterViewInit() {
    // Initialize Konva stage with fixed dimensions
    const container = this.stageContainer.nativeElement;
    this.konvaService.stage = new Konva.Stage({
      container: container,
      width: 800,
      height: 600
    });
    // Add initial layer
    this.konvaService.addLayer('layer1');

    // Clear selection when clicking empty stage
    this.konvaService.stage.on('click tap', (e) => {
      if (e.target === this.konvaService.stage) {
        this.konvaService.clearSelection();
      }
    });

    // Clear selection when clicking empty stage
    this.konvaService.stage.on('click tap', (e) => {
      if (e.target === this.konvaService.stage) {
        this.konvaService.clearSelection();
      }
    });
  }

  addShape() { 
    this.konvaService.addShape('layer1', []); 
  }
  
  addCircle() { 
    this.konvaService.addCircle(); 
  }
  
  addRectangle() { 
    this.konvaService.addRectangle(); 
  }
  
  zoomIn() {
    const stage = this.konvaService.stage;
    const scale = stage.scaleX() * 1.2;
    stage.scale({ x: scale, y: scale });
    stage.batchDraw();
  }
  
  zoomOut() {
    const stage = this.konvaService.stage;
    const scale = stage.scaleX() / 1.2;
    stage.scale({ x: scale, y: scale });
    stage.batchDraw();
  }
  
  addPage() {
    this.pages.push(this.pages.length + 1);
  }
}
