export interface Endpoint {
  value: number;
  equal: boolean;
}

export type Ranges = Endpoint[];

export class RangeSet {
  constructor(ranges: Ranges | string = []) {
    if (Array.isArray(ranges)) this.ranges = ranges;
    else if (typeof ranges === "string") this.ranges = parseRanges(ranges);
    else throw new TypeError("Unknown initial ranges");
  }
  ranges: Ranges;
  operate(table: OperateTruthTable, ...rs: RangeSet[]): RangeSet {
    return operate(
      table,
      this,
      rs.length === 1 ? rs[0] : rs[0].operate(table, ...rs.slice(1))
    );
  }
  union(...rs: RangeSet[]): RangeSet {
    return this.operate(truthTable_union, ...rs);
  }
  intersection(...rs: RangeSet[]): RangeSet {
    return this.operate(truthTable_intersection, ...rs);
  }

  isSubsetOf(rs: RangeSet): boolean {
    return this.intersection(rs).isSame(this);
  }
  isProperSubsetOf(rs: RangeSet): boolean {
    return !this.isSame(rs) && this.isSubsetOf(rs);
  }
  isSame(rs: RangeSet): boolean {
    if (this.ranges.length !== rs.ranges.length) return false;
    for (let i = 0; i < this.ranges.length; i++) {
      if (
        this.ranges[i].value !== rs.ranges[i].value ||
        this.ranges[i].equal !== rs.ranges[i].equal
      )
        return false;
    }
    return true;
  }
  isEmpty(): boolean {
    return this.ranges.length === 0;
  }
  isValid(): boolean {
    if (this.ranges.length % 2 !== 0) return false;
    for (let i = 1; i < this.ranges.length; i++) {
      if (this.ranges[i - 1].value >= this.ranges[i].value) return false;
    }
    if (this.ranges[0].value === -Infinity && this.ranges[0].equal)
      return false;
    if (
      this.ranges[this.ranges.length - 1].value === Infinity &&
      this.ranges[this.ranges.length - 1].equal
    )
      return false;
    return true;
  }

  get numOfRanges(): number {
    return this.ranges.length / 2;
  }
  get prettier(): { left: Endpoint; right: Endpoint }[] {
    let prettier: { left: Endpoint; right: Endpoint }[] = [];
    for (let i = 0; i < this.ranges.length; i += 2)
      prettier.push({ left: this.ranges[i], right: this.ranges[i + 1] });
    return prettier;
  }
}

export type OperateTruthTable = [
  //          R:true    R:false
  /*L:true */ [boolean, boolean],
  /*L:flase*/ [boolean, boolean]
];

export function calcTruthTable(
  table: OperateTruthTable,
  l: boolean,
  r: boolean
) {
  return table[l ? 0 : 1][r ? 0 : 1];
}

export const truthTable_union: OperateTruthTable = [
  [true, true],
  [true, false],
];
export const truthTable_intersection: OperateTruthTable = [
  [true, false],
  [false, false],
];

