# 仕様

## 非機能要件

- [Angular](https://v18.angular.jp/)
- [Electron](https://www.electronjs.org/ja/docs/latest/)
- スタイルシート
  - [tailwind](https://tailwindui.com)
- コンポーネント
  - [Flowbite](https://flowbite.com/docs/getting-started/quickstart/)
- ~~ドッキングウィンドウ~~
  - [Dock Spawn TS](https://node-projects.github.io/dock-spawn-ts/)
- 3Dエンジン
  - [three.js](https://threejs.org/)
- 2Dエンジン  
  - [konva.js](https://konvajs.org/docs/index.html)
- スプレッドシート
  - [ParamQuery Grid](https://paramquery.com/tutorial)
- コードエディタ
  - [Monaco Editor](https://microsoft.github.io/monaco-editor/)



# プログラムのセットアップ方法

```bash
npm install
```

# プログラムの起動方法

## Angular をデバッグ

### 1. Angularを起動
```bash
npm run start
```
http://localhost:4200 で待機します。

### 2. ブラウザを起動
**F5** から
`.vscode\launch.json` の
**Debug with Chrome** を実行


## Electron をデバッグ

### 1. Angularを起動
```bash
npm run start:electron
```
http://localhost:4200 で待機します。

### 2. Electronを起動
**F5** から
`.vscode\launch.json` の
**Debug with Electron** を実行


## Electronアプリを実行（デバッグ無し）
```bash
npm run start:electron
npm run serve:electron
```

## Webアプリをビルド
```bash
npm run build
```
`./dist` フォルダに出力されます。


## Electronアプリのインストーラーを作成
```bash
npm run build:electron
```
`./release` フォルダに出力されます。

