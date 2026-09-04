/*
Notation : Fundamental Sequence System (FSS)
Limit : ψ(Ω_ω)
*/

window.notation = (() => {

  // Required Constants
  const Zero = [];
  const Limit = "Limit";

  // Configuration version toggle (defaulting to 1.0)
  let version = "1";

  // Milestones
  const Aliases = [
    ["0", Zero],
    ["1", [[]]],
    ["ω", limit(1)],
    ["ε0", [Zero, [[]], [Zero, [[]], [[]]]]],
    ["ψ(Ω_ω)", Limit]
  ];

  // Internal limit generator
  function limit(n) {
    if (n === 0) return [];
    let a = [];
    for (let i = 0; i < n; i++) {
      a.push(limit(i));
    }
    return a;
  }

  // Dynamic limit sequence generator for the notation
  function getLimit(num) {
    return limit(num + 1);
  }

  // Stringify array representation
  function toStringInternal(array) {
    if (!array || array.length === 0) return "";
    return JSON.stringify(array).slice(1, -1).replaceAll(/,/g, "");
  }

  // Successor check
  function isSuccessorInternal(array) {
    let s = toStringInternal(array);
    return s.length === 0 || s.endsWith("[]");
  }

  function compareTerms(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return 0;
    for (let i = 0; i < a.length; i++) {
      if (i >= b.length) return 1; // a > b
      let c = compareTerms(a[i], b[i]);
      if (c !== 0) return c;
    }
    return b.length > a.length ? -1 : 0;
  }

  function lessThan(a, b) {
    return compareTerms(a, b) === -1;
  }

  function equal(a, b) {
    return compareTerms(a, b) === 0;
  }

  function decrement(a) {
    if (!Array.isArray(a) || a.length === 0) return [];
    if (a[a.length - 1].length === 0) return a.slice(0, -1);
    return a.slice(0, -1).concat([decrement(a[a.length - 1])]);
  }

  function deepcopy(term) {
    if (!Array.isArray(term)) return term;
    return term.map((x) => deepcopy(x));
  }

  function findPrefixInExpansion(term, parent) {
    if (lessThan(parent, term)) return [null, -1];
    let index = 0;
    let element = expandInternal(parent, 0);
    if (lessThan(term, element)) return [null, -1];
    while (true) {
      let next = expandInternal(parent, index + 1);
      if (lessThan(term, next)) return [element, index];
      element = next;
      index++;
    }
  }

  function searchForParent(root, target) {
    let candidates = [];
    let current = [[[]]];
    let iter = 0;
    while (true) {
      iter++;
      let rootIndex = findPrefixInExpansion(root, current)[1];
      let [next, nextIndex] = findPrefixInExpansion(target, current);
      if (nextIndex > rootIndex && rootIndex !== -1) {
        candidates.push(current);
      }
      current = expandInternal(current, nextIndex + 1);
      if (isSuccessorInternal(current)) break;
    }

    let parent, prefix;
    for (let i = 0; i < candidates.length; i++) {
      let index = findPrefixInExpansion(root, candidates[i])[1];
      let previous = expandInternal(candidates[i], index);
      if (prefix == null || lessThan(prefix, previous)) {
        parent = candidates[i];
        prefix = previous;
      }
    }

    return parent;
  }

  let expandCache = new Map();

  function cacheResult(hash, out) {
    expandCache.set(hash, deepcopy(out));
    return out;
  }

  function convertToNotation(value) {
    if (value === "") return "0";
    let s = value.replaceAll(/\]\[/g, "],[").replaceAll(/\[\]/g, "0");
    while (true) {
      let next = s.replaceAll(/\[([0,]+)\]/g, (_, n) => `${(n.length + 1) / 2}`);
      if (next === s) break;
      s = next;
    }
    s = s.replaceAll(/\[[0-9,]+\]/g, function (x) {
      try {
        let a = JSON.parse(x);
        for (let i = a.length - 2; i > 0; i--) {
          if (a[i] === a[i - 1] && a[i + 1] > a[i]) {
            a.splice(i, 1);
          }
        }
        for (let i = 1; i < a.length; i++) {
          if (a[i] - a[i - 1] > 1) return JSON.stringify(a);
        }
        return PrSStoCNF(standardizePrSS(a));
      } catch (e) {
        return x;
      }
    });
    s = s.replaceAll("[0,1,3]", "ε₀");
    s = s.replaceAll("[0,1,4]", "ζ₀");
    s = s.replaceAll("[0,1,5]", "η₀");
    if (version === "1.2") {
      s = s.replaceAll("[0,1,ω]", "ε₀");
      s = s.replaceAll("[0,1,ω,ε₀]", "φ(ε₀,0)");
    } else {
      s = s.replaceAll("[0,1,ω]", "φ(ω,0)");
    }
    return s;
  }

  function toStringFormatted(a) {
    if (a == null) return "null";
    return convertToNotation(toStringInternal(a));
  }

  function expandInternal(a, n) {
    if (!Array.isArray(a)) return [];
    let str = toStringFormatted(a);
    let hash = JSON.stringify([a, n]);
    if (expandCache.has(hash)) return deepcopy(expandCache.get(hash));
    if (str === "1") return cacheResult(hash, limit(n));
    if (str === "0,1") return cacheResult(hash, Array(n).fill([]));
    if (a.length === 0) return [];
    if (n === 0) {
      for (let i = a.length - 2; i >= 0; i--) {
        if (lessThan(a[i + 1], a[i])) {
          return cacheResult(hash, a.slice(0, i + 1));
        }
      }
      return cacheResult(hash, a.slice(0, -1));
    }
    let out = [...a];
    let cutNode = out.pop();
    let cutIsSuccessor = isSuccessorInternal(cutNode);
    if (!cutIsSuccessor && version !== "1.2") {
      if (version === "1.1") {
        out.push(expandInternal(cutNode, n - 1));
      } else {
        out.push(expandInternal(cutNode, toStringFormatted(cutNode) === "0,1" ? n : n - 1));
      }
      return cacheResult(hash, out);
    }

    let parent = cutNode;
    let increment = 1;
    let rootIndex = out.findLastIndex((v) => lessThan(v, cutNode));
    let root = out[rootIndex];
    let badPart = [...out.slice(rootIndex)];
    if (cutIsSuccessor) {
      let predecessor = decrement(cutNode);
      badPart = [predecessor, ...out.slice(rootIndex + 1)];
      if (equal(root, predecessor)) {
        let zeroth = [...out];
        if (isSuccessorInternal(zeroth)) zeroth.pop();
        let begin = equal(zeroth, expandInternal(a, 0)) ? 0 : 1;
        for (let i = begin; i < n; i++) {
          out.push(...badPart);
        }
        if (isSuccessorInternal(out)) out.pop();
        return cacheResult(hash, out);
      }

      parent = searchForParent(root, predecessor);
      let indexRoot = findPrefixInExpansion(root, parent)[1];
      let indexPredecessor = findPrefixInExpansion(predecessor, parent)[1];
      increment = indexPredecessor - indexRoot;
    }
    for (let i = 1; i <= n; i++) {
      let copy = [...badPart].map((x, j) => {
        if (lessThan(x, parent)) {
          let [prefix, index] = findPrefixInExpansion(x, parent);
          let offset = cutIsSuccessor ? 0 : 1;
          let term = expandInternal(parent, index + increment * ((j === 0 ? i - 1 : i) + offset));
          let innerTerm = term;
          let innerPrefix = prefix;
          let innerX = x;
          while (innerX.length === innerPrefix.length && innerX.length > 0) {
            innerX = innerX[innerX.length - 1];
            innerPrefix = innerPrefix[innerPrefix.length - 1];
            innerTerm = innerTerm[innerTerm.length - 1];
            if (innerX == null || innerTerm == null || innerPrefix == null) break;
          }
          if (innerTerm == null) innerTerm = [];
          innerTerm.push(...innerX.slice(innerPrefix.length));
          return term;
        }
        return x;
      });
      out.push(...copy);
    }

    return cacheResult(hash, out);
  }

  function standardizePrSS(s) {
    let siblings = [];
    let current;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === 0) {
        current = [];
        siblings.push(current);
      }
      current.push(s[i]);
    }
    for (let i = 0; i < siblings.length; i++) {
      if (siblings[i].includes(1)) {
        siblings[i] = [0, ...standardizePrSS(siblings[i].slice(1).map((x) => x - 1)).map((x) => x + 1)];
      }
    }
    for (let i = siblings.length - 2; i >= 0; i--) {
      if (siblings[i] < siblings[i + 1]) {
        siblings.splice(i, 1);
      }
    }
    return siblings.flat();
  }

  function PrSStoCNF(s) {
    let out = "";
    let lastterm = "";
    let coefficient = 1;
    let root = 0;

    for (let i = 0; i <= s.length; i++) {
      if (s[i + 1] === s[0] || i + 1 >= s.length) {
        let branches = 0;
        for (let j = root + 1; j <= i; j++) {
          branches += s[j] === s[root + 1] ? 1 : 0;
        }

        let term =
          ["1", "ω"][i - root] ||
          (branches === 1 ? "ω^x" : "ω^(x)").replace("x", PrSStoCNF(s.slice(root + 1, i + 1))).replace(/\((\d+)\)/g, "$1");
        if (term === lastterm && i !== s.length) {
          coefficient += 1;
        } else {
          if (lastterm) {
            out += "+" + (coefficient === 1 ? lastterm : lastterm === "1" ? coefficient : lastterm + (lastterm === "ω" ? "" : "·") + coefficient);
          }
          lastterm = term;
          coefficient = 1;
        }
        root = i + 1;
      }
    }

    return out.substring(1);
  }

  // Fundamental Sequence engine interface
  function fs(ord, n) {
    if (ord === Limit) return getLimit(n);
    if (!Array.isArray(ord) || ord.length === 0) return [];
    return expandInternal(ord, n);
  }

  // Rank comparison for ordinal ordering
  function cmp(a, b) {
    if (a === Limit && b === Limit) return 0;
    if (a === Limit) return 1;
    if (b === Limit) return -1;
    return compareTerms(a, b);
  }

  // Check if ordinal is a successor
  function isSuccessor(ord) {
    if (ord === Limit || !Array.isArray(ord)) return false;
    return isSuccessorInternal(ord);
  }

  // Display modes handler
  function display(ord, mode) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";
    if (mode === "raw") {
      return JSON.stringify(ord);
    }
    if (mode === "pretty") {
      return toStringFormatted(ord);
    }
  }

  // Classify ordinals for visual styling
  function classifyOrdinal(ord) {
    if (ord === Limit) return "#ffffff";
    if (!Array.isArray(ord) || ord.length === 0) return "#808080";
    if (isSuccessorInternal(ord)) return "#a00000";
    if (ord.length === 1) return "#ffff00";
    return "#ffA000";
  }

  // Parser supporting alias lookup, nested arrays, and path address sequences
  function parse(str) {
    str = String(str).trim();
    if (str === "" || str === "0" || str === "∅") return Zero;
    if (str.toLowerCase() === "limit" || str.includes("ψ(Ω_ω)")) return Limit;

    for (const [aliasName, aliasVal] of Aliases) {
      if (str === aliasName) return aliasVal;
    }

    if (str.startsWith("path:")) {
      const numbers = str.replace("path:", "").split(",").map(Number);
      let current = Limit;
      for (let i = 0; i < numbers.length; i++) {
        if (isSuccessor(current)) break;
        current = fs(current, numbers[i]);
      }
      return current;
    }

    try {
      if (str.startsWith("[")) {
        return JSON.parse(str);
      }
    } catch (e) {
      // Fallback if parsing fails
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

  const config = { modes: [{ mode: 1, target: "both" }],SlowMode:true };
  const title = "Fundamental Sequence System Transfinite Number Line";

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
