/*
Notation : Bashicu Sudden Matrix (BSM)
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

  // Matrix Display Formatter (No Subscript Transformation)
  function matrix_display(m, mode) {
    if (m === Limit || (Array.isArray(m) && m.length === 1 && m[0][0] === Infinity)) return 'Limit';
    if (!Array.isArray(m) || m.length === 0) return '()';

    if (mode === "raw") {
      return JSON.stringify(m);
    }

    // Default & "pretty" mode: standard matrix/column notation
    var cols = m.map(col => '(' + col.join(',') + ')');
    return cols.join('');
  }

  // Register Bashicu Sudden Matrix Notation
  register.push({
    id: 'bsm',
    name: 'Bashicu sudden matrix',
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

        var delta = r => m[r].map((value, y) => y < LNZ ? child[y] - value : y === LNZ ? child[y] - value - 1 : 0);

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
        var specialroots = [], roots = [], n;

        for (n = endcol; n >= 0;) {
          specialroots.push(n = parent(n, LNZ));
        }

        for (n = specialroots[0]; n >= 0; n = LNZ ? parent(n, LNZ - 1) : n - 1) {
          if (specialroots.includes(parent(n, LNZ))) roots.push(n);
        }

        var testroot = m[roots[0]].slice(LNZ + 1);
        var threshould = expansionappend(roots[0]);

        n = roots.findIndex(r => specialroots.includes(r) ? m[r].slice(LNZ + 1).some((value, dy) => value !== testroot[dy]) : matrix_compare(expansionappend(r), threshould) < 0);
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

  const bsmSystem = register[0];

  function fs(ord, n) {
    if (ord === Limit || (Array.isArray(ord) && ord.length === 1 && ord[0][0] === Infinity)) {
      return [Array(n + 1).fill(0), Array(n + 1).fill(1)];
    }
    if (!Array.isArray(ord) || ord.length === 0) return [];
    return bsmSystem.FS(ord, n);
  }

  function cmp(a, b) {
    return bsmSystem.compare(a, b);
  }

  function isSuccessor(ord) {
    if (ord === Limit || !Array.isArray(ord) || ord.length === 0) return false;
    return !bsmSystem.able(ord);
  }

  function display(ord, mode) {
    return bsmSystem.display(ord, mode);
  }

  function classifyOrdinal(ord) {
    if (ord === Limit) return "#ffffff";
    if (!Array.isArray(ord) || ord.length === 0) return "#808080";
    if (isSuccessor(ord)) return "#a00000";
    if (bsmSystem.able(ord)) return "#ffff00";
    return "#ffA000";
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

  // Display Modes (No Subscript Mode)
  const DisplayName = ["raw", "pretty"];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#a00000"],
    ["Limit Ordinal", "#ffA000"]
  ];

  // Configured default mode to "pretty"
  const config = { modes: [{ mode: 1, target: "both" }] };
  const title = "Bashicu Sudden Matrix Transfinite Number Line";

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
