/*
Notation : Trio Sequence
Limit : ψ(T[1[0]<ω>0])
*/

window.notation = (() => {

  // Required Constants
  const Zero = [];
  const Limit = "Limit";

  // Standard Trio Sequence Milestones
  const Aliases = [
    ["0", Zero],
    ["1", [0, 0, 0]],
    ["ω", [0, 0, 0, 1, 0, 0]],
    ["ω^2", [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0]],
    ["ω^ω", [0, 0, 0, 1, 0, 0, 1, 0, 0]],
    ["ω^ω^ω", [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0]],
    ["ε0", [0, 0, 0, 1, 1, 0]],
    ["ζ0", [0, 0, 0, 1, 2, 0]],
    ["Γ0", [0, 0, 0, 2, 0, 0]],
    ["ψ(T[1[0]<ω>0])", Limit],
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

  function ascend(ord, ascendMap) {
    return ord.map((val, idx) => val + ascendMap[idx]);
  }

  function getAscendMap(ord, headOffset, typeOffset) {
    const map = [headOffset, typeOffset, 0];
    let count = 0;

    for (let i = 3; i < ord.length; i += 3) {
      if (ord[i] < count) count = 0;
      if (ord[i + 1] <= ord[1]) count = ord[i];

      map.push(headOffset, count === 0 ? typeOffset : 0, 0);
    }

    return map;
  }

  function getParent(ord, head, root = ord.length) {
    do {
      root -= 3;
    } while (root >= 0 && ord[root] >= head);
    return root;
  }

  function getSubParent(ord, type, root = ord.length) {
    do {
      root = getParent(ord, ord[root], root);
    } while (root >= 0 && ord[root + 1] >= type);
    return root;
  }

  function search(ord, sub) {
    let root = ord.length;
    do {
      root = getSubParent(ord, ord[root + 1], root);
    } while (root >= 0 && ord[root + 2] >= sub);
    return root;
  }

  // Immutable Trio Sequence Expansion Step
  function expand(ord, num) {
    if (!Array.isArray(ord) || ord.length < 3) return [];

    const copy = [...ord];
    const [head, type, sub] = copy.slice(-3);

    if (head > 0) {
      const root = sub > 0
        ? search(copy, sub)
        : type > 0
        ? getSubParent(copy, type)
        : getParent(copy, head);

      copy.splice(-3);
      if (root >= 0) {
        const part = copy.slice(root);

        const headOffset = type > 0 ? head - copy[root] : 0;
        const typeOffset = sub > 0 ? type - copy[root] : 0;

        const ascendMap = getAscendMap(part, headOffset, typeOffset);

        for (let i = 0; i < num; i++) {
          copy.push(...ascend(part, ascendMap));
        }
      }
    } else {
      copy.splice(-3);
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

  // Format trio sequence array to bracket string format e.g. :[0,0,0][1,1,1]
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
  const title = "Trio Sequence Transfinite Number Line";

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