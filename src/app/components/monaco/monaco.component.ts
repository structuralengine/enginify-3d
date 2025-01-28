import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as monaco from 'monaco-editor';
import { InputDataService } from 'src/app/providers/input-data.service';

@Component({
  selector: 'app-monaco',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './monaco.component.html'
})
export class MonacoComponent implements OnInit, OnDestroy {

  private editor: monaco.editor.IStandaloneCodeEditor | undefined;

  constructor( 
    private el: ElementRef,
    private data: InputDataService,
    private http: HttpClient) {

    // validation settings
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true, // これを true に設定すると、コードの意味論的エラーの検証を無効にします。つまり、型の不一致や未定義の変数の使用など、意味論的なエラーがあってもエラーメッセージが表示されなくなります。
      noSyntaxValidation: true // これを true に設定すると、コードの構文エラーの検証を無効にします。つまり、構文エラーがあってもエラーメッセージが表示されなくなります
    });
    // compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true  //TypeScript ファイル以外のファイルも TypeScript コンパイラで処理できるようにする設定です。このオプションを true に設定すると、拡張子が .ts でないファイルも TypeScript として扱われます。
    });
    // extra libraries
    const libFiles = [
      'assets/web-ifc/bin/ifc-schema.d.ts',
      'assets/web-ifc/bin/web-ifc-api.d.ts',
      'assets/web-ifc/bin/web-ifc-api-node.d.ts',
      'assets/web-ifc/bin/helpers/log.d.ts',
      'assets/web-ifc/bin/helpers/properties.d.ts',
    ];
    libFiles.forEach(file => {
      this.http.get(file, { responseType: 'text' }).subscribe(content => {
        const path = "file:///" + file;
        console.log(path, monaco.languages.typescript.typescriptDefaults.addExtraLib(content, path));
      });
    });
  }

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
