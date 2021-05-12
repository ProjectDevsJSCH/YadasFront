/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */

function numberToLetter(number: number) {
  const A = 65;

  return String.fromCharCode(A + number - 1);
}

function getRowRange(startRow: number, startCol: number, endRow: number, endCol: number) {
  return `${numberToLetter(startCol)}${startRow}:${numberToLetter(endCol)}${endRow}`;
}

function helperToDataURL(url: string, callback: (result: string | ArrayBuffer | null) => void) {
  const xhr = new XMLHttpRequest();

  xhr.onload = () => {
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result);
    };
    reader.readAsDataURL(xhr.response);
  };

  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}

function toDataUrl(url: string) {
  return new Promise((resolve, reject) => {
    try {
      helperToDataURL(url, (result: string | ArrayBuffer | null) => {
        resolve(result);
      });
    } catch (error) {
      reject();
    }
  });
}

export {
  getRowRange,
  toDataUrl,
};
