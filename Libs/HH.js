/*
Notation : Hyper Hydra
Limit : ψ(Ωω)
*/

window.notation = (() => {

  // Required Constants
  const Zero = [];
  const Limit = "Limit";

  // Milestones translated to module Aliases format
  const Aliases = [
    ["0", Zero],
    ["1", [2]],
    ["ω", [2, 1, 2]],
    ["ω^2", [2, 1, 2, 0, 2]],
    ["ω^ω", [2, 1, 2, 1, 2]],
    ["ω^ω^ω", [2, 1, 2, 1, 2, 1, 2]],
    ["ε0", [2, 2]],
    ["ε1", [2, 2, 0, 2]],
    ["εω", [2, 2, 1, 1, 2]],
    ["ζ0", [2, 2, 1, 2]],
    ["φ(ω,0)", [2, 2, 1, 2, 1, 1, 2]],
    ["Γ0", [2, 2, 1, 2, 1, 2]],
    ["ψ(ε{Ω+1})", [2, 2, 2]],
    ["ψ(Ωω)", Limit],
  ];

  // Dynamic limit sequence generator for ψ(Ωω)
  function getLimit(num) {
    const res = [];
    for (let i = 0; i < num; i++) {
      res.push(2);
    }
    return res;
  }

  // Parent finding logic
  function getParent(ord, root = ord.length) {
    let count = 1;
    do {
      root--;
      if (root < 0) break;
      if (ord[root] === 0) count++;
      else if (ord[root] === 2) count--;
    } while (root >= 0 && count > 0);
    return root;
  }

  // Hyper Hydra Search Logic
  function search(ord) {
    let root = ord.length;
    let count = 1;
    do {
      root--;
      if (root < 0) break;
      if (ord[root] === 1) count++;
      else if (ord[root] === 2) count--;

      if (ord[root] === 0) {
        root = getParent(ord, root);
      }
    } while (root >= 0 && count > 0);
    return root;
  }

  function trim(ord, func) {
    while (ord.length > 0 && func(ord[ord.length - 1])) {
      ord.pop();
    }
    return ord;
  }

  // Immutable Hyper Hydra Expansion Step
  function expand(ord, num) {
    if (!Array.isArray(ord) || ord.length === 0) return [];

    const copy = [...ord];
    copy.pop();
    const parent = getParent(copy);

    if (parent >= 0) {
      const root = search(copy);

      if (root >= 0) {
        const part = copy.slice(root);
        for (let i = 0; i < num; i++) {
          copy.push(1, ...part);
        }
      } else {
        trim(copy, (i) => i === 1);
        const part = copy.slice(parent);
        for (let i = 0; i < num; i++) {
          copy.push(0, ...part);
        }
      }
    }

    return trim(copy, (i) => i !== 2);
  }

  // Fundamental Sequence
  function fs(ord, n) {
    if (ord === Limit) return getLimit(n);
    if (!Array.isArray(ord) || ord.length === 0) return [];
    return expand(ord, n);
  }

  // Custom Rank comparison for Hyper Hydra
  function cmp(a, b) {
    if (a === Limit && b === Limit) return 0;
    if (a === Limit) return 1;
    if (b === Limit) return -1;

    const minLength = Math.min(a.length, b.length);
    for (let i = 0; i < minLength; i++) {
      if (a[i] !== b[i]) return a[i] === 1 ? 1 : -1;
    }

    if (a.length < b.length) return -1;
    if (a.length > b.length) return 1;
    return 0;
  }

  // Check if ordinal is a successor
  function isSuccessor(ord) {
    if (ord === Limit || !Array.isArray(ord) || ord.length === 0) return false;
    return getParent(ord.slice(0, -1)) < 0;
  }

  // Format Hyper Hydra array to string format e.g. :))}0)
  function pretty(ord) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";

    const symbols = [")", "}", "0"];
    return ":" + ord.map((i) => symbols[i] ?? "").join("");
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
    if (ord.length === 1 && ord[0] === 2) return "#ffd000"; // Principal term
    return "#ff8000"; // Limit ordinal
  }

  // Parser supporting alias lookup, raw arrays, bracket strings, and address paths
  function parse(str) {
    str = String(str).trim();
    if (str === "" || str === "0") return Zero;
    if (str.toLowerCase() === "limit" || str === "ψ(Ωω)" || str === "psi(ww)") return Limit;

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

    // 3. String representation parse: maps ), }, 0 to 0, 1, 2 array
    if (str.startsWith(":")) {
      const symbols = str.slice(1).split("");
      const res = [];
      for (const char of symbols) {
        if (char === ")") res.push(0);
        else if (char === "}") res.push(1);
        else if (char === "0") res.push(2);
      }
      if (res.length > 0) return res;
    }

    // 4. Raw numerical array parse
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
  const title = "Hyper Hydra Transfinite Number Line";

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