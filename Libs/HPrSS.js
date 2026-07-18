/*
Notation : HPrSS
Limit : ψ(Ω_ω)
*/


//for example, i can put some function outside and include it inside notation IIEF
function PrSStoCNF(s) {
    if (s.length==0) return '0'
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

            // REPLACED: Generates <sup> html syntax for structural exponents instead of ^ carets
            let term = ["1", "ω"][i - root] || 
                       (branches === 1 ? "ω<sup>x</sup>" : "ω<sup>x</sup>")
                       .replace("x", PrSStoCNF(s.slice(root + 1, i + 1)));
            
            if (term === lastterm && i !== s.length) {
                coefficient += 1;
            } else {
                if (lastterm) {
                    // REPLACED: Cleaned up spacing and added a pretty middle dot (·) for coefficients
                    out += " + " + (coefficient === 1 ? lastterm : lastterm === "1" ? coefficient : lastterm + " · " + coefficient);
                }
                lastterm = term;
                coefficient = 1;
            }
            root = i + 1;
        }
    }

    return out.substring(3); // Updated from substring(1) to cleanly slice off the initial " + "
}
window.notation = (() => {
    function fs(ord, n) {
        if (ord == "Limit") return [0, n + 1]

        let getParent = i =>
            ord.findLastIndex((v, j) => j < i && v < ord[i]);

        let differences = ord.map((v, i) => v - ord[getParent(i)]);
        let parentDifference = differences[ord.length - 1];
        let root = getParent(ord.length - 1);

        if (parentDifference > 1) {
            while (differences[root] >= parentDifference) {
                let parent = getParent(root);
                if (parent === -1) break;
                root = parent;
            }
        }

        let out = [...ord];
        let cutNode = out.pop();
        let increment = cutNode - ord[root] - 1;
        let badPart = out.slice(root);

        for (let i = 1; i <= n; i++) {
            out.push(...badPart.map(v => v + increment * i));
        }

        return out;
    }

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

    function isSuccessor(ord) {
        return ord !== "Limit" && (ord.length === 0 || ord.at(-1) === 0);
    }

    function display(ord, mode) {
        if (mode == "normal") return ord.join(',')
        if (mode == "CNF included") {
            if (cmp(ord, [0, 2]) < 0) return PrSStoCNF(ord)

            return ord.join(',')
        }
    }

    function classifyOrdinal(ord) {
        if (ord.length === 0) return "#808080"; // 0

        if (isSuccessor(ord)) return "#d40000"; // Successor

        // {0,1,2,...,n}
        let tower = true;
        for (let i = 0; i < ord.length; i++) {
            if (ord[i] !== i) {
                tower = false;
                break;
            }
        }
        if (tower) return "#ffffff"; // Tower of ω

        // Exactly one zero
        let zeroCount = 0;
        for (const x of ord) {
            if (x === 0) zeroCount++;
        }
        if (zeroCount === 1) return "#ffd000"; // Power of ω

        return "#ff8000"; // Other limits
    }

    function parse(str) {
        return str.split(",").map(Number);
    }

    const Zero = [] //compulsory: how the first ordinal defined in your system defined? Should be an valid ordinal input for above functions
    const Limit = 'Limit' //compulsory: how the bounded ordinal in your system defined? Should be an valid ordinal input for above functions
    const DisplayName = ["normal", "CNF included"] //compulsory: add all your mode name here so the program can query them and display
    const ordinalTypes = [["Zero", "#808080"],["Successor Ordinal", "#d40000"],["Limit Ordinal", "#ff8000"],["Power of ω", "#ffd000"],["Tower of ω", "#ffffff"]]; //compulsory: for legends gui purposes so user can know colour correspond to class of ordinal 

    const Aliases = [["Small Cantor Ordinal", [0,2]],["Veblen Ordinal", [0,2,4,5]], ["Buchholz Ordinal", "Limit"]] //important ordinal
    const config = { types: "default" }
    const title = 'HPrSS transfinite number line' //title

    return { fs, cmp, isSuccessor, display, classifyOrdinal, parse, Zero, Limit, DisplayName, ordinalTypes, Aliases, config, title };
})();