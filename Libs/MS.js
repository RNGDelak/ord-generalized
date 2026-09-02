/*
Notation : Matrix Sequence
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
    const res = [0];
    for (let i = 0; i < num + 1; i++) {
      res.push(1);
    }
    res.push(0);
    return res;
  }

  function item(col, index) {
    return col[index] ?? 0;
  }

  function getColumn(ord, root, step) {
    do {
      root += step;
    } while (root > 0 && root <= ord.length && item(ord, root - 1) > 0);
    return root;
  }

  function ascendColumn(ord, root, ascendMap) {
    for (let i = 0; item(ascendMap, i) > 0; i++) {
      if (item(ord, root + i) === 0 && ascendMap[i] > 0) {
        ord.splice(root + i, 0, 0);
      }
      ord[root + i] += ascendMap[i];
    }
  }

  function ascend(ord, ascendMap) {
    let root = 0;
    let ascRoot = 0;
    do {
      ascendColumn(ord, root, ascendMap.slice(ascRoot));
      root = getColumn(ord, root, 1);
      ascRoot = getColumn(ascendMap, ascRoot, 1);
    } while (root < ord.length);
    return ord;
  }

  function updHead(head, column) {
    for (let i = 0; i < head.length - 1; i++) {
      if (head[i] <= item(column, i)) return true;
      head[i] = item(column, i);
    }
    return false;
  }

  function search(ord, head) {
    let root = ord.length;
    let column = [];
    do {
      const mark = getColumn(ord, root, -1);
      column = ord.slice(mark, root);
      root = mark;
    } while (root > 0 && updHead(head, column));
    return [root, column];
  }

  function getOffsetArray(head, root) {
    const offset = [];
    for (let i = 0; i < head.length - 2; i++) {
      offset.push(head[i] - item(root, i));
    }
    offset.push(0);
    return offset;
  }

  function addMapColumn(map, count, offset, column, rootColumn) {
    for (let i = 0; i < offset.length - 1; i++) {
      if (item(column, i - 1) < count[i]) {
        count[i] = 0;
      }
      if (item(column, i) <= item(rootColumn, i)) {
        count[i] = item(column, i - 1);
      }
      if (count[i] > 0) break;
      map.push(offset[i]);
    }
    map.push(0);
  }

  function getAscendMap(ord, rootColumn, offset) {
    let count = Array(offset.length).fill(0);
    let root = rootColumn.length;
    const map = [...offset];

    while (root < ord.length) {
      const mark = getColumn(ord, root, 1);
      const column = ord.slice(root, mark);
      root = mark;

      addMapColumn(map, count, offset, column, rootColumn);
    }

    return map;
  }

  // Immutable Matrix Sequence Expansion Step
  function expand(ord, num) {
    if (!Array.isArray(ord) || ord.length === 0) return [];

    const copy = [...ord];
    const headColIdx = getColumn(copy, copy.length, -1);
    const head = copy.splice(headColIdx);

    if (head.length > 1) {
      const [root, column] = search(copy, [...head]);
      const part = copy.slice(root);

      const offset = getOffsetArray(head, column);
      const ascendMap = getAscendMap(part, column, offset);

      for (let i = 0; i < num; i++) {
        copy.push(...ascend([...part], ascendMap));
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
      if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
    }

    if (a.length < b.length) return -1;
    if (a.length > b.length) return 1;
    return 0;
  }

  // Check if ordinal is a successor
  function isSuccessor(ord) {
    if (ord === Limit || !Array.isArray(ord) || ord.length === 0) return false;
    return (
      ord[ord.length - 1] === 0 &&
      (ord.length < 2 || ord[ord.length - 2] === 0)
    );
  }

  // Stringify format e.g. :(0,1)(2)
  function pretty(ord) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";

    let str = ":";
    let pos = 0;

    for (let i = 0; i < ord.length; i++) {
      if (ord[i] === 0) {
        str += `(${ord.slice(pos + 1, i).join(",")})`;
        pos = i;
      }
    }

    if (pos < ord.length - 1) {
      str += `(${ord.slice(pos + 1).join(",")})`;
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
    if (ord.length === 1) return "#ffd000"; // Single head principal term
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

    // 3. Formats like ":(1,1)(2)"
    if (str.startsWith(":")) {
      const matches = str.slice(1).match(/\((.*?)\)/g);
      if (matches) {
        const res = [];
        for (const match of matches) {
          res.push(0);
          const inner = match.slice(1, -1).trim();
          if (inner !== "") {
            const vals = inner.split(",").map(Number);
            res.push(...vals);
          }
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
  const title = "Matrix Sequence Transfinite Number Line";

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