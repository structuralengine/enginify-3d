import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import packageJson from 'package.json';

import { CodeService } from '../three/code.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule ]
})
export class MenuComponent implements AfterViewInit {
  
  constructor(
    private router: Router,
     public code: CodeService ) { }

  ngAfterViewInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.routerChange();
    });
  }
  
  // ソフトウェア名、バージョン、ホームページ
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

  
  // ソースページかデザインページかを切り替える
  public routerLink: string = '/code';
  public routerPageName: string = 'ソース';
  public routerChange(): void {
    if (this.router.url === '/code') {
      this.routerLink = '/design';
      this.routerPageName = 'デザイン';
    } else {
      this.routerLink = '/code';
      this.routerPageName = 'ソース';
    }
  }

  // コードを実行する
  public runCode(): void {
    this.code.runCode();
  }

}
