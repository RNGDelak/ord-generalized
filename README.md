# Ord-Generalized

## About this project


Interactive transfinite number line where you can plug-in your own and play!

Link: https://rngdelak.github.io/ord-generalized

Here's some "Landscapes"
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/4b539daa-c723-488d-85e4-6c2f2649d2c9" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/9a5950ac-e29e-49ce-bf0b-3de6e62ea6b4" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/41d91047-bdcb-4889-b3d2-d42a2ec46bf4" />

An demo of using slow mode (compatible for slow notation)
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/3ec67825-1aa2-456f-8dc7-df4b1cc895b3" />


## Features

- Interactive navigation
- Plugin-based notation system
- MathStick Mode
- Ordinal Finder
- Rendering optimizations
- Highly adaptive across devices


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
    if (ord.length === 0) return "0";

    // 1. Group exponents into [[exp, coef], ...]
    const terms = [];
    for (let i = 0; i < ord.length;) {
      let j = i + 1;
      while (j < ord.length && ord[j] === ord[i]) j++;
      terms.push([ord[i], j - i]);
      i = j;
    }

    // 2. Format each [exp, coef] term (fixing 1*n to display directly as n)
    return terms.map(([exp, coef]) => {
      if (exp === 0) {
        return `${coef}`;
      }

      const base = exp === 1 ? "&omega;" : `&omega;<sup>${exp}</sup>`;
      return coef > 1 ? `${base}&middot;${coef}` : base;
    }).join("+");
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
      return pretty(ord);
  }

  //optional: if you can't implement this, just return return "#808080" or nay color you like
  function classifyOrdinal(ord) {
    if (ord == Limit) return "#ffffff";
    if (ord.length == 0) return "#808080";
    if (isSuccessor(ord)) return "#d40000";
    if (ord.at(-1) > 0) return "#ffd000";
    return "#ff8000";
  }

  //optional: if you dont have this, just leave empty and dont return this in the end of IIEF (this will ler the program know you don't implement this)
  function parse(str) {
    str = str.trim();
    if (str === "" || str === "0") return [];
    if (str.toLowerCase() === "limit" || str === "ω^ω" || str === "w^w") return Limit;

    // Treat (, [, and { flexibly
    let normalized = str.replace(/[\[\{]/g, "(").replace(/[\]\}]/g, ")");

    // 1. Array-like and Grouped Notation (e.g., (5,3,1,0), [5,3,1,0], or [[5,1], [3,2]])
    if (normalized.includes("(") || normalized.includes(",")) {
      // Check for nested pair notation like [[5, 1], [3, 2]]
      let pairMatches = str.match(/[\(\[\{]\s*\d+\s*,\s*\d+\s*[\)\]\}]/g);
      if (pairMatches && pairMatches.length > 0) {
        let expanded = [];
        for (let pairStr of pairMatches) {
          let [e, c] = pairStr.replace(/[^0-9,]/g, "").split(",").map(Number);
          for (let i = 0; i < c; i++) expanded.push(e);
        }
        return expanded;
      }

      // Standard array notation (5, 3, 1, 0)
      let cleaned = normalized.replace(/[()]/g, "");
      return cleaned.split(",").map(s => s.trim()).filter(Boolean).map(Number);
    }

    // 2. Transfinite text notation (e.g., "w^2 + w*3 + 5" or "ω^2 + 5")
    let cleanText = str.toLowerCase().replace(/&omega;|ω/g, "w").replace(/·|\*/g, "*");
    let terms = cleanText.split("+");
    let result = [];

    for (let term of terms) {
      term = term.trim();
      if (!term) continue;

      let exp = 0;
      let coef = 1;

      if (term.includes("w")) {
        if (term.includes("^")) {
          let parts = term.split("^");
          let expPart = parts[1].split("*")[0].trim();
          exp = parseInt(expPart, 10);
        } else {
          exp = 1;
        }

        if (term.includes("*")) {
          let coefPart = term.split("*")[1].trim();
          coef = parseInt(coefPart, 10);
        }
      } else {
        exp = 0;
        coef = parseInt(term, 10);
      }

      for (let i = 0; i < coef; i++) {
        result.push(exp);
      }
    }

    return result;
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

# Changelogs

Current Version : https://rngdelak.github.io/ord-generalized

## Version 0 Series (0.1 → 0.9)

**Description: these version are testing, and moslty unsuable yet. Limited render capability and consists many bugs**

***Major Update: firgured out an efficient way to render ordinal numbre line (v0.3)***

v0.1: https://rngdelak.github.io/ord-generalized/versions/version%200.1/

v0.2: https://rngdelak.github.io/ord-generalized/versions/version%200.2/

v0.3: https://rngdelak.github.io/ord-generalized/versions/version%200.3/

v0.4: https://rngdelak.github.io/ord-generalized/versions/version%200.4/

v0.5: https://rngdelak.github.io/ord-generalized/versions/version%200.5/

v0.6: https://rngdelak.github.io/ord-generalized/versions/version%200.6/

v0.7: https://rngdelak.github.io/ord-generalized/versions/version%200.7/

v0.8: https://rngdelak.github.io/ord-generalized/versions/version%200.8/

v0.9: https://rngdelak.github.io/ord-generalized/versions/version%200.9/

## Version 1 Series (1.0 → 1.12)

**Description: these version started to have more guis and support widely across devices**

***Major Update: added mathstick mode (v1.9)***

v1.0: https://rngdelak.github.io/ord-generalized/versions/version%201.0/

v1.1: https://rngdelak.github.io/ord-generalized/versions/version%201.1/

v1.2: https://rngdelak.github.io/ord-generalized/versions/version%201.2/

v1.3: https://rngdelak.github.io/ord-generalized/versions/version%201.3/

v1.4: https://rngdelak.github.io/ord-generalized/versions/version%201.4/

v1.5: https://rngdelak.github.io/ord-generalized/versions/version%201.5/

v1.6: https://rngdelak.github.io/ord-generalized/versions/version%201.6/

v1.7: https://rngdelak.github.io/ord-generalized/versions/version%201.7/

v1.8: https://rngdelak.github.io/ord-generalized/versions/version%201.8/

v1.9: https://rngdelak.github.io/ord-generalized/versions/version%201.9/

v1.10: https://rngdelak.github.io/ord-generalized/versions/version%201.10/

v1.11: https://rngdelak.github.io/ord-generalized/versions/version%201.11/

v1.12: https://rngdelak.github.io/ord-generalized/versions/version%201.12/

## Version 2 Series (2.0 → 2.12)

**Description: these version are very complete, though there still some bugs but fixed overally after v2.9**

***Major Update: formalized sharing transfinte number line notations (v2.10) , added find ordinal (v2.2) and set viewport state (v2.7)***

v2.0: https://rngdelak.github.io/ord-generalized/versions/version%202.0/

v2.1: https://rngdelak.github.io/ord-generalized/versions/version%202.1/

v2.2: https://rngdelak.github.io/ord-generalized/versions/version%202.2/

v2.3: https://rngdelak.github.io/ord-generalized/versions/version%202.3/

v2.4: https://rngdelak.github.io/ord-generalized/versions/version%202.4/

v2.5: https://rngdelak.github.io/ord-generalized/versions/version%202.5/

v2.6: https://rngdelak.github.io/ord-generalized/versions/version%202.6/

v2.7: https://rngdelak.github.io/ord-generalized/versions/version%202.7/

v2.8: https://rngdelak.github.io/ord-generalized/versions/version%202.8/

v2.9: https://rngdelak.github.io/ord-generalized/versions/version%202.9/

v2.10: https://rngdelak.github.io/ord-generalized/versions/version%202.10/

v2.11: https://rngdelak.github.io/ord-generalized/versions/version%202.11/

v2.12: https://rngdelak.github.io/ord-generalized/versions/version%202.12/

# Motivation

It's a heartbreaking journeys which all starts 2 years ago, when i found myself [Stephen Brooks's](https://www.stephenbrooks.org/) Transfinite Number Lines.

As a googology enthusiast, i was shocked of how complex, recursive and beatiful it was.

So do i, i wanted to explore what inside, but sadly, there isn't any source code (and he shared it in 12/7/2026, after i emailed him)

And in past year, i tried to firgure out myself , and thats it, i written a [document](https://github.com/RNGDelak/ord-limbms/blob/main/README.md), and making 3 transfinite number line which is [ord-w](https://rngdelak.github.io/ord-w/), [ord-ww](https://rngdelak.github.io/ord-ww/) and [ord-limbms](https://rngdelak.github.io/ord-limbms/) with vital help from [@solarzone1010](https://solarzone1010.github.io/).

Yeah, those project are painfully slow. And then, i revised everything, try to optimize everything i could (thats why there a version 0.1 and 0.2) but sadly, i was on the wrong way.

Until [Stephen Brooks's](https://www.stephenbrooks.org/) shared [his project source code](https://www.stephenbrooks.org/archive/ordinals), i had everything to push this project to reality.

Thats it, now i can finally take out the plan that i have written 4 month ago for this project, and possibly doesnt know when will i do that.