export interface ImageMeta {
  format: string;
  y: number;
  x?: number;
  width: number;
  path: string;
}

export interface ImageMetaPDF extends ImageMeta {
  imageElement: HTMLImageElement;
}

export function getImgUrl(imgSrc: string) {
  const images = require.context('@/assets/', false, /\.png$/);

  return images(`./${imgSrc}.png`);
}

export async function resolveImages(imagesMeta: ImageMeta[]) {
  const images: ImageMetaPDF[] = [];
  const resolvers: Promise<Event>[] = [];

  imagesMeta.forEach((image) => {
    const img = new Image();

    img.src = getImgUrl(image.path);
    images.push({
      ...image,
      imageElement: img,
    });

    resolvers.push(new Promise((resolve) => {
      img.onload = resolve;
    }));
  });

  await Promise.all(resolvers);

  return images;
}
