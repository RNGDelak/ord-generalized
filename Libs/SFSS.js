/*
Notation : SFSS
Limit : psi_0(psd.I++/;b)
*/

window.notation = (() => {

  const Zero = [];
  const Limit = []; // Represented structurally as [] for top-level, or handled via expandLimit

  const DisplayName = ["Brackets", "Ordinals", "Paths"];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#d40000"],
    ["Limit Ordinal", "#ff8000"],
    ["Power of ω", "#ffd000"],
    ["Tower of ω", "#ffffff"],
    ["ε Ordinal", "#0fff00"],
    ["Veblen Ordinal", "#00fff0"]
  ];

  const Aliases = [
    ["[0,1,ω]", "ε₀"],
    ["[0,1,ω,ω]", "ε₁"],
    ["[0,1,ω,ω,ω]", "ε₂"],
    ["[0,1,ω,ω+1]", "ε_ω"],
    ["[0,1,ω,ω2]", "ζ₀"],
    ["[0,1,ω,ω2,ω2]", "η₀"],
    ["[0,1,ω,ω2,ω3]", "Γ₀"],
    ["[0,1,ω,ω2,ω3,ω4]", "LVO"]
  ];

  // Global settings configuration matching user preferences
  const settings = {
    notation: "Ordinals",
    showOrdinals: true,
    showCommas: true
  };

  //there a different here
  const config = {
    types: "custom",
    aspectratio: 0.2,
    SlowMode: true,
    SlowModeTickSpacing: 50
  };

  const title = "Strong Fundamental Sequence System Transfinite Number Line";

  // Core SFSS Engine Helpers
  function compareTerms(a, b) {
    for (let i = 0; i < a.length; i++) {
      if (i >= b.length) return 1; // a > b
      let c = compareTerms(a[i], b[i]);
      if (c != 0) return c;
    }
    return b.length > a.length ? -1 : 0;
  }

  function cmp(a, b) {
    return compareTerms(a, b);
  }

  function isSuccessor(array) {
    let s = toString(array);
    return s.length == 0 || s.endsWith("[]");
  }

  const cache = new Map();
  function expand(a, n) {
    if (a.length == 0) return [];
    if (n == 1) return a.slice(0, -1);
    const hash = toString(a) + "|" + n;
    if (cache.has(hash)) return cache.get(hash);

    const cutNode = a.at(-1);
    const parentIndex = a.findLastIndex(v => lessThan(v, cutNode));
    if (isSuccessor(cutNode)) {
      const out = a.slice(0, parentIndex);
      const tail = a.slice(parentIndex, -1);
      for (let i = 0; i < n; i++) out.push(...tail);
      cache.set(hash, out);
      return out;
    }

    const ancestor = getAncestor(a);
    const rootIndex = getRootIndex(a, ancestor, parentIndex);
    const cutNodePath = getPath(ancestor, cutNode);
    const rootNodePath = getPath(ancestor, a[rootIndex]);
    const ascendingIndex = rootNodePath.findIndex((x, i) => i >= cutNodePath.length || x < cutNodePath[i]);

    if (n == 0) {
      const out = a.slice(0, rootIndex);
      cache.set(hash, out);
      return out;
    }

    const tail = a.slice(rootIndex, -1);
    const paths = tail.map(x => lessThan(x, ancestor) ? getPath(ancestor, x) : []);
    const increment = ascendingIndex >= cutNodePath.length ? 1 : cutNodePath[ascendingIndex] - rootNodePath[ascendingIndex];
    const out = a.slice(0, -1);
    for (let i = 1; i < n; i++) {
      const offsets = [];
      let parentPathLengthIncreases = [];
      const copy = [];
      tail.forEach((v, j) => {
        parentPathLengthIncreases.push(0);
        if (paths[j].length <= ascendingIndex) return copy.push(v);
        for (let k = 0; k < ascendingIndex; k++) {
          if (paths[j][k] != rootNodePath[k]) return copy.push(v);
        }

        const newPath = [...paths[j]];
        newPath[ascendingIndex] += increment * i;
        for (let k = 0; k < offsets.length; k++) {
          if (ascendingIndex + 1 + k >= newPath.length) break;
          newPath[ascendingIndex + 1 + k] += offsets[k];
        }
        if (j == 0 && newPath.length > ascendingIndex + 1) {
          const ascendedParent = out[parentIndex + tail.length * (i - 1)];
          const parentPath = getPath(ancestor, ascendedParent);
          let newValue = applyPath(ancestor, newPath.slice(0, ascendingIndex + 1));
          for (let k = ascendingIndex + 1; k < newPath.length; k++) {
            [newPath[k], newValue] = firstGreaterInExpansion(newValue, ascendedParent, newPath[k], k == newPath.length - 1);
            offsets.push(newPath[k] - paths[j][k]);
          }
        }
        copy.push(applyPath(ancestor, newPath));
      });
      out.push(...copy);
    }
    cache.set(hash, out);
    return out;
  }

  function fs(ord, n) {
    if (ord.length === 0) return limit(n + 1);
    return expand(ord, n + 1);
  }

  function lessOrEqual(a, b) { return compareTerms(a, b) <= 0; }
  function lessThan(a, b) { return compareTerms(a, b) === -1; }
  function equal(a, b) { return compareTerms(a, b) === 0; }

  function toString(array) {
    return JSON.stringify(array).slice(1, -1).replaceAll(/,/g, "");
  }

  function fromString(s) {
    return JSON.parse("[" + s.replaceAll(/\]\[/g, "],[") + "]");
  }

  function getGreaterLimit(cutNode) {
    for (let i = 2; ; i++) {
      const term = limit(i);
      if (lessThan(cutNode, term)) return term;
      term.push(term.at(-1));
      if (lessThan(cutNode, term)) return term;
    }
  }

  function firstGreaterInExpansion(ancestor, target, startIndex = 0, successorAllowed = true) {
    let index = startIndex;
    while (true) {
      const value = expand(ancestor, index);
      if (lessThan(target, value) && (successorAllowed || !isSuccessor(value))) return [index, value];
      index++;
    }
  }

  function getAncestor(sequence) {
    const cutNode = sequence.at(-1);
    const greaterLimit = getGreaterLimit(cutNode);
    let ancestor = greaterLimit;
    const cutNodePath = getPath(greaterLimit, cutNode);
    const parentIndex = sequence.findLastIndex(v => lessThan(v, cutNode));
    while (!isSuccessor(ancestor)) {
      let rootIndex = parentIndex;
      const newCutNodePath = getPath(ancestor, cutNode);
      while (getPath(ancestor, sequence[rootIndex]).length <= newCutNodePath.length && lessThan([], sequence[rootIndex])) {
        rootIndex = sequence.findLastIndex((x, j) => j < rootIndex && lessThan(x, sequence[rootIndex]));
      }
      const rootNodePath = getPath(ancestor, sequence[rootIndex]);
      if (rootNodePath.length > newCutNodePath.length) {
        for (let i = 0; i < newCutNodePath.length - 1; i++) {
          if (rootNodePath[i] == newCutNodePath[i]) {
            ancestor = expand(ancestor, rootNodePath[i]);
          } else {
            break;
          }
        }
        return ancestor;
      }
      ancestor = firstGreaterInExpansion(ancestor, cutNode)[1];
    }
    return applyPath(greaterLimit, cutNodePath.slice(0, -1));
  }

  function getRootIndex(sequence, ancestor, parentIndex) {
    let rootIndex = parentIndex;
    const cutNodePath = getPath(ancestor, sequence.at(-1));
    while (getPath(ancestor, sequence[rootIndex]).length <= cutNodePath.length && lessThan([], sequence[rootIndex])) {
      rootIndex = sequence.findLastIndex((x, j) => j < rootIndex && lessThan(x, sequence[rootIndex]));
    }
    return rootIndex;
  }

  function applyPath(term, path) {
    for (let i of path) term = expand(term, i);
    return term;
  }

  function getPath(ancestor, target) {
    for (let i = 0; ; i++) {
      const term = expand(ancestor, i);
      if (equal(target, term)) {
        return [i];
      } else if (lessThan(target, term)) {
        return [i, ...getPath(term, target)];
      }
    }
  }

  function limit(n) {
    if (n == 0) return [];
    const out = [];
    for (let i = 0; i < n; i++) out.push(limit(i));
    return out;
  }

  function standardizePrSS(s) {
    if (s.length == 0 || s[0] != 0) return s;
    let siblings = [];
    let current;
    for (let i = 0; i < s.length; i++) {
      if (s[i] == 0) {
        current = [];
        siblings.push(current);
      }
      current.push(s[i]);
    }
    for (let i = 0; i < siblings.length; i++) {
      if (siblings[i].includes(1)) {
        siblings[i] = [0, ...standardizePrSS(siblings[i].slice(1).map(x => x - 1)).map(x => x + 1)];
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
      if ((s[i + 1] === s[0]) || (i + 1 >= s.length)) {
        let branches = 0;
        for (let j = root + 1; j <= i; j++) {
          branches += s[j] === s[root + 1] ? 1 : 0;
        }

        let term = ["1", "ω"][i - root] || (branches === 1 ? "ω^x" : "ω^(x)").replace("x", PrSStoCNF(s.slice(root + 1, i + 1))).replace(/\((\d+)\)/g, "$1");
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

  function convertToNotation(value, useDefault = false) {
    if (value == "") return "∅";
    if (settings.notation == "Brackets" && !useDefault) return value;

    const substitute = (s) => {
      s = s.replaceAll(/\[\]/g, "0");
      if (!settings.showOrdinals) return s;
      s = s.replaceAll(/\[0[0-9,]*\]/g, (x) => {
        let a = JSON.parse(x);
        for (let i = a.length - 2; i > 0; i--) {
          if (a[i] == a[i - 1] && a[i + 1] > a[i]) {
            a.splice(i, 1);
          }
        }
        for (let i = 1; i < a.length; i++) {
          if (a[i] - a[i - 1] > 1) return JSON.stringify(a);
        }
        return PrSStoCNF(standardizePrSS(a));
      });
      for (let x of Aliases) s = s.replaceAll(x[0], x[1]);
      return s;
    };

    const defaultConvert = (v) => {
      let s = v.replaceAll(/\]\[/g, "],[").replaceAll(/\[\]/g, "0");
      while (true) {
        let next = s.replaceAll(/\[([0,]+)\]/g, (_, n) => `${(n.length + 1) / 2}`);
        if (next == s) break;
        s = next;
      }
      return substitute(s);
    };
    const convertSequence = (sequence) => substitute("[" + defaultConvert(toString(sequence)) + "]");

    let s = defaultConvert(value);
    if (settings.notation == "Paths" && !useDefault) {
      const sequence = fromString(value);
      const cutNode = sequence.at(-1);
      if (lessThan([], cutNode)) {
        const ancestor = getAncestor(sequence);
        const fromPath = (path) => convertSequence(ancestor) + "[" + path.join("][") + "]";
        const parentIndex = sequence.findLastIndex(v => lessThan(v, cutNode));
        const rootIndex = getRootIndex(sequence, ancestor, parentIndex);
        const strings = sequence.map((x, i) => {
          if (lessThan(x, ancestor) && i >= rootIndex) return fromPath(getPath(ancestor, x));
          return convertSequence(x);
        });
        s = strings.join(",");
      }
    }

    return settings.showCommas ? s : s.replaceAll(",", " ");
  }

  function display(ord, mode) {
    if (ord.length === 0) return "0";
    settings.notation = mode || "Ordinals";
    return convertToNotation(toString(ord));
  }

  function classifyOrdinal(ord) {
    if (ord.length === 0) return "#808080";
    if (isSuccessor(ord)) return "#d40000";
    return "#ff8000";
  }

  function parse(str) {
    str = str.trim();
    if (str === "" || str === "0" || str === "∅") return [];
    try {
      if (str.startsWith("[")) return JSON.parse(str);
      return fromString(str);
    } catch {
      return [];
    }
  }

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