/*
Notation : cOCF
Limit : P(0)
*/

const cOCF_count = (x) => (x.match(/\(/g) || []).length - (x.match(/\)/g) || []).length;

function cOCF_op(x) {
    if (cOCF_lt(x, 'p(p(0))')) { return false; }
    let f = (x[0] == 'p') ? `p(${cOCF_sua(cOCF_arg(x))[0]})` : 'P(0)';
    let g = null;
    let h = null;
    if (f == 'p(0)') { f = 'p(p(0))'; g = cOCF_log(x); h = cOCF_exp(g); }
    else { g = cOCF_div(cOCF_log(x), f); h = cOCF_exp(cOCF_mul(f, g)); }
    let c = cOCF_div(x, h);
    let d = cOCF_sub(x, cOCF_mul(h, cOCF_div(x, h)));
    if (d != '0') { return true; }
    return false;
}

function cOCF_display_internal(x) {
    if (x + '' == 'Infinity') { return 'c'; }
    if (x == '0') { return '0'; }
    if (/^(p\(0\)\+)*p\(0\)$/.test(x)) { return ((x.length + 1) / 5).toString(); }
    let f = (x[0] == 'p') ? `p(${cOCF_sua(cOCF_arg(x))[0]})` : 'P(0)';
    let g = null;
    let h = null;
    if (f == 'p(0)') { f = 'p(p(0))'; g = cOCF_log(x); h = cOCF_exp(g); }
    else { g = cOCF_div(cOCF_log(x), f); h = cOCF_exp(cOCF_mul(f, g)); }
    let c = cOCF_div(x, h);
    let d = cOCF_sub(x, cOCF_mul(h, cOCF_div(x, h)));
    if (c == 'p(0)' && d == '0') {
        if (cOCF_exp(x) != x) {
            if (x == 'p(p(0))') { return 'ω'; }
            if (cOCF_lt(x, 'p(P(0))')) { return `ω<sup>${cOCF_display_internal(cOCF_log(x))}</sup>`; }
            return `${cOCF_display_internal(f)}<sup>${cOCF_display_internal(g)}</sup>`;
        }
        if (x == 'P(0)') { return 'c'; }
        let m = cOCF_div(cOCF_log(cOCF_lastTerm(cOCF_arg(x))[1]), 'P(0)');
        let k = cOCF_exp(cOCF_mul('P(0)', cOCF_div(cOCF_log(cOCF_lastTerm(cOCF_arg(x))[1]), 'P(0)')));
        k = cOCF_div(cOCF_arg(x), k);
        k = cOCF_sua(k);
        let t = cOCF_exp(cOCF_add(cOCF_mul('P(0)', m), 'P(0)'));
        let l = null;
        if (k[0] == '0') { l = '0'; }
        else { l = 'p(' + cOCF_mul(cOCF_exp(cOCF_mul('P(0)', m)), k[0]) + ')'; }
        let r = 'p(' + cOCF_mul(cOCF_exp(cOCF_mul('P(0)', m)), cOCF_add(k[0], 'P(0)')) + ')';
        let [a, b] = cOCF_split(k[1], r);
        a = 'p(' + cOCF_mul(cOCF_exp(cOCF_mul('P(0)', m)), a) + ')';
        if (a == 'p(0)') { a = '0'; }
        l = cOCF_add(l, cOCF_add(a, b));
        let s = '';
        if (cOCF_lastTerm(cOCF_arg(x))[1][0] == 'P' && b != '0') {
            if (m == 'p(0)') { s = 'Ω'; }
            if (m == 'p(0)+p(0)') { s = 'L'; }
            if (m == 'p(0)+p(0)+p(0)') { s = 'R'; }
            if (m == 'P(0)') { s = 'J'; }
            if (s == '') { return `ψ(${cOCF_display_internal(cOCF_arg(x))})`; }
            if (l == 'p(0)') { return s; }
            return `${s}<sub>${cOCF_display_internal(l)}</sub>`;
        }
        return `ψ(${cOCF_display_internal(cOCF_arg(x))})`;
    }
    let a = cOCF_display_internal(h);
    if (c != 'p(0)') {
        if (!cOCF_op(c)) { a += cOCF_display_internal(c); }
        else { a += `&sdot;(${cOCF_display_internal(c)})`; }
    }
    if (d != '0') { a += '+' + cOCF_display_internal(d); }
    return a;
}

