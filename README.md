# A transfinite Number line where you can plugin and play!!

## How to use the transfinte number lines

- Tap/Mouse Scroll/Arrow keys to zoom and pan

- A/S to adjust rendering depth

- M to switch notation

- Shift/Cltr to slow and fasten the controls

## How to inject custom notation

importantly, you must have at least 4 functions and gettings all the constant ready

and apparently, YOU MUST WARP EVERYTHING INSIDE IIEF because if you expose it, some older modules have collision with yours and lead to unexcutable



```js
window.notation = (() => {

  // Smallest ordinal
  const Zero = [];

  // Largest value used by the explorer.
  // This must be accepted by fs(), cmp(), display(), etc.
  const Limit = "Limit";

  // -------------------------
  // Required Functions
  // -------------------------

  // Fundamental sequence
  // Returns the nth approximation of a limit ordinal.
  function fs(ord, n) {
    if (ord === Limit)
      return expandLimit(n);

    return expand(ord, n);
  }

  // Ordinal comparison
  //
  // Returns:
  //  -1 if a < b
  //   0 if a = b
  //   1 if a > b
  //
  // Must support the special value "Limit".
  function cmp(a, b) {

    if (a === Limit && b === Limit) return 0;
    if (a === Limit) return 1;
    if (b === Limit) return -1;

    return compare(a, b);
  }

  // Returns true iff ord is a successor ordinal.
  function isSuccessor(ord) {
    return ord.isSuccessor;
  }

  // Converts an ordinal into text.
  // HTML is allowed.
  function display(ord, mode) {

    if (mode === "Standard")
      return ord.toString();

    if (mode === "Pretty")
      return ord.toOrdinal();

  }

  // Determines the colour used on the number line.
  // Must return a hexadecimal colour.
  function classifyOrdinal(ord) {

    if (ord.isZero)
      return "#808080";

    if (ord.isSuccessor)
      return "#d40000";

    if (ord.isLimit)
      return "#ff8000";

  }

  // -------------------------
  // Display Settings
  // -------------------------

  // Names of every display mode.
  // These are passed to display().
  const DisplayName = [
    "Standard",
    "Pretty"
  ];

  // Legend shown in the UI.
  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#d40000"],
    ["Limit Ordinal", "#ff8000"]
  ];

  // These ordinal will appear with a labels with its
  const Aliases = [
    ["An important ordinal", ImportantOrdinal]
  ];

  // Reserved for future configuration options.
  const config = {
    types: "default"
  };

  // Title displayed by the explorer.
  const title = "My Transfinite Number Line";

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
```

and here a complete module (you can plug in and use)

```js
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

  const config = {};

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
```

