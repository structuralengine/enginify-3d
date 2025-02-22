import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import Konva from 'konva';
import { KonvaService } from './konva.service';
import * as ReactDOM from "react-dom/client";
import * as React from "react";
import { App, store } from "./polotno/editor";
import { MobxAngularModule } from 'mobx-angular';

@Component({
  selector: 'app-konva',
  standalone: true,
  imports: [MobxAngularModule],
  templateUrl: './konva.component.html'
})
export class KonvaComponent {
  title = "polotno-js";
  root: ReactDOM.Root | undefined;
  store = store;
  ngOnInit(): void {}

  public ngOnChanges() {
    this.renderComponent();
  }

  public ngAfterViewInit() {
    this.root = ReactDOM.createRoot(document.getElementById("editor")!);
    this.renderComponent();
  }

  private renderComponent() {
    if (this.root) {
      this.root.render(React.createElement(App));
    }
  }

  public ngOnDestroy() {
    if (this.root) {
      this.root.unmount();
    }
  }
}
