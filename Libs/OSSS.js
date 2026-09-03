/*
Notation : Orchestral Superiour Sequence System
Limit : ψ(B(ω))
*/

window.notation = (() => {

  // Required Constants
  const Zero = [];
  const Limit = "Limit";

  // Milestones
  const Aliases = [
    ["0", Zero],
    ["1", [[0]]],
    ["ω", [[0], [0], [1]]],
    ["ω^ω", [[0], [0], [1], [0], [2]]],
    ["ε0", [[0], [0], [0], [1]]],
    ["φ(ω,0)", [[0], [0], [0], [1], [0], [1], [2], [0], [3]]],
    ["ψ(Ω2)", [[0], [0], [0], [1], [0], [0], [2]]],
    ["ψ(Ωω)", [[0], [0], [0], [0], [1]]],
    ["ψ(B(ω))", Limit]
  ];

  // System Utility Functions
  function blockListToMatrix(a) {
    return a.map((v) => {
      const length = Math.max(0, ...v);
      return [...Array(length + 1)]
        .map((_, n) => (v.includes(n) ? null : length - n))
        .filter((n) => n != null);
    });
  }

  function matrixToBlockList(m, shortRows) {
    return m.map((v, i) => {
      if (v.length === 0 && i === 0) return [0];
      const length = shortRows ? Math.max(0, ...v) + 1 : i;
      return [...Array(length + 1)]
        .map((_, n) => (v.includes(length - n) ? null : n))
        .filter((n) => n != null);
    });
  }

  function isBlockList(a) {
    return Array.isArray(a) && a.length > 0 && Array.isArray(a[0]);
  }

  function blockListToGrid(blockList) {
    return blockList.map((row) => {
      const length = Math.max(0, ...row);
      return [...Array(length + 1)].map((_, n) => (row.includes(n) ? 0 : length - n));
    });
  }

  function getMatrixAncestorRows(matrix) {
    const ancestorRows = [matrix.length - 1];
    while (true) {
      const a = ancestorRows.at(-1);
      const row = matrix[a];
      const i = matrix.findLastIndex((parent, idx) => {
        if (idx >= a) return false;
        for (let j = 0; j < row.length; j++) {
          if (parent[j] >= row[j]) return false;
        }
        return true;
      });
      if (i < 0) break;
      ancestorRows.push(i);
    }
    return ancestorRows;
  }

  function getShadedRegion(blockList, shortRows) {
    const matrix = blockListToMatrix(blockList);
    blockList = matrixToBlockList(matrix, false);
    const grid = blockListToGrid(blockList);
    const seen = grid.map((row) => row.map(() => false));
    const y = grid.length - 1;
    const x = grid[y].findLastIndex((val) => val > 0);
    if (x === -1) return [seen, []];
    const v = grid[y][x];
    const queue = [[y, x]];
    const ancestorRows = getMatrixAncestorRows(matrix);
    const getPreviousRow = (r) => {
      let i = ancestorRows.indexOf(r);
      if (i === ancestorRows.length - 1) return null;
      return ancestorRows[i + 1];
    };
    while (queue.length > 0) {
      const [r, c] = queue.pop();
      if (seen[r][c]) continue;
      seen[r][c] = true;
      const r2 = getPreviousRow(r);
      if (r2 !== null && r2 !== undefined) {
        const c2 = c + r2 - r + 1;
        if (grid[r2][c2 - 1] >= v) queue.push([r2, c2 - 1]);
        if (grid[r2][c2] >= v) queue.push([r2, c2]);
        if (grid[r2][c2] > 0 && grid[r][c2 + 1] && grid[r2][c2 + 1] > 0) queue.push([r2, c2]);
      }
      if (grid[r][c - 1] >= v) queue.push([r, c - 1]);
    }
    const r = seen.findIndex((row) => row.includes(true));
    const c = seen[r].indexOf(true);
    const ancestor = ancestorRows.find((i) => i < r);
    const root = [ancestor, c - (r - ancestor)];
    if (shortRows) {
      for (let rowIdx = 0; rowIdx < grid.length; rowIdx++) {
        seen[rowIdx] = seen[rowIdx].slice(grid[rowIdx].length - 2 - matrix[rowIdx].find((val) => val > 0));
      }
      if (matrix[root[0]].find((val) => val > 0)) {
        root[1] -= grid[root[0]].length - 2 - matrix[root[0]].find((val) => val > 0);
      }
    }
    return [seen, root];
  }

  function matrixToPointerMatrix(a) {
    const pointerMatrix = [];
    for (let i = 0; i < a.length; i++) {
      pointerMatrix[i] = [];
      for (let j = 0; j < a[i].length; j++) {
        pointerMatrix[i][j] = { distance: 0, delta: 0 };
      }
      let parentIndex = a.findLastIndex((v, j) => j < i && (v[0] || 0) < a[i][0]);
      if (parentIndex !== -1) {
        pointerMatrix[i][0] = { distance: i - parentIndex, delta: a[i][0] - (a[parentIndex][0] || 0) };
      }
    }
    for (let i = 0; i < a.length; i++) {
      if (pointerMatrix[i].length === 0 || pointerMatrix[i][0].delta === 0) continue;
      for (let j = 1; j < a[i].length; j++) {
        let parentIndex = i;
        while (true) {
          if ((a[parentIndex][j] || 0) < a[i][j]) {
            break;
          } else {
            parentIndex -= pointerMatrix[parentIndex][j - 1].distance;
          }
        }
        pointerMatrix[i][j].distance = i - parentIndex;
        pointerMatrix[i][j].delta = a[i][j] - (a[parentIndex][j] || 0);
      }
    }
    return pointerMatrix;
  }

  function pointerMatrixToMatrix(pm) {
    const matrix = [];
    for (let i = 0; i < pm.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < pm[i].length; j++) {
        matrix[i][j] = pm[i][j].delta === 0 ? 0 : (matrix[i - pm[i][j].distance][j] || 0) + pm[i][j].delta;
      }
    }
    return matrix;
  }

  function deepcopy(pm) {
    return pm.map((v) => {
      let a = v.map((x) => {
        return { distance: x.distance, delta: x.delta };
      });
      if (v.ascending) a.ascending = v.ascending;
      return a;
    });
  }

  // Dynamic Limit Generator
  function getLimit(num) {
    const res = [];
    for (let i = 0; i < num + 2; i++) {
      res.push([0]);
    }
    res.push([1]);
    return res;
  }

  // Core Expansion Function
  function expand(blockList, shortRows, n) {
    if (!Array.isArray(blockList) || blockList.length === 0) return [];
    
    // Convert to block list standard if passed as numerical matrix
    let inputBlockList = blockList;
    if (!isBlockList(blockList)) {
      inputBlockList = matrixToBlockList(blockList, shortRows);
    }

    const matrix = blockListToMatrix(inputBlockList);
    const workBlockList = matrixToBlockList(matrix, true);
    
    if (matrix.at(-1).length === 0) {
      workBlockList.pop();
      return workBlockList;
    }

    const shadedRes = getShadedRegion(workBlockList, true);
    const rootIndex = shadedRes[1][0];
    const rootColumn = shadedRes[1][1];

    if (n === 0) {
      return matrixToBlockList(matrix.slice(0, rootIndex), shortRows);
    }

    const pm = matrixToPointerMatrix(matrix);
    const out = deepcopy(pm);
    let tail = out.slice(rootIndex + 1);

    let cutNode = tail.at(-1);
    const rootNode = out[rootIndex];
    const lastColumnIndex = cutNode.length - 1;
    const lastColumnDistance = cutNode[lastColumnIndex].distance;
    const parentNode = out[out.length - 1 - lastColumnDistance];

    if (cutNode.length > parentNode.length) {
      cutNode.pop();
      if (rootNode !== parentNode && rootNode.length > 0) cutNode.push(rootNode.at(-1));
    } else {
      for (let i = lastColumnIndex; i < parentNode.length; i++) {
        const v = { distance: parentNode[i].distance + lastColumnDistance, delta: parentNode[i].delta };
        if (i < cutNode.length) {
          cutNode[i] = v;
        } else {
          cutNode.push(v);
        }
      }
    }

    if (rootNode !== parentNode) {
      rootNode.ascending = true;
      cutNode.ascending = true;
      for (let i = rootIndex + 1; i < out.length; i++) {
        const parentIndex = i - out[i].at(-1).distance;
        const canAscend = out[i].length > rootNode.length;
        if (canAscend && out[parentIndex] && out[parentIndex].ascending) out[i].ascending = true;
      }
      const grid = blockListToGrid(workBlockList);
      const cutNodeIndex = grid.at(-1).findLastIndex((v) => v > 0);
      const badPartHeight = grid.length - rootIndex;
      const badPartWidth = cutNodeIndex - rootColumn;
      let rootRowColumns = 0;
      for (let c = 0; c < grid[rootIndex].length; c++) {
        if (grid[rootIndex][c] !== 0) rootRowColumns++;
      }
      const ancestorRows = getMatrixAncestorRows(matrix);
      const noAscend = [];
      for (let r = rootIndex; r < rootIndex + badPartHeight; r++) {
        if (ancestorRows.includes(r)) continue;
        let columns = 0;
        for (let c = 0; c < grid[r].length; c++) {
          if (grid[r][c] !== 0) columns++;
        }
        if (columns <= rootRowColumns) noAscend.push(r);
      }
      for (let c = rootColumn; c < grid[rootIndex].length; c++) {
        grid.at(-1)[cutNodeIndex + c - rootColumn] = grid[rootIndex][c];
      }
      const rightPadding = grid.at(-1).length - cutNodeIndex - (grid[rootIndex].length - rootColumn);
      const unascendRows = [];
      for (let i = 1; i < n; i++) {
        const y = grid.length - 1;
        const x = cutNodeIndex + badPartWidth * (i - 1);
        for (let dy = 0; dy < badPartHeight; dy++) {
          const r = rootIndex + dy;
          const r2 = y + dy;
          if (r2 === grid.length) {
            grid.push([]);
            for (let c = 0; c < x; c++) {
              grid[r2][c] = grid[r2 - 1][c] !== 0 ? grid[r2 - 1][c] + 1 : 0;
            }
            if (noAscend.includes(r)) unascendRows.push([r2, r]);
          }
          for (let c = rootColumn; c < grid[r].length; c++) {
            const dx = c - rootColumn;
            const c2 = x + dx;
            grid[r2][c2] = grid[r][c];
          }
          const desiredLength = x + (grid[r].length - rootColumn) + rightPadding * i;
          for (let c = grid[r2].length; c < desiredLength; c++) {
            grid[r2].push(0);
          }
        }
      }
      for (let [r, originalRow] of unascendRows) {
        const nonzeros = [];
        let originalNonzeros = 0;
        for (let c = 0; c < grid[originalRow].length; c++) {
          if (grid[originalRow][c] !== 0) originalNonzeros++;
        }
        for (let c = 0; c < grid[r].length; c++) {
          if (grid[r][c] !== 0) nonzeros.push(c);
        }
        while (nonzeros.length > originalNonzeros) {
          const c = nonzeros.pop();
          grid[r][c] = 0;
        }
      }
      grid.pop();
      const newBlockList = [];
      for (let i = 0; i < grid.length; i++) {
        const row = [];
        for (let j = 0; j < grid[i].length; j++) {
          if (grid[i][j] === 0) row.push(j);
        }
        newBlockList.push(row);
      }
      return matrixToBlockList(blockListToMatrix(newBlockList, true), shortRows);
    } else {
      tail = deepcopy(tail);
      cutNode = tail.at(-1);
      for (let i = 1; i < n; i++) {
        const copy = deepcopy(tail);
        for (let j = 0; j < copy.length; j++) {
          for (let v of copy[j]) {
            if (v.distance > j + 1) v.distance += lastColumnDistance;
          }
          out.push(copy[j]);
        }
        tail = copy;
      }
    }
    out.pop();
    const newMatrix = pointerMatrixToMatrix(out);
    return matrixToBlockList(newMatrix, shortRows);
  }

  // Fundamental Sequence Step
  function fs(ord, n) {
    if (ord === Limit) return getLimit(n);
    if (!Array.isArray(ord) || ord.length === 0) return Zero;
    return expand(ord, true, n);
  }

  // Check if ordinal is a successor
  function isSuccessor(ord) {
    if (ord === Limit || !Array.isArray(ord) || ord.length === 0) return false;
    const matrix = blockListToMatrix(ord);
    return matrix.length === 0 || matrix.at(-1).length === 0;
  }

  // Ordering Comparison
  function cmp(a, b) {
    if (a === Limit && b === Limit) return 0;
    if (a === Limit) return 1;
    if (b === Limit) return -1;

    const minLength = Math.min(a.length, b.length);
    for (let i = 0; i < minLength; i++) {
      const rowA = a[i] || [];
      const rowB = b[i] || [];
      const minRowLen = Math.min(rowA.length, rowB.length);
      for (let j = 0; j < minRowLen; j++) {
        if (rowA[j] !== rowB[j]) return rowA[j] < rowB[j] ? -1 : 1;
      }
      if (rowA.length !== rowB.length) return rowA.length < rowB.length ? -1 : 1;
    }

    if (a.length < b.length) return -1;
    if (a.length > b.length) return 1;
    return 0;
  }

  // Stringify format e.g. ()(0)(1)
  function pretty(ord) {
    if (ord === Limit) return "Limit";
    if (!Array.isArray(ord) || ord.length === 0) return "0";
    return "(" + ord.map((x) => x.join(",")).join(")(") + ")";
  }

  // Display Modes Handler
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

  // Visual Classifications
  function classifyOrdinal(ord) {
    if (ord === Limit) return "#ffffff";
    if (!Array.isArray(ord) || ord.length === 0) return "#808080";
    if (isSuccessor(ord)) return "#d40000";
    if (ord.length === 1) return "#ffd000";
    return "#ff8000";
  }

  // Parser supporting alias lookup, block string format, and address sequences
  function parse(str) {
    str = String(str).trim();
    if (str === "" || str === "0") return Zero;
    if (str.toLowerCase() === "limit" || str.includes("ψ(B(")) return Limit;

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

    // 3. String formatted as ()(0)(1)
    if (str.startsWith("(") && str.endsWith(")")) {
      return str
        .slice(1, -1)
        .split(")(")
        .map((x) => x.split(",").filter(Boolean).map(Number));
    }

    // 4. Raw JSON Array
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}

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
  const title = "Orchestral Superiour Sequence System Transfinite Number Line";

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

//totally broken
