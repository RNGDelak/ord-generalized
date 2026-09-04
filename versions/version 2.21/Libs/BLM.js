/*
Notation : Bashicu Large Matrix (BLM)
Limit : [[Infinity]]
*/

window.notation = (() => {

  // Global Registration List
  var register = [];

  // Constants
  const Zero = [];
  const Limit = [[Infinity]];

  // Compare matrices
  function matrix_compare(a, b) {
    if (a === Limit && b === Limit) return 0;
    if (a === Limit) return 1;
    if (b === Limit) return -1;
    if (!a.length && !b.length) return 0;
    if (!a.length) return -1;
    if (!b.length) return 1;

    var sa = matrix_display(a, "raw");
    var sb = matrix_display(b, "raw");
    if (sa === sb) return 0;

    if (a.length !== b.length) return a.length < b.length ? -1 : 1;
    var cols = a[0].length;
    if (cols !== b[0].length) return cols < b[0].length ? -1 : 1;

    for (var i = 0; i < a.length; i++) {
      for (var j = 0; j < cols; j++) {
        if (a[i][j] !== b[i][j]) {
          return a[i][j] < b[i][j] ? -1 : 1;
        }
      }
    }
    return 0;
  }

  // Helper to check if matrix is limit / expandable
  function matrix_limit(m) {
    if (!m || !m.length) return false;
    if (m === Limit || (m.length === 1 && m[0][0] === Infinity)) return true;
    var lastCol = m[m.length - 1];
    return lastCol.some(val => val > 0);
  }

  // Matrix Display Formatter
  function matrix_display(m, mode) {
    if (m === Limit || (Array.isArray(m) && m.length === 1 && m[0][0] === Infinity)) return 'Limit';
    if (!m || !m.length) return '0';

    // Standard Parenthesis / Bracket Matrix Notation (No Subscripts)
    var rows = m[0].length;
    var colStrings = [];
    for (var i = 0; i < m.length; i++) {
      colStrings.push("(" + m[i].join(",") + ")");
    }

    if (mode === "raw") {
      return JSON.stringify(m);
    }

    return colStrings.join("");
  }

  // Register Bashicu Large Matrix
  register.push({
    id: 'blm',
    name: 'Bashicu large matrix',
    display: matrix_display,
    able: matrix_limit,
    compare: matrix_compare,
    FS: (() => {
      var data = {};
      var expand = (b, a) => {
        var d3 = b.length - 1, d2 = b[0].length - 1
          , b2 = Array(d3 + 1).fill(0).map(() => Array(d2 + 1).fill(0))
          , c = Array(d2 + 1).fill(0)
          , c2 = Array(d3 + 1).fill(0)
          , c3 = Array(d2 + 1).fill(0)
          , d7 = 0, d8 = 0, d9 = 0, d18 = 0, d19 = 0;

        for (var d4 = 0; d4 <= d2; ++d4) {
          if (0 < b[d3][d4] && !b[d3][d4 + 1]) {
            for (var d5 = 0; d5 <= d3; ++d5) {
              for (var d6 = 0; d6 <= d4; ++d6) {
                if (b[d3 - d5][d6] < b[d3][d6] - c[d6]) {
                  if (d6 < d4) {
                    c[d6] = b[d3][d6] - b[d3 - d5][d6];
                  } else {
                    if (!d7) d8 = d5;
                    ++d9;
                    if (c[d4] + 1 < b[d3][d6] - b[d3 - d5][d6]) ++c[d4];
                    c2[d9] = d5;
                    for (var d10 = 0; d10 <= d4; ++d10) {
                      b2[d3 - d5][d10] = d9;
                    }
                    for (var d11 = 0; d11 <= d4; ++d11) {
                      for (var d12 = d3 - d5 + 1; d12 <= d3; ++d12) {
                        for (var d13 = d12; d13 >= d3 - d5; --d13) {
                          for (var d14 = 0; d14 <= d11; ++d14) {
                            if (b[d13][d14] < b[d12][d14] - c3[d14]) {
                              if (d11 === d14) {
                                if (0 < b2[d13][d11] && !b2[d12][d11]) b2[d12][d11] = d9;
                                d13 = d3 - d5;
                              } else {
                                c3[d14] = b[d12][d14] - b[d13][d14];
                              }
                            } else {
                              d14 = d11;
                            }
                          }
                        }
                        for (var d15 = 0; d15 <= d4; ++d15) {
                          c3[d15] = 0;
                        }
                      }
                    }
                    for (var d16 = 0; d16 <= d8; ++d16) {
                      for (var d17 = 0; d17 <= d2; ++d17) {
                        d18 = 0;
                        if (0 < b2[d3 - d8 + d16][d17]) {
                          if (d17 < d4 + 1) d18 = b[d3 - c2[b2[d3 - d8 + d16][d17]]][d17] - b[d3 - d5][d17];
                        }
                        if (b[d3 - d5 + d16][d17] < b[d3 - d8 + d16][d17] - d18 || (1 < d5 - d7 && 0 < d7)) {
                          d16 = d7; d17 = d2; d19 = 1; d5 = d3; --d9;
                        } else if (b[d3 - d8 + d16][d17] - d18 < b[d3 - d5 + d16][d17]) {
                          d16 = d7; d17 = d2;
                        }
                      }
                    }
                    if (!d19) d7 = d5;
                    else d19 = 0;
                  }
                } else {
                  d6 = d4;
                }
              }
            }
            d4 = d2;
          }
        }
        for (var d20 = 0; d20 <= d2; ++d20) {
          if (0 < b[d3][d20 + 1]) {
            c[d20] = b[d3][d20] - b[d3 - d7][d20];
          } else {
            c[d20] = b[d3][d20] - b[d3 - d7][d20] - 1;
            d20 = d2;
          }
        }
        var result = b.slice(0, d3).map(col => col.slice());
        for (var d21 = 1; d21 <= a * d7; ++d21) {
          if (!result[d3]) result[d3] = [];
          if (!b2[d3]) b2[d3] = [];
          for (var d22 = 0; d22 <= d2; ++d22) {
            if (0 < b2[d3 - d7][d22] && b2[d3 - d7][d22] < d9 + 1) {
              result[d3][d22] = result[d3 - d7][d22] + c[d22];
            } else {
              result[d3][d22] = result[d3 - d7][d22];
            }
            b2[d3][d22] = b2[d3 - d7][d22];
          }
          ++d3;
        }
        if (d2 > 0 && result.every(column => column[d2] === 0)) result = result.map(column => column.slice(0, d2));
        return result;
      };

      return (m, FSterm) => {
        if ('' + m === 'Infinity' || (Array.isArray(m) && m.length === 1 && m[0][0] === Infinity)) {
          return [Array(FSterm + 1).fill(0), Array(FSterm + 1).fill(1)];
        }
        if (!m || m.length === 0) return [];
        var datakey = matrix_display(m, "raw");
        if (!data[datakey]) data[datakey] = [];
        else if (data[datakey][FSterm] !== undefined) return data[datakey][FSterm];
        return data[datakey][FSterm] = expand(m, FSterm);
      };
    })(),
    init: () => ([
      { expr: [[Infinity]], low: [[]], subitems: [] },
      { expr: [], low: [[]], subitems: [] }
    ]),
    semiable: m => m && m.length > 0
  });

  const blmSystem = register[0];

  // Milestone Aliases
  const Aliases = [
    ["0", Zero],
    ["(0,0)", [[0, 0]]],
    ["(0,0)(1,1)", [[0, 0], [1, 1]]],
    ["Limit", Limit]
  ];

  function fs(ord, n) {
    if (ord === Limit || (Array.isArray(ord) && ord.length === 1 && ord[0][0] === Infinity)) {
      return [Array(n + 1).fill(0), Array(n + 1).fill(1)];
    }
    if (!ord || ord.length === 0) return Zero;
    return blmSystem.FS(ord, n);
  }

  function cmp(a, b) {
    return blmSystem.compare(a, b);
  }

  function isSuccessor(ord) {
    if (!ord || ord.length === 0 || ord === Limit) return false;
    return !blmSystem.able(ord);
  }

  function display(ord, mode) {
    return blmSystem.display(ord, mode);
  }

  function classifyOrdinal(ord) {
    if (ord === Limit) return "#ffffff";
    if (!ord || ord.length === 0) return "#808080";
    if (isSuccessor(ord)) return "#a00000";
    return "#ffA000";
  }

  function parse(str) {
    str = String(str).trim();
    if (str === "" || str === "0") return Zero;
    if (str.toLowerCase() === "limit") return Limit;

    for (const [aliasName, aliasVal] of Aliases) {
      if (str === aliasName) return aliasVal;
    }

    if (str.startsWith("path:")) {
      const numbers = str.replace("path:", "").split(",").map(Number);
      let current = Limit;
      for (let i = 0; i < numbers.length; i++) {
        if (!blmSystem.able(current)) break;
        current = fs(current, numbers[i]);
      }
      return current;
    }

    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}

    return Zero;
  }

  const DisplayName = ["raw", "matrix"];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Matrix", "#a00000"],
    ["Limit Matrix", "#ffA000"]
  ];

  const config = { modes: [{ mode: 1, target: "both" }] };
  const title = "Bashicu Large Matrix Transfinite System";

  return {
    register,
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
