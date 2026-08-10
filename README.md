# Ord-Generalized

## About this project


Interactive transfinite number line where you can plug-in your own and play!

Link: https://rngdelak.github.io/ord-generalized

Here's some **"Landscapes"**
![Landscape 1](https://github.com/user-attachments/assets/4b539daa-c723-488d-85e4-6c2f2649d2c9)
![Landscape 2](https://github.com/user-attachments/assets/41d91047-bdcb-4889-b3d2-d42a2ec46bf4)
![Landscape 3](https://github.com/user-attachments/assets/11f3a876-8fc2-4cb4-a820-7cd6d6c83d12)
![Landscape 4](https://github.com/user-attachments/assets/9a5950ac-e29e-49ce-bf0b-3de6e62ea6b4)

## Features

- Interactive navigation
- Plugin-based notation system
- MathStick Mode
- Ordinal Finder
- Rendering optimizations
- Built-in slow mode for slow notation/deep rendering
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

Current Version: [Latest Release](https://rngdelak.github.io/ord-generalized)

---

## Version 0 Series (0.1 → 0.9)

> **Overview:** These versions are experimental and mostly unusable. They have limited rendering capability and contain many bugs.  
> **Major Milestone:** Figured out an efficient way to render ordinal number line (v0.3)

<details>
<summary><b>v0.1</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%200.1/">Link</a></summary>

- **Added:** Initial prototype build.
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v0.2</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%200.2/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v0.3</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%200.3/">Link</a></summary>

- **Added:** Efficient rendering system for ordinal number line.
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v0.4</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%200.4/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v0.5</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%200.5/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v0.6</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%200.6/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v0.7</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%200.7/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v0.8</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%200.8/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v0.9</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%200.9/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

---

## Version 1 Series (1.0 → 1.12)

> **Overview:** Added more GUI elements and wide cross-device support.  
> **Major Milestone:** Added MathStick Mode (v1.9)

<details>
<summary><b>v1.0</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%201.0/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v1.1</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%201.1/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v1.2</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%201.2/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v1.3</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%201.3/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v1.4</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%201.4/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v1.5</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%201.5/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v1.6</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%201.6/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v1.7</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%201.7/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v1.8</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%201.8/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v1.9</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%201.9/">Link</a></summary>

- **Added:** Introduced MathStick Mode.
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v1.10</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%201.10/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v1.11</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%201.11/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v1.12</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%201.12/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

---

## Version 2 Series (2.0 → 2.17)

> **Overview:** Feature-complete releases. Minor bugs resolved after v2.9.  
> **Major Milestones:** Added Ordinal Finder (v2.2), Set Viewport State (v2.7), and formalized sharing transfinite number line notations (v2.10).

<details>
<summary><b>v2.0</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.0/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v2.1</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.1/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v2.2</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.2/">Link</a></summary>

- **Added:** Added Ordinal Finder.
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v2.3</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.3/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v2.4</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.4/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v2.5</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.5/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v2.6</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.6/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v2.7</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.7/">Link</a></summary>

- **Added:** Added Set Viewport State.
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v2.8</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.8/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v2.9</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.9/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v2.10</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.10/">Link</a></summary>

- **Added:** Formalized sharing transfinite number line notations.
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v2.11</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.11/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v2.12</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.12/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v2.13</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.13/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v2.14</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.14/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v2.15</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.15/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v2.16</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.16/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

<details>
<summary><b>v2.17</b> — <a href="https://rngdelak.github.io/ord-generalized/versions/version%202.17/">Link</a></summary>

- **Added:**
- **Changes:**
- **Fixes:**
</details>

# Motivation

It's a heartbreaking journeys which all starts 2 years ago, when i found myself [Stephen Brooks's](https://www.stephenbrooks.org/) Transfinite Number Lines.

As a googology enthusiast, i was shocked of how complex, recursive and beatiful it was.

So do i, i wanted to explore what inside, but sadly, there isn't any source code (and he shared it in 12/7/2026, after i emailed him)

And in past year, i tried to firgure out myself , and thats it, i written a [document](https://github.com/RNGDelak/ord-limbms/blob/main/README.md), and making 3 transfinite number line which is [ord-w](https://rngdelak.github.io/ord-w/), [ord-ww](https://rngdelak.github.io/ord-ww/) and [ord-limbms](https://rngdelak.github.io/ord-limbms/) with vital help from [@solarzone1010](https://solarzone1010.github.io/).

Yeah, those project are painfully slow. And then, i revised everything, try to optimize everything i could (thats why there a version 0.1 and 0.2) but sadly, i was on the wrong way.

Until [Stephen Brooks's](https://www.stephenbrooks.org/) shared [his project source code](https://www.stephenbrooks.org/archive/ordinals), i had everything to push this project to reality.

Thats it, now i can finally take out the plan that i have written 4 month ago for this project, and possibly doesnt know when will i do that.
