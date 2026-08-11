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
    parse, //remove this if you don't have a parser to let my program know.
    Zero,
    Limit,
    DisplayName,
    ordinalTypes,
    Aliases,
    config,
    title
  };

})();

/*

If implement a proper parser is too hard, do this instead (this work universally!)

function parse(ord){
    let arr = ord.split(',').map(x => Number(x))
    let current = Limit
    for(let i = 0 ; i < arr.length ; i++){
        if(isSuccessor(current)) break;
        current = fs(current,arr[i])
    }
    return current;
}

basically it takes a sequence of number representing the adress of that ordinal
eg : 2,6,2,8,1 --> fs(fs(fs(fs(fs(Limit,2),6),2),8),1) / Limit[2][6][2][8][1]

*/

```

# Changelogs

Current Version: https://rngdelak.github.io/ord-generalized

---

## Version 0 Series (0.1 → 0.9)

**Overview:** These versions are testing, and mostly unusable yet. Limited render capability and consists of many bugs.  
**Major Update:** Figured out an efficient way to render ordinal number line (v0.3)























































* **v0.1** — https://rngdelak.github.io/ord-generalized/versions/version%200.1/ <details>
  * **Description:** Initial prototype build.
  * **Added:** Binary search on ordinal o(log2n) but sadly decimal.js ruined the thing so yeah.


</details>






















































* **v0.2** — https://rngdelak.github.io/ord-generalized/versions/version%200.2/ <details>
  * **Description:**

    * Refactored the transfinite number-line implementation by separating rendering from ordinal/rational computation.
    * Replaced the previous Decimal-based calculation system with `BigRational.js` for exact rational arithmetic.
    * Added a new computation module for converting rational positions into bit representations and ordinals.
    * Improved HTML setup and display handling, including dynamic page title and full-screen canvas styling.

  * **Added:**

    * Added `main.js` as a new computation/module layer.
    * Added `BigRational.js` as an external dependency for arbitrary/exact rational calculations.
    * Added `Module.rationalToBits()` for converting rational values to binary/bit representations.
    * Added `Module.bitsToOrdinal()` for converting bit sequences into ordinals.
    * Added `Module.rationalToOrdinal()` as a direct rational-to-ordinal conversion.
    * Added `Module.computeTicks()` for calculating visible number-line ticks based on rational positions and pixel width.
    * Added dynamic document title support using `notation.title`.
    * Added responsive/full-screen HTML and canvas configuration.
    * Added reusable text rendering helpers such as `createTextLabel()`, `clearTextLabels()`, and `renderTexts()`.

  * **Changes:**

    * Reworked `render.js` so it focuses primarily on canvas/UI rendering instead of containing the ordinal computation logic.
    * Moved the previous rendering/calculation logic out of `render.js` and introduced the new `main.js` computation layer.
    * Replaced Decimal-based numerical operations with `BigRational` operations.
    * Changed CNF output formatting from `^` notation to HTML `<sup>` exponents.
    * Improved coefficient formatting by using spaces and `·`, e.g. `ω · 2`.
    * Updated `PrSStoCNF()` to accommodate the new HTML-style exponent output.
    * Changed the HTML script loading order to support the new architecture: BigRational → renderer → core → main.
    * Added `lang`, charset, viewport, title, and responsive layout metadata to `index.html`.
    * Updated the text overlay to support dynamically rendered labels.
    * Kept `core.js` focused on notation/ordinal functionality while computation and rendering are more clearly separated.
    * Minor formatting cleanup in the `Limit` declaration.

  * **Fixes:**

    * Removed the dependency on the previous `decimal.js` implementation.
    * Replaced the previous approximate/precision-managed numeric handling with exact rational arithmetic, reducing potential floating-point/precision issues.
    * Fixed CNF formatting so the generated exponent can be displayed as an actual superscript in HTML.
    * Fixed the initial output trimming in `PrSStoCNF()` to account for the newly formatted `" + "` separator.
    * Improved canvas sizing so it automatically fills the browser viewport.


</details>























































* **v0.3** — https://rngdelak.github.io/ord-generalized/versions/version%200.3/ <details>
  * **Description:**

    * Reworked the visualization layer by replacing `main.js` with a new `plot.js` visual orchestration engine.
    * Moved the number-line traversal, viewport handling, tick generation, labeling, sampling, HUD, and interaction logic into `plot.js`.
    * Simplified `render.js` so it is dedicated to low-level canvas and text rendering.
    * Updated the ordinal configuration to represent `Limit` as a symbolic ordinal instead of `[0, 2]`.

  * **Added:**

    * Added `plot.js` as the new main visualization/orchestration module.
    * Added real-time FPS tracking using `requestAnimationFrame()`.
    * Added viewport/camera state with horizontal panning and vertical-drag zooming.
    * Added recursive `segment()` traversal for generating the transfinite number-line structure.
    * Added `computeTree()` with separate passes for:

      * High-density tick rendering.
      * Lower-density timeline label placement.
    * Added ordinal timeline labels through `tickmarkLabel()` and `drawTimelineLabels()`.
    * Added ordinal sampling at the center viewport position.
    * Added a visual HUD/legend for ordinal classes.
    * Added viewport center alignment using a blue vertical guide line.
    * Added FPS display on the canvas overlay.
    * Added mouse drag interaction for panning and zooming.
    * Added zoom limits to prevent excessive zoom-out.
    * Added `Small Cantor Ordinal` to the `Aliases` list.
    * Added convergence/rescaling logic for recursive limit-ordinal visualization.
    * Added off-screen clipping and maximum-depth handling to the segment traversal.

  * **Changes:**

    * Replaced `main.js` with `plot.js`.
    * Changed the script loading order from `main.js` to `plot.js`.
    * Removed the `Module` computation API from the previous architecture, including:

      * `rationalToBits()`
      * `bitsToOrdinal()`
      * `rationalToOrdinal()`
      * `computeTicks()`
    * Replaced the previous rational-grid tick calculation with recursive ordinal-tree traversal in `plot.js`.
    * Changed `notation.Limit` from `[0, 2]` to the symbolic value `"Limit"`.
    * Updated ordinal classification/legend ordering.
    * Changed `Buchholz Ordinal` to explicitly reference the new symbolic `Limit`.
    * Added `Small Cantor Ordinal` as a named alias for `0,2`.
    * Moved visual label generation and rendering orchestration out of the renderer.
    * `render.js` is now substantially simpler and only handles primitive rendering operations.
    * Removed `renderTicks()` and `renderTexts()` from `render.js` because the new plotting system renders directly through the lower-level functions.
    * Added a two-stage rendering strategy: dense ticks for the number line and separate, visually prioritized labels.
    * Added dynamic viewport recalculation on resize and mouse interaction.
    * Added an initial centered viewport rather than relying on the previous computation-based layout.

  * **Fixes:**

    * Fixed the previous architecture's dependency on `main.js` for both computation and visualization by separating plotting responsibilities into their own module.
    * Improved handling of `Limit` ordinals by treating them explicitly as a symbolic boundary throughout the ordinal comparison and traversal logic.
    * Added infinite-loop protection during recursive/convergent segment generation.
    * Added off-screen clipping to avoid unnecessary recursive/rendering work.
    * Added zoom boundary protection to prevent the viewport from shrinking beyond the intended minimum width.
    * Improved label placement so timeline labels are generated separately from high-density tick rendering.
    * Added frame-based FPS measurement to make rendering performance visible.


</details>























































* **v0.4** — https://rngdelak.github.io/ord-generalized/versions/version%200.4/ <details>
  * **Description:**

    * Improved the interactive number-line visualization with faster zooming and new mouse-wheel zoom support.
    * Adjusted timeline label positioning to better follow the visualization's diagonal trajectory.
    * Promoted several rendering variables to shared state so they can be reused by label rendering and other functions.
    * `core.js`, `index.html`, and `render.js` remain unchanged.

  * **Added:**

    * Added mouse-wheel zoom support centered around the cursor position.
    * Added shared rendering dimensions/state variables:

      * `w` — canvas width
      * `h` — canvas height
      * `yStart` / `yEnd` — vertical rasterization bounds
      * `tHeight` — tick/label height offset
      * `ilxw` — inverse logarithmic canvas-width factor
    * Added `wheel` event handling with `preventDefault()` to provide custom zoom behavior.

  * **Changes:**

    * Increased drag-based zoom sensitivity from `0.005` to `0.01`.
    * Changed timeline label Y-position calculation from a fixed proportional/offset formula to a simpler calculation based directly on the canvas width and `tHeight`.
    * Moved canvas dimension and rasterization variables from local scope inside `render()` to module-level variables so they can be accessed by other functions.
    * Removed the unused `legendsMap` configuration from `plot.js`.
    * Updated minor formatting/whitespace in `plot.js`.
    * Simplified the FPS fallback expression formatting without changing its behavior.
    * Mouse-wheel zoom scales the viewport relative to the cursor instead of only relying on vertical mouse dragging.

  * **Fixes:**

    * Improved label positioning so labels remain aligned with the visualization's diagonal path.
    * Fixed the limitation where zooming could only be performed through vertical mouse dragging by adding mouse-wheel zoom.
    * Improved zoom responsiveness by doubling the drag zoom sensitivity.
    * Prevented the browser's default wheel behavior while interacting with the visualization, allowing the canvas to control zoom directly.


</details>























































* **v0.5** — https://rngdelak.github.io/ord-generalized/versions/version%200.5/ <details>
  * **Description:**

    * Expanded the visualization controls with keyboard navigation and continuous zoom/panning.
    * Improved mouse-wheel zoom behavior to make zooming substantially faster and more responsive.
    * Added automatic display of notable ordinal aliases on the timeline.
    * Added explicit handling for the `Limit` ordinal when generating timeline labels.
    * Centralized the maximum zoom-out boundary so it can be reused across the visualization.

  * **Added:**

    * Added keyboard controls for navigating the visualization.
    * Added continuous keyboard input handling using `requestAnimationFrame()`.
    * Added horizontal panning with the **Left / Right Arrow** keys.
    * Added zooming with the **Up / Down Arrow** keys.
    * Added **Shift** as a 3× movement/zoom speed modifier.
    * Added **Control** as a 0.3× movement/zoom speed modifier.
    * Added automatic rendering while keyboard navigation is active.
    * Added `maxAllowedWidth` as a shared zoom boundary.
    * Added automatic rendering of matching `notation.Aliases` above timeline labels.
    * Added special `"Limit"` display handling for the symbolic `notation.Limit` ordinal.
    * Added an explicit `Limit` timeline label at the right edge of the rendered range.

  * **Changes:**

    * Increased mouse-wheel zoom factor from approximately `1.1 / 0.9` to `1.5 / 2/3`, making wheel zoom much faster.
    * Changed mouse-wheel zoom so zooming in is always allowed while zooming out is restricted by the minimum zoom boundary.
    * Removed the previous extra `* 2` scaling from mouse-wheel zoom calculations.
    * Moved `maxAllowedWidth` from inside the mouse-drag handler to shared module scope.
    * Updated `drawTimelineLabels()` to detect ordinal aliases and render their names above matching mathematical labels.
    * Changed label rendering to safely handle the symbolic `Limit` value without passing it through the normal ordinal formatter.
    * Added continuous keyboard-state tracking through `activeKeys`.
    * Added recursive/frame-based input updates instead of only responding to individual key presses.
    * Added dynamic pan and zoom speeds based on canvas dimensions.
    * Added keyboard zoom clamping so zooming out cannot exceed the configured minimum zoom level.
    * Kept the existing mouse drag and wheel controls while extending them with keyboard controls.

  * **Fixes:**

    * Fixed `Limit` labels potentially being passed into the normal ordinal display/formatting path.
    * Improved visibility of important named ordinal landmarks by displaying matching aliases directly on the timeline.
    * Prevented keyboard zoom-out from exceeding the minimum allowed viewport width.
    * Improved mouse-wheel zoom behavior by removing the previous excessive coordinate scaling.
    * Improved navigation responsiveness through continuous keyboard updates rather than one-off key events.


</details>























































* **v0.6** — https://rngdelak.github.io/ord-generalized/versions/version%200.6/ <details>
  * **Description:**

    * Reworked the center-point ordinal sampler to use targeted recursive computation instead of scanning the rendered tick array.
    * Improved the accuracy of the ordinal value displayed at the center of the visualization.
    * Simplified keyboard zoom controls and removed the previous Shift/Ctrl speed modifiers.
    * Added protection for empty PrSS input.
    * Kept the existing visualization and interaction architecture while making the sampling logic more mathematically precise.

  * **Added:**

    * Added `sampleHighPrecision()` for targeted ordinal sampling around a specific pixel position.
    * Added `samplerCallback()` to capture the mathematically closest recursive segment.
    * Added persistent sampler state:

      * `samplerBd`
      * `samplerOrd`
    * Added a 1-pixel mathematical probe window around the center of the viewport.
    * Added an empty-input guard to `PrSStoCNF()` that returns `"0"` when given an empty sequence.

  * **Changes:**

    * Replaced the previous `sample()` implementation, which scanned the entire `ticks` array, with targeted recursive sampling.
    * The center ordinal is now determined directly from the mathematical recursion rather than from the nearest rendered tick.
    * Changed the sampler to use the segment's mathematical starting coordinate and distance from the center pixel.
    * Changed the center label rendering to use the result from the high-precision sampler.
    * Changed keyboard zoom speed from `0.02` to `1.1`, with zoom-in using `1.1` and zoom-out using its reciprocal.
    * Removed the previous Shift ×3 and Ctrl ×0.3 keyboard speed modifiers.
    * Simplified keyboard pan/zoom speed calculation.
    * Moved `maxAllowedWidth` back into the specific zoom handlers instead of keeping it as a global variable.
    * Added explicit spacing/formatting cleanup in several parts of `plot.js`.
    * Kept mouse-wheel zoom behavior functionally the same while cleaning up its conditional formatting.

  * **Fixes:**

    * Fixed inaccurate center ordinal sampling caused by relying on the rendered `ticks` array.
    * Improved sampling accuracy for ordinals that may not correspond cleanly to a rendered tick.
    * Fixed `PrSStoCNF([])` so an empty representation no longer produces an invalid/empty CNF result.
    * Improved consistency between the mathematical ordinal structure and the ordinal displayed at the center of the viewport.
    * Simplified keyboard zoom behavior to avoid the previous speed-multiplier interaction between modifier keys.


</details>






















































* **v0.7** — https://rngdelak.github.io/ord-generalized/versions/version%200.7/ <details>
  * **Description:**

    * Switched the active ordinal notation system from **HPrSS** to **BMS (Bashicu Matrix System)**.
    * Replaced the previous `core.js` implementation with a dedicated `Libs/BMS.js` module.
    * Added `HPrSS.js` as a separate notation library while keeping it inactive by default.
    * Updated the visualization to work with the BMS matrix-based ordinal representation.
    * Expanded the available named ordinal aliases substantially.

  * **Added:**

    * Added `Libs/BMS.js` containing the BMS ordinal implementation.
    * Added BMS-specific:

      * Matrix ordinal comparison (`cmp`)
      * Fundamental sequence generation (`fs`)
      * Successor detection (`isSuccessor`)
      * Matrix-based ordinal display
      * BMS ordinal classification
      * BMS parsing
    * Added `Libs/HPrSS.js` as a standalone HPrSS notation library.
    * Added a large collection of BMS ordinal aliases, including:

      * First Transfinite Ordinal
      * Small Cantor Ordinal
      * Veblen Ordinal
      * Feferman–Schütte Ordinal
      * First Γ fixed point
      * Ackermann Ordinal
      * Small/Large Veblen Ordinals
      * Bachmann–Howard Ordinal
      * Buchholz's Ordinal
      * Takeuti–Feferman–Buchholz Ordinal
      * Bird's Ordinal
      * Extended/Multivariable/Transfinitary/Dimensional Buchholz Ordinals
      * Small Stergent Ordinal
      * Small Dropping Ordinal
      * 2nd Back Gear Ordinal
      * Omega Back / Small Bashicu Ordinal
      * Lim(TSS)
      * Lim(QSS)
      * Lim(BMS) / ω-Y(1,3)
    * Added BMS-specific title: `BMS transfinite number line`.

  * **Changes:**

    * Replaced the active script:

      * `core.js`
      * → `Libs/BMS.js`
    * Changed the ordinal data structure from HPrSS sequences such as `[0,2,...]` to **BMS matrices**, e.g. `[[0,0],[1,1],...]`.
    * Replaced the HPrSS `fs()` implementation with the BMS fundamental-sequence algorithm using matrix columns, parent relationships, ascending relationships, and cached calculations.
    * Replaced the HPrSS lexicographical comparison with BMS matrix comparison that:

      * Compares matrix columns recursively.
      * Pads columns of different lengths with zeros before comparison.
      * Handles the `Limit` value explicitly.
    * Changed successor detection from checking the final scalar value to checking whether the final BMS matrix column contains only zeros.
    * Changed ordinal display from comma-separated scalar sequences to matrix notation such as `(0,0)(1,1)`.
    * Changed `parse()` behavior to return the supplied BMS representation directly rather than converting a comma-separated HPrSS string into numbers.
    * Updated the alias representation from string definitions such as `"0,2"` to actual ordinal data structures such as `[0,2]`/BMS matrices.
    * Updated `plot.js` to use the alias definitions directly instead of calling `notation.parse()` on them.
    * Kept the existing plotting, zooming, keyboard navigation, high-precision sampler, timeline labels, FPS counter, and HUD architecture largely unchanged.
    * Kept the same `ordinalTypes` color classification interface so the renderer can continue using the notation module without major changes.

  * **Fixes:**

    * Fixed the mismatch between the visualization engine and the ordinal representation by making aliases use the actual ordinal data structure expected by the active notation system.
    * Removed the dependency on the previous monolithic `core.js` file.
    * Improved fundamental-sequence calculation with caching in the new BMS implementation.
    * Added explicit handling for BMS matrices with different column lengths during comparison.
    * Improved support for a much larger range of named transfinite ordinals through the expanded alias definitions.
    * Preserved the existing plotting API (`cmp`, `fs`, `isSuccessor`, `display`, `classifyOrdinal`, `parse`, `Zero`, `Limit`) so the visualization layer requires only minimal changes.


</details>























































* **v0.8** — https://rngdelak.github.io/ord-generalized/versions/version%200.8/ <details>
  * **Description:**

    * Added a configurable UI panel for changing notation systems and visualization settings at runtime.
    * Refactored `plot.js` configuration and runtime state into centralized `config` and `cam` objects.
    * Added support for dynamically loading BMS, HPrSS, or custom notation scripts without modifying the source files.
    * Added JSON-based environment configuration injection.
    * Improved camera movement so keyboard navigation is frame-rate independent.
    * Added viewport boundary protection to prevent excessive panning outside the visible canvas.
    * Simplified and tightened the BMS ordinal classification system.

  * **Added:**

    * Added new `ui.js` module for runtime configuration management.
    * Added a **Config Menu** button to the visualization.
    * Added notation-system presets:

      * BMS
      * HPrSS
    * Added custom notation-code injection through a textarea.
    * Added runtime JSON configuration injection.
    * Added an **Execute Code Script** action for dynamically loading custom notation implementations.
    * Added an **Apply Configuration** action for changing visualization parameters at runtime.
    * Added centralized configuration options for:

      * Aspect ratio
      * Pan speed
      * Zoom speed
      * Drag zoom factor
      * Shift/Ctrl speed multipliers
      * Wheel zoom factors
      * Maximum viewport width
    * Added centralized camera state containing:

      * Canvas dimensions
      * FPS state
      * Viewport bounds
      * Mouse state
      * Tick data
      * Label data
      * Sampler state
      * Active keyboard state
    * Added viewport clamping so at least part of the number line remains visible after panning/zooming.
    * Added frame-rate-independent keyboard movement using elapsed time (`dt`).
    * Added configurable exponential keyboard zoom.
    * Added runtime loading of notation scripts using dynamically created `<script>` elements.

  * **Changes:**

    * Refactored `plot.js` from many independent global variables into two main state objects:

      * `config` for user-adjustable settings.
      * `cam` for camera/render/runtime state.
    * Replaced hard-coded interaction constants with configurable values from `config`.
    * Changed keyboard panning from a fixed per-frame movement to pixels-per-second movement scaled by elapsed time.
    * Changed keyboard zoom from a fixed multiplier per frame to exponential time-scaled zoom.
    * Restored Shift and Ctrl speed modifiers, but made them configurable.
    * Changed mouse-drag zoom to use `config.zoomDragFactor`.
    * Changed wheel zoom to use configurable `wheelZoomIn` and `wheelZoomOut` values.
    * Changed the maximum zoom-out width from a hard-coded 50% canvas width to `config.maxAllowedWidthFactor`.
    * Added `clampViewportBounds()` after mouse dragging, wheel zooming, and keyboard navigation.
    * Changed BMS/HPrSS notation initialization from a local `let notation` to `window.notation`, allowing dynamically loaded scripts to replace the active notation system.
    * Changed `index.html` to explicitly initialize `window.notation`.
    * Added an ID to the active notation script so it can be removed and replaced at runtime.
    * Moved the initial BMS notation loading into a replaceable script element.
    * Added `ui.js` after `plot.js` so the configuration controls can interact with the plotting engine.
    * Removed the unused BMS ordinal legend entries for `Power of ω` and `Tower of ω`.
    * Simplified BMS `classifyOrdinal()`:

      * Empty ordinal → Zero
      * Last column beginning with `0` → Successor
      * Otherwise → Limit
    * Updated HTML/CSS formatting and expanded the page styling to support the floating configuration panel.

  * **Fixes:**

    * Fixed keyboard movement being dependent on frame rate by making movement and zoom calculations time-based.
    * Fixed excessive viewport panning by enforcing a minimum 10% overlap with the canvas.
    * Fixed configuration values being scattered throughout `plot.js` by centralizing them into a single configurable object.
    * Fixed notation switching limitations by exposing the notation object globally and allowing the notation script to be replaced dynamically.
    * Improved compatibility between `plot.js` and multiple notation libraries.
    * Improved BMS ordinal classification by removing obsolete ordinal categories that were no longer represented by the implementation.
    * Improved runtime configuration handling with JSON parsing and error feedback for malformed configuration input.


</details>























































* **v0.9** — https://rngdelak.github.io/ord-generalized/versions/version%200.9/ <details>
  * **Description:**

    * Added interactive control over the recursion depth used to render the transfinite number line.
    * Improved runtime notation switching by making preset notation loading more explicit and reliable.
    * Improved interaction behavior when the configuration menu is open so canvas controls do not accidentally operate underneath the UI.
    * Preserved the configurable camera/notation architecture introduced in v0.8.

  * **Added:**

    * Added keyboard controls for limiting the recursive visualization depth:

      * **S** — decrease the maximum recursion depth.
      * **D** — increase the maximum recursion depth.
    * Added `cam.view.maxDepth` handling to the keyboard interaction system.
    * Added runtime initialization through `init()` after a notation script is loaded.
    * Added preset notation loading through `loadPresetNotation()`.
    * Added automatic loading of the default BMS notation through the UI layer.
    * Added explicit handling for the active notation script via the `notation-script` element.

  * **Changes:**

    * Extended the existing keyboard input system so it can control both:

      * Camera movement/zoom.
      * Recursive rendering depth.
    * Changed `maxDepth` from being only an internal rendering parameter into a user-controllable visualization setting.
    * Added immediate re-rendering whenever the depth level is changed.
    * Changed notation loading so `ui.js` can fetch a notation library, inject its source into the code editor, execute it, and then reinitialize the visualization.
    * Added `init()` execution after dynamically replacing the notation implementation so the title, canvas size, camera position, and initial render are refreshed.
    * Added guards to mouse and wheel interaction so they are ignored while the configuration menu is open.
    * Added the same configuration-menu guard to the continuous keyboard input loop.
    * Continued using `window.notation` as the replaceable active notation implementation.
    * Kept BMS as the default notation while retaining HPrSS as an available preset.
    * Preserved the v0.8 `config` and `cam` architecture rather than introducing another separate state system.

  * **Fixes:**

    * Fixed interaction conflicts between the configuration UI and the canvas: opening the Config Menu no longer allows mouse/keyboard navigation to modify the visualization underneath it.
    * Fixed dynamically loaded notation systems not necessarily refreshing the visualization after being injected.
    * Improved reset/reinitialization behavior when switching notation systems.
    * Improved control over expensive recursive rendering by allowing the user to reduce the maximum recursion depth.
    * Added a safe lower bound for recursion depth so pressing **S** repeatedly cannot reduce the depth below the unlimited/default state.
    * Ensured changing recursion depth immediately updates the rendered number line.


---

## Version 1 Series (1.0 → 1.12)

**Overview:** These versions started to have more GUIs and support widely across devices.  
**Major Update:** Added mathstick mode (v1.9), switch from native js number to BigInt (v1.3)






















































* **v1.0** — https://rngdelak.github.io/ord-generalized/versions/version%201.0/ <details>
  * **Description:**

    * Version 1.0 updates the ordinal notation logic, changes the displayed ordinal format from **CNF Included** to **Normal**, improves handling of zero/limit values, and adds touch interaction support to the canvas.
    * The internal fundamental-sequence (`fs`) calculation was also revised.

  * **Added:**

    * Added `touch-action: none` to the canvas, improving support for touch/pointer interaction without browser gesture interference.
    * Added explicit display handling for:

      * `0` when the ordinal is empty.
      * `Limit` when the ordinal is a limit value.
    * Added more robust comparison logic using the shorter ordinal length when comparing ordinal arrays.

  * **Changes:**

    * Changed the ordinal display mode in `plot.js` from **CNF Included** to **Normal**.

      * This affects both the main ordinal label and timeline labels.
    * Reworked the `fs()` fundamental-sequence calculation in `HPrSS.js`.

      * Version 1.0 uses a simpler root/cut-node approach.
      * The iteration logic was changed from `i <= n` to `i < n`.
    * Simplified the ordinal comparison (`cmp`) implementation while preserving lexicographic comparison behavior.
    * Reorganized and cleaned up several JavaScript expressions and formatting.

  * **Fixes:**

    * Fixed display handling for empty ordinals so they are explicitly rendered as `0`.
    * Fixed display handling for the `Limit` value so it is explicitly rendered as `Limit`.
    * Improved ordinal comparison behavior when comparing arrays of different lengths.
    * Improved touch interaction behavior on the canvas by preventing default browser touch actions.


</details>























































* **v1.1** — https://rngdelak.github.io/ord-generalized/versions/version%201.1/ <details>
  * **Description:** Optimizing and added "Predicting" Alogrithm from Stephen Brooks verions
  * **Added:** AdaptiveScale() function


</details>






















































* **v1.2** — https://rngdelak.github.io/ord-generalized/versions/version%201.2/ <details>
  * **Description:**

    * Version 1.2 significantly expands the notation and ordinal classification system while improving the rendering/UI experience.
    * The application now supports multiple display modes, more ordinal classifications, an FPS counter, an interactive usage hint, improved canvas resizing, and a new LPrSS notation preset.
    * Rendering behavior was also updated to respect the currently selected notation mode.

  * **Added:**

    * Added **2 shifted-OCF** as a new ordinal display mode.
    * Added additional ordinal classifications:

      * Power of ω
      * Tower of ω
      * ε Ordinal
      * Veblen Ordinal
      * Feferman–Schütte Ordinal
      * Bachmann–Howard Ordinal
      * Buchholz Ordinal
    * Added an **FPS counter** to the UI.
    * Added an initial **usage/tutorial hint** explaining:

      * Arrow keys
      * Mouse drag and wheel
      * `A` / `S` rendering depth controls
      * `M` notation switching
      * `Ctrl` / `Shift` sensitivity controls
      * Config Menu
    * Added an **“I understand”** button to dismiss the hint.
    * Added `dismissHint()` functionality with a fade-out transition.
    * Added `dynamicLabels` as a dedicated container for dynamically generated labels.
    * Added continuous canvas resize checking to handle layout changes, including mobile browser address-bar changes.
    * Added preservation of the current camera view proportions when resizing the canvas.
    * Added support for selecting the active notation display mode through `config.mode`.
    * Added `LPrSS.js` as a notation preset/library.
    * Added `README.md` to the project.

  * **Changes:**

    * Expanded `BMS.js` considerably:

      * Added support for multiple display modes.
      * Added `2 shifted-OCF` conversion/display support.
      * Expanded ordinal classification logic.
      * Added fallback handling for larger ordinal values.
      * Updated comments and internal structure.
    * Changed the default notation loaded at startup from **BMS** to **LPrSS**.
    * Changed the preset menu entry from the previous **HPrSS** preset to **LPrSS**.
    * Changed the configuration menu width from `90%` to a fixed `400px`.
    * Changed the textarea resize behavior from `vertical` to `auto`.
    * Changed tick-label rendering sensitivity from a fixed `80` value to `canvas.width / 8`, making it responsive to canvas size.
    * Changed ordinal label generation to use the currently selected display mode instead of always using the first display mode.
    * Changed FPS calculation from a rolling frame-count method to a frame-time-based calculation.
    * FPS is now displayed with one decimal place.
    * Reworked canvas resizing so the current viewport is preserved proportionally.
    * Added automatic re-rendering after canvas size changes.
    * Changed dynamically generated labels to be placed inside `#dynamicLabels`.
    * Updated the text-label positioning to explicitly use `position: absolute`.
    * Removed `touch-action: none` from the canvas CSS.
    * Added `overflow: hidden` to the text overlay.
    * Changed the canvas overlay structure to accommodate persistent UI elements such as the FPS counter and sample label.

  * **Fixes:**

    * Fixed the rendering system losing the user's current viewport when the browser/canvas is resized.
    * Improved handling of mobile viewport/layout changes caused by browser UI resizing.
    * Fixed dynamically generated labels being removed together with persistent overlay UI by separating them into `#dynamicLabels`.
    * Fixed the FPS display so it reflects the current frame rate rather than only counting frames accumulated during the previous second.
    * Fixed ordinal labels so they use the currently selected notation mode.
    * Improved responsive tick-label generation by scaling the rendering threshold with canvas width.
    * Improved UI interaction by allowing the tutorial hint to be completely removed after dismissal.


