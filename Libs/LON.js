/*
Notation : Lifting Omega Notation (LON) / Lifting M-Notation
Limit : ψ_Infinity
*/

window.notation = (() => {

  // Global Registration List for Notation Engine
  var register = [];

  // Required Constants
  const Zero = 0;
  const Limit = [true, Infinity];

  // Helper Functions for Data Manipulation
  const Copy = x => typeof x === 'number' ? x : [x[0]].concat(x.slice(1).map(Copy));

  const LMN_compare = (x, y) => {
    if (x === 0) return y === 0 ? 0 : -1;
    if (y === 0) return 1;
    if (x[0]) {
      if (y[0]) {
        if (x[1] < y[1]) return -1;
        if (x[1] > y[1]) return 1;
        return LMN_compare(x[2], y[2]);
      } else {
        return LMN_compare(x, y[1]) <= 0 ? -1 : 1;
      }
    } else {
      if (y[0]) {
        return LMN_compare(x[1], y) < 0 ? -1 : 1;
      } else {
        var cmp = LMN_compare(x[1], y[1]);
        if (cmp) return cmp;
        return LMN_compare(x[2], y[2]);
      }
    }
  };

  const LMN_islimit = x => {
    if (x === 0 || x === Zero) return false;
    if (x === Limit || (Array.isArray(x) && x[0] === true && x[1] === Infinity)) return true;
    if (Array.isArray(x) && x[0] === true && '' + x[2] === '' + [true, 0, 0]) return false; // Successor check
    return true;
  };

  // Unicode subscript mapping
  const subscriptDigits = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  function toSubscript(num) {
    return String(num).split('').map(d => subscriptDigits[d] || d).join('');
  }

  // Formatting helpers
  function LMN_display(x, mode) {
    if (x === Limit || (Array.isArray(x) && x[0] === true && x[1] === Infinity)) return 'Limit';
    if (x === 0 || x === Zero) return '0';

    if (mode === "raw") {
      return JSON.stringify(x);
    }

    if (mode === "pretty") {
      if (x[0]) {
        return `ψ_${x[1]}(${LMN_display(x[2], mode)})`;
      } else {
        var list = [];
        var curr = x;
        while (curr && !curr[0]) {
          list.push(LMN_display(curr[1], mode));
          curr = curr[2];
        }
        if (curr) list.push(LMN_display(curr, mode));
        return list.join(' + ');
      }
    }

    // Default & Subscript Mode ("subscript")
    if (x[0]) {
      return `ψ${toSubscript(x[1])}(${LMN_display(x[2], "subscript")})`;
    } else {
      var listSub = [];
      var currSub = x;
      while (currSub && !currSub[0]) {
        listSub.push(LMN_display(currSub[1], "subscript"));
        currSub = currSub[2];
      }
      if (currSub) listSub.push(LMN_display(currSub, "subscript"));
      return listSub.join(' + ');
    }
  }

  // Register Lifting Omega Notation
  register.push({
    id: 'lon',
    name: 'lifting Omega notation',
    display: LMN_display,
    able: LMN_islimit,
    compare: LMN_compare,
    FS: (() => {
      var data = {}
        , maxsummand = x => {
          if (!x || x[0]) return x;
          var x1 = maxsummand(x[1])
            , x2 = maxsummand(x[2]);
          if (LMN_compare(x1, x2) < 0) return x2;
          else return x1;
        }
        , cut0 = x => x ? (x[0] ? [true, x[1], cut0(x[2])] : (x[2] ? (LMN_compare(x[1], maxsummand(x[2])) < 0 ? cut0(x[2]) : [false, cut0(x[1]), cut0(x[2])]) : cut0(x[1]))) : 0
        , L = x0 => {
          var x = x0
            , lx = [];
          while (x) {
            if (x[0]) {
              lx.push(x);
              if ((x = x[2]) === 0) break;
            } else {
              x = x[2];
            }
          }
          return lx;
        }
        , change = (x, y) => {
          var x1 = Copy(x)
            , lx = L(x1)
            , n = lx.length - 1;
          if (lx[n] === x1) return y;
          var prev = n ? lx[n - 1] : x1;
          while (prev[2] !== lx[n]) prev = prev[2];
          prev[2] = y;
          return x1;
        }
        , it = (x, n) => n ? change(x, it(x, n - 1)) : 0
        , termtier = x => {
          for (var n = 0; LMN_compare(x, [true, n + 1, 0]) >= 0; ++n);
          return n;
        }
        , inner = x => {
          var n = termtier(x)
            , Lx = L(x)
            , m = Lx.slice(1).findIndex(xj => termtier(xj) === n);
          if (m === -1) return 0;
          var A = Lx[m][2];
          while (!A[0]) {
            if (termtier(A) === n) return A;
            A = A[2];
          }
          return A[1] === n ? A : 0;
        }
        , iscritical = x => {
          var n = termtier(x)
            , lx = L(x);
          return lx.findIndex((xi, i) =>
            LMN_compare(x, xi) < 0
            && termtier(xi) === n
            && lx.slice(i + 1).every(xj => LMN_compare(xj, [true, n + 1, 0]) >= 0)
            && lx.slice(0, i).every(xj => LMN_compare(xj, [true, n, 0]) >= 0)
          ) >= 0;
        }
        , subtract = (c, b) => {
          if (b === 0) return c;
          if (c === 0) return 0;
          var b1 = b[0] ? b : b[1]
            , c1 = c[0] ? c : c[1]
            , cmp = LMN_compare(b1, c1);
          if (cmp < 0) return c;
          if (cmp > 0) return 0;
          return subtract(c[0] ? 0 : c[2], b[0] ? 0 : b[2]);
        }
        , lift = (x, a, s) => {
          if (x === 0 || (x[0] && LMN_compare(x, a) < 0)) return x;
          if (!x[0]) return [false].concat(x.slice(1).map(xi => lift(xi, a, s)));
          if (a[1] < x[1]) return [true, x[1] - a[1] + s[1], lift(x[2], a, s)];
          return [true, s[1], cut0([false, s[2], lift(subtract(x[2], a[2]), a, s)])];
        }
        , isone = x => '' + x === '' + [true, 0, 0]
        , LON_FS = (x, FSterm) => {
          var i, res, x2, xn1, prev;
          if ('' + x === 'true,Infinity') {
            res = 0;
            for (i = FSterm; i >= 0; --i) res = [true, i, res];
            return [true, 0, res];
          }
          if (x === 0) return 0;
          if (!x[0]) {
            x2 = x[2];
            if (isone(x2)) return x[1];
            else return cut0(x.slice(0, 2).concat([LON_FS(x2, FSterm)]));
          }
          x2 = Copy(x);
          var lx = L(x2)
            , xn = lx[lx.length - 1];
          if (isone(xn)) {
            xn1 = lx[lx.length - 2];
            if (xn1[2] === xn) xn1[2] = 0;
            else {
              prev = xn1;
              while (prev[2][2] !== xn) prev = prev[2];
              prev[2] = prev[2][1];
            }
            if (x2 === xn1) {
              res = 0;
              for (i = FSterm; i--;) res = [false, Copy(xn1), res];
              return cut0(res);
            } else {
              prev = lx.length === 2 ? x2 : lx[lx.length - 3];
              while (prev[2] !== xn1) prev = prev[2];
              prev[2] = 0;
              for (i = FSterm; i--;) prev[2] = [false, Copy(xn1), prev[2]];
              return cut0(x2);
            }
          }
          var j = xn[1]
            , lxr = lx.slice()
            , xk = lxr.reverse().find(xz => termtier(xz) === j - 1);
          if (LMN_compare(xk, [true, j - 1, [true, j, 0]]) > 0) {
            return cut0(change(x2, it(xk, FSterm)));
          }
          var xi = lxr.find(iscritical)
            , s = termtier(xi);
          if (s === j - 1) {
            return cut0(change(x2, it(inner(xi), FSterm)));
          }
          var xj = lxr.find(xz => termtier(xz) === s);
          return LON_FS(cut0(change(x2, lift(inner(xi), xj, xk))), FSterm);
        };

      return (x, FSterm) => {
        var datakey = '' + x;
        if (!data[datakey]) data[datakey] = [];
        else if (data[datakey][FSterm] !== undefined) return data[datakey][FSterm];
        return data[datakey][FSterm] = LON_FS(x, FSterm);
      };
    })()
    , init: () => ([
      { expr: [true, Infinity], low: [[true, 0, 0]], subitems: [] },
      { expr: [true, 0, 0], low: [0], subitems: [] },
      { expr: 0, low: [0], subitems: [] }
    ])
  });

  // System Milestone Aliases
  const Aliases = [
    ["0", Zero],
    ["1", [true, 0, 0]],
    ["ω", [true, 0, [true, 0, 0]]],
    ["ψ₀(ψ₀(0))", [true, 0, [true, 0, 0]]],
    ["ψ₀(ψ₁(0))", [true, 0, [true, 1, 0]]],
    ["ψ₁(0)", [true, 1, 0]],
    ["ψ₁(ψ₀(0))", [true, 1, [true, 0, 0]]],
    ["ψ₁(ψ₁(0))", [true, 1, [true, 1, 0]]],
    ["ψ₂(0)", [true, 2, 0]],
    ["Limit", Limit]
  ];

  const lonSystem = register[0];

  function fs(ord, n) {
    if (ord === Limit || (Array.isArray(ord) && ord[0] === true && ord[1] === Infinity)) {
      var res = 0;
      for (var i = n; i >= 0; --i) res = [true, i, res];
      return [true, 0, res];
    }
    if (ord === 0 || ord === Zero) return Zero;
    return lonSystem.FS(ord, n);
  }

  function cmp(a, b) {
    if (a === Limit && b === Limit) return 0;
    if (a === Limit) return 1;
    if (b === Limit) return -1;
    return lonSystem.compare(a, b);
  }

  function isSuccessor(ord) {
    if (ord === Limit || ord === Zero) return false;
    return !lonSystem.able(ord);
  }

  function display(ord, mode) {
    return lonSystem.display(ord, mode);
  }

  function classifyOrdinal(ord) {
    if (ord === Limit) return "#ffffff";
    if (ord === Zero || ord === 0) return "#808080";
    if (isSuccessor(ord)) return "#d40000";
    if (Array.isArray(ord) && ord[0]) return "#ffd000";
    return "#ff8000";
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
        if (isSuccessor(current)) break;
        current = fs(current, numbers[i]);
      }
      return current;
    }

    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed) || typeof parsed === "number") {
        return parsed;
      }
    } catch (e) {}

    return Zero;
  }

  const DisplayName = ["raw", "pretty", "subscript"];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#d40000"],
    ["Limit Ordinal", "#ff8000"],
    ["Principal Ordinal", "#ffd000"]
  ];

  // Mode 2 corresponds to "subscript"
  const config = { modes: [{ mode: 2, target: "both" }],MaxIntervalDepth:1 };
  const title = "Lifting Omega Notation Transfinite Number Line";

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
