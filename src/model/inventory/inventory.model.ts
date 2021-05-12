import jspdf from 'jspdf';
import autotable, { CellDef } from 'jspdf-autotable';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import Excel from 'exceljs';

import { TableMapper } from '@/mappers/table-mappers.mapper';
import { InventoryDTO, InventoryItems } from './inventory.dto';
import { resolveImages } from '@/utils/resolvers/image-resolver';
import { PDFGenerator } from '@/utils/pdf/pdf-generator';
import { InventoryConfigTables } from '../inventory-config/inventory-config.dto';
import { merge, omit } from 'lodash';
import { InventoryApi } from '@/api';
import { getTokenData } from '../user/get-token-data';
import { getRowRange } from '@/utils/excel/excel-util';
import { Enterprise } from '../enterprise/enterprise.enum';
import { strHasDigits } from '@/utils/number/str-is-number';

export class Inventory extends InventoryDTO {
  constructor(dto: InventoryDTO) {
    super();
    Object.assign(this, dto);
  }

  toVuetifyTable() {
    const table = TableMapper.toVuetifyTable(this.group, this.items);
    const token = getTokenData();

    /* Sets expandable icon to the end */

    if (token.enterprise! !== Enterprise.UNIPARTES) {
      table.headers.push(
        { text: '', value: 'data-table-expand' },
      );
    } else {
      table.headers.push(
        { text: '', value: 'own-inventory' },
      );
    }

    table.headers.find((header) => {
      if (header.text === 'CantidadPrecios') {
        header.text = 'Promociones';
        return true;
      }

      if (header.text === 'UnipartesExistencia') {
        header.text = 'Unipartes';
        header.sort = ((a: string, b: string) => {
          if (a === '-' && strHasDigits(b)) {
            return -1;
          }

          if (strHasDigits(a) && b === '-') {
            return 1;
          }

          return +a - +b;
        });

        return true;
      }

      return false;
    });

    return table;
  }

