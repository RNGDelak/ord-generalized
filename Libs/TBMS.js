/*
Notation : Transfinite Bashicu Matrix (TBM)
Limit : Limit
*/

window.notation = (() => {

  // Required Constants
  const Zero = [];
  const Limit = [[[Infinity, []]]];

  // Helper type checking and base constructors
  function ONE() {
    return [[]];
  }

  function OMEGA() {
    return [[], [[1, ONE()]]];
  }

  function is_infinity(a) {
    return Array.isArray(a) && a.length > 0 && Array.isArray(a[0]) && a[0].length > 0 && a[0][0][0] === Infinity;
  }

  function is_one(expr) {
    return expr.length === 1 && expr[0].length === 0;
  }

  function is_limit(m) {
    if (is_infinity(m)) return true;
    if (!Array.isArray(m) || m.length === 0) return false;
    return m[m.length - 1].length > 0;
  }

  // Matrix utility functions
  function lex_compare(a, b, comp) {
    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) {
      const c = comp(a[i], b[i]);
      if (c !== 0) return c;
    }
    return Math.sign(a.length - b.length);
  }

  function entry_compare(e1, e2) {
    if (e1[0] !== e2[0]) return e1[0] < e2[0] ? -1 : 1;
    return cmp(e1[1], e2[1]);
  }

  function column_compare(c1, c2) {
    return lex_compare(c1, c2, entry_compare);
  }

  // Compare two TBM matrix expressions
  function cmp(a, b) {
    if (is_infinity(a) && is_infinity(b)) return 0;
    if (is_infinity(a)) return 1;
    if (is_infinity(b)) return -1;
    return lex_compare(a, b, column_compare);
  }

  function vertical_compare(v1, v2) {
    return lex_compare(v1, v2, cmp);
  }

  function index_after(V, pos) {
    for (let k = 0; k < V.length; k++) {
      if (vertical_compare(V[k], pos) > 0) return k;
    }
    return V.length;
  }

  function vertical_parent(v, Pi, Vi) {
    for (let k = 0; k < Vi.length; k++) {
      if (vertical_compare(Vi[k], v) >= 0) return Pi[k];
    }
    return undefined;
  }

  function vertical_add(v1, v2) {
    if (v1.length === 0) return v2.slice();
    if (v2.length === 0) return v1.slice();
    const first2 = v2[0];
    let i = v1.length;
    while (i > 0 && cmp(v1[i - 1], first2) < 0) i--;
    return v1.slice(0, i).concat(v2);
  }

  function column_verticals(col) {
    const result = [];
    let acc = [];
    for (const [, height_expr] of col) {
      acc = vertical_add(acc, [height_expr]);
      result.push(acc.slice());
    }
    return result;
  }

  function parents(m, V) {
    const P = [];
    for (let i = 0; i < m.length; i++) {
      const Pi = [];
      for (let j = 0; j < m[i].length; j++) {
        const [value] = m[i][j];
        const pos = j === 0 ? [] : V[i][j - 1];
        let p = j === 0 ? i - 1 : Pi[j - 1][0];
        while (p >= 0) {
          if (m[p].length === 0) {
            if (0 < value) {
              Pi.push([p, 0]);
              break;
            }
            p = -1;
            break;
          }
          const j_p = j === 0 ? 0 : index_after(V[p], pos);
          if (j_p >= m[p].length) {
            Pi.push([p, j_p]);
            break;
          }
          const value_p = m[p][j_p][0];
          if (value_p < value) {
            Pi.push([p, j_p]);
            break;
          }
          const next = j === 0 ? [p - 1, 0] : vertical_parent(pos, P[p], V[p]);
          if (!next) {
            p = -1;
            break;
          }
          p = next[0];
        }
        if (p < 0) break;
      }
      P.push(Pi);
    }
    return P;
  }

  function to_vertical(m) {
    const v = [];
    let prev = 0;
    for (let i = 1; i <= m.length; i++) {
      if (i === m.length || m[i].length === 0) {
        v.push(m.slice(prev, i));
        prev = i;
      }
    }
    return v;
  }

  function column_sub(a, b) {
    const off = [];
    const Va = column_verticals(a);
    const Vb = column_verticals(b);
    for (let j = 0; j < a.length; j++) {
      const pos = j === 0 ? [] : Va[j - 1];
      const j_r = index_after(Vb, pos);
      const delta = a[j][0] - (j_r < Vb.length ? b[j_r][0] : 0);
      if (delta <= 0) break;
      off.push([delta, a[j][1]]);
    }
    return off;
  }

  function ascension_threshold(V, P, r, b) {
    const A = [];
    for (let i = 0; i < V.length; i++) {
      if (i < r) {
        A.push([]);
        continue;
      }
      if (i === r) {
        A.push(b);
        continue;
      }
      let found;
      for (let j = 0; j < V[i].length; j++) {
        const pos = j === 0 ? [] : V[i][j - 1];
        const [col_p] = P[i][j];
        if (col_p < r) {
          found = pos;
          break;
        }
        if (vertical_compare(pos, A[col_p]) >= 0) {
          found = pos;
          break;
        }
        let new_pos = V[i][j];
        if (vertical_compare(new_pos, A[col_p]) >= 0) {
          found = A[col_p];
          break;
        }
      }
      A.push(found ?? V[i][V[i].length - 1]);
    }
    return A;
  }

  function column_add(a, b) {
    const res = [];
    let ai = 0, bi = 0;
    while (ai < a.length || bi < b.length) {
      if (ai >= a.length) {
        res.push([b[bi][0], b[bi][1]]);
        bi++;
      } else if (bi >= b.length) {
        res.push([a[ai][0], a[ai][1]]);
        ai++;
      } else {
        const ea = a[ai], eb = b[bi];
        const c = cmp(ea[1], eb[1]);
        const h = c < 0 ? ea[1] : eb[1];
        res.push([ea[0] + eb[0], h]);
        if (c <= 0) ai++;
        if (c >= 0) bi++;
      }
    }
    return res;
  }

  function column_truncate(col, b) {
    const res = [];
    let ci = 0, vi = 0;
    while (ci < col.length && vi < b.length) {
      const e = col[ci];
      const vh = b[vi];
      const c = cmp(e[1], vh);
      const h = c < 0 ? e[1] : vh;
      res.push([e[0], h]);
      if (c <= 0) ci++;
      if (c >= 0) vi++;
    }
    return res;
  }

  function column_mul(col, w) {
    return col.map(([v, e]) => [v * w, e]);
  }

  function copy_column(col_i, offset, A_i, w) {
    return column_add(col_i, column_mul(column_truncate(offset, A_i), w));
  }

  function expand_limit(m, index) {
    const right = m.length - 1;
    const col = m[right];
    const last_idx = col.length - 1;
    const [v, h] = col[last_idx];
    const new_h = fs(h, index);
    const segs = to_vertical(new_h);
    const result = m.slice();
    const new_entries = col.slice(0, last_idx);
    for (const seg of segs) new_entries.push([v, seg]);
    result[right] = new_entries;
    return result;
  }

  function expand_successor(m, index) {
    const V = m.map(column_verticals);
    const P = parents(m, V);
    const N = m.length - 1;
    const r = P[N][m[N].length - 1][0];
    const result = m.slice(0, N);

    const b = m[N].length > 1 ? V[N][m[N].length - 2] : [];
    const offset = column_sub(m[N], m[r]);
    const A = ascension_threshold(V, P, r, b);

    for (let w = 1; w <= index; w++) {
      for (let i = r; i < N; i++) {
        result.push(copy_column(m[i], offset, A[i], w));
      }
    }
    return result;
  }

  function infinity_FS(index) {
    if (index === 0) return [[]];
    return [[], [[1, infinity_FS(index - 1)]]];
  }

  // Fundamental sequence lookup
  function fs(ord, n) {
    if (is_infinity(ord)) {
      return infinity_FS(n);
    }
    if (!Array.isArray(ord) || ord.length === 0) return [];

    const N = ord.length - 1;
    const last_col = ord[N];
    if (last_col.length === 0) return ord.slice(0, N);

    const [, last_height] = last_col[last_col.length - 1];
    if (is_one(last_height)) {
      return expand_successor(ord, n);
    } else {
      return expand_limit(ord, n);
    }
  }

  // Successor check
  function isSuccessor(ord) {
    if (is_infinity(ord) || !Array.isArray(ord) || ord.length === 0) return false;
    return !is_limit(ord);
  }

  // Display formatting
  function height_display(s, mode) {
    if (s.length === 1) return undefined;
    if (cmp(s, OMEGA()) === 0) return 'ω';
    return display(s, mode);
  }

  function entry_display([v, s], mode) {
    let sd = height_display(s, mode);
    if (sd === undefined) return '' + v;
    if (mode === 'pretty') return v + '<sup>' + sd + '</sup>';
    return v + '^' + sd;
  }

  function column_display(col, mode) {
    return '(' + col.map((e) => entry_display(e, mode)).join(',') + ')';
  }

  function display(ord, mode) {
    if (is_infinity(ord)) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";
    if (mode === 'raw') return JSON.stringify(ord);

    return ord.map((col) => column_display(col, mode)).join('');
  }

  // Visual categorization styling
  function classifyOrdinal(ord) {
    if (is_infinity(ord)) return "#ffffff";
    if (!Array.isArray(ord) || ord.length === 0) return "#808080";
    if (isSuccessor(ord)) return "#a00000";
    if (cmp(ord, OMEGA()) === 0) return "#ffff00";
    return "#ffa000";
  }

  // String parsing method
  function parse(str) {
    str = String(str).trim();
    if (str === "" || str === "0") return Zero;
    if (str.toLowerCase() === "limit") return Limit;

    let i = 0;
    const s = str;

    function error() {
      throw new Error(`Illegal input string: ${s}`);
    }

    function skip_spaces() {
      while (i < s.length && s[i] === ' ') i++;
    }

    function parse_number() {
      skip_spaces();
      const start = i;
      while (i < s.length && s[i] >= '0' && s[i] <= '9') i++;
      if (start === i) error();
      return parseInt(s.substring(start, i), 10);
    }

    function parse_expr() {
      const result = [];
      skip_spaces();
      while (i < s.length && s[i] === '(') {
        result.push(parse_column());
        skip_spaces();
      }
      return result;
    }

    function parse_column() {
      skip_spaces();
      if (i >= s.length || s[i] !== '(') error();
      i++;

      const entries = [];
      skip_spaces();
      if (i < s.length && s[i] !== ')') {
        entries.push(parse_entry());
        skip_spaces();
        while (i < s.length && s[i] === ',') {
          i++;
          skip_spaces();
          if (i < s.length && s[i] === ')') break;
          entries.push(parse_entry());
          skip_spaces();
        }
      }

      skip_spaces();
      if (i >= s.length || s[i] !== ')') error();
      i++;

      return entries;
    }

    function parse_height() {
      skip_spaces();
      if (i < s.length && (s[i] === 'ω' || s[i] === 'w')) {
        i++;
        return OMEGA();
      }
      return parse_expr();
    }

    function parse_entry() {
      const v = parse_number();
      skip_spaces();
      if (i < s.length && s[i] === '^') {
        i++;
        return [v, parse_height()];
      }
      return [v, ONE()];
    }

    const result = parse_expr();
    return result;
  }

  const DisplayName = ["raw", "pretty"];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#a00000"],
    ["Limit Ordinal", "#ffa000"],
    ["Omega", "#ffff00"]
  ];

  const Aliases = [
    ["0", Zero],
    ["(1)", [[ [1, ONE()] ]]],
    ["ω", OMEGA()],
    ["Limit", Limit]
  ];

  const config = { modes: [{ mode: 1, target: 'both' }] };
  const title = "Transfinite Bashicu Matrix transfinite number line";

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
