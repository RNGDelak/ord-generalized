/*
Notation : Extended Shifted Sequence
Limit : ψ(Λ)
*/

window.notation = (() => {

  // Required Constants
  const Zero = [];
  const Limit = "Limit";

  // Milestones translated to module Aliases format
  const Aliases = [
    ["0", Zero],
    ["1", [0]],
    ["ω", [0, 0, 1]],
    ["ω^2", [0, 0, 1, 0, 1]],
    ["ω^ω", [0, 0, 1, 0, 1, 1]],
    ["ω^ω^ω", [0, 0, 1, 0, 1, 1, 0, 1, 1, 1]],
    ["ε0", [0, 0, 1, 1, 2]],
    ["ε1", [0, 0, 1, 1, 2, 0, 1, 1, 2]],
    ["εω", [0, 0, 1, 1, 2, 1]],
    ["ζ0", [0, 0, 1, 1, 2, 1, 2]],
    ["φ(ω,0)", [0, 0, 1, 1, 2, 2]],
    ["Γ0", [0, 0, 1, 2]],
    ["ψ(ε{Ω+1})", [0, 0, 1, 2, 0, 1, 1, 2]],
    ["ψ(Ωω)", [0, 0, 1, 2, 2, 3]],
    ["ψ(Λ)", Limit],
  ];

  // Dynamic limit sequence generator for ψ(Λ)
  function getLimit(num) {
    const res = [0];
    for (let i = 0; i < num + 1; i++) {
      res.push(i);
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

  function ascend(ord, offset) {
    return ord.map((val) => val + offset);
  }

  function getParent(ord, head, root = ord.length) {
    do {
      root--;
    } while (root >= 0 && ord[root] >= head);
    return root;
  }

  function search(ord, head, top) {
    let mark = ord.length;
    let root = ord.length;
    do {
      root = mark;
      mark = getParent(ord, top, mark);
    } while (mark >= 0 && rank(ord.slice(mark, root), head));
    return root;
  }

  function searchType(ord, top) {
    let root = ord.length - 1;

    do {
      root = getParent(ord, ord[root] + 1, root);
    } while (
      root >= 0 &&
      (ord[root - 1] !== ord[root] || ord[root] >= top)
    );
    return root;
  }

  // Immutable Extended Shifted Sequence Expansion Step
  function expand(ord, num) {
    if (!Array.isArray(ord) || ord.length === 0) return [];

    const copy = [...ord];
    const top = copy.pop();

    if (top > 0) {
      const headPos = getParent(copy, top);
      const head = copy.slice(headPos);
      const parent = search(copy, head, top);

      if (copy[parent - 1] < top - 1) {
        const root = searchType(copy, top);
        const part = copy.slice(root);
        const offset = top - copy[root] - 1;

        for (let i = 0; i < num; i++) {
          copy.push(...ascend(part, offset));
        }
      } else {
        copy.splice(headPos);
        const part = copy.slice(parent);
        part.unshift(...head);

        for (let i = 0; i < num; i++) {
          copy.push(...part);
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
    if (ord === Limit || !Array.isArray(ord) || ord.length === 0) return false;
    return ord[ord.length - 1] === 0;
  }

  // Unparse sequence array to string format e.g. (0,0,1,2)
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
    if (ord.length === 1 && ord[0] === 0) return "#ffff00"; // Principal term
    return "#ffA000"; // Limit ordinal
  }

  // Parser supporting alias lookup, raw arrays, bracket format, and address paths
  function parse(str) {
    str = String(str).trim();
    if (str === "" || str === "0") return Zero;
    if (str.toLowerCase() === "limit" || str === "ψ(Λ)" || str === "psi(L)") return Limit;

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

    // 3. Raw comma-separated array parse (e.g. "(0,0,1,2)" or "0,0,1,2")
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
  const title = "Extended Shifted Sequence Transfinite Number Line";

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