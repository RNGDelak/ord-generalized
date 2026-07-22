/*
Notation : EBO
Limit : psi_0(I)
*/

window.notation = (() => {

// Convert to readable ordinal
function pretty(ord) {
  if (!ord || ord === "Limit") return ord === "Limit" ? "Limit" : "0";
  return display(ord, "pretty");
}

  // Data structure:
  // Ord = Array of OrdTerm objects [{ c: number, f: Ord, x: Ord }, ...]
  
  const Zero = [];
  const Limit = "Limit";

  function Ord_zero() {
    return [];
  }

  function Ord_iszero(o) {
    return !o || o.length === 0;
  }

  function Ord_allocterms(m) {
    let ret = [];
    for (let i = 0; i < m; i++) {
      ret.push({ c: 0, f: Ord_zero(), x: Ord_zero() });
    }
    return ret;
  }

  function Ord_copyshallow(o) {
    if (Ord_iszero(o)) return [];
    let ret = [];
    for (let i = 0; i < o.length; i++) {
      ret.push({ c: o[i].c, f: o[i].f, x: o[i].x });
    }
    return ret;
  }

  function Ord_copy(o) {
    if (Ord_iszero(o)) return [];
    let ret = [];
    for (let i = 0; i < o.length; i++) {
      ret.push({
        c: o[i].c,
        f: Ord_copy(o[i].f),
        x: Ord_copy(o[i].x)
      });
    }
    return ret;
  }

  function Ord_number(n) {
    if (n === 0) return Ord_zero();
    let ret = Ord_allocterms(1);
    ret[0].c = n;
    ret[0].f = Ord_zero();
    ret[0].x = Ord_zero();
    return ret;
  }

  function Ord_add(a, b) {
    let ret = [];
    for (let i = 0; i < a.length; i++) ret.push(a[i]);
    for (let i = 0; i < b.length; i++) ret.push(b[i]);
    return ret;
  }

  function Ord_psi(a, b, coeff = 1) {
    if (coeff === 0) return Ord_zero();
    let ret = Ord_allocterms(1);
    ret[0].c = coeff;
    ret[0].f = a;
    ret[0].x = b;
    return ret;
  }

  function Ord_psi0(b, coeff = 1) {
    return Ord_psi(Ord_zero(), b, coeff);
  }

  function Ord_inaccessible() {
    let ret = Ord_allocterms(1);
    ret[0].c = 0xFFFFFFFF;
    ret[0].f = Ord_number(0xFFFFFFFF);
    ret[0].x = Ord_zero();
    return ret;
  }

  function Ord_isnumber(o, n) {
    if (Ord_iszero(o)) return n === 0;
    else if (o.length === 1 && Ord_iszero(o[0].f) && Ord_iszero(o[0].x)) return n === o[0].c;
    else return 0;
  }

  function Ord_isfinite(o) {
    return Ord_iszero(o) || (o.length === 1 && Ord_iszero(o[0].f) && Ord_iszero(o[0].x));
  }

  function Ord_islimit(o) {
    if (Ord_iszero(o)) return 0;
    return o[o.length - 1].f.length || o[o.length - 1].x.length;
  }

  function Ord_ismonic(o) {
    return o.length === 1 && o[0].c === 1;
  }

  function Ord_isomegatower(o) {
    if (Ord_iszero(o)) return true;
    return (o.length === 1 && o[0].c === 1 && Ord_iszero(o[0].f) && Ord_isomegatower(o[0].x));
  }

  function Ord_lasttermcardinality(o) {
    if (Ord_iszero(o)) return Ord_zero();
    else return o[o.length - 1].f;
  }

  // Deep-copy slice to prevent mutations during formatting
  function Ord_someterms(o, n0, n1) {
    let ret = [];
    for (let i = n0; i < n1; i++) {
      ret.push({
        c: o[i].c,
        f: Ord_copy(o[i].f),
        x: Ord_copy(o[i].x)
      });
    }
    return ret;
  }

  function Ord_firstterms(o) {
    return Ord_someterms(o, 0, o.length - 1);
  }

  function Ord_lastterm(o) {
    return Ord_psi(o[o.length - 1].f, o[o.length - 1].x, o[o.length - 1].c);
  }

  function Ord_successor(o) {
    if (o.length > 0 && Ord_iszero(o[o.length - 1].f) && Ord_iszero(o[o.length - 1].x)) {
      let ret = Ord_copyshallow(o);
      ret[o.length - 1].c++;
      return ret;
    } else {
      let ret = Ord_copyshallow(o);
      ret.push({ c: 1, f: Ord_zero(), x: Ord_zero() });
      return ret;
    }
  }

  function Ord_predecessor(o) {
    if (Ord_iszero(o)) return Ord_zero();
    if (Ord_islimit(o)) return Ord_copyshallow(o);
    if (o[o.length - 1].c > 1) {
      let ret = Ord_copyshallow(o);
      ret[o.length - 1].c--;
      return ret;
    } else return Ord_firstterms(o);
  }

  function cmp(a, b) {
    if (a === Limit && b === Limit) return 0;
    if (a === Limit) return 1;
    if (b === Limit) return -1;
    if (Ord_iszero(a) && Ord_iszero(b)) return 0;
    if (Ord_iszero(a)) return -1;
    if (Ord_iszero(b)) return 1;

    let n, i;
    for (n = 0; ; n++) {
      if (n >= a.length && n < b.length) return -1;
      if (n < a.length && n >= b.length) return 1;
      if (n >= a.length && n >= b.length) return 0;
      i = cmp(a[n].f, b[n].f);
      if (i !== 0) return i;
      i = cmp(a[n].x, b[n].x);
      if (i !== 0) return i;
      if (a[n].c < b[n].c) return -1;
      if (a[n].c > b[n].c) return 1;
    }
  }

  function Ord_equal(A, B) { return cmp(A, B) === 0; }
  function Ord_lt(A, B) { return cmp(A, B) < 0; }
  function Ord_gt(A, B) { return cmp(A, B) > 0; }
  function Ord_lte(A, B) { return cmp(A, B) <= 0; }

  function Ord_addproper(a, b) {
    if (Ord_iszero(a)) return Ord_copy(b);
    if (Ord_iszero(b)) return Ord_copy(a);
    let am, j, i, eq = 0;
    for (am = a.length; am > 0; am--) {
      j = cmp(a[am - 1].f, b[0].f);
      if (j > 0) break;
      else if (j === 0) {
        i = cmp(a[am - 1].x, b[0].x);
        if (i > 0) break;
        else if (i === 0) { eq = 1; break; }
      }
    }
    let ret = [];
    for (let k = 0; k < (eq ? am - 1 : am); k++) ret.push(Ord_copy([a[k]])[0]);
    if (eq) {
      ret.push({
        c: a[am - 1].c + b[0].c,
        f: Ord_copy(b[0].f),
        x: Ord_copy(b[0].x)
      });
      for (let k = 1; k < b.length; k++) ret.push(Ord_copy([b[k]])[0]);
    } else {
      for (let k = 0; k < b.length; k++) ret.push(Ord_copy([b[k]])[0]);
    }
    return ret;
  }

  function OrdTerm_simplifyfixedpoint(t) {
    if (!Ord_ismonic(t.x)) return t;
    let u = { c: t.c, f: Ord_copy(t.x[0].f), x: Ord_copy(t.x[0].x) };
    if (!Ord_equal(t.f, u.f)) return t;
    if (Ord_gt(Ord_lasttermcardinality(u.x), t.f)) return u;
    else return t;
  }

  function Ord_apply(f, x) {
    let m = 0;
    for (let n = 0; n < f.length; n++) if (f[n].c) m++; else m += x.length;
    let ret = [];
    for (let n = 0; n < f.length; n++) {
      if (f[n].c) {
        ret.push({
          c: f[n].c,
          f: Ord_apply(f[n].f, x),
          x: Ord_apply(f[n].x, x)
        });
      } else {
        for (let k = 0; k < x.length; k++) {
          ret.push({
            c: x[k].c,
            f: Ord_copy(x[k].f),
            x: Ord_copy(x[k].x)
          });
        }
      }
    }
    return ret;
  }

  function Ord_makeimpredfn(o) {
    let l = o[o.length - 1];
    let extra = l.c > 1 ? 1 : 0;
    let ret = Ord_allocterms(o.length + extra);
    for (let n = ret.length - 2; n >= 0; n--) {
      ret[n].c = o[n].c;
      ret[n].f = Ord_copy(o[n].f);
      ret[n].x = Ord_copy(o[n].x);
    }
    if (l.c > 1) ret[ret.length - 2].c--;
    if (Ord_islimit(l.x)) {
      ret[ret.length - 1].c = 1;
      ret[ret.length - 1].f = Ord_copy(l.f);
      ret[ret.length - 1].x = Ord_makeimpredfn(l.x);
    } else if (Ord_iszero(l.x)) {
      if (Ord_islimit(l.f)) {
        ret[ret.length - 1].c = 1;
        ret[ret.length - 1].f = Ord_makeimpredfn(l.f);
        ret[ret.length - 1].x = Ord_copy(l.x);
      } else {
        ret[ret.length - 1].c = 0;
        ret[ret.length - 1].f = Ord_zero();
        ret[ret.length - 1].x = Ord_zero();
      }
    }
    return ret;
  }

  let cs = [];

  function Ord_fundseq(o, m) {
    let n;
    cs.push(o);
    if (o.length > 0 && o[0].c === 0xFFFFFFFF) {
      let seq = [];
      seq[0] = Ord_number(1);
      for (n = 1; n < m; n++) seq[n] = Ord_psi(seq[n - 1], Ord_zero());
      return seq;
    }
    if (o.length > 1) {
      let first = Ord_firstterms(o), last = Ord_lastterm(o);
      let seq = Ord_fundseq(last, m);
      for (n = 0; n < m; n++) { seq[n] = Ord_add(first, seq[n]); }
      return seq;
    }
    let f = o[0].f, x = o[0].x;
    if (o[0].c > 1) {
      let monic = Ord_psi(f, x), rest = Ord_psi(f, x, o[0].c - 1);
      let seq = Ord_fundseq(monic, m);
      for (n = 0; n < m; n++) { seq[n] = Ord_add(rest, seq[n]); }
      return seq;
    }
    if (Ord_islimit(x)) {
      let seq = Ord_fundseq(x, m);
      for (n = 0; n < m; n++) { seq[n] = Ord_psi(f, seq[n]); }
      return seq;
    } else if (Ord_iszero(x)) {
      if (Ord_islimit(f)) {
        let seq = Ord_fundseq(f, m);
        for (n = 0; n < m; n++) { seq[n] = Ord_psi(seq[n], Ord_zero()); }
        return seq;
      } else {
        let caIndex = -1;
        for (n = cs.length - 1; n >= 0; n--) {
          if (Ord_ismonic(cs[n]) && Ord_lt(cs[n][0].f, f)) { caIndex = n; break; }
        }
        let cf = Ord_makeimpredfn(cs[caIndex + 1]), beta = Ord_predecessor(f), ff;
        let seq = [];
        seq[0] = Ord_zero();
        for (n = 1; n < m; n++) {
          ff = Ord_apply(cf, seq[n - 1]);
          seq[n] = Ord_psi(beta, ff);
        }
        return seq;
      }
    } else {
      let beta = Ord_predecessor(x);
      let seq = [];
      for (n = 0; n < m; n++) seq[n] = Ord_psi(f, beta, n);
      return seq;
    }
  }

  function fs(ord, n) {
    if (ord === Limit) ord = Ord_psi0(Ord_inaccessible());
    if (Ord_iszero(ord) || !Ord_islimit(ord)) return ord;

    cs = [];
    let seq = Ord_fundseq(ord, n + 1);
    return seq[n];
  }

  function isSuccessor(ord) {
    if (ord === Limit) return false;
    if (Ord_iszero(ord)) return false;
    return !Ord_islimit(ord);
  }

  function Ord_printbf(o) {
    if (Ord_iszero(o)) return "0";
    let ret = "";
    let n, c, f, x;
    for (n = 0; n < o.length; n++) {
      c = o[n].c; f = o[n].f; x = o[n].x;
      if (n > 0) ret += "+";
      if (c === 0) { ret += "x"; continue; }
      else if (c === 0xFFFFFFFF) { ret += "I"; continue; }

      if (Ord_iszero(f) && Ord_iszero(x)) {
        ret += c.toString(); continue;
      }

      if (Ord_iszero(x) && !Ord_iszero(f)) {
        if (Ord_isnumber(f, 1)) ret += "&Omega;";
        else ret += `&Omega;<sub>${Ord_printbf(f)}</sub>`;
      } else if (!Ord_iszero(x) && Ord_lte(Ord_lasttermcardinality(x), f)) {
        let cidx;
        for (cidx = 0; cidx < x.length && Ord_gt(x[cidx].f, f); cidx++);
        let pref, xbig;
        if (cidx === 0) {
          if (Ord_iszero(f)) pref = Ord_zero();
          else pref = Ord_psi(f, Ord_zero());
        } else {
          xbig = Ord_someterms(x, 0, cidx);
          pref = Ord_psi(f, xbig);
        }
        let xsmall = Ord_someterms(x, cidx, x.length), sum = Ord_addproper(pref, xsmall);
        if (Ord_isnumber(sum, 1)) ret += "&omega;";
        else ret += `&omega;<sup>${Ord_printbf(sum)}</sup>`;
      } else {
        let done = 0;
        let fsOrd = Ord_successor(f);
        if (x.length && Ord_equal(x[x.length - 1].f, fsOrd)) {
          let omfs = Ord_psi(fsOrd, Ord_zero()), psifsfs = Ord_psi(fsOrd, omfs);
          if (Ord_lt(x[x.length - 1].x, omfs)) {
            let cidx;
            for (cidx = x.length - 1; cidx > 0 && Ord_equal(x[cidx - 1].f, fsOrd) && Ord_lt(x[cidx - 1].x, omfs); cidx--);
            let pref, xbig;
            if (cidx === 0) {
              if (Ord_iszero(f)) pref = Ord_zero();
              else pref = Ord_psi(f, Ord_zero());
            } else {
              xbig = Ord_someterms(x, 0, cidx);
              pref = Ord_psi(f, xbig);
            }
            let xeps = Ord_someterms(x, cidx, x.length);
            for (let i = xeps.length - 1; i >= 0; i--) {
              xeps[i].f = Ord_zero();
              xeps[i] = OrdTerm_simplifyfixedpoint(xeps[i]);
            }
            let sum;
            if (Ord_iszero(pref) && Ord_isfinite(xeps)) {
              let xepsp = Ord_predecessor(xeps);
              sum = Ord_addproper(pref, xepsp);
            } else sum = Ord_addproper(pref, xeps);
            ret += `&epsilon;<sub>${Ord_printbf(sum)}</sub>`;
            done = 1;
          } else if (Ord_lt(x[x.length - 1].x, psifsfs)) {
            let nm = 0, j; let lastx = x[x.length - 1].x;
            for (let i = lastx.length - 1; i >= 0; i--) if (Ord_equal(lastx[i].f, fsOrd)) nm++;
            let nveb = Ord_allocterms(nm);
            for (let i = 0, k = 0; i < lastx.length; i++) if (Ord_equal(lastx[i].f, fsOrd)) {
              nveb[k] = { c: lastx[i].c, f: Ord_zero(), x: Ord_copy(lastx[i].x) };
              nveb[k] = OrdTerm_simplifyfixedpoint(nveb[k]);
              k++;
            }
            if (Ord_isfinite(nveb)) nveb[0].c++;
            let next = Ord_addproper(lastx, omfs);
            let cidx;
            for (cidx = x.length - 1; cidx > 0 && Ord_equal(x[cidx - 1].f, fsOrd) && Ord_lt(x[cidx - 1].x, next); cidx--);
            let pref, xbig;
            if (cidx === 0) {
              if (Ord_iszero(f)) pref = Ord_zero();
              else pref = Ord_psi(f, Ord_zero());
            } else {
              xbig = Ord_someterms(x, 0, cidx);
              pref = Ord_psi(f, xbig);
            }
            let xvebtmp = [], xveb = [];
            for (let i = cidx; i < x.length; i++) {
              let termI = { c: x[i].c, f: Ord_zero(), x: [] };
              for (j = x[i].x.length; j > 0 && Ord_iszero(x[i].x[j - 1].f); j--);
              termI.x = Ord_someterms(x[i].x, j, x[i].x.length);
              xvebtmp.push(termI);
              xveb.push(OrdTerm_simplifyfixedpoint(termI));
            }
            let sum;
            if (Ord_iszero(pref) && Ord_isfinite(xveb)) {
              let xvebp = Ord_predecessor(xveb);
              sum = Ord_addproper(pref, xvebp);
            } else sum = Ord_addproper(pref, xveb);
            ret += `&phi;<sub>${Ord_printbf(nveb)}</sub>(${Ord_printbf(sum)})`;
            done = 1;
          }
        }
        if (!done) {
          ret += `&psi;<sub>${Ord_printbf(f)}</sub>(${Ord_printbf(x)})`;
        }
      }
      if (c > 1) {
        ret += `&middot;${c}`;
      }
    }
    return ret;
  }

  function display(ord, mode) {
    if (ord === Limit) return "Limit";
    if (Ord_iszero(ord)) return "0";
    if (mode === "raw") return JSON.stringify(ord);
    if (mode === "pretty") return Ord_printbf(ord);
    return Ord_printbf(ord);
  }

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#A00000"],
    ["Limit Ordinal", "#FFA000"],
    ["Power of ω", "#FFFF00"],
    ["Tower of ω", "#FFFFFF"],
    ["ε Ordinal", "#00FF00"],
    ["Veblen Ordinal", "#00FFFF"],
    ["Feferman–Schütte Ordinal", "#FF00FF"],
    ["Bachmann–Howard Ordinal", "#0000FF"],
    ["Buchholz Ordinal", "#404040"]
  ];

  // Pre-constructed limits for Ord_type classification
  const phi1 = Ord_psi(Ord_number(1), Ord_zero());
  const phi11 = Ord_psi(Ord_number(1), phi1);
  const phi111 = Ord_psi(Ord_number(1), phi11);

  function classifyOrdinal(o) {
    if (o === Limit) return "#404040";
    if (Ord_iszero(o)) return "#808080";
    if (!Ord_islimit(o)) return "#A00000";

    if (Ord_ismonic(o)) {
      let arg = o[0].x;
      if (Ord_iszero(arg)) {
        if (Ord_isomegatower(o)) return "#FFFFFF";
        return "#FFFF00";
      }

      let lastTerm = arg[arg.length - 1];
      let lastf = lastTerm.f;
      let lastx = lastTerm.x;

      if (Ord_iszero(lastf)) {
        if (Ord_isomegatower(o)) return "#FFFFFF";
        return "#FFFF00";
      } else if (Ord_isnumber(lastf, 1)) {
        let last = Ord_psi(lastf, lastx);
        let color = "#FF00FF"; // Feferman-Schütte default

        if (Ord_lt(last, phi11)) color = "#00FF00";      // Epsilon
        else if (Ord_lt(last, phi111)) color = "#00FFFF"; // Veblen

        return color;
      } else if (Ord_isfinite(lastf)) {
        return "#0000FF"; // Bachmann-Howard
      } else {
        return "#404040"; // Buchholz
      }
    }

    return "#FFA000"; // General Limit Ordinal
  }

  function parse(str) {
    str = str.trim();
    if (str === "" || str === "0") return Zero;
    if (str === "Limit") return Limit;
    try {
      return JSON.parse(str);
    } catch (e) {
      return Zero;
    }
  }

  const DisplayName = ["pretty", "raw"];

  const Aliases = [
    ["Extended Buchholz Ordinal", Limit]
  ];

  const config = {};
  const title = "Extended Buchholz OCF transfinite number line";

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
    title,
    pretty
  };

})();