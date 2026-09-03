/*
Notation : Y Sequence
Limit : w-Y(1,4)
*/

window.notation = (() => {

  // Required Constants
  const Zero = [];
  const Limit = "Limit";

  // Milestones
  const Aliases = [
    ["w-Y(1,4)", Limit]
  ];

  // Dynamic limit sequence generator for w-Y(1,4)
  function getLimit(num) {
    return [1, 2+ num];
  }

  // Naruyoko's Y sequence Fundamental Sequence parser engine
  const itemSeparatorRegex = /[\t ,]/g;

  function parseSequenceElement(s, i) {
    s = String(s);
    if (s.indexOf("v") === -1 || !isFinite(Number(s.substring(s.indexOf("v") + 1)))) {
      const numval = Number(s);
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
    let lastLayer;
    if (typeof s === "string") {
      lastLayer = s.split(itemSeparatorRegex).map(parseSequenceElement);
    } else if (Array.isArray(s) && (s.length === 0 || typeof s[0] === "number")) {
      lastLayer = s.map((val, idx) => parseSequenceElement(val, idx));
    } else {
      lastLayer = s;
    }

    const calculatedMountain = [lastLayer];

    while (true) {
      let hasNextLayer = false;
      for (let i = 0; i < lastLayer.length; i++) {
        if (lastLayer[i].forcedParent) {
          if (lastLayer[i].parentIndex !== -1) hasNextLayer = true;
          continue;
        }

        let p;
        if (calculatedMountain.length === 1) {
          p = lastLayer[i].position + 1;
        } else {
          p = 0;
          while (
            p < calculatedMountain[calculatedMountain.length - 2].length &&
            calculatedMountain[calculatedMountain.length - 2][p].position < lastLayer[i].position + 1
          ) {
            p++;
          }
        }

        while (true) {
          if (p < 0) break;
          let j;
          if (calculatedMountain.length === 1) {
            p--;
            j = p - 1;
          } else {
            if (p >= calculatedMountain[calculatedMountain.length - 2].length) break;
            p = calculatedMountain[calculatedMountain.length - 2][p].parentIndex;
            if (p < 0) break;
            j = 0;
            while (
              j < lastLayer.length &&
              lastLayer[j].position < calculatedMountain[calculatedMountain.length - 2][p].position - 1
            ) {
              j++;
            }
          }

          if (j < 0 || (j < lastLayer.length - 1 && lastLayer[j].position + 1 !== lastLayer[j + 1].position)) {
            break;
          }

          if (j < lastLayer.length && lastLayer[j].value < lastLayer[i].value) {
            lastLayer[i].parentIndex = j;
            hasNextLayer = true;
            break;
          }
        }
      }

      if (!hasNextLayer) break;

      const currentLayer = [];
      calculatedMountain.push(currentLayer);
      for (let i = 0; i < lastLayer.length; i++) {
        if (lastLayer[i].parentIndex !== -1) {
          currentLayer.push({
            value: lastLayer[i].value - lastLayer[lastLayer[i].parentIndex].value,
            position: lastLayer[i].position - 1,
            parentIndex: -1
          });
        }
      }
      lastLayer = currentLayer;
    }

    return calculatedMountain;
  }

  function calcDiagonal(mountain) {
    const diagonal = [];
    const diagonalTree = [];

    for (let i = 0; i < mountain[0].length; i++) {
      for (let j = mountain.length - 1; j >= 0; j--) {
        let k = 0;
        while (mountain[j][k] && mountain[j][k].position + j < i) k++;
        if (!mountain[j][k] || mountain[j][k].position + j !== i) continue;

        let height = j;
        let lastIndex = k;

        while (true) {
          if (height === 0) {
            lastIndex = mountain[height][lastIndex].parentIndex;
          } else {
            let l = 0;
            while (
              l < mountain[height - 1].length &&
              mountain[height - 1][l].position !== mountain[height][lastIndex].position + 1
            ) {
              l++;
            }

            if (l >= mountain[height - 1].length) break;
            l = mountain[height - 1][l].parentIndex;

            let m = 0;
            while (
              m < mountain[height].length &&
              mountain[height][m].position < mountain[height - 1][l].position - 1
            ) {
              m++;
            }

            if (m < mountain[height].length && mountain[height][m].position === mountain[height - 1][l].position - 1) {
              lastIndex = m;
            } else {
              height--;
              lastIndex = l;
            }
          }

          if (lastIndex < 0 || !mountain[height][lastIndex] || mountain[height][lastIndex].parentIndex === -1) {
            diagonal.push(mountain[j][k].value);
            diagonalTree.push(
              (lastIndex >= 0 && mountain[height][lastIndex] ? mountain[height][lastIndex].position : -1) + height
            );
            break;
          }
        }
        break;
      }
    }

    const pw = [];
    for (let i = 0; i < diagonal.length; i++) {
      let p = -1;
      for (let j = i - 1; j >= 0; j--) {
        if (diagonal[j] < diagonal[i]) {
          p = j;
          break;
        }
      }
      pw.push(p);
    }

    const r = [];
    for (let i = 0; i < diagonal.length; i++) {
      let p = i;
      while (true) {
        p = diagonalTree[p];
        if (p < 0 || diagonal[p] < diagonal[i]) break;
      }
      if (p === pw[i]) r.push(diagonal[i]);
      else r.push(diagonal[i] + "v" + p);
    }

    return r.join(",");
  }

  function cloneMountain(mountain) {
    const newMountain = [];
    for (let i = 0; i < mountain.length; i++) {
      const layer = [];
      for (let j = 0; j < mountain[i].length; j++) {
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

  function getBadRoot(s) {
    let mountain;
    if (typeof s === "string" || (Array.isArray(s) && typeof s[0] === "number")) mountain = calcMountain(s);
    else mountain = cloneMountain(s);

    const diagonal = calcMountain(calcDiagonal(mountain));
    if (diagonal[0][diagonal[0].length - 1].value !== 1) {
      return getBadRoot(diagonal);
    } else {
      for (let i = mountain.length - 1; i >= 0; i--) {
        if (mountain[i][mountain[i].length - 1].position + i === mountain[0].length - 1) {
          return (
            mountain[i - 1][mountain[i - 1][mountain[i - 1].length - 1].parentIndex].position + i - 1
          );
        }
      }
    }
  }

  function expand(s, n, stringify) {
    let mountain;
    if (typeof s === "string" || (Array.isArray(s) && typeof s[0] === "number")) mountain = calcMountain(s);
    else mountain = cloneMountain(s);

    if (mountain[0].length === 0) return stringify ? "" : [];

    let result = cloneMountain(mountain);
    if (mountain[0][mountain[0].length - 1].parentIndex === -1) {
      result[0].pop();
    } else {
      result = cloneMountain(mountain);
      let cutHeight = mountain.length - 1;
      while (mountain[cutHeight][mountain[cutHeight].length - 1].position + cutHeight !== mountain[0].length - 1) {
        cutHeight--;
      }
      const actualCutHeight = cutHeight;
      const badRootSeam = getBadRoot(mountain);
      let badRootHeight;
      const diagonal = calcMountain(calcDiagonal(mountain));
      let newDiagonal;
      const yamakazi = diagonal[0][diagonal[0].length - 1].value === 1;

      if (yamakazi) {
        newDiagonal = cloneMountain(diagonal);
        newDiagonal[0].pop();
        for (let i = 0; i < n; i++) {
          for (let j = badRootSeam; j < mountain[0].length - 1; j++) {
            newDiagonal[0].push(newDiagonal[0][j]);
          }
        }
        cutHeight--;
        badRootHeight = cutHeight;
      } else {
        newDiagonal = expand(diagonal, n, false);
        badRootHeight = mountain.length - 1;
        while (true) {
          let i = 0;
          while (
            mountain[badRootHeight][i] &&
            mountain[badRootHeight][i].position + badRootHeight < badRootSeam
          ) {
            i++;
          }
          if (
            mountain[badRootHeight][i] &&
            mountain[badRootHeight][i].position + badRootHeight === badRootSeam
          ) {
            break;
          }
          badRootHeight--;
        }
      }

      for (let i = 0; i <= actualCutHeight; i++) result[i].pop();
      if (!result[result.length - 1].length) result.pop();

      const afterCutHeight = result.length;
      const afterCutLength = result[0].length;

      for (let i = 1; i <= n; i++) {
        for (let j = badRootSeam; j < afterCutLength; j++) {
          let isAscending;
          let p = 0;
          while (
            p < mountain[badRootHeight].length &&
            mountain[badRootHeight][p].position + badRootHeight < j
          ) {
            p++;
          }

          if (
            p < mountain[badRootHeight].length &&
            mountain[badRootHeight][p].position + badRootHeight === j
          ) {
            while (true) {
              if (
                !mountain[badRootHeight][p] ||
                mountain[badRootHeight][p].position + badRootHeight < badRootSeam
              ) {
                isAscending = false;
                break;
              }
              if (mountain[badRootHeight][p].position + badRootHeight === badRootSeam) {
                isAscending = true;
                break;
              }
              p = mountain[badRootHeight][p].parentIndex;
            }
          } else {
            isAscending = false;
          }

          let seamHeight = afterCutHeight - 1;
          while (true) {
            let l = 0;
            while (
              mountain[seamHeight] &&
              mountain[seamHeight][l] &&
              mountain[seamHeight][l].position + seamHeight < j
            ) {
              l++;
            }
            if (
              mountain[seamHeight] &&
              mountain[seamHeight][l] &&
              mountain[seamHeight][l].position + seamHeight === j
            ) {
              break;
            }
            seamHeight--;
          }
          seamHeight++;

          const isReplacingCut = j === badRootSeam;

          if (isAscending) {
            for (let k = 0; k < seamHeight + (cutHeight - badRootHeight) * i; k++) {
              if (!result[k]) result.push([]);

              let sy;
              if (k < badRootHeight) {
                sy = k;
              } else if (k <= badRootHeight + (cutHeight - badRootHeight) * (i - isReplacingCut)) {
                sy = badRootHeight;
              } else if (isReplacingCut && k <= badRootHeight + (cutHeight - badRootHeight) * i) {
                sy = k - (cutHeight - badRootHeight) * (i - 1);
              } else {
                sy = k - (cutHeight - badRootHeight) * i;
              }

              let sx;
              if ((!yamakazi || k < badRootHeight) && isReplacingCut) {
                sx = mountain[sy].length - 1;
              } else {
                sx = 0;
                while (sx < mountain[sy].length && mountain[sy][sx].position + sy < j) sx++;
              }

              const sourceParentIndex = mountain[sy][sx] ? mountain[sy][sx].parentIndex : -1;
              const parentShifts = i - isReplacingCut;
              const parentPosition =
                mountain[sy][sourceParentIndex]
                  ? mountain[sy][sourceParentIndex].position +
                    parentShifts *
                      (afterCutLength - badRootSeam) *
                      (mountain[sy][sourceParentIndex].position + sy >= badRootSeam) -
                    (k - sy)
                  : -1;

              let parentIndex = 0;
              while (result[k][parentIndex] && result[k][parentIndex].position < parentPosition) {
                parentIndex++;
              }
              if (!result[k][parentIndex] || result[k][parentIndex].position !== parentPosition) {
                parentIndex = -1;
              }

              result[k].push({
                value:
                  parentIndex === -1
                    ? newDiagonal[0][j + (afterCutLength - badRootSeam) * i].value
                    : NaN,
                position: j + (afterCutLength - badRootSeam) * i - k,
                parentIndex: parentIndex,
                forcedParent: mountain[sy][sx] ? mountain[sy][sx].forcedParent : false
              });
            }
          } else {
            for (let k = 0; k < seamHeight; k++) {
              if (!result[k]) result.push([]);
              const sy = k;
              let sx;
              if (isReplacingCut) {
                sx = mountain[sy].length - 1;
              } else {
                sx = 0;
                while (sx < mountain[sy].length && mountain[sy][sx].position + sy < j) sx++;
              }

              const sourceParentIndex = mountain[sy][sx] ? mountain[sy][sx].parentIndex : -1;
              const parentShifts = i - isReplacingCut;
              const parentPosition =
                mountain[sy][sourceParentIndex]
                  ? mountain[sy][sourceParentIndex].position +
                    parentShifts *
                      (afterCutLength - badRootSeam) *
                      (mountain[sy][sourceParentIndex].position + sy >= badRootSeam) -
                    (k - sy)
                  : -1;

              let parentIndex = 0;
              while (result[k][parentIndex] && result[k][parentIndex].position < parentPosition) {
                parentIndex++;
              }
              if (!result[k][parentIndex] || result[k][parentIndex].position !== parentPosition) {
                parentIndex = -1;
              }

              result[k].push({
                value:
                  parentIndex === -1
                    ? newDiagonal[0][j + (afterCutLength - badRootSeam) * i].value
                    : NaN,
                position: j + (afterCutLength - badRootSeam) * i - k,
                parentIndex: parentIndex,
                forcedParent: mountain[sy][sx] ? mountain[sy][sx].forcedParent : false
              });
            }
          }
        }
      }
    }

    for (let i = result.length - 1; i >= 0; i--) {
      if (!result[i].length) {
        result.pop();
        continue;
      }
      for (let j = 0; j < result[i].length; j++) {
        if (!isNaN(result[i][j].value)) continue;
        let k = 0;
        while (result[i + 1][k] && result[i + 1][k].position < result[i][j].position - 1) k++;
        if (!result[i + 1][k] || result[i + 1][k].position !== result[i][j].position - 1) {
          result[i][j].value = 0; // standard fallback
        } else {
          result[i][j].value =
            (result[i][j].parentIndex !== -1 ? result[i][result[i][j].parentIndex].value : 0) +
            result[i + 1][k].value;
        }
      }
    }

    if (stringify) {
      const rr = [];
      for (let i = 0; result[0] && i < result[0].length; i++) {
        rr.push(
          result[0][i].value + (result[0][i].forcedParent ? "v" + result[0][i].parentIndex : "")
        );
      }
      return rr.join(",");
    }

    return result;
  }

  // Fundamental Sequence implementation
  function fs(ord, n) {
    if (ord === Limit) return getLimit(n);
    if (!Array.isArray(ord) || ord.length === 0) return [];
    
    const seqStr = ord.join(",");
    const expandedStr = expand(seqStr, n, true);
    if (!expandedStr) return [];
    return expandedStr.split(",").map((e) => (e.includes("v") ? e : Number(e)));
  }

  // Lexicographical sequence ordering comparison
  function cmp(a, b) {
    if (a === Limit && b === Limit) return 0;
    if (a === Limit) return 1;
    if (b === Limit) return -1;

    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) {
      const valA = typeof a[i] === "number" ? a[i] : Number(String(a[i]).split("v")[0]);
      const valB = typeof b[i] === "number" ? b[i] : Number(String(b[i]).split("v")[0]);
      if (valA !== valB) return valA < valB ? -1 : 1;
    }

    if (a.length < b.length) return -1;
    if (a.length > b.length) return 1;
    return 0;
  }

  // Successor ordinal check
  function isSuccessor(ord) {
    if (ord === Limit || !Array.isArray(ord) || ord.length === 0) return false;
    const last = ord[ord.length - 1];
    const val = typeof last === "number" ? last : Number(String(last).split("v")[0]);
    return val === 0;
  }

  // Formatter for Y sequence
  function pretty(ord) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";
    return `(${ord.join(",")})`;
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
    if (ord.length === 1) return "#ffd000";
    return "#ff8000";
  }

  // Parser supporting alias lookup, raw sequence strings, and address paths
  function parse(str) {
    str = String(str).trim();
    if (str === "" || str === "0") return Zero;
    if (str.toLowerCase() === "limit" || str.includes("w-Y(1,4)")) return Limit;

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

    // 3. Parentheses enclosed comma sequence e.g. "(0,1,2)"
    let clean = str;
    if (clean.startsWith("(") && clean.endsWith(")")) {
      clean = clean.slice(1, -1);
    }

    const items = clean.split(itemSeparatorRegex).filter((x) => x !== "");
    if (items.length > 0) {
      return items.map((e) => (e.includes("v") ? e : Number(e)));
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

  const config = { modes: [{ mode: 1, target: "both" }] ,MaxIntervalDepth:1};
  const title = "1-Y Sequence Transfinite Number Line";

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
