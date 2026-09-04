/*
Notation : Hyper Sequence Hydra
Limit : ψ(T[1[0]<ω>0])
*/

window.notation = (() => {

  // Required Constants
  const Zero = [];
  const Limit = "Limit";

  // Milestones
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
    ["ψ(Ωω)", [1, 2, 4]],
    ["ψ(Λ)", [1, 2, 4, 4, 3, 0, 0, 1]],
    ["ψ(Iω)", [1, 2, 4, 4, 4]],
    ["ψ(I(ω,0))", [1, 2, 4, 4, 4, 0, 1]],
    ["ψ(ε{M+1})", [1, 2, 4, 4, 4, 0, 3, 4]],
    ["ψ(Mω)", [1, 2, 4, 4, 4, 0, 4]],
    ["ψ(M(ω;0))", [1, 2, 4, 4, 4, 1]],
    ["ψ(Kω)", [1, 2, 4, 4, 4, 4]],
    ["ψ(ε{T+1})", [1, 2, 4, 5]],
    ["ψ(Tω)", [1, 2, 4, 6]],
    ["ψ(T[ω])", [1, 2, 4, 6, 1]],
    ["ψ(T[1:;0]ω)", [1, 2, 4, 6, 6]],
    ["ψ(T[1:;;0]ω)", [1, 2, 4, 6, 8]],
    ["ψ(T[1:{ω}0]ω)", [1, 2, 4, 7]],
    ["ψ(T[1{1{*ω}0}0])", [1, 2, 4, 7, 10]],
    ["ψ(T[1[ω[[1]]0]0])", [1, 2, 4, 7, 11]],
    ["ψ(T[1[0]<ω>0])", Limit]
  ];

  // Dynamic limit sequence generator for ψ(T[1[0]<ω>0])
  function getLimit(num) {
    const res = [];
    for (let i = 0; i < num; i++) {
      res.push((i * (i + 1)) / 2 + 1);
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

  function ascend(ord, map) {
    return ord.map((val, idx) => val + map[idx]);
  }

  function getMap(ord, offset) {
    const map = [offset];
    let count = 0;

    for (let i = 1; i < ord.length; i++) {
      if (count > 0) count += ord[i] === 0 ? -1 : 1;
      if (ord[i] > 0 && ord[i] <= ord[0]) count = 1;

      map.push(count === 0 && ord[i] !== 0 ? offset : 0);
    }
    return map;
  }

  function getParent(ord, root = ord.length) {
    let count = 1;
    do {
      root--;
      if (root < 0) break;
      count += ord[root] === 0 ? 1 : -1;
    } while (root >= 0 && count > 0);
    return root;
  }

  function getSubParent(ord, head, root) {
    while (root >= 0 && ord[root] >= head) {
      root = getParent(ord, root);
    }
    return root;
  }

  function search(ord, offset, root) {
    let mark = root;
    do {
      root = mark;
      mark = getSubParent(ord, ord[root], root);
    } while (mark >= 0 && ord[root] - ord[mark] >= offset);
    return root;
  }

  // Immutable Hyper Sequence Hydra Expansion Step
  function expand(ord, num) {
    if (!Array.isArray(ord) || ord.length === 0) return [];

    const copy = [...ord];
    const head = copy.pop();
    const parent = getParent(copy);

    if (parent >= 0) {
      if (head === 1) {
        const part = copy.slice(parent);
        part.unshift(0);

        for (let i = 0; i < num; i++) {
          copy.push(...part);
        }
      } else {
        const subParent = getSubParent(copy, head, parent);
        if (subParent >= 0) {
          const type = head - copy[subParent];

          const root = type > 1 ? search(copy, type, subParent) : subParent;

          if (root >= 0) {
            const part = copy.slice(root);
            const offset = head - copy[root] - 1;
            const map = getMap(part, offset);

            for (let i = 0; i < num; i++) {
              copy.push(...ascend(part, map));
            }
          }
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

    return `:${hydra.join("")}` + ")".repeat(Math.max(0, offset));
  }

  // Display modes handler
  function display(ord, mode) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";
    if (mode === "raw") {
      return JSON.stringify(ord);
    }
    if (mode === "pretty") {
      return pretty(ord);
    }
  }

  // Classify ordinals for visual styling
  function classifyOrdinal(ord) {
    if (ord === Limit) return "#ffffff";
    if (!Array.isArray(ord) || ord.length === 0) return "#808080";
    if (isSuccessor(ord)) return "#a00000";
    if (ord.length === 1) return "#ffff00"; // Single head principal term
    return "#ffA000"; // Limit ordinal
  }

  // Parser supporting alias lookup, raw arrays, bracket hydras, and address sequences
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

    // 3. Raw comma-separated array or bracket string match
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

  const config = { modes: [{ mode: 1, target: "both" }] };
  const title = "Hyper Sequence Hydra Transfinite Number Line";

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