</details>























































* **v1.3** — https://rngdelak.github.io/ord-generalized/versions/version%201.3/ <details>
  * **Description:**

    * Version 1.3 introduces **high-precision BigInt-based viewport calculations** to improve zooming, panning, subdivision, and rendering accuracy at extreme zoom levels.
    * The default notation is switched back from **LPrSS to BMS**.
    * The LPrSS preset is removed from the project.
    * Rendering/resizing logic is consolidated into `plot.js`.
    * A new ordinal alias, **First 67 Ordinal**, is added as an Easter egg.

  * **Added:**

    * Added adaptive precision scaling using `BigInt`.

      * `PRECISION_SCALE` dynamically increases as the user zooms in.
      * The viewport is rescaled when precision requirements change.
    * Added `toBigInt()` and `toNum()` conversion helpers for high-precision coordinate calculations.
    * Added `converge1BigInt()` and `segmentBigInt()` to perform rendering subdivision using BigInt coordinates.
    * Added high-precision support to:

      * Canvas panning
      * Mouse zooming
      * Touch zooming/panning
      * Keyboard movement
      * Recursive ordinal segmentation
      * Sampling
      * Viewport clamping
    * Added **First 67 Ordinal** to the BMS ordinal aliases as an Easter egg.
    * Added a safeguard in `sampleHighPrecision()` to display `Lim(BMS)` when sampling reaches the viewport limit.

  * **Changes:**

    * Changed the default notation from **LPrSS** back to **BMS**.
    * Removed `Libs/LPrSS.js` from the project.
    * Removed the LPrSS option from the preset selector.
    * Moved `resizeCanvas()` from `render.js` into `plot.js`.
    * Removed the continuous resize-check loop from `render.js`.
    * Rendering now uses BigInt coordinates internally while converting back to normal numbers only when drawing to the canvas.
    * Changed `cam.view.x0` and `cam.view.x1` from JavaScript `Number` values to `BigInt` values.
    * Mouse, touch, wheel, and keyboard camera controls were rewritten to operate with BigInt precision.
    * Adaptive precision is recalculated before each render.
    * `clearTextLabels()` now safely handles cases where `dynamicLabels` does not exist by falling back to the main UI container.
    * Simplified several touch and rendering code paths and removed redundant comments.
    * Updated the README from the previous minimal project title to a short project description and usage note.

  * **Fixes:**

    * Fixed loss of numerical precision when zooming deeply into the number line.
    * Improved stability of very small viewport calculations.
    * Prevented floating-point rounding errors from accumulating during repeated zoom/pan operations.
    * Improved recursive segment positioning at extreme zoom levels.
    * Improved viewport boundary calculations by using high-precision integer coordinates.
    * Improved high-precision sampling so it correctly handles the case where the sample point reaches the viewport limit.
    * Improved resize behavior by keeping viewport coordinates in the same high-precision system used by rendering.
    * Prevented errors when the dynamic label container is unavailable.


