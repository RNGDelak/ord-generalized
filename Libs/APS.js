/*
Notation : Address Pair Sequence
Limit : ψ(Ωω)
*/

window.notation = (() => {

  // Required Constants
  const Zero = [];
  const Limit = "Limit";

  // Milestones translated to module Aliases format
  const Aliases = [
    ["0", Zero],
    ["1", [0, 0]],
    ["ω", [0, 0, 1, 0]],
    ["ω^2", [0, 0, 1, 0, 1, 0]],
    ["ω^ω", [0, 0, 1, 0, 2, 0]],
    ["ω^ω^ω", [0, 0, 1, 0, 2, 0, 3, 0]],
    ["ε0", [0, 0, 1, 1]],
    ["ε1", [0, 0, 1, 1, 1, 1]],
    ["εω", [0, 0, 1, 1, 2, 0]],
    ["ζ0", [0, 0, 1, 1, 2, 1]],
    ["φ(ω,0)", [0, 0, 1, 1, 2, 1, 3, 0]],
    ["Γ0", [0, 0, 1, 1, 2, 1, 3, 1]],
    ["ψ(ε{Ω+1})", [0, 0, 1, 1, 2, 2]],
    ["ψ(Ωω)", Limit],
  ];

  // Helper function to dynamically calculate the top Limit array based on step `num`
  function getLimit(num) {
    const res = [];
    for (let i = 0; i < num; i++) {
      res.push(i, i);
    }
    return res;
  }

  // Core Worm Expansion Step
  function expand(ord, num) {
    if (!Array.isArray(ord) || ord.length === 0) return [];
    
    // Clone array to avoid mutating original state
    const clone = [...ord];
    const head = clone[clone.length - 2];
    const type = clone[clone.length - 1];
    clone.length -= 2;

    const parent = (head - 1) * 2;

    if (parent >= 0) {
      const root = (type - 1) * 2;
      const part = clone.slice(root >= 0 ? root : parent);

      for (let i = 0; i < num; i++) {
        const sub = [...part];
        if (root >= 0) sub[0] = head;

        // Ascend phase
        if (root >= 0 && i > 0) sub[0] += sub.length / 2;
        for (let j = 2; j < sub.length; j += 2) {
          sub[j] += sub.length / 2;
          if (sub[j + 1] > sub[1]) sub[j + 1] += sub.length / 2;
        }

        clone.push(...sub);
      }
    }
    return clone;
  }

  // Fundamental Sequence function
  function fs(ord, n) {
    if (ord === Limit) return getLimit(n);
    if (!Array.isArray(ord) || ord.length === 0) return [];
    return expand(ord, n);
  }

  // Rank comparison function
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
    return ord !== Limit && Array.isArray(ord) && ord.length > 0 && ord[ord.length - 2] === 0;
  }

  // Format array to pretty representation
  function pretty(ord) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";

    let str = "";
    for (let i = 0; i < ord.length; i += 2) {
      str += `[${ord[i]},${ord[i + 1]}]`;
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
    if (ord.length === 2 && ord[0] === 0 && ord[1] > 0) return "#ffd000"; // Major limit branch
    return "#ff8000"; // Limit ordinal
  }

  // Parser supporting alias lookup, raw arrays, address sequences, and worm pairs
  function parse(str) {
    str = String(str).trim();
    if (str === "" || str === "0") return Zero;
    if (str.toLowerCase() === "limit" || str === "ψ(Ω^ω)" || str === "psi(w^w)") return Limit;

    // 1. Alias lookup
    for (const [aliasName, aliasVal] of Aliases) {
      if (str === aliasName) return aliasVal;
    }

    // 2. Fundamental Sequence address path: "2,6,2,8,1"
    if (/^\d+(\s*,\s*\d+)*$/.test(str) && !str.includes("[")) {
      const arr = str.split(',').map(Number);
      let current = Limit;
      for (let i = 0; i < arr.length; i++) {
        if (isSuccessor(current)) break;
        current = fs(current, arr[i]);
      }
      return current;
    }

    // 3. Worm pair string notation: ":[0,0][1,0][2,1]" or "0,0,1,0,2,1"
    const numbers = str.match(/\d+/g);
    if (numbers) {
      const parsed = numbers.map(Number);
      if (parsed.length % 2 === 0) {
        return parsed;
      }
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
  const title = "Address Pair Sequence transfinite number line";

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