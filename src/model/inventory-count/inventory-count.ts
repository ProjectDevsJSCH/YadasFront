import jsPdf from 'jspdf';
import moment from 'moment';

import { getImgUrl } from '@/utils/resolvers/image-resolver';
import { InventoryApi } from '@/api';
import { getTokenData } from '../user/get-token-data';

export class InventoryCount {
  static async generateImage(consecutiveBase: number) {
    const token = getTokenData();
    if (!token.rol) return false;

    const doc = new jsPdf('l', 'pt', [566, 612]);
    const img = new Image();
    const DATA_POINTS = [
      [
        25,
        41.5,
        57.4,
      ],
      [
        126.7,
        143,
        159,
      ],
      [
        294,
        311,
        327,
      ],
      [
        455,
        471,
        487,
      ],
    ];
    const COLUMNS = [
      110,
      416,
    ];

    img.src = getImgUrl('Ref');
    doc.setFontSize(11 / doc.internal.scaleFactor);

    getTokenData();

    const inventory = await InventoryApi.getAll(token.enterprise);
    const maxChar = 23; // + 2
    let baseNumber = consecutiveBase;
    let currentColumn = 0;

    console.log('SIZES');
    console.log(doc.internal.pageSize.getWidth());
    console.log(doc.internal.pageSize.getHeight());

    doc.addImage(
      img,
      'png',
      0,
      0,
      doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(),
    );

    inventory.forEach((group, groupIdx) => {
      group.items.forEach((item, itemIdx) => {
        if (item.Existencia <= 0) {
          return;
        }

        const { Descripción, Marca, Referencia } = item;

        const column = COLUMNS[currentColumn];

        DATA_POINTS.forEach((SECTION) => {
          let [descripcion, referencia, marca] = SECTION;
          descripcion /= doc.internal.scaleFactor;
          referencia /= doc.internal.scaleFactor;
          marca /= doc.internal.scaleFactor;

          doc.setTextColor(255, 0, 0);
          doc.text(
            `No. ${baseNumber}`,
            column - 70,
            descripcion - 12,
          );
          doc.setTextColor(0, 0, 0);

          doc.text(
            InventoryCount.trimText(Descripción, maxChar),
            column,
            descripcion,
          );
          doc.text(
            InventoryCount.trimText(Referencia, maxChar),
            column,
            referencia,
          );
          doc.text(
            InventoryCount.trimText(Marca, maxChar),
            column,
            marca,
          );
        });

        currentColumn = currentColumn === 0 ? 1 : 0;

        baseNumber += 1;
        if (
          baseNumber !== 26000
          && baseNumber % 2 === 0
        ) {
          if (inventory.length - 1 === groupIdx && group.items.length - 1 === itemIdx) { return; }

          doc.addPage();
          doc.addImage(
            img,
            'png',
            0,
            0,
            doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(),
          );
        }
      });
    });

    doc.save(`${token.rol}_lista_conteos_${moment().format('YYYY/MM/DD')}`);
  }

  static trimText(txt: string, max: number) {
    return [...txt].slice(0, max).join('');
  }
}