</details>























































* **v1.4** — https://rngdelak.github.io/ord-generalized/versions/version%201.4/ <details>
  * **Description:** The release only includes a minor update to the project documentation.
  * **Changes:** * Updated `README.md` with a minor documentation/text change.


</details>
























































* **v1.5** — https://rngdelak.github.io/ord-generalized/versions/version%201.5/ <details>
  * **Description:**

    * Version 1.5 reintroduces **HPrSS** as an available notation preset and improves the rendering system so special values such as `Limit` are handled by the active notation library instead of being hard-coded to BMS.
    * The BMS notation now explicitly displays its `Limit` value as `Lim(BMS)`.

  * **Added:**

    * Added **HPrSS** to the Tutorial Presets / Notation System selector.
    * Added `Libs/HPrSS.js` back into the project.
    * Added explicit `Limit` handling to `BMS.js`, displaying it as `Lim(BMS)`.
    * Added an explicit BMS preset selection in `ui.js` during page initialization.

  * **Changes:**

    * Changed `plot.js` so the sample label uses:

      * `notation.display(notation.Limit)`
      * instead of hard-coded `"Lim(BMS)"`.
    * Changed ordinal labels so `notation.display()` is responsible for formatting the `Limit` value.
    * Changed alias comparison logic to compare directly against each alias definition instead of separately converting the `"Limit"` string to `notation.Limit`.
    * The application continues to start with **BMS selected by default**, while HPrSS is now available as an alternative preset.
    * Updated project documentation in `README.md`.

  * **Fixes:**

    * Fixed the rendering layer being tightly coupled to BMS-specific `Limit` text.
    * Fixed `Limit` labels not being delegated to the currently active notation system.
    * Improved compatibility when switching between BMS and HPrSS notation.
    * Fixed the potential mismatch where an alias definition of `"Limit"` was treated differently from other ordinal definitions.


</details>























































* **v1.6** — https://rngdelak.github.io/ord-generalized/versions/version%201.6/ <details>
  * **Description:**

    * Version 1.6 restores **LPrSS** as an available notation preset and improves the custom notation/script execution system.
    * Custom scripts are now syntax-validated before being executed, and runtime errors provide more detailed diagnostic information.

  * **Added:**

    * Added **LPrSS** back to the Tutorial Presets / Notation System selector.
    * Added `Libs/LPrSS.js` to the project.
    * Added pre-execution JavaScript syntax validation for custom scripts.
    * Added a `sourceURL` (`InjectedCustomCode.js`) to injected custom scripts to make debugging easier.
    * Added separate error reporting for:

      * Syntax errors
      * Runtime errors
    * Runtime errors now include the JavaScript stack trace.

  * **Changes:**

    * Reworked `executeCustomScript()` in `ui.js`.
    * Custom code is now inserted directly as an inline `<script>` instead of being loaded through a generated Blob URL.
    * The previous Blob URL creation/revocation workflow was removed.
    * Syntax validation now happens before the existing notation script is removed.
    * Error messages are now more specific:

      * `Syntax Error` for invalid JavaScript.
      * `Runtime Error` for failures during execution.
    * The custom script is still reinitialized through `init()` after successful injection.
    * The notation selector now contains three presets:

      * BMS
      * HPrSS
      * LPrSS

  * **Fixes:**

    * Fixed poor error visibility when custom notation code contains invalid JavaScript.
    * Prevents a malformed custom script from replacing the currently loaded notation before its syntax has been validated.
    * Improved debugging of runtime errors by exposing the stack trace.
    * Improved identification of errors originating from injected custom code through the `InjectedCustomCode.js` source label.


</details>























































* **v1.7** — https://rngdelak.github.io/ord-generalized/versions/version%201.7/ <details>
  * **Description:**

    * Version 1.7 significantly expands ordinal classification in **BMS** and **LPrSS**, allowing more specific identification of ordinal classes such as ε, Veblen, Bachmann–Howard, and Buchholz ordinals.
    * The rendering system now exposes the number of tick labels as a configurable setting.
    * LPrSS notation conversion functions were corrected to use the proper `SPrSS` naming.

  * **Added:**

    * Added more detailed ordinal classification in `BMS.js`, including:

      * Power of ω
      * ε Ordinal
      * Veblen Ordinal
      * Feferman–Schütte Ordinal
      * Bachmann–Howard Ordinal
      * Buchholz Ordinal
    * Added **ε Ordinal** and **Veblen Ordinal** to the BMS classification legend.
    * Added more detailed classification logic to `LPrSS.js`:

      * Limit Ordinal
      * Power of ω
      * ε Ordinal
      * Veblen Ordinal
      * Tower of ω
    * Added `labelscount` to the plot configuration, with a default value of `8`.
    * Added more explicit comments describing the ordinal-classification logic.

  * **Changes:**

    * Reworked `BMS.classifyOrdinal()` to identify ordinal classes based on the structure and position of terms rather than the simpler zero-count approach used previously.
    * Reworked `LPrSS.classifyOrdinal()` to distinguish between ordinary limits, powers of ω, ε ordinals, and higher Veblen-style ordinals.
    * Changed the tick-label subdivision calculation in `plot.js` from a hard-coded `canvas.width / 8` to `canvas.width / config.labelscount`.
    * Renamed LPrSS conversion functions:

      * `LPrSS_to_Veblen()` → `SPrSS_to_Veblen()`
      * `Veblen_to_LPrSS()` → `Veblen_to_SPrSS()`
    * Updated all internal calls to use the renamed `SPrSS` functions.
    * Cleaned up formatting and readability in the classification code.

  * **Fixes:**

    * Fixed the LPrSS conversion functions using an incorrect `LPrSS` function name where the implementation is actually based on the SPrSS representation.
    * Improved ordinal classification so more complex ordinals are not incorrectly grouped into the generic limit category.
    * Improved detection of ε and Veblen-style ordinals in LPrSS.
    * Improved detection of higher BMS ordinal classes including Feferman–Schütte, Bachmann–Howard, and Buchholz ranges.
    * Removed the hard-coded tick-label count from the rendering calculation, making it configurable.


</details>























































* **v1.8** — https://rngdelak.github.io/ord-generalized/versions/version%201.8/ <details>
  * **Description:**

    * Version 1.8 introduces **BSM** as a new notation system/preset.
    * The new BSM implementation provides its own parsing, comparison, expansion, display, classification, and BMS-to-OCF conversion logic.
    * BSM is added to the notation selector alongside BMS, HPrSS, and LPrSS.

  * **Added:**

    * Added `Libs/BSM.js`.
    * Added a **BSM** option to the Tutorial Presets / Notation System selector.
    * Added a **BSM (BMS Optimized)** option to the selector.
    * Added a complete BSM notation implementation, including:

      * Ordinal parsing and unparsing
      * Zero / successor detection
      * Ordinal comparison
      * Fundamental sequences
      * Ordinal expansion
      * Matrix conversion
      * Ordinal display
      * Ordinal classification
      * BMS → OCF conversion
    * Added BSM support for the existing ordinal categories:

      * Zero
      * Successor Ordinal
      * Limit Ordinal
      * Power of ω
      * Tower of ω
      * ε Ordinal
      * Veblen Ordinal
      * Feferman–Schütte Ordinal
      * Bachmann–Howard Ordinal
      * Buchholz Ordinal

  * **Changes:**

    * Expanded the notation preset list in `index.html` from four entries to six.
    * BMS remains the default notation.
    * The new BSM implementation uses `ψ(B(ω))` as its limit notation.
    * BSM provides its own display modes, including normal BSM notation and BMS-to-OCF conversion.
    * Added BSM-specific aliases such as:

      * `0`
      * `1`
      * `ω`
      * `ω^ω`
      * `ε₀`
      * `ψ(B(ω))`

  * **Fixes:**

    * No existing bugs in Version 1.7 were modified in the existing BMS, HPrSS, or LPrSS implementations.
    * The new BSM implementation provides a separate notation implementation rather than modifying the existing BMS logic.


</details>























































