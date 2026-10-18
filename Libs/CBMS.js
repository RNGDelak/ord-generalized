/*
Notation : TBMS (Transfinitary BMS)
Limit : the root (0)(1^((((...)))))
self-contained: core.js, bocf.js, veblen.js, pss.js, syntax.js and the TBMS code are copied in unchanged.
*/

window.notation = (() => {

  // core.js
// Core of Transfinitary BMS (TBMS), shared by the TBMS explorer and its variants: terms, ordinal
// arithmetic on run lengths, comparison, expansion, parsing and the pure (matrix) form. Display names
// are not here; the TBMS explorer adds them (TBMS/notation.js).
//
// A column is a list of runs [value, length]: value >= 1, length an ordinal >= 1, adjacent values
// distinct, trailing zeros omitted, so (2,1^{ω+1}) is [[2,1],[1,ω+1]] and has height 1+ω+1 = ω+1.
// A run length written as an ordinal is in braces unless it is a single symbol: 1^ω, 1^{ω+1}; one
// written as a matrix is not: 1^(1)(2). On display a named entry with a transfinite run is in
// braces too: ({ω}^ω), unlike ((ω)^ω), whose entry is the matrix (ω), and 1^{ω^ω}. The parser also
// reads 1^ω+1 without braces.
// An ordinal is a natural number (a JS number) or an infinite TBMS matrix (an array of columns);
// run lengths are therefore TBMS terms themselves, smaller than the term they occur in.
//
// Rows are indexed by ordinals. The row-0 parent of a column is the last earlier column with a
// smaller row-0 entry; for α > 0 the row-α parent is the nearest column with a smaller row-α entry
// among the columns that are its ancestors in every row β < α. Cut the rows at every boundary of
// every run: inside one piece all entries are constant, and so is the parent relation (a row and the
// next one with the same entries choose the same parents). The expansion is therefore BMS on the
// finitely many pieces, each piece carrying its ordinal length:
// - last column (0): remove it;
// - last column of limit height (its last run has limit length λ): replace λ by λ[n];
// - last column of successor height δ+1: BMS expansion at row δ (bad root = row-δ parent,
//   ascension by the difference to the bad root in rows below δ, for entries whose ancestor in
//   that row is the bad root).
// Below (0)(1^ω) every column is finite and this is BMS.
//
// Nonrecursive TBMS: run lengths may be nonrecursive terms, whose first column is (1), (2), ...
// The level of a term is its row-0 entry in the first column (0 for recursive terms). For
// example (1) = Ω = ω₁^CK, (1)(1) = Ω·2, (1,1) = Ω², (1,1)(2,1)(3,1) = Ω^Ω, (1,1,1) = Ω₂.
// A term starts at every column without a row-0 parent.
// Diagonalizers: if the last nonzero entry (row δ) of a term's last column has no parent, and has
// value L, the term's FS α[ζ] is indexed by terms ζ of level L-1. One BMS copy of ζ replaces the
// last column: ζ's first column becomes that column without row δ, and entries attached to it
// rise by the difference below δ. So Ω[ξ] = ξ, (Ω·2)[ξ] = Ω+ξ, Ω²[(0)(1^X)] = (1)(2,1^X), and
// (2)[ζ] = ζ. A term of level below L whose last run has such a length λ collapses, as ψ_μ(α)
// with cof α = Ω_L in Buchholz's ψ: T[0] = T{λ := λ[s]} (s = 0, or the column (L-1)), and
// T[n+1] = T{λ := λ[ζ_n]} where ζ_n is T[n] from the last column's nearest row-0 ancestor of
// level <= L-1, raised to level L-1 (bocf.js climbs and shifts the same way; (2^X) is the level-2
// analogue of (1^X)). (0)(1^(1,1)) gives (0)(1^(1)(2,1^(1)(2,1^...))), (0)(1^(2)) gives
// (0)(1^(1^(1^...))), (0)(1^(2,2)) gives (0)(1^(2,1^(2,1^...))), (0)(1^(3)) gives
// (0)(1^(2^(2^...))); (0)(1^(2^(3))) has the same sequence and is not standard.
//
// Entries may be ordinals, written as matrices: ((0)(1)) is the column with entry ω, ((1)) the
// column with entry Ω. Ascension and re-levelling use ordinal arithmetic as bocf.js does,
// x -> root + d·c + (-root + x). An entry whose value L is a limit expands through L, as
// Ω_ω[n] = Ω_n and Ω_Ω[ξ] = Ω_ξ: (ω)[n] = (n), ((1))[ξ] = (ξ). The root runs (0)(1^(1)),
// (0)(1^((1))), (0)(1^(((1)))), ... towards (0)(1^((((...))))).
//
// Variants: option onCopies(out, copies, step) is called after a BMS step has written its copies, and
// may rewrite them in place. out is the new term; copies lists {c, j, at}: out[at] is copy c of
// column j; step is {r, P, kd, val, par, asc, d}: the bad root, the row pieces P, the piece kd of row
// δ, piece values and parents, which entries ascend, and the differences d to the bad root.
//
// Display names: show(m, {names}) asks names.whole(a, opts) for a whole run length or entry and
// names.term(t, opts) for each additive term; unnamed run lengths below ε₀ are written in Cantor
// normal form, others as matrices. {matrices: true} writes every length as a matrix.

function makeTBMS({onCopies} = {}) {
	const isNum = x => typeof x === "number";

	// ---------- ordinals ----------
	const norm = m => m.every(c => c.length == 0) ? m.length : m;
	const toMat = a => isNum(a) ? Array.from({length: a}, () => []) : a;

	function cmpOrd(a, b) {
		if (isNum(a) && isNum(b)) return Math.sign(a - b);
		if (isNum(a)) return -1;
		if (isNum(b)) return 1;
		return cmpMat(a, b);
	}

	// entries are ordinals too
	const lt = (a, b) => cmpOrd(a, b) < 0;
	const isZero = v => isNum(v) && v == 0;
	const times = (a, k) => { let r = 0; for (let j = 0; j < k; j++) r = addOrd(r, a); return r; };

	// additive terms: a new term starts at each column without a row-0 parent
	const row0 = c => c.length ? c[0][0] : 0;
	function terms(m) {
		const ts = [];
		let low = null;
		for (const c of m) {
			if (low === null || cmpOrd(row0(c), low) <= 0) { ts.push([c]); low = row0(c); }
			else ts.at(-1).push(c);
		}
		return ts;
	}

	function addOrd(a, b) {
		if (isNum(b)) return isNum(a) ? a + b : b == 0 ? a : a.concat(toMat(b));
		if (isNum(a)) return b;
		const ta = terms(a), tb = terms(b);
		while (ta.length && cmpMat(ta.at(-1), tb[0]) < 0) ta.pop();
		return ta.flat().concat(b);
	}

	// the c with a + c = b, for a <= b
	function subOrd(a, b) {
		if (isNum(b)) return b - a;
		if (isNum(a)) return b;
		const ta = terms(a), tb = terms(b);
		let i = 0;
		while (i < ta.length && i < tb.length && cmpMat(ta[i], tb[i]) == 0) i++;
		return norm(tb.slice(i).flat());
	}

	// level of a term: row 0 of its first column (0 recursive, 1 for (1)..., Ω for ((1))...)
	const level = a => isNum(a) ? 0 : row0(a[0]);
	// cofinality: "0", "s" (successor), "w" (FS indexed by n), or {L} for a successor level L >= 1:
	// FS α[ζ] indexed by terms ζ of level L-1 (L = 1: recursive ζ, as for Ω = (1); L = 2: (1...))
	// terms are never mutated after construction, so results are cached on the arrays
	const cofCache = new WeakMap(), cmpCache = new WeakMap();
	const isLevel = k => typeof k == "object";
	function cof(a) {
		if (isNum(a)) return a == 0 ? "0" : "s";
		if (!cofCache.has(a)) cofCache.set(a, cofRaw(a));
		return cofCache.get(a);
	}
	function cofRaw(a) {
		if (a.at(-1).length == 0) return "s";
		const sl = slot(a);
		if (sl.kind == "bms") return "w";
		if (sl.kind == "base") return {L: sl.x};
		if (sl.k == "w") return "w";
		return cmpOrd(sl.k.L, level(a)) <= 0 ? sl.k : "w";
	}
	// where a limit term's FS acts: the last run's length if that is a limit ("length"), else the
	// last entry: with a parent, BMS expansion ("bms"); parentless with a limit value ("entry");
	// parentless with a successor value L, a diagonalizer of level L ("base")
	function slot(a) {
		const C = a.at(-1), l = C.at(-1)[1];
		const kl = cof(l);
		if (kl == "w" || isLevel(kl)) return {kind: "length", x: l, k: kl};
		const {root, kd, val, L} = analyse(a);
		if (root >= 0) return {kind: "bms"};
		const x = val[L][kd], kx = cof(x);
		return kx == "s" ? {kind: "base", x} : {kind: "entry", x, k: kx};
	}
	function setSlot(a, sl, y) {
		const C = a.at(-1), [v, l] = C.at(-1);
		const runs = sl.kind == "length" ? [...C.slice(0, -1), [v, y]] : [...C.slice(0, -1), [v, predOrd(l)], [y, 1]];
		return a.slice(0, -1).concat([normCol(runs)]);
	}
	const predOrd = a => isNum(a) ? a - 1 : norm(a.slice(0, -1));

	// ---------- columns and matrices ----------
	function cmpCol(c, d) {
		let i = 0, j = 0, lc = c[0]?.[1], ld = d[0]?.[1];
		while (i < c.length && j < d.length) {
			const kv = cmpOrd(c[i][0], d[j][0]);
			if (kv) return kv;
			const k = cmpOrd(lc, ld);
			if (k <= 0) {
				if (k < 0) ld = subOrd(lc, ld); else ld = d[++j]?.[1];
				lc = c[++i]?.[1];
			} else {
				lc = subOrd(ld, lc);
				ld = d[++j]?.[1];
			}
		}
		return i < c.length ? 1 : j < d.length ? -1 : 0;
	}

	function cmpMat(a, b) {
		if (a === b) return 0;
		let m = cmpCache.get(a);
		if (!m) cmpCache.set(a, m = new WeakMap());
		if (!m.has(b)) m.set(b, cmpMatRaw(a, b));
		return m.get(b);
	}
	function cmpMatRaw(a, b) {
		for (let i = 0; i < a.length && i < b.length; i++) {
			const k = cmpCol(a[i], b[i]);
			if (k) return k;
		}
		return Math.sign(a.length - b.length);
	}

	// merge equal neighbours, drop empty runs and trailing zeros
	function normCol(runs) {
		const out = [];
		for (const [v, l] of runs) {
			if (cmpOrd(l, 0) == 0) continue;
			if (out.length && cmpOrd(out.at(-1)[0], v) == 0) out.at(-1)[1] = addOrd(out.at(-1)[1], l);
			else out.push([v, l]);
		}
		while (out.length && isZero(out.at(-1)[0])) out.pop();
		return out;
	}

	const colHeight = c => c.reduce((h, [, l]) => addOrd(h, l), 0);

	// ---------- expansion ----------
	function expand(m, n) {
		const C = m.at(-1);
		if (!C) return [];
		if (C.length == 0) return m.slice(0, -1);
		const sl = slot(m);
		if (sl.kind == "bms") return bmsStep(m, n);
		if (sl.kind == "base" || isLevel(sl.k) && cmpOrd(sl.k.L, level(m)) <= 0)
			throw new Error("FS indexed by ordinals, not n: " + show(m));
		if (sl.k == "w") return setSlot(m, sl, norm(expand(sl.x, n)));
		// collapse, as ψ_μ(α) with cof α = Ω_L in Buchholz's ψ: ζ ranges over level L-1 and the
		// next ζ is the term from the last column's nearest row-0 ancestor of level <= L-1
		// (the whole term for L = 1, (1^...) in (0)(1^(2))), raised to level L-1
		const L = sl.k.L, L1 = predOrd(L), j = levelAncestor(m, L1);
		let t = setSlot(m, sl, fsAt(sl.x, cmpOrd(L, 1) == 0 ? 0 : [[[L1, 1]]]));
		for (let i = 0; i < n; i++) t = setSlot(m, sl, fsAt(sl.x, relevel(t.slice(j), L1)));
		return t;
	}

	// raise a nested copy to level v, as bocf.js shifts the bad part: (1^X) at level 2 is (2^X)
	function relevel(y, v) {
		const r0 = row0(y[0]);
		if (cmpOrd(r0, v) == 0) return norm(y);
		const sh = subOrd(r0, v);
		const up = a => isZero(a) ? a : lt(a, r0) ? addOrd(a, sh) : addOrd(v, subOrd(r0, a));
		return norm(y.map(c => normCol(c.map(([a, l]) => [up(a), l]))));
	}

	// the last column or its nearest row-0 ancestor with row-0 entry <= v
	function levelAncestor(m, v) {
		let j = m.length - 1;
		while (j > 0 && lt(v, row0(m[j]))) {
			let i = j - 1;
			while (i > 0 && !lt(row0(m[i]), row0(m[j]))) i--;
			j = i;
		}
		return j;
	}

	// α[ζ] for α of cofinality level L and ζ of level L-1. At a diagonalizer entry (parentless,
	// successor value L): one BMS copy of ζ replaces the last column; ζ's first column (the bad
	// root) becomes that column without its last row, and the entries attached to it rise by the
	// same difference in the rows below. Otherwise the FS acts on the slot.
	function fsAt(m, zeta) {
		const sl = slot(m);
		if (sl.kind == "length" || sl.kind == "entry") return norm(setSlot(m, sl, fsAt(sl.x, zeta)));
		const C = m.at(-1), l = C.at(-1)[1];
		const L = m.length - 1, delta = predOrd(colHeight(C));
		const below = normCol([...C.slice(0, -1), [C.at(-1)[0], predOrd(l)]]); // C without row δ
		const X = toMat(zeta);
		if (X.length == 0) return norm(cmpOrd(delta, 0) == 0 ? m.slice(0, L) : m.slice(0, L).concat([below]));
		const {P, len} = pieces([C, ...X], [delta]);
		const kd = P.findIndex(p => cmpOrd(p, delta) == 0);
		const lift = colValues(below, P);
		const val = X.map(c => colValues(c, P));
		const par = parents(val);
		const out = X.map((col, j) => normCol(val[j].map((v, k) => {
			let i = j;
			while (i > 0) i = par[k][i];
			const rises = k < kd && i == 0 && (j == 0 || par[k][j] >= 0);
			return [rises ? addOrd(lift[k], subOrd(val[0][k], v)) : v, len[k]];
		})));
		return norm(m.slice(0, L).concat(out));
	}

	// pieces of the rows: P[k] <= row < P[k+1], with the length of each piece
	function pieces(m, extra) {
		const pts = [0, ...extra];
		for (const c of m) {
			let p = 0;
			for (const [, l] of c) pts.push(p = addOrd(p, l));
		}
		pts.sort(cmpOrd);
		const P = pts.filter((p, i) => i == 0 || cmpOrd(pts[i - 1], p) != 0);
		const len = P.slice(0, -1).map((p, k) => subOrd(p, P[k + 1]));
		return {P, len};
	}

	function colValues(c, P) {
		const vals = [];
		let r = 0, end = c[0]?.[1];
		for (let k = 0; k < P.length - 1; k++) {
			while (r < c.length && cmpOrd(P[k], end) >= 0) end = addOrd(end, c[++r]?.[1] ?? 0);
			vals.push(r < c.length ? c[r][0] : 0);
		}
		return vals;
	}

	// row-piece parents: par[k][j], -1 if none
	function parents(val) {
		const N = val.length, R = val[0]?.length ?? 0, par = [];
		for (let k = 0; k < R; k++) {
			par[k] = [];
			for (let j = 0; j < N; j++) {
				let p = -1;
				if (!isZero(val[j][k])) {
					if (k == 0) {
						for (let i = j - 1; i >= 0; i--) if (lt(val[i][0], val[j][0])) { p = i; break; }
					} else {
						for (let i = par[k - 1][j]; i >= 0; i = par[k - 1][i]) if (lt(val[i][k], val[j][k])) { p = i; break; }
					}
				}
				par[k][j] = p;
			}
		}
		return par;
	}

	function analyse(m) {
		const L = m.length - 1, C = m[L];
		const delta = predOrd(colHeight(C)); // the last nonzero row
		const {P, len} = pieces(m, [delta]);
		const kd = P.findIndex(p => cmpOrd(p, delta) == 0);
		const val = m.map(c => colValues(c, P));
		const par = parents(val);
		return {L, P, len, kd, val, par, root: par[kd][L]};
	}

	function bmsStep(m, n) {
		const {L, P, len, kd, val, par, root: r} = analyse(m);
		if (r < 0) throw new Error("no bad root: " + show(m));
		if (n == 0) return m.slice(0, r);
		const d = val[L].map((v, k) => k < kd ? subOrd(val[r][k], v) : 0);
		const asc = [];
		for (let j = r; j < L; j++) asc[j] = d.map((_, k) => {
			if (j == r) return true;
			let i = par[k][j];
			while (i > r) i = par[k][i];
			return i == r;
		});
		const out = m.slice(0, L), copies = [];
		for (let c = 1; c < n; c++)
			for (let j = r; j < L; j++) {
				out.push(normCol(val[j].map((v, k) => [asc[j][k] && !isZero(d[k])
					? addOrd(addOrd(val[r][k], times(d[k], c)), subOrd(val[r][k], v)) : v, len[k]])));
				copies.push({c, j, at: out.length - 1});
			}
		if (onCopies) onCopies(out, copies, {r, P, kd, val, par, asc, d});
		return out;
	}

	const isSuccessor = m => m.length == 0 || m.at(-1).length == 0;

	// ---------- printing ----------
	// The pure form writes run lengths below ε₀ in Cantor normal form (1^{ω+1}) and everything else as
	// matrices; opts.names adds display names (see the header), opts.matrices writes only matrices.
	const rowZeroOnly = m => m.every(c => c.length == 0 || (c.length == 1 && c[0][1] === 1 && isNum(c[0][0])));
	// the name of one additive term, or null
	function termName(t, opts) {
		const n = opts.names?.term(t, opts);
		if (n != null) return n;
		// the pure form: Cantor normal form below ε₀
		if (row0(t[0]) != 0 || !rowZeroOnly(t)) return null;
		const e = norm(t.slice(1).map(c => c[0][0] == 1 ? [] : [[c[0][0] - 1, 1]]));
		if (isNum(e) && e <= 1) return e == 0 ? "1" : "ω";
		const en = ordName(e, opts);
		return en.startsWith("(") ? null : "ω^" + paren(en);
	}

	// names for an ordinal, term by term; an unnamed additive term is written as its matrix.
	// {s, matrix}: matrix if nothing was named (then s is exactly the matrix)
	function ordInfo(a, opts = {}) {
		if (isNum(a)) return {s: String(a), matrix: false};
		if (opts.matrices) return {s: show(a, opts), matrix: true};
		const wn = opts.names?.whole(a, opts);
		if (wn != null) return {s: wn, matrix: false};
		const parts = [];
		let named = false;
		for (const t of terms(a)) {
			let s = termName(t, opts);
			if (s == null) s = show(t, opts); else named = true;
			if (parts.length && parts.at(-1).s == s) parts.at(-1).k++;
			else parts.push({s, k: 1});
		}
		if (!named) return {s: parts.map(({s, k}) => s.repeat(k)).join(""), matrix: true};
		return {s: parts.map(({s, k}) => k == 1 ? s : s == "1" ? String(k) : s == "ω" ? "ω" + k : s + "·" + k)
			.reduce((acc, p) => {
				if (/^\d+$/.test(p) && /^\d+$/.test(acc.at(-1) ?? "")) acc[acc.length - 1] = String(+acc.at(-1) + +p);
				else acc.push(p);
				return acc;
			}, []).join("+"), matrix: false};
	}
	const ordName = (a, opts) => ordInfo(a, opts).s;
	const paren = s => /[+·]|^ω\d|^\(/.test(s) ? "(" + s + ")" : s;

	function showCol(c, opts = {}) {
		if (c.length == 0) return "(0)";
		const parts = [];
		for (const [v, l] of c) {
			// entries are matrices (parsable); on display a named entry is written in braces when it has a
			// transfinite run, {ω}^ω, or its name would read as runs or several entries ({ω^2}, {φ(1,0)})
			const info = isNum(v) || !opts.names ? null : ordInfo(v, opts);
			const vs = isNum(v) ? String(v) : !info || info.matrix ? (info ? info.s : show(v, opts))
				: !isNum(l) || /[,^]/.test(info.s) ? "{" + info.s + "}" : info.s;
			if (isNum(l)) for (let i = 0; i < l; i++) parts.push(vs);
			else {
				const li = ordInfo(l, opts);
				parts.push(vs + "^" + (li.matrix ? li.s : brace(li.s)));
			}
		}
		return "(" + parts.join(",") + ")";
	}
	// a run length written as an ordinal is in braces unless it is a single symbol: 1^ω, 1^{ω+1},
	// 1^{Ω·ω}; a matrix delimits itself: 1^(1)(2)
	const brace = s => /^(\d+|[ωΩ]|ε[₀-₉]+)$/.test(s) ? s : "{" + s + "}";
	const show = (m, opts) => m.map(c => showCol(c, opts)).join("");

	// ---------- parsing ----------
	function parse(s) {
		let i = 0;
		const ws = () => { while (/\s/.test(s[i] ?? "")) i++; };
		const err = msg => { throw new Error(`${msg} at ${i} in ${s}`); };
		const expect = ch => { ws(); if (s[i] != ch) err(`expected ${ch}`); i++; };
		const int = () => {
			ws();
			const m = /^\d+/.exec(s.slice(i));
			if (!m) err("expected a number");
			i += m[0].length;
			return +m[0];
		};
		function matrix() {
			const cols = [];
			ws();
			while (s[i] == "(") { cols.push(column()); ws(); }
			return cols;
		}
		function column() {
			expect("(");
			const runs = [];
			for (;;) {
				ws();
				let v;
				if (s[i] == "{") { i++; ws(); v = s[i] == "(" ? norm(matrix()) : sum(); expect("}"); }
				else v = s[i] == "(" ? norm(matrix()) : int();
				ws();
				let l = 1;
				if (s[i] == "^") {
					i++; ws();
					const braced = s[i] == "{";
					if (braced) { i++; ws(); }
					l = s[i] == "(" ? norm(matrix()) : sum();
					if (braced) expect("}");
				}
				runs.push([v, l]);
				ws();
				if (s[i] == ",") { i++; continue; }
				expect(")");
				return normCol(runs);
			}
		}
		// Cantor normal form names below ε₀ and ε₀ itself: 3, ω, ω+1, ω2, ω·2, ω^2·3, ω^(ω+1), ε₀
		function sum() {
			let a = term();
			for (ws(); s[i] == "+"; ws()) { i++; a = addOrd(a, term()); }
			return a;
		}
		function coef() {
			ws();
			if (/[·⋅*]/.test(s[i] ?? "")) { i++; return int(); }
			return /\d/.test(s[i] ?? "") ? int() : 1;
		}
		function term() {
			ws();
			if (/\d/.test(s[i])) return int();
			if (s.startsWith("ε₀", i) || s.startsWith("ε_0", i)) {
				i += s.startsWith("ε₀", i) ? 2 : 3;
				return times(EPS0, coef());
			}
			return times(omegaPow(), coef());
		}
		function omegaPow() {
			ws();
			if (s[i] != "ω" && s[i] != "w") err("expected ω");
			i++;
			ws();
			if (s[i] != "^") return OMEGA;
			i++;
			return omegaTo(atom());
		}
		function atom() {
			ws();
			if (/\d/.test(s[i])) return int();
			if (s[i] == "(") { i++; const a = sum(); expect(")"); return a; }
			return omegaPow();
		}
		const m = matrix();
		ws();
		if (i < s.length) err("unexpected character");
		return m;
	}

	// ω^a for a below ε₀ (a row-0 matrix)
	function omegaTo(a) {
		const m = toMat(a);
		if (!m.every(c => c.length == 0 || (c.length == 1 && c[0][1] === 1))) throw new Error("ω^a needs a < ε₀");
		return norm([[], ...m.map(c => [[(c[0]?.[0] ?? 0) + 1, 1]])]);
	}
	const OMEGA = [[], [[1, 1]]];
	const EPS0 = [[], [[1, 2]]];

	// the explorer's root: (0)(1^(1)), (0)(1^((1))), (0)(1^(((1)))), ... -> (0)(1^((((...)))))
	function limitTerm(n) {
		let e = 1;
		for (let i = 0; i <= n; i++) e = [[[e, 1]]];
		return [[], [[1, e]]];
	}

	return {isNum, isZero, norm, toMat, row0, lt, cmpOrd, addOrd, subOrd, predOrd, times, terms, level, cof, slot,
		cmpCol, cmpMat, normCol, colHeight, pieces, colValues, parents, analyse, expand, bmsStep, fsAt, relevel,
		levelAncestor, isSuccessor, ordInfo, ordName, showCol, show, brace, parse, limitTerm};
}

  // ordinals/*.js
// Extended Buchholz ψ (EBOCF) terms: the shared ordinal representation.
//
// A term is a list of summands [u, b] = ψ_u(b) in non-increasing order, so 0 = [], 1 = ψ₀(0),
// n = n copies of 1, ω = ψ₀(1), Ω_u = ψ_u(0). Terms compare by their bracket strings, which is
// the ordinal order on standard terms.

const BOCF = (() => {

const ONE = [[[], []]];
const nat = n => Array(n).fill(ONE[0]);
const isOne = ([u, b]) => !u.length && !b.length;
const isNat = t => t.every(isOne);
const countable = t => t.every(([u]) => !u.length);

function lex(x, y, cmpElem) {
	for (let i = 0; i < x.length; i++) {
		if (i >= y.length) return 1;
		const c = cmpElem(x[i], y[i]);
		if (c) return c;
	}
	return x.length < y.length ? -1 : 0;
}

// summands compare by subscript, then argument
const cmpSummand = ([u1, b1], [u2, b2]) => cmp(u1, u2) || cmp(b1, b2);
const cmp = (x, y) => lex(x, y, cmpSummand);

function add(x, y) {
	if (!y.length) return x;
	let i = x.length;
	while (i && cmpSummand(x[i - 1], y[0]) < 0) i--;
	return [...x.slice(0, i), ...y];
}

// the z with y + z = x, for y ≤ x
function sub(x, y) {
	let i = 0;
	while (i < y.length && i < x.length && !cmpSummand(x[i], y[i])) i++;
	return x.slice(i);
}

// ψ_w(b) = ω^(ψ_w(U) + rest), where U is the part of b above Ω_(w+1) and b = U + rest;
// for w = 0 and no U this is ω^b
function log([w, b]) {
	const U = b.filter(([u]) => cmp(u, w) > 0);
	return add(U.length || w.length ? [[w, U]] : [], b.slice(U.length));
}

// ω^c, the inverse of log
function omega(c) {
	if (!c.length) return ONE;
	const [w, b] = c[0];
	const U = b.filter(([u]) => cmp(u, w) > 0);
	return [[w, [...U, ...(U.length || w.length ? sub(c, [[w, U]]) : c)]]];
}

// Cantor normal form in base Ω_v, for terms below ε_(Ω_v+1)

const below = (x, v) => x.every(([u, b]) => cmp(u, v) < 0 || (!cmp(u, v) && below(b, v)));

// Ω_v·x: Ω_v·ω^β = ψ_v(β) for a summand below ε_(Ω_v+1); a summand at or above it is already a
// multiple of Ω_v (Ω·ε_(Ω+1) = ε_(Ω+1)) and stays
const mulOmega = (x, v) => x.map(s => cmp(s[0], v) > 0 || !cmp(s[0], v) && !below(s[1], v) ? s : [v, log(s)]);

// the digits [F, k] of t = Σ Ω_v^F·k with k < Ω_v, or null if t is not below ε_(Ω_v+1)
function digits(t, v) {
	if (!below(t, v)) return null;
	const out = [];
	for (const s of t) {
		let F = [], k = [s];
		if (!cmp(s[0], v)) { // s = ω^g with g = Ω_v·F + r
			const g = add([[v, []]], s[1]);
			F = g.filter(([u]) => !cmp(u, v)).flatMap(([, z]) => omega(z));
			k = omega(g.filter(([u]) => cmp(u, v) < 0));
		}
		if (out.length && !cmp(out.at(-1)[0], F)) out.at(-1)[1] = add(out.at(-1)[1], k);
		else out.push([F, k]);
	}
	return out;
}

// Σ Ω_v^F·k, with Ω_v^F·ω^c = ω^(Ω_v·F + c)
const undigits = (d, v) => d.flatMap(([F, k]) => k.flatMap(s => omega(add(mulOmega(F, v), log(s)))));

// printing: opts.cnf writes terms in base Ω_v for their largest Ω_v, opts.countable, if given,
// prints countable terms, and opts.psi, if given, can print a ψ term another way

const subscriptDigits = n => [...String(n)].map(d => "₀₁₂₃₄₅₆₇₈₉"[d]).join("");

// parenthesize a sum or product
function wrap(s, chars = "+·") {
	let depth = 0;
	for (const ch of s) {
		if ("({".includes(ch)) depth++;
		else if (")}".includes(ch)) depth--;
		else if (!depth && chars.includes(ch)) return `(${s})`;
	}
	return s;
}

function subscript(u, opts) {
	if (isNat(u)) return subscriptDigits(u.length);
	const s = show(u, opts);
	return wrap(s, "+·^") == s ? "_" + s : "_{" + s + "}";
}

function principal([u, b], opts) {
	if (!u.length && !cmp(b, ONE)) return "ω";
	if (!b.length) return !cmp(u, ONE) ? "Ω" : "Ω" + subscript(u, opts);
	return opts.psi?.([u, b]) || "ψ" + (u.length ? subscript(u, opts) : "") + `(${show(b, opts)})`;
}

// runs of equal summands: [[s, count], ...]
function runs(t) {
	const out = [];
	for (const s of t) {
		if (out.length && !cmpSummand(out.at(-1)[0], s)) out.at(-1)[1]++;
		else out.push([s, 1]);
	}
	return out;
}

function show(t, opts = {}) {
	if (opts.countable && t.length && countable(t)) return opts.countable(t);
	const v = t[0]?.[0];
	const d = opts.cnf && v?.length && digits(t, v);
	if (d) {
		const base = principal([v, []], opts);
		return d.map(([F, k]) => {
			if (!F.length) return show(k, opts);
			const power = cmp(F, ONE) ? base + "^" + wrap(show(F, opts)) : base;
			return cmp(k, ONE) ? power + "·" + wrap(show(k, opts)) : power;
		}).join("+");
	}
	return runs(t).map(([s, k]) => isOne(s) ? String(k) : principal(s, opts) + (k > 1 ? "·" + k : "")).join("+") || "0";
}

// ---------------------------------------------------------------- fundamental sequences
// Terms as sequences (collapsing HPrSS): ψ_u(b) is the entry base+u followed by b's entries above it.
// Expanding the sequence gives Buchholz's fundamental sequences, extended: expand(t, n) = t[n].

const toSeq = (t, base = []) => t.flatMap(([u, b]) => {
	const e = add(base, u);
	return [e, ...toSeq(b, add(e, ONE))];
});

// sequence -> term: the children of an entry are the following run of larger entries
function fromSeq(s, lo = 0, hi = s.length, base = null) {
	const out = [];
	for (let i = lo, j; i < hi; i = j) {
		for (j = i + 1; j < hi && cmp(s[i], s[j]) < 0; j++);
		out.push([base ? sub(s[i], add(base, ONE)) : s[i], fromSeq(s, i + 1, j, s[i])]);
	}
	return out;
}

const parent = (s, i) => s.findLastIndex((x, j) => j < i && cmp(x, s[i]) < 0);

function index(s, j) {
	const p = parent(s, j);
	return p < 0 ? s[j] : sub(s[j], add(s[p], ONE));
}

// The expansion s[n], or {mu, K} when the last entry has cofinality Ω_(mu+1): it is resolved
// by an ancestor with index ≤ mu, and K builds the sequence around a nested copy.
function expandSeq(s, n) {
	const body = s.slice(0, -1), p = parent(s, s.length - 1);
	const base = p < 0 ? [] : add(s[p], ONE);
	const lam = sub(s.at(-1), base);
	const climb = (j, mu) => {
		while (j >= 0 && cmp(mu, index(s, j)) < 0) j = parent(s, j);
		return j;
	};
	if (!lam.length) return p < 0 ? body : body.concat(...Array(n).fill(s.slice(p, -1)));
	if (isOne(lam.at(-1))) {
		const mu = lam.slice(0, -1), cp = add(base, mu);
		const r = p < 0 ? -1 : climb(p, mu);
		if (r < 0) return {mu, K: L => L ? [...body, cp, ...L.map(x => add(add(cp, ONE), x))] : body};
		const inc = sub(cp, s[r]), bad = s.slice(r, -1);
		let out = body, shift = s[r];
		for (let k = 1; k <= n; k++) {
			shift = add(shift, inc);
			out = out.concat(bad.map(x => add(shift, sub(x, s[r]))));
		}
		return out;
	}
	// a limit index: expand it as a sequence of its own
	const res = expandSeq(toSeq(lam), n);
	if (Array.isArray(res)) return [...body, add(base, fromSeq(res))];
	const K = L => [...body, add(base, fromSeq(res.K(L)))];
	const r = p < 0 ? -1 : climb(p, res.mu);
	if (r < 0) return {mu: res.mu, K};
	const rb = add(s[r], ONE);
	let L = null;
	for (let k = 0; k < n; k++) L = K(L).slice(r + 1).map(x => sub(x, rb));
	return K(L);
}

// t[n] for a countable term t
function expand(t, n) {
	const res = expandSeq(toSeq(t), n);
	return Array.isArray(res) ? fromSeq(res) : t.slice(0, -1);
}

// "0,(0,1),2": a sequence with ordinal entries, where inner(seq) is the value of a nested sequence
function parseNested(str, inner) {
	let i = 0;
	const seq = () => {
		const out = [];
		while (true) {
			if (str[i] == "(") {
				i++;
				out.push(inner(seq()));
				i++;
			} else {
				const j = i;
				while (/\d/.test(str[i])) i++;
				out.push(nat(+str.slice(j, i)));
			}
			if (str[i] != ",") return out;
			i++;
		}
	};
	return str ? seq() : [];
}

return {ONE, nat, isOne, isNat, countable, lex, cmpSummand, cmp, add, sub, log, omega, mulOmega, below, digits, undigits,
	subscriptDigits, wrap, principal, runs, show, parseNested, toSeq, fromSeq, expandSeq, expand};

})();

// Veblen functions on EBOCF terms (ordinals/bocf.js), below ψ(Ω₂) = BHO for countable values.
//
// Dimensional Veblen: an array of entries α@X, where the position X is itself an array, read as
// the ordinal Σ Ω^Y·β over its entries β@Y. For countable coefficients,
//   φ(..., α@X, ..., γ@0) = Φ_E(γ),  E = Σ Ω^(-1+X)·α over the entries with X > 0,
// with Φ_E(γ) = ψ(Ω^E·(1+γ)) when nothing in the array is too large.

const Veblen = (() => {

const {ONE, isNat, cmp, add, sub, log, omega, digits, undigits, subscriptDigits, wrap, principal, runs} = BOCF;

const succ = v => add(v, ONE);
const level = t => t[0]?.[0] ?? [];

// positions are read in base Ω; at level ν they are written in base Ω_(ν+1)
const lift = (X, v) => !cmp(v, ONE) ? X : undigits(digits(X, ONE).map(([F, k]) => [lift(F, v), k]), v);
const unlift = (X, v) => !cmp(v, ONE) ? X : undigits(digits(X, v).map(([F, k]) => [unlift(F, v), k]), ONE);

// the coefficients of E in base Ω_v, and of its exponents
const components = (E, v) => digits(E, v).flatMap(([F, k]) => [k, ...components(F, v)]);

// How X = ψ_ν(U), with U's exponents above E, sits against Φ_E: "fixed" if Φ_E(X) = X,
// "first" if Φ_E(0) = X, "below" if Φ_E(0) > X.
function relation(E, X, v) {
	const lt = c => cmp(c, X) < 0, le = c => cmp(c, X) <= 0;
	if (components(E, v).every(lt)) return "fixed";
	// X is a common fixed point of the functions defining Φ_E: those that lower the last entry
	// α@P to some ξ < α and put the argument at a position below P
	const d = digits(E, v), [F, alpha] = d.at(-1);
	const first = components(undigits(d.slice(0, -1), v), v).every(lt) && le(alpha) &&
		components(F, v).every(cmp(alpha, ONE) ? lt : le);
	return first ? "first" : "below";
}

// the leading part of b whose digits in base Ω_v are above Ω_v^E; summands not below ε_(Ω_v+1)
// are above every E (e.g. φ(ψ(Ω₂+1), 0) = ψ(Ω₂+1))
function above(b, E, v) {
	let i = 0;
	while (i < b.length && (cmp(b[i][0], v) > 0 || !cmp(b[i][0], v) && !BOCF.below(b[i][1], v))) i++;
	return [...b.slice(0, i), ...undigits(digits(b.slice(i), v).filter(([F]) => cmp(F, E) > 0), v)];
}

// φ of an array of entries [α, X] (the α@X), X ≥ 0
function dimensional(entries) {
	entries = entries.filter(([a]) => a.length).sort((x, y) => cmp(y[1], x[1]));
	const beta = entries.find(([, X]) => !X.length)?.[0] ?? [];
	const hi = entries.filter(([, X]) => X.length);
	if (!hi.length) return omega(beta);
	const nu = entries.map(([a]) => level(a)).reduce((m, u) => cmp(u, m) > 0 ? u : m), v = succ(nu);
	const E = undigits(hi.map(([a, X]) => [lift(sub(X, ONE), v), a]), v);
	// the largest ψ_ν(U) at most γ or a component, with U's exponents above E
	let X = nu.length ? [[nu, []]] : null;
	for (const c of [beta, ...components(E, v)]) {
		const U = c.length && !cmp(level(c), nu) ? above(c[0][1], E, v) : [];
		if (U.length && (!X || cmp([[nu, U]], X) > 0)) X = [[nu, U]];
	}
	const rel = X ? relation(E, X, v) : "below";
	const a = rel == "fixed" ? sub(beta, X) : rel == "first" ? beta : add(ONE, beta);
	if (!a.length) return X; // φ is not in normal form: its value is X
	return [[nu, add(X?.[0][1] ?? [], undigits([[E, a]], v))]];
}

const phi = (a, b) => dimensional([[a, ONE], [b, []]]);

// Φ_E(β) for an exponent E in base Ω (countable coefficients)
const Phi = (E, beta) => dimensional([...digits(E, ONE).map(([F, a]) => [a, add(ONE, F)]), [beta, []]]);

// s as Φ_E(β) at level ν: {E (in base Ω_(ν+1)), arg: β, v}, or null if s is Ω_ν or too large
function decompose([nu, xi]) {
	const v = succ(nu), d = digits(xi, v);
	if (!d || nu.length && !xi.length) return null;
	if (!d.at(-1)?.[0].length) return {E: [], arg: log([nu, xi]), v};
	let X = nu.length ? [[nu, []]] : null, arg;
	d.forEach(([E, a], i) => {
		const rel = X ? relation(E, X, v) : "below";
		arg = rel == "fixed" ? add(X, a) : rel == "first" ? a : sub(a, ONE);
		X = [[nu, undigits(d.slice(0, i + 1), v)]];
	});
	return {E: d.at(-1)[0], arg, v};
}

// a countable summand s as Φ_E(β): {E, arg: β}, or null at or above ψ(Ω₂)
const veblenOf = s => s[0].length ? null : decompose(s);

// the entries [α, X] of s = φ(...), or null; at level ν > 0 an exponent digit whose own digits
// have coefficients above Ω would need a position array outside base-Ω normal form
function entriesOf(s) {
	const p = decompose(s);
	if (!p) return null;
	const d = digits(p.E, p.v), hi = d.map(([F, a]) => [a, add(ONE, unlift(F, p.v))]);
	if (hi.some(([, X], i) => !digits(X, ONE) || cmp(lift(sub(X, ONE), p.v), d[i][0]))) return null;
	return [...hi, [p.arg, []]];
}

// whether t is written entirely in Veblen form (with named, entirely with ω^, ε, ζ, η)
function fits(t, named) {
	return t.every(s => {
		const v = veblenOf(s);
		return v && (!named || isNat(v.E) && v.E.length <= 3) && fits(v.arg, named) && components(v.E, ONE).every(c => fits(c, named));
	});
}

// printing: φ(a,b,c) for up to 4 finite positions, α@X otherwise, and ω^, ε, ζ, η, Γ;
// with opts.named, only ω^, ε, ζ, η, and with opts.plain, only φ; a summand that doesn't fit stays in ψ form.
// With opts.relative, terms between Ω and Ω₂ are written the same way relative to Ω (see relativeStr).

function show(t, opts = {}) {
	if (opts.relative && !BOCF.countable(t) && t.every(([u]) => cmp(u, ONE) <= 0)) return relativeStr(t, opts);
	return BOCF.show(t, {...opts, countable: t => countableStr(t, opts)});
}

// Terms below Ω₂ in the style ε_(Ω+1)·ω, ζ_(Ω+1), Ω^Ω: a fixed point by its entries (entriesOf
// works at level 1), as ε, ζ, η (with opts.named, otherwise Γ and φ too; a summand that doesn't fit
// stays in ψ form); an ω-power ω^(E·δ+β), with E the largest epsilon above Ω at most its leading
// exponent summand, as E^δ·ω^β (ε_(Ω+1)·Ω, ε_(Ω+1)², ε_(Ω+1)^ε_(Ω+1)); below ε_(Ω+1), base-Ω
// Cantor normal form (Ω^3·ω, Ω^Ω).
function relativeStr(t, opts) {
	return runs(t).map(([s, k]) => {
		if (BOCF.isOne(s)) return String(k);
		const p = relativeSummand(s, opts);
		return k == 1 ? p : p + "·" + k;
	}).join("+") || "0";
}

const aboveEps = s => !BOCF.countable([s]) && !BOCF.below(s[1], ONE);
const sub1 = x => wrap(x, "+·^") == x ? "_" + x : "_{" + x + "}";

function relativeSummand(s, opts) {
	const named = opts.named;
	if (!aboveEps(s)) return show([s], {...opts, relative: false, cnf: true});
	const e = entriesOf(s);
	if (!e) return BOCF.show([s], {});
	const hi = e.filter(([, X]) => X.length), arg = e.find(([, X]) => !X.length)?.[0] ?? [];
	const argStr = relativeStr(arg, opts);
	if (hi.length == 1 && isNat(hi[0][0]) && isNat(hi[0][1])) {
		const a = hi[0][0].length, X = hi[0][1].length;
		if (X == 1 && a <= 3) return "εζη"[a - 1] + sub1(argStr);
		if (X == 2 && a == 1 && !named) return "Γ" + sub1(argStr);
	}
	if (hi.length && named) return BOCF.show([s], {cnf: true});
	if (hi.length && hi.every(([, X]) => isNat(X))) { // φ(a_n, ..., a_1, arg)
		const args = Array(Math.max(...hi.map(([, X]) => X.length)) + 1).fill("0");
		for (const [a, X] of hi) args[args.length - 1 - X.length] = relativeStr(a, opts);
		args[args.length - 1] = argStr;
		return "φ(" + args.join(",") + ")";
	}
	if (hi.length) return "φ(" + hi.map(([a, X]) => wrap(relativeStr(a, opts)) + "@" + wrap(relativeStr(X, opts))).join(",") + "," + argStr + ")";
	const E = arg[0] && epsilonUnder(arg[0]);
	if (!E) return "ω^" + wrap(argStr);
	let delta = [], beta = [];
	for (const a of arg) {
		const la = log(a);
		if (cmp(la, [E]) >= 0) delta = add(delta, omega(sub(la, [E])));
		else beta = add(beta, [a]);
	}
	const d = !cmp(delta, ONE) ? "" : "^" + wrap(relativeStr(delta, opts));
	return relativeSummand(E, opts) + d + (beta.length ? "·" + wrap(relativeStr(omega(beta), opts)) : "");
}

// the largest epsilon number above Ω at most the summand s (ε_(Ω+1)² gives ε_(Ω+1)), or null
function epsilonUnder(s) {
	if (!aboveEps(s)) return null;
	if (entriesOf(s)?.some(([, X]) => X.length)) return s;
	const l = log(s);
	return l.length ? epsilonUnder(l[0]) : null;
}

function countableStr(t, opts) {
	const str = x => show(x, opts);
	const arrayStr = entries => { // [α, X] in decreasing X
		const finite = entries.every(([, X]) => isNat(X) && X.length < 4);
		if (finite) {
			const args = Array(entries[0][1].length + 1).fill("0");
			for (const [a, X] of entries) args[args.length - 1 - X.length] = str(a);
			return args.join(",");
		}
		return entries.filter(([a]) => a.length).map(([a, X]) => X.length ? wrap(str(a)) + "@" + posStr(X) : str(a)).join(",");
	};
	const posStr = X => X.every(([u]) => !u.length) ? str(X) : `(${arrayStr(digits(X, ONE).map(([F, a]) => [a, F]))})`;
	const phiStr = s => {
		if (!fits([s], opts.named)) return principal(s, {...opts, countable: x => countableStr(x, opts)});
		const {E, arg} = veblenOf(s);
		const name = (letter, x) => letter + (isNat(x) ? subscriptDigits(x.length) : "_" + wrap(str(x), "+·^"));
		if (!E.length && !arg.length) return "1";
		if (opts.plain) return `φ(${arrayStr(entriesOf(s))})`;
		if (!E.length) return !cmp(arg, ONE) ? "ω" : "ω^" + wrap(str(arg));
		if (isNat(E) && E.length <= 3) return name("εζη"[E.length - 1], arg);
		if (!cmp(E, [[ONE, []]])) return name("Γ", arg);
		return `φ(${arrayStr(entriesOf(s))})`;
	};
	return runs(t).map(([s, k]) => {
		const p = phiStr(s);
		return k == 1 ? p : p == "1" ? String(k) : p + "·" + k;
	}).join("+") || "0";
}

return {Phi, phi, dimensional, veblenOf, entriesOf, show};

})();

// The PSS value map: pair sequences (two-row Bashicu matrices) to EBOCF terms (ordinals/bocf.js).

const PSSMap = (() => {

// the raw term of the columns at depth r: [[u, argument], ...]
function raw(s, r = 0) {
	const t = [];
	for (let i = 0, j; i < s.length; i = j) {
		for (j = i + 1; j < s.length && s[j][0] > r; j++);
		t.push([s[i][1], raw(s.slice(i + 1, j), r + 1)]);
	}
	return t;
}

// the Buchholz term of a raw term inside ψ_(q-1) (q = 0: the top level)
function read(q, t) {
	let out = [];
	t.forEach(([u, b], i) => {
		const y = read(u + 1, b);
		if (i || u != q || !q) return out.push([u, y]);
		const k = y.findIndex(([v]) => v <= q);
		out = y.length && k < 0 ? y : [...y.slice(0, k), [q, y]];
	});
	return out;
}

const toBOCF = t => t.map(([u, b]) => [BOCF.nat(u), toBOCF(b)]);

const values = new Map();

// the EBOCF term of a pair sequence [[a, b], ...]
function value(s) {
	const key = JSON.stringify(s);
	if (!values.has(key)) values.set(key, toBOCF(read(0, raw(s))));
	return values.get(key);
}

// for a sequence with a single root column (0,0): the term of the columns after it as the root's
// argument, before the bridge inside ψ₀ (so value(s) = ψ₀ of the bridged form of it); null otherwise
function argument(s) {
	const top = raw(s);
	return top.length == 1 ? toBOCF(top[0][1].map(([u, b]) => [u, read(u + 1, b)])) : null;
}

return {raw, read, value, argument};

})();

// The ordinal syntax setting shared by explorers that write EBOCF terms: Buchholz ψ, ω^/ε/ζ/η,
// or Veblen, with an option for Cantor normal form.

const OrdinalSyntax = (() => {

// the parameter entries; visibleIf (optional) applies to both
function parameters({visibleIf, veblen = "Veblen below ψ(Ω₂)", cnf = "Cantor normal form"} = {}) {
	return [
		{legend: "Ordinal syntax:", visibleIf, inputs: [
			{type: "radio", id: "syntax", value: "psi", label: "Buchholz ψ"},
			{type: "radio", id: "syntax", value: "named", label: "ω^, ε, ζ, η"},
			{type: "radio", id: "syntax", value: "veblen", label: veblen},
		]},
		{type: "checkbox", id: "cnf", visibleIf, label: cnf},
	];
}

// the printing options for settings {syntax, cnf}, with extra options passed through
const options = (s, extra = {}) => ({cnf: s.cnf, named: s.syntax == "named", ...extra});

// str, or null if the setting is not Buchholz ψ and str needs ψ
const strict = (str, s) => str != null && s.syntax != "psi" && str.includes("ψ") ? null : str;

// t written in the chosen syntax; with extra.strict, null where another syntax than Buchholz ψ
// would fall back to ψ form
function show(t, s, {strict: isStrict, ...extra} = {}) {
	const str = (s.syntax == "psi" ? BOCF.show : Veblen.show)(t, options(s, extra));
	return isStrict ? strict(str, s) : str;
}

return {parameters, show, strict};

})();


  // TBMS/notation.js (the TBMS part, unchanged)
  const TBMS = (() => {
	const C = makeTBMS();
	const {isNum, isZero, norm, row0, cmpOrd, subOrd, terms, cmpMat, normCol, pieces, colValues, parents} = C;

	// terms below lim(PSS): the pair sequence of a recursive term of finite height <= 2, else null
	function pssPairs(m) {
		if (isNum(m) || m.length && m[0].length) return null;
		const out = [];
		for (const c of m) {
			const col = [];
			for (const [v, l] of c) {
				if (!isNum(v) || !isNum(l) || col.length + l > 2) return null;
				for (let i = 0; i < l; i++) col.push(v);
			}
			out.push([col[0] ?? 0, col[1] ?? 0]);
		}
		return out;
	}
	const libraries = () => typeof BOCF != "undefined" && typeof PSSMap != "undefined";
	// names use ψ only in the Buchholz setting (OrdinalSyntax strict): elsewhere such a name is not given

	// opts: {display, syntax ("psi", "named", "veblen"), cnf}
	function pssName(m, opts) {
		if (!opts.display || !libraries()) return null;
		const pairs = pssPairs(m);
		return pairs ? OrdinalSyntax.show(PSSMap.value(pairs), opts, {strict: true}) : null;
	}

	// A nonrecursive term X of level 1 with at most two rows has value Ω·r, where r is the term of
	// X's columns as the argument of the (0) in (0)X, before the PSS map's bridge inside ψ₀ (which
	// writes a leading ψ₁(y) as y or P+ψ₁(y)), multiplied by Ω (BOCF.mulOmega). So
	// (1)(2)(2) = Ω·ω², (1,1)(2,1) = Ω·ψ₁(Ω) = Ω³, (1,1)(2,2) = ψ₁(Ω₂) = ε_(Ω+1), (1,1)(2,2)(2,2) =
	// ψ₁(Ω₂·2) = ε_(Ω+2), (1,1)(2,2)(2) = ψ₁(Ω₂+1) = ε_(Ω+1)·ω. (It does not continue to three rows:
	// (0)(1,1,1) = ψ₀(Ω_ω), while (1,1,1) = Ω₂.)
	function omegaValue(t) {
		if (!libraries() || isNum(t) || !isNum(row0(t[0])) || row0(t[0]) != 1) return null;
		const pairs = pssPairs([[], ...t]);
		const r = pairs && PSSMap.argument(pairs);
		return r && BOCF.mulOmega(r, BOCF.ONE);
	}
	function omegaName(t, opts) {
		return opts.display ? OrdinalSyntax.strict(omegaNameRaw(t, opts), opts) : null;
	}
	function omegaNameRaw(t, opts) {
		const show1 = x => OrdinalSyntax.show(x, opts, {relative: true});
		const x = omegaValue(t);
		if (x) return show1(x);
		// wider: put a two-row stand-in ψ₀(Ω_(7+i)) for each countable epsilon block, then its name
		const sub = epsilonBlocks(t, opts);
		const y = sub && omegaValue(sub.t);
		if (!y) return null;
		let str = show1(y);
		sub.names.forEach((nm, i) => {
			str = str.split("ψ(Ω" + BOCF.subscriptDigits(7 + i) + ")").join(BOCF.wrap(nm, "+·^"));
		});
		return /Ω[₇-₉]|Ω₁[0-9]/.test(str) ? null : str;
	}

	// Countable blocks of a level-1 term: a column (c) of height 1 with c >= 2, or the root (1),
	// followed by the
	// columns above it in row 0 whose entries above row 0 all hang inside the block. Such a block is
	// the countable α = (0)(the rest lowered by c); when α is an epsilon number it can stand in any
	// position like ε₀, so (1,1)(2,2)(2)(3,1^x) reads as ε_(Ω+1)·α with α = (0)(1^(1+x)).
	function epsilonBlocks(t, opts) {
		const {P} = pieces(t, [1]);
		const val = t.map(c => colValues(c, P)), par = parents(val);
		// first pass: the epsilon blocks [j, k) and their α; stand-ins are ordered like the α's
		const blocks = [];
		let j = 0;
		while (j < t.length) {
			const c = row0(t[j]);
			if (blocks.length < 3 && t[j].length == 1 && t[j][0][1] === 1 && isNum(c) && (j == 0 ? c == 1 : c >= 2)) {
				let k = j + 1;
				while (k < t.length && isNum(row0(t[k])) && row0(t[k]) > c) k++;
				let inside = k > j + 1;
				for (let i = j + 1; i < k && inside; i++)
					for (let q = 1; q < P.length - 1; q++) if (!isZero(val[i][q]) && par[q][i] < j) inside = false;
				if (inside) {
					const a = norm([[], ...t.slice(j + 1, k).map(col => lowerRow0By(col, c))]);
					const f = factorInfo(a, opts);
					if (f.eps && !pssPairs(a)) {
						blocks.push({j, k, c, a, name: f.s});
						j = k;
						continue;
					}
				}
			}
			j++;
		}
		if (!blocks.length) return null;
		const alphas = [];
		for (const b of blocks) if (!alphas.some(a => cmpMat(a, b.a) == 0)) alphas.push(b.a);
		alphas.sort(cmpMat);
		const names = alphas.map(a => blocks.find(b => cmpMat(b.a, a) == 0).name);
		const out = [];
		let i = 0;
		for (const b of blocks) {
			out.push(...t.slice(i, b.j));
			const m = 7 + alphas.findIndex(a => cmpMat(a, b.a) == 0);
			out.push([[b.c, 1]]);
			for (let r = 1; r <= m; r++) out.push(normCol([[b.c + r, 1], [r, 1]]));
			i = b.k;
		}
		out.push(...t.slice(i));
		return {t: out, names};
	}
	function lowerRow0By(c, d) {
		const [[v, l], ...rest] = c;
		return normCol([[v - d, 1], [v, subOrd(1, l)], ...rest]);
	}

	// for a recursive term a = (0)D: when no entry of D above row 0 hangs from the root, a = ω^β with
	// β = D with row 0 lowered by 1 (as in Cantor normal form, (0)(1) = ω^1), and a may be
	// non-standard: (0)(1)(2,1^x) = ω^((0)(1^(1+x))). {s, eps}: the name (ω^β, or β when it is an
	// epsilon number), and whether the value is an epsilon number.
	function factorInfo(a, opts) {
		if (isNum(a)) return {s: String(a), eps: false};
		if (a.length < 2 || hangsFromRoot(a)) return {s: ordInfo(a, opts).s, eps: isEpsilon(a)};
		const b = norm(a.slice(1).map(c => lowerRow0By(c, 1)));
		if (isNum(b) && b == 1) return {s: "ω", eps: false};
		const bi = factorInfo(b, opts);
		return bi.eps ? bi : {s: "ω^" + (/^ω\d/.test(bi.s) ? "(" + bi.s + ")" : BOCF.wrap(bi.s)), eps: false};
	}
	// some entry of a's columns above row 0 has the first column as its parent
	function hangsFromRoot(a) {
		const {P} = pieces(a, [1]);
		const val = a.map(c => colValues(c, P)), par = parents(val);
		for (let k = 1; k < P.length - 1; k++)
			for (let j = 1; j < a.length; j++) if (par[k][j] == 0) return true;
		return false;
	}
	// a standard single-term β = (0)E is an epsilon number when every row-0 child of the root also
	// hangs from it in row 1: (0)(1,1^x), (0)(1,1)(2), (0)(1,1)(1,1), but not (0)(1,1)(1) = ε₀·ω
	function isEpsilon(b) {
		if (isNum(b) || b.length < 2 || terms(b).length != 1) return false;
		const {P} = pieces(b, [1, 2]);
		const k1 = P.findIndex(p => cmpOrd(p, 1) == 0);
		const val = b.map(c => colValues(c, P)), par = parents(val);
		for (let j = 1; j < b.length; j++) if (par[0][j] == 0 && par[k1][j] != 0) return false;
		return true;
	}

	// display names of limits beyond lim(PSS): [term, name, name with Buchholz ψ]
	const LIMITS = [[[[], [[1, 3]]], "lim(PSS)", "ψ₀(Ω_ω)"], [[[], [[1, 4]]], "lim(TSS)"],
		[[[], [[1, [[], [[1, 1]]]]]], "lim(BMS)"]];
	function limitName(t, opts) {
		for (const [u, name, psi] of LIMITS) if (cmpMat(t, u) == 0) return opts.syntax == "psi" && psi || name;
		return null;
	}

	// the core asks these for names when opts.display is set
	const NAMES = {whole: pssName, term: (t, opts) => pssName(t, opts) ?? omegaName(t, opts) ?? limitName(t, opts)};
	const named = (opts = {}) => opts.display && !opts.names ? {...opts, names: NAMES} : opts;
	const ordInfo = (a, opts) => C.ordInfo(a, named(opts));

	return {...C, ordInfo, ordName: (a, opts) => ordInfo(a, opts).s, showCol: (c, opts) => C.showCol(c, named(opts)),
		show: (m, opts) => C.show(m, named(opts)), pssPairs, pssName, omegaValue, omegaName, factorInfo};
})();

  // ---------------------------------------------------------------------------
  // Module interface: thin wrappers around the TBMS functions
  // ---------------------------------------------------------------------------
  const Zero = [];
  const Limit = "Limit";

  // one level of script: size shrinks only for the first two levels so towers stay readable, and the
  // rise is capped (inline styles, so page CSS cannot make nested <sup> collapse)
  function script(up, inner, d) {
    const size = d === 1 ? 0.75 : d === 2 ? 0.85 : 1;
    const shift = up ? (d === 1 ? 0.55 : d === 2 ? 0.4 : 0.3) : -0.25;
    return `<span style="font-size:${size}em;vertical-align:${shift}em;line-height:0">${inner}</span>`;
  }

  // plain text -> HTML: x^y becomes a raised span, x_y a lowered span.
  // Operands: {..}; a (..) group (parentheses dropped after a name, kept for a matrix run 1^(1)(2));
  // else one symbol with its subscripts, ψ(..)/φ(..) with its arguments, and for ^ a right-associative
  // tower (ω^ω^ω nests instead of staying flat).
  function toHtml(s, depth = 0) {
    let out = "", i = 0;
    const group = (open, close) => {
      let d = 0, j = i;
      for (; j < s.length; j++) {
        if (s[j] === open) d++;
        else if (s[j] === close && --d === 0) break;
      }
      const body = s.slice(i + 1, j);
      i = j + 1;
      return body;
    };
    const symbol = () => {
      const st = i;
      const m = /^(\d+|[A-Za-zα-ωΑ-Ω][₀-₉]*)/.exec(s.slice(i));
      i += m ? m[0].length : 1;
      if (/[ψφ]/.test(s[st]) && s[i] === "(") group("(", ")");
      if (s[i] === "_") { i++; operand(true, s[st]); }
      return s.slice(st, i);
    };
    const operand = (sub, base) => {
      if (s[i] === "{") return group("{", "}");
      if (s[i] === "(") {
        if (sub || !/[\d})]/.test(base ?? "")) return group("(", ")");
        const st = i;
        while (s[i] === "(") group("(", ")");
        return s.slice(st, i);
      }
      let t = symbol();
      if (!sub) while (s[i] === "^" && i + 1 < s.length) { i++; t += "^" + operand(false, s[i - 2]); }
      return t;
    };
    while (i < s.length) {
      const ch = s[i];
      if ((ch === "^" || ch === "_") && i + 1 < s.length) {
        const base = s[i - 1];
        i++;
        out += script(ch === "^", toHtml(operand(ch === "_", base), depth + 1), depth + 1);
      } else { out += ch; i++; }
    }
    return out;
  }

  function fs(m, n) {
    if (m === Limit) return TBMS.limitTerm(n);
    return TBMS.expand(m, n);
  }

  function cmp(a, b) {
    if (a === Limit && b === Limit) return 0;
    if (a === Limit) return 1;
    if (b === Limit) return -1;
    return TBMS.cmpMat(a, b);
  }

  function isSuccessor(m) {
    return m !== Limit && TBMS.isSuccessor(m);
  }

  const SYNTAXES = [["Buchholz ψ", "psi"], ["ω^, ε, ζ, η", "named"], ["Veblen below ψ(Ω₂)", "veblen"]];
  const DisplayName = ["TBMS", ...SYNTAXES.map(x => x[0]), ...SYNTAXES.map(x => x[0] + " (CNF)")];

  function display(m, mode) {
    if (m === Limit) return "Lim(TBMS)";
    if (m.length == 0) return "∅";

    if (mode == "TBMS")
      return TBMS.show(m, {matrices: true});

    const i = DisplayName.indexOf(mode) - 1;
    if (i >= 0) {
      const opts = {display: true, matrices: false, syntax: SYNTAXES[i % 3][1], cnf: i >= 3};
      return toHtml(TBMS.pssName(m, opts) ?? TBMS.show(m, opts));
    }

    return TBMS.show(m, {matrices: true});
  }

  function classifyOrdinal(m) {
    if (m === Limit) return "#ff8000";
    if (m.length == 0) return "#808080";
    return TBMS.isSuccessor(m) ? "#d40000" : "#ff8000";
  }

  function parse(str) {
    return TBMS.parse(str);
  }

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#d40000"],
    ["Limit Ordinal", "#ff8000"]
  ];

  const Aliases = [
    ["1", TBMS.parse("(0)")],
    ["ω", TBMS.parse("(0)(1)")],
    ["ε₀", TBMS.parse("(0)(1,1)")],
    ["Lim(PSS)", TBMS.parse("(0)(1,1,1)")],
    ["Lim(TSS)", TBMS.parse("(0)(1,1,1,1)")],
    ["Lim(BMS)", TBMS.parse("(0)(1^ω)")],
    ["Lim(TBMS)", Limit],
  ];

  const config = {};
  const title = "Transfinitary/Collapsing BMS transfinite number line";

  return { fs, cmp, isSuccessor, display, classifyOrdinal, parse, Zero, Limit, DisplayName, ordinalTypes, Aliases, config, title };
})();