function cOCF_paren(x, n) {
    let q = x[n] == '(' ? 1 : -1;
    let i = n;
    let t = 0;
    while (1) { t += (x[i] == '(' ? 1 : x[i] == ')' ? -1 : 0); if (!t) { break; }; i += q; }
    return i;
}

function cOCF_firstTerm(x) {
    let m = cOCF_paren(x, 1);
    return [x.slice(0, m + 1), x.slice(m + 2) || '0'];
}

function cOCF_lastTerm(x) {
    let m = cOCF_paren(x, x.length - 1);
    return [x.slice(0, m - 2) || '0', x.slice(m - 1)];
}

function cOCF_terms(x) {
    if (x == '0') { return []; }
    return [cOCF_firstTerm(x)[0]].concat(cOCF_terms(cOCF_firstTerm(x)[1]));
}

function cOCF_trim(s) { while (s[s.length - 1] == ')') { s = s.slice(0, -1); } return s; }

function cOCF_arg(x) {
    return cOCF_firstTerm(x)[0].slice(2, -1);
}

function cOCF_lt(x, y) {
    if (y == '0') { return false; }
    if (x == '0') { return true; }
    if (x[0] == 'p' && y[0] == 'P') { return true; }
    if (x[0] == 'P' && y[0] == 'p') { return false; }
    if (cOCF_arg(x) != cOCF_arg(y)) { return cOCF_lt(cOCF_arg(x), cOCF_arg(y)); }
    return cOCF_lt(cOCF_firstTerm(x)[1], cOCF_firstTerm(y)[1]);
}

function cOCF_expW(x) {
    if (cOCF_lt(x, 'P(0)')) { return '0'; }
    x = cOCF_arg(x);
    let y = '';
    while (cOCF_lt('P(0)', cOCF_firstTerm(x)[0]) || (cOCF_firstTerm(x)[0] == 'P(0)')) {
        y += cOCF_firstTerm(x)[0] + '+';
        x = cOCF_firstTerm(x)[1];
    }
    if (cOCF_lt(y.slice(0, -1) || '0', 'P(p(0))')) { y = 'P(0)+' + y; }
    return y.slice(0, -1);
}

function cOCF_lv(x) { return cOCF_expW(cOCF_lastTerm(cOCF_arg(x)).at(-1)); }

function cOCF_fix(s) { while (cOCF_count(s)) { s += ')'; } return s; }

function cOCF_root1(x) {
    let i = cOCF_trim(x).length + 1;
    let c = undefined;
    while (1) {
        c = cOCF_paren(x, i);
        if (cOCF_lt(x.slice(c - 1, i + 1), 'P(0)')) { break; }
        i++;
        if (i == x.length) { return undefined; }
    }
    let v = cOCF_lv(x.slice(c - 1, i + 1));
    let p = c;
    let q = i;
    let m = c;
    let n = i;
    i++;
    if (i >= x.length) { return undefined; }
    while (1) {
        c = cOCF_paren(x, i);
        if (x[c - 1] == 'p') {
            let l = cOCF_lv(x.slice(c - 1, i + 1));
            if (cOCF_lv(x.slice(m - 1, n + 1)) == '0') { m = p; n = q; break; }
            if (cOCF_lt(l, v)) { break; }
            m = c;
            n = i;
        }
        i++;
        if (i == x.length) { return undefined; }
    }
    return [n, x.slice(m - 1, n + 1)];
}

