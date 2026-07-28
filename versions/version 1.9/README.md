# A transfinite Number line where you can plugin and play!

## How to use the transfinte number lines

- Tap/Mouse Scroll/Arrow keys to zoom and pan

- A/S to adjust rendering depth

- M to switch notation

- Shift/Cltr to slow and fasten the controls

## How to inject custom notation

importantly, you must have at least 4 functions and gettings all the constant ready

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

