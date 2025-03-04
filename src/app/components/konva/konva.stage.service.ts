import { Injectable } from '@angular/core';
import Konva from 'konva';

@Injectable({
  providedIn: 'root'
})
export class KonvaStageService {
  public stage: Konva.Stage | null = null;

  constructor() { }
}
