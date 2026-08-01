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