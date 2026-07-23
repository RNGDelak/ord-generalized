/*
Notation : Worm (Ackermann Worm)
Limit : ω^ω
*/



window.notation = (() => {

//convert to readable ordinal
function pretty(ord) {
  if (ord.length == 0) return "0";

  let out = [];

  for (let i = 0; i < ord.length;) {
    const exp = ord[i];
    let j = i + 1;

    while (j < ord.length && ord[j] == exp) j++;

    const count = j - i;

    let term;
    if (exp == 0)
      term = "1";
    else if (exp == 1)
      term = "&omega;";
    else
      term = `&omega;<sup>${exp}</sup>`;

    if (count > 1)
      term += `&middot;${count}`;

    out.push(term);
    i = j;
  }

  return out.join("+");
}



  function fs(ord, n) {
    if (ord == Limit) return [n];

    ord = [...ord];

    const head = ord.pop();

    if (head > 0)
      for (let i = 0; i < n; i++)
        ord.push(head - 1);

    return ord;
  }

  function cmp(a, b) {
    if (a == Limit && b == Limit) return 0;
    if (a == Limit) return 1;
    if (b == Limit) return -1;

    const minLength = Math.min(a.length, b.length);

    for (let i = 0; i < minLength; i++)
      if (a[i] !== b[i])
        return a[i] < b[i] ? -1 : 1;

    if (a.length < b.length) return -1;
    if (a.length > b.length) return 1;
    return 0;
  }

  function isSuccessor(ord) {
    return ord !== Limit && ord.at(-1) == 0;
  }

  function display(ord, mode) {
    if (ord == Limit) return "Limit";
    if (ord.length == 0) return "0";
    if (mode == 'raw')
      return `(${ord.join(",")})`;
    if (mode == 'pretty')
      return pretty(ord)
  }

  function classifyOrdinal(ord) {
    if (ord == Limit) return "#ffffff";
    if (ord.length == 0) return "#808080";
    if (isSuccessor(ord)) return "#d40000";
    if (ord.at(-1) > 0) return "#ffd000"
    return "#ff8000";
  }

  function parse(str) {
    str = str.trim();
    if (str == "" || str == "0") return [];
    str = str.replace(/[()]/g, "");
    return str.split(",").map(Number);
  }

  const Zero = [];
  const Limit = "Limit";

  const DisplayName = ["raw","pretty"];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#d40000"],
    ["Limit Ordinal", "#ff8000"],
    ["Power of ω", "#ffd000"]
  ];

  const Aliases = [
    ["0", Zero],
    ["1", [0]],
    ["ω", [1]],
    ["ω²", [2]],
    ["ω^ω", Limit],
  ];

  const config = {mode:1};

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