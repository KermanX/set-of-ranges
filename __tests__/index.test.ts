import { RangeSet } from "../dist/index.js";

describe("Test set of range", () => {
  it("should operate union correctly.", () => {
    let x = new RangeSet([10, 30, 50, 100]),
      y = new RangeSet([20, 40, 110, 120]);
    expect(x.union(x, y).ranges).toEqual([10, 40, 50, 100, 110, 120]);
  });
  it("should operate intersection correctly.", () => {
    let x = new RangeSet([10, 30, 50, 100]),
      y = new RangeSet([20, 40, 110, 120]);
    expect(x.intersection(x, y).ranges).toEqual([20, 30]);
  });
  it("should prettier ranges correctly", () => {
    let x = new RangeSet([10, 30, 50, 100]);
    expect(x.prettier).toEqual([
      [10, 30],
      [50, 100],
    ]);
  });
});
