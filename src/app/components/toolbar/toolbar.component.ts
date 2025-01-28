import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  templateUrl: './toolbar.component.html',
  imports: []
})
export class ToolbarComponent {
  // フローティングウィンドウの位置
  public dragPosition = { x: 0, y: 0 };
}