* **v1.9** — https://rngdelak.github.io/ord-generalized/versions/version%201.9/ <details>
  * **Description:**

    * Version 1.9 introduces a new **Worm (Ackermann Worm)** notation as an example of how to inject a custom notation module.
    * The rendering configuration is significantly expanded, allowing multiple notation display modes, customizable label/tick behavior, colors, spacing, and slow-mode rendering.
    * A new **Slow Mode** allows the user to select a rectangular horizontal region to zoom into instead of using normal continuous zooming.
    * Viewport history and **Ctrl/Cmd + Z** undo support are added.
    * The project README is expanded into a complete guide for creating and injecting custom notation modules.

  * **Added:**

    * Added `Libs/Worm.js` containing a complete example notation system based on an **Ackermann Worm** representation.
    * Added the **Worm** preset to the notation selector.
    * Added a direct README link explaining how to inject custom notation code.
    * Added a comprehensive custom-notation example to `README.md`.
    * Added support for multiple simultaneously displayed notation modes through `config.modes`.
    * Added configurable rendering options including:

      * `MathstickMode`
      * `DiagonalTickArrangement`
      * `ZoomIntoMouse`
      * Label spacing and offsets
      * Timeline label offset/color
      * Slow Mode
      * Slow Mode tick spacing
      * Tick spacing/height/width/anchor
      * Tick/sample/label coloring
      * FPS precision
    * Added **Slow Mode** rectangle selection for zooming.
    * Added viewport history with up to 50 previous view states.
    * Added **Ctrl+Z / Cmd+Z** viewport undo.
    * Added a live depth display showing either `Depth: Infinite` or the current rendering depth.
    * Added support for displaying multiple notation representations stacked vertically on timeline and sample labels.

  * **Changes:**

    * Changed `config.mode` from a single notation mode to `config.modes`, allowing multiple display modes simultaneously.
    * Changed the sample label to render every selected notation mode rather than only one.
    * Changed timeline labels to render every selected notation mode.
    * Added configurable vertical spacing between stacked notation labels.
    * Added configurable timeline label offset.
    * Changed the BMS Buchholz classification color from `#a0a0a0` to `#3f3f3f`.
    * Changed the BSM Buchholz classification color from `#a0a0a0` to `#3f3f3f`.
    * Changed BSM's display condition around its BMS/optimized representation, reversing the comparison condition.
    * Renamed the BSM preset in the UI to **“BSM (Optimized BMS)”**.
    * Removed the duplicate BSM preset entry and replaced it with the Worm preset.
    * Updated the usage hint to describe `A/S` together rather than separately.
    * Added warnings/links directing users to the custom-code injection documentation.
    * Updated `LPrSS.js` documentation from `phi(0,w)` to `phi(0,ω)`.
    * Removed the previous safety break that stopped a rendering loop after 1000 iterations.
    * Added slow-mode handling to both mouse and touch controls.
    * Normal wheel zooming and keyboard movement are disabled while Slow Mode is active.
    * Added viewport history before Slow Mode zoom operations.
    * Updated `M` notation switching to work with the new `config.modes` structure.

  * **Fixes:**

    * Fixed the BSM optimized-display condition so the appropriate representation is selected for larger BMS values.
    * Improved Buchholz ordinal visualization by changing its classification color to a darker, more distinguishable value.
    * Improved custom notation integration by providing a complete working example through `Worm.js`.
    * Improved viewport navigation by allowing users to undo an accidental zoom using Ctrl/Cmd+Z.
    * Improved multi-notation label positioning so stacked labels do not overlap.
    * Improved touch interaction by supporting Slow Mode rectangle selection on mobile/touch devices.
    * Improved rendering-depth feedback by displaying the current depth directly in the UI.


</details>























































* **v1.10** — https://rngdelak.github.io/ord-generalized/versions/version%201.10/ <details>
  * **Description:**

    * Version 1.10 expands the notation system with four new experimental notation presets: **EBOCF, cOCF, TON, and n-shifted OCF**.
    * The notation UI is redesigned so users can dynamically add, remove, and switch between multiple display notations.
    * Viewport navigation is improved with a dedicated **Revert** button and better viewport-history handling.
    * Mobile users now have dedicated **depth adjustment controls**.
    * Configuration handling is made more robust when switching notation presets or applying custom configuration.

  * **Added:**

    * Added four experimental notation libraries:

      * `EBO.js` — EBOCF notation.
      * `cOCF.js` — collapsing OCF notation.
      * `TON.js` — Taranovsky's notation.
      * `n-shifted-OCF.js` — n-shifted OCF / HSPN notation.
    * Added the four experimental notation presets to the configuration menu.
    * Added a **Revert** button for restoring the previous viewport.
    * Added mobile depth controls:

      * `−` decreases rendering depth.
      * `+` increases rendering depth.
      * Current depth is displayed between the buttons.
    * Added a dedicated **notation controls** area directly on the canvas.
    * Added **+ Add notation** functionality.
    * Added a remove button for each active notation.
    * Added dynamic notation selectors that are generated from the active notation's `DisplayName` list.
    * Added `resetNotationsForSystem()` to initialize display modes according to the loaded notation system.
    * Added `adjustDepth()` for changing rendering depth from the UI.
    * Added an initial configuration backup for restoring default configuration when injecting notation scripts.

  * **Changes:**

    * Removed **BSM (Optimized BMS)** from the preset selector.
    * Removed `Libs/BSM.js` from the project.
    * The preset list is now:

      * BMS
      * HPrSS
      * LPrSS
      * Worm
      * EBOCF
      * cOCF
      * TON
      * n-shifted OCF
    * Changed the timeline label color from `#ffffff` to `#808080`.
    * Removed the dedicated `SlowModeTickSpacing` configuration option.
    * Reworked viewport history from a separate `viewportHistory` array into `cam.history`.
    * Reworked Slow Mode selection state from `slowModeRect` into `cam.selection`.
    * Slow Mode now uses an HTML overlay rectangle instead of drawing the selection directly onto the canvas.
    * Changed Slow Mode selection zoom so the selected horizontal region is converted directly into a new viewport.
    * Added the Revert button as another way to invoke viewport undo.
    * Changed keyboard undo handling so Ctrl/Cmd+Z is processed together with the other keyboard controls.
    * Keyboard navigation is now explicitly disabled while Slow Mode is active.
    * Touch Slow Mode was rewritten to use the same selection-box mechanism as mouse input.
    * Reduced the sample label font size from `40px` to `30px` and moved it upward.
    * Changed the page's default font family from `Arial` to `Serif`.
    * Changed `sampleHighPrecision()` to display only the first active notation mode rather than all active modes.
    * Timeline labels continue to support multiple active notation modes, with their stacking order adjusted to match the sample display.
    * Slow Mode now displays a visible **“Slow Mode Enabled”** indicator.
    * `applyInjectedConfig()` now ignores an empty configuration textarea instead of replacing the existing configuration with an empty object.
    * Loading a notation preset now resets its active display modes according to the notation module's own configuration.
    * Injected notation configuration is now merged with a saved initial/default configuration before rendering.
    * The notation UI is rebuilt whenever the active notation system changes.

  * **Fixes:**

    * Fixed configuration state from one notation system carrying over incorrectly when another notation preset is loaded.
    * Fixed notation display modes not being initialized according to the newly loaded notation.
    * Fixed empty custom configuration input from unnecessarily modifying the current configuration.
    * Improved viewport undo/revert reliability by keeping history directly with the camera state.
    * Improved Slow Mode selection behavior by using a dedicated overlay rather than repeatedly rendering the selection rectangle.
    * Improved touch Slow Mode interaction so it uses the same selection mechanism as mouse input.
    * Improved rendering performance during Slow Mode by avoiding continuous heavy canvas rendering while the selection rectangle is being dragged.
    * Improved usability on mobile by providing direct controls for rendering depth.


</details>























































* **v1.11** — https://rngdelak.github.io/ord-generalized/versions/version%201.11/ <details>
  * **Description:**

    * Version 1.11 consolidates the rendering-related code into `plot.js` and removes the separate `render.js` file.
    * The HTML script-loading structure is simplified accordingly.
    * The notation libraries themselves are unchanged from Version 1.10.
    * However, several important functions that existed in Version 1.10 appear to have been removed during the refactoring, including the main `render()`, `resizeCanvas()`, and `init()` functions.

  * **Added:**

    * Moved the rendering setup from `render.js` into `plot.js`.

      * Canvas initialization
      * Canvas drawing helpers
      * Text-label creation
      * Text-label cleanup
    * Added `window.notation = null` to `plot.js`.
    * `plot.js` now owns both the plotting calculations and the basic canvas-rendering helpers.

  * **Changes:**

    * Removed `render.js` from the project.
    * Removed the `<script src="render.js"></script>` reference from `index.html`.
    * Removed the separate `window.notation = null` initialization from `index.html`.
    * The remaining scripts are now loaded as:

      * `Libs/BMS.js`
      * `plot.js`
      * `ui.js`
    * Moved `createTextLabel()` and `clearTextLabels()` into `plot.js`.
    * The notation libraries remain unchanged from Version 1.10.
    * The project therefore has a simpler rendering-file structure, with `plot.js` becoming the main plotting/rendering module.

  * **Fixes:**

    * Reduced duplication between the plotting and rendering modules by consolidating canvas helper functions.
    * Simplified the HTML script-loading structure by removing the separate rendering script.
    * Centralized the `window.notation` initialization in JavaScript rather than the HTML page.
    * **Potential regression requiring verification:** Version 1.11 no longer contains the `render()`, `resizeCanvas()`, and `init()` functions that were present in Version 1.10.
    * **Potential regression:** Mouse, touch, wheel, keyboard-navigation, Slow Mode, viewport-history, and resize handlers that were located after these functions in Version 1.10's `plot.js` are also absent from Version 1.11.


</details>























































* **v1.12** — https://rngdelak.github.io/ord-generalized/versions/version%201.12/ <details>
  * **Description:**

    * Version 1.12 restores the main rendering, canvas-resizing, initialization, camera-control, Slow Mode, keyboard, mouse, touch, and viewport-history functionality that was missing from Version 1.11.
    * Adds **5 configuration save/load slots** using browser `localStorage`.
    * Expands rendering configuration with customizable default colors and revised label/tick spacing.
    * Fixes BMS handling of the `Limit` value during ordinal classification.

  * **Added:**

    * Added five persistent configuration slots:

      * Slot 1
      * Slot 2
      * Slot 3
      * Slot 4
      * Slot 5
    * Added **Save** and **Load** buttons for configuration slots.
    * Added `saveConfigToSlot()` and `loadConfigFromSlot()` using `localStorage`.
    * Added configurable default rendering colors:

      * `DefaultTickColor`
      * `DefaultSampleColor`
      * `DefaultLabelColor`
    * Added the complete main render loop back to `plot.js`.
    * Added `refreshLoop()` for FPS updates.
    * Added `resizeCanvas()` and `init()`.
    * Added viewport boundary clamping and Slow Mode selection zoom.
    * Added viewport undo/revert support.
    * Added mouse, touch, wheel, and keyboard interaction handlers.
    * Added continuous keyboard navigation processing.
    * Added explicit BMS `Limit` classification handling.

  * **Changes:**

    * Reworked `plot.js` from the incomplete 1.11 rendering refactor into a complete application/rendering module.
    * Restored adaptive precision handling and BigInt coordinate conversion.
    * Changed the default `ZoomIntoMouse` configuration from `true` to `false`.
    * Changed default label spacing:

      * `LabelBetweenTimelineSpacing`: `0` → `5`
      * `LabelBetweenTickSpacing`: `0` → `5`
      * `LabelBetweenLabelSpacing`: `10` → `27`
      * `TickBetweenLabelXoffest`: `0` → `-5`
    * Changed `TickAnchorPoint` from `0` to `0.5`.
    * Changed FPS precision from `2` to `1`.
    * Added explicit default colors for ticks, samples, and labels.
    * Changed canvas/camera dimensions to be initialized at `0` and populated during canvas resizing.
    * Updated timeline-label rendering to respect:

      * Tick anchor position
      * Configurable label spacing
      * Configurable label offsets
      * Configurable label colors
    * Updated sample rendering to apply the configured default sample color when classification coloring is disabled.
    * Updated tick rendering to use `DefaultTickColor` when `ColorTick` is disabled.
    * Updated the configuration menu with the new save/load slot controls.
    * Simplified some UI formatting and JavaScript error-handling code.

  * **Fixes:**

    * Fixed the major Version 1.11 regression where the main `render()` function was missing.
    * Restored `resizeCanvas()` so the application can correctly initialize and respond to window resizing.
    * Restored `init()` so the camera and rendering state can be initialized properly.
    * Restored mouse drag/pan and zoom interaction.
    * Restored wheel zoom.
    * Restored keyboard navigation and depth controls.
    * Restored touch interaction.
    * Restored Slow Mode rectangle selection and zoom.
    * Restored viewport history and Ctrl/Cmd+Z functionality.
    * Restored the FPS update loop.
    * Restored the main application startup sequence.
    * Fixed BMS `Limit` values being passed through `classifyOrdinal()` without explicit handling.
    * Improved configuration persistence by allowing users to save and restore custom environment configurations.


---

## Version 2 Series (2.0 → 2.18)

**Overview:** These versions are very complete, though there were still some bugs fixed overall after v2.9.  
**Major Updates:** Formalized sharing transfinite number line notations (v2.10), added find ordinal (v2.2), and set viewport state (v2.7).






















































