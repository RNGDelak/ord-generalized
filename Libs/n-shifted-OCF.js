/*
notation : n-shifted OCF
limit : ?
*/

window.notation = (() => {

  // --- n-shifted psi (HSPN) Notation Implementation ---

  const HSPN_count = (x) => {
    x = String(x || '');
    return (x.match(/\(/g) || []).length - (x.match(/\)/g) || []).length;
  };

  function unabbreviate(x) {
    let y = String(x || '');
    y = y.replaceAll('ψ', 'psi');
    y = y.replaceAll('Ω', 'W');
    y = y.replaceAll('ω', 'w');
    y = y.replaceAll('psi', 'p');
    y = y.replaceAll('_', '');
    y = y.replaceAll(/W\d+/g, p => 'W'.repeat(Number(p.slice(1))));
    function e(str) { return str.replaceAll(/p\(W{2,}\)/g, p => 'W'.repeat(p.length - 4)); }
    let safety = 0;
    while (e(y) != y && safety < 1000) { y = e(y); safety++; }
    y = y.replaceAll('w', 'p(1)');
    y = y.replaceAll(/[1-9]\d*/g, p => { return 'p(0)+'.repeat(Number(p)).slice(0, -1); });
    return y;
  }

  function abbreviate(x) {
    let y = String(x || '');
    y = y.replaceAll(/W{2,}/g, p => `W_${p.length}`);
    y = y.replaceAll('W', 'Ω');
    y = y.replaceAll('p(0)', '1');
    y = y.replaceAll(/(1\+)+1/g, p => ((p.length + 1) / 2).toString());
    y = y.replaceAll('p(1)', 'ω');
    y = y.replaceAll('p', 'ψ');
    return y;
  }

  function HSPN_std(x) { 
    if (!x || x === '0' || x === 0) return '0';
    return unabbreviate(abbreviate(String(x))); 
  }

  function HSPN_paren(x, n, sw = true) {
    x = String(x);
    if (n <= 0 || n >= x.length) return 0;
    if (x[n - 1] == 'W' && sw) {
      n--;
      let i = n;
      while (i < x.length && x[i] == 'W') { i++; }
      return i - 1;
    }
    let q = x[n] == '(' ? 1 : -1;
    let i = n;
    let t = 0;
    let safety = 0;
    while (safety < 10000) { 
      if (i < 0 || i >= x.length) break;
      t += (x[i] == '(' ? 1 : x[i] == ')' ? -1 : 0); 
      if (!t) { break; } 
      i += q; 
      safety++;
    }
    return i;
  }

  function HSPN_lv(x) {
    x = String(x);
    if (x == '0' || !x) { return 0; }
    else if (x.match(/^W+(\+|$)/)) { return HSPN_paren(x, 1) + 1; }
    else {
      let t = HSPN_paren(x, 1);
      return Math.max(0, HSPN_lv(x.slice(2, t)) - 1);
    }
  }

  function HSPN_arg(x) {
    x = String(x);
    if (x[0] == '0') { return x; }
    if (x[0] == 'W') { return 'W'.repeat(HSPN_paren(x, 1) + 1); }
    return x.slice(2, HSPN_paren(x, 1));
  }

  function HSPN_lt(x, y) {
    x = String(x || '0');
    y = String(y || '0');
    if (y == '0' || y === Infinity || y === 'Infinity') { return y !== '0' && y !== 0 && x !== y; }
    if (x == '0') { return true; }
    if (x === y) { return false; }
    if (HSPN_lv(x) == HSPN_lv(y)) {
      let x_ = HSPN_paren(x, 1);
      let y_ = HSPN_paren(y, 1);
      if (x.slice(0, x_ + 1) == y.slice(0, y_ + 1)) { return HSPN_lt(HSPN_std(x.slice(x_ + 2)), HSPN_std(y.slice(y_ + 2))); }
      return HSPN_lt(HSPN_arg(x), HSPN_arg(y));
    }
    return HSPN_lv(x) < HSPN_lv(y);
  }

  function HSPN_limit(s, n) { return 'p('.repeat(n + 1) + 'W'.repeat(s + n) + '+' + 'W'.repeat(s + n) + ')'.repeat(n + 1); }

  function HSPN_fix(s) { 
    s = String(s || ''); 
    let safety = 0;
    while (HSPN_count(s) > 0 && safety < 100) { s += ')'; safety++; } 
    return s; 
  }
  
  function HSPN_trim(s) { 
    s = String(s || ''); 
    while (s.at(-1) == ')') { s = s.slice(0, -1); } 
    return s; 
  }

  function HSPN_islimit(x) {
    if (x === Infinity || '' + x == 'Infinity') { return true; }
    x = String(x || '');
    if (x == '0') { return false; }
    if (x.at(-1) == 'W') { return true; }
    x = HSPN_trim(x);
    if (x.at(-1) == '0' && HSPN_count(x) == 1) { return false; }
    return true;
  }

  function HSPN_root(x, l) {
    x = String(x);
    let b = x.length - 1;
    while (b >= 0 && x[b] == ')') { b--; }
    if (b < 0 || x[b] == '0') { return undefined; }
    let a = b;
    while (a >= 0 && x[a] != '+' && x[a] != '(') { a--; }
    a++;
    b++;
    let i = b;
    let y = x.slice(a, b);
    if (l == 1) {
      let safety = 0;
      while (safety < 1000) {
        if (i >= x.length) { return undefined; }
        let c = HSPN_paren(x, i, false);
        if (HSPN_lt(x.slice(c - 1, i + 1), y)) { return [i, x.slice(c - 1, i + 1)]; }
        i++;
        safety++;
      }
      return undefined;
    }
    let h = x.length - 1;
    while (h >= 0 && x.at(h) != 'W') { h--; }
    let rootPrev = HSPN_root(x, l - 1);
    if (!rootPrev) return undefined;
    let v = x.slice(0, rootPrev[0]);
    let f = rootPrev;
    let z = HSPN_count(v);
    let q = f[0] - f[1].length + 2;
    let c = f[1];
    i = f[0] - f[1].length + 1;
    let safety = 0;
    while (safety < 1000) {
      if (i < 0) break;
      if (x[i] == '(') {
        let m = x.slice(0, i);
        let t = HSPN_count(m);
        if (t <= z) {
          if (HSPN_lt(HSPN_fix(x.slice(i - 1, h)), f[1])) {
            break;
          }
          q = i;
        }
      }
      i--;
      safety++;
    }
    q--;
    let n = f[0];
    let countSafety = 0;
    while (HSPN_count(x.slice(q, n + 1)) > 0 && countSafety < 1000) { n++; countSafety++; }
    return [n, x.slice(q, n + 1)];
  }

  const HSPN_FS = (() => {
    var data = {};
    return (m, n) => {
      m = String(m);
      if (m === 'Infinity' || m === 'Limit') return HSPN_fs_fn('W', n);
      if (m === '0') return '0';
      var datakey = HSPN_display(m);
      if (!data[datakey]) data[datakey] = [];
      else if (data[datakey][n] !== undefined) return data[datakey][n];
      return data[datakey][n] = HSPN_fs_fn(m, n);
    };
  })();

  function HSPN_fs_fn(x, n) {
    x = String(x);
    if (x == '0') { return x; }
    if (x.at(-1) == 'W') {
      let y = x;
      while (y.at(-1) == 'W') { y = y.slice(0, -1); }
      return y + HSPN_limit(x.length - y.length, n);
    }
    x = HSPN_trim(x);
    let o = '';
    if (x.at(-1) == '0') {
      if (HSPN_count(x) == 1) { o = (x != 'p(0') ? x.slice(0, -4) : '0'; }
      else {
        x += '))';
        let k = HSPN_paren(x, x.length - 1);
        let z = x.slice(k - 1, -5) + ')';
        o = x.slice(0, k - 1) + ('+' + z).repeat(n + 1);
      }
    } else {
      let m = false;
      let z = x;
      let y = HSPN_fix(x);
      let i = 0;
      while (z.at(-1) == 'W') { i++; z = z.slice(0, -1); }
      let l = i;
      let j = x.length;
      let v = 'W'.repeat(i);
      let a = undefined;
      let safety = 0;
      while (safety < 1000) {
        while (safety < 1000) {
          if (j >= y.length) { m = true; break; }
          a = HSPN_paren(y, j, false);
          if (HSPN_lt(y.slice(a - 1, j + 1), v)) { break; }
          j++;
          safety++;
        }
        if (m) { break; }
        v = y.slice(a - 1, j + 1);
        i--;
        if (!i) { break; }
        safety++;
      }
      if (m) {
        o = z + HSPN_limit(l, n);
      } else {
        let rootRes = HSPN_root(y, l);
        let r = rootRes ? rootRes[0] - rootRes[1].length + 1 : 1;
        if (r < 1) { n++; }
        o = x.slice(0, r) + z.slice(r).repeat(n);
      }
    }
    o = HSPN_fix(o).replaceAll('+)', ')').replaceAll('(+', '(').replaceAll('++', '+').replaceAll('()', '(0)');
    if (o[0] == '+') { o = o.slice(1); }
    return HSPN_std(o);
  }

  function HSPN_display(x) {
    if (x === Infinity || '' + x == 'Infinity') { return 'Limit'; }
    return abbreviate(String(x)).replaceAll(/_\d+/g, sub => `<sub>${Number(sub.slice(1))}</sub>`);
  }

  function HSPN_compare(x, y) {
    if (HSPN_lt(x, y)) { return -1; }
    if (HSPN_lt(y, x)) { return 1; }
    return 0;
  }

  // --- Module Wrapper Integration ---

  function fs(ord, n) {
    return HSPN_FS(ord, n);
  }

  function cmp(a, b) {
    return HSPN_compare(a, b);
  }

  function isSuccessor(ord) {
    return !HSPN_islimit(ord);
  }

  function display(ord, mode) {
    if (mode === 'normal') {
      return '' + ord;
    }
    return HSPN_display(ord);
  }

  function classifyOrdinal(ord) {
    if (ord === Infinity || '' + ord === 'Infinity') return "#ff8000";
    if (ord === '0') return "#808080";
    if (HSPN_islimit(ord)) return "#ff8000";
    return "#d40000";
  }

  function parse(str) {
    str = (str || "").trim();
    if (str === "" || str === "0") return '0';
    if (str === "Limit" || str === "Infinity") return Infinity;
    return HSPN_std(unabbreviate(str));
  }

  const Zero = '0';
  const Limit = Infinity;

  const DisplayName = ["normal", 'HSPN'];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#d40000"],
    ["Limit Ordinal", "#ff8000"]
  ];

  const Aliases = [
    ["Limit", Infinity]
  ];

  const config = {
    mode:1
  };

  const title = "n-shifted psi transfinite number line";

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