export function operate(
  table: OperateTruthTable,
  rs1: RangeSet,
  rs2: RangeSet
): RangeSet {
  let r1 = rs1.ranges,
    r2 = rs2.ranges,
    result: Ranges = [];
  let arr: {
    value: number;
    equal: boolean;
    whose: 0x1 | 0x2 | 0x3;
    type: "start" | "end";
  }[] = [];
  let arr2: {
    value: number;
    equal: boolean;
    t: boolean;
  }[] = [];
  {
    let i1 = 0,
      i2 = 0;
    let t1 = false,
      t2 = false;
    while (i1 < r1.length && i2 < r2.length) {
      const v1 = r1[i1].value,
        v2 = r2[i2].value,
        e1 = r1[i1].equal,
        e2 = r2[i2].equal;
      let crtValue: number;
      let crtEqual: boolean;
      let crtWhose: 0x1 | 0x2 | 0x3;
      let crtType: "start" | "end";

      const x1 = (t1 ? -1 : 1) * (e1 ? 1 : 2);
      const x2 = (t2 ? -1 : 1) * (e2 ? 1 : 2);
      if (v1 > v2 || (v1 === v2 && x1 > x2)) {
        crtValue = v2;
        crtEqual = e2;
        crtWhose = 0x2;
        crtType = t2 ? "end" : "start";
        i2++;
        t2 = !t2;
      } else if (v2 > v1 || (v1 === v2 && x1 > x2)) {
        crtValue = v1;
        crtEqual = e1;
        crtWhose = 0x1;
        crtType = t1 ? "end" : "start";
        i1++;
        t1 = !t1;
      } else {
        crtValue = v1 /*===v2*/;
        crtEqual = e1 /*===e2*/;
        crtWhose = 0x3;
        crtType = t1 /*===t2*/ ? "end" : "start";
        i1++;
        i2++;
        t1 = !t1;
        t2 = !t2;
      }
      arr.push({
        value: crtValue,
        equal: crtEqual,
        whose: crtWhose,
        type: crtType,
      });
    }
    if (i1 < r1.length) {
      for (let j = i1; j < r1.length; j++) {
        const crt = r1[j];
        arr.push({
          value: crt.value,
          equal: crt.equal,
          whose: 0x1,
          type: t1 ? "end" : "start",
        });
        t1 = !t1;
      }
    } else if (i2 < r2.length) {
      for (let j = i2; j < r2.length; j++) {
        const crt = r2[j];
        arr.push({
          value: crt.value,
          equal: crt.equal,
          whose: 0x2,
          type: t2 ? "end" : "start",
        });
        t2 = !t2;
      }
    }
  }
  {
    if (arr[0].value !== -Infinity) {
      arr2.push({
        value: -Infinity,
        equal: false,
        t: calcTruthTable(table, false, false),
      });
    }
    let t1 = false,
      t2 = false;
    for (const a of arr) {
      let eq = a.equal;
      if (a.type === "start") {
        if (a.whose & 0x1) t1 = true;
        if (a.whose & 0x2) t2 = true;
      } else {
        eq = !eq;
        if (a.whose & 0x1) t1 = false;
        if (a.whose & 0x2) t2 = false;
      }
      arr2.push({
        value: a.value,
        equal: eq,
        t: calcTruthTable(table, t1, t2),
      });
    }
  }
  {
    let t = false;
    for (const a of arr2) {
      if (t !== a.t) {
        t = a.t;
        result.push({
          value: a.value,
          equal: t ? a.equal : !a.equal,
        });
      }
    }
    if (t) {
      result.push({
        value: Infinity,
        equal: false,
      });
    }
  }
  return new RangeSet(result);
}

export function parseRanges(str: string): Ranges {
  const errMsg = "parseError: Invalid set of ranges.";
  let ranges: Ranges = [];
  str = str.replace(/\s/g, "");
  let v = "";
  let t = 0;
  let e1 = false;
  function parseV(v: string): number {
    v = v.toLowerCase();
    if (v === "infinity" || v === "+infinity") {
      return Infinity;
    }
    if (v === "-infinity") {
      return -Infinity;
    }
    return parseInt(v);
  }
  for (const c of str) {
    if (c === "(") {
      if (t++ !== 0) throw new Error(errMsg);
      e1 = false;
    } else if (c === "[") {
      if (t++ !== 0) throw new Error(errMsg);
      e1 = true;
    } else if (c === ",") {
      if (t++ !== 1) throw new Error(errMsg);
      let value = parseV(v);
      if (isNaN(value)) throw new Error(errMsg + `("${v}" is not a number)`);
      ranges.push({
        value,
        equal: e1,
      });
      v = "";
    } else if (c === ")") {
      if (t !== 2) throw new Error(errMsg);
      t = 0;
      let value = parseV(v);
      if (isNaN(value)) throw new Error(errMsg);
      ranges.push({
        value,
        equal: false,
      });
      v = "";
    } else if (c === "]") {
      if (t !== 2) throw new Error(errMsg);
      t = 0;
      let value = parseV(v);
      if (isNaN(value)) throw new Error(errMsg);
      ranges.push({
        value,
        equal: true,
      });
      v = "";
    } else {
      if (t === 0) throw new Error(errMsg);
      v += c;
    }
  }
  if (t !== 0) throw new Error(errMsg);
  return ranges;
}

export function stringifyRanges(ranges: Ranges) {
  let str = "";
  let left = true;
  for (const r of ranges) {
    if (left) {
      str += r.equal ? "[" : "(";
      str += r.value.toString();
      str += ",";
    } else {
      str += r.value.toString();
      str += r.equal ? "]" : ")";
    }
    left = !left;
  }
  return str;
}
