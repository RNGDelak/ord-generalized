/*
Notation : Lifting Omega Notation (LON)
Limit : ψ_0(Ω_∞) [or [true, Infinity]]
*/

window.notation = (() => {

  // Required Constants
  const Zero = 0;
  const Limit = [true, Infinity];

  // Utility Functions
  const Copy = (x) => (typeof x === "number" || typeof x === "boolean" ? x : [x[0]].concat(x.slice(1).map(Copy)));

  // Stringify / Pretty Format
  function pretty(x, mode = "pretty") {
    if (x === 0 || x === "0") return "0";
    if (x === Limit || (Array.isArray(x) && x[0] === true && x[1] === Infinity)) return "ψ_0(Ω_∞)";

    if (!Array.isArray(x)) return String(x);

    // Sum term: [false, A1, A2] -> A1 + A2
    if (!x[0]) {
      const left = pretty(x[1], mode);
      const right = pretty(x[2], mode);
      if (right === "0") return left;
      return `${left}+${right}`;
    }

    // Principal term: [true, n, A] -> ψ_n(A)
    const n = x[1];
    const arg = pretty(x[2], mode);

    if (mode === "subscript") {
      return `ψ<sub>${n}</sub>(${arg})`;
    }
    return `ψ_${n}(${arg})`;
  }

  // Comparison Logic
  function LMN_compare(x, y) {
    if (x === y) return 0;
    if (x === 0) return -1;
    if (y === 0) return 1;

    if (x === Limit || (Array.isArray(x) && x[0] === true && x[1] === Infinity)) return 1;
    if (y === Limit || (Array.isArray(y) && y[0] === true && x[1] === Infinity)) return -1;

    // Direct scalar comparison
    if (typeof x === "number" && typeof y === "number") return x - y;

    // Handle Array structures
    const xIsPrinc = Boolean(x[0]);
    const yIsPrinc = Boolean(y[0]);

    if (xIsPrinc && yIsPrinc) {
      if (x[1] !== y[1]) return x[1] - y[1];
      return LMN_compare(x[2], y[2]);
    }

    if (!xIsPrinc && !yIsPrinc) {
      const cmp1 = LMN_compare(x[1], y[1]);
      if (cmp1 !== 0) return cmp1;
      return LMN_compare(x[2], y[2]);
    }

    if (!xIsPrinc && yIsPrinc) {
      const cmp1 = LMN_compare(x[1], y);
      if (cmp1 >= 0) return 1;
      return LMN_compare(x[2], y);
    }

    if (xIsPrinc && !yIsPrinc) {
      const cmp1 = LMN_compare(x, y[1]);
      if (cmp1 !== 0) return cmp1;
      return -1;
    }

    return 0;
  }

  // Helper Methods for Expansion
  const maxsummand = (x) => {
    if (!x || x[0]) return x;
    const x1 = maxsummand(x[1]);
    const x2 = maxsummand(x[2]);
    if (LMN_compare(x1, x2) < 0) return x2;
    return x1;
  };

  const cut0 = (x) =>
    x
      ? x[0]
        ? [true, x[1], cut0(x[2])]
        : x[2]
        ? LMN_compare(x[1], maxsummand(x[2])) < 0
          ? cut0(x[2])
          : [false, cut0(x[1]), cut0(x[2])]
        : cut0(x[1])
      : 0;

  const L = (x0) => {
    let x = x0;
    const lx = [];
    while (x) {
      if (x[0]) {
        lx.push(x);
        if ((x = x[2]) === 0) break;
      } else {
        x = x[2];
      }
    }
    return lx;
  };

  const change = (x, y) => {
    const x1 = Copy(x);
    const lx = L(x1);
    const n = lx.length - 1;
    if (lx[n] === x1) return y;
    let prev = n ? lx[n - 1] : x1;
    while (prev[2] !== lx[n]) prev = prev[2];
    prev[2] = y;
    return x1;
  };

  const it = (x, n) => (n ? change(x, it(x, n - 1)) : 0);

  const termtier = (x) => {
    let n = 0;
    for (; LMN_compare(x, [true, n + 1, 0]) >= 0; ++n);
    return n;
  };

  const inner = (x) => {
    const n = termtier(x);
    const Lx = L(x);
    const m = Lx.slice(1).findIndex((xj) => termtier(xj) === n);
    if (m === -1) return 0;
    let A = Lx[m][2];
    while (!A[0]) {
      if (termtier(A) === n) return A;
      A = A[2];
    }
    return A[1] === n ? A : 0;
  };

  const iscritical = (x) => {
    const n = termtier(x);
    const lx = L(x);
    return (
      lx.findIndex(
        (xi, i) =>
          LMN_compare(x, xi) < 0 &&
          termtier(xi) === n &&
          lx.slice(i + 1).every((xj) => LMN_compare(xj, [true, n + 1, 0]) >= 0) &&
          lx.slice(0, i).every((xj) => LMN_compare(xj, [true, n, 0]) >= 0)
      ) >= 0
    );
  };

  const subtract = (c, b) => {
    if (b === 0) return c;
    if (c === 0) return 0;
    const b1 = b[0] ? b : b[1];
    const c1 = c[0] ? c : c[1];
    const cmp = LMN_compare(b1, c1);
    if (cmp < 0) return c;
    if (cmp > 0) return 0;
    return subtract(c[0] ? 0 : c[2], b[0] ? 0 : b[2]);
  };

  const lift = (x, a, s) => {
    if (x === 0 || (x[0] && LMN_compare(x, a) < 0)) return x;
    if (!x[0]) return [false].concat(x.slice(1).map((xi) => lift(xi, a, s)));
    if (a[1] < x[1]) return [true, x[1] - a[1] + s[1], lift(x[2], a, s)];
    return [true, s[1], cut0([false, s[2], lift(subtract(x[2], a[2]), a, s)])];
  };

  const isone = (x) => JSON.stringify(x) === JSON.stringify([true, 0, 0]);

  // Fundamental Sequence Calculation
  function LON_FS(x, FSterm) {
    let i, res, x2, xn1, prev;

    if (x === Limit || JSON.stringify(x) === JSON.stringify([true, Infinity])) {
      res = 0;
      for (i = FSterm; i >= 0; --i) res = [true, i, res];
      return [true, 0, res];
    }

    if (x === 0) return 0;

    if (!x[0]) {
      x2 = x[2];
      if (isone(x2)) return x[1];
      return cut0(x.slice(0, 2).concat([LON_FS(x2, FSterm)]));
    }

    x2 = Copy(x);
    const lx = L(x2);
    const xn = lx[lx.length - 1];

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
        for (i = FSterm; i--; ) res = [false, Copy(xn1), res];
        return cut0(res);
      } else {
        prev = lx.length === 2 ? x2 : lx[lx.length - 3];
        while (prev[2] !== xn1) prev = prev[2];
        prev[2] = 0;
        for (i = FSterm; i--; ) prev[2] = [false, Copy(xn1), prev[2]];
        return cut0(x2);
      }
    }

    const j = xn[1];
    const lxr = lx.slice();
    const xk = lxr.reverse().find((xz) => termtier(xz) === j - 1);

    if (LMN_compare(xk, [true, j - 1, [true, j, 0]]) > 0) {
      return cut0(change(x2, it(xk, FSterm)));
    }

    const xi = lxr.find(iscritical);
    const s = termtier(xi);

    if (s === j - 1) {
      return cut0(change(x2, it(inner(xi), FSterm)));
    }

    const xj = lxr.find((xz) => termtier(xz) === s);
    return LON_FS(cut0(change(x2, lift(inner(xi), xj, xk))), FSterm);
  }

  // Memoized FS Function Wrapper
  const memoData = {};
  function fs(x, n) {
    const key = JSON.stringify(x);
    if (!memoData[key]) memoData[key] = [];
    if (memoData[key][n] !== undefined) return memoData[key][n];
    return (memoData[key][n] = LON_FS(x, n));
  }

  // Successor Ordinal Check
  function isSuccessor(x) {
    if (x === 0 || x === Limit) return false;
    if (!x[0]) {
      return isSuccessor(x[2]) || isone(x[2]);
    }
    return isone(x);
  }

  // Rank Comparison Interface
  function cmp(a, b) {
    const res = LMN_compare(a, b);
    return res < 0 ? -1 : res > 0 ? 1 : 0;
  }

  // Visual Classification for Render Styling
  function classifyOrdinal(x) {
    if (x === Limit || (Array.isArray(x) && x[0] === true && x[1] === Infinity)) return "#ffffff";
    if (x === 0) return "#808080";
    if (isSuccessor(x)) return "#a00000";
    if (Array.isArray(x) && x[0] === true && x[2] === 0) return "#ffff00"; // Principal omega terms
    return "#ffA000"; // General limit ordinals
  }

  // String Parser
  function parse(str) {
    str = String(str).trim();
    if (str === "0" || str === "") return Zero;
    if (str.toLowerCase() === "limit" || str.includes("Infinity") || str.includes("ψ_0(Ω_∞)")) return Limit;

    // Check registered aliases
    for (const [aliasName, aliasVal] of Aliases) {
      if (str === aliasName) return aliasVal;
    }

    // Path address sequence parsing
    if (str.startsWith("path:")) {
      const numbers = str.replace("path:", "").split(",").map(Number);
      let current = Limit;
      for (let i = 0; i < numbers.length; i++) {
        if (isSuccessor(current)) break;
        current = fs(current, numbers[i]);
      }
      return current;
    }

    // JSON encoded tree structure parsing
    if (str.startsWith("[") || str.startsWith("{")) {
      try {
        return JSON.parse(str);
      } catch (e) {
        // Fallback to text parsing
      }
    }

    return Zero;
  }

  // Display Mode Handler
  function display(x, mode) {
    if (mode === "raw") return JSON.stringify(x);
    if (mode === "subscript") return pretty(x, "subscript");
    return pretty(x, "pretty");
  }

  // Preset Milestones / Aliases
  const Aliases = [
    ["0", Zero],
    ["1", [true, 0, 0]],
    ["ω", [true, 0, [true, 0, 0]]],
    ["ε0", [true, 0, [true, 1, 0]]],
    ["ζ0", [true, 0, [true, 1, [true, 1, 0]]]],
    ["Γ0", [true, 0, [true, 1, [true, 2, 0]]]],
    ["ψ_0(Ω_1)", [true, 0, [true, 1, 0]]],
    ["ψ_0(Ω_2)", [true, 0, [true, 2, 0]]],
    ["ψ_0(Ω_∞)", Limit]
  ];

  const DisplayName = ["pretty", "subscript", "raw"];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#a00000"],
    ["Limit Ordinal", "#ffA000"],
    ["Some very large Ordinal", "#ffff00"]
  ];

  const config = { modes: [{ mode: 1, target: "both" }], MaxIntervalDepth:1 };
  const title = "Lifting Omega Notation Transfinite Number Line";

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
