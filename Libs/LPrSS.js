/*
Notation : LPrSS
Limit : phi(0,w)
*/

//for pretty printing use abbreviateVeblen

var itemSeparatorRegex = /[\t ,]/g;

function inAP(s) {
  return !(s instanceof Array) && s instanceof Object;
}

function infixVeblen(s) {
  if (typeof s == "string") s = buildVeblenObject(s);
  if (s === 0) return "0";
  if (s instanceof Array) return s.map(infixVeblen).join("+");
  if (inAP(s)) return "(" + infixVeblen(s[0]) + "," + infixVeblen(s[1]) + ")";
  throw Error("Unexpected type " + s);
}

function equalStandard(x, y) {
  if (x === 0) return y === 0;
  if (x instanceof Array) {
    if (!(y instanceof Array) || x.length != y.length) return false;
    var l = x.length;
    for (var i = 0; i < l; i++) {
      if (!equalStandard(x[i], y[i])) return false;
    }
    return true;
  }
  if (inAP(x)) {
    return inAP(y) && equalStandard(x[0], y[0]) && equalStandard(x[1], y[1]);
  }
  throw Error("Unexpected type " + x);
}

function lessThanStandard(x, y) {
  if (typeof x == "string") x = buildVeblenObject(x);
  if (typeof y == "string") y = buildVeblenObject(y);
  if (x === 0) return y !== 0;
  if (y === 0) return false;
  if (!(x instanceof Object) || !(y instanceof Object)) throw Error("Unexpected type " + [x, y]);
  var xt = x instanceof Array;
  var yt = y instanceof Array;
  if (!xt && !yt) return equalStandard(x[0], y[0]) ? lessThanStandard(x[1], y[1]) : lessThanStandard(x[0], y[0]) ? lessThanStandard(x[1], y) : lessThanStandard(x, y[1]);
  if (xt && !yt) return lessThanStandard(x[0], y);
  if (!xt && yt) return equalStandard(x, y[0]) || lessThanStandard(x, y[0]);
  if (xt && yt) {
    var l = Math.min(x.length, y.length);
    for (var i = 0; i < l; i++) {
      if (!equalStandard(x[i], y[i])) return lessThanStandard(x[i], y[i]);
    }
    return x.length < y.length;
  }
}

function standardizeVeblen(s, stringify) {
  if (typeof stringify == "undefined") stringify = typeof s == "string";
  if (typeof s == "string") s = buildVeblenObject(s);
  var r;
  if (s === 0) r = s;
  else if (s instanceof Array) {
    var a = s.map(e => standardizeVeblen(e, false));
    var r = [];
    for (var i = 0; i < a.length; i++) {
      if (a[i] instanceof Array) r = r.concat(a[i]);
      else r.push(a[i]);
    }
    for (var i = r.length; i >= 0; i--) {
      if (r[i] === 0 || r[i + 1] && lessThanStandard(r[i], r[i + 1])) {
        r.splice(i, 1);
      }
    }
    if (r.length == 1) r = r[0];
  } else if (inAP(s)) {
    r = { 0: standardizeVeblen(s[0], false), 1: standardizeVeblen(s[1], false) };
    if (inAP(r[1]) && lessThanStandard(r[0], r[1][0])) r = r[1];
  }
  return stringify ? infixVeblen(r) : r;
}

function flattenArraysVeblen(s) {
  if (s === 0) return s;
  if (s instanceof Array) {
    var a = s.map(flattenArraysVeblen);
    var r = [];
    for (var i = 0; i < a.length; i++) {
      if (a[i] instanceof Array) r = r.concat(a[i]);
      else r.push(a[i]);
    }
    return r.length == 1 ? r[0] : r;
  }
  if (inAP(s)) return { 0: flattenArraysVeblen(s[0]), 1: flattenArraysVeblen(s[1]) };
  throw Error("no");
}

function normalizeVeblen(s) {
  return s.replace(/\d+/g, n => +n ? +n > 1 ? "(0,0)" + "+(0,0)".repeat(+n - 1) : "(0,0)" : "0");
}