function cOCF_root2(x) {
    if (cOCF_root1(x) === undefined) { return undefined; }
    let y = cOCF_root1(x)[1];
    let i = cOCF_root1(x)[0];
    let k = [i, y];
    let c = null;
    let z = null;
    while (1) {
        if (i == x.length) { return undefined; }
        c = cOCF_paren(x, i);
        if (cOCF_lt(x.slice(c - 1, i + 1), y)) { z = [i, x.slice(c - 1, i + 1)]; break; }
        i++;
    }
    let m = cOCF_paren(x, i);
    let s = cOCF_lv('p(' + x.slice(m + 1, i) + ')');
    s = s == '0' ? 'P(0)' : `P({cOCF_add(cOCF_sub(s,'P(0)'),'P(0)')})`;
    let [p, q] = cOCF_split(x.slice(m + 1, i), s);
    p = cOCF_findall(p);
    let u = '0';
    for (let item of p) {
        if (cOCF_lt(u, item)) { u = item; }
    }
    let j = cOCF_paren(x, i);
    i--;
    while (1) {
        m = cOCF_paren(x, i);
        if (x[m - 1] == 'p') {
            c = cOCF_paren(x, i + 1);
            z = [i, cOCF_split(x.slice(c + 1, i + 1), 'P(0)')[1]];
            break;
        }
        i--;
    }
    if ((!cOCF_lt(u, q)) && p) {
        let v = k[0] - k[1].length;
        let t = x.slice(j - 1, v + 1);
        t += 'P(0)'; v += 4;
        return [v, x.slice(j - 1, v + 1)];
    }
    return z;
}

function cOCF_fs(x, n) {
    if (x == '0') { return x; }
    let y = x;
    let m = cOCF_paren(x, x.length - 1);
    let d = x.slice(m - 1);
    if (d == 'p(0)') { return x.slice(0, m - 2); }
    x = cOCF_trim(x);
    let o = '';
    if (x.at(-3) == 'p') {
        x += '))';
        let k = cOCF_paren(x, x.length - 1);
        let z = x.slice(k - 1, -5) + ')';
        o = x.slice(0, k - 1) + ('+' + z).repeat(n + 1);
    }
    else {
        if (y == 'P(0)' || cOCF_lt('P(0)', y)) {
            let b = cOCF_trim(x).slice(0, -3);
            o = b + 'p(' + 'P('.repeat(n);
        }
        else {
            let r = cOCF_root2(y);
            if (r == undefined) {
                let b = cOCF_trim(x).slice(0, -3);
                o = b + 'p(' + 'P('.repeat(n);
            }
            else {
                let b = cOCF_trim(x.slice(r[0] - r[1].length + 1, r[0])).slice(0, -3);
                o = x.slice(0, r[0] - r[1].length + 1) + b.repeat(n);
            }
        }
    }
    o = cOCF_fix(o).replaceAll('+)', ')').replaceAll('(+', '(').replaceAll('++', '+').replaceAll('()', '(0)');
    if (o[0] == '+') { o = o.slice(1); }
    o = o || '0';
    return o;
}

function cOCF_add(x, y) {
    if (x == '0') { return y; }
    if (y == '0') { return x; }
    if (cOCF_lt(cOCF_firstTerm(x)[0], cOCF_firstTerm(y)[0])) { return y; }
    let z = cOCF_firstTerm(x)[0];
    let w = cOCF_add(cOCF_firstTerm(x)[1], y);
    if (w != '0') { return z + '+' + w; }
    return z;
}

function cOCF_sub(x, y) {
    if (x == '0') { return '0'; }
    if (y == '0') { return x; }
    if (cOCF_lt(cOCF_firstTerm(y)[0], cOCF_firstTerm(x)[0])) { return x; }
    return cOCF_sub(cOCF_firstTerm(x)[1], cOCF_firstTerm(y)[1]);
}

function cOCF_sua(x) { return cOCF_split(x, 'P(0)'); }

function cOCF_exp(a) {
    if (a[0] == 'P') { return `P(${cOCF_sub(a, 'P(0)')})`; }
    if (cOCF_lt(a, 'p(p(P(0)))')) { return `p(${a})`; }
    let [x, y] = cOCF_sua(cOCF_arg(a));
    let p = cOCF_split(y, `p(${cOCF_add(x, 'P(0)')})`)[0];
    return 'p(' + cOCF_add(x, cOCF_add(p, cOCF_sub(a, 'p(' + cOCF_add(x, p) + ')'))) + ')';
}

