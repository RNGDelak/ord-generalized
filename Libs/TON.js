window.notation = (() => {

  // --- Taranovsky's Notation Implementation ---

  var itemSeparatorRegex = /[\t ,]/g;

  var raise = (term, sys) => typeof term === 'number'
    ? term >= 0 && term < sys ? [-1, raise(term + 1, sys), -2] : term
    : [raise(term[0], sys), raise(term[1], sys), -2]

  , TON_compare = (x, y) => {
    var comp = (a, b) => {
      if (a.length) {
        if (b.length) {
          if (a[0] > b[0]) return 1
          else if (a[0] < b[0]) return -1
          else return comp(a.slice(1), b.slice(1))
        } else return 1
      } else if (b.length) {
        return -1
      } else return 0
    }
    var sysx, sysy
    , tmpx = ('' + x).split(',')
    , tmpy = ('' + y).split(',')
    sysx = Math.max(0, ...tmpx)
    sysy = Math.max(0, ...tmpy)
    if (sysx < Infinity && sysy < Infinity && (sysx > 0 || sysy > 0)) {
      x = raise(x, Math.max(sysx, sysy))
      y = raise(y, Math.max(sysx, sysy))
    }
    return comp(('' + x).split(',').map(e => +e), ('' + y).split(',').map(e => +e))
  }

  , TON_main_display = term => typeof term === 'number'
    ? term === Infinity ? 'Limit' : term < 0 ? '0' : 'Ω<sub>' + term + '</sub>'
    : TON_main_display(term[0]) + TON_main_display(term[1]) + 'C'

  , TON_limit = term => typeof term === 'number' ? term >= 0 : typeof term[1] !== 'number' || term[1] >= 0;

  var TON_FS = (() => {
    var data = {}
    , StdTrue = {}
    , mark = sys => {
      var res = [[-1, sys, -2], sys, -2]
      for (var i = sys - 1; i > 0; i--) res = [-1, res, -2]
      return res
    }
    , mark_FS = (sys, n) => {
      var i, res = sys - 1
      for (i = 0; i < n; ++i) res = [sys - 1, res, -2]
      for (i = sys - 1; i > 0; i--) res = [-1, res, -2]
      return res
    }
    , BuiltQ = (n, b, a, x) => n ? BuiltQ(n - 1, b, x, x) || (TON_compare(x, a) <= 0 && (typeof x === 'number' ? x >= 0 : BuiltQ(n, b, a, x[1]) && BuiltQ(n, b, a, x[0]))) : TON_compare(a, b) < 0
    , StandardQ = (n, a) => {
      var str = JSON.stringify(a)
      if (StdTrue[str]) {
        return StdTrue[str]
      } else if (typeof a === 'number' || (StandardQ(n, a[1]) && StandardQ(n, a[0]) && (typeof a[0] === 'number' || TON_compare(a[1], a[0][1]) <= 0) && BuiltQ(n, a, a[1], a[1]))) {
        return StdTrue[str] = true
      } else {
        return false
      }
    }
    , Copy = x => typeof x === 'number' ? x : [Copy(x[0]), Copy(x[1]), -2]
    , regress = x => typeof x === 'number' ? x : (x[0] === -1 && x[1] > 0 ? x[1] - 1 : [regress(x[0]), regress(x[1]), -2])
    , regress_repeated = x => {
      var x1
      while ('' + (x1 = regress(x)) != '' + x) x = x1
      return x1
    }
    , TON = function*(term, sys) {
      var flag = true, c1, c3
      , n = 0
      , beta = Copy(term)
      , len = ('' + term).split(',').length
      mainloop: while (true) {
        if (flag) {
          if (typeof beta === 'number' && beta >= 0) {
            beta = -1
          } else if (beta[1] === -1) {
            beta = beta[0]
            continue
          } else if (typeof beta[1] === 'number' && beta[1] >= 0) {
            beta[1] = -1
          } else if (beta[1][1] === -1) {
            beta = [[beta[0], beta[1][0], -2], sys, -2]
          } else if (typeof beta[1][1] === 'number' && beta[1][1] >= 0) {
            beta[1][1] = -1
          } else {
            c3 = beta
            c1 = beta[1][1]
            while (typeof c1[1] !== 'number') {
              c3 = c3[1]
              c1 = c1[1]
            }
            if (c1[1] === -1) {
              c3[1] = [[c3[1][0], c1[0], -2], sys, -2]
            } else {
              c1[1] = -1
            }
          }
        }
        flag = true
        while (('' + beta).split(',').length < len + n * 2) {
          if (!StandardQ(sys, beta)) continue mainloop
          if (typeof beta !== 'number') {
            c1 = beta
            while (typeof c1[1] !== 'number') c1 = c1[1]
            c1[1] = [c1[1], sys, -2]
          } else {
            beta = [beta, sys, -2]
          }
        }
        if (StandardQ(sys, beta)) {
          n = yield regress_repeated(beta)
          flag = false
        }
      }
    }
    return (term, n) => {
      var i, res
      , sys = typeof term === 'number' ? term : Math.max(0, ...(('' + term).split(',')))
      if (sys == Infinity) {
        res = [n, n, -2]
        for (i = 0; i < n; ++i) res = [-1, res, -2]
        return res
      }
      term = raise(term, sys)
      if (sys >= 1 && '' + term === '' + mark(sys)) return mark_FS(sys, n)
      var datakey = '' + term
      , dataterm = data[datakey]
      if (!dataterm) {
        dataterm = (data[datakey] = [])
        dataterm.gen = TON(term, sys)
        dataterm[0] = dataterm.gen.next().value
      }
      if (dataterm[n] !== undefined) return dataterm[n]
      return dataterm[n] = dataterm.gen.next(n).value
    }
  })();

  // --- Module Wrapper Integration ---

  function fs(ord, n) {
    return TON_FS(ord, n);
  }

  function cmp(a, b) {
    return TON_compare(a, b);
  }

  function isSuccessor(ord) {
    return !TON_limit(ord);
  }

  function display(ord, mode) {
    if (mode === 'normal') {
      return JSON.stringify(ord);
    }
    return TON_main_display(ord);
  }

  function classifyOrdinal(ord) {
    if (ord === Infinity) return "#ff8000";
    if (typeof ord === 'number') {
      if (ord < 0) return "#808080"; // Zero
      return "#d40000"; // Successor / Omega level
    }
    return "#ff8000"; // Limit ordinal
  }

  function parse(str) {
    str = str.trim();
    if (str === "" || str === "0") return -1;
    if (str === "Limit" || str === "Infinity") return Infinity;
    try {
      return JSON.parse(str);
    } catch (e) {
      return str;
    }
  }

  const Zero = -1;
  const Limit = Infinity;

  const DisplayName = ["normal", 'Taranovsky'];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#d40000"],
    ["Limit Ordinal", "#ff8000"]
  ];

  const Aliases = [
    ["Limit", Infinity]
  ];

  const config = {
    types: "custom",
    aspectratio: 0.5,
    mode: 1
  };

  const title = "Taranovsky's Ordinal Notation transfinite number line";

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