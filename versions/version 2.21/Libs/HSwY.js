/*
Notation : Hierachical Strong ω-Y sequence
Limit : idk but it should be > W-Y according to MRREDSHARKFAN
*/

window.notation = (() => {

   // Required Constants
   const Zero = [];
   const Limit = [Infinity];

   // internal cache for fundamental-sequence results
   const data = {};

   
   function fs(s, n) {
      if(''+s == "Infinity") return [1,n+2]
      var lineBreakRegex = /\r?\n/g;
      var itemSeparatorRegex = /[\t ,]/g;
      function dg(s) {
         return document.getElementById(s);
      }
      function displayMt(m) {
         var index = []
         for (var i = 0; i < m.length; i++) index.push(0)
         mt += '<p></p><table>'
         while (true) {
            var row = []
            for (var i = 0; i < m.length; i++) if (m[i].length > index[i] && (row.length == 0 || compareRow(m[i][index[i]].row, row) < 0)) row = m[i][index[i]].row
            if (row.length == 0) break
            mt += '<tr>'
            mt += '<td align="center" width="80" bgColor="#eee0e0">' + row + '</td>'
            for (var i = 0; i < m.length; i++) {
               if (m[i].length > index[i] && compareRow(m[i][index[i]].row, row) == 0) mt += '<td align="center" width="80" bgColor="#e0eee0">' + m[i][index[i]++].value + '</td>'
               else mt += '<td align="center" width="80" bgColor="#e0eee0">' + '' + '</td>'
            }
            mt += '</tr>'
         }
         mt += '</table>'
      }
      function isDimensionLimited(it, d) {
         if (proc(d).length == 1 && proc(d)[0] && getFootRow(it, d)[1] > proc(d)[0] || d.length == 2 && d[0] == 0 && d[1] > 0 && getFootRow(it, d).length > d[1]) return true
         return false
      }
      function proc(d) {
         if (d.length > 2 && d[0] == 0 && d[1] > 0 && divide(d).length > 1) return [divide(d)[0].length - 1]
         if (d.length > 2 && d[0] == 0 && d[1] > 0 && divide(d).length == 1 && divide(d)[0].length > 2) return [divide(d)[0].length - 2]
         return d
      }
      function rowGenerator(n) {
         var row = [1]
         for (var i = 1; i < n; i++) row.push(0)
         return row
      }
      function divide(d) {
         var dd = d.slice(1), ret = []
         for (var i = 0; i < dd.length - 1; i++) while (dd[i]-- > 0) ret.push(rowGenerator(dd.length - i))
         if (dd[dd.length - 1]) ret.push([dd[dd.length - 1]])
         return ret
      }
      function merge(d) {
         var ret = rowGenerator(d[0].length)
         ret[0] -= 1
         for (var i = 0; i < d.length - 1; i++) ret[ret.length - d[i].length]++
         ret[ret.length - d[d.length - 1].length] += d[d.length - 1][0]
         ret.unshift(0)
         return ret
      }
      function compareRow(r1, r2) {
         var i = 0
         for (; i < r1.length && i < r2.length; i++) {
            if (r1[i] > r2[i]) return 1
            if (r1[i] < r2[i]) return -1
         }
         if (r1.length > i) return 1
         if (r2.length > i) return -1
         return 0
      }
      function compareDimension(r1, r2) {
         return (r1.length <= 1 ? 1 : r1[1]) - (r2.length <= 1 ? 1 : r2[1])
      }
      function rowAddition(r1, r2) {
         if (r2.length <= 1 || r2[1] == 1) return r1.concat(r2)
         if (r1.length <= 1 || r1[1] < r2[1]) return r2
         var i = 1
         while (i++ < r1.length) if (r1[i] < r2[1]) break
         return r1.slice(0, i).concat(r2.slice(1))
      }
      function rowDifference(r1, r2) {
         if (compareRow(r1, r2) <= 0) return []
         if (r1[1] == 1) return r1.slice(0, r1.length - r2.length)
         var i = 0
         for (; i < r1.length && i < r2.length; i++) if (r1[i] > r2[i]) break
         if (r1[i] == 1) return r1.slice(i)
         return [1].concat(r1.slice(i))
      }
      function getFootRow(it, d) {
         var row = rowDifference(it.row, it.parent.row)
         if (row.length == 0 || d.length == 0 || d.length == 1 && d[0] == 0 || d.length == 2 && d[0] == 0 || d.length == 3 && d[0] == 0 && d[1] == 1 && d[2] == 0) return rowAddition(it.row, [1])
         if (row.length == 1) return rowAddition(it.row, [1, 2])
         return rowAddition(it.row, [1, row[1] + 1])
      }
      function setElementRefrence(m) {
         for (var i = 0; i < m.length; i++) {
            for (var j = 0; j < m[i].length; j++) {
               if (m[i][j].row.length <= 1 && m[i][j].value <= 1) continue
               if (compareRow(m[i][j].row, m[i][j].parent.row) == 0) m[i][j].ref = m[i][j].parent
               else if ('foot' in m[i][j].head.parent && compareRow(m[i][j].head.parent.foot.row, m[i][j].row) <= 0) {
                  m[i][j].ref = m[i][j].head.parent.foot
                  while (compareRow(m[i][j].ref.row, m[i][j].row) == 0) m[i][j].ref = m[i][j].ref.ref
               }
               else m[i][j].ref = m[i][j].head.parent
            }
         }
      }
      function setElementNo(m, b) {
         var id = 0
         for (var i = 0; i < m.length; i++) {
            for (var j = 0; j < m[i].length; j++) {
               if (i == b.cloumn) m[i][j].no = j + 1
               else if (i < b.cloumn || (m[i][j].value <= 1 && j == 0)) m[i][j].no = 0
               else m[i][j].no = m[i][j].ref.no
               if (i > b.cloumn) m[i][j].id = id++
               if (i == b.cloumn || i == m.length - 1) m[i][j].id = m[i][j].no
            }
         }
      }
      function getReferenceChain(it) {
         var c = []
         while (true) {
            c.unshift(it)
            if (it.value <= 1 && it.row.length == 1) break
            it = it.ref
         }
         return c
      }
      function drawMountain(s, d) {
         var m = []
         s.forEach(e => { m.push([{ value: e.value, row: [1], cloumn: e.cloumn, idx: 0, parent: e.parent.cloumn < 0 ? { row: [1], cloumn: -1 } : m[e.parent.cloumn][0] }]) })
         for (var i = 0; i < m.length; i++) {
            var it = m[i][0]
            while (it.value > 1) {
               if (isDimensionLimited(it, d)) break
               it.foot = { value: it.value - it.parent.value, row: getFootRow(it, d), cloumn: i, idx: it.idx + 1, head: it }
               m[i].push(it.foot)
               var p = it.parent
               if ('foot' in p && compareRow(p.foot.row, it.foot.row) <= 0) p = p.foot
               while (p.value >= it.foot.value) p = p.parent
               it.foot.parent = p
               it = it.foot
            }
         }
         return m
      }
      function getOds(m) {
         var o = []
         m.forEach(e => { o.push({ value: e[e.length - 1].value, cloumn: e[0].cloumn, parent: e[e.length - 1].value <= 1 ? { row: [1], cloumn: -1 } : o[e[e.length - 1].parent.cloumn] }) })
         return o
      }
      function getMds(m) {
         return toSequence(getReferenceChain(m[m.length - 1][m[m.length - 1].length - 1]).map(e => { return e.row.length <= 1 ? 1 : e.row[1] }))
      }
      function getBootIndex(s, d) {
         var m = drawMountain(s, d)
         setElementRefrence(m)
         var t = m[m.length - 1][m[m.length - 1].length - 1]
         if (t.value == 1) t = t.head
         var b = t.parent
         if (t.value - b.value > 1 && proc(d).length == 1) {
            var o = getOds(m)
            var c = getBootIndex(o, d.length == 1 || divide(d).length == 1 ? d : merge(divide(d).slice(1)))[0]
            return [c, m[c].length - 1]
         }
         if (compareDimension(b.row, t.row) < 0) {
            var ch = getReferenceChain(t), dd = [0, 1]
            if (d.length > 2 && d[0] == 0 && d[1] == 0) dd = d.slice(2)
            if (d.length == 3 && d[0] == 1 && d[1] == 0 && d[2] == 1) dd = d
            var c = ch[getBootIndex(getMds(m), dd)[0]].cloumn
            return [c, m[c][m[c].length - 1].idx]
         }
         return [b.cloumn, b.idx]
      }
      function copyElement(m, b, t, it, op, i, d) {
         if (it.value <= 1 && it.row.length > 1) {
            it.parent = it.ref
            while (it.parent.value > 1) it.parent = it.parent.ref
         }
         var min_row = it.row.length > 1 ? getFootRow(op[op.length - 1], d) : [1], max_row = it.row
         if (it.no > 0) {
            var c = it.ref.cloumn + (t.cloumn - b.cloumn) * (i + 1)
            var r = m[c][0]
            while ('foot' in r && r.foot.id <= it.ref.id) r = r.foot
            if ('offset' in it) max_row = rowAddition(r.row, it.offset[i])
            else max_row = rowAddition(r.row, rowDifference(it.row, it.ref.row))
         }
         if (d.length == 0 || d.length == 1 && d[0] == 0 || d.length == 2 && d[0] == 0 || d.length == 3 && d[0] == 0 && d[1] == 1 && d[2] == 0) max_row = it.row
         if (compareRow(min_row, max_row) > 0) alert('collapsed!')
         var row = min_row
         while (compareRow(row, max_row) <= 0) {
            op.push({ value: it.value, row: row, cloumn: m.length - 1, idx: op.length, no: it.no, id: it.id })
            if (op.length > 1) {
               op[op.length - 1].head = op[op.length - 2]
               op[op.length - 2].foot = op[op.length - 1]
            }
            var pc = it.parent.cloumn >= b.cloumn ? m.length - 1 + it.parent.cloumn - it.cloumn : it.parent.cloumn
            var p = pc >= 0 ? m[pc][m[pc].length - 1] : { row: [1], cloumn: -1 }
            while (compareRow(p.row, row) > 0) p = p.head
            op[op.length - 1].parent = p
            row = getFootRow(op[op.length - 1], d)
         }
      }
      function copyCloumn(m, b, t, c, i, ex, d) {
         var it = m[c][0]
         m.push([])
         while (true) {
            copyElement(m, b, t, it, m[m.length - 1], i, d)
            if ('foot' in it) it = it.foot
            else break
         }
         m[m.length - 1][m[m.length - 1].length - 1].value = ex.length ? ex[m.length - 1] : it.value
         it = m[m.length - 1][m[m.length - 1].length - 1]
         while ('head' in it) {
            it.head.value = it.value + it.head.parent.value
            it = it.head
         }
      }
      function expandDimensionSequnece(m, b, t, n, d) {
         if (compareDimension(b.row, t.row) >= 0) return
         var dd = [0, 1]
         if (d.length > 2 && d[0] == 0 && d[1] == 0) dd = d.slice(2)
         if (d.length == 3 && d[0] == 1 && d[1] == 0 && d[2] == 1) dd = d
         var s = getMds(m), c = getBootIndex(s, dd)[0]
         for (var i = b.cloumn + 1; i <= t.cloumn; i++) {
            for (var j = 0; j < m[i].length; j++) {
               if (i == t.cloumn && j == m[t.cloumn].length - 1) return
               var it = m[i][j], ds = s.slice(), pos = 1
               if (it.no != b.no || compareDimension(rowDifference(it.row, it.ref.row), b.row) <= 0) continue
               ds.splice(c + 1, 0, { value: rowDifference(it.row, it.ref.row).length < 2 ? 1 : rowDifference(it.row, it.ref.row)[1], parent: ds[c] })
               while (it.ref.cloumn > b.cloumn) {
                  it = it.ref
                  if (compareDimension(rowDifference(it.row, it.ref.row), b.row) <= 0) continue
                  ds.splice(c + 1, 0, { value: rowDifference(it.row, it.ref.row).length < 2 ? 1 : rowDifference(it.row, it.ref.row)[1], parent: ds[c] })
                  ds[c + 2].parent = ds[c + 1]
                  pos++
               }
               for (var k = 0; k < ds.length; k++) {
                  ds[k].cloumn = k
                  while (ds[k].value <= ds[k].parent.value) ds[k].parent = ds[k].parent.parent
               }
               it = m[i][j]
               it.offset = []
               if (d.length == 2 && d[0] == 2) {
                  var lift = ds[ds.length - 1].value - 1 - ds[ds.length - 1].parent.value
                  if (d[1] > 0 && lift > d[1]) lift = d[1]
                  for (var ii = 0; ii < n; ii++) {
                     it.offset.push([1, rowDifference(it.row, it.ref.row)[1] + (1 + ii) * lift])
                  }
                  continue
               }
               var len = ds.length - 1 - c
               var ex = expand(ds, n, dd, inputm)
               for (var ii = 0; ii < n; ii++) {
                  it.offset.push([1, ex[c + len * (ii + 1) + pos]])
               }
            }
         }
      }
      function expand(s, n, d, f = true) {
         if (s[s.length - 1].value <= 1) return s.slice(0, -1).map(e => { return e.value })
         var idx = getBootIndex(s, d), m = drawMountain(s, d), b = m[idx[0]][idx[1]], t = m[m.length - 1][m[m.length - 1].length - 1], ex = []
         if (t.value == 1) t = t.head
         if (f) displayMt(m)
         setElementRefrence(m)
         setElementNo(m, b)
         expandDimensionSequnece(m, b, t, n, d)
         if (t.value - b.value > 1 && proc(d).length == 1) {
            var o = getOds(m)
            ex = expand(o, n, d.length == 1 || divide(d).length == 1 ? d : merge(divide(d).slice(1)), f)
         }
         else if ('foot' in t) {
            m[m.length - 1].pop()
            delete t.foot
            t.parent = t.parent.parent
         }
         for (var i = 0; i < m[m.length - 1].length; i++) m[m.length - 1][i].value--
         for (var i = b.no; i < m[b.cloumn].length; i++) {
            var idx = t.idx
            m[t.cloumn].push({ value: m[b.cloumn][i].value, row: m[b.cloumn][i].row, cloumn: t.cloumn, idx: idx++, no: m[b.cloumn][i].no, id: m[b.cloumn][i].no, parent: m[b.cloumn][i].parent, head: m[t.cloumn][m[t.cloumn].length - 1], ref: m[b.cloumn][i] })
            m[t.cloumn][m[t.cloumn].length - 2].foot = m[t.cloumn][m[t.cloumn].length - 1]
         }
         for (var i = 0; i < n; i++) {
            for (var j = b.cloumn + 1; j <= t.cloumn; j++) {
               copyCloumn(m, b, t, j, i, ex, d)
            }
         }
         if (f) displayMt(m)
         return m.map(e => { return e[0].value })
      }
      function toSequence(s) {
         var seq = []
         for (var i = 0; i < s.length; i++) {
            if (s[i] <= 1) { seq.push({ value: s[i], cloumn: i, parent: { row: [1], cloumn: -1 } }); continue }
            for (var j = i - 1; j >= 0; j--) if (s[j] < s[i]) { seq.push({ value: s[i], cloumn: i, parent: seq[j] }); break }
         }
         return seq
      }
      //Limited to n<=10
      function expandmultilimited(s, nstring, dstring,) {
         var result = s;
         for (var i of nstring.split(",")) result = expand(toSequence(result.split(itemSeparatorRegex).map(e => { return Number(e) })), Math.min(i, 10), dstring.split(itemSeparatorRegex).map(e => { return Number(e) })).toString();
         return result;
      }
      //if (input == dg("input").value && inputn == dg("inputn").value && inputd == dg("inputd").value && inputm == dg("inputm").checked) return;
      var mt = ""
      var inputm = false
      return expandmultilimited(''+s, n.toString(), "1,0").split(",").map(x => Number(x))
   }

   // Compare two ordinals in sequence representation
   function cmp(seq1, seq2) {
      if (seq1.length === 0) {
         if (seq2.length === 0) return 0;
         else return -1;
      } else {
         if (seq2.length === 0) return 1;
         else {
            if (seq1[0] < seq2[0]) return -1;
            else if (seq1[0] > seq2[0]) return 1;
            else return cmp(seq1.slice(1), seq2.slice(1));
         }
      }
   }

   // Check if ordinal is a successor
   function isSuccessor(ord) {
      return Array.isArray(ord) && ord.length > 0 && ord.at(-1) == 1
   }

   // V2 improvement : lossless conversion so all terms preserved :P


   function conv(matrix) {
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

      function gt(x, y) { return !(x == y && lt(x, y)) }

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
               if (s == '') { return `ψ(${display(arg(x))})`; }
               if (l == 'p(0)') { return s.replace('x', '0'); }
               if (s.includes('x')) { return s.replace('x', display(sub(l, 'p(0)'))); }
               return `${s}<sub>${display(l)}</sub>`;
            }
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

      // END COCF

      function P(M, r, n) {
         if (r == -1) { return n - 1; }
         let q = P(M, r - 1, n);
         while (q > -1 && M[q][r] >= M[n][r]) { q = P(M, r - 1, q); }
         return q;
      }

      function C(M, n) {
         let X = [];
         for (let i = 0; i < M.length; i++) {
            if (P(M, 0, i) == n) { X.push(i); }
         }
         return X;
      }

      function CR(M, n) { // modified slightly to handle use in mv
         let X = [];
         for (let i = 0; i < M.length; i++) {
            if (P(M, 0, i) == n) {
               X.push(i);
               if (M[i][2]) { X = X.concat(CR(M, i)) };
            }
         }
         return X;
      }

      function D(M, n) {
         let X = 0;
         for (let i = 0; i < M.length; i++) {
            if (P(M, 0, i) == n && M[i][1] > 0) { X++; }
         }
         return X;
      }

      function U(M, n) {
         if (M[n][1] == 0 || M[n][2] == 1 || n + 1 == M.length) { return [0, null]; }
         let m = P(M, 1, n);
         let L = [M[m][0] + 1, M[n][1], M[m][2] + 1];
         if (P(M, 1, n) == P(M, 1, n + 1) && eq(M[n + 1], L)) { return [1, n + 1]; }
         let q = n;
         let p = n;
         while (q != -1) {
            q = P(M, 0, q);
            if (P(M, 1, n) == P(M, 1, q) && eq(M[q], L) && M[n + 1][0] > M[q][0]) {
               if (M[p][2] == 1) { return [2, q] };
               return [1, q];
            }
            p = q;
         }
         return [0, null];
      }

      function mv(M, n, k) { // value of upgrader; k is same as in ov
         if (k) {
            let A = [k];
            while (A.at(-1) != n) { // "correct" value of k (justified?)
               A.push(P(M, 0, A.at(-1)));
               if (!M[A.at(-1)][0]) { break; } // if this ever gets used something's gone wrong
            }
            if (A.includes(n)) {
               for (i of A.toReversed()) {
                  if (M[i][2] == 0) { k = i; break; }
               }
            }
         }
         let S = '0';
         for (i of C(M, n)) {
            if (i > k && k) { break; }
            if (M[i][2] != 1) { continue; }
            let q = '0';
            for (j of C(M, i)) {
               if (j > k && k) { break; }
               q = add(q, ov(M, j, k));
            }
            S = add(S, exp(q));
         }
         let X = C(M, n).filter(x => M[x][2] && C(M, x).length);
         let p;
         if (!X.length) { p = 1; }
         else { p = M[CR(M, X.at(-1)).at(-1)][2]; }
         if (lt(sua(S)[1], 'p(p(0))') && p && !k) { S = add(S, 'p(0)'); } // 111 211 311 = ψ(T^2·ω), not ψ(T^2)
         // also, if k!=0, the condition will never be activated, since then it's a fixed point.
         return exp(S);
      }

      function ov(M, n, k) { // k = 3 (31) in 0 111 211 31 2 (-> T, since 31 is chain-upgraded)
         if (n == k) { return 'P(0)'; }
         if (M[n][2] == 0) { return o(M, n, k); }
         let S = '0';
         for (let i of C(M, n)) {
            if (i > k && k) { break; }
            S = add(S, ov(M, i, k));
         }
         return `P(${S})`;
      }

      function v(M, n, k) { // k is necessary to make the k value persist from ov (maybe? keeping it just in case)
         // console.log(n,k)
         if (M[n][1] == 0) { return '0'; }
         if (M[n][2] == 0) {
            let u = U(M, n);
            u = (u[0] ? mv(M, u[1], n * (u[0] == 2)) : 'p(0)');
            return add(v(M, P(M, 1, n), k), u);
         }
         return add(v(M, P(M, 2, n), k), mv(M, n, k));
      }

      function o(M, n, k) { // k is necessary to make the k value persist from ov
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
         //let u2=[...Array(M.length).keys()].map(x=>(U(M,x)[0]==2?U(M,x)[1]:null));
         for (let i of C(M, n)) {
            S = S.concat(skipped(M, i)); // for display purposes
            if (M[i][2] && M[n][2]) { S.push(i); continue; }
            if (u.includes(i)) {
               let c = C(M, i);
               if (c.length) { // e.g. 0 111 211 21 111 211
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

      // standardization

      function psi(a) { return `p(${a})`; }
      function _0(a) { return sua(arg(a))[0]; }
      function _1(a) { return sua(arg(a))[1]; }
      function _01(a) { return firstTerm(a)[0]; }
      function _2(a) { return firstTerm(a)[1]; }

      function ttc(a, b) {
         if (a == '0') { return '0'; }
         if (ttc(_2(a), b) == '0' && lt(_01(a), psi(b))) { return '0'; }
         return add(_01(a), ttc(_2(a), b));
      }

      function sp(a, b, c) {
         if (c == '0') { return psi(add(a, b)); }
         if (lt(b, _1(c)) && gt(c, psi(a))) {
            let t = ttc(_1(c), add(_0(c), 'P(0)'));
            //console.log(t);
            return sp(a, add(t, sub(_01(c), psi(add(_0(c), t)))), _2(c));
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

      function NS(M) {
         let S = '0';
         for (let i = 0; i < M.length; i++) { if (eq(M[i], [0, 0, 0])) { S = add(S, o(M, i)); } }
         return S;
      }

      function _skipped(M) {
         let S = [];
         for (let i = 0; i < M.length; i++) { if (eq(M[i], [0, 0, 0])) { S = S.concat(skipped(M, i)); } }
         return S;
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

   function dbmsToBms(matrix) {
      var columns = normalizeMatrix(matrix);
      var n = columns[0].length;

      var index = columns.length - 1;

      while (index >= 0) {
         var x = columns[index];
         if (x[n - 2] > 0) {
            index--;
            continue;
         }

         var k = lastPositiveRow(x);
         if (k + 2 > n) {
            throw new Error("Column " + JSON.stringify(x) + " cannot construct the first k+2 rows; k=" + k + ", n=" + n);
         }

         var y = incrementPrefix(x, k + 1);
         var z = incrementPrefix(y, k + 2);

         var yIndex = index + 1;
         var machineStart = index + 2;

         if (yIndex >= columns.length ||
            !arraysEqual(columns[yIndex], y) ||
            machineStart >= columns.length ||
            compareArrays(columns[machineStart], z) < 0) {
            index--;
            continue;
         }

         var ancestors = createAncestorIndex(columns);
         var xPrime = [];
         var cursor = machineStart;
         var lastStep = null;
         var xEnd = cursor;

         while (true) {
            if (cursor >= columns.length || compareArrays(columns[cursor], z) < 0) {
               xEnd = cursor;
               break;
            }

            var t = columns[cursor];
            var matchingRows = [];
            for (var row = 0; row <= k + 1; row++) {
               if (ancestors.hasAncestorColumn(cursor, row, yIndex)) {
                  matchingRows.push(row);
               }
            }
            if (matchingRows.length === 0) {
               throw new Error("Cannot find the largest l <= k+1 such that t[l] has an ancestor in y: x@" + (index + 1) + ", y@" + (yIndex + 1) + ", t@" + (cursor + 1));
            }
            var l = Math.max.apply(null, matchingRows);

            var stoppedByXParent = (l <= k) && ancestors.parentIsColumn(cursor, l + 1, index);

            var tPrime = decrementPrefix(t, l);
            if (stoppedByXParent) {
               tPrime = zeroFromRow(tPrime, l + 2);
            }

            xPrime.push(tPrime);
            cursor++;
            lastStep = {
               column: t,
               l: l,
               stoppedByXParent: stoppedByXParent
            };

            if (stoppedByXParent) {
               xEnd = cursor;
               break;
            }
         }

         var nextAfterX = (xEnd < columns.length) ? columns[xEnd] : null;
         var keepCase1 = (nextAfterX !== null && compareArrays(nextAfterX, firstRowColumn(z[0], n)) >= 0);

         var keepCase2 = lastStep !== null &&
            lastStep.column[lastStep.l] === 0 &&
            ancestors.parentIsColumn(xEnd - 1, lastStep.l, yIndex);

         var keepCase3 = lastStep !== null &&
            lastStep.stoppedByXParent &&
            (lastStep.l + 1) < n &&
            lastStep.column[lastStep.l + 1] > 0;

         var keepOriginalYx = keepCase1 || keepCase2 || keepCase3;

         if (keepOriginalYx) {
            columns.splice.apply(columns, [index + 1, 0].concat(xPrime));
         } else {
            columns.splice.apply(columns, [index + 1, xEnd - (index + 1)].concat(xPrime));
         }

         index--;
      }

      return columns;
   }


   // note that the correspondance is unproven

   var lineBreakRegex = /\r?\n/g;
   var itemSeparatorRegex = /[\t ,]/g;

   function parseSequenceElement(s, i) {
      if (s.indexOf("v") == -1 || !isFinite(Number(s.substring(s.indexOf("v") + 1)))) {
         var numval = Number(s);
         return {
            value: numval,
            position: i,
            parentIndex: -1
         };
      } else {
         return {
            value: Number(s.substring(0, s.indexOf("v"))),
            position: i,
            parentIndex: Math.max(Math.min(i - 1, Number(s.substring(s.indexOf("v") + 1))), -1),
            forcedParent: true
         };
      }
   }

   function calcMountain(s) {
      var lastLayer;
      if (typeof s == "string") {
         lastLayer = s.split(itemSeparatorRegex).map(parseSequenceElement);
      } else {
         lastLayer = s;
      }
      var calculatedMountain = [lastLayer];
      while (true) {
         var hasNextLayer = false;
         for (var i = 0; i < lastLayer.length; i++) {
            if (lastLayer[i].forcedParent) {
               if (lastLayer[i].parentIndex != -1) hasNextLayer = true;
               continue;
            }
            var p;
            if (calculatedMountain.length == 1) {
               p = lastLayer[i].position + 1;
            } else {
               p = 0;
               while (calculatedMountain[calculatedMountain.length - 2][p].position < lastLayer[i].position + 1) p++;
            }
            while (true) {
               if (p < 0) break;
               var j;
               if (calculatedMountain.length == 1) {
                  p--;
                  j = p - 1;
               } else {
                  p = calculatedMountain[calculatedMountain.length - 2][p].parentIndex;
                  if (p < 0) break;
                  j = 0;
                  while (lastLayer[j].position < calculatedMountain[calculatedMountain.length - 2][p].position - 1) j++;
               }
               if (j < 0 || j < lastLayer.length - 1 && lastLayer[j].position + 1 != lastLayer[j + 1].position) break;
               if (lastLayer[j].value < lastLayer[i].value) {
                  lastLayer[i].parentIndex = j;
                  hasNextLayer = true;
                  break;
               }
            }
         }
         if (!hasNextLayer) break;
         var currentLayer = [];
         calculatedMountain.push(currentLayer);
         for (var i = 0; i < lastLayer.length; i++) {
            if (lastLayer[i].parentIndex != -1) {
               currentLayer.push({ value: lastLayer[i].value - lastLayer[lastLayer[i].parentIndex].value, position: lastLayer[i].position - 1, parentIndex: -1 });
            }
         }
         lastLayer = currentLayer;
      }
      return calculatedMountain;
   }

   function cloneMountain(mountain) {
      var newMountain = [];
      for (var i = 0; i < mountain.length; i++) {
         var layer = [];
         for (var j = 0; j < mountain[i].length; j++) {
            layer.push({
               value: mountain[i][j].value,
               position: mountain[i][j].position,
               parentIndex: mountain[i][j].parentIndex,
               forcedParent: mountain[i][j].forcedParent
            });
         }
         newMountain.push(layer);
      }
      return newMountain;
   }

   function normalizeMatrix(matrix, len = 2) {
      if (!matrix || matrix.length === 0) {
         throw new Error("Matrix cannot be empty");
      }
      var maxLen = len;
      for (var i = 0; i < matrix.length; i++) {
         var col = matrix[i];
         if (!Array.isArray(col)) throw new Error("Each column must be an array");
         if (col.length > maxLen) maxLen = col.length;
      }
      var result = [];
      for (var i = 0; i < matrix.length; i++) {
         var col = matrix[i];
         var newCol = col.slice();
         while (newCol.length < maxLen) {
            newCol.push(0);
         }
         for (var j = 0; j < newCol.length; j++) {
            var v = newCol[j];
            if (!Number.isInteger(v) || v < 0) {
               throw new Error("Columns must contain only non-negative integers, found: " + v);
            }
         }
         result.push(newCol);
      }
      return result;
   }

   function lastPositiveRow(column) {
      for (var i = column.length - 1; i >= 0; i--) {
         if (column[i] > 0) return i + 1;
      }
      return 0;
   }


   function incrementPrefix(column, count) {
      if (count < 0 || count > column.length) {
         throw new Error("Illegal prefix length: " + count);
      }
      var result = column.slice();
      for (var i = 0; i < count; i++) {
         result[i] += 1;
      }
      return result;
   }

   function decrementPrefix(column, count) {
      if (count < 0 || count > column.length) {
         throw new Error("Illegal prefix length: " + count);
      }
      var result = column.slice();
      for (var i = 0; i < count; i++) {
         if (result[i] === 0) {
            throw new Error("The first " + count + " entries of column " + JSON.stringify(column) + " cannot all be decremented by one");
         }
         result[i] -= 1;
      }
      return result;
   }

   function zeroFromRow(column, row) {
      if (row < 1 || row > column.length + 1) {
         throw new Error("Illegal zeroing start row: " + row);
      }
      var result = column.slice();
      for (var i = row - 1; i < result.length; i++) {
         result[i] = 0;
      }
      return result;
   }

   function firstRowColumn(value, n) {
      var col = new Array(n);
      for (var i = 0; i < n; i++) col[i] = 0;
      col[0] = value;
      return col;
   }

   function arraysEqual(a, b) {
      if (a.length !== b.length) return false;
      for (var i = 0; i < a.length; i++) {
         if (a[i] !== b[i]) return false;
      }
      return true;
   }

   function compareArrays(a, b) {
      var len = Math.min(a.length, b.length);
      for (var i = 0; i < len; i++) {
         if (a[i] < b[i]) return -1;
         if (a[i] > b[i]) return 1;
      }
      if (a.length < b.length) return -1;
      if (a.length > b.length) return 1;
      return 0;
   }


   function createAncestorIndex(columns) {
      if (columns.length === 0) {
         throw new Error("Cannot build ancestor relation for empty matrix");
      }
      var n = columns[0].length;
      var colCount = columns.length;

      var parents = [];
      for (var r = 0; r <= n; r++) parents.push(new Array(colCount));
      var ancestors = [];
      for (var r = 0; r <= n; r++) ancestors.push(new Array(colCount));

      for (var c = 0; c < colCount; c++) {
         parents[0][c] = (c > 0) ? c - 1 : null;
         var set = new Set();
         for (var i = 0; i < c; i++) set.add(i);
         ancestors[0][c] = set;
      }

      for (var r = 1; r <= n; r++) {
         var rowIdx = r - 1;
         for (var c = 0; c < colCount; c++) {
            var candidates = Array.from(ancestors[r - 1][c]).sort(function (a, b) { return b - a; });
            var parent = null;
            for (var ci = 0; ci < candidates.length; ci++) {
               var cand = candidates[ci];
               if (columns[cand][rowIdx] < columns[c][rowIdx]) {
                  parent = cand;
                  break;
               }
            }
            parents[r][c] = parent;
            if (parent !== null) {
               var set2 = new Set(ancestors[r][parent]);
               set2.add(parent);
               ancestors[r][c] = set2;
            } else {
               ancestors[r][c] = new Set();
            }
         }
      }

      return {
         hasAncestorColumn: function (elementColumn, row, ancestorColumn) {
            if (elementColumn < 0 || elementColumn >= colCount) throw new RangeError();
            if (row < 0 || row > n) throw new RangeError();
            if (ancestorColumn < 0 || ancestorColumn >= colCount) throw new RangeError();
            return ancestors[row][elementColumn].has(ancestorColumn);
         },
         parentIsColumn: function (elementColumn, row, parentColumn) {
            if (elementColumn < 0 || elementColumn >= colCount) throw new RangeError();
            if (row < 0 || row > n) throw new RangeError();
            if (parentColumn < 0 || parentColumn >= colCount) throw new RangeError();
            return parents[row][elementColumn] === parentColumn;
         },
         ancestorChain: function (elementColumn, row) {
            if (row === 0) {
               var chain = [];
               for (var i = elementColumn - 1; i >= 0; i--) chain.push(i);
               return chain;
            }
            var chain2 = [];
            var current = parents[row][elementColumn];
            while (current !== null) {
               chain2.push(current);
               current = parents[row][current];
            }
            return chain2;
         }
      };
   }


   function DimY_to_DBMS(s) {
      var mountain;
      if (typeof s == "string") mountain = calcMountain(s);
      if (Array.isArray(s)) mountain = calcMountain(s.join(","));
      else mountain = cloneMountain(s);
      var matrix = [];
      for (var i = 0; i < mountain[0].length; i++) matrix.push([]);
      for (var h = 0; h < mountain.length; h++) {
         for (var i = 0; i < mountain[h].length; i++) {
            matrix[mountain[h][i].position + h][h] = mountain[h][i].parentIndex == -1 ? 0 : matrix[mountain[h][mountain[h][i].parentIndex].position + h][h] + 1;
         }
      }
      for (var i = 0; i < mountain[0].length; i++) {
         while (matrix[i][matrix[i].length - 1] === 0 && matrix[i].length > 1) matrix[i].pop();
      }
      return matrix
   }

   function trimZeroColumns(matrix) {
      if (!matrix.length) return [];

      const numCols = matrix[0].length;

      // Find column indices that contain at least one non-zero element
      let keepCols = [];
      for (let c = 0; c < numCols; c++) {
         if (matrix.some(row => row[c] !== 0)) {
            keepCols.push(c);
         }
      }

      // If ALL columns are all zeros, keep just the first column (min length = 1)
      if (keepCols.length === 0) {
         keepCols = [0];
      }

      // Filter out the zero-only columns from every row
      return matrix.map(row => keepCols.map(c => row[c]));
   }

   function BMStoPMS(matrix) {
      const newMatrix = [];
      if (matrix.length === 0) return newMatrix;
      const cols = matrix[0].length;
      // Track the last row index (1-based) seen at each depth, per column.
      const lastAtDepth = Array.from({ length: cols }, () => new Map());
      for (let i = 0; i < matrix.length; i++) {
         const newRow = [];
         for (let j = 0; j < cols; j++) {
            const depth = matrix[i][j];
            if (depth === 0) {
               newRow[j] = 0;
            } else {
               const parentIndex = lastAtDepth[j].get(depth - 1);
               if (parentIndex == null) {
                  throw new Error(
                     `Invalid BMS matrix at row ${i}, col ${j}`
                  );
               }
               newRow[j] = (i + 1) - parentIndex;
            }
            lastAtDepth[j].set(depth, i + 1);
         }
         newMatrix[i] = newRow;
      }
      return newMatrix;
   }

   function PMStoAMS(matrix) {
      return matrix.map((row, i) => row.map(v => v == 0 ? 0 : i + 1 - v));
   }

   function PMStoVZ(matrix) {
      const sequence = [];

      for (let i = 0; i < matrix.length; i++) {
         const row = [];

         for (let j = 0; j < matrix[i].length; j++) {
            let height = -1;
            let index = i + 1;

            while (index > 0) {
               height++;
               index -= (matrix[index - 1][j] || index);
            }

            row.push(height);
         }

         while (row.length > 1 && row.at(-1) === 0) row.pop();

         const v = row[0] + 1;
         sequence.push(v);

         for (let j = 1; j < row.length; j++) {
            sequence.push(v + row[j] + 1);
         }
      }

      return sequence.join(",");
   }

   function BMS_to_0Y(s) {
      var itemSeparatorRegex = /[\t ,]/g;
      var matrix = [];

      // 1. Parse or Normalise input into a standard 2D array
      if (typeof s === "string") {
         if (!/^(\(\d*(,\d*)*\))*$/.test(s)) return "";
         matrix = JSON.parse(
            "[" + s
               .replace(itemSeparatorRegex, ",")
               .replace(/\(/g, "[")
               .replace(/\)/g, "]")
               .replace(/\]\[/g, "],[") + "]"
         );
      } else if (Array.isArray(s)) {
         // Deep clone the array to prevent mutating the user's original data
         for (var i = 0; i < s.length; i++) {
            matrix.push(Array.isArray(s[i]) ? s[i].slice(0) : [s[i]]);
         }
      }

      // Edge case safety check
      if (!matrix.length || !matrix[0].length) return "";

      // 2. Pad uneven columns with 0s (same behavior as your original script)
      var X = matrix.length;
      var Y = 0;
      for (var i = 0; i < X; i++) {
         if (matrix[i].length > Y) Y = matrix[i].length;
      }
      for (var i = 0; i < X; i++) {
         while (matrix[i].length < Y) {
            matrix[i].push(0);
         }
      }

      // 3. Core Logic: Find parent nodes
      var parentMatrix = [];
      for (var y = 0; y < Y; y++) {
         for (var x = 0; x < X; x++) {
            var p;
            if (y === 0) {
               parentMatrix.push([]);
               for (p = x; p >= 0; p--) {
                  if (matrix[p][y] < matrix[x][y]) break;
               }
            } else {
               for (p = x; p >= 0; p = parentMatrix[p][y - 1]) {
                  if (matrix[p][y] < matrix[x][y]) break;
               }
            }
            parentMatrix[x][y] = p;
         }
      }

      // 4. Accumulate values to build the 0-Y sequence
      var a = [];
      for (var x = 0; x < X; x++) a.push(1);
      for (var y = Y - 1; y >= 0; y--) {
         for (var x = 0; x < X; x++) {
            a[x] = matrix[x][y] === 0 ? 1 : a[x] + a[parentMatrix[x][y]];
         }
      }

      return a.join(",");
   }

   /*
   Pipeline : BMS <-> PMS <-> AMS -> 0Y
                           -> Vulcaniz -> BMS
               BMS -> 0Y
                                         
   */

   // Display: convert ordinal to string
   function display(ord, mode) {
      let ordl = '' + ord;
      if (ordl == "Infinity") return "1,&omega;"
      if (ordl == "") return "0"
      if (cmp(ord, [1, 3]) < 0) {
         if (mode == "DBMS") return DimY_to_DBMS(ord).map(e => "(" + e.join(",") + ")").join("");
         if (mode == "BMS") return trimZeroColumns(dbmsToBms(DimY_to_DBMS(ord))).map(e => "(" + e.join(",") + ")").join("");
         if (mode == "PMS") return BMStoPMS(trimZeroColumns(dbmsToBms(DimY_to_DBMS(ord)))).map(e => "(" + e.join(",") + ")").join("");
         if (mode == "AMS") return PMStoAMS(BMStoPMS(trimZeroColumns(dbmsToBms(DimY_to_DBMS(ord))))).map(e => "(" + e.join(",") + ")").join("");
         if (mode == "Vulcaniz") return '' + PMStoVZ(PMStoAMS(BMStoPMS(trimZeroColumns(dbmsToBms(DimY_to_DBMS(ord))))))
         if (mode == "0Y") return '' + BMS_to_0Y(trimZeroColumns(dbmsToBms(DimY_to_DBMS(ord))));
      }

      if (mode == "2-Shifted OCF" && (cmp(ord, [1, 2, 4, 8, 13]) < 0)) return conv(normalizeMatrix(dbmsToBms(DimY_to_DBMS(ord)), 3))
      return ordl
   }

   function classifyBMSOrdinal(M) {
      if (!M.length) return "#808080";
      if (M == 'Limit') return "#808080";

      let j = M.findLastIndex(x => !x[0]);

      if (j != 0) {
         if (j == M.length - 1) return "#a00000";
         return "#ffA000";
      }

      if (M.length == 1) return "#a00000";

      j = M.slice(j).findLastIndex(x => x[0] == 1);

      const N = M.slice(j);

      if (cmp(N, [[1, 1, 1]]) >= 0) return "#404040";
      if (cmp(N, [[1, 1], [2, 2]]) >= 0) return "#000fff";
      if (cmp(N, [[1, 1], [2, 1], [3, 1]]) >= 0) return "#f00fff";
      if (cmp(N, [[1, 1], [2, 1]]) >= 0) return "#00FFF0";
      if (cmp(N, [[1, 1]]) >= 0) return "#00FF00";

      if (M.at(-1)[0] == M.length - 1) return "#ffffff";

      return "#ffff00";
   }

   // Classify ordinals for visualization styling
   function classifyOrdinal(ord) {
      if (!Array.isArray(ord) || ord.length === 0) return "#808080"; // Zero
      if (cmp(ord, [1, 3]) >= 0) {

         let count = 0;
         const len = ord.length;

         for (let i = 0; i < len; i++) {
            if (ord[i] == 1) count++;
         }

         if (count == 1) return "#ffff00"

         return (isSuccessor(ord)) ? "#a00000" : "#ffA000";
      } // Successor or Limit or Power of ω
      let arr = trimZeroColumns(dbmsToBms(DimY_to_DBMS(ord)))
      return classifyBMSOrdinal(arr);
   }

   const DisplayName = ["ω-Y", "DBMS", "BMS", "AMS", "PMS", "Vulcaniz", "0Y", "2-Shifted OCF"];

   const ordinalTypes = [
      ["Zero", "#808080"],
      ["Successor Ordinal", "#a00000"],
      ["Limit Ordinal", "#ffA000"],
      ["Power of ω", "#ffff00"],
      ["Tower of ω", "#ffffff"],
      ["ε Ordinal", "#00FF00"],
      ["Veblen Ordinal", "#00FFF0"],
      ["Feferman–Schütte Ordinal", "#f00fff"],
      ["Bachmann–Howard Ordinal", "#000fff"],
      ["Buchholz Ordinal", "#3f3f3f"]
   ];

   const Aliases = [
      //["First 67 Ordinal", fs([1,2], 66)], deprecated
      ["First Transfinite Ordinal", [1,2]],
      ["Small Cantor Ordinal", [1,2,4]],
      ["Veblen Ordinal", [1,2,4,6,7]],
      ["Feferman–Schütte Ordinal", [1,2,4,6,8]],
      ["First Γ fixed point", [1,2,4,6,8,6]],
      ["Ackermann Ordinal", [1,2,4,6,8,8]],
      ["Small Veblen Ordinal", [1,2,4,6,8,9]],
      ["Large Veblen Ordinal", [1,2,4,6,8,10]],
      ["Bachmann–Howard Ordinal", [1,2,4,7]],
      ["Buchholz's Ordinal", [1,2,4,8]],
      ["Takeuti-Feferman-Buchholz Ordinal", [1,2,4,8,11,15]],
      ["Bird's Ordinal", [1,2,4,8,12,14]],
      ["Extended Buchholz Ordinal", [1,2,4,8,12,15,9]],
      ["Limit of Battery Management System", [1,2,4,8,12,16,12,15,9]],
      ["Multivariable Buchholz Ordinal", [1,2,4,8,12,16,13]],
      ["Transfinitary Buchholz Ordinal", [1,2,4,8,12,16,15,9]],
      ["Small Mahlo Ordinal", [1,2,4,8,12,16,16]],
      ["Dimensional Buchholz Ordinal / Small Rathjen Ordinal / PTO(KPM)", [1,2,4,8,12,16,15,19]],
      // i cant fine the expression of rathjen ordinal so yeah skipped
      ["Large Rathjen Ordinal", [1,2,4,8,12,16,19,23]],
      ["Small Weakly Compact Ordinal", [1,2,4,8,12,16,20]],
      ["Small Stergent Ordinal", [1,2,4,8,13]],
      ["Small Dropping Ordinal", [1,2,4,8,14,15]],
      ["NDAN ordinal" , [1,2,4,8,14,19]],
      ["WDEN ordinal" , [1,2,4,8,14,19,25,31,37]],
      ["mWDEN ordinal" , [1,2,4,8,14,20,15]],
      ["2nd Back Gear ordinal", [1,2,4,8,14,21]],
      ["Omega Back ordinal / Small Bashicu ordinal", [1,2,4,8,15]],
      ["pDDN ordinal / Final limit of SAN" , [1,2,4,8,15,23]],
      ["Lim(TSS)", [1,2,4,8,16]],
      ["Lim(QSS)", [1,2,4,8,16,32]],
      ["Lim(BMS) / Small Hydra Ordinal", [1,3]],
      ["Limit of ω+1SS / (0)(1<sup>ω+1</sup>)" , [1,3,4,2,5,7,11]],
      ["Limit of ω*2SS / (0)(1<sup>ω2</sup>)" , [1,3,4,2,5,7,12]],
      //im so lazy to add more aliases so yeah
      ["&psi;<sub>0</sub>(&Omega;<sub>2</sub>) row BMS" , [1,3,4,2,5,8,9,11,14]],
      ["&psi;<sub>0</sub>(&Omega;<sub>&omega;</sub>) row BMS" , [1,3,4,2,5,8,9,11,15]],
      ["(&omega; row BMS) row BMS" , [1,3,4,2,5,8,9,12]],
      ["&Omega; row BMS" , [1,3,4,2,5,8,10]],
      ["Weak Spatialum" , [1,3,4,2,5,8,10,2,5,8,10]],
      ["Limit of Hassium" , [1,3,4,2,5,8,11]],
      ["Lim(1-Y) / Small Yukito Ordinal" , [1,4]],
      ["Lim(2-Y)" , [1,5]],
      ["Lim(3-Y)" , [1,6]],
      ["Lim(67-Y)" , [1,72]], //as always , there must be a easter egg on major systems
      ["Lim(&omega;-Y) / Large Yukito Ordinal" , [Infinity]]
   ];

   const config = { MaxIntervalDepth:0 };
   const title = "Hierachical Strong / &Omega;-Y sequence transfinite number line";

   return {
      fs,
      cmp,
      isSuccessor,
      display,
      classifyOrdinal,
      Zero,
      Limit,
      DisplayName,
      ordinalTypes,
      Aliases,
      config,
      DimY_to_DBMS,
      dbmsToBms,
      title
   };

})();