function cOCF_log(a) {
    if (a == '0') { return []; }
    if (a[0] == 'P') { return cOCF_add('P(0)', cOCF_arg(a)); }
    let [x, y] = cOCF_sua(cOCF_arg(a));
    let [p, q] = cOCF_split(y, `p(${cOCF_add(x, 'P(0)')})`);
    if (x == '0' && p == '0') {
        return q;
    }
    let m = cOCF_add(`p(${cOCF_add(x, p)})`, q);
    return m;
}

function cOCF_div(a, b) {
    if (cOCF_lt(a, b)) { return '0'; }
    return cOCF_add(cOCF_exp(cOCF_sub(cOCF_log(a), cOCF_log(b))), cOCF_div(cOCF_firstTerm(a)[1], b));
}

function cOCF_mul(a, b) {
    if (b == '0') { return '0'; }
    return cOCF_add(cOCF_exp(cOCF_add(cOCF_log(a), cOCF_log(b))), cOCF_mul(a, cOCF_firstTerm(b)[1]));
}

function cOCF_split(a, x) {
    if (a == '0') { return ['0', '0']; }
    if (cOCF_lt(cOCF_firstTerm(a)[0], x)) { return ['0', a]; }
    return [cOCF_add(cOCF_firstTerm(a)[0], cOCF_split(cOCF_firstTerm(a)[1], x)[0]), cOCF_split(cOCF_firstTerm(a)[1], x)[1]];
}

function cOCF_findall(a) {
    if (a == '0') { return []; }
    let [p, q] = cOCF_split(a, 'P(0)');
    return cOCF_terms(p).map(cOCF_arg).map(cOCF_findall).flat().filter(x => x != '0').concat([q].filter(x => x != '0'));
}

window.notation = (() => {
    function fs(ord, n) {
        if (ord === "Limit") {
            return cOCF_fs('P(0)', n);
        }
        return cOCF_fs(ord, n);
    }

    function cmp(a, b) {
        if (a === "Limit" && b === "Limit") return 0;
        if (a === "Limit" && b !== "Limit") return 1;
        if (a !== "Limit" && b === "Limit") return -1;
        
        if (cOCF_lt(a, b)) return -1;
        if (cOCF_lt(b, a)) return 1;
        return 0;
    }

    function isSuccessor(ord) {
        if (ord === "Limit" || ord === "0" || ord === "") return false;
        return ord.endsWith("p(0)");
    }

    function display(ord, mode) {
        if (ord === '0' || ord === '') return '0';
        if (ord === 'Limit') return 'c';
        if (mode === "normal") return ord;
        if (mode === "CNF included") {
            return cOCF_display_internal(ord);
        }

        return ord;
    }

    function classifyOrdinal(M) {
        if (M === "Limit" || M === "P(0)") return "#3f3f3f"; // Buchholz / Limit
        if (!M || M === "0") return "#808080";               // Zero

        if (isSuccessor(M)) {
            return "#d40000"; // Successor -> #d40000
        }

        // Warped inside p(p(P())) -> Epsilon Ordinal
        if (M.includes("P(")) {
            return "#00FF00"; // ε Ordinal -> #00FF00
        }

        // Check if pure tower of nested p(...) e.g. p(p(p(0)))
        const isTower = /^p\(+0\)+$/.test(M);
        if (isTower) {
            return "#ffffff"; // Tower of ω -> #ffffff
        }

        // Wrapped inside p(...) -> Power of ω
        if (M.startsWith("p(")) {
            return "#ffff00"; // Power of ω -> #ffff00
        }

        return "#ff8000"; // Limit Ordinal default fallback
    }

    function parse(str) {
        return str.trim();
    }

    const Zero = "0";
    const Limit = 'Limit';
    const DisplayName = ["normal", "CNF included"];
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
       ["Omega", "p(p(0))"],
        ["Small Cantor Ordinal", "p(p(P(0)))"],
        ["Bachmann-Howard Ordinal", "p(p(P(0)+P(0)))"],
["Lim(cOCF) / (0,0,0,0)(1,1,1,1)(2,2)", "Limit"]
    ];
    const config = { types: "default" };
    const title = 'cOCF transfinite number line';

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