* **v2.0** — https://rngdelak.github.io/ord-generalized/versions/version%202.0/ <details>
  * **Description:**

    * Version 2.0 consolidates the notation explorer into a more mature and extensible interface.
    * The existing notation systems are retained, while notation selection and display-mode management are made more dynamic.
    * Configuration handling is improved with persistent save/load slots, custom notation injection, and automatic notation configuration management.
    * Rendering and navigation controls are further refined, including Slow Mode, viewport history, adaptive precision, depth controls, and customizable visual settings.
    * The project documentation is expanded to explain how developers can create and inject their own notation systems.

  * **Added:**

    * Added dynamic notation management:

      * Add multiple notation display modes.
      * Remove active notation modes.
      * Automatically populate notation selectors from `notation.DisplayName`.
    * Added support for displaying multiple notation representations on the sampled ordinal when `MultipleNotationOnSample` is enabled.
    * Added five persistent configuration slots using browser `localStorage`.
    * Added Save/Load configuration controls.
    * Added customizable default rendering colors:

      * Tick color
      * Sample color
      * Label color
    * Added configurable FPS precision.
    * Added configurable tick anchor position.
    * Added more configurable label spacing and positioning.
    * Added an expanded custom-notation injection framework.
    * Added automatic restoration of the initial configuration when changing injected notation code.
    * Added detailed documentation and an example implementation for creating custom notation systems.
    * Added dynamic notation configuration UI generation.
    * Added support for the existing experimental notation systems:

      * EBOCF
      * cOCF
      * TON
      * n-shifted OCF
      * Worm
    * Added/retained the mobile rendering-depth controls and Slow Mode controls as part of the unified interface.

  * **Changes:**

    * Reworked the notation UI so it is no longer tied to a fixed number of display modes.
    * `config.modes` is now the central representation of active notation display modes.
    * Changed sample rendering so it can show either:

      * only the first active notation mode, or
      * all active notation modes when `MultipleNotationOnSample` is enabled.
    * Changed notation initialization so each notation system can provide its own `DisplayName` list and default modes.
    * Changed custom-script loading so the current notation/configuration state is restored when switching injected notation systems.
    * Continued the rendering consolidation introduced in Version 1.11/1.12, with plotting, rendering, camera, interaction, and precision logic centralized in `plot.js`.
    * Maintained BigInt-based viewport calculations and adaptive precision for deep zooming.
    * Changed default rendering behavior to:

      * `ZoomIntoMouse: false`
      * `TickAnchorPoint: 0.5`
      * `LabelBetweenTimelineSpacing: 5`
      * `LabelBetweenTickSpacing: 5`
      * `LabelBetweenLabelSpacing: 27`
      * `TickBetweenLabelXoffest: -5`
    * Changed the sample display system to respect the active notation configuration instead of assuming a single representation.
    * Updated the configuration UI to expose the expanded rendering settings.
    * Expanded README documentation with the required interface and implementation pattern for custom notation modules.

  * **Fixes:**

    * Fixed notation display controls being dependent on hard-coded display-mode counts.
    * Fixed configuration state carrying over incorrectly between different notation systems.
    * Improved restoration of the application's initial configuration after custom notation injection.
    * Improved persistence of user rendering configurations through browser storage.
    * Improved label positioning and reduced overlap between multiple notation representations.
    * Improved sample-label handling when multiple notation modes are active.
    * Improved rendering customization by separating notation classification colors from user-defined default colors.
    * Improved viewport navigation through the existing Slow Mode and history/revert system.
    * Improved canvas rendering stability through continued use of high-precision BigInt viewport coordinates.
    * Improved custom notation compatibility by documenting and enforcing the expected `window.notation` interface.


</details>























































* **v2.1** — https://rngdelak.github.io/ord-generalized/versions/version%202.1/ <details>
  * **Description:**

    * Version 2.1 adds finer control over rendering depth, interval subdivision, harmonic interval spacing, and BigInt precision.
    * Rendering state is made more configuration-driven, with `MaxIntervalDepth` replacing the previous camera-level depth setting.
    * The Config Menu now synchronizes the current configuration back into the configuration textarea when opened.
    * Settings-menu protection is improved so navigation and notation controls cannot accidentally modify the visualization while the configuration UI is open.
    * A new `controls.js` file is introduced to contain rendering and interaction controls.

  * **Added:**

    * Added `controls.js` containing:

      * `render()`
      * `resizeCanvas()`
      * `init()`
      * Mouse controls
      * Touch controls
      * Wheel zoom
      * Keyboard navigation
      * Slow Mode selection
      * Viewport undo
      * Depth controls
      * Keyboard update loop
    * Added `HarmonicInvtervalSpacing` configuration option.
    * Added `MaxIntervalsDivision` configuration option to limit how many interval subdivisions are generated.
    * Added `MaxIntervalDepth` configuration option to limit recursive rendering depth.
    * Added `BigIntPrecisionMantissa` configuration option to control the additional precision margin used by adaptive BigInt scaling.
    * Added cached DOM references for:

      * Depth display
      * Sample label
      * FPS counter.

  * **Changes:**

    * Changed adaptive BigInt precision calculation to use `config.BigIntPrecisionMantissa` instead of the hard-coded precision margin of `8`.
    * Changed rendering-depth control from `cam.view.maxDepth` to `config.MaxIntervalDepth`.
    * Changed interval recursion so it can stop based on `config.MaxIntervalDepth`.
    * Added an optional maximum number of interval divisions through `MaxIntervalsDivision`.
    * Added an optional harmonic interval-spacing mode.
    * Changed the Config Menu button so opening it automatically synchronizes the current configuration into the configuration textarea.
    * Changed viewport undo so it is disabled while the Settings Menu is open.
    * Changed keyboard depth controls (`A` / `S`) to modify `config.MaxIntervalDepth`.
    * Changed mobile depth controls to modify `config.MaxIntervalDepth`.
    * Added settings-menu guards to notation removal/addition controls.
    * Added settings-menu guards to configuration depth manipulation.
    * Simplified `DOMContentLoaded` initialization so the initial configuration backup is always created directly from the current configuration.
    * Cached frequently used DOM elements instead of repeatedly calling `document.getElementById()`.
    * Added Slow Mode notifications after configuration injection and preset loading when Slow Mode is enabled.
    * Updated the BMS/notation rendering code to use the new configuration-driven depth system.


</details>























































* **v2.2** — https://rngdelak.github.io/ord-generalized/versions/version%202.2/ <details>
  * **Description:**

    * Version 2.2 introduces an **Ordinal Finder** that allows users to enter an ordinal expression and automatically navigate/zoom the timeline toward that ordinal.
    * The finder uses the currently loaded notation's `parse()` function and high-precision viewport calculations.
    * BMS gains a real string parser, allowing BMS ordinal expressions such as matrix notation to be entered directly.
    * The new finder is enabled by default and appears only when the active notation supports parsing.

  * **Added:**

    * Added an **Ordinal Finder** UI at the bottom of the canvas.
    * Added an ordinal input field for entering an ordinal expression.
    * Added a precision/mantissa input field for controlling the finder precision.
    * Added a **Find** button to locate and zoom to the entered ordinal.
    * Added `EnableOrdinalFinder` configuration option, enabled by default.
    * Added `checkAndInitOrdinalFinder()` to automatically show/hide the finder depending on whether the active notation provides `parse()`.
    * Added `findOrdinalPathBigInt()` for high-precision ordinal-to-viewport navigation.
    * Added `findAndZoomToOrdinal()` to parse the input, locate the ordinal, save the current viewport, and zoom to the result.
    * Added `evaluateOrdinalAtPosition()` for estimating an ordinal at a viewport position.
    * Added a real `parse()` implementation to `BMS.js`.
    * Added `processMatrix()` to normalize parsed BMS matrices to a consistent row width.

  * **Changes:**

    * Changed BMS parsing from simply returning the input unchanged to parsing string representations such as:

      * `(0,1,2)(1,1,0)`
      * Multiple parenthesized matrix rows.
    * BMS parsed rows are now padded with zeroes so matrices have consistent dimensions.
    * The BMS OCF conversion now uses the generalized `processMatrix(matrix, 3)` helper.
    * The ordinal finder automatically sets rendering depth to **Infinite** after locating an ordinal.
    * Finding an ordinal automatically adds the previous viewport to `cam.history`, allowing the user to revert.
    * Finder zooming uses BigInt coordinates to maintain precision at deep zoom levels.
    * The finder only appears when:

      * The current notation provides a `parse()` function.
      * `EnableOrdinalFinder` is enabled.
    * The finder is re-evaluated after:

      * Custom notation injection.
      * Preset changes.
      * Initial application startup.
    * Removed `parse` from the exported interface of:

      * EBOCF
      * TON
      * cOCF
      * n-shifted OCF
    * As a result, those notation systems no longer expose the parsing capability required by the new Ordinal Finder.

  * **Fixes:**

    * Fixed BMS not being able to convert user-entered ordinal strings into internal matrix representations.
    * Improved BMS matrix consistency by padding shorter rows during parsing.
    * Improved navigation accuracy when locating ordinals by using BigInt viewport calculations.
    * Prevented the Ordinal Finder from being displayed for notation systems that do not support parsing.
    * Preserved the previous viewport before an ordinal-search operation so the user can undo/revert the navigation.
    * Improved integration between notation switching and optional parsing capabilities.


</details>























































* **v2.3** — https://rngdelak.github.io/ord-generalized/versions/version%202.3/ <details>
  * **Description:**

    * Version 2.3 refines the Ordinal Finder and rendering system introduced in Version 2.2.
    * The application now exposes parsing support more consistently across the notation libraries, while the Finder remains integrated with high-precision navigation.
    * Rendering/configuration controls from 2.1–2.2 remain in place, including interval-depth limits, harmonic spacing, BigInt precision, multiple notation modes, and the Ordinal Finder.
    * The project structure is simplified again by keeping the rendering/control logic inside `plot.js` and `ui.js`.

  * **Added:**

    * Added/retained `parse()` implementations across the notation libraries, including:

      * BMS
      * cOCF
      * EBOCF
      * HPrSS
      * LPrSS
      * n-shifted OCF
      * TON
      * Worm
    * Added/retained the Ordinal Finder controls:

      * Ordinal input
      * Precision/mantissa input
      * Find button
    * Added/retained configurable Ordinal Finder support through `EnableOrdinalFinder`.
    * Added/retained harmonic interval spacing controls.
    * Added/retained maximum interval depth and interval subdivision controls.
    * Added/retained configurable BigInt precision.
    * Added/retained multiple-notation display support.

  * **Changes:**

    * The notation system is now much more uniformly compatible with the `parse()` interface used by the Ordinal Finder.
    * Unlike the state described for Version 2.2, the current 2.3 package contains `parse()` functions in the experimental notation libraries as well, making them eligible for direct ordinal input/navigation where their parser is implemented.
    * Rendering and interaction logic is consolidated in `plot.js`; there is no separate `controls.js` in the 2.3 package.
    * The UI continues to rebuild notation controls dynamically based on the active notation system.
    * The configuration UI continues to expose the newer rendering controls introduced in 2.1.
    * The usage instructions have been updated to mention harmonic interval spacing and its lag-related behavior.

  * **Fixes:**

    * Improved compatibility between the Ordinal Finder and notation libraries by providing parser implementations across the available notation systems.
    * Improved the ability to directly navigate to user-entered ordinal expressions rather than restricting the Finder to BMS.
    * Improved rendering responsiveness through the configurable interval/subdivision limits.
    * Improved usability of harmonic interval spacing, including guidance that it can help address rendering lag.
    * Simplified the control/rendering architecture by avoiding a separate `controls.js` dependency.


</details>























































* **v2.4** — https://rngdelak.github.io/ord-generalized/versions/version%202.4/ <details>
  * **Description:**

    * Version 2.4 expands the rendering configuration system with controls for showing/hiding HUD elements, ticks, labels, samples, legends, and navigation controls.
    * Adds a configurable center division line that can appear during interaction or while idle.
    * Improves the visual configuration of the canvas, FPS indicator, depth controls, and notation controls.
    * Reworks **Worm** from a simple array-of-exponents representation into a coefficient-based ordinal representation, making its arithmetic, parsing, display, and aliases more expressive.
    * The HTML/CSS structure is cleaned up so visual elements can be controlled through the configuration system.

  * **Added:**

    * Added configurable canvas/background color through `BackgroundColor`.
    * Added HUD visibility controls:

      * `ShowHUD`
      * `ShowLegends`
      * `ShowTitle`
      * `ShowFPS`
      * `ShowDepthAdjustGui`
      * `ShowOrdinalNotationConfigGui`
    * Added rendering-element visibility controls:

      * `ShowTick`
      * `ShowSample`
      * `ShowLabel`
      * `ShowTimelineLabel`
    * Added division-line controls:

      * `AlwaysShowDivisionOnIdle`
      * `AlwaysShowDivisionOnInteraction`
      * `ScreenDivisionLineColor`
    * Added configurable UI colors:

      * `FPSLabelColor`
      * `DepthAdjustGuiColor`
      * `DefaultTimelineLabelColor`
    * Added `isInteracting` state tracking.
    * Added `updateDivisionLine()` to control the center division indicator.
    * Added CSS classes/IDs for independently styling the FPS counter, sample label, and mobile depth controls.
    * Added a more expressive Worm ordinal representation using `[exponent, coefficient]` pairs.
    * Added Worm aliases:

      * `1`
      * `2`
      * `ω`
      * `ω·2`
      * `ω²`
      * `ω³`
      * `ω^ω`
    * Added Worm parsing support for coefficient-based input such as `[2,3],[1,5],[0,8]` and `2,3;1,5;0,8`.

  * **Changes:**

    * Reorganized the `config` object in `plot.js` into logical sections for:

      * Canvas/layout
      * Controls/navigation
      * Rendering modes
      * HUD/UI visibility
      * Element visibility
      * Coloring
      * Tick properties
      * Labels/spacing
      * Computation/performance
    * Changed label spacing defaults:

      * `LabelBetweenTimelineSpacing`: `25` → `30`
      * `LabelBetweenLabelSpacing`: `2` → `25`
    * Changed `clearCanvas()` to use `config.BackgroundColor` instead of a hard-coded black background.
    * Changed sample rendering to respect `ShowSample`.
    * Changed ordinal labels to respect `ShowLabel`.
    * Changed timeline labels to respect `ShowTimelineLabel`.
    * Changed the timeline label color setting from the previous `TimelineLabelColor` concept to `DefaultTimelineLabelColor`.
    * Changed HUD rendering so title, legends, and status indicators can be independently enabled/disabled.
    * Added visible HUD status indicators for:

      * Slow Mode
      * Zoom Into Mouse
    * Changed tick rendering so the entire tick layer can be disabled with `ShowTick`.
    * Added configurable FPS visibility and color.
    * Added configurable mobile depth-control visibility and color.
    * Added configurable notation-control visibility.
    * Added a center division line that responds to mouse/keyboard interaction.
    * Updated `ui.js` to cache frequently used UI elements and apply configuration-driven CSS changes.
    * `applyingCSSUpdate()` now updates the visibility and colors of major UI elements after configuration changes.
    * Reworked Worm's `pretty()`, `fs()`, `cmp()`, `isSuccessor()`, `display()`, `classifyOrdinal()`, and `parse()` functions to operate on `[exponent, coefficient]` pairs.
    * Changed Worm's raw display from:

      * `(0,1,1,2)`
      * to a structured representation such as `[[0,1],[1,2]]`.
    * Changed Worm fundamental sequences to decrement coefficients and append lower-power terms instead of repeating raw exponent values.
    * Changed Worm comparison from simple array comparison to coefficient-aware ordinal comparison.
    * Improved Worm successor detection so it checks the exponent of the final term rather than the final raw array value.

  * **Fixes:**

    * Fixed Worm's internal representation so coefficients are represented explicitly instead of being encoded by repeated exponent values.
    * Fixed Worm pretty-printing so expressions such as `ω·2` and `ω²·3` can be represented correctly.
    * Fixed Worm parsing so coefficient-bearing ordinal expressions can be converted into the new internal representation.
    * Fixed Worm comparison for ordinals containing coefficients.
    * Fixed Worm fundamental-sequence generation to work with the new representation.
    * Fixed successor detection for coefficient-based Worm ordinals.
    * Fixed the rendering system's dependence on hard-coded UI visibility and colors by moving these settings into configuration.
    * Improved rendering behavior when samples, ticks, labels, or timeline labels are disabled.
    * Improved interaction feedback with the configurable center division line.
    * Improved UI synchronization when configuration is injected or changed.


