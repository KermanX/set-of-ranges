import { parseRanges, RangeSet, stringifyRanges } from "../dist/index.js";

describe("Test set of range", () => {
  it("should parse ranges correctly", () => {
    expect(
      parseRanges("( - Infinity,1](23, 45)[ 67,89] [100  ,infinity)")
    ).toEqual(data_range_1);
    expect(
      parseRanges("(-Infinity,1](23,45)[67,89] [10 0  ,+infinity)")
    ).toEqual(data_range_1);
    expect(() => parseRanges("[abcd,123)")).toThrowError();
    expect(() => parseRanges("[12?34)")).toThrowError();
    expect(() => parseRanges("[12,34)(56")).toThrowError();
    expect(() => parseRanges("[12,34)(56,78))")).toThrowError();
  });
  it("should stringify ranges correctly", () => {
    expect(stringifyRanges(data_range_1)).toBe(
      "(-Infinity,1](23,45)[67,89][100,Infinity)"
    );
  });
  it("should construct correctly", () => {
    expect(new RangeSet("(23, 45)[67,89 ]").ranges).toEqual(
      parseRanges("(23, 45)[67,89 ]")
    );
    expect(new RangeSet(data_range_1).ranges).toBe(data_range_1);
    expect(() => new RangeSet({} as any)).toThrowError();
  });
  it("should operate union correctly.", () => {
    let x = new RangeSet("[10,30][50,100]"),
      y = new RangeSet("[20,40][110,120]");
    expect(x.union(y).ranges).toEqual(parseRanges("[10,40][50,100][110,120]"));

    x = new RangeSet("(20,30][50,100]");
    y = new RangeSet("[20,40][110,120]");
    expect(x.union(y).ranges).toEqual(parseRanges("[20,40][50,100][110,120]"));

    x = new RangeSet("(-Infinity,30][50,100]");
    y = new RangeSet("[20,40][110,120]");
    expect(x.union(y).ranges).toEqual(
      parseRanges("(-Infinity,40][50,100][110,120]")
    );

    x = new RangeSet("(20,30][50,infinity)");
    y = new RangeSet("[20,40][110,120]");
    expect(x.union(y).ranges).toEqual(parseRanges("[20,40][50,infinity)"));

    x = new RangeSet("(20,30][50,60][70,80]");
    y = new RangeSet("[20,40][110,120]");
    expect(x.union(y).ranges).toEqual(
      parseRanges("[20,40][50,60][70,80][110,120]")
    );

    x = new RangeSet("[20,20]");
    y = new RangeSet("[30,30]");
    expect(x.union(y).ranges).toEqual(parseRanges("[20,20][30,30]"));
  });
  it("should operate intersection correctly.", () => {
    let x = new RangeSet("[10,30][50,100]"),
      y = new RangeSet("[20,40][110,120]");
    expect(x.intersection(y).ranges).toEqual(parseRanges("[20,30]"));
    
    x = new RangeSet("[10,20]");
    y = new RangeSet("[30,40]");
    expect(x.intersection(y).ranges).toEqual(parseRanges(""));
  });
  it("should do customized operation correctly.", () => {
    const x = new RangeSet("[10,20]"),
      y = new RangeSet("[30,40]");
    expect(
      x.operate(
        [
          [false, false],
          [false, true],
        ],
        y
      ).ranges
    ).toEqual(parseRanges("(-infinity,10)(20,30)(40,infinity)"));
  });
  it("should judge subsets correctly", () => {
    expect(
      new RangeSet("[30,40]").isSubsetOf(new RangeSet("[20,40][110,120]"))
    ).toBeTruthy();
    expect(
      new RangeSet("[30,40]").isSubsetOf(new RangeSet("[20,40)[110,120]"))
    ).toBeFalsy();
    expect(
      new RangeSet("(-Infinity,40]").isSubsetOf(
        new RangeSet("(-Infinity,50][110,120]")
      )
    ).toBeTruthy();
    expect(
      new RangeSet("(-Infinity,40]").isSubsetOf(new RangeSet("[0,50][110,120]"))
    ).toBeFalsy();
    expect(
      new RangeSet("[30,40]").isSubsetOf(new RangeSet("[30,40]"))
    ).toBeTruthy();
    expect(
      new RangeSet("[30,40]").isProperSubsetOf(new RangeSet("[30,40]"))
    ).toBeFalsy();
  });
  it("should calc num of ranges correctly", () => {
    expect(new RangeSet("[30,40][50,60]").numOfRanges).toBe(2);
  });
  it("should prettier ranges correctly", () => {
    let x = new RangeSet("[10,30][50,100]");
    expect(x.prettier).toEqual([
      {
        left: {
          equal: true,
          value: 10,
        },
        right: {
          equal: true,
          value: 30,
        },
      },
      {
        left: {
          equal: true,
          value: 50,
        },
        right: {
          equal: true,
          value: 100,
        },
      },
    ]);
  });
  it("should judge whether it is empty correctly", () => {
    expect(new RangeSet("[10,30][50,100]").isEmpty()).toBeFalsy();
    expect(new RangeSet([]).isEmpty()).toBeTruthy();
  });
  it("should judge whether it is valid correctly", () => {
    const x = new RangeSet("[10,30][50,100]");
    x.ranges.push({ value: 2000, equal: true });
    expect(x.isValid()).toBeFalsy();
    expect(new RangeSet("[10,30][50,10]").isValid()).toBeFalsy();
    expect(new RangeSet("[10,30][50,100]").isValid()).toBeTruthy();
    expect(new RangeSet("(-infinity,30][50,100]").isValid()).toBeTruthy();
    expect(new RangeSet("[-infinity,30][50,100]").isValid()).toBeFalsy();
    expect(new RangeSet("[10,30][50,infinity)").isValid()).toBeTruthy();
    expect(new RangeSet("[10,30][50,infinity]").isValid()).toBeFalsy();
  });
  it("should judge whether the two are the same correctly", () => {
    expect(
      new RangeSet("[10,30][50,100]").isSame(new RangeSet("[10,30][50,100]"))
    ).toBeTruthy();
    expect(
      new RangeSet("[10,30][50,100]").isSame(new RangeSet("[10,30][50,200]"))
    ).toBeFalsy();
    const x = new RangeSet("[10,30][50,100]");
    x.ranges.push({ value: 2000, equal: true });
    expect(new RangeSet("[10,30][50,100]").isSame(x)).toBeFalsy();
  });
});

const data_range_1 = [
  {
    value: -Infinity,
    equal: false,
  },
  {
    value: 1,
    equal: true,
  },
  {
    value: 23,
    equal: false,
  },
  {
    value: 45,
    equal: false,
  },
  {
    value: 67,
    equal: true,
  },
  {
    value: 89,
    equal: true,
  },
  {
    value: 100,
    equal: true,
  },
  {
    value: Infinity,
    equal: false,
  },
];
