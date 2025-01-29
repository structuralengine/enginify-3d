import 'reflect-metadata';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { ElectronService } from './providers/electron.service';

import { AppComponent } from './app.component';

import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputDataService } from './providers/input-data.service';
import { MenuComponent } from "./components/menu/menu.component";
import { ThreeComponent } from "./components/three/three.component";
import { MonacoComponent } from './components/monaco/monaco.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { LayoutComponent } from './components/layout/layout.component';
import { SceneService } from './components/three/scene.service';

@NgModule({
    declarations: [
        AppComponent,
        MenuComponent,
        ThreeComponent,
        MonacoComponent,
        ToolbarComponent,
        LayoutComponent
    ],
    bootstrap: [
        AppComponent
    ], 
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule
    ], 
    providers: [
        ElectronService,
        InputDataService,
        SceneService,
        provideHttpClient(withInterceptorsFromDi())
    ]
})
export class AppModule { }