</details>























































* **v2.5** — https://rngdelak.github.io/ord-generalized/versions/version%202.5/ <details>
  * **Description:**

    * Version 2.5 is primarily a code-cleanup and UI-maintenance release.
    * No functional changes were made to the notation libraries, rendering engine, Ordinal Finder, or configuration model.
    * The update removes unused UI references and an unused CSS-update function while cleaning up several JavaScript formatting inconsistencies.

  * **Added:**

    * None.

  * **Changes:**

    * Removed unused `configToggleBtn` and `revertBtn` references from `ui.js`.
    * Removed the unused `applyingCSSUpdate2()` function.
    * Minor cleanup of whitespace and JavaScript formatting throughout `ui.js`.
    * Simplified several conditional expressions in `ui.js`.
    * Added a missing semicolon to the `applyingCSSUpdate()` call.
    * Changed the CSS color value in `index.html` from `#ffffff` to the equivalent shorthand `#fff`.

  * **Fixes:**

    * Removed unused UI code related to `Revert` and `Config Menu` button color updates.
    * Reduced dead code in the configuration/UI layer.
    * Cleaned up minor formatting inconsistencies without changing application behavior.


</details>























































* **v2.6** — https://rngdelak.github.io/ord-generalized/versions/version%202.6/ <details>
  * **Description:**

    * Version 2.6 simplifies the internal representation of the **Worm (Ackermann Worm)** notation.
    * Worm ordinals are changed from explicit `[exponent, coefficient]` pairs back to a simple array of repeated exponents.
    * The rendering system gains configurable logarithmic Mathstick scaling and a configurable middle number-line division.
    * Several previously hard-coded UI and Slow Mode colors are moved into the configuration system.
    * The notation-control UI now exposes an element ID so its color can be configured dynamically.

  * **Added:**

    * Added `MathStick_UseLogarithmLength` configuration option.
    * Added `MathStick_LogarithmBase` configuration option.
    * Added `ShowMiddleNumberLineDivision` configuration option.
    * Added `TitleColor` configuration option.
    * Added `AddNotationBtnColor` configuration option.
    * Added `RemoveNotationBtnColor` configuration option.
    * Added `SelectNotationBoxColor` configuration option.
    * Added `MiddleNumberLineDivisionColor` configuration option.
    * Added `ZoomSelectionFillColor` configuration option.
    * Added `ZoomSelectionBorder` configuration option.
    * Added the `AddNotationBtn` ID to the Add Notation button.
    * Added a configurable middle division line for the number line.
    * Added logarithmic scaling for Mathstick lengths.
    * Added configurable colors for the zoom-selection rectangle.
    * Added configurable colors for notation controls.

  * **Changes:**

    * Changed `maxAllowedWidthFactor` from `0.5` to `0.1`.
    * Changed Worm's internal ordinal representation:

      * **2.5:** `[exponent, coefficient]` pairs.
      * **2.6:** repeated exponent arrays.
    * Simplified Worm's `pretty()` implementation to derive coefficients by counting repeated exponents.
    * Simplified Worm's `cmp()` to lexicographically compare exponent arrays.
    * Simplified Worm's `fs()` to operate directly on exponent arrays.
    * Simplified Worm's `parse()` to parse comma-separated exponent arrays.
    * Changed Worm aliases to the new representation:

      * `1` → `[0]`
      * `ω` → `[1]`
      * `ω²` → `[2]`
      * `ω^ω` → `Limit`
    * Changed Worm raw display from pair-based notation to:

      * `(0,1,1,2)`
    * Changed Worm's default display mode to `pretty`.
    * Added optional logarithmic Mathstick length calculation:

      * Linear mode uses the existing importance value.
      * Logarithmic mode uses `log(importance + 1) / log(base)`.
    * Added the configurable middle number-line division:

      * Diagonal arrangement → diagonal center line.
      * Normal arrangement → horizontal center line.
    * Changed the title color from a hard-coded white value to `config.TitleColor`.
    * Changed the zoom-selection rectangle to use configurable fill and border colors.
    * Changed notation selectors and remove buttons to use configurable colors.
    * Added configuration defaults for previously hard-coded UI colors.


</details>























































* **v2.7** — https://rngdelak.github.io/ord-generalized/versions/version%202.7/ <details>
  * **Description:**

    * Version 2.7 adds an optional **Camera Stats HUD** showing the current zoom level and world position.
    * The new statistics use BigInt-safe formatting so they remain usable at extremely deep zoom levels.
    * The feature is disabled by default through `ShowCurrentPositionState`.
    * A small UI configuration bug from Version 2.6 is also fixed so the Config Menu button uses the correct configured color.

  * **Added:**

    * Added `ShowCurrentPositionState` configuration option.
    * Added a new HUD area containing:

      * Current zoom level.
      * Current world position.
    * Added `formatBigIntZoom()` for formatting extremely large/small zoom ratios without converting the full BigInt value to a JavaScript `Number`.
    * Added `formatBigIntFraction()` for displaying precise world-position fractions.
    * Added `updateCameraStats()` to update the camera statistics during rendering.
    * Added `zoomDisplay` and `posDisplay` elements to the HTML.
    * Added BigInt-based zoom and position calculations using the existing high-precision camera coordinates.

  * **Changes:**

    * Camera statistics are updated during each render when `ShowCurrentPositionState` is enabled.
    * When the camera statistics option is disabled, the zoom and position displays are automatically cleared.
    * Zoom values are displayed in a compact format such as:

      * `1.00x`
      * `100.00x`
      * Scientific-style notation for extremely large zoom values.
    * World position is displayed as a high-precision decimal fraction based on the current viewport.
    * Moved `BackgroundColor` within the configuration structure alongside the other color settings.
    * Minor formatting/whitespace cleanup was made in `plot.js` and `index.html`.

  * **Fixes:**

    * Fixed the Config Menu button color configuration in `ui.js`.
    * The button previously attempted to read `config.configToggleBtn`.
    * It now correctly uses `config.ConfigMenuBtnColor`.
    * Improved camera-stat formatting so deep-zoom BigInt values can be displayed without unsafe floating-point conversion.


</details>























































* **v2.8** — https://rngdelak.github.io/ord-generalized/versions/version%202.8/ <details>
  * **Description:**

    * Version 2.8 introduces a new **Set Viewport** feature that lets users directly enter a world position and zoom level and apply them to the current view.
    * Zoom, pan, and viewport limits are now independently configurable through fencing options.
    * Adaptive BigInt precision calculation is improved so extremely deep zoom levels can be handled without converting the viewport width to a JavaScript `Number`.
    * The Ordinal Finder and Camera Stats UI are reorganized into a unified floating-control area.
    * Keyboard shortcuts are expanded for viewport state and camera statistics.

  * **Added:**

    * Added **Set Viewport** functionality.

      * Position input.
      * Zoom input.
      * Apply button.
    * Added `EnableSetViewPort` configuration option.
    * Added `triggerViewportZoom()` for directly setting the viewport.
    * Added `parseToBigIntScaled()` for parsing decimal/scientific-number strings directly into scaled `BigInt` values.
    * Added support for extremely large decimal/exponential inputs without relying on `parseFloat()`.
    * Added `ZoomOutFencing` configuration option.
    * Added `PanOutFencing` configuration option.
    * Added `panFenceOverlap` configuration option.
    * Added `CurrentPositionStateTextColor` configuration option.
    * Added keyboard shortcuts:

      * `G` — toggle Set Viewport.
      * `I` — toggle Camera Stats / viewport state.
    * Added input keyboard-event isolation so typing into the Set Viewport and Ordinal Finder fields does not trigger global keyboard shortcuts.
    * Added accessible `name` attributes to several form controls and `aria-label`s to depth buttons.

  * **Changes:**

    * Reworked `updateAdaptivePrecisionScale()` to calculate zoom magnitude from the **digit lengths of BigInt values** instead of converting the viewport width to `Number`.
    * Increased the adaptive precision margin using `BigIntPrecisionMantissa`.
    * Changed the viewport control UI:

      * Set Viewport appears at the top.
      * Ordinal Finder moves below it when both are enabled.
      * Both use a unified visual style and fixed dimensions.
    * Changed the Ordinal Finder initialization function from `checkAndInitOrdinalFinder()` to the more general `checkAndInitFloatingGui()`.
    * `checkAndInitFloatingGui()` now controls both:

      * Ordinal Finder visibility.
      * Set Viewport visibility.
    * Changed pan-boundary enforcement so it can be disabled with `PanOutFencing`.
    * Changed zoom-out limits so they can be disabled with `ZoomOutFencing`.
    * Changed the camera statistics HUD so its text color is configurable.
    * Improved timeline-label positioning so label stacking/spacing correctly respects whether labels are actually visible.
    * Added the new Set Viewport controls to the usage instructions.
    * Added the new `G` and `I` keyboard shortcuts to the usage hint.
    * Added `name` attributes to form elements for better HTML semantics/accessibility.

  * **Fixes:**

    * Fixed potential precision loss in adaptive zoom calculations caused by converting extremely large BigInt viewport widths into JavaScript `Number` values.
    * Improved support for very large zoom values and scientific notation in direct viewport input.
    * Prevented viewport-input fields from accidentally triggering application-wide keyboard shortcuts while the user is typing.
    * Improved viewport boundary behavior by making pan and zoom fencing independently configurable.
    * Improved label positioning when timeline labels or notation labels are hidden.
    * Improved consistency between the Camera Stats, Ordinal Finder, and Set Viewport controls.
    * Improved accessibility of several UI controls through explicit form names and depth-control labels.


</details>























































* **v2.9** — https://rngdelak.github.io/ord-generalized/versions/version%202.9/ <details>
  * **Description:**

    * Version 2.9 refines the navigation and configuration system introduced in Version 2.8.
    * The Ordinal Finder and Set Viewport interfaces remain available, but their default activation is changed so they are no longer enabled automatically.
    * The rendering configuration remains centered around high-precision BigInt navigation, configurable fencing, Mathstick behavior, and customizable HUD/UI elements.
    * The custom-notation documentation is retained and simplified around the current notation-module interface.

  * **Added:**

    * No major new user-facing feature was added.
    * Continued support for:

      * Ordinal Finder
      * Set Viewport
      * Camera statistics
      * BigInt precision controls
      * Zoom/pan fencing
      * Mathstick configuration
      * Configurable HUD/UI elements
      * Multiple notation modes

  * **Changes:**

    * Changed `EnableOrdinalFinder` default from **enabled** to **disabled**.
    * Changed `EnableSetViewPort` default from **enabled** to **disabled**.
    * The Ordinal Finder and Set Viewport controls therefore remain available but do not automatically appear in a fresh configuration.
    * Retained the unified floating GUI system for the navigation tools.
    * Continued using `BigInt` coordinates for viewport calculations.
    * Kept `BigIntPrecisionMantissa` configurable rather than relying on a fixed precision margin.
    * The configuration remains organized into separate sections for:

      * Canvas/layout
      * Navigation
      * Rendering modes
      * HUD visibility
      * Element visibility
      * Colors
      * Tick/label settings
      * Performance limits
    * Updated the README's custom-notation example/documentation to reflect the current notation-module interface.

  * **Fixes:**

    * Reduced UI clutter for new users by preventing the Ordinal Finder and Set Viewport panels from appearing automatically.
    * Improved the default startup experience by keeping advanced navigation tools opt-in.
    * Retained the BigInt-based precision path for deep zooming, avoiding unnecessary floating-point conversion.
    * Cleaned up the custom notation documentation so the required module structure and exposed functions are clearer.


</details>























































