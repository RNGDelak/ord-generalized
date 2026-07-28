document.getElementById("Title").innerHTML = notation.title

// ======================================================
// Universal Module computation
//
// Depends only on:
//
//   notation.fs(ord, n)
//   notation.cmp(a, b)
//   notation.Zero
//   notation.Limit
//   notation.isSuccessor(ord)
//
// and BigRational.js
// ======================================================

const Module = (() => {
    const ZERO = bigRat.zero;
    const ONE = bigRat.one;
    const TWO = bigRat(2);
    const FOUR = bigRat(4);

    function rationalToBits(r) {
        // x = r/2 + 1/2
        let x = r.divide(TWO).add(ONE.divide(TWO));
        let bits = "";

        while (!x.equals(ONE)) {
            if (x.numerator.mod(4).equals(1)) {
                bits = "0" + bits;
                x = bigRat(
                    x.numerator.add(1).divide(2),
                    x.denominator.divide(2)
                );
            } else {
                bits = "1" + bits;
                x = bigRat(
                    x.numerator.subtract(1).divide(2),
                    x.denominator.divide(2)
                );
            }
        }

        // remove sentinel
        return bits.substring(1);
    }

    function bitsToOrdinal(bits) {
        if (bits.length === 0) return notation.Zero;

        let x = notation.Zero;
        let y = notation.Limit;
        let d = notation.Zero;

        for (const bit of bits) {
            let t = 0;

            if (bit === "0") y = d;
            else x = d;

            if (notation.isSuccessor(y)) return d;

            while (notation.cmp(notation.fs(y, t), x) <= 0) {
                t++;
            }
            d = notation.fs(y, t);
        }
        return d;
    }

    function rationalToOrdinal(r) {
        return bitsToOrdinal(rationalToBits(r));
    }

    function computeTicks(left, right, width) {
        const pixels = Array(width).fill(null);
        let denom = ONE;

        // Calculate how wide a single pixel is in rational terms
        const pixelWidth = right.subtract(left).divide(bigRat(width));

        // Stop looping once the denominator grid is finer than a single pixel
        while (denom.greaterOrEquals(pixelWidth)) {
            let start = left.divide(denom).floor(true);
            let end = right.divide(denom).ceil(true);

            for (let j = start; j.lesserOrEquals(end); j = j.add(1)) {
                const q = bigRat(j, 1).multiply(denom);

                if (q.lesser(left) || q.greater(right)) continue;

                const pixel = q
                    .subtract(left)
                    .divide(right.subtract(left))
                    .multiply(width)
                    .floor(true)
                    .toJSNumber();

                if (pixel < 0 || pixel >= width) continue;

                if (pixels[pixel] === null) {
                    const bits = rationalToBits(q);
                    pixels[pixel] = {
                        x: pixel,
                        rational: q,
                        bits,
                        depth: bits.length,
                        ordinal: bitsToOrdinal(bits)
                    };
                }
            }
            denom = denom.divide(2);
        }

        return pixels.filter(v => v !== null);
    }
    
    return {
        rationalToBits,
        bitsToOrdinal,
        rationalToOrdinal,
        computeTicks
    };
})();