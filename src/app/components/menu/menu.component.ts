import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import packageJson from 'package.json';

import { CodeService } from '../code/code.service';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    standalone: true,
    imports: [CommonModule]
})
export class MenuComponent {
  
  constructor(
     public code: CodeService ) { }

  public softName: string = packageJson.description;
  public version: string = packageJson.version;
  public homepage = packageJson.homepage;

  public getFileNameFromUrl(url: string) {
    return url.replace(/^.*[\\/]/, '')
  }

  public shortenFilename(filename: string, maxLength: number = 30) {
    let tempName = filename;
    tempName = this.getFileNameFromUrl(tempName);
    return tempName.length <= maxLength ? tempName : '...'+ tempName.slice(tempName.length - maxLength);
  }

  // コードを実行する
  public runCode(): void {
    this.code.runCode();
  }

}
