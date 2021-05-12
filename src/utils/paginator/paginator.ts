export class Paginator<T> {
  private _elementsPerPage = 10;
  private _currentPage = 0;

  constructor(private elements: T) {
    Object.assign(this, elements);
  }

  set elementsPerPage(elements: number) {
    if (elements < 1) {
      throw new Error('Elements per page cannot be negative or cero');
    }

    this.elementsPerPage = elements;
  }
}