function abbreviateVeblen(s) {
  s = s.replace(/\(0,0\)(\+\(0,0\))*/g, e => (e.length + 1) / 6);

  let i = 0;

  function parseExpr() {
    const terms = [parseTerm()];

    while (s[i] === "+") {
      i++;
      terms.push(parseTerm());
    }

    // Compress consecutive equal terms
    const out = [];
    for (let j = 0; j < terms.length;) {
      let k = j + 1;
      while (k < terms.length && terms[k] === terms[j]) k++;

      const count = k - j;

      if (terms[j] === "1") {
        out.push(String(count));
      } else if (count === 1) {
        out.push(terms[j]);
      } else {
        out.push(`${terms[j]}⋅${count}`);
      }

      j = k;
    }

    return out.join("+");
  }

  function parseTerm() {
    // Number
    if (s[i] !== "(") {
      let start = i;
      while (i < s.length && !",()+".includes(s[i])) i++;
      return s.slice(start, i);
    }

    i++; // (

    const left = parseExpr();

    if (s[i] !== ",") throw Error("Expected ','");
    i++;

    const right = parseExpr();

    if (s[i] !== ")") throw Error("Expected ')'");
    i++;

    if (left === "0") {
      if (right === "0") return "1";
      if (right === "1") return "&omega;";
      return `&omega;<sup>${right}</sup>`;
    }

    if (left === "1") return `&epsilon;<sub>${right}</sub>`;
    if (left === "2") return `&zeta;<sub>${right}</sub>`;
    if (left === "3") return `&eta;<sub>${right}</sub>`;

    return `&phi;<sub>${left}</sub>(${right})`;
  }

  return parseExpr();
}

function isNat(s) {
  if (typeof s == "number") return isFinite(s) && Number.isInteger(s) && s >= 0;
  if (typeof s == "string") s = buildVeblenObject(s);
  if (s instanceof Array) {
    for (var i = 0; i < s.length; i++) {
      if (!equalStandard(s[i], { 0: 0, 1: 0 })) return false;
    }
    return true;
  }
  if (inAP(s)) return equalStandard(s, { 0: 0, 1: 0 });
  throw Error("Unexpected type " + s);
}

function buildVeblenNat(n) {
  if (!isNat(n)) throw Error("Input must be a nonnegative integer.");
  if (n instanceof Object) return cloneVeblenObject(n);
  if (typeof n == "string") n = +n;
  if (n == 0) {
    return 0;
  } else if (n == 1) {
    return { 0: 0, 1: 0 };
  } else {
    var r = [];
    for (var i = 0; i < n; i++) r.push({ 0: 0, 1: 0 });
    return r;
  }
  throw Error("Unexpected type " + n);
}

function numerifyNatVeblen(n) {
  if (!isNat(n)) throw Error("Input must be a nonnegative integer.");
  if (n === 0) return n;
  if (typeof n == "string") n = buildVeblenObject(n);
  if (n instanceof Array) return n.length;
  if (inAP(n)) return 1;
  throw Error("Unexpected type " + n);
}

function cloneVeblenObject(s) {
  if (s === 0) return s;
  else if (s instanceof Array) return s.map(cloneVeblenObject);
  else if (inAP(s)) {
    return { 0: cloneVeblenObject(s[0]), 1: cloneVeblenObject(s[1]) };
  } else throw Error("Unexpected");
}

