import { Routes } from '@angular/router';
import { MonacoComponent } from './components/monaco/monaco.component';
import { EditorComponent } from './components/konva/editor/editor.component';

export const routes: Routes = [
    { path: '', redirectTo: '/design', pathMatch: 'full' },
    { path: 'design', component: EditorComponent },
    { path: 'code', component: MonacoComponent }
];