* **v2.10** — https://rngdelak.github.io/ord-generalized/versions/version%202.10/ <details>
  * **Description:**

    * Version 2.10 adds a complete **custom notation import/export and URL-sharing system**.
    * Users can now import `.tnls`, `.js`, or `.txt` files directly, export inline notation code as a compressed URL, or share an external script URL.
    * The application automatically detects `source` and `href` URL parameters when starting and loads the corresponding custom notation.
    * The configuration menu is expanded and made scrollable to accommodate the new controls.

  * **Added:**

    * Added **Import File** support for `.tnls`, `.js`, and `.txt` files.
    * Added **Export Link** functionality for custom inline script code.

      * Script source is compressed using LZ-String.
      * The compressed code is stored in a `#source=` URL parameter.
    * Added **Export URL** functionality for external notation scripts.

      * External scripts are referenced using a `#href=` URL parameter.
    * Added automatic URL parameter handling during application startup.
    * Added support for:

      * `#source=<compressed script>`
      * `#href=<script URL>`
    * Added `handleUrlParameters()` to detect and load shared notation links.
    * Added `updateUrlHrefParam()` so loading a preset/custom external script updates the current URL.
    * Added the **LZ-String 1.5.0** library for compact inline-script URL encoding.
    * Added Import/Export action buttons to the Config Menu.
    * Added `max-height: 90vh` and scrolling to the Config Menu.
    * Added a wider `340px` Config Menu layout.
    * Added a three-button action row for:

      * Import File
      * Export Link
      * Export URL

  * **Changes:**

    * Changed application initialization so URL parameters are checked before loading the default BMS notation.
    * If a valid `source` or `href` parameter is found, the shared notation is loaded instead of automatically loading BMS.
    * Changed preset loading so the URL is updated with an `href` parameter.
    * Changed the startup `DOMContentLoaded` handler to be asynchronous so external notation scripts can be fetched before initialization continues.
    * Added automatic decompression of `source` links using `LZString.decompressFromEncodedURIComponent()`.
    * Added external-script loading using `fetch()` for `href` links.
    * Added preset detection for `href` URLs when the URL matches an existing preset option.
    * Changed the Config Menu layout to accommodate the new import/export controls.
    * Minor cleanup of comments, whitespace, and JavaScript semicolons in `ui.js` and `index.html`.
    * The existing notation libraries, rendering engine, Ordinal Finder, Set Viewport, Camera Stats, Worm implementation, and README are otherwise unchanged from 2.9.

  * **Fixes:**

    * Improved custom-notation portability by allowing notation code to be shared through a single URL.
    * Improved custom-notation loading by allowing external scripts to be opened directly from a URL.
    * Improved local workflow by allowing notation files to be imported without manually copying their contents into the code-injection textarea.
    * Improved startup handling so a shared notation link takes precedence over the default BMS preset.
    * Improved configuration-menu usability by making the menu scrollable when its contents exceed the viewport height.


</details>























































* **v2.11** — https://rngdelak.github.io/ord-generalized/versions/version%202.11/ <details>
  * **Description:**

    * Version 2.11 refines the custom-notation import/export system introduced in Version 2.10.
    * URL-based notation loading is standardized around the `source` and `href` parameters and now supports both URL hash and query-string forms.
    * Custom notation loading is made more consistent by resetting notation state before executing imported/shared scripts.
    * The project documentation is updated to better explain the required custom-notation module structure and the use of an IIFE to avoid global-name collisions.
    * The existing rendering, Ordinal Finder, Set Viewport, Camera Stats, Worm, and configuration systems remain in place.

  * **Added:**

    * Added unified URL handling for custom notation through:

      * `source` — compressed inline notation code.
      * `href` — external notation script URL.
    * Added support for reading these parameters from either:

      * URL hash (`#source=...`, `#href=...`)
      * URL query string (`?source=...`, `?href=...`)
    * Added explicit notation-state reset before executing imported custom scripts.
    * Added automatic URL cleanup/update using `history.replaceState()` when an external notation is loaded.
    * Added improved import handling for `.tnls` and script files.
    * Added documentation explaining that custom notation implementations should be wrapped in an IIFE and expose their API through `window.notation`.
    * Documented the expected custom notation interface, including:

      * `fs`
      * `cmp`
      * `isSuccessor`
      * `display`
      * `classifyOrdinal`
      * `parse`
      * `Zero`
      * `Limit`
      * `DisplayName`
      * `ordinalTypes`
      * `Aliases`
      * `config`
      * `title`

  * **Changes:**

    * Changed `handleUrlParameters()` so it first reads the URL hash and falls back to the query string.
    * Standardized custom notation sharing around the `source` and `href` parameter names.
    * Changed imported notation execution to reset the active notation configuration before running the new script.
    * Changed external notation loading so the resulting URL is normalized to an `href` link through `history.replaceState()`.
    * Improved preset/custom-script loading so the notation UI is rebuilt after the new notation has been injected.
    * Retained compressed inline-code sharing through LZ-String.
    * Retained external-script sharing through `href`.
    * Retained the five configuration save/load slots.
    * Retained optional Ordinal Finder and Set Viewport controls.
    * Retained BigInt-based viewport precision and adaptive precision calculation.
    * Updated README custom-notation documentation to reflect the current Worm-style notation module structure.
    * The Worm example in the README uses the 2.6+ repeated-exponent representation rather than the coefficient-pair representation from 2.4–2.5.

  * **Fixes:**

    * Fixed inconsistent URL parameter handling by allowing both hash and query-string links.
    * Fixed custom notation state potentially carrying over when importing or loading another notation script.
    * Improved isolation between custom notation modules by documenting and requiring an IIFE-based module wrapper.
    * Improved reliability of shared notation links by normalizing externally loaded scripts to the `href` URL format.
    * Improved notation UI/configuration refresh after importing a custom notation.
    * Reduced the risk of collisions between variables/functions exposed by different notation libraries.


</details>























































* **v2.12** — https://rngdelak.github.io/ord-generalized/versions/version%202.12/ <details>
  * **Description:**

    * Version 2.12 is a UI and documentation refinement release.
    * The Config Menu layout is improved so its width adapts to its contents while remaining constrained by the viewport.
    * The README is substantially expanded and updated with the current keyboard controls, navigation features, and custom-notation development guidance.
    * No changes were made to the rendering engine, notation libraries, Ordinal Finder, Set Viewport, Worm implementation, or configuration logic.

  * **Added:**

    * Added more complete documentation for the current keyboard controls:

      * Arrow keys / mouse drag & wheel — navigation.
      * `A / S` — rendering depth.
      * `M` — Mathstick Mode.
      * `Z` — Zoom into Mouse.
      * `D` — diagonal tick arrangement.
      * `H` — harmonic interval spacing.
      * `F` — Ordinal Finder.
      * `G` — Set Viewport.
      * `I` — viewport state.
      * `L` — lock screen.
      * `Ctrl / Shift` — arrow-key sensitivity.
      * `Shift + S` — Slow Mode.
    * Added expanded documentation explaining the requirements for custom notation modules.
    * Added explanations for the purpose of the required notation functions:

      * `fs`
      * `cmp`
      * `isSuccessor`
      * `display`
    * Added documentation explaining that helper functions should be kept inside the notation module/IIFE to avoid naming collisions.
    * Added explanatory comments in the custom-notation example describing why `fs`, `cmp`, `isSuccessor`, and `display` are important.

  * **Changes:**

    * Changed Config Menu width from a fixed `340px` to a responsive layout:

      * `width: fit-content`
      * `min-width: 320px`
      * `max-height: 85vh`
      * `overflow-y: auto`
      * `overflow-x: hidden`
    * Added `box-sizing: border-box` to the Config Menu.
    * Changed the maximum Config Menu height from `90vh` to `85vh`.
    * Reworked the README's usage section to reflect the current control system rather than the older controls.
    * Changed the README's description of `M` from notation switching to **Mathstick Mode**.
    * Added documentation for the newer navigation features introduced in 2.7–2.10.
    * Simplified the custom-notation documentation so it emphasizes the four core functions required for rendering and ordering.
    * Improved wording around IIFE/module isolation and potential variable-name collisions.

  * **Fixes:**

    * Improved Config Menu behavior on smaller screens by preventing the menu from exceeding the viewport height.
    * Prevented horizontal overflow inside the Config Menu.
    * Improved Config Menu sizing so it no longer wastes space by always being exactly `340px` wide.
    * Improved documentation accuracy for the current keyboard shortcuts and available navigation features.
    * Clarified custom-notation requirements so developers are less likely to omit essential functions.


</details>























































* **v2.13** — https://rngdelak.github.io/ord-generalized/versions/version%202.13/ <details>
  * **Description:**

    * Version 2.13 introduces **EcOCF (Extended collapsing OCF)** as a new experimental notation system.
    * Adds an interactive configuration editor with sliders, checkboxes, and color controls, while retaining the existing JSON configuration editor.
    * The Config Menu can now be resized, including through touch on mobile devices.
    * Worm parsing is significantly expanded to accept multiple input formats, including array notation, coefficient-pair notation, and textual ordinal notation.
    * The README is substantially rewritten into a project overview, feature page, custom-notation guide, and complete version changelog.

  * **Added:**

    * Added `Libs/EcOCF.js`.
    * Added **EcOCF** to the notation preset list.
    * Added EcOCF support for:

      * Fundamental sequences.
      * Comparison.
      * Successor detection.
      * Display/conversion.
      * Ordinal classification.
      * Multiple EcOCF-specific ordinal predicates.
    * Added an interactive configuration editor containing:

      * Aspect Ratio slider.
      * Mathstick Mode checkbox.
      * Diagonal Tick Arrangement checkbox.
      * Harmonic Interval Spacing checkbox.
      * Ordinal Finder checkbox.
      * Set Viewport checkbox.
      * Slow Mode checkbox.
      * Current Position State checkbox.
      * Background color picker.
      * Tick Spacing slider.
      * Tick Height slider.
      * Tick Width slider.
      * Tick Anchor Point slider.
      * Labels Count slider.
      * FPS Precision slider.
      * Maximum Interval Division slider.
      * Maximum Interval Depth slider.
    * Added **Use JSON Editor / Use Sliders Editor** toggle.
    * Added synchronization between the interactive controls and the JSON configuration editor.
    * Added automatic rendering/configuration updates when interactive controls are changed.
    * Added desktop Config Menu resizing using CSS `resize: both`.
    * Added mobile touch-based Config Menu resizing.
    * Added a custom Config Menu resize handle style.
    * Expanded Worm `parse()` to accept:

      * Plain exponent arrays: `(5,3,1,0)`
      * Square/curly-bracket variants.
      * Coefficient-pair notation: `[[5,1],[3,2]]`
      * Transfinite text notation such as `w^2 + w*3 + 5`
      * `ω` / `&omega;` forms.
      * `Limit`, `ω^ω`, and `w^w`.
    * Added a complete project overview to the README.
    * Added project feature descriptions and screenshots.
    * Added a full changelog covering versions `0.1` through `2.13`.

  * **Changes:**

    * Changed the Config Menu from being primarily JSON-driven to supporting two configuration workflows:

      * Interactive controls.
      * Raw JSON editor.
    * Changed `syncConfigToTextArea()` so it also synchronizes the interactive controls with the current configuration.
    * Added `toggleJsonEditorView()` to switch between the two editing modes.
    * Interactive configuration changes now immediately update:

      * The global `config` object.
      * The JSON textarea.
      * Floating GUI visibility.
      * The rendered visualization.
    * Added responsive Config Menu resizing:

      * Minimum width: `260px` for touch resizing.
      * Maximum width: `90vw`.
      * Maximum height: `85vh`.
    * Added `box-sizing: border-box` and `touch-action: none` to the Config Menu.
    * Changed the Worm `pretty()` implementation to first group repeated exponents into `[exponent, coefficient]` pairs internally before formatting them.
    * Changed Worm parsing from a simple comma-separated parser into a multi-format parser.
    * Added comments to the Worm example explaining which notation functions are required and which are optional.
    * Added comments documenting the purpose of `fs`, `cmp`, `isSuccessor`, `display`, `classifyOrdinal`, and `parse`.
    * Changed the example notation configuration property from:

      * `config = {modes:[1]}`
      * to `config = {mode:[1]}`
    * Added the new EcOCF preset between EBOCF and TON.
    * Reformatted several sections of `index.html`.
    * Expanded README documentation from a short usage/custom-notation guide into a full project landing page and historical changelog.

  * **Fixes:**

    * Improved configuration editing by providing a visual alternative to manually editing JSON.
    * Reduced the need to open/edit raw configuration JSON for common rendering changes.
    * Improved mobile usability by allowing the Config Menu to be resized through touch.
    * Improved desktop usability by allowing users to resize the Config Menu.
    * Improved Worm Ordinal Finder compatibility by accepting more human-readable ordinal input formats.
    * Improved custom-notation development guidance by explicitly documenting required versus optional notation functions.
    * Improved documentation accuracy by adding the project's complete version history and current feature set.


</details>























































