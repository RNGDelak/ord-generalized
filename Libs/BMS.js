/*
Notation : BMS
Limit : ω-Y(1,3)
*/


window.notation = (() => {

    function cmp(m1, m2) {
        function sequence_compare(seq1, seq2) {
            if (seq1.length === 0) {
                if (seq2.length === 0) return 0;
                else return -1;
            } else {
                if (seq2.length === 0) return 1;
                else {
                    if (seq1[0] < seq2[0]) return -1;
                    else if (seq1[0] > seq2[0]) return 1;
                    else return sequence_compare(seq1.slice(1), seq2.slice(1));
                }
            }
        }

        if (m1 === "Limit" && m2 === "Limit") return 0;
        if (m1 === "Limit") return 1;
        if (m2 === "Limit") return -1;

        if (m1.length === 0) return m2.length === 0 ? 0 : -1;
        if (m2.length === 0) return 1;

        let col1 = m1[0];
        let col2 = m2[0];

        const diff = col1.length - col2.length;

        if (diff > 0) {
            col2 = col2.concat(Array(diff).fill(0));
        } else if (diff < 0) {
            col1 = col1.concat(Array(-diff).fill(0));
        }

        const c = sequence_compare(col1, col2);

        return c || cmp(m1.slice(1), m2.slice(1));
    }

    function isSuccessor(matrix) {
        return matrix !== "Limit" && (matrix.length === 0 || !matrix.at(-1)?.some(x => x !== 0));
    }

    function fs(m, FSterm) {
        if (m === "Limit") {
            return [
                Array(FSterm + 1).fill(0),
                Array(FSterm + 1).fill(1)
            ];
        }

        if (m.length === 0) {
            return [];
        }

        const parent_cache = Object.create(null);
        const ascending_cache = Object.create(null);

        function parent(x, y) {
            const key = `${x},${y}`;

            if (key in parent_cache) {
                return parent_cache[key];
            }

            let p = x;

            while ((p = y ? parent(p, y - 1) : p - 1) >= 0) {
                if (m[p][y] < m[x][y]) break;
            }

            return parent_cache[key] = p;
        }

        function ascending(r, x, y) {
            const key = `${r},${x},${y}`;

            if (key in ascending_cache) {
                return ascending_cache[key];
            }

            return ascending_cache[key] =
                r <= x &&
                (r === x || ascending(r, parent(x, y), y));
        }

        const endcol = m.length - 1;
        let result = m.slice(0, endcol);

        const child = m[endcol];
        const ymax = child.length - 1;

        let LNZ;

        for (LNZ = ymax; LNZ >= 0; --LNZ) {
            if (child[LNZ] > 0) break;
        }

        if (LNZ < 0) {
            return result;
        }

        const BR = parent(endcol, LNZ);
        const BRcolumn = m[BR];

        const offset = child.map((v, y) =>
            y < LNZ ? v - BRcolumn[y] : 0
        );

        const offsetAsc = Array(endcol)
            .fill(0, BR)
            .map((_, x) =>
                offset.map((v, y) =>
                    ascending(BR, x, y) ? v : 0
                )
            );

        for (let n = 1; n <= FSterm; n++) {
            for (let col = BR; col < endcol; col++) {
                result.push(
                    m[col].map(
                        (v, y) =>
                            v + offsetAsc[col][y] * n
                    )
                );
            }
        }

        if (
            ymax > 0 &&
            result.every(column => column[ymax] === 0)
        ) {
            result = result.map(column =>
                column.slice(0, ymax)
            );
        }

        return result;
    }

    const ZERO = []

    function display(ord, mode) {
        if (ord.length == 0) return '0' 
        if (cmp(ord, 'Limit') == 0) return 'Lim(BMS)'
        if (mode == "normal" || cmp(ord, [[0, 0, 0], [1, 1, 1], [2, 2, 0]]) > -1) 
            return ord.map(p => `(${p.join(',')})`).join('')

        if (mode == "2 shifted-OCF")
            return Conv_BMS_OCF(ord)
    }

    function classifyOrdinal(M) {
        if (!M.length) return "#808080"; 

        let j = M.findLastIndex(x => !x[0]);

        if (j != 0) {
            if (j == M.length - 1) return "#d40000"; 
            return "#ff8000"; 
        }

        if (M.length == 1) return "#d40000"; 

        j = M.slice(j).findLastIndex(x => x[0] == 1);

        const N = M.slice(j);

        if (cmp(N, [[1, 1, 1]]) >= 0) return "#3f3f3f"; 
        if (cmp(N, [[1, 1], [2, 2]]) >= 0) return "#000fff"; 
        if (cmp(N, [[1, 1], [2, 1], [3, 1]]) >= 0) return "#f00fff"; 
        if (cmp(N, [[1, 1], [2, 1]]) >= 0) return "#00FFF0"; 
        if (cmp(N, [[1, 1]]) >= 0) return "#00FF00"; 

        if (M.at(-1)[0] == M.length - 1) return "#ffffff"; 

        return "#ffff00"; 
    }

    function parse(str) {
        return str;
    }

    const Zero = [] 
    const Limit = 'Limit' 

    const DisplayName = ["normal", "2 shifted-OCF"] 
    const ordinalTypes = [
        ["Zero", "#808080"],
        ["Successor Ordinal", "#d40000"],
        ["Limit Ordinal", "#ff8000"],
        ["Power of ω", "#ffff00"],
        ["Tower of ω", "#ffffff"],
        ["ε Ordinal", "#00FF00"],
        ["Veblen Ordinal", "#00FFF0"],
        ["Feferman–Schütte Ordinal", "#f00fff"],
        ["Bachmann–Howard Ordinal", "#000fff"],
        ["Buchholz Ordinal", "#3f3f3f"]
    ]; 

    const Aliases = [
        ["First 67 Ordinal", fs([[0], [1]], 66)], 
        ["First Transfinite Ordinal", [[0], [1]]],
        ["Small Cantor Ordinal", [[0, 0], [1, 1]]],
        ["Veblen Ordinal", [[0, 0], [1, 1], [2, 1], [3, 0]]],
        ["Feferman–Schütte Ordinal", [[0, 0], [1, 1], [2, 1], [3, 1]]],
        ["First Γ fixed point", [[0, 0], [1, 1], [2, 1], [3, 1], [2, 1]]],
        ["Ackermann Ordinal", [[0, 0], [1, 1], [2, 1], [3, 1], [3, 1]]],
        ["Small Veblen Ordinal", [[0, 0], [1, 1], [2, 1], [3, 1], [4, 0]]],
        ["Large Veblen Ordinal", [[0, 0], [1, 1], [2, 1], [3, 1], [4, 1]]],
        ["Ackermann Ordinal", [[0, 0], [1, 1], [2, 1], [3, 1], [3, 1]]],
        ["Bachmann–Howard Ordinal", [[0, 0], [1, 1], [2, 2]]],
        ["Buchholz's Ordinal", [[0, 0, 0], [1, 1, 1]]],
        ["Takeuti-Feferman-Buchholz Ordinal", [[0, 0, 0], [1, 1, 1], [2, 1, 0], [3, 2, 0]]],
        ["Bird's Ordinal", [[0, 0, 0], [1, 1, 1], [2, 1, 1], [3, 1, 0]]],
        ["Extended Buchholz Ordinal", [[0, 0, 0], [1, 1, 1], [2, 1, 1], [3, 1, 0], [2, 0, 0]]],
        ["Multivariable Buchholz Ordinal", [[0, 0, 0], [1, 1, 1], [2, 1, 1], [3, 1, 1], [3, 0, 0]]],
        ["Transfinitary Buchholz Ordinal", [[0, 0, 0], [1, 1, 1], [2, 1, 1], [3, 1, 1], [3, 1, 0], [2, 0, 0]]],
        ["Dimensional Buchholz Ordinal", [[0, 0, 0], [1, 1, 1], [2, 1, 1], [3, 1, 1], [3, 1, 0], [4, 2, 0]]],
        ["Small Stergent Ordinal", [[0, 0, 0], [1, 1, 1], [2, 2, 0]]],
        ["Small Dropping Ordinal", [[0, 0, 0], [1, 1, 1], [2, 2, 1], [3, 0, 0]]],
        ["2nd Back Gear ordinal", [[0, 0, 0], [1, 1, 1], [2, 2, 1], [3, 3, 0]]],
        ["Omega Back ordinal / Small Bashicu ordinal", [[0, 0, 0], [1, 1, 1], [2, 2, 2]]],
        ["Lim(TSS)", [[0, 0, 0, 0], [1, 1, 1, 1]]],
        ["Lim(QSS)", [[0, 0, 0, 0, 0], [1, 1, 1, 1, 1]]],
        ["Lim(BMS) / ω-Y(1,3)", 'Limit'],
    ]; 

    const config = {} 
    const title = 'BMS transfinite number line' 

    function Conv_BMS_OCF(matrix) {
    function eq(a, b) {
        if (typeof (a) == 'number') { return a == b; }
        if (a.length == 2) { return eq(a[0], b[0]) && eq(a[1], b[1]); }
        return eq(a[0], b[0]) && eq(a[1], b[1]) && eq(a[2], b[2]);
    }

    // FROM COCF PROGRAM

    function paren(x, n) {
        console.log()
        let q = x[n] == '(' ? 1 : -1;
        let i = n;
        let t = 0;
        while (1) { t += (x[i] == '(' ? 1 : x[i] == ')' ? -1 : 0); if (!t) { break; }; i += q; }
        return i;
    }

    function firstTerm(x) {
        console.log()
        let m = paren(x, 1);
        return [x.slice(0, m + 1), x.slice(m + 2) || '0'];
    }

    function lastTerm(x) {
        console.log()
        let m = paren(x, x.length - 1);
        return [x.slice(0, m - 2) || '0', x.slice(m - 1)];
    }

    function terms(x) {
        console.log()
        if (x == '0') { return []; }
        return [firstTerm(x)[0]].concat(terms(firstTerm(x)[1]));
    }

    function arg(x) {
        console.log()
        return firstTerm(x)[0].slice(2, -1);
    }

    function lt(x, y) {
        console.log()
        if (y == '0') { return false; }
        if (x == '0') { return true; }
        if (x[0] == 'p' && y[0] == 'P') { return true; }
        if (x[0] == 'P' && y[0] == 'p') { return false; }
        if (arg(x) != arg(y)) { return lt(arg(x), arg(y)); }
        return lt(firstTerm(x)[1], firstTerm(y)[1]);
    }

    function gt(x, y) { return !(x == y || lt(x, y)) }

    function add(x, y) {
        if (x == '0') { return y; }
        if (y == '0') { return x; }
        if (lt(firstTerm(x)[0], firstTerm(y)[0])) { return y; }
        let z = firstTerm(x)[0]
        let w = add(firstTerm(x)[1], y);
        if (w != '0') { return z + '+' + w; }
        return z;
    }

    function sub(x, y) {
        if (x == '0') { return '0'; }
        if (y == '0') { return x; }
        if (lt(firstTerm(y)[0], firstTerm(x)[0])) { return x; }
        return sub(firstTerm(x)[1], firstTerm(y)[1]);
    }

    function sua(x) { return split(x, 'P(0)'); }

    function exp(a) {
        if (a[0] == 'P') { return `P(${sub(a, 'P(0)')})`; }
        if (lt(a, 'p(p(P(0)))')) { return `p(${a})`; }
        let [x, y] = sua(arg(a));
        let p = split(y, `p(${add(x, 'P(0)')})`)[0];
        return 'p(' + add(x, add(p, sub(a, 'p(' + add(x, p) + ')'))) + ')';
    }

    function log(a) {
        if (a == '0') { return '0'; }
        if (a[0] == 'P') { return add('P(0)', arg(a)); }
        let [x, y] = sua(arg(a));
        let [p, q] = split(y, `p(${add(x, 'P(0)')})`);
        if (x == '0' && p == '0') {
            return q;
        }
        let m = add(`p(${add(x, p)})`, q);
        return m;
    }

    function div(a, b) { // only works when b is a.p.
        if (lt(a, b)) { return '0'; }
        return add(exp(sub(log(a), log(b))), div(firstTerm(a)[1], b));
    }

    function mul(a, b) { // only works when a is a.p.
        if (b == '0') { return '0'; }
        return add(exp(add(log(a), log(b))), mul(a, firstTerm(b)[1]))
    }

    function split(a, x) {
        if (a == '0') { return ['0', '0']; }
        if (lt(a, x)) { return ['0', a]; }
        if (lt(firstTerm(a)[0], x)) { return ['0', a]; }
        return [add(firstTerm(a)[0], split(firstTerm(a)[1], x)[0]), split(firstTerm(a)[1], x)[1]];
    }

    function op(x) { // "does it need parentheses when you write something*x"
        if (lt(x, 'p(p(0))')) { return false; }
        let f = (x[0] == 'p') ? `p(${sua(arg(x))[0]})` : 'P(0)';
        let g = null;
        let h = null;
        if (f == 'p(0)') { f = 'p(p(0))'; g = log(x); h = exp(g); }
        else { g = div(log(x), f); h = exp(mul(f, g)) }
        let c = div(x, h);
        let d = sub(x, mul(h, div(x, h)));
        if (d != '0') { return true; }
        return false;
    }

    // does not handle I(ψ(T^M),1) because it's too complicated
   function display(x, y) {
      //if(!y){return 'X'}
      //console.log(x);
      if (x == '0') { return '0'; }
      if (/^(p\(0\)\+)*p\(0\)$/.test(x)) { return ((x.length + 1) / 5).toString(); }
      let f = (x[0] == 'p') ? `p(${sua(arg(x))[0]})` : 'P(0)';
      let f1 = (x[0] == 'p') ? sua(arg(x), 'P(0)')[1] : arg(x);
      let g = null;
      let h = null;
      if (f == 'p(0)') { f = 'p(p(0))'; g = log(x); h = firstTerm(x)[0]; }
      else { g = div(log(x), f); h = `${f == 'P(0)' ? 'P' : 'p'}(${split(arg(x), f)[0]})`; }
      let c = div(x, h);
      let d = sub(x, mul(h, div(x, h)));
      //console.log(f,g,h,'',c,d);
      if (c == 'p(0)' && d == '0') {
         if (exp(x) != x) {
            if (x == 'p(p(0))') { return 'ω'; }
            if (lt(x, 'p(P(0))')) { return `ω<sup>${display(log(x))}</sup>`; }
            return `${display(f)}<sup>${display(g)}</sup>`
         }
         if (x == 'P(0)') { return 'T'; }
         let m = div(log(lastTerm(arg(x))[1]), 'P(0)');
         let k = exp(mul('P(0)', div(log(lastTerm(arg(x))[1]), 'P(0)')));
         k = div(arg(x), k);
         //console.log(arg(x),k,m)
         k = sua(k);
         t = exp(add(mul('P(0)', m), 'P(0)'));
         let l = null;
         if (k[0] == '0') { l = '0'; }
         else { l = 'p(' + mul(exp(mul('P(0)', m)), k[0]) + ')'; }
         let r = 'p(' + mul(exp(mul('P(0)', m)), add(k[0], 'P(0)')) + ')';
         let [a, b] = split(k[1], r);
         a = 'p(' + mul(exp(mul('P(0)', m)), a) + ')'
         //console.log(k,r,l,a,b)
         if (a == 'p(0)') { a = '0'; }
         l = add(l, add(a, b))
         let s = ''
         if (lastTerm(arg(x))[1][0] == 'P' && b != '0') {
            if (m == 'p(0)') { s = 'Ω'; }
            else if (m == 'p(0)+p(0)') { s = 'I'; }
            else if (lt(m, 'p(P(P(p(P(P(P(0)))))))')) { s = `I(${display(sub(m, 'p(0)+p(0)'))},x)`; }
            else if (m == 'P(0)') { s = 'M'; }
            else if (m == 'P(P(0))') { s = 'N'; }
            else if (m == 'P(P(P(0)))') { s = 'K'; }
            else if (m == 'P(P(P(P(0))))') { s = 'U'; }
            else if (lt(m, 'P(p(P(P(P(0)+p(P(P(P(0)+P(0))))))))') && !lt(lastTerm(m)[1], 'P(0)')) { s = `M(${display(sub(div(m, 'P(0)'), 'p(0)'))},x)`; }
            if (s == '') { return `ψ(${display(arg(x))})`; }
            if (l == 'p(0)') { return s.replace('x', '0'); }
            if (s.includes('x')) { return s.replace('x', display(sub(l, 'p(0)'))); }
            return `${s}<sub>${display(l)}</sub>`;
         }
         if (lt(f, 'p(P(p(P(P(0)))))') && gt(x, 'p(P(0))')) { return `ψ<sub>${display(div(arg(f), 'P(0)'))}</sub>(${display(f1)})`; }
         return `ψ(${display(arg(x))})`;
      }
      let a = display(h);
      //console.log(f,h,c,d)
      if (c != 'p(0)') {
         if (!op(c)) { a += display(c) }
         else { a += `&sdot;(${display(c)})`; }
      }
      if (d != '0') { a += '+' + display(d); }
      return a;
   }
function P_func(M, r, n) {
            if (r == -1) { return n - 1; }
            let q = P_func(M, r - 1, n);
            while (q > -1 && M[q][r] >= M[n][r]) { q = P_func(M, r - 1, q); }
            return q;
        }

        function C(M, n) {
            let X = [];
            for (let i = 0; i < M.length; i++) {
                if (P_func(M, 0, i) == n) { X.push(i); }
            }
            return X;
        }

        function U(M, n) {
            if (M[n][1] == 0 || M[n][2] == 1 || n + 1 == M.length) { return [0, null]; }
            let m = P_func(M, 1, n);
            let L = [M[m][0] + 1, M[n][1], M[m][2] + 1];
            if (P_func(M, 1, n) == P_func(M, 1, n + 1) && eq(M[n + 1], L)) { return [1, n + 1]; }
            let q = n;
            let p = n;
            while (q != -1) {
                q = P_func(M, 0, q);
                if (P_func(M, 1, n) == P_func(M, 1, q) && eq(M[q], L) && M[n + 1][0] > M[q][0]) {
                    if (M[p][2] == 1) { return [2, q] };
                    return [1, q];
                }
                p = q;
            }
            return [0, null];
        }

        function mv(M, n, k) { 
            if (k) {
                let A = [k];
                while (A.at(-1) != n) { 
                    A.push(P_func(M, 0, A.at(-1)));
                    if (!M[A.at(-1)][0]) { break; } 
                }
                if (A.includes(n)) {
                    for (let i of A.toReversed()) {
                        if (M[i][2] == 0) { k = i; break; }
                    }
                }
            }
            let S = '0';
            for (let i of C(M, n)) {
                if (i > k && k) { break; }
                if (M[i][2] != 1) { continue; }
                let q = '0';
                for (let j of C(M, i)) {
                    if (j > k && k) { break; }
                    q = add(q, ov(M, j, k));
                }
                S = add(S, exp(q));
            }
            let X = C(M, n).filter(x => M[x][2] && C(M, x).length);
            let p;
            if (!X.length) { p = 1; }
            else { p = M[CR(M, X.at(-1)).at(-1)][2]; }
            if (lt(sua(S)[1], 'p(p(0))') && p && !k) { S = add(S, 'p(0)'); } 
            return exp(S);
        }

        function ov(M, n, k) { 
            if (n == k) { return 'P(0)'; }
            if (M[n][2] == 0) { return o(M, n, k); }
            let S = '0';
            for (let i of C(M, n)) {
                if (i > k && k) { break; }
                S = add(S, ov(M, i, k));
            }
            return `P(${S})`;
        }

        function v(M, n, k) { 
            if (M[n][1] == 0) { return '0'; }
            if (M[n][2] == 0) {
                let u = U(M, n);
                u = (u[0] ? mv(M, u[1], n * (u[0] == 2)) : 'p(0)');
                return add(v(M, P_func(M, 1, n), k), u);
            }
            return add(v(M, P_func(M, 2, n), k), mv(M, n, k));
        }

        function o(M, n, k) { 
            let S = '0';
            for (let i of C(M, n)) {
                if (i > k && k) { break; }
                if (skipped(M, n).includes(i)) { continue; }
                S = add(S, o(M, i, k));
            }
            return `p(${add(mul('P(0)', v(M, n, k)), S)})`;
        }

        function skipped(M, n) {
            let S = [];
            let u = [...Array(M.length).keys()].map(x => (U(M, x)[0] == 1 ? U(M, x)[1] : null));
            for (let i of C(M, n)) {
                S = S.concat(skipped(M, i)); 
                if (M[i][2] && M[n][2]) { S.push(i); continue; }
                if (u.includes(i)) {
                    let c = C(M, i);
                    if (c.length) { 
                        let j = c.at(-1);
                        if (eq(M[j], [M[i][0] + 1, M[i][1], 1])) { S.push(i); }
                        else if (eq(U(M, j - 1), [2, i]) && eq(M[j], [M[i][0] + 1, 0, 0]) && !C(M, j).length) { S.push(i); }
                    }
                    else { S.push(i); continue; }
                }
                if (eq(M[i], [M[n][0] + 1, 0, 0]) && eq(U(M, i - 1), [2, n]) && !C(M, i).length) { S.push(i); continue; }
            }
            return S;
        }

        function psi_func(a) { return `p(${a})`; }
        function _0(a) { return sua(arg(a))[0]; }
        function _1(a) { return sua(arg(a))[1]; }
        function _01(a) { return firstTerm(a)[0]; }
        function _2(a) { return firstTerm(a)[1]; }

        function ttc(a, b) {
            if (a == '0') { return '0'; }
            if (ttc(_2(a), b) == '0' && lt(_01(a), psi_func(b))) { return '0'; }
            return add(_01(a), ttc(_2(a), b));
        }

        function sp(a, b, c) {
            if (c == '0') { return psi_func(add(a, b)); }
            if (lt(b, _1(c)) && gt(c, psi_func(a))) {
                let t = ttc(_1(c), add(_0(c), 'P(0)'));
                return sp(a, add(t, sub(_01(c), psi_func(add(_0(c), t)))), _2(c));
            }
            return sp(a, add(b, _01(c)), _2(c));
        }

        function sf(a) {
            if (a == '0') { return '0'; }
            if (a[0] == 'P') { return add(`P(${sf(arg(a))})`, sf(_2(a))); }
            return add(sp(sf(_0(a)), '0', sf(_1(a))), sf(_2(a)));
        }

        function _o(M) {
            let S = '0';
            for (let i = 0; i < M.length; i++) { if (eq(M[i], [0, 0, 0])) { S = add(S, o(M, i)); } }
            return sf(S);
        }

        function processMatrix(M) {
            return M.map(row => {
                let r = row.slice();
                while (r.length < 3) {
                    r.push(0);
                }
                return r;
            });
        }
        return display(_o(processMatrix(matrix)))
    }

    return { fs, cmp, isSuccessor, display, classifyOrdinal, parse, Zero, Limit, DisplayName, ordinalTypes, Aliases, config, title };
})();