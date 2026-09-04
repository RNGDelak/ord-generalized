//HPrSS but each element store its parent position (pointer)
window.notation = (() => {
    function PrSStoCNF(s) {
        if (s.length === 0) return '0';
        let out = "";
        let lastterm = "";
        let coefficient = 1;
        let root = 0;

        for (let i = 0; i <= s.length; i++) {
            if ((s[i + 1] === s[0]) || (i + 1 >= s.length)) {
                let branches = 0;
                for (let j = root + 1; j <= i; j++) {
                    branches += s[j] === s[root + 1] ? 1 : 0;
                }

                let term = ["1", "ω"][i - root] || 
                           (branches === 1 ? "ω<sup>x</sup>" : "ω<sup>x</sup>")
                           .replace("x", PrSStoCNF(s.slice(root + 1, i + 1)));
                
                if (term === lastterm && i !== s.length) {
                    coefficient += 1;
                } else {
                    if (lastterm) {
                        out += " + " + (coefficient === 1 ? lastterm : lastterm === "1" ? coefficient : lastterm + " · " + coefficient);
                    }
                    lastterm = term;
                    coefficient = 1;
                }
                root = i + 1;
            }
        }

        return out.substring(3);
    }

    // O(N) parent computation via pointer jumping
    function getParents(ord) {
        const P = new Int32Array(ord.length);
        for (let i = 0; i < ord.length; i++) {
            let p = i - 1;
            while (p >= 0 && ord[p] >= ord[i]) {
                p = P[p]; // Jump directly to parent
            }
            P[i] = p; // -1 if root/no parent
        }
        return P;
    }

    function fs(ord, n) {
        if (ord === "Limit") return [0, n + 1];
        if (!ord || ord.length === 0) return [];

        const len = ord.length;
        const P = getParents(ord);
        const lastIdx = len - 1;
        let root = P[lastIdx];

        if (root === -1) {
            let out = [...ord];
            out.pop();
            return out;
        }

        const parentDifference = ord[lastIdx] - ord[root];

        if (parentDifference > 1) {
            while (root !== -1) {
                let parent = P[root];
                if (parent === -1) break;
                let diff = ord[root] - ord[parent];
                if (diff < parentDifference) break;
                root = parent;
            }
        }

        let out = ord.slice(0, lastIdx);
        let increment = ord[lastIdx] - ord[root] - 1;
        let badPart = out.slice(root);

        for (let i = 1; i <= n; i++) {
            for (let j = 0; j < badPart.length; j++) {
                out.push(badPart[j] + increment * i);
            }
        }

        return out;
    }

    function cmp(a, b) {
        if (a === "Limit" && b === "Limit") return 0;
        if (a === "Limit" && b !== "Limit") return 1;
        if (a !== "Limit" && b === "Limit") return -1;

        const minLen = Math.min(a.length, b.length);
        for (let i = 0; i < minLen; i++) {
            if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
        }

        if (a.length < b.length) return -1;
        if (a.length > b.length) return 1;
        return 0;
    }

    function isSuccessor(ord) {
        return ord !== "Limit" && (ord.length === 0 || ord.at(-1) === 0);
    }

    function display(ord, mode) {
        if (ord.length === 0) return '0';
        if (ord === 'Limit') return 'Limit';
        if (mode === "normal") return '(' + ord.join(',') + ')';
        if (mode === "CNF included") {
            if (cmp(ord, [0, 2]) < 0) return PrSStoCNF(ord);
            return '(' + ord.join(',') + ')';
        }
    }

    function classifyOrdinal(ord) {
        if (ord.length === 0) return "#808080"; // 0
        if (isSuccessor(ord)) return "#d40000"; // Successor

        let tower = true;
        for (let i = 0; i < ord.length; i++) {
            if (ord[i] !== i) {
                tower = false;
                break;
            }
        }
        if (tower) return "#ffffff"; // Tower of ω

        let zeroCount = 0;
        for (let i = 0; i < ord.length; i++) {
            if (ord[i] === 0) zeroCount++;
        }
        if (zeroCount === 1) return "#ffd000"; // Power of ω

        return "#ff8000"; // Other limits
    }

    function parse(str) {
        return str.split(",").map(Number);
    }

    const Zero = [];
    const Limit = 'Limit';
    const DisplayName = ["normal", "CNF included"];
    const ordinalTypes = [
        ["Zero", "#808080"],
        ["Successor Ordinal", "#d40000"],
        ["Limit Ordinal", "#ff8000"],
        ["Power of ω", "#ffd000"],
        ["Tower of ω", "#ffffff"]
    ];

    const Aliases = [
        ["Small Cantor Ordinal", [0, 2]],
        ["Veblen Ordinal", [0, 2, 4, 5]],
        ["Buchholz Ordinal", "Limit"]
    ];
    const config = {};
    const title = 'HPrSS transfinite number line';

    return { fs, cmp, isSuccessor, display, classifyOrdinal, parse, Zero, Limit, DisplayName, ordinalTypes, Aliases, config, title };
})();