function buildVeblenObject(s) {
  if (typeof s != "string") return cloneVeblenObject(s);
  if (s[0] == "p" || s[0] == "+") {
    var l = s.length;
    var p = 0;
    var a = [NaN];
    for (var i = 1; i < l; i++) {
      if (s[i] == "p" || s[i] == "+") ++p;
      else --p;
      a.push(p);
      if (p < 0) break;
    }
    if (i == l) throw Error("Unexpected end of input");
    var r;
    var left = s.slice(1, i + 1);
    var right = s.slice(i + 1);
    if (left[0] == "0" && left.length > 1 || right[0] == "0" && right.length > 1) throw Error("Unexpected 0");
    if (s[0] == "p") r = { 0: buildVeblenObject(left), 1: buildVeblenObject(right) };
    else r = flattenArraysVeblen([buildVeblenObject(left), buildVeblenObject(right)]);
    return r;
  }
  s = normalizeVeblen(s);
  var l = s.length;
  var p = 0;
  if (!s || s == "0") return 0;
  var lastsep = -1;
  var plussep = [];
  for (var i = 0; i < l; i++) {
    if (s[i] == "(") ++p;
    if (s[i] == ")") --p;
    if (p == 0 && s[i + 1] && s[i + 1] != "+") throw Error("Expected a plus sign" + s);
    if (p == 0) plussep.push(s.slice(lastsep + 1, lastsep = ++i));
    if (p < 0) throw Error("Unmatched parenthesis");
  }
  if (p > 0) throw Error("Unmatched parenthesis");
  if (plussep.length == 1) {
    for (var i = 1; i < l; i++) {
      if (s[i] == "(") ++p;
      if (s[i] == ")") --p;
      if (p <= 0 && s[i] != "+" && s[i + 1] && s[i + 1] != "+") break;
    }
    if (p != 0 || s[i + 1] != ",") throw Error("Expected a comma " + s);
    return { 0: buildVeblenObject(s.slice(1, i + 1)), 1: buildVeblenObject(s.slice(i + 2, -1)) };
  } else return plussep.map(buildVeblenObject);
}

function offsetArray(s, o) {
  return s.map(e => e + o);
}

function SPrSS_to_Veblen(s, stringify) {
  if (typeof stringify == "undefined") stringify = true;
  if (typeof s == "string") s = s ? s.split(itemSeparatorRegex).map(Number) : [];
  var l = s.length;
  for (var i = 0; i < l; i++) {
    if (!isNat(s[i])) throw Error("Unexpected type " + s[i]);
  }
  var r;
  if (s.length == 0) {
    r = 0;
  } else if (s.length == 1) {
    r = { 0: 0, 1: 0 };
  } else {
    var zerosplit = [];
    var i = 0;
    while (i < l) {
      var last = i;
      i = s.indexOf(0, i + 1);
      if (i == -1) i = l;
      zerosplit.push(s.slice(last, i));
    }
    if (zerosplit.length == 1) {
      var phisplit = [];
      var last = 1;
      var lastnum = s[1];
      for (var i = 2; i < l; i++) {
        if (s[i] <= lastnum) {
          phisplit.push(s.slice(last, i));
          last = i;
          lastnum = s[i];
        }
      }
      phisplit.push(s.slice(last, l));
      var r = 0;
      var pl = phisplit.length;
      for (var i = 0; i < pl; i++) {
        var first = phisplit[i][0];
        var sub = buildVeblenNat(first - 1);
        var innerseq = offsetArray(phisplit[i], -first);
        var inner = SPrSS_to_Veblen(innerseq, false);
        if (i > 0 && phisplit[i - 1][0] == first) {
          if (r[1] instanceof Array) r[1].push(inner);
          else r[1] = [r[1], inner];
        } else if (r === 0) {
          if (sub !== 0) {
            if (inner instanceof Array && equalStandard(inner[0], { 0: 0, 1: 0 })) inner.unshift();
            else if (inAP(inner) && equalStandard(inner, { 0: 0, 1: 0 })) inner = 0;
          }
          r = { 0: sub, 1: inner };
        } else {
          r = { 0: sub, 1: [r, inner] };
        }
      }
    } else {
      r = zerosplit.map(e => SPrSS_to_Veblen(e, false));
    }
  }
  r = standardizeVeblen(r);
  return stringify ? infixVeblen(r) : r;
}

