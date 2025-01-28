import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as monaco from 'monaco-editor';
import { InputDataService } from 'src/app/providers/input-data.service';

@Component({
  selector: 'app-code',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './code.component.html'
})
export class CodeComponent implements OnInit, OnDestroy {

  private editor: monaco.editor.IStandaloneCodeEditor | undefined;

  constructor( 
    private el: ElementRef,
    private data: InputDataService) {}

  ngOnInit(): void {
    const editorContainer = this.el.nativeElement.querySelector('.editor-container');
    this.editor = monaco.editor.create(editorContainer, {
      value: this.data.code,
      language: 'typescript',
      theme: 'vs-dark',
      automaticLayout: true
    });
    this.editor.onDidChangeModelContent(() => {
      this.onEditorChange();
    });
  }
  
  private onEditorChange() {
    if (this.editor) {
      this.data.code = this.editor.getValue(); // 編集内容を取得
    }
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.data.code = this.editor.getValue(); // 編集内容を取得
      this.editor.dispose(); // メモリリークを防ぐために dispose() を呼ぶ
    }
  }

}
