/*
Notation : LPrSS
Limit : φ(0,ω)
*/

// You must have cmp,isSuccessor,fs and display(at least 1 mode). Some constant is required too
window.notation = (() => {

  function cmp(a, b) {
    if (a == "Limit" && b == "Limit") return 0;
    if (a == "Limit" && b != "Limit") return 1;
    if (a != "Limit" && b == "Limit") return -1;

    for (let i = 0; i < a.length; i++) {
      if (i >= b.length) return 1;
      if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
    }

    if (a.length < b.length) return -1;
    if (a.length > b.length) return 1;
    return 0;
  }

  function fs(a, n) {
    if (a == "Limit") return [0, n + 1]

    let getParent = i =>
      a.findLastIndex((v, j) => j < i && v < a[i]);

    let differences = a.map((v, i) => v - a[getParent(i)]);
    let parentDifference = differences[a.length - 1];
    let root = getParent(a.length - 1);

    if (parentDifference > 1) {
      while (differences[root] >= parentDifference) {
        let parent = getParent(root);
        if (parent === -1) break;
        root = parent;
      }
    }

    let out = [...a];
    let cutNode = out.pop();
    let increment = cutNode - a[root] - 1;
    let badPart = out.slice(root);

    for (let i = 1; i <= n; i++) {
      out.push(...badPart.map(v => v + increment * i));
    }

    return out;
  }

  function isSuccessor(array) {
    return array !== "Limit" && (array.length === 0 || array.at(-1) === 0);
  }

  let ZERO = [] // 0 = [] in LPrSS

  function display(ord, mode) {
    if (ord.length == 0) return '0' //you need a fallback for 0 and limit
    if (cmp(ord, 'Limit') == 0) return 'φ(0,ω)'
    if (mode == "normal")
      return ord.join(',')
  }

  function classifyOrdinal(ord) {
    if (ord.length == 0) return "#808080"

    let zerocount = 1
    let istower = true
    for (let i = 1; i < ord.length; i++) {
      if (ord[i] == 0) zerocount++;

      if (ord[i - 1] >= ord[i] || ord[1] != 1) istower = false;
    }

    if (istower) return "#ffffff"
    if (zerocount == 1) return "#ffff00"
    if (ord[ord.length - 1] == 0) return "#d40000"
    return "#ff8000"
  }

  //optionals : in future i'll add an ordinal finder, and this is nessessary to process user inputs
  //currently have no function yet
  function parse(str) {
    return str;
  }

  const Zero = [] //compulsory: how the first ordinal defined in your system defined? Should be an valid ordinal input for above functions
  const Limit = 'Limit' //compulsory: how the bounded ordinal in your system defined? Should be an valid ordinal input for above functions

  const DisplayName = ["normal"] //compulsory: add all your mode name here so the program can query and display them
  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#d40000"],
    ["Limit Ordinal", "#ff8000"],
    ["Power of ω", "#ffff00"],
    ["Tower of ω", "#ffffff"]
  ]; //optional: for legends gui purposes so user can know colour correspond to class of ordinal 

  const Aliases = [
    ["First Transfinite Ordinal", [0, 1]],
    ["Small Cantor Ordinal", [0, 2]],
    ["Cantor Ordinal", [0, 3]],
    ["Large Cantor Ordinal", [0, 4]],
    ["φ(0,ω)", 'Limit'],
  ] //optional: important ordinal will show up with a labels.

  const config = { types: "default" } //optional: currently have no function yet
  const title = 'LPrSS transfinite number line' //optional: title of the page

  return { fs, cmp, isSuccessor, display, classifyOrdinal, parse, Zero, Limit, DisplayName, ordinalTypes, Aliases, config, title };
})();

