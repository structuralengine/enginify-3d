import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KonvaService } from '../konva.service';
import { Page } from '../models/page.model';
import Konva from 'konva';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule],
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
        <div #stageContainer class="stage-container"></div>
      </div>
      <div class="side-panel">
        <div class="pages">
          <button (click)="addPage()">Add Page</button>
          <div *ngFor="let page of pages; let i = index" 
               [class.active]="page.id === currentPageId"
               class="page-item">
            <span>Page {{i + 1}}</span>
            <button (click)="switchToPage(page.id)">Switch</button>
            <button (click)="removePage(page.id)" 
                    [disabled]="pages.length === 1">Delete</button>
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

    .side-panel {
      padding: 1rem;
      border-left: 1px solid #ccc;
    }

    .pages {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .page-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border: 1px solid #ccc;
      margin: 4px 0;
    }

    .page-item.active {
      background: #e0e0e0;
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
      width: 800px;
      height: 600px;
      margin: auto;
      background: #f5f5f5;
      border: 1px solid #ddd;
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
  
  constructor(private konvaService: KonvaService) {}
  
  get pages(): Page[] {
    return this.konvaService.getPages();
  }
  
  get currentPageId(): string | undefined {
    return this.konvaService.getCurrentPage()?.id;
  }
  
  ngAfterViewInit() {
    const container = this.stageContainer.nativeElement;
    this.konvaService.stage = new Konva.Stage({
      container: container,
      width: 800,
      height: 600
    });

    // Add initial page
    this.addPage();

    // Clear selection when clicking empty stage
    this.konvaService.stage.on('click tap', (e) => {
      if (e.target === this.konvaService.stage) {
        this.konvaService.clearSelection();
      }
    });
  }

  addPage(): void {
    this.konvaService.addPage();
  }
  
  removePage(pageId: string): void {
    this.konvaService.removePage(pageId);
  }
  
  switchToPage(pageId: string): void {
    this.konvaService.switchToPage(pageId);
  }

  addShape(): void {
    this.konvaService.addShape([]);
  }

  addCircle(): void {
    this.konvaService.addCircle();
  }

  addRectangle(): void {
    this.konvaService.addRectangle();
  }

  zoomIn(): void {
    const stage = this.konvaService.stage;
    const scale = stage.scaleX() * 1.2;
    stage.scale({ x: scale, y: scale });
    stage.batchDraw();
  }

  zoomOut(): void {
    const stage = this.konvaService.stage;
    const scale = stage.scaleX() / 1.2;
    stage.scale({ x: scale, y: scale });
    stage.batchDraw();
  }
}
