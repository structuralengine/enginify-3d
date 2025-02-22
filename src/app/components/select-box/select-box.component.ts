import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

import * as webifc from 'web-ifc';
import { ItemViewPortService } from 'src/app/providers/item-view-port.service';


@Component({
  selector: 'app-select-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-box.component.html'
})
export class SelectBoxComponent {
  @Output() itemSelected = new EventEmitter<void>();
  
  public table_item: { id: string; name: string; service: any; }[];

  constructor(
    private viewPort: ItemViewPortService) {

    /* webifcのすべてオブジェクトを確認
    Object.keys(webifc).forEach(key => {
      console.log(key);
    });
    */
    webifc.IFCREINFORCINGBAR
    this.table_item = [
      { id: "view port", name: "ビューポート", service: this.viewPort },

      { id: "IFCCOLUMN", name: "柱", service: null },
      { id: "IFCBEAM", name: "梁" , service: null },
      // { id: "IFCBEARING", name: "軸受" , service: null },
      // { id: "IFCBUILDINGELEMENTPROXY", name: "建築要素プロキシ" , service: null },
      // { id: "IFCCHIMNEY", name: "煙突" , service: null },
      // { id: "IFCCOURSE", name: "コース" , service: null },
      // { id: "IFCCOVERING", name: "被覆" , service: null },
      // { id: "IFCCURTAINWALL", name: "カーテンウォール" , service: null },
      // { id: "IFCDEEPFOUNDATION", name: "深基礎" , service: null },
      // { id: "IFCDOOR", name: "ドア" , service: null },
      { id: "IFCEARTHWORKSELEMENT", name: "土工要素" , service: null },
      { id: "IFCFOOTING", name: "基礎" , service: null },
      // { id: "IFCKERB", name: "縁石" , service: null },
      // { id: "IFCMEMBER", name: "部材" , service: null },
      // { id: "IFCMOORINGDEVICE", name: "係留装置" , service: null },
      // { id: "IFCNAVIGATIONELEMENT", name: "案内要素" , service: null },
      // { id: "IFCPAVEMENT", name: "舗装" , service: null },
      // { id: "IFCPLATE", name: "板" , service: null },
      // { id: "IFCRAIL", name: "レール" , service: null },
      // { id: "IFCRAILING", name: "手すり" , service: null },
      // { id: "IFCRAMP", name: "スロープ" , service: null },
      // { id: "IFCRAMPFLIGHT", name: "ランプフライト" , service: null },
      // { id: "IFCROOF", name: "屋根" , service: null },
      // { id: "IFCSHADINGDEVICE", name: "日除け装置" , service: null },
      { id: "IFCSLAB", name: "スラブ" , service: null },
      // { id: "IFCSTAIR", name: "階段" , service: null },
      // { id: "IFCSTAIRFLIGHT", name: "階段フライト" , service: null },
      // { id: "IFCTRACKELEMENT", name: "軌道要素" , service: null },
      { id: "IFCWALL", name: "壁" , service: null },
      // { id: "IFCWINDOW", name: "窓" , service: null },
      { id: "IFCREINFORCINGBAR", name: "鉄筋" , service: null },
    ];
    
  }

  public selectItem(item: { id: string; name: string; service: any; }): void {

    if(item.service !== null) {
      item.service.createItem();
    }

    this.itemSelected.emit(); // 親のthree.componentへitemSelectedイベントを発火
  }

}
