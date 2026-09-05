/*
Notation : Address Trio Sequence
Limit : ψ(T[1[0]<ω>0])
*/

window.notation = (() => {

  // Required Constants
  const Zero = [];
  const Limit = "Limit";

  // Milestones
  const Aliases = [
    ["0", Zero],
    ["1", [0, 0, 0]],
    ["ω", [0, 0, 0, 1, 0, 0]],
    ["ω^2", [0, 0, 0, 1, 0, 0, 1, 0, 0]],
    ["ω^ω", [0, 0, 0, 1, 0, 0, 2, 0, 0]],
    ["ω^ω^ω", [0, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0]],
    ["ε0", [0, 0, 0, 1, 1, 0]],
    ["ε1", [0, 0, 0, 1, 1, 0, 1, 1, 0]],
    ["εω", [0, 0, 0, 1, 1, 0, 2, 0, 0]],
    ["ζ0", [0, 0, 0, 1, 1, 0, 2, 1, 0]],
    ["φ(ω,0)", [0, 0, 0, 1, 1, 0, 2, 1, 0, 3, 0, 0]],
    ["Γ0", [0, 0, 0, 1, 1, 0, 2, 1, 0, 3, 1, 0]],
    ["ψ(ε{Ω+1})", [0, 0, 0, 1, 1, 0, 2, 2, 0]],
    ["ψ(Ωω)", [0, 0, 0, 1, 1, 1]],
    ["ψ(T[1[0]<ω>0])", Limit]
  ];

  // Dynamic limit sequence generator for ψ(T[1[0]<ω>0])
  function getLimit(num) {
    const res = [];
    for (let i = 0; i < num; i++) {
      res.push(i, i, i);
    }
    return res;
  }

  // Sequence rank comparison
  function rank(a, b) {
    const minLength = Math.min(a.length, b.length);

    for (let i = 0; i < minLength; i++) {
      if (a[i] !== b[i]) return a[i] > b[i];
    }

    return a.length > b.length;
  }

  function ascend(ord, rootType, subType, i, head, type) {
    const res = [...ord];
    const lenInTrios = res.length / 3;

    for (let j = 3; j < res.length; j += 3) {
      res[j] += lenInTrios;
      if (res[j + 1] > res[1]) res[j + 1] += lenInTrios;
      if (res[j + 2] > res[2]) res[j + 2] += lenInTrios;
    }

    if (rootType >= 0) {
      if (i > 0) res[0] += lenInTrios;
      else res[0] = head;
    }

    if (subType >= 0) {
      if (i > 0) res[1] += lenInTrios;
      else res[1] = type;
    }

    return res;
  }

  // Immutable Expansion Step
  function expand(ord, num) {
    if (!Array.isArray(ord) || ord.length < 3) return [];

    const copy = [...ord];
    const [head, type, sub] = copy.splice(-3);
    const parent = (head - 1) * 3;

    if (parent >= 0) {
      const rootType = (type - 1) * 3;
      const subType = (sub - 1) * 3;

      const part = copy.slice(subType >= 0 ? subType : (rootType >= 0 ? rootType : parent));

      for (let i = 0; i < num; i++) {
        copy.push(...ascend(part, rootType, subType, i, head, type));
      }
    }

    return copy;
  }

  // Fundamental Sequence
  function fs(ord, n) {
    if (ord === Limit) return getLimit(n);
    if (!Array.isArray(ord) || ord.length === 0) return [];
    return expand(ord, n);
  }

  // Rank comparison for ordinal ordering
  function cmp(a, b) {
    if (a === Limit && b === Limit) return 0;
    if (a === Limit) return 1;
    if (b === Limit) return -1;

    const minLength = Math.min(a.length, b.length);
    for (let i = 0; i < minLength; i++) {
      if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
    }

    if (a.length < b.length) return -1;
    if (a.length > b.length) return 1;
    return 0;
  }

  // Check if ordinal is a successor
  function isSuccessor(ord) {
    if (ord === Limit || !Array.isArray(ord) || ord.length < 3) return false;
    return ord[ord.length - 3] === 0;
  }

  // Format address trio sequence array to bracket string format e.g. :[0,0,0][1,1,1]
  function pretty(ord) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";

    let str = ":";
    for (let i = 0; i < ord.length; i += 3) {
      str += `[${ord[i]},${ord[i + 1] ?? 0},${ord[i + 2] ?? 0}]`;
    }

    return str;
  }

  // Display modes handler
  function display(ord, mode) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";
    if (mode === 'raw') {
      return JSON.stringify(ord);
    }
    if (mode === 'pretty') {
      return pretty(ord);
    }
  }

  // Classify ordinals for visual styling
  function classifyOrdinal(ord) {
    if (ord === Limit) return "#ffffff";
    if (!Array.isArray(ord) || ord.length === 0) return "#808080";
    if (isSuccessor(ord)) return "#a00000";
    if (ord.length === 3) return "#ffff00"; // Power of ω
    return "#ffA000"; // Limit ordinal
  }

  // Parser supporting alias lookup, raw arrays, bracket formatting, and address paths
  function parse(str) {
    str = String(str).trim();
    if (str === "" || str === "0") return Zero;
    if (str.toLowerCase() === "limit" || str.includes("ψ(T[")) return Limit;

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

    // 3. Raw numbers match (handles both raw arrays and :[a,b,c] notation)
    const numbers = str.match(/\d+/g);
    if (numbers) {
      return numbers.map(Number);
    }

    return Zero;
  }

  const DisplayName = ["raw", "pretty"];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#a00000"],
    ["Limit Ordinal", "#ffA000"],
    ["Some very large Ordinal", "#ffff00"]
  ];

  const config = { modes: [{ mode: 1, target: 'both' }] };
  const title = "Address Trio Sequence Transfinite Number Line";

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