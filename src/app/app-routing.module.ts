import { Routes } from '@angular/router';
import { MonacoComponent } from './components/monaco/monaco.component';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
    { path: '', redirectTo: '/design', pathMatch: 'full' },
    { path: 'design', component: LayoutComponent },
    { path: 'code', component: MonacoComponent }
];