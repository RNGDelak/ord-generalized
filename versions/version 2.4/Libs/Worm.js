/*
Notation : Worm (Ackermann Worm)
Limit : ω^ω
*/

window.notation = (() => {

  // --------------------------
  // Pretty printer
  // --------------------------

  function pretty(ord) {
    if (ord.length == 0) return "0";

    return ord.map(([exp, coef]) => {
      let term;

      if (exp == 0) {
        term = coef == 1 ? "1" : `${coef}`;
      } else if (exp == 1) {
        term = "&omega;";
        if (coef > 1) term += `&middot;${coef}`;
      } else {
        term = `&omega;<sup>${exp}</sup>`;
        if (coef > 1) term += `&middot;${coef}`;
      }

      return term;
    }).join("+");
  }

  // --------------------------
  // Fundamental sequence
  // --------------------------

  function fs(ord, n) {
    if (ord == Limit)
      return [[n, 1]];

    ord = ord.map(x => [...x]);

    let [exp, coef] = ord.pop();

    if (coef > 1)
      ord.push([exp, coef - 1]);

    if (exp > 0 && n > 0)
      ord.push([exp - 1, n]);

    return ord;
  }

  // --------------------------
  // Comparison
  // --------------------------

  function cmp(a, b) {
    if (a == Limit && b == Limit) return 0;
    if (a == Limit) return 1;
    if (b == Limit) return -1;

    let ia = 0, ib = 0;
    let ra = 0, rb = 0;

    while (ia < a.length && ib < b.length) {

      const ea = a[ia][0];
      const eb = b[ib][0];

      if (ea != eb)
        return ea < eb ? -1 : 1;

      if (ra == 0) ra = a[ia][1];
      if (rb == 0) rb = b[ib][1];

      const m = Math.min(ra, rb);

      ra -= m;
      rb -= m;

      if (ra == 0) ia++;
      if (rb == 0) ib++;
    }

    if (ia == a.length && ib == b.length)
      return 0;

    return ia == a.length ? -1 : 1;
  }

  // --------------------------
  // Successor test
  // --------------------------

  function isSuccessor(ord) {
    return ord !== Limit &&
      ord.length > 0 &&
      ord.at(-1)[0] == 0;
  }

  // --------------------------
  // Display
  // --------------------------

  function display(ord, mode) {

    if (ord == Limit)
      return "Limit";

    if (ord.length == 0)
      return "0";

    if (mode == "raw")
      return "[" + ord.map(([e, c]) => `[${e},${c}]`).join(",") + "]";

    if (mode == "pretty")
      return pretty(ord);

    return "";
  }

  // --------------------------
  // Coloring
  // --------------------------

  function classifyOrdinal(ord) {

    if (ord == Limit)
      return "#ffffff";

    if (ord.length == 0)
      return "#808080";

    if (isSuccessor(ord))
      return "#d40000";

    if (ord.at(-1)[0] > 0)
      return "#ffd000";

    return "#ff8000";
  }

  // --------------------------
  // Parser
  //
  // Format:
  // [2,3],[1,5],[0,8]
  // or
  // 2,3;1,5;0,8
  // --------------------------

  function parse(str) {

    str = str.trim();

    if (str == "" || str == "0")
      return [];

    str = str.replace(/\s+/g, "");

    let pairs = str.match(/\d+,\d+/g);

    if (!pairs)
      return [];

    return pairs.map(s => {
      const [e, c] = s.split(",").map(Number);
      return [e, c];
    });
  }

  // --------------------------
  // Constants
  // --------------------------

  const Zero = [];
  const Limit = "Limit";

  const DisplayName = [
    "raw",
    "pretty"
  ];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#d40000"],
    ["Limit Ordinal", "#ff8000"],
    ["Power of ω", "#ffd000"]
  ];

  const Aliases = [
    ["0", Zero],
    ["1", [[0,1]]],
    ["2", [[0,2]]],
    ["ω", [[1,1]]],
    ["ω·2", [[1,2]]],
    ["ω²", [[2,1]]],
    ["ω³", [[3,1]]],
    ["ω^ω", Limit],
  ];

  const config = {
    modes: [1]
  };

  const title = "Worm transfinite number line";

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