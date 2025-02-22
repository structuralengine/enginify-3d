import { Injectable } from '@angular/core';
import Konva from 'konva';
import { Shape } from 'konva/lib/Shape';
import { Page } from './models/page.model';


@Injectable({
  providedIn: 'root'
})
export class KonvaService {
  public stage!: Konva.Stage;
  private pages: Page[] = [];
  private currentPage: Page | null = null;
  private transformer: Konva.Transformer;

  constructor() {
    this.transformer = new Konva.Transformer({
      rotateEnabled: true,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      borderStroke: '#666',
      borderStrokeWidth: 1,
      padding: 5
    });
  }

  public addPage(): void {
    const uuid = crypto.randomUUID();
    const layer = new Konva.Layer({
      name: uuid,
      opacity: 0.8,
      visible: true,
      clearBeforeDraw: true,
      hitGraphEnabled: true,
      x: 50,
      y: 50
    });
    
    const page = new Page(uuid, layer);
    this.pages.push(page);
    this.stage.add(layer);
    layer.add(this.transformer);
    
    if (!this.currentPage) {
      this.switchToPage(page.id);
    }
  }

  public removePage(pageId: string): void {
    if (this.pages.length <= 1) return; // Don't remove last page
    
    const pageIndex = this.pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return;
    
    const page = this.pages[pageIndex];
    page.layer.destroy();
    this.pages.splice(pageIndex, 1);
    
    if (this.currentPage?.id === pageId) {
      this.switchToPage(this.pages[0]?.id);
    }
  }

  public switchToPage(pageId: string): void {
    const page = this.pages.find(p => p.id === pageId);
    if (!page) return;
    
    this.pages.forEach(p => {
      p.layer.visible(p.id === pageId);
      p.isVisible = p.id === pageId;
    });
    this.currentPage = page;
    page.layer.batchDraw();
  }

  public getCurrentPage(): Page | null {
    return this.currentPage;
  }

  public getPages(): Page[] {
    return this.pages;
  }

  public addShape(paths: any[]): void {
    if (!this.currentPage) {
      this.addPage();

    }

    const path = new Konva.Path({
      fill: 'blue',
      draggable: true,
    });
    path.x(50);
    path.y(50);
    path.data('M 200 100 L 50 50 L 50 100 Z');

    this.setDrag(path);

    if (this.currentPage) {
      this.currentPage.shapes.push(path);
      this.currentPage.layer.add(path);
      this.currentPage.layer.batchDraw();
    }
  }

  private setDrag(shape: Shape): void {
    // Selection handling
    shape.on('click tap', () => {
      this.selectShape(shape);
    });

    // Double click for color change
    shape.on('dblclick', () => {
      const colors = ['red', 'green', 'blue', 'yellow'];
      const currentColor = shape.fill();
      const currentColorStr = typeof currentColor === 'string' ? currentColor : colors[0];
      const nextColor = colors[(colors.indexOf(currentColorStr) + 1) % colors.length];
      shape.fill(nextColor);
      shape.getLayer()?.batchDraw();
    });

    // Mouse interactions
    shape.on('mouseover', () => {
      document.body.style.cursor = 'pointer';
      shape.opacity(0.5);
      shape.getLayer()?.batchDraw();
    });

    shape.on('mouseout', () => {
      document.body.style.cursor = 'default';
      shape.opacity(1);
      shape.getLayer()?.batchDraw();
    });

    // Drag events
    shape.on('dragstart', () => {
      shape.moveToTop();
      this.transformer.moveToTop();
    });

    shape.on('dragmove', () => {
      this.transformer.getLayer()?.batchDraw();
    });

    shape.on('dragend', () => {
      console.log(`Shape dragged to x: ${shape.x()}, y: ${shape.y()}`);
    });
  }

  public addCircle(): void {
    if (!this.currentPage) {
      this.addPage();
    }

    const circle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 50,
      fill: 'red',
      draggable: true,
    });

    this.setDrag(circle);

    if (this.currentPage) {
      this.currentPage.shapes.push(circle);
      this.currentPage.layer.add(circle);
      this.currentPage.layer.batchDraw();
    }
  }

  public addRectangle(): void {
    if (!this.currentPage) {
      this.addPage();
    }


    const rectangle = new Konva.Rect({
      x: 200,
      y: 200,
      width: 100,
      height: 50,
      fill: 'blue',
      draggable: true,
    });

    this.setDrag(rectangle);
    
    if (this.currentPage) {
      this.currentPage.shapes.push(rectangle);
      this.currentPage.layer.add(rectangle);
      this.currentPage.layer.batchDraw();
    }
  }

  public selectShape(shape: Konva.Shape): void {
    this.transformer.nodes([shape]);
    const layer = shape.getLayer();
    if (layer && !layer.find('.transformer').length) {
      layer.add(this.transformer);
      layer.batchDraw();
    }
  }

  public clearSelection(): void {
    this.transformer.nodes([]);
    this.transformer.getLayer()?.batchDraw();
  }
}
