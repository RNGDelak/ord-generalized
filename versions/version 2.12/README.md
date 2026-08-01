# A transfinite Number line where you can edits and play!


## How to use the transfinte number lines

- Arrow keys / mouse drag &amp; wheel to control

- A/S to adjust rendering depth

- M to toggle Mathstick Mode

- Z to toggle Zoom into Mouse

- D to toggle diagonal tick arrangement

- H to toggle harmonic interval spacing (lag fixes)

- F to toggle ordinal finder (for some notation wih a parser)

- G to toggle set viewport state

- I to show viewport state

- L to lock screen (disable interactions) 


- Ctrl/Shift to adjust sensivity of arrow key controls

- Shift+S to Enter/Exit Slow Mode

- Open Config Menu for further configurations

## How to inject custom notation

importantly, you must have at least 4 functions : fs,cmp,isSuccessor and display

**and apparently, for any error cases, try to warp everything into a single IIEF since overlapping name likely to cause the problem**

and here a complete module (you can plug in and use)

```js
/*
Notation : Worm (Ackermann Worm)
Limit : ω^ω
*/

window.notation = (() => {

//convert to readable ordinal. you should put your heper into there
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


  //Impportant: without this the program wont be able to render the number line
  function fs(ord, n) {
    if (ord == Limit) return [n];

    ord = [...ord];

    const head = ord.pop();

    if (head > 0)
      for (let i = 0; i < n; i++)
        ord.push(head - 1);

    return ord;
  }

  //Important : etablish the well orderness of the number line.
  //without this, the number line will rather messy(no broken)
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

  //Important : handle for successor ordinal or it will literally take the successor fs's
  function isSuccessor(ord) {
    return ord !== Limit && ord.at(-1) == 0;
  }

  //Important : let the program display your ordinal in texts (you can add html tags too!)
  function display(ord, mode) {
    if (ord == Limit) return "Limit";
    if (ord.length == 0) return "0";
    if (mode == 'raw')
      return `(${ord.join(",")})`;
    if (mode == 'pretty')
      return pretty(ord)
  }

  //optional: if you can't implement this, just return return "#808080" or nay color you like
  function classifyOrdinal(ord) {
    if (ord == Limit) return "#ffffff";
    if (ord.length == 0) return "#808080";
    if (isSuccessor(ord)) return "#d40000";
    if (ord.at(-1) > 0) return "#ffd000"
    return "#ff8000";
  }

  //optional: if you dont have this, just leave empty and dont return this in the end of IIEF (this will ler the program know you don't implement this)
  function parse(str) {
    str = str.trim();
    if (str == "" || str == "0") return [];
    str = str.replace(/[()]/g, "");
    return str.split(",").map(Number);
  }

  //Required Constants
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

  const config = {mode:[1]};//you must put an array of number represents the orders of notations incase you want a starting notation. look for configs for more 

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