* **v2.14** — https://rngdelak.github.io/ord-generalized/versions/version%202.14/ <details>
  * **Description:**

    * Version 2.14 refines the configuration UI introduced in Version 2.13.
    * Mobile interaction with the resizable Config Menu is improved by allowing vertical page scrolling while preserving the menu's resize behavior.
    * Tick Height can now be adjusted over a much finer range, making very small ticks possible.
    * The displayed rendering depth is now immediately synchronized whenever the configuration is changed.
    * The README is updated with additional screenshots and the Version 2.14 release entry.
    * No notation-library or core rendering-engine changes were made.

  * **Added:**

    * Added mobile-friendly scrolling behavior to the Config Menu through:

      * `touch-action: pan-y`
      * `-webkit-overflow-scrolling: touch`
    * Added a more precise Tick Height control range:

      * Minimum: `0.001`
      * Maximum: `0.1`
      * Step: `0.0001`
    * Added explicit synchronization of the depth display after configuration changes.
    * Added four additional project screenshots to the README.
    * Added Version 2.14 to the README's version history.

  * **Changes:**

    * Changed the Config Menu's touch behavior:

      * **2.13:** `touch-action: none`
      * **2.14:** `touch-action: pan-y`
    * Added `-webkit-overflow-scrolling: touch` for smoother scrolling on compatible mobile browsers.
    * Changed Tick Height slider from:

      * `0.05–0.25`, step `0.01`
      * to `0.001–0.1`, step `0.0001`
    * Changed `syncConfigToTextArea()` so it also updates the visible depth indicator:

      * `Depth: Infinite`
      * or `Depth: <value>`
    * Updated the README version range from `2.0 → 2.12` to `2.0 → 2.14`.
    * Added a direct link to the Version 2.14 release page.
    * Reorganized the README screenshot section with several additional landscape examples.

  * **Fixes:**

    * Improved mobile Config Menu usability by allowing vertical scrolling instead of completely disabling touch gestures.
    * Improved support for scrolling through larger configuration panels on touch devices.
    * Fixed the depth indicator potentially becoming stale after configuration changes.
    * Improved fine-grained control over very small tick heights.
    * Improved documentation by adding the missing Version 2.14 entry and newer screenshots.


</details>























































* **v2.15** — https://rngdelak.github.io/ord-generalized/versions/version%202.15/ <details>
  * **Description:**

    * Version 2.15 adds a dedicated **Reset Viewport** function for quickly returning the camera to its default viewport.
    * Resetting the viewport preserves the previous viewport in camera history, so the user can still use Revert/undo afterward.
    * The new reset control is available both as a visible button and through the `R` keyboard shortcut.
    * Keyboard shortcuts are made safer by preventing Ctrl/Cmd combinations from accidentally triggering application actions.
    * The hint/help overlay is prevented from propagating pointer and touch events into the visualization.
    * The README is updated with the new Reset Viewport feature and the Version 2.15 release entry.

  * **Added:**

    * Added a **Reset** button to the canvas UI.
    * Added `resetViewport()` to restore the camera to the default viewport.
    * Added `ResetBtnColor` configuration option.
    * Added `R` keyboard shortcut for Reset Viewport.
    * Added pointer/touch event isolation for the usage-hint overlay.
    * Added documentation for the `R` shortcut.
    * Added Version 2.15 to the README changelog.
    * Added a new README feature description for built-in Slow Mode.

  * **Changes:**

    * Reset Viewport restores the camera to a centered viewport whose width is approximately `80%` of the canvas width.
    * Reset Viewport now records the current viewport in `cam.history` before resetting, allowing the previous view to be recovered with Revert.
    * Added Reset button styling:

      * Red by default.
      * Positioned above the Revert button.
    * Changed keyboard shortcut handling so application shortcuts such as:

      * `A`
      * `F`
      * `G`
      * `I`
      * `M`
      * `H`
      * `L`
      * `D`
      * `Z`
      * `R`
        do not execute when Ctrl/Cmd is being held.
    * Added `hint` event propagation blocking for:

      * Touch events
      * Mouse events
      * Wheel events
      * Click events
    * Updated `applyingCSSUpdate()` so the Reset button uses `config.ResetBtnColor`.
    * Minor formatting cleanup in `plot.js` and `ui.js`.
    * Updated README landscape presentation by replacing several HTML `<img>` elements with Markdown image syntax.
    * Updated the README feature list to explicitly mention built-in Slow Mode.

  * **Fixes:**

    * Added a reliable way to return to the default viewport without manually panning/zooming.
    * Preserved viewport history when resetting, so Reset does not destroy the ability to return to the previous view.
    * Prevented Ctrl/Cmd-based browser/application shortcuts from unintentionally triggering notation or navigation actions.
    * Prevented interactions with the usage hint from leaking through to the canvas.
    * Improved Reset button color customization through the configuration system.


</details>























































* **v2.16** — https://rngdelak.github.io/ord-generalized/versions/version%202.16/ <details>
  * **Description:**

    * Version 2.16 adds a convenient way to copy the current camera state directly from the Camera Stats HUD.
    * Clicking the displayed camera statistics copies the current world position and zoom value to the clipboard.
    * The copy operation includes a fallback for browsers or security contexts where the modern Clipboard API is unavailable.
    * The existing Reset Viewport, Revert, Set Viewport, Ordinal Finder, and high-precision camera systems remain unchanged.
    * No new notation library or major rendering algorithm is introduced in this version.

  * **Added:**

    * Added `copyPositionAndZoom()` to `ui.js`.
    * Added click handling to the `hudStats` element.
    * Clicking the Camera Stats display now copies:

      * Current world position.
      * Current zoom level.
    * Added Clipboard API support through `navigator.clipboard.writeText()`.
    * Added a fallback using a temporary `<textarea>` and `document.execCommand("copy")` for older/restricted browser environments.
    * Added a confirmation alert showing the copied camera state.

  * **Changes:**

    * Changed the Camera Stats HUD from a display-only element into an interactive control.
    * The HUD now uses:

      * `onclick="copyPositionAndZoom()"`
    * The copied format is:

      * World position on the first line.
      * Zoom value on the second line.
    * The existing BigInt-safe formatting from Version 2.7+ is reused, so the copied values preserve the readable high-precision representation already shown to the user.
    * No changes were made to the notation libraries or their mathematical behavior.
    * No changes were made to the viewport calculation/rendering algorithms.

  * **Fixes:**

    * Improved the workflow for transferring a camera position from one session/configuration to another.
    * Eliminated the need to manually transcribe the position and zoom shown in the Camera Stats HUD.
    * Added a clipboard fallback for environments where `navigator.clipboard` is unavailable or blocked.


</details>























































* **v2.17** — https://rngdelak.github.io/ord-generalized/versions/version%202.17/ <details>
  * **Description:**

    * Version 2.17 introduces a **Mouse Pointer Lock** mode that allows the user to keep panning without the physical mouse cursor reaching the edge of the screen.
    * Pointer Lock can be toggled with the `1` keyboard shortcut.
    * Mouse movement handling is updated to use relative `movementX` / `movementY` values while Pointer Lock is active.
    * The website receives basic SEO metadata, including a page title, robots directive, Google verification, and canonical URL.
    * A sitemap is added for the deployed website.
    * The README is updated to include Version 2.16 in the Version 2 release history.

  * **Added:**

    * Added Mouse Pointer Lock functionality.
    * Added `isMouseLocked` state.
    * Added a `pointerlockchange` event listener to track whether the canvas currently owns Pointer Lock.
    * Added `1` keyboard shortcut:

      * Press `1` → lock the mouse to the canvas.
      * Press `1` again → release the mouse.
    * Added relative mouse movement support using:

      * `event.movementX`
      * `event.movementY`
    * Added a sitemap:

      * `sitemap.xml`
    * Added SEO metadata to `index.html`:

      * Page title: `Generalized Transfinite Number Line`
      * Google site-verification metadata.
      * `robots="index, follow"`.
      * Canonical URL.
    * Added an explicit `id`/`for` relationship around the Environment Configurations section.
    * Added the new Mouse Lock shortcut to the on-screen usage instructions.

  * **Changes:**

    * Changed `handlePointerMove()` so mouse movement is calculated differently depending on Pointer Lock state:

      * Normal mode → current cursor position minus previous cursor position.
      * Pointer Lock mode → `movementX` / `movementY`.
    * Changed horizontal viewport movement to use the new calculated `movementX`.
    * Changed vertical zoom/pan movement to use the new calculated `movementY`.
    * Added Pointer Lock state tracking through `document.pointerLockElement === canvas`.
    * Added `canvas.requestPointerLock()` when Mouse Lock is enabled.
    * Added `document.exitPointerLock()` when Mouse Lock is disabled.
    * Updated the usage instructions to document:

      * `1` → Lock mouse.
    * Updated README's Version 2 range from `2.0 → 2.14` to `2.0 → 2.16`.
    * Added Version 2.16 to the README version list.

  * **Fixes:**

    * Fixed the limitation where normal mouse panning stops being practical once the cursor reaches the edge of the screen.
    * Improved continuous horizontal/vertical mouse navigation by using relative pointer movement while locked.
    * Improved website discoverability through canonical/robots metadata and a sitemap.
    * Added a proper page title instead of leaving the `<title>` element empty.


</details>























































* **v2.18** — https://rngdelak.github.io/ord-generalized/versions/version%202.18/ <details>
  * **Description:**

    * Version 2.18 improves the positioning and orientation of ordinal/timeline labels.
    * Labels can now be independently offset horizontally and rotated through configuration.
    * Timeline labels receive their own horizontal offset and rotation controls.
    * Touch interaction is improved by correctly handling `changedTouches` and updating the previous touch position immediately during movement.
    * Harmonic Interval Spacing now appears explicitly in the HUD when enabled.
    * The README is expanded and reformatted with a more complete version-history structure.

  * **Added:**

    * Added `LabelBetweenLabelXoffest` configuration option.
    * Added `LabelBetweenTimelineXoffest` configuration option.
    * Added `LabelRotation` configuration option.
    * Added `TimelineRotation` configuration option.
    * Added configurable horizontal positioning between stacked ordinal labels.
    * Added configurable horizontal positioning for timeline/alias labels.
    * Added rotation support for ordinal labels.
    * Added rotation support for timeline labels.
    * Added `transformOrigin` handling to dynamically generated labels.
    * Added **Harmonic Interval Spacing Enabled** to the HUD status indicators.
    * Added improved touch-event coordinate handling through `changedTouches`.

  * **Changes:**

    * Changed `createTextLabel()` to accept an optional rotation parameter.
    * Changed label transforms from:

      * `translate(...)`
      * to `translate(...) rotate(...deg)`
    * Added dynamic transform origins based on horizontal/vertical alignment.
    * Changed ordinal label X-position calculation to include `LabelBetweenLabelXoffest`.
    * Changed timeline-label X-position calculation to include:

      * stacked-label offset
      * `LabelBetweenTimelineXoffest`
    * Changed ordinal labels to use `config.LabelRotation`.
    * Changed timeline labels to use `config.TimelineRotation`.
    * Changed HUD status ordering so:

      * Slow Mode
      * Screen Locked
      * Zoom Into Mouse
      * Harmonic Interval Spacing
        are displayed consistently.
    * Changed `getEventCoords()` so it handles:

      * `touches`
      * `changedTouches`
      * mouse/pointer events
    * Changed `handlePointerMove()` to obtain coordinates through `getEventCoords()`.
    * Changed touch dragging so `lastX` and `lastY` are updated immediately after reading the current touch position.
    * Minor formatting cleanup in Mathstick tick-height calculation.
    * Added a final newline to `plot.js`.
    * Expanded/reformatted README documentation and version-history entries.

  * **Fixes:**

    * Fixed touch-drag coordinate handling when a touch event does not provide an active `touches` collection but does provide `changedTouches`.
    * Fixed touch movement deltas by updating the stored previous position immediately during each movement event.
    * Improved mobile panning behavior and reduced the possibility of jumps or incorrect movement during touch dragging.
    * Improved label layout when multiple notation display modes are enabled.
    * Improved timeline-label positioning when stacked notation labels are present.
    * Improved label readability by allowing labels to be rotated to better match the visualization's orientation.
    * Improved HUD feedback by explicitly showing when Harmonic Interval Spacing is enabled.


</details>






















































* **v2.19** — https://rngdelak.github.io/ord-generalized/versions/version%202.19/ <details>
  * **Description:**

    * Version 2.19 adds control over whether tick colors are automatically blended with brightness during rendering.
    * Tick color blending is enabled by default, preserving the existing behavior.
    * Users can now disable the blending to keep configured tick colors unchanged.
    * No notation, parser, viewport, interaction, or UI logic changes were made.

  * **Added:**

    * Added `EnableTickColorBlending` configuration option.
    * Default value:

      * `true`
    * Added a conditional check inside `blendColorWithBrightness()` so tick colors can bypass brightness blending when disabled.

  * **Changes:**

    * Changed `blendColorWithBrightness(hexColor, b)` to respect `config.EnableTickColorBlending`.
    * When enabled:

      * Tick colors continue to be modified according to brightness as before.
    * When disabled:

      * The original configured color is returned directly.
    * All existing notation libraries remain unchanged.
    * Existing rendering, navigation, label positioning, touch handling, and configuration-editor functionality remain unchanged.

  * **Fixes:**

    * Fixed the lack of user control over tick-color brightness blending.
    * Prevents configured tick colors from being unintentionally altered when exact color preservation is desired.
    * Preserves the previous visual behavior by keeping the new option enabled by default.


</details>



























































# Motivation

It's a heartbreaking journeys which all starts 2 years ago, when i found myself [Stephen Brooks's](https://www.stephenbrooks.org/) Transfinite Number Lines.

As a googology enthusiast, i was shocked of how complex, recursive and beatiful it was.

So do i, i wanted to explore what inside, but sadly, there isn't any source code (and he shared it in 12/7/2026, after i emailed him)

And in past year, i tried to firgure out myself , and thats it, i written a [document](https://github.com/RNGDelak/ord-limbms/blob/main/README.md), and making 3 transfinite number line which is [ord-w](https://rngdelak.github.io/ord-w/), [ord-ww](https://rngdelak.github.io/ord-ww/) and [ord-limbms](https://rngdelak.github.io/ord-limbms/) with vital help from [@solarzone1010](https://solarzone1010.github.io/).

Yeah, those project are painfully slow. And then, i revised everything, try to optimize everything i could (thats why there a version 0.1 and 0.2) but sadly, i was on the wrong way.

Until [Stephen Brooks's](https://www.stephenbrooks.org/) shared [his project source code](https://www.stephenbrooks.org/archive/ordinals), i had everything to push this project to reality.

Thats it, now i can finally take out the plan that i have written 4 month ago for this project, and possibly doesnt know when will i do that.

# Final words

I've built what I wanted to build, implemented everything i could dream, that's it

Enjoy the project!!!
