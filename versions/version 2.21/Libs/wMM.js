/*
Notation : Weak Mutant Matrix System
Limit : FOS(0,1,w,e0,e1)
*/

window.notation = (() => {

  // Required Constants
  const Zero = [];
  const Limit = "Limit";

  // Cache for vertical sequence calculations
  const vertical_cache = new Map();

  const extract = (A, [x, y]) => (A[x] && A[x][y] !== undefined ? A[x][y] : 0);

  const vertical_compare = (a, b) => {
    if (a.length > b.length) return 1;
    if (a.length < b.length) return -1;
    for (let i = a.length; i--;) {
      if (a[i] > b[i]) return 1;
      if (a[i] < b[i]) return -1;
    }
    return 0;
  };

  const vertical_increase = (y, d) => {
    const c = y.slice();
    c[d] === undefined ? (c[d] = 1) : (c[d] += 1);
    c.fill(0, 0, d);
    return c;
  };

  const get_vertical = (A, [x, y]) => {
    let val;
    if (vertical_cache.has(A)) {
      val = vertical_cache.get(A);
    } else {
      val = A.map((column, xIdx) => {
        const result = [];
        for (let yIdx = 0; yIdx < column.length; ++yIdx) {
          let i = yIdx;
          while (--i >= 0 && extract(A, [xIdx, yIdx]) === extract(A, [xIdx, i]));
          result.push(vertical_increase(result[i] ?? [], yIdx - i - 1));
        }
        return result;
      });
      vertical_cache.set(A, val);
    }

    if (val[x] && val[x][y] !== undefined) return val[x][y];
    const ending = val[x] ? val[x].length - 1 : -1;
    return vertical_increase(ending >= 0 ? val[x][ending] : [], y - ending - 1);
  };

  const parentCheck = (A, [x, y]) => {
    if (!y) return [x - 1, y];
    const p = parent(A, [x, y - 1])[0];
    let i = Math.max(y, A[p] ? A[p].length - 1 : 0);
    while (
      extract(A, [p, i]) < extract(A, [x, y]) - 1 ||
      vertical_compare(get_vertical(A, [p, i]), get_vertical(A, [x, y])) > 0
    ) {
      --i;
    }
    return [p, i];
  };

  const parent = (A, cur) => {
    if (!extract(A, cur)) return [-1, cur[1]];
    let p = cur;
    do {
      p = parentCheck(A, p);
    } while (extract(A, p) !== extract(A, cur) - 1);
    return p;
  };

  // Matrix expansion logic
  function expand(M, FSterm) {
    if (!Array.isArray(M) || M.length === 0) return [];

    let LNZx = M.length - 1;
    let LNZy = -1;
    if (M[LNZx]) {
      for (let i = M[LNZx].length - 1; i >= 0; i--) {
        if (M[LNZx][i]) {
          LNZy = i;
          break;
        }
      }
    }

    if (LNZy === -1) {
      // Find last non-zero column
      while (LNZx >= 0 && (!M[LNZx] || M[LNZx].every(e => !e))) {
        LNZx--;
      }
      if (LNZx < 0) return [];
      for (let i = M[LNZx].length - 1; i >= 0; i--) {
        if (M[LNZx][i]) {
          LNZy = i;
          break;
        }
      }
    }

    if (LNZx < 0 || LNZy < 0) return [];

    const LNZ = M[LNZx][LNZy];
    const collection = [];
    let working = [LNZx, LNZy];

    do {
      while (extract(M, working) !== LNZ - 1) {
        working = parent(M, working);
      }
      if (!collection[working[0]]) collection[working[0]] = [];
      collection[working[0]].unshift(working[1]);
    } while (--working[1] >= 0);

    const counts = collection.filter(() => true).map((e) => e.length);
    const columns = collection.map((e, i) => i).filter(() => true);
    counts.unshift(1);

    let root;
    const r = counts.length - 1;

    if (counts[r] === 1) {
      root = parent(M, [LNZx, LNZy]);
    } else {
      const lastValidColumnIndex = columns[columns.length - 1];
      root = [lastValidColumnIndex, collection[lastValidColumnIndex][0]];
    }

    const width = LNZx - root[0];
    const height = LNZy - root[1];
    const A = M.map((column) => column.slice());

    --A[LNZx][LNZy];

    if (M[root[0]]) {
      M[root[0]].slice(root[1]).forEach((val, dy) => {
        if (!A[LNZx]) A[LNZx] = [];
        A[LNZx][LNZy + dy] = val;
      });
    }

    const ascending_cache = {};

    const ascendingAt = (cur) => {
      const str = '' + cur;
      if (ascending_cache[str] !== undefined) return ascending_cache[str];
      if (cur[0] < root[0]) return (ascending_cache[str] = -1);
      if (cur[0] === root[0]) return (ascending_cache[str] = cur[1]);
      return (ascending_cache[str] = ascendingAt(parent(A, cur)));
    };

    for (let n = 1; n <= FSterm; ++n) {
      const reference = [];
      let y1 = 0;
      let y2 = 0;
      let cmp;

      while (y2 <= root[1] + height * n) {
        cmp = vertical_compare(
          get_vertical(A, [root[0], y1 + 1]),
          get_vertical(A, [root[0] + width * n, y2])
        );
        if (cmp > 0 || y1 >= root[1]) {
          reference[y1] = y2;
          ++y2;
          continue;
        } else {
          ++y1;
          continue;
        }
      }

      for (let dx = 1; dx <= width; ++dx) {
        const x = root[0] + dx;
        const targetColumn = (A[x + width * n] = []);
        let lastmagma = -1;

        if (A[x]) {
          A[x].forEach((val, y) => {
            const asc = ascendingAt([x, y]);
            if (~asc) {
              if (
                asc <= root[1] &&
                !vertical_compare(
                  get_vertical(A, [root[0], asc]),
                  get_vertical(A, [x, y])
                )
              ) {
                for (
                  let j = (reference[asc - 1] ?? -1) + 1;
                  j <= reference[asc];
                  ++j
                ) {
                  targetColumn.push(
                    val -
                      extract(A, [root[0], asc]) +
                      extract(A, [root[0] + width * n, j])
                  );
                }
                lastmagma = asc;
              } else {
                if (~lastmagma) {
                  targetColumn.push(
                    val -
                      extract(A, [root[0], lastmagma]) +
                      extract(A, [
                        root[0] + width * n,
                        reference[lastmagma]
                      ])
                  );
                } else {
                  targetColumn.push(
                    val -
                      extract(A, [root[0], 0]) +
                      extract(A, [root[0] + width * n, 0])
                  );
                }
              }
            } else {
              targetColumn.push(val);
            }
          });
        }
      }

      vertical_cache.delete(A);
    }

    A.forEach((column) => {
      if (Array.isArray(column)) {
        let i = -1;
        for (let idx = column.length - 1; idx >= 0; idx--) {
          if (column[idx]) {
            i = idx;
            break;
          }
        }
        column.splice(i + 1);
      }
    });

    return A;
  }

  // Milestones
  const Aliases = [
    ["0", Zero],
    ["1", [[0]]],
    ["ω", [[0], [1]]],
  ];

  // Dynamic limit sequence generator for FOS(0,1,w,e0,e1)
  function getLimit(num) {
    const res = [[0]];
    const secondCol = [];
    for (let i = 0; i < num + 1; i++) {
      secondCol.push(1);
    }
    res.push(secondCol);
    return res;
  }

  // Fundamental Sequence
  function fs(ord, n) {
    if (ord === Limit) return getLimit(n);
    if (!Array.isArray(ord) || ord.length === 0) return [];
    const expanded = expand(ord, n);
    // Slice off the last column if it is trailing zeros or empty
    if (expanded.length > 0) {
      return expanded.slice(0, -1);
    }
    return expanded;
  }

  // Rank comparison for ordinal ordering
  function cmp(a, b) {
    if (a === Limit && b === Limit) return 0;
    if (a === Limit) return 1;
    if (b === Limit) return -1;

    const strA = JSON.stringify(a);
    const strB = JSON.stringify(b);
    if (strA === strB) return 0;

    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) {
      const colA = a[i] || [];
      const colB = b[i] || [];
      const innerMin = Math.min(colA.length, colB.length);
      for (let j = 0; j < innerMin; j++) {
        if (colA[j] !== colB[j]) {
          return colA[j] < colB[j] ? -1 : 1;
        }
      }
      if (colA.length !== colB.length) {
        return colA.length < colB.length ? -1 : 1;
      }
    }
    return a.length < b.length ? -1 : 1;
  }

  // Check if matrix is a successor ordinal
  function isSuccessor(ord) {
    if (ord === Limit || !Array.isArray(ord) || ord.length === 0) return false;
    const lastCol = ord[ord.length - 1];
    if (!lastCol || lastCol.length === 0) return false;
    return lastCol[lastCol.length - 1] === 0;
  }

  // Format matrix to readable column string format e.g. (0)(1,1)
  function pretty(ord) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";

    return ord.map((col) => `(${col.join(",")})`).join("");
  }

  // Display modes handler
  function display(ord, mode) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";
    if (mode === "raw") {
      return JSON.stringify(ord);
    }
    if (mode === "pretty") {
      return pretty(ord);
    }
  }

  // Classify ordinals for visual styling
  function classifyOrdinal(ord) {
    if (ord === Limit) return "#ffffff";
    if (!Array.isArray(ord) || ord.length === 0) return "#808080";
    if (isSuccessor(ord)) return "#d40000";
    if (ord.length === 1) return "#ffd000";
    return "#ff8000";
  }

  // Parser supporting alias lookup, raw JSON arrays, column string, and address sequences
  function parse(str) {
    str = String(str).trim();
    if (str === "" || str === "0") return Zero;
    if (str.toLowerCase() === "limit" || str.includes("FOS(")) return Limit;

    // 1. Alias lookup
    for (const [aliasName, aliasVal] of Aliases) {
      if (str === aliasName) return aliasVal;
    }

    // 2. Fundamental Sequence address path: e.g. "path: 2,6,2,8,1"
    if (str.startsWith("path:")) {
      const numbers = str.replace("path:", "").split(",").map(Number);
      let current = Limit;
      for (let i = 0; i < numbers.length; i++) {
        if (isSuccessor(current)) break;
        current = fs(current, numbers[i]);
      }
      return current;
    }

    // 3. Bracket column format e.g. "(0)(1,1)"
    if (str.startsWith("(")) {
      const matches = str.match(/\((.*?)\)/g);
      if (matches) {
        return matches.map((m) => {
          const inner = m.slice(1, -1).trim();
          if (inner === "") return [];
          return inner.split(",").map(Number);
        });
      }
    }

    // 4. Raw JSON array parsing
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // Fallback
    }

    return Zero;
  }

  const DisplayName = ["raw", "pretty"];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#d40000"],
    ["Limit Ordinal", "#ff8000"],
    ["Principal Ordinal", "#ffd000"]
  ];

  const config = { modes: [{ mode: 1, target: "both" }],MaxIntervalDepth:1,MaxIntervalsDivision:0 };
  const title = "Weak Mutant Matrix Transfinite Number Line";

  return {
    fs,
    cmp,
    isSuccessor,
    display,
    classifyOrdinal,
    parse,
    Zero,
    Limit,
    DisplayName,
    ordinalTypes,
    Aliases,
    config,
    title
  };

})();
