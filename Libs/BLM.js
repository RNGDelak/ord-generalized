/*
Notation : Bashicu Hyper Matrix (BHM) & Bashicu Large Matrix (BLM)
Limit : [[Infinity]]
*/

window.notation = (() => {

  // Global Registration List for Notation Engine
  var register = [];

  // Required Constants
  const Zero = [];
  const Limit = [[Infinity]];

  // Matrix Comparison Logic
  function matrix_compare(m1, m2) {
    if (m1 === Limit && m2 === Limit) return 0;
    if (m1 === Limit) return 1;
    if (m2 === Limit) return -1;
    if (m1.length === 0 && m2.length === 0) return 0;
    if (m1.length === 0) return -1;
    if (m2.length === 0) return 1;

    var len = Math.min(m1.length, m2.length);
    for (var i = 0; i < len; i++) {
      var col1 = m1[i];
      var col2 = m2[i];
      var rlen = Math.max(col1.length, col2.length);
      for (var j = 0; j < rlen; j++) {
        var v1 = col1[j] !== undefined ? col1[j] : 0;
        var v2 = col2[j] !== undefined ? col2[j] : 0;
        if (v1 < v2) return -1;
        if (v1 > v2) return 1;
      }
    }
    if (m1.length < m2.length) return -1;
    if (m1.length > m2.length) return 1;
    return 0;
  }

  // Matrix Limit Ability Check
  function matrix_limit(m) {
    if (m === Limit || (Array.isArray(m) && m.length === 1 && m[0][0] === Infinity)) return true;
    if (!Array.isArray(m) || m.length === 0) return false;
    var lastCol = m[m.length - 1];
    return lastCol.some(val => val > 0);
  }

  // Matrix Display Formatter (Standard Matrix Notation without Subscripts)
  function matrix_display(m, mode) {
    if (m === Limit || (Array.isArray(m) && m.length === 1 && m[0][0] === Infinity)) return 'Limit';
    if (!Array.isArray(m) || m.length === 0) return '()';

    if (mode === "raw") {
      return JSON.stringify(m);
    }

    var cols = m.map(col => '(' + col.join(',') + ')');
    return cols.join('');
  }

  // Register 1: Bashicu Hyper Matrix (BHM)
  register.push({
    id: 'bhm',
    name: 'Bashicu hyper matrix',
    display: matrix_display,
    able: matrix_limit,
    compare: matrix_compare,
    FS: (() => {
      var data = {};
      var expand = (m, FSterm) => {
        var parent = (x, y) => {
          var str = x + ',' + y;
          if (parent_cache[str] !== undefined) return parent_cache[str];
          for (var p = x; (p = y ? parent(p, y - 1) : p - 1) >= 0;) {
            if (m[p][y] < m[x][y]) break;
          }
          return parent_cache[str] = p;
        };

        var ascending = (r, x, y) => {
          var str = r + ',' + x + ',' + y;
          if (ascending_cache[str] !== undefined) return ascending_cache[str];
          return ascending_cache[str] = r <= x && (roots.includes(x) || ascending(r, parent(x, y), y));
        };

        var delta = r => m[r].map((value, y) => y < LNZ ? child[y] - value : 0);

        var expansion = (r, n) => {
          var a, x, ss = m.slice(0, endcol);
          var delr = delta(r);
          for (a = 1; a <= n; ++a) {
            for (x = r; x < endcol; ++x) {
              ss.push(ss[x].map((value, y) => value + a * delr[y] * ascending(r, x, y)));
            }
          }
          return ss;
        };

        var expansionappend = r => {
          var delr = delta(r);
          var res = expansion(r, 1);
          res.push(m[endcol].map((value, y) => value + delr[y] * ascending(r, endcol, y)));
          return res;
        };

        var endcol = m.length - 1;
        var result = m.slice(0, endcol);
        var child = m[endcol];
        var ymax = child.length - 1;
        var LNZ;

        for (LNZ = ymax; LNZ >= 0; --LNZ) {
          if (child[LNZ] > 0) break;
        }

        if (LNZ < 0) return result;

        var parent_cache = {}, ascending_cache = {};
        var specialroot = parent(parent(endcol, LNZ), LNZ);
        var roots = [], n;

        for (n = endcol; (n = LNZ ? parent(n, LNZ - 1) : n - 1) > specialroot;) {
          if (parent(n, LNZ) === specialroot) roots.push(n);
        }

        var threshould = expansionappend(roots[0]);
        n = roots.findIndex(r => matrix_compare(expansionappend(r), threshould) < 0);
        if (n === -1) n = roots.length;

        result = expansion(roots[n - 1], FSterm);

        if (ymax > 0 && result.every(column => column[ymax] === 0)) {
          result = result.map(column => column.slice(0, ymax));
        }

        return result;
      };

      return (m, FSterm) => {
        if ('' + m === 'Infinity' || (Array.isArray(m) && m.length === 1 && m[0][0] === Infinity)) {
          return [Array(FSterm + 1).fill(0), Array(FSterm + 1).fill(1)];
        }
        if (m.length === 0) return [];
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
    semiable: m => m.length > 0
  });

  // Register 2: Bashicu Large Matrix (BLM)
  register.push({
    id: 'blm',
    name: 'Bashicu large matrix',
    display: matrix_display,
    able: matrix_limit,
    compare: matrix_compare,
    FS: (() => {
      var data = {};
      var expand = (b, a) => {
        var d3 = b.length - 1, d2 = b[0].length - 1,
            b2 = Array(d3 + 1).fill(Array(d2 + 1).fill(0)),
            c = Array(d2 + 1).fill(0),
            c2 = Array(d3 + 1).fill(0),
            c3 = Array(d2 + 1).fill(0),
            d7 = 0, d8 = 0, d9 = 0, d18 = 0, d19 = 0;

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
        if ('' + m === 'Infinity') return [Array(FSterm + 1).fill(0), Array(FSterm + 1).fill(1)];
        if (m.length === 0) return [];
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
    semiable: m => m.length > 0
  });

  // System Milestone Aliases
  const Aliases = [
    ["()", []],
    ["(0)", [[0]]],
    ["(0)(0)", [[0], [0]]],
    ["(0)(1)", [[0], [1]]],
    ["(0,0)", [[0, 0]]],
    ["(0,0)(1,1)", [[0, 0], [1, 1]]],
    ["Limit", Limit]
  ];

  const activeSystem = register[0];

  function fs(ord, n) {
    if (ord === Limit || (Array.isArray(ord) && ord.length === 1 && ord[0][0] === Infinity)) {
      return [Array(n + 1).fill(0), Array(n + 1).fill(1)];
    }
    if (!Array.isArray(ord) || ord.length === 0) return [];
    return activeSystem.FS(ord, n);
  }

  function cmp(a, b) {
    return activeSystem.compare(a, b);
  }

  function isSuccessor(ord) {
    if (ord === Limit || !Array.isArray(ord) || ord.length === 0) return false;
    return !activeSystem.able(ord);
  }

  function display(ord, mode) {
    return activeSystem.display(ord, mode);
  }

  function classifyOrdinal(ord) {
    if (ord === Limit) return "#ffffff";
    if (!Array.isArray(ord) || ord.length === 0) return "#808080";
    if (isSuccessor(ord)) return "#d40000";
    if (activeSystem.able(ord)) return "#ffd000";
    return "#ff8000";
  }

  function parse(str) {
    str = String(str).trim();
    if (str === "" || str === "()" || str === "0") return Zero;
    if (str.toLowerCase() === "limit") return Limit;

    for (const [aliasName, aliasVal] of Aliases) {
      if (str === aliasName) return aliasVal;
    }

    if (str.startsWith("path:")) {
      const numbers = str.replace("path:", "").split(",").map(Number);
      let current = Limit;
      for (let i = 0; i < numbers.length; i++) {
        if (isSuccessor(current)) break;
        current = fs(current, numbers[i]);
      }
      return current;
    }

    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {}

    return Zero;
  }

  const DisplayName = ["raw", "pretty"];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Matrix", "#d40000"],
    ["Limit Matrix", "#ffd000"]
  ];

  const config = { modes: [{ mode: 1, target: "both" }] };
  const title = "Bashicu Large Matrix Transfinite Number Line";

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
