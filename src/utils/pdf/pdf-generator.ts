import { omit } from 'lodash';
import { ImageMetaPDF } from '../resolvers/image-resolver';

export class PDFGenerator {
  public static formatTable(data: Array<any>, title: string, omitList: string[] = []) {
    const headers = Object.keys(omit(data[0], omitList));
    const body = data.map((value) => Object.values(omit(value, omitList)));

    return {
      title,
      headers,
      body,
    };
  }

  public static async applyImageToPages(doc: any, images: ImageMetaPDF[]) {
    const totalPages = doc.internal.getNumberOfPages();

    for (let i = 0; i < totalPages; i += 1) {
      images.forEach((image) => {
        const imageRatio = image.imageElement.naturalHeight / image.imageElement.naturalWidth;

        doc.setPage(i);
        /* logo */
        doc.addImage(
          image.imageElement,
          image.format,
          image.x ?? doc.internal.pageSize.width / 2 - image.width / 2,
          image.y,
          image.width,
          image.width * imageRatio,
        );
      });
    }
  }
}
