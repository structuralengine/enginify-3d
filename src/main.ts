import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { AppConfig } from './environments/environment';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app/app-routing.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

if (AppConfig.production) {
  enableProdMode();
}

// Use `window` to set MonacoEnvironment
(window as any).MonacoEnvironment = {
  getWorkerUrl: function (moduleId: string, label: string) {
    if (label === 'json') {
      return './assets/monaco-editor/vs/language/json/json.worker.js';
    }
    if (label === 'css') {
      return './assets/monaco-editor/vs/language/css/css.worker.js';
    }
    if (label === 'html') {
      return './assets/monaco-editor/vs/language/html/html.worker.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return './assets/monaco-editor/vs/language/typescript/ts.worker.js';
    }
    return './assets/monaco-editor/vs/editor/editor.worker.js';
  },
};

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withInterceptorsFromDi()), provideAnimationsAsync()
  ]
}).catch((err: any) => console.error(err));