/*
Notation : Hyper Sequence Hydra
Limit : ψ(T[1[0]<ω>0])
*/

window.notation = (() => {

  // --- Constants & Limit ---

  const Zero = [];
  const Limit = "Limit";

  const DisplayName = ["normal", "hydra"];

  const config = {};

  const title = "Hyper Sequence Hydra transfinite number line";

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#d40000"],
    ["Limit Ordinal", "#ff8000"],
    [">ε", "#ffd000"],
    [">psd", "#0fff00"],
    [">Collapsing I", "#00fff0"]
  ];

  const Aliases = [
    ["0", []],
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

  // --- Core Notation Logic (Untouched) ---

  function unparse(ord) {
    let offset = 0;

    const hydra = ord.map((i) => {
      offset += i === 0 ? -1 : 1;
      return i === 0 ? ")" : `(${i - 1}`;
    });

    return `:${hydra.join("")}` + ")".repeat(offset);
  }

  function isZero(ord) {
    return ord.length === 0;
  }

  function isSucc(ord) {
    return getParent(ord.slice(0, -1)) < 0;
  }

  function rank(a, b) {
    const minLength = Math.min(a.length, b.length);

    for (let i = 0; i < minLength; i++) {
      if (a[i] !== b[i]) return a[i] > b[i];
    }

    return a.length > b.length;
  }

  function getLimit(num) {
    return fill([], num, (i) => [(i * (i + 1)) / 2 + 1]);
  }

  function fill(ord, num, func) {
    for (let i = 0; i < num; i++) {
      ord.push(...func(i));
    }
    return ord;
  }

  function ascend(ord, map) {
    for (let i = 0; i < ord.length; i++) {
      ord[i] += map[i];
    }
    return ord;
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
      count += ord[root] === 0 ? 1 : -1;
    } while (root >= 0 && count > 0);
    return root;
  }

  function getSubParent(ord, head, root) {
    while (ord[root] >= head) {
      root = getParent(ord, root);
    }
    return root;
  }

  function search(ord, offset, root) {
    let mark = root;
    do {
      root = mark;
      mark = getSubParent(ord, ord[root], root);
    } while (ord[root] - ord[mark] >= offset);
    return root;
  }

  function expand(ord, num) {
    const head = ord.pop();
    const parent = getParent(ord);

    if (parent >= 0) {
      if (head === 1) {
        const part = ord.slice(parent);
        part.unshift(0);

        fill(ord, num, () => part);
      } else {
        const subParent = getSubParent(ord, head, parent);
        const type = head - ord[subParent];

        const root = type > 1 ? search(ord, type, subParent) : subParent;

        const part = ord.slice(root);
        const offset = head - ord[root] - 1;
        const map = getMap(part, offset);

        fill(ord, num, () => ascend([...part], map));
      }
    }

    while (ord.at(-1) === 0) {
      ord.pop();
    }
    return ord;
  }

  // --- Module Interface Wrappers ---

  function fs(ord, n) {
    if (ord === Limit) return getLimit(n);
    if (!ord || ord.length === 0) return [];

    return expand([...ord], n);
  }

  function cmp(a, b) {
    if (a === Limit && b === Limit) return 0;
    if (a === Limit) return 1;
    if (b === Limit) return -1;

    if (rank(a, b)) return 1;
    if (rank(b, a)) return -1;
    return 0;
  }

  function isSuccessor(ord) {
    if (ord === Limit || !ord || ord.length === 0) return false;
    return isSucc(ord);
  }

  function display(ord, mode) {
    if (ord === Limit) return "Limit";
    if (!ord || ord.length === 0) return "0";

    if (mode === "hydra") {
      return unparse(ord);
    }
    return `(${ord.join(",")})`;
  }

  function classifyOrdinal(ord) {
    if (ord === Limit) return "#00fff0";
    if (!ord || ord.length === 0) return "#808080";
    if (isSuccessor(ord)) return "#d40000";

    const max = Math.max(...ord);
    if (max <= 1) return "#ff8000";
    if (max === 2) return "#ffd000";
    if (max === 3) return "#0fff00";
    return "#00fff0";
  }

  function parse(str) {
    if (typeof str !== "string") return str;
    str = str.trim();
    if (str === "" || str === "0") return [];
    if (str === "Limit") return Limit;

    str = str.replace(/[()[\]]/g, "").trim();
    if (!str) return [];
    return str.split(",").map(s => Number(s.trim()));
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