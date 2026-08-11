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

Current Version: https://rngdelak.github.io/ord-generalized

---

## Version 0 Series (0.1 → 0.9)

**Overview:** These versions are testing, and mostly unusable yet. Limited render capability and consists of many bugs.  
**Major Update:** Figured out an efficient way to render ordinal number line (v0.3)

* **v0.1** — https://rngdelak.github.io/ord-generalized/versions/version%200.1/
  * **Description:** Initial prototype build.
  * **Added:** Binary search on ordinal o(log2n) but sadly decimal.js ruined the thing so yeah.

* **v0.2** — https://rngdelak.github.io/ord-generalized/versions/version%200.2/
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


* **v0.3** — https://rngdelak.github.io/ord-generalized/versions/version%200.3/
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


* **v0.4** — https://rngdelak.github.io/ord-generalized/versions/version%200.4/
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


* **v0.5** — https://rngdelak.github.io/ord-generalized/versions/version%200.5/
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


* **v0.6** — https://rngdelak.github.io/ord-generalized/versions/version%200.6/
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

* **v0.7** — https://rngdelak.github.io/ord-generalized/versions/version%200.7/
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


* **v0.8** — https://rngdelak.github.io/ord-generalized/versions/version%200.8/
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


* **v0.9** — https://rngdelak.github.io/ord-generalized/versions/version%200.9/
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
**Major Update:** Added mathstick mode (v1.9)

* **v1.0** — https://rngdelak.github.io/ord-generalized/versions/version%201.0/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v1.1** — https://rngdelak.github.io/ord-generalized/versions/version%201.1/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v1.2** — https://rngdelak.github.io/ord-generalized/versions/version%201.2/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v1.3** — https://rngdelak.github.io/ord-generalized/versions/version%201.3/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v1.4** — https://rngdelak.github.io/ord-generalized/versions/version%201.4/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v1.5** — https://rngdelak.github.io/ord-generalized/versions/version%201.5/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v1.6** — https://rngdelak.github.io/ord-generalized/versions/version%201.6/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v1.7** — https://rngdelak.github.io/ord-generalized/versions/version%201.7/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v1.8** — https://rngdelak.github.io/ord-generalized/versions/version%201.8/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v1.9** — https://rngdelak.github.io/ord-generalized/versions/version%201.9/
  * **Description:** Added MathStick Mode.
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v1.10** — https://rngdelak.github.io/ord-generalized/versions/version%201.10/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v1.11** — https://rngdelak.github.io/ord-generalized/versions/version%201.11/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v1.12** — https://rngdelak.github.io/ord-generalized/versions/version%201.12/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

---

## Version 2 Series (2.0 → 2.18)

**Overview:** These versions are very complete, though there were still some bugs fixed overall after v2.9.  
**Major Updates:** Formalized sharing transfinite number line notations (v2.10), added find ordinal (v2.2), and set viewport state (v2.7).

* **v2.0** — https://rngdelak.github.io/ord-generalized/versions/version%202.0/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.1** — https://rngdelak.github.io/ord-generalized/versions/version%202.1/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.2** — https://rngdelak.github.io/ord-generalized/versions/version%202.2/
  * **Description:** Added Ordinal Finder.
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.3** — https://rngdelak.github.io/ord-generalized/versions/version%202.3/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.4** — https://rngdelak.github.io/ord-generalized/versions/version%202.4/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.5** — https://rngdelak.github.io/ord-generalized/versions/version%202.5/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.6** — https://rngdelak.github.io/ord-generalized/versions/version%202.6/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.7** — https://rngdelak.github.io/ord-generalized/versions/version%202.7/
  * **Description:** Added Set Viewport State.
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.8** — https://rngdelak.github.io/ord-generalized/versions/version%202.8/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.9** — https://rngdelak.github.io/ord-generalized/versions/version%202.9/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.10** — https://rngdelak.github.io/ord-generalized/versions/version%202.10/
  * **Description:** Formalized sharing transfinite number line notations.
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.11** — https://rngdelak.github.io/ord-generalized/versions/version%202.11/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.12** — https://rngdelak.github.io/ord-generalized/versions/version%202.12/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.13** — https://rngdelak.github.io/ord-generalized/versions/version%202.13/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.14** — https://rngdelak.github.io/ord-generalized/versions/version%202.14/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.15** — https://rngdelak.github.io/ord-generalized/versions/version%202.15/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.16** — https://rngdelak.github.io/ord-generalized/versions/version%202.16/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.17** — https://rngdelak.github.io/ord-generalized/versions/version%202.17/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**

* **v2.18** — https://rngdelak.github.io/ord-generalized/versions/version%202.18/
  * **Description:**
  * **Added:**
  * **Changes:**
  * **Fixes:**


# Motivation

It's a heartbreaking journeys which all starts 2 years ago, when i found myself [Stephen Brooks's](https://www.stephenbrooks.org/) Transfinite Number Lines.

As a googology enthusiast, i was shocked of how complex, recursive and beatiful it was.

So do i, i wanted to explore what inside, but sadly, there isn't any source code (and he shared it in 12/7/2026, after i emailed him)

And in past year, i tried to firgure out myself , and thats it, i written a [document](https://github.com/RNGDelak/ord-limbms/blob/main/README.md), and making 3 transfinite number line which is [ord-w](https://rngdelak.github.io/ord-w/), [ord-ww](https://rngdelak.github.io/ord-ww/) and [ord-limbms](https://rngdelak.github.io/ord-limbms/) with vital help from [@solarzone1010](https://solarzone1010.github.io/).

Yeah, those project are painfully slow. And then, i revised everything, try to optimize everything i could (thats why there a version 0.1 and 0.2) but sadly, i was on the wrong way.

Until [Stephen Brooks's](https://www.stephenbrooks.org/) shared [his project source code](https://www.stephenbrooks.org/archive/ordinals), i had everything to push this project to reality.

Thats it, now i can finally take out the plan that i have written 4 month ago for this project, and possibly doesnt know when will i do that.
