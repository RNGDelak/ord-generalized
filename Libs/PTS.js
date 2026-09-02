/*
Notation : Pointer Trio Sequence
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
    ["ψ(Λ)", [0, 0, 0, 1, 1, 1, 2, 1, 1, 3, 1, 0, 2, 0, 0]],
    ["ψ(Iω)", [0, 0, 0, 1, 1, 1, 2, 1, 1, 3, 1, 1]],
    ["ψ(I(ω,0))", [0, 0, 0, 1, 1, 1, 2, 1, 1, 3, 1, 1, 3, 0, 0]],
    ["ψ(ε{M+1})", [0, 0, 0, 1, 1, 1, 2, 1, 1, 3, 1, 1, 3, 1, 0, 4, 2, 0]],
    ["ψ(Mω)", [0, 0, 0, 1, 1, 1, 2, 1, 1, 3, 1, 1, 3, 1, 1]],
    ["ψ(M(ω;0))", [0, 0, 0, 1, 1, 1, 2, 1, 1, 3, 1, 1, 4, 0, 0]],
    ["ψ(Kω)", [0, 0, 0, 1, 1, 1, 2, 1, 1, 3, 1, 1, 4, 1, 1]],
    ["ψ(ε{T+1})", [0, 0, 0, 1, 1, 1, 2, 2, 0]],
    ["ψ(Tω)", [0, 0, 0, 1, 1, 1, 2, 2, 1]],
    ["ψ(T[ω])", [0, 0, 0, 1, 1, 1, 2, 2, 1, 3, 0, 0]],
    ["ψ(T[1:;0]ω)", [0, 0, 0, 1, 1, 1, 2, 2, 1, 3, 2, 1]],
    ["ψ(T[1:;;0]ω)", [0, 0, 0, 1, 1, 1, 2, 2, 1, 3, 3, 1]],
    ["ψ(T[1:{ω}0]ω)", [0, 0, 0, 1, 1, 1, 2, 2, 2]],
    ["ψ(T[1{1{*ω}0}0])", [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 2, 2]],
    ["ψ(T[1[ω[[1]]0]0])", [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3]],
    ["ψ(T[1[0]<ω>0])", Limit]
  ];

  // Dynamic limit sequence generator for ψ(T[1[0]<ω>0])
  function getLimit(num) {
    const res = [];
    for (let i = 0; i < num; i++) {
      res.push(0, 0, 0);
    }
    return res;
  }

  // Sequence rank comparison
  function rank(a, b) {
    const minLength = Math.min(a.length, b.length);

    for (let i = 0; i < minLength; i++) {
      if (a[i] !== b[i]) return a[i] < b[i];
    }

    return a.length > b.length;
  }

  function getAscendMap(ord) {
    const map = [];
    const lenInTrios = ord.length / 3;

    for (let i = 0; i < ord.length; i++) {
      map.push(ord[i] >= Math.floor(i / 3) ? lenInTrios : 0);
    }

    return map;
  }

  function ascend(ord, ascendMap) {
    const res = [...ord];
    for (let i = 0; i < res.length; i++) {
      res[i] += ascendMap[i];
    }
    return res;
  }

  // Immutable Expansion Step
  function expand(ord, num) {
    if (!Array.isArray(ord) || ord.length < 3) return [];

    const copy = [...ord];
    const [head, type, sub] = copy.splice(-3);
    const parent = copy.length - head * 3 - 3;

    if (parent >= 0) {
      const rootType = copy.length - type * 3 - 3;
      const subType = copy.length - sub * 3 - 3;

      const rootIndex = subType >= 0 ? subType : (rootType >= 0 ? rootType : parent);
      const part = copy.slice(rootIndex);
      const ascendMap = getAscendMap(part);

      if (rootType >= 0) {
        part[0] = head;
        ascendMap[0] = 0;

        if (subType >= 0) {
          part[1] = type;
          ascendMap[1] = 0;
        }
      }

      for (let i = 0; i < num; i++) {
        copy.push(...ascend(part, ascendMap));
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
      if (a[i] !== b[i]) return a[i] > b[i] ? -1 : 1;
    }

    if (a.length < b.length) return -1;
    if (a.length > b.length) return 1;
    return 0;
  }

  // Check if ordinal is a successor
  function isSuccessor(ord) {
    if (ord === Limit || !Array.isArray(ord) || ord.length < 3) return false;
    return ord[ord.length - 3] >= (ord.length / 3) - 1;
  }

  // Format pointer trio sequence array to bracket string format e.g. :[0,0,0][1,0,0]
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
    if (isSuccessor(ord)) return "#d40000";
    if (ord.length === 3) return "#ffd000"; // Principal term
    return "#ff8000"; // Limit ordinal
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
    ["Successor Ordinal", "#d40000"],
    ["Limit Ordinal", "#ff8000"],
    ["Principal Ordinal", "#ffd000"]
  ];

  const config = { modes: [{ mode: 1, target: 'both' }] };
  const title = "Pointer Trio Sequence Transfinite Number Line";

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