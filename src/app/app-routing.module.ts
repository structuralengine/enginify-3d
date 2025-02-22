import { Routes } from '@angular/router';
import { MonacoComponent } from './components/monaco/monaco.component';
import { KonvaComponent } from './components/konva/konva.component';

export const routes: Routes = [
    { path: '', redirectTo: '/design', pathMatch: 'full' },
    { path: 'design', component: KonvaComponent },
    { path: 'code', component: MonacoComponent }
];
