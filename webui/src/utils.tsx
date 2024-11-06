declare global {
  interface Array<T> {
    intersperse(sep: T): Array<T>;
  }

  interface String {
    toTitleCase(): string;
  }
}

// https://stackoverflow.com/a/75891636
export function intersperse<T>(arr: T[], sep: T): T[] {
  return arr.flatMap((el: T, i: number) => i == 0 ? [el] : [sep, el]);
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

// https://stackoverflow.com/a/196991
export function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

if (!String.prototype.toTitleCase) {
  Object.defineProperty(String.prototype, 'toTitleCase', {
    enumerable: false,
    writable: false,
    configurable: false,
    value: function() {
      return this.replace(
        /\w\S*/g,
        (text: string) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
      );
    },
  });
}