function Veblen_to_SPrSS(s, stringify) {
  if (typeof stringify == "undefined") stringify = true;
  if (typeof s == "string") s = standardizeVeblen(s, false);
  var r;
  if (s === 0) {
    r = [];
  } else if (s instanceof Array) {
    var a = s.map(e => Veblen_to_SPrSS(e, false));
    var r = [];
    for (var i = 0; i < a.length; i++) r = r.concat(a[i]);
  } else if (inAP(s)) {
    var sub = s[0];
    if (!isNat(sub)) throw Error("Veblen expression out of range");
    var first = numerifyNatVeblen(sub) + 1;
    var innerveblen, outerveblen;
    outerveblen = s[1];
    while (true) {
      if (outerveblen === 0 || inAP(outerveblen) && lessThanStandard(sub, outerveblen[0])) break;
      if (outerveblen instanceof Array) outerveblen = outerveblen[0];
      else if (inAP(outerveblen)) outerveblen = outerveblen[1];
    }
    innerveblen = s[1];
    if (innerveblen instanceof Array && equalStandard(innerveblen[0], outerveblen)) innerveblen = innerveblen.slice(1);
    else if (inAP(innerveblen) && equalStandard(innerveblen, outerveblen)) innerveblen = 0;
    if (first > 1 && isNat(s[1])) {
      if (innerveblen === 0) innerveblen = { 0: 0, 1: 0 };
      else if (innerveblen instanceof Array) {
        innerveblen = innerveblen.slice(0);
        innerveblen.push({ 0: 0, 1: 0 });
      } else if (inAP(innerveblen)) innerveblen = [innerveblen, { 0: 0, 1: 0 }];
    }
    var inner = offsetArray(Veblen_to_SPrSS(innerveblen, false), first);
    var outer = Veblen_to_SPrSS(outerveblen, false).slice(1);
    r = [0];
    r = r.concat(outer);
    r = r.concat(inner);
  } else throw Error("Unexpected type " + s);
  return stringify ? r.join(",") : r;
}

window.notation = (() => {

  function fs(ord, n) {
    if (ord === Limit) return [0, n + 1];

    ord = [...ord]; // avoid mutating caller

    const head = ord.pop();

    if (head > 0) {
      const root = search(ord, head);
      const part = ord.slice(root);
      const offset = head - ord[root] - 1;

      for (let i = 0; i < n; i++)
        ord.push(...ascend(part, offset));
    }

    return ord;
  }

  function cmp(a, b) {
    if (a === Limit && b === Limit) return 0;
    if (a === Limit) return 1;
    if (b === Limit) return -1;

    const minLength = Math.min(a.length, b.length);

    for (let i = 0; i < minLength; i++) {
      if (a[i] !== b[i])
        return a[i] < b[i] ? -1 : 1;
    }

    if (a.length < b.length) return -1;
    if (a.length > b.length) return 1;
    return 0;
  }

  function isSuccessor(ord) {
    return ord !== Limit && (ord.length === 0 || ord.at(-1) === 0);
  }

  function display(ord, mode) {
    if (ord === Limit) return "Limit";
    if (ord.length === 0) return "0";
    if (mode == 'normal')
      return `(${ord.join(",")})`;

    if (mode == 'CNF')
      return abbreviateVeblen(SPrSS_to_Veblen(ord))
  }

  function classifyOrdinal(ord) {
    if (ord.length === 0) return "#808080";

    if (isSuccessor(ord))
      return "#d40000";

    let tower = true;
    for (let i = 0; i < ord.length; i++) {
      if (ord[i] !== i) {
        tower = false;
        break;
      }
    }
    if (tower) return "#ffffff";

    let zeroCount = 0;
    for (const x of ord)
      if (x === 0) zeroCount++;

    if (zeroCount === 1)
      return "#ffd000";

    return "#ff8000";
  }

  function parse(str) {
    str = str.trim();
    if (str === "" || str === "0") return [];

    str = str.replace(/[()]/g, "");
    return str.split(",").map(Number);
  }

  function ascend(ord, offset) {
    for (let i = 0; i < ord.length; i++)
      ord[i] += offset;
    return ord;
  }

  function search(ord, head) {
    let root = ord.length;
    do root--;
    while (ord[root] >= head);
    return root;
  }

  const Zero = [];
  const Limit = "Limit";

  const DisplayName = ["normal", 'CNF'];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#d40000"],
    ["Limit Ordinal", "#ff8000"],
    ["Power of ω", "#ffd000"],
    ["Tower of ω", "#ffffff"]
  ];

  const Aliases = [
    ["Small Cantor Ordinal", [0, 2]],
    ["φ(0,ω)", Limit]
  ];

  const config = {
    types: "default"
  };

  const title = "LPrSS transfinite number line";

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
