# Monaco Editor について

## 導入メモ

### src\assets\monaco-editor
node_module から参照するとエラーになるのでここにコピーして参照している

### package.json
```json
  "scripts": {
    "postinstall": "... && node src/assets/monaco-editor/monaco-copy.js && ...",
    ...
  },
```

```json
  "dependencies": {
    ...
    "monaco-editor": "^0.52.2",
    ...
  }
```

### main.ts
```ts
  ...
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
  ...
```

### angular.json
```json
        ...
        "build": {
          "options": {
            "assets": [
              ...
              {
                "glob": "**/*",
                "input": "node_modules/monaco-editor/esm/vs",
                "output": "assets/monaco-editor/vs"
              }
            ],
          }
        }
        ...
```


## 問題点

**MonacoComponent** において 変数 `ifcAPI` を既知の変数としたいが叶わなかった
```ts
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
```

対策としてエラーを無視する設定をしている
```ts
    // validation settings
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true, // これを true に設定すると、コードの意味論的エラーの検証を無効にします。つまり、型の不一致や未定義の変数の使用など、意味論的なエラーがあってもエラーメッセージが表示されなくなります。
      noSyntaxValidation: true // これを true に設定すると、コードの構文エラーの検証を無効にします。つまり、構文エラーがあってもエラーメッセージが表示されなくなります
    });
```