/*
Notation : Hyper Sequence
Limit : ψ(Ωω)
*/

window.notation = (() => {

  // Required Constants
  const Zero = [];
  const Limit = "Limit";

  // Milestones translated to module Aliases format
  const Aliases = [
    ["0", Zero],
    ["1", [0]],
    ["ω", [0, 1]],
    ["ω^2", [0, 1, 2]],
    ["ε0", [0, 1, 3]],
    ["ε1", [0, 1, 3, 3]],
    ["εω", [0, 1, 3, 4]],
    ["ζ0", [0, 1, 3, 5]],
    ["φ(ω,0)", [0, 1, 3, 5, 6]],
    ["Γ0", [0, 1, 3, 5, 7]],
    ["ψ(Ω2)", [0, 1, 3, 6]],
    ["ψ(Ω3)", [0, 1, 3, 6, 10]],
    ["ψ(Ωω)", Limit],
  ];

  // Generates the top limit sequence dynamically for step `num`
  function getLimit(num) {
    const res = [];
    for (let i = 0; i < num; i++) {
      res.push((i * (i + 1)) / 2);
    }
    return res;
  }

  // Worm Search and Parent logic
  function ascend(ord, offset) {
    for (let i = 0; i < ord.length; i++) {
      ord[i] += offset;
    }
    return ord;
  }

  function getParent(ord, head, root = ord.length) {
    do {
      root--;
    } while (root >= 0 && ord[root] >= head);
    return root;
  }

  function search(ord, offset, root) {
    let mark = root;
    do {
      root = mark;
      mark = getParent(ord, ord[root], root);
    } while (mark >= 0 && ord[root] - ord[mark] >= offset);
    return root;
  }

  // Expansion Step (Immutable copy wrapper)
  function expand(ord, num) {
    if (!Array.isArray(ord) || ord.length === 0) return [];

    const copy = [...ord];
    const head = copy.pop();

    if (head > 0) {
      const parent = getParent(copy, head);
      if (parent >= 0) {
        const type = head - copy[parent];
        const root = type > 1 ? search(copy, type, parent) : parent;

        const part = copy.slice(root);
        const offset = head - copy[root] - 1;

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

  // Lexicographical comparison
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

  // Check if ordinal is a successor (last element is 0)
  function isSuccessor(ord) {
    return ord !== Limit && Array.isArray(ord) && ord.length > 0 && ord[ord.length - 1] === 0;
  }

  // Format array to string representation e.g. (0,1,3,6)
  function pretty(ord) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";
    return `(${ord.join(",")})`;
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
    if (ord.length === 1) return "#ffff00"; // Power of omega / Principal branch
    return "#ffA000"; // Limit ordinal
  }

  // Parser supporting alias lookup, comma lists, and address sequences
  function parse(str) {
    str = String(str).trim();
    if (str === "" || str === "0") return Zero;
    if (str.toLowerCase() === "limit" || str === "ψ(Ω^ω)" || str === "psi(w^w)") return Limit;

    // 1. Alias lookup
    for (const [aliasName, aliasVal] of Aliases) {
      if (str === aliasName) return aliasVal;
    }

    // 2. Address path traversal or direct single-array notation: e.g. "(0,1,3,6)" or "0,1,3,6"
    const cleaned = str.replace(/[()\[\]{}]/g, "");
    if (/^\d+(\s*,\s*\d+)*$/.test(cleaned)) {
      const numbers = cleaned.split(",").map(s => parseInt(s.trim(), 10));

      // If user provided a path like address sequence, evaluate FS if explicitly given as address path
      if (str.startsWith("path:")) {
        let current = Limit;
        for (let i = 0; i < numbers.length; i++) {
          if (isSuccessor(current)) break;
          current = fs(current, numbers[i]);
        }
        return current;
      }

      return numbers;
    }

    return Zero;
  }

  const DisplayName = ["raw", "pretty"];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#a00000"],
    ["Limit Ordinal", "#ffA000"],
    ["Principal Ordinal", "#ffff00"]
  ];

  const config = { modes: [{ mode: 1, target: 'both' }] };
  const title = "Hyper Sequence Transfinite Number Line";

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