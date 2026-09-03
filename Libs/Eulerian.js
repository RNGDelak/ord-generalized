/*
Notation : Eulerian Sequence
Limit : Undetermined
*/

window.notation = (() => {

  // Required Constants
  const Zero = [];
  const Limit = "Limit";

  // Milestones
  const Aliases = [
    ["0", Zero],
    ["1", [0]],
    ["2", [0, 0]],
    ["ω", [0, 1]],
    ["ω^2", [0, 1, 2]],
    ["ω^ω", [0, 1, 1]],
    ["ε0", [0, 1, 1, 1]],
    ["Undetermined Limit", Limit]
  ];

  // Dynamic limit sequence generator
  function expandLimit(n) {
    return Array(n + 1)
      .fill(0)
      .map((v, i) => (2 << i) - i - 2);
  }

  function arrayToRow(array) {
    function parent(i) {
      return array.findLastIndex((x, j) => j < i && x < array[i]);
    }
    return array.map((v, i) => {
      let p = parent(i);
      if (p === -1) {
        return {
          value: v,
          position: i,
          parentIndex: -1,
          delta: 0
        };
      }
      let ancestors = [p];
      while (true) {
        let ancestor = parent(ancestors.at(-1));
        if (ancestor === -1) break;
        ancestors.push(ancestor);
      }
      let diff = v - array[ancestors[0]];
      let delta = diff - ancestors.length;
      let parentIndex = ancestors[0];
      return {
        value: v,
        position: i,
        parentIndex: parentIndex,
        delta: delta
      };
    });
  }

  function clampedValue(term) {
    return Math.max(0, term.value);
  }

  function calcMountain(row) {
    let mountain = [row];
    while (true) {
      let newRow = [];
      for (let i = 0; i < row.length; i++) {
        if (row[i].parentIndex !== -1) {
          let ancestry = [i];
          while (row[ancestry.at(-1)].parentIndex !== -1) {
            ancestry.push(row[ancestry.at(-1)].parentIndex);
          }
          newRow.push({
            value: row[i].delta,
            position: row[i].position,
            parentIndex: -1,
            delta: 0
          });
        }
      }
      for (let i = 0; i < newRow.length; i++) {
        let p = row.findIndex((x) => x.position >= newRow[i].position);
        while (p >= 0) {
          p = row[p].parentIndex;
          if (p < 0) break;
          let j = newRow.findIndex((x) => x.position >= row[p].position);
          if (
            j < 0 ||
            (j < newRow.length - 1 &&
              newRow[j].position + 1 !== newRow[j + 1].position)
          )
            break;
          if (clampedValue(newRow[j]) < clampedValue(newRow[i])) {
            newRow[i].parentIndex = j;
            let ancestors = [j];
            while (true) {
              let ancestor = newRow[ancestors.at(-1)].parentIndex;
              if (ancestor === -1) break;
              ancestors.push(ancestor);
            }
            let diff = clampedValue(newRow[i]) - clampedValue(newRow[j]);
            let delta = diff - ancestors.length;
            newRow[i].parentIndex = ancestors[0];
            newRow[i].delta = delta;
            break;
          }
        }
      }
      if (newRow.length === 0) break;
      mountain.push(newRow);
      let hasNextRow = false;
      for (let i = 0; i < row.length; i++) {
        if (row[i].delta > 0) {
          hasNextRow = true;
          break;
        }
      }
      if (!hasNextRow) break;
      row = newRow;
    }
    return mountain;
  }

  function cloneMountain(mountain) {
    return mountain.map((layer) =>
      layer.map((element) => {
        return {
          value: element.value,
          position: element.position,
          parentIndex: element.parentIndex,
          delta: element.delta
        };
      })
    );
  }

  function countAncestors(row, index) {
    let current = index === -1 ? row.length - 1 : index;
    let count = 0;
    while (true) {
      if (current < 0 || current >= row.length) break;
      current = row[current].parentIndex;
      if (current === -1) break;
      count++;
    }
    return count;
  }

  function expandMountain(mountain, n) {
    let result = cloneMountain(mountain);
    if (!mountain[0] || mountain[0].length === 0) return result;

    if (mountain[0].at(-1).parentIndex === -1) {
      result[0].pop();
    } else {
      let cutHeight = mountain.findLastIndex(
        (row) => row.length > 0 && row.at(-1).position === mountain[0].length - 1
      );
      for (let i = 0; i <= cutHeight; i++) {
        if (result[i]) result[i].pop();
      }
      while (result.length > 0 && result.at(-1).length === 0) result.pop();
      if (result.length === 0) return result;

      let cutLength = result[0].length;

      let badRootHeight = cutHeight - 1;
      let badRootRow = mountain[badRootHeight];
      if (!badRootRow || badRootRow.length === 0) return result;
      let badRootSeam = badRootRow[badRootRow.at(-1).parentIndex]?.position ?? 0;

      let worm = false;
      if (
        mountain[cutHeight] &&
        mountain[cutHeight].at(-1) &&
        mountain[cutHeight].at(-1).value === 0 &&
        badRootRow.at(-1).value > 1
      ) {
        worm = true;
      } else if (
        mountain[cutHeight] &&
        mountain[cutHeight].at(-1) &&
        mountain[cutHeight].at(-1).value < 0
      ) {
        let nextRow = mountain[cutHeight - 1];
        if (
          nextRow &&
          nextRow.at(-1) &&
          nextRow.at(-1).parentIndex !== -1 &&
          nextRow[nextRow.at(-1).parentIndex] &&
          nextRow.at(-1).value !== nextRow[nextRow.at(-1).parentIndex].value + 1
        ) {
          worm = true;
        }
      }

      if (worm) {
        let cutNode = badRootRow.at(-1).value;
        let parentIndex = badRootRow.at(-1).parentIndex;
        while (
          parentIndex !== -1 &&
          badRootRow[parentIndex] &&
          badRootRow[parentIndex].value >= cutNode - 1
        ) {
          parentIndex = badRootRow[parentIndex].parentIndex;
        }
        let row = result[badRootHeight];
        let diff = cutNode - 1 - (badRootRow[parentIndex]?.value ?? 0);
        for (let i = 1; i <= n; i++) {
          row.push({
            value: cutNode - 1 + diff * (i - 1),
            position: badRootRow.at(-1).position + i - 1,
            parentIndex: parentIndex + i - 1
          });
        }
        for (let k = badRootHeight - 1; k >= 0; k--) {
          let parent = mountain[k].at(-1).parentIndex;
          for (let i = result[k].length; i <= result[k + 1].length; i++) {
            let nextValObj = result[k + 1].find(
              (v) => v.position === result[k][i - 1].position + 1
            );
            let delta = nextValObj ? nextValObj.value : 0;
            let numAncestors = 1 + countAncestors(result[k], parent);
            result[k].push({
              value: (result[k][parent]?.value ?? 0) + delta + numAncestors,
              position: result[k][i - 1].position + 1,
              parentIndex: parent
            });
            parent = i;
          }
        }
        return calcMountain(arrayToRow(result[0].map((v) => v.value)));
      }

      let isAscending = false;
      let p = badRootRow.findIndex((x) => x.position === badRootSeam);
      while (badRootRow[p] && badRootRow[p].position >= badRootSeam) {
        if (badRootRow[p].position === badRootSeam) {
          isAscending = true;
          break;
        }
        p = badRootRow[p].parentIndex;
      }

      for (let i = 1; i <= n; i++) {
        for (let j = badRootSeam; j < cutLength; j++) {
          let seamHeight = result.findLastIndex((v) =>
            v.find((x) => x.position === j)
          );
          let isReplacingCut = j === badRootSeam;
          for (let k = seamHeight; k >= 0; k--) {
            let sourceParentIndex;
            if (isReplacingCut && (!isAscending || k < badRootHeight)) {
              sourceParentIndex = mountain[k].at(-1).parentIndex;
            } else {
              let match = mountain[k].find((x) => x.position >= j);
              sourceParentIndex = match ? match.parentIndex : -1;
            }
            let parentShifts = i - (isReplacingCut ? 1 : 0);
            let parentPosition = -1;
            if (mountain[k][sourceParentIndex]) {
              parentPosition = mountain[k][sourceParentIndex].position;
              if (parentPosition >= badRootSeam) {
                parentPosition += parentShifts * (cutLength - badRootSeam);
              }
            }
            let parentIndex = result[k].findIndex(
              (x) => x.position === parentPosition
            );
            let position = j + (cutLength - badRootSeam) * i;
            let base = mountain[k].find((x) => x.position === j);
            let value = base ? base.value : 0;
            if (parentIndex !== -1) {
              let nextValObj = result[k + 1]?.find((x) => x.position >= position);
              let delta = nextValObj ? nextValObj.value : 0;
              let numAncestors = countAncestors(result[k], parentIndex) + 1;
              value = result[k][parentIndex].value + delta + numAncestors;
            }
            result[k].push({
              value: value,
              position: position,
              parentIndex: parentIndex
            });
          }
        }
      }
    }
    while (result.length > 0 && result.at(-1).length === 0) result.pop();

    return result;
  }

  // Expansion wrapper for sequence arrays
  function expand(a, n) {
    if (!Array.isArray(a) || a.length === 0) return [];
    let mountain = expandMountain(calcMountain(arrayToRow(a)), n);
    if (!mountain || mountain.length === 0 || !mountain[0]) return [];
    return mountain[0].map((v) => v.value);
  }

  // Fundamental Sequence
  function fs(ord, n) {
    if (ord === Limit) return expandLimit(n);
    if (!Array.isArray(ord) || ord.length === 0) return [];
    return expand(ord, n);
  }

  // Lexicographical sequence rank comparison
  function cmp(a, b) {
    if (a === Limit && b === Limit) return 0;
    if (a === Limit) return 1;
    if (b === Limit) return -1;

    for (let i = 0; i < a.length; i++) {
      if (i >= b.length) return 1;
      if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
    }
    if (a.length < b.length) return -1;
    if (a.length > b.length) return 1;
    return 0;
  }

  // Check if ordinal is a successor
  function isSuccessor(array) {
    if (array === Limit) return false;
    if (!Array.isArray(array) || array.length === 0) return false;
    return array.at(-1) === 0;
  }

  // Format array sequence string
  function pretty(array) {
    if (array === Limit) return "Limit";
    if (!Array.isArray(array) || array.length === 0) return "0";
    return array.join(",");
  }

  // Display modes handler
  function display(ord, mode) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";
    if (mode === "raw") {
      return JSON.stringify(ord);
    }
    if (mode === "pretty") {
      return pretty(ord);
    }
  }

  // Classify ordinals for visual styling
  function classifyOrdinal(ord) {
    if (ord === Limit) return "#ffffff";
    if (!Array.isArray(ord) || ord.length === 0) return "#808080";
    if (isSuccessor(ord)) return "#d40000";
    if (ord.length === 1) return "#ffd000"; // Single element principal term
    return "#ff8000"; // Limit ordinal
  }

  // Parser supporting alias lookup, raw arrays, and address sequences
  function parse(str) {
    str = String(str).trim();
    if (str === "" || str === "0") return Zero;
    if (str.toLowerCase() === "limit" || str.includes("Undetermined")) return Limit;

    // 1. Alias lookup
    for (const [aliasName, aliasVal] of Aliases) {
      if (str === aliasName) return aliasVal;
    }

    // 2. Fundamental Sequence address path: e.g. "path: 2,6,2,8,1"
    if (str.startsWith("path:")) {
      const numbers = str.replace("path:", "").split(",").map(Number);
      let current = Limit;
      for (let i = 0; i < numbers.length; i++) {
        if (isSuccessor(current)) break;
        current = fs(current, numbers[i]);
      }
      return current;
    }

    // 3. Raw comma-separated array parser
    const numbers = str.match(/-?\d+/g);
    if (numbers) {
      return numbers.map(Number);
    }

    return Zero;
  }

  const DisplayName = ["raw", "pretty"];

  const ordinalTypes = [
    ["Zero", "#808080"],
    ["Successor Ordinal", "#d40000"],
    ["Limit Ordinal", "#ff8000"],
    ["Principal Ordinal", "#ffd000"]
  ];

  const config = { modes: [{ mode: 1, target: "both" }] };
  const title = "Eulerian Sequence Transfinite Number Line";

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
