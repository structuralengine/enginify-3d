# web-ifc について

## 導入メモ

### src\assets\web-ifc
node_module から参照するとエラーになるのでここにコピーして参照している

### package.json
```json
  "scripts": {
    "postinstall": "... && node src/assets/web-ifc/web-ifc-copy.js",",
    ...
  },
```

```json
  "dependencies": {
    ...
    "web-ifc": "^0.0.66",
    ...
  }
```


### angular.json
```json
        ...
        "build": {
          "options": {
            "assets": [
              {
                "glob": "**/*",
                "input": "node_modules/web-ifc",
                "output": "/assets/web-ifc/bin"
              },
              ...
            ],
          }
        }
        ...
```


## 問題点

**CodeService** color が 白になってしまうので、強引に色を変えている

```ts
  private getBufferGeometry(modelID: number, placedGeometry: PlacedGeometry) {
    // WARNING: geometry must be deleted when requested from WASM
    const geometry = this.ifcAPI.GetGeometry(modelID, placedGeometry.geometryExpressID);
    const verts = this.ifcAPI.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
    const indices = this.ifcAPI.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
    const org_color = placedGeometry.color;
    const my_color: Color = {
        x: 0.1,
        y: 0.1,
        z: 0.1,
        w: org_color.w
    }
    const bufferGeometry = this.ifcGeometryToBuffer(my_color, verts, indices);

    //@ts-ignore
    geometry.delete();
    return bufferGeometry;
  }
```