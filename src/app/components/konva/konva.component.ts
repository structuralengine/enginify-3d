import { Component } from '@angular/core';
import { EditorComponent } from './editor/editor.component';

@Component({
  selector: 'app-konva',
  standalone: true,
  imports: [EditorComponent],
  template: `
    <div class="konva-container">
      <app-editor></app-editor>
    </div>
  `,
  styles: [`
    .konva-container {
      width: 100%;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #fafafa;
    }
  `]
})
export class KonvaComponent {}
