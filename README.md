# Set of ranges

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/unicodergroup/set-of-ranges/Node.js%20CI?label=CI)[![codecov](https://codecov.io/gh/UniCoderGroup/set-of-ranges/branch/main/graph/badge.svg?token=AYNTXWT16R)](https://codecov.io/gh/UniCoderGroup/set-of-ranges)

## Install

```sh
npm i set-of-ranges
```

## Usage

1. import

   ```typescript
   import { RangeSet } from "set-of-ranges";
   ```

2. construct

   ```typescript
   let rs = new RangeSet("(10,20][40,infinity)");
   //or
   let ranges = [
     {
       value: 1,
       equal: true,
     },
     {
       value: 2,
       equal: false,
     },
   ]; // or = parseRanges("[1,2)");
   let rs = new RangeSet(ranges);
   ```

   > If construct with a string, it will use parseRanges to parse the string to Ranges.

   > When use `parseRanges`, spaces and lower/uppercases are ignored.
   > When input is not allowed, it throws an error.

3. operate

   ```typescript
   import { parseRanges, RangeSet, stringifyRanges } from "set-of-ranges";
   let rs1: RangeSet, rs2: RangeSet, rs3: RangeSet;
   rs1.union(rs2); // ============= rs1 = operate(truthTable_union, rs1, rs2);
   rs1.intersection(rs2); // ====== rs1 = operate(truthTable_intersection, rs1, rs2);

   // You can also do operation to more than 2 ranges.
   rs1.union(rs2, rs3); // ========== rs1 = operate(truthTable_union, rs1, operate(truthTable_union, rs4, rs3));

   // You can use a customized truth table, too.
   rs1.operate(
     [
       [false, false],
       [false, true],
     ],
     rs2
   );
   ```

   > **TruthTable**
   >
   > Copied from sourcecode.
   >
   > ```typescript
   > export type OperateTruthTable = [
   >   //          R:true    R:false
   >   /*L:true */ [boolean, boolean],
   >   /*L:flase*/ [boolean, boolean]
   > ];
   > ```

4. output

   ```typescript
   import { RangeSet, stringifyRanges } from "set-of-ranges";
   let rs1 = new RangeSet("(10  ,20][ 40,infinity )");
   console.log(stringifyRanges(rs1)); //=> "(10,20][40,infinity)"
   ```

## Authors

[**\_Kerman**](https://kermanx.github.io/) @ [_UniCoderGroup_](https://unicodergroup.github.io/)

## License

MIT License
