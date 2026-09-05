/*
Notation : Pair Sequence
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

  // Limit sequence generator for ψ(Ωω)
  function getLimit(num) {
    const res = [];
    for (let i = 0; i < num; i++) {
      res.push(i, i);
    }
    return res;
  }

  // Pair Sequence Expansion Logic
  function ascend(ord, offset) {
    for (let i = 0; i < ord.length; i += 2) {
      ord[i] += offset;
    }
    return ord;
  }

  function getParent(ord, head, root = ord.length) {
    do {
      root -= 2;
    } while (root >= 0 && ord[root] >= head);
    return root;
  }

  function search(ord, head, type) {
    let root = ord.length;
    do {
      root = getParent(ord, ord[root] ?? head, root);
    } while (root >= 0 && ord[root + 1] >= type);
    return root;
  }

  // Immutable Expansion Step
  function expand(ord, num) {
    if (!Array.isArray(ord) || ord.length === 0) return [];

    const copy = [...ord];
    const [head, type] = copy.splice(-2);

    if (head > 0) {
      const root = type > 0
        ? search(copy, head, type)
        : getParent(copy, head);

      if (root >= 0) {
        const part = copy.slice(root);
        const offset = type > 0 ? head - copy[root] : 0;

        for (let i = 0; i < num; i++) {
          copy.push(...ascend([...part], offset));
        }
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
    return (
      ord !== Limit &&
      Array.isArray(ord) &&
      ord.length > 0 &&
      ord[ord.length - 2] === 0
    );
  }

  // Format pair array to string representation e.g. :[0,0][1,1]
  function pretty(ord) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";

    let str = ":";
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
    if (isSuccessor(ord)) return "#a00000";
    if (ord.length === 2 && ord[0] === 0 && ord[1] === 0) return "#ffff00"; // Major branch term
    return "#ffa000"; // Limit ordinal
  }

  // Parser supporting alias lookup, raw arrays, pair brackets, and address sequences
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

    // 3. Pair String Notation e.g. ":[0,0][1,1]" or flat "0,0,1,1"
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
    ["Successor Ordinal", "#a00000"],
    ["Limit Ordinal", "#ffa000"],
    ["Some very large Ordinal", "#ffff00"]
  ];

  const config = { modes: [{ mode: 1, target: 'both' }] };
  const title = "Pair Sequence Transfinite Number Line";

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