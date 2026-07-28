/*
Notation : BMS
Limit : w-Y(1,3)
*/
// You must have cmp,isSuccessor,fs and display. Some constant is required too
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
        if(ord.length==0) return '0'
        return ord.map(p => `(${p.join(',')})`).join('')
    }

    function classifyOrdinal(ord) {
        if (ord.length==0) return "#808080"
        if (ord[ord.length-1][0] == 0) return "#d40000"
        return "#ff8000"
    }

    function parse(str) {
        return str;
    }

    const Zero = [] //compulsory: how the first ordinal defined in your system defined? Should be an valid ordinal input for above functions
    const Limit = 'Limit' //compulsory: how the bounded ordinal in your system defined? Should be an valid ordinal input for above functions
    const DisplayName = ["normal", "CNF included"] //compulsory: add all your mode name here so the program can query them and display
    const ordinalTypes = [["Zero", "#808080"], ["Successor Ordinal", "#d40000"], ["Limit Ordinal", "#ff8000"]]; //compulsory: for legends gui purposes so user can know colour correspond to class of ordinal 

    const Aliases = [
        ["First Transfinite Ordinal", [[0],[1]]],
        ["Small Cantor Ordinal", [[0,0],[1,1]]],
        ["Veblen Ordinal", [[0,0],[1,1],[2,1],[3,0]]],
        ["Feferman–Schütte Ordinal", [[0,0],[1,1],[2,1],[3,1]]],
        ["First Γ fixed point", [[0,0],[1,1],[2,1],[3,1],[2,1]]],
        ["Ackermann Ordinal", [[0,0],[1,1],[2,1],[3,1],[3,1]]],
        ["Small Veblen Ordinal", [[0,0],[1,1],[2,1],[3,1],[4,0]]],
        ["Large Veblen Ordinal", [[0,0],[1,1],[2,1],[3,1],[4,1]]],
        ["Ackermann Ordinal", [[0,0],[1,1],[2,1],[3,1],[3,1]]],
        ["Bachmann–Howard Ordinal", [[0,0],[1,1],[2,2]]],
        ["Buchholz's Ordinal", [[0,0,0],[1,1,1]]],
        ["Takeuti-Feferman-Buchholz Ordinal", [[0,0,0],[1,1,1],[2,1,0],[3,2,0]]],
        ["Bird's Ordinal", [[0,0,0],[1,1,1],[2,1,1],[3,1,0]]],
        ["Extended Buchholz Ordinal", [[0,0,0],[1,1,1],[2,1,1],[3,1,0],[2,0,0]]],
        ["Multivariable Buchholz Ordinal", [[0,0,0],[1,1,1],[2,1,1],[3,1,1],[3,0,0]]],
        ["Transfinitary Buchholz Ordinal", [[0,0,0],[1,1,1],[2,1,1],[3,1,1],[3,1,0],[2,0,0]]],
        ["Dimensional Buchholz Ordinal", [[0,0,0],[1,1,1],[2,1,1],[3,1,1],[3,1,0],[4,2,0]]],
        ["Small Stergent Ordinal", [[0,0,0],[1,1,1],[2,2,0]]],
        ["Small Dropping Ordinal", [[0,0,0],[1,1,1],[2,2,1],[3,0,0]]],
        ["2nd Back Gear ordinal", [[0,0,0],[1,1,1],[2,2,1],[3,3,0]]],
        ["Omega Back ordinal / Small Bashicu ordinal", [[0,0,0],[1,1,1],[2,2,2]]],
        ["Lim(TSS)", [[0,0,0,0],[1,1,1,1]]],
        ["Lim(QSS)", [[0,0,0,0,0],[1,1,1,1,1]]],
        ["Lim(BMS) / ω-Y(1,3)", 'Limit'],
    ] //important ordinal

    const config = { types: "default" }
    const title = 'BMS transfinite number line' //title

    return { fs, cmp, isSuccessor, display, classifyOrdinal, parse, Zero, Limit, DisplayName, ordinalTypes, Aliases, config, title };
})();