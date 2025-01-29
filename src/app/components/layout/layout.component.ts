import { Component, ElementRef, HostListener, ViewChild  } from '@angular/core';
import { ThreeComponent } from '../three/three.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [ThreeComponent],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
 
  constructor(){}

}
