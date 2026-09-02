/*
Notation : Sequence Hydra
Limit : ψ(Ωω)
*/

window.notation = (() => {

  // Required Constants
  const Zero = [];
  const Limit = "Limit";

  // Milestones translated to module Aliases format
  const Aliases = [
    ["0", Zero],
    ["1", [1]],
    ["ω", [1, 1]],
    ["ω^2", [1, 1, 0, 1]],
    ["ω^ω", [1, 1, 1]],
    ["ω^ω^ω", [1, 1, 1, 1]],
    ["ε0", [1, 2]],
    ["ε1", [1, 2, 0, 2]],
    ["εω", [1, 2, 1]],
    ["ζ0", [1, 2, 2]],
    ["φ(ω,0)", [1, 2, 2, 1]],
    ["Γ0", [1, 2, 2, 2]],
    ["ψ(ε{Ω+1})", [1, 2, 3]],
    ["ψ(Ωω)", Limit],
  ];

  // Dynamic limit sequence generator for ψ(Ωω)
  function getLimit(num) {
    const res = [];
    for (let i = 0; i < num; i++) {
      res.push(i + 1);
    }
    return res;
  }

  // Hydra Parent Finding and Search Logic
  function getParent(ord, root = ord.length) {
    let count = 1;
    do {
      root--;
      if (root < 0) break;
      count += ord[root] === 0 ? 1 : -1;
    } while (root >= 0 && count > 0);
    return root;
  }

  function search(ord, head, root) {
    while (root >= 0 && ord[root] >= head) {
      root = getParent(ord, root);
    }
    return root;
  }

  // Immutable Sequence Hydra Expansion Step
  function expand(ord, num) {
    if (!Array.isArray(ord) || ord.length === 0) return [];

    const copy = [...ord];
    const head = copy.pop();
    const parent = getParent(copy);

    if (parent >= 0) {
      const root = head > 1
        ? search(copy, head, parent)
        : parent;

      if (root >= 0) {
        const part = copy.slice(root);
        if (head === 1) part.unshift(0);

        for (let i = 0; i < num; i++) {
          copy.push(...part);
        }
      }
    }

    // Clean up trailing zeros
    while (copy.length > 0 && copy[copy.length - 1] === 0) {
      copy.pop();
    }

    return copy;
  }

  // Fundamental Sequence
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
    if (ord === Limit || !Array.isArray(ord) || ord.length === 0) return false;
    return getParent(ord.slice(0, -1)) < 0;
  }

  // Format hydra sequence array to bracket string format e.g. :(0)(1)
  function pretty(ord) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";

    let offset = 0;
    const hydra = ord.map((i) => {
      offset += i === 0 ? -1 : 1;
      return i === 0 ? ")" : `(${i - 1}`;
    });

    return `:${hydra.join("")}` + ")".repeat(offset);
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
    if (ord.length === 1) return "#ffd000"; // Single head principal term
    return "#ff8000"; // Limit ordinal
  }

  // Parser supporting alias lookup, raw arrays, bracket hydras, and address sequences
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

    // 3. Raw comma-separated array or bracket hydra string
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
  const title = "Sequence Hydra Transfinite Number Line";

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