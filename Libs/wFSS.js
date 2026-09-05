/*
Notation : Weak Fundamental Sequence System
Limit : Limit
*/

window.notation = (() => {

  // Required Constants
  const Zero = [];
  const Limit = "Limit";

  // Milestones
  const Aliases = [
    ["0", Zero],
    ["1", [[]]],
    ["ω", [[],[[]]]],
    ["ω^2", [[],[[]],[],[[]]]],
    ["ω^ω", [[],[[]],[[]]]],
    ["ω^ω^ω", [[],[[]],[[]],[[]]]],
    ["ε0", [[],[[]],[[],[[]]]]],
    ["Limit", Limit]
  ];

  function compareTerms(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return 0;
    for (let i = 0; i < a.length; i++) {
      if (i >= b.length) return 1;
      let c = compareTerms(a[i], b[i]);
      if (c !== 0) return c;
    }
    return b.length > a.length ? -1 : 0;
  }

  function lessOrEqual(a, b) {
    return compareTerms(a, b) <= 0;
  }

  function lessThan(a, b) {
    return compareTerms(a, b) === -1;
  }

  function equal(a, b) {
    return compareTerms(a, b) === 0;
  }

  function isSuccessor(array) {
    if (!Array.isArray(array)) return false;
    let s = rawToString(array);
    return s.length === 0 || s.endsWith("[]");
  }

  function rawToString(array) {
    return JSON.stringify(array).slice(1, -1).replace(/,/g, "");
  }

  function limit(n) {
    if (n === 0) return [];
    if (n === 1) return [[]];
    let out = [];
    for (let i = 0; i < n; i++) out.push(limit(i));
    return out;
  }

  function expandLimit(n) {
    return limit(n + 1);
  }

  function expand(a, n) {
    if (!Array.isArray(a) || a.length === 0) return [];
    let str = rawToString(a);
    let out = JSON.parse(JSON.stringify(a));
    let cutNode = out.pop();
    let isLim = !isSuccessor(cutNode);

    if (str === "[][]") return Array(n).fill([]);
    if (n === 0) {
      for (let i = a.length - 2; i >= 0; i--) {
        if (lessThan(a[i + 1], a[i])) {
          return a.slice(0, i + 1);
        }
      }
      return a.slice(0, -1);
    }

    let rootIndex = -1;
    for (let i = out.length - 1; i >= 0; i--) {
      if (lessThan(out[i], cutNode)) {
        rootIndex = i;
        break;
      }
    }

    if (rootIndex === -1) {
      return out;
    }

    if (isLim) {
      let copyPart = out.slice(rootIndex + 1);
      let index = 0;
      while (lessOrEqual(expand(cutNode, index), out[rootIndex])) {
        index++;
      }
      for (let i = index; i < index + n; i++) {
        out.push(expand(cutNode, i));
        out.push(...JSON.parse(JSON.stringify(copyPart)));
      }
      return out;
    }

    let badPart = out.slice(rootIndex);
    let zeroth = JSON.parse(JSON.stringify(out));
    if (isSuccessor(zeroth)) zeroth.pop();
    let begin = equal(zeroth, expand(a, 0)) ? 0 : 1;
    for (let i = begin; i < n; i++) {
      out.push(...JSON.parse(JSON.stringify(badPart)));
    }
    if (isSuccessor(out)) out.pop();
    return out;
  }

  function standardizePrSS(s) {
    if (s.length === 0 || s[0] !== 0) return s;
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
          (branches === 1 ? "ω^x" : "ω^(x)")
            .replace("x", PrSStoCNF(s.slice(root + 1, i + 1)))
            .replace(/\((\d+)\)/g, "$1");
        if (term === lastterm && i !== s.length) {
          coefficient += 1;
        } else {
          if (lastterm) {
            out +=
              "+" +
              (coefficient === 1
                ? lastterm
                : lastterm === "1"
                ? coefficient
                : lastterm + (lastterm === "ω" ? "" : "·") + coefficient);
          }
          lastterm = term;
          coefficient = 1;
        }
        root = i + 1;
      }
    }

    return out.substring(1);
  }

  function convertToNotation(value) {
    if (value === "") return "∅";
    let s = value.replace(/\]\[/g, "],[").replace(/\[\]/g, "0");
    while (true) {
      let next = s.replace(/\[([0,]+)\]/g, (_, n) => `${(n.length + 1) / 2}`);
      if (next === s) break;
      s = next;
    }
    s = s.replace(/\[0[0-9,]*\]/g, function (x) {
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
    s = s.replace("[0,1,ω]", "ε₀");
    s = s.replace("[0,1,ω,ω]", "ε₁");
    s = s.replace("[0,1,ω,ω,ω]", "ε₂");
    s = s.replace("[0,1,ω,ω+1]", "ε_ω");
    s = s.replace("[0,1,ω,ω2]", "ε_ε₀");
    s = s.replace("[0,1,ω,ω2,ω3]", "ε_ε_ε₀");
    s = s.replace("[0,1,ω,ω^2]", "ζ₀");
    s = s.replace("[0,1,ω,ω^2,ω^3]", "η₀");
    s = s.replace("[0,1,ω,ω^ω]", "φ(ω,0)");
    return s;
  }

  // Fundamental Sequence
  function fs(ord, n) {
    if (ord === Limit) return expandLimit(n);
    if (!Array.isArray(ord) || ord.length === 0) return [];
    return expand(ord, n);
  }

  // Comparison function
  function cmp(a, b) {
    if (a === Limit && b === Limit) return 0;
    if (a === Limit) return 1;
    if (b === Limit) return -1;
    return compareTerms(a, b);
  }

  // Check if ordinal is a successor
  function checkSuccessor(ord) {
    if (ord === Limit || !Array.isArray(ord) || ord.length === 0) return false;
    return isSuccessor(ord);
  }

  // Format ordinal to string
  function pretty(ord) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";
    return convertToNotation(rawToString(ord));
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
    if (checkSuccessor(ord)) return "#a00000";
    return "#ffa000"; // Limit ordinal
  }

  // Parser supporting alias lookup, raw arrays, bracket structures, and address sequences
  function parse(str) {
    str = String(str).trim();
    if (str === "" || str === "0") return Zero;
    if (str.toLowerCase() === "limit") return Limit;

    // 1. Alias lookup
    for (const [aliasName, aliasVal] of Aliases) {
      if (str === aliasName) return aliasVal;
    }

    // 2. Fundamental Sequence address path: e.g. "path: 2,6,2,8,1"
    if (str.startsWith("path:")) {
      const numbers = str.replace("path:", "").split(",").map(Number);
      let current = Limit;
      for (let i = 0; i < numbers.length; i++) {
        if (checkSuccessor(current)) break;
        current = fs(current, numbers[i]);
      }
      return current;
    }

    // 3. Bracket structure JSON parse attempt
    try {
      if (str.startsWith("[")) {
        return JSON.parse(str);
      }
    } catch (e) {}

    return Zero;
  }

  const DisplayName = ["raw", "pretty"];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#a00000"],
    ["Limit Ordinal", "#ffa000"]
  ];

  const config = { modes: [{ mode: 1, target: "both" }],MaxIntervalDepth:0 };
  const title = "Weak Fundamental Sequence System Transfinite Number Line";

  return {
    fs,
    cmp,
    isSuccessor: checkSuccessor,
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