  public static async toPdfList(inventoryList: Array<Inventory>) {
    const omit = ['IdInventario', 'CantidadPrecios'];

    const data = inventoryList
      .map((inventory) => {
        /* Mutate data to meet PDF requirements */
        const items = inventory.items
          .map((item) => ({
            ...item,
            Existencia: item.Existencia <= 0 ? 'Agotado' : item.Existencia,
          }));

        return PDFGenerator.formatTable(items, inventory.group, omit);
      });

    const doc = new jspdf();
    const images = await resolveImages([
      {
        format: 'PNG',
        y: 0,
        x: doc.internal.pageSize.width - 45,
        width: 30,
        path: 'yadas',
      },
      {
        format: 'PNG',
        y: doc.internal.pageSize.height - 16,
        width: 65,
        path: 'address_data',
      },
    ]);

    try {
      data.forEach((table: {
        title: string;
        headers: Array<string>;
        body: string[][];
      }) => {
        /* Generate table */
        autotable(doc, {
          head: [
            [
              {
                content: table.title,
                styles: { fontSize: 20 },
                colSpan: table.headers.length,
              } as CellDef,
            ],
            table.headers.map((header) => ({
              content: header,
            })),
          ],
          body: table.body,
          pageBreak: 'auto',
          headStyles: {
            fillColor: 'white',
            textColor: 'black',
          },
          bodyStyles: {
            lineWidth: 0.1,
            lineColor: '#CACACA',
            fontSize: 9,
          },
          columnStyles: {
            0: {
              cellWidth: 29, /* Set ref col to the same width */
            },
          },
          margin: {
            bottom: 29, /* Give space to the lower images */
          },
        });
      });

      try {
        await PDFGenerator.applyImageToPages(doc, images);
      } catch (error) {
        console.error('Error applying images');
        console.error(error);
      }

      /* Add page */
      const pages = doc.internal.getNumberOfPages();

      for (let i = 0; i <= pages; i += 1) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `${i} / ${pages}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 5,
        );
      }

      const namedPDF = new File([doc.output('blob')], `Lista-Yadas_${Date.toString()}`, {
        type: doc.output('blob').type,
        lastModified: doc.output('blob').lastModified,
      });

      window.open(URL.createObjectURL(namedPDF));
    } catch (error) {
      console.log('Error generating data', error);
    }
  }

  public static async toExcelSheet(
    inventoryList: Array<Inventory>,
    sortConfig: InventoryConfigTables[],
    omitUnavailable: boolean,
    indexImage?: string,
  ) {
    const workbook = new Excel.Workbook();
    const promoList = await InventoryApi.getAllPromos();
    const userToken = getTokenData();

    Object.assign(workbook, {
      creator: 'Yadas WT Importaciones portal web',
      created: new Date(),
    });

    // TODO(1): Excel JS is not working as expected,
    // TODO(1): current implementations only works with oddHeader and oddFooter
    // TODO(1): probably in a new updated this will be fixed
    // TODO(1): ISSUE: https://github.com/exceljs/exceljs/issues/1325

    const sheet = workbook.addWorksheet('Inventario', {
      headerFooter: {
        oddHeader: '(&P / &N)',
        oddFooter: `
          \n
          Cra.  27 A Nº 70 – 67
          Cel. 318 248 00 14 - 315 369 52 47 Bogotá, D. C.
          pedidosbodega2014@hotmail.com
       `,
      },
      pageSetup: {
        scale: 79,
        margins: {
          left: 0.7,
          right: 0.7,
          top: 0.75,
          bottom: 0.65,
          header: 0.3,
          footer: 0.3,
        },
      },
      views: [
        {
          style: 'pageLayout',
        },
      ],
    });

    const headerSettings: Partial<Excel.Column>[] = [
      { header: 'Referencia', width: 21 },
      { header: 'Descripción', width: 50 },
      { header: 'Precio', width: 9, numFmt: '$#,##0.00;[Red]-$#,##0.00' },
      { header: 'Marca', width: 12 },
    ];

    if (userToken.enterprise !== Enterprise.UNIPARTES) {
      headerSettings.push({ header: 'Promoción', width: 22 });
    }

    sheet.columns = headerSettings.map((header) => ({
      ...header,
      key: header.header,
      style: {
        font: {
          bold: true,
          name: 'Calibri',
          size: 10,
        },
        alignment: {
          wrapText: true,
          vertical: 'top',
        },
      },
      // }));
    })) as any;

    // Empty blank row
    // * INITIAL HEADER
    sheet.mergeCells('A3:E3');

    const headerCell = sheet.getCell('A3');
    headerCell.value = 'Yadas WT Importaciones S.A.S.';
    headerCell.style = {
      font: {
        size: 22,
        bold: true,
      },
      alignment: {
        horizontal: 'center',
      },
      fill: {
        pattern: 'solid',
        type: 'pattern',
        fgColor: {
          argb: 'ffc000',
        },
      },
    };

    sheet.addRow([]);
    sheet.mergeCells('A4:E4');

    const baseGuideStyles: Partial<Excel.Style> = {
      font: {
        color: {
          argb: 'FF0000',
        },
        size: 10,
        bold: true,
      },
      alignment: {
        horizontal: 'center',
      },
    };
    const firstGuide = sheet.getCell('A4');
    firstGuide.value = 'LOS PRODUCTOS SIN PROMOCIÓN SE LES APLICARÁ UN 15% DCTO';
    firstGuide.style = baseGuideStyles;
    sheet.addRow([]);

    sheet.mergeCells('A5:E5');
    const secondGuide = sheet.getCell('A5');
    secondGuide.style = baseGuideStyles;
    secondGuide.value = 'NINGÚN PRODUCTO TIENE IVA INCLUIDO';
    sheet.addRow([]);

    sheet.mergeCells('A6:E6');
    const thirdGuide = sheet.getCell('A6');
    thirdGuide.style = baseGuideStyles;
    thirdGuide.value = 'LAS PROMOCIONES NO SON ACUMULABLES';

    // * ADD Menu Image
    const menuImage = workbook.addImage({
      base64: indexImage,
      extension: 'png',
    });

    sheet.addImage(menuImage, getRowRange(7, 1, 7, headerSettings.length));
    sheet.addRow(Array(headerSettings.length).fill(''));

    if (sheet.lastRow) {
      sheet.lastRow.height = 780;
    }

    const HEADERS_HEIGHT = 36;
    const ROW_HEIGHT = 36;

    // Array.from({ length: 10 }).forEach(() => {
    //   sheet.addRows(Array(headerSettings.length).fill(''));
    // });

    // *SHEET STYLES
    let itemCount = 0;
    inventoryList.forEach((list) => {
      // TITLE BY GROUP
      const listConfig = sortConfig
        .find((config) => config.table.toUpperCase() === list.group.toUpperCase());
      const listTitle = new Array(headerSettings.length).fill('');

      listTitle[1] = list.group;
      sheet.addRow(listTitle);
      if (sheet.lastRow) {
        sheet.lastRow.height = HEADERS_HEIGHT;
      }

      if (sheet.lastRow) {
        sheet.lastRow.eachCell((cell) => {
          cell.style = {
            font: {
              color: {
                argb: 'FFFFFF',
              },
              size: 10,
              bold: true,
            },
            fill: {
              type: 'pattern',
              pattern: 'solid',
              fgColor: {
                argb: '000000',
              },
            },
            alignment: {
              horizontal: 'center',
              vertical: 'middle',
            },
          };
        });
      }

      // COLUMN TITLES
      sheet.addRow(headerSettings.map((header) => (header.header as string).toUpperCase()));
      if (sheet.lastRow) {
        sheet.lastRow.height = HEADERS_HEIGHT;
        sheet.lastRow.eachCell((cell) => {
          cell.style = {
            font: {
              color: {
                argb: '000000',
              },
              bold: true,
              size: 10,
            },
            fill: {
              type: 'pattern',
              pattern: 'solid',
              fgColor: {
                argb: 'ffc000',
              },
            },
            alignment: {
              horizontal: 'center',
              vertical: 'middle',
            },
          };
        });
      }

      list.items
        .sort((a, b) => {
          if (!listConfig || listConfig.column === '') return 0;

          const ascendant = listConfig.ascendant ? 1 : -1;
          const isNumber = typeof (a as any)[listConfig.column] === 'number';
          const $a = (a as any)[listConfig.column];
          const $b = (b as any)[listConfig.column];

          if (isNumber) {
            return $a - $b * ascendant;
          }

          /* If it is string */
          return ($a as string).localeCompare(($b as string)) * ascendant;
        })
        .filter((item) => {
          if (omitUnavailable) {
            return item.Existencia > 0 || list.group.toLowerCase() === 'bieletas';
          }

          return true;
        })
        .forEach((inventoryItem: InventoryItems, index) => {
          itemCount += 1;
          const item = omit(inventoryItem, 'Existencia');
          const promoData = promoList[item.IdInventario];
          let promoText = '';
          const moneyFormatter = (value: number | string) => {
            const price = String(value);

            return price.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
          };

          promoData.forEach((promo) => {
            // Ignore promo text for all values with 15%
            if (promo.Dcto === 15) { return; }

            const finalPrice = Math.round(item.Precio * ((100 - promo.Dcto) / 100));

            promoText = `$${moneyFormatter(finalPrice)} X COMP DE ${promo.RangoIni} EN ADELANTE (MÁS IVA)`;
          });

          // * GENERAL STYLES PER ROW
          const composedItem = {
            ...item,
            Promoción: promoText,
            Precio: `$${moneyFormatter(item.Precio)}`,
          };
          const lastRow = sheet.addRow(composedItem);

          lastRow.height = ROW_HEIGHT;
          lastRow.font = {
            bold: false,
            size: 10,
          };

          if (index % 2 !== 0) {
            lastRow.eachCell((cell) => {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {
                  argb: 'dfe9f5', // SOFT BLUE
                },
              };
            });
          }

          const baseBorderStyle: Partial<Excel.Border> = {
            color: {
              argb: '000000',
            },
            style: 'thin',
          };

          lastRow.eachCell((cell) => {
            cell.border = {
              top: baseBorderStyle,
              bottom: baseBorderStyle,
              left: baseBorderStyle,
              right: baseBorderStyle,
            };
          });

          const centeredCols = ['Marca', 'Precio'];
          const centeredStyle: Partial<Excel.Style> = {
            alignment: {
              horizontal: 'center',
            },
          };

          centeredCols.forEach((col) => {
            if (!sheet.lastRow) { return; }

            sheet.lastRow.getCell(col).style = merge(
              centeredStyle,
              sheet.lastRow.getCell(col).style,
            );
          });
        });

      sheet.addRow([]);
      if (sheet.lastRow) {
        sheet.lastRow.height = HEADERS_HEIGHT;
      }
    });

    /* Filters */
    sheet.autoFilter = {
      from: {
        row: 1,
        column: 1,
      },
      to: {
        row: sheet.rowCount,
        column: sheet.columnCount,
      },
    };

    for (let i = 0; i < headerSettings.length; i += 1) {
      const col = `${String.fromCharCode(65 + i)}1`;
      const cell = sheet.getCell(col);

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '000000' },
      };

      cell.font = {
        color: { argb: 'FFFFFF' },
      };
    }

    try {
      const fileBuffer = await workbook
        .xlsx
        .writeBuffer({
          filename: `yadas-inventario_${dayjs().format('DD/MM/YYYY')}`,
          useStyles: true,
        });

      saveAs(
        new Blob([fileBuffer],
          { type: 'application/octet-stream' }),
        `yadas-inventario_${dayjs().format('DD/MM/YYYY')}.xlsx`,
      );
    } catch (error) {
      console.error(error);
      console.error('Error generando archivo de Excel');
    }
  }
}
