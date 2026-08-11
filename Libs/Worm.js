/*
Notation : Worm (Ackermann Worm)
Limit : ω^ω
*/

window.notation = (() => {

  // Required Constants
  const Zero = [];
  const Limit = "Limit";

  // Convert ordinal represented as [[exp, coef], ...] to a readable string
  function pretty(ord) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";

    return ord.map(([exp, coef]) => {
      if (exp === 0) {
        return `${coef}`;
      }

      const base = exp === 1 ? "&omega;" : `&omega;<sup>${exp}</sup>`;
      return coef > 1 ? `${base}&middot;${coef}` : base;
    }).join("+");
  }

  // Fundamental sequence for Cantor Normal Form terms
  function fs(ord, n) {
    if (ord === Limit) return [[n, 1]]; // FS(ω^ω, n) = ω^n

    if (!Array.isArray(ord) || ord.length === 0) return [];

    // Deep clone ordinal structure to maintain immutability
    const res = ord.map(term => [...term]);
    const last = res[res.length - 1];

    if (last[1] > 1) {
      last[1]--;
    } else {
      res.pop();
    }

    if (last[0] > 0 && n > 0) {
      const newExp = last[0] - 1;
      if (res.length > 0 && res[res.length - 1][0] === newExp) {
        res[res.length - 1][1] += n;
      } else {
        res.push([newExp, n]);
      }
    }

    return res;
  }

  // Compare two ordinals in [[exp, coef], ...] representation
  function cmp(a, b) {
    if (a === Limit && b === Limit) return 0;
    if (a === Limit) return 1;
    if (b === Limit) return -1;

    const minLength = Math.min(a.length, b.length);

    for (let i = 0; i < minLength; i++) {
      const [expA, coefA] = a[i];
      const [expB, coefB] = b[i];

      if (expA !== expB) return expA < expB ? -1 : 1;
      if (coefA !== coefB) return coefA < coefB ? -1 : 1;
    }

    if (a.length < b.length) return -1;
    if (a.length > b.length) return 1;
    return 0;
  }

  // Check if ordinal is a successor
  function isSuccessor(ord) {
    return ord !== Limit && Array.isArray(ord) && ord.length > 0 && ord[ord.length - 1][0] === 0;
  }

  // Display functions
  function display(ord, mode) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";
    if (mode === 'raw') {
      return JSON.stringify(ord);
    }
    if (mode === 'pretty') {
      return pretty(ord);
    }
  }

  // Classify ordinals for visualization styling
  function classifyOrdinal(ord) {
    if (ord === Limit) return "#ffffff";
    if (!Array.isArray(ord) || ord.length === 0) return "#808080";
    if (isSuccessor(ord)) return "#d40000";
    if (ord.length === 1 && ord[0][1] === 1 && ord[0][0] > 0) return "#ffd000"; // Power of ω
    return "#ff8000"; // Limit ordinal
  }

  // Parser supporting pair notation [[e, c], ...], flat array [e1, e2, ...], and text expressions
  function parse(str) {
    str = String(str).trim();
    if (str === "" || str === "0") return Zero;
    if (str.toLowerCase() === "limit" || str === "ω^ω" || str === "w^w") return Limit;

    const termsMap = new Map();

    function addTerm(exp, coef) {
      if (coef <= 0 || isNaN(exp) || isNaN(coef)) return;
      termsMap.set(exp, (termsMap.get(exp) || 0) + coef);
    }

    // 1. Nested Pair Notation e.g., [[5, 1], [3, 2]] or [(5,1), (3,2)]
    const pairMatches = str.match(/[\(\[\{]\s*\d+\s*,\s*\d+\s*[\)\]\}]/g);
    if (pairMatches && pairMatches.length > 0) {
      for (const pairStr of pairMatches) {
        const [e, c] = pairStr.replace(/[^0-9,]/g, "").split(",").map(Number);
        addTerm(e, c);
      }
    } 
    // 2. Flat exponent array notation e.g., (5, 3, 3, 1, 0)
    else if (str.includes("(") || str.includes("[") || str.includes(",")) {
      const cleaned = str.replace(/[()\[\]{}]/g, "");
      const exps = cleaned.split(",").map(s => s.trim()).filter(Boolean).map(Number);
      for (const e of exps) {
        addTerm(e, 1);
      }
    } 
    // 3. Transfinite text notation e.g., "w^2*3 + w + 5"
    else {
      const cleanText = str.toLowerCase().replace(/&omega;|ω/g, "w").replace(/·|\*/g, "*");
      const terms = cleanText.split("+");

      for (let term of terms) {
        term = term.trim();
        if (!term) continue;

        let exp = 0;
        let coef = 1;

        if (term.includes("w")) {
          if (term.includes("^")) {
            const parts = term.split("^");
            const expPart = parts[1].split("*")[0].trim();
            exp = parseInt(expPart, 10);
          } else {
            exp = 1;
          }

          if (term.includes("*")) {
            const coefPart = term.split("*")[1].trim();
            coef = parseInt(coefPart, 10);
          }
        } else {
          exp = 0;
          coef = parseInt(term, 10);
        }

        addTerm(exp, coef);
      }
    }

    // Convert map to canonical form sorted by exponent descending
    return Array.from(termsMap.entries()).sort((a, b) => b[0] - a[0]);
  }

  const DisplayName = ["raw", "pretty"];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#d40000"],
    ["Limit Ordinal", "#ff8000"],
    ["Power of ω", "#ffd000"]
  ];

  const Aliases = [
    ["0", Zero],
    ["1", [[0, 1]]],
    ["ω", [[1, 1]]],
    ["ω²", [[2, 1]]],
    ["ω^ω", Limit],
  ];

  const config = { modes: [1] };
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
