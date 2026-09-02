/*
Notation : Pointer Matrix Sequence
Limit : ψ(B(ω))
*/

window.notation = (() => {

  // Required Constants
  const Zero = [];
  const Limit = "Limit";

  // Milestones
  const Aliases = [
    ["0", Zero],
    ["1", [0]],
    ["ω", [0, 0, 1]],
    ["ω^ω", [0, 0, 1, 0, 2]],
    ["ε0", [0, 0, 0, 1]],
    ["φ(ω,0)", [0, 0, 0, 1, 0, 1, 2, 0, 3]],
    ["ψ(Ω2)", [0, 0, 0, 1, 0, 0, 2]],
    ["ψ(Ωω)", [0, 0, 0, 0, 1]],
    ["ψ(B(ω))", Limit]
  ];

  // Dynamic limit sequence generator for ψ(B(ω))
  function getLimit(num) {
    const res = [];
    for (let i = 0; i < num + 2; i++) {
      res.push(0);
    }
    res.push(1);
    return res;
  }

  function getColumnPos(ord) {
    const result = [0];
    let column = 0;

    for (let i = 0; i < ord.length - 1; i++) {
      if (ord[i] === column) {
        result.push(i + 1);
        column++;
      }
    }

    return result;
  }

  function getAscendMap(part, ordLen, partLen) {
    const map = [];
    let column = 0;

    for (let i = 0; i < part.length; i++) {
      map.push(part[i] >= column ? partLen : 0);

      if (part[i] === column + (ordLen - partLen)) {
        column++;
      }
    }
    return map;
  }

  function ascend(ord, ascendMap) {
    const result = [...ord];
    for (let i = 0; i < result.length; i++) {
      result[i] += ascendMap[i];
    }
    return result;
  }

  function setFirstColumn(part, ascendMap, head, rootColumn) {
    for (let i = 0; i < head.length - 2; i++) {
      if (part[i] === rootColumn) {
        part.splice(i, 0, head[i]);
        ascendMap.splice(i, 0, 0);
      } else {
        part[i] = head[i];
        ascendMap[i] = 0;
      }
    }
  }

  // Immutable Pointer Matrix Sequence Expansion Step
  function expand(ord, num) {
    if (!Array.isArray(ord) || ord.length === 0) return [];

    const copy = [...ord];
    const columnPos = getColumnPos(copy);
    if (columnPos.length === 0) return [];

    const lastColIdx = columnPos.pop();
    const head = copy.splice(lastColIdx);
    if (head.length <= 1) {
      return copy;
    }

    const top = head[head.length - 2];
    const rootIdx = columnPos.length - top - 1;
    if (rootIdx < 0 || rootIdx >= columnPos.length) {
      return copy;
    }

    const root = columnPos[rootIdx];
    const part = copy.slice(root);

    const ascendMap = getAscendMap(part, columnPos.length, top + 1);
    const rootColumn = columnPos.length - top - 1;

    setFirstColumn(part, ascendMap, head, rootColumn);

    for (let i = 0; i < num; i++) {
      copy.push(...ascend(part, ascendMap));
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
    const columnPos = getColumnPos(ord);
    if (columnPos.length === 0) return false;
    return ord.length - columnPos[columnPos.length - 1] <= 1;
  }

  // Stringify format e.g. :(0)(0,1)
  function pretty(ord) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";

    let str = ":";
    let pos = 0;
    let column = 0;

    for (let i = 0; i < ord.length; i++) {
      if (ord[i] === column) {
        str += `(${ord.slice(pos, i).join(",")})`;
        pos = i + 1;
        column++;
      }
    }

    if (pos < ord.length) {
      str += `(${ord.slice(pos).join(",")})`;
    }

    return str;
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
    if (isSuccessor(ord)) return "#d40000";
    if (ord.length === 1) return "#ffd000"; // Single element principal term
    return "#ff8000"; // Limit ordinal
  }

  // Parser supporting alias lookup, raw arrays, column format, and address sequences
  function parse(str) {
    str = String(str).trim();
    if (str === "" || str === "0") return Zero;
    if (str.toLowerCase() === "limit" || str.includes("ψ(B(")) return Limit;

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

    // 3. Formats like ":(0)(0,1)"
    if (str.startsWith(":")) {
      const matches = str.slice(1).match(/\((.*?)\)/g);
      if (matches) {
        const res = [];
        let column = 0;
        for (const match of matches) {
          const inner = match.slice(1, -1).trim();
          if (inner !== "") {
            const vals = inner.split(",").map(Number);
            res.push(...vals);
          }
          res.push(column);
          column++;
        }
        return res;
      }
    }

    // 4. Raw comma-separated numbers
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

  const config = { modes: [{ mode: 1, target: "both" }] };
  const title = "Pointer Matrix Sequence Transfinite Number Line";

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