import { Injectable } from '@angular/core';
import { IfcAPI, LogLevel, ms, Schemas, IFC4, IFCUNITASSIGNMENT, IFCAXIS2PLACEMENT3D,IFCLENGTHMEASURE,IFCCARTESIANPOINT,IFCAXIS2PLACEMENT2D,IFCCIRCLEPROFILEDEF,IFCDIRECTION,IFCREAL,IFCPOSITIVELENGTHMEASURE,IFCCOLUMN,IFCEXTRUDEDAREASOLID,IFCGLOBALLYUNIQUEID,IFCLABEL,IFCIDENTIFIER } from 'web-ifc';

import * as ts from "typescript";

import { InputDataService } from 'src/app/providers/input-data.service';
import { ItemIfcService } from 'src/app/providers/item-ifc.service';


@Injectable({
  providedIn: 'root'
})
export class CodeService {

  private ifcAPI = new IfcAPI();
  private initPromise: Promise<void>;
  private isInitialized = false;

  constructor(
    private input: InputDataService,
    private item: ItemIfcService ) {
      // Initialize web-ifc
      this.ifcAPI.SetWasmPath('/assets/web-ifc/bin/');
      this.initPromise = this.ifcAPI.Init().then(() => {
        console.log('web-ifc Initialization complete');
        this.isInitialized = true;
      }).catch((err) => {
        console.error('web-ifc Initialization failed:', err);
        throw err;
      });
    }

  public async runCode() {
    if (!this.isInitialized) {
      // Wait for initialization to complete before proceeding
      await this.initPromise;
    }
    const model = this.ifcAPI.CreateModel({ schema: Schemas.IFC4 });

    const compiled = ts.transpileModule(this.input.code, { compilerOptions: { module: ts.ModuleKind.CommonJS } })
    const outputText = compiled.outputText;
    // this is where we do evil stuff
    {
      console.log(` --- Starting EVAL!`);
      // 引数名を配列として定義
      const args = [
        'ifcAPI',
        'model',
        'IFC4',
        'IFCAXIS2PLACEMENT3D',
        'IFCLENGTHMEASURE',
        'IFCCARTESIANPOINT',
        'IFCAXIS2PLACEMENT2D',
        'IFCCIRCLEPROFILEDEF',
        'IFCDIRECTION',
        'IFCREAL',
        'IFCPOSITIVELENGTHMEASURE',
        'IFCCOLUMN',
        'IFCEXTRUDEDAREASOLID',
        'IFCGLOBALLYUNIQUEID',
        'IFCLABEL',
        'IFCIDENTIFIER'
      ];
      // Function コンストラクタを使用して関数を生成
      const dynamicFunction = new Function(
        ...args,
        outputText
      );
      // 生成した関数を引数とともに実行
      dynamicFunction(
        this.ifcAPI,
        model,
        IFC4,
        IFCAXIS2PLACEMENT3D,
        IFCLENGTHMEASURE,
        IFCCARTESIANPOINT,
        IFCAXIS2PLACEMENT2D,
        IFCCIRCLEPROFILEDEF,
        IFCDIRECTION,
        IFCREAL,
        IFCPOSITIVELENGTHMEASURE,
        IFCCOLUMN,
        IFCEXTRUDEDAREASOLID,
        IFCGLOBALLYUNIQUEID,
        IFCLABEL,
        IFCIDENTIFIER
      );
      console.log(` --- Ending EVAL!`);
    }

    let ifcData = this.ifcAPI.SaveModel(model);
    console.log(new TextDecoder('ascii').decode(ifcData));

    this.ifcAPI.CloseModel(model);

    let modelID = this.ifcAPI.OpenModel(ifcData);

    this.item.LoadAllGeometry(this.ifcAPI, modelID);
  }


}


