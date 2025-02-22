import Konva from 'konva';

export interface PageModel {
  id: string;
  shapes: Konva.Shape[];
  layer: Konva.Layer;
  isVisible: boolean;
}

export class Page implements PageModel {
  id: string;
  shapes: Konva.Shape[] = [];
  layer: Konva.Layer;
  isVisible: boolean = false;

  constructor(id: string, layer: Konva.Layer) {
    this.id = id;
    this.layer = layer;
  }
}
