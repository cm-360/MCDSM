// https://stackoverflow.com/a/75891636
export function intersperse<T>(arr: T[], sep: T): T[] {
  return arr.flatMap((el: T, i: number) => i == 0 ? [el] : [sep, el]);
}

declare global {
  interface Array<T> {
    intersperse(sep: T): Array<T>;
  }
}

// https://stackoverflow.com/a/64522938
if (!Array.prototype.intersperse) {
  Object.defineProperty(Array.prototype, 'intersperse', {
    enumerable: false, 
    writable: false, 
    configurable: false,
    value: function<T>(sep: T) {
      return this.flatMap((el: T, i: number) => i == 0 ? [el] : [sep, el]);
    }
  });
}
