//Rendering section : only render

const canvas = document.getElementById("canvas"); //get canvas
const ui = document.getElementById("textOverlay");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas() //resize so it fit the screen

const ctx = canvas.getContext("2d"); //get drawing context

function clearCanvas() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
clearCanvas() //clear the canvas

function drawLine(x1, y1, x2, y2, color, lineWidth = 2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function createTextLabel(text, color, x, y, alignX, alignY, font) {
    const label = document.createElement("div");

    label.className = "textLabel";
    label.innerHTML = text;
    label.style.left = x + "px";
    label.style.top = y + "px";
    label.style.color = color;
    label.style.font = font // [weight][size][family] for example "bold 24px Arial"

    let tx = "0";
    let ty = "0";

    switch (alignX) {
        case "center": tx = "-50%"; break;
        case "right": tx = "-100%"; break;
    }

    switch (alignY) {
        case "middle": ty = "-50%"; break;
        case "bottom": ty = "-100%"; break;
    }

    label.style.transform = `translate(${tx}, ${ty})`;

    ui.appendChild(label);

    return label;
}

function clearTextLabels() {
    ui.replaceChildren();
}


function renderTicks(DrawSet) {
    // Input format : [[x1, y1, x2, y2, color, lineWidth],[x1, y1, x2, y2, color, lineWidth],...]
    for (const [x1, y1, x2, y2, color, width] of DrawSet) {
        drawLine(x1, y1, x2, y2, color, width);
    }
}

function renderTexts(TextSet) {
    // Input format : [[text, color, x, y, alignX, alignY, font],[text, color, x, y, alignX, alignY, font],...]
    for (const [text, color, x, y, alignX, alignY, font] of TextSet) {
        createTextLabel(text, color, x, y, alignX, alignY, font);
    }
}

// Sending data to the renderer
let _x = {
    WorldPos: new Decimal(0),
    Zoom: new Decimal(window.innerWidth)
}

let config = {
    ticks_Width: 2, // 2px
    ticks_Height: 10
}

function Normalize(number) {

    if (number instanceof Decimal) {
        return number;
    }

    return new Decimal(number);
}


function CanvasToWorld(xPos) {
    return new Decimal(xPos).div(_x.Zoom).plus(_x.WorldPos);
}

function WorldToCanvas(xPos) {
    return new Decimal(xPos).minus(_x.WorldPos).times(_x.Zoom);
}

/*
for more detail for what imma writting here , visit https://github.com/RNGDelak/ord-limbms/blob/main/README.md

I added 2 special point for the functions to support 2 critical point of the ordinal line as well
No fundamental sequence of a limit ordinal ever reaches the limit itself.
Therefore, Limit remains fixed and is never produced by repeated fs applications.

Zero is the first occurrence of Zero.
Even though its encoding may look like 0000...0, every finite string still
represents an ordinal strictly greater than Zero. An infinite descending
chain of ordinals does not exist, so Zero is never approached by finite descent.
*/

//binary search alogrithm for quick fses
function f(alpha, beta) {
    let n = 0;

    while (true) {
        const x = notation.fs(beta, n);

        if (notation.cmp(x, alpha) > 0) {
            return x;
        }

        n++;
    }
}

/*
function g(alpha, beta, s) {

    if (s === "Start") return alpha;
    if (s === "End") return beta;

    let i = 0;

    while (true) {

        if (notation.isSuccessor(beta))
            return alpha;

        const split = f(alpha, beta);

        if (i >= s.length)
            return split;

        if (s[i] === "0")
            beta = split;
        else
            alpha = split;

        i++;
    }
}
*/

function gInv(alpha, beta, target) {

    if (notation.cmp(target, alpha) === 0)
        return "Start";

    if (notation.cmp(target, beta) === 0)
        return "End";

    let result = "";

    while (!notation.isSuccessor(beta)) {

        const split = f(alpha, beta);
        const c = notation.cmp(target, split);

        if (c === 0)
            break;

        if (c < 0) {
            result += "0";
            beta = split;
        } else {
            result += "1";
            alpha = split;
        }
    }

    return result;
}

function h(x, k = new Decimal(0.5), Maxlen = 100, eps = new Decimal("1e-10")) {
    x = Normalize(x)

    if (x.eq(0)) return "Start";
    if (x.eq(1)) return "End";

    let result = "";

    while (result.length < Maxlen && x.sub(k).abs().gt(eps)) {
        if (x.lt(k)) {
            result += "0";
            x = x.div(k);
        } else {
            result += "1";
            x = x.sub(k).div(new Decimal(1).sub(k));
        }
    }

    return result;
}

function hInv(s, k = new Decimal(0.5)) {

    if (s === "Start") return new Decimal(0);
    if (s === "End") return new Decimal(1);

    let result = k;

    for (let i = s.length - 1; i >= 0; i--) {
        if (s[i] === "0") {
            result = k.mul(result);
        } else {
            result = k.add(
                new Decimal(1).sub(k).mul(result)
            );
        }
    }

    return result;
}

function get_n_byte_between(a, b, n) {
    a = Normalize(a);
    b = Normalize(b);

    let int = new Decimal(1);

    while (
        a.minus(a.mod(int))
            .eq(b.minus(b.mod(int)))
    ) {
        int = int.div(2);
    }

    const r = [];
    const seen = new Set();

    function add(x) {
        const key = x.toString();

        if (!seen.has(key)) {
            seen.add(key);
            r.push(x);
        }
    }

    add(
        b.minus(b.mod(int))
    );

    const target = Math.pow(2, n)

    while (r.length < target) {

        int = int.div(2);

        // Snapshot current size only.
        // New points are ignored until the next level.
        const end = r.length;

        for (let i = 0; i < end && r.length < target; i++) {

            const x = r[i];

            const h = x.plus(int);
            if (a.lt(h) && h.lt(b))
                add(h);

            const l = x.minus(int);
            if (a.lt(l) && l.lt(b))
                add(l);
        }
    }

    r.sort((x, y) => x.cmp(y));

    return r;
}

const MAX_g_CACHE = 1e6;

const gCache = new Map();

gCache.set("", {
    alpha: notation.Zero,
    beta: notation.Limit
});

function g_cacheSet(key, value) {
    if (gCache.has(key)) return;

    if (gCache.size >= MAX_g_CACHE) {
        gCache.clear();
        gCache.set("", {
            alpha: notation.Zero,
            beta: notation.Limit
        });
    }

    gCache.set(key, value);
}

function gCached(alpha, beta, s) {

    if (s === "Start") return alpha;
    if (s === "End") return beta;

    // Find longest cached prefix
    let prefix = "";

    for (let i = s.length; i >= 0; i--) {
        const p = s.slice(0, i);
        if (gCache.has(p)) {
            prefix = p;
            break;
        }
    }

    let state = gCache.get(prefix);

    let a = state.alpha;
    let b = state.beta;

    // Walk from the cached prefix to the target
    for (let i = prefix.length; ; i++) {

        if (notation.isSuccessor(b))
            return a;

        const split = f(a, b);

        if (i >= s.length)
            return split;

        if (s[i] === "0") {
            b = split;
        } else {
            a = split;
        }

        // Cache this prefix if it's missing
        g_cacheSet(
            s.slice(0, i + 1),
            {
                alpha: a,
                beta: b
            }
        );
    }
}

const _zero = new Decimal(0);
const _one = new Decimal(1);

function Draw(world, zoom) {

    world = Decimal.max(0, Decimal.min(1, Normalize(world)))
    zoom = Normalize(zoom)
    _x.WorldPos = world
    _x.Zoom = zoom
    Decimal.set({precision: Math.floor(zoom.log(10).add(10).toNumber())});

    const LeftEdge = Decimal.max(_zero, Decimal.min(CanvasToWorld(0), _one));

    const RightEdge = Decimal.max(_zero, Decimal.min(CanvasToWorld(canvas.width), _one));

    console.time()
    let pos = get_n_byte_between(LeftEdge, RightEdge, 11)

    let bin = pos.map(x => h(x))

    let ord = bin.map(x => gCached(notation.Zero, notation.Limit, x));
    console.timeEnd()
    // Remove duplicates
    for (let i = ord.length - 2; i >= 0; i--) {
        if (notation.cmp(ord[i], ord[i + 1]) === 0) {
            ord.splice(i + 1, 1);
            bin.splice(i + 1, 1);
            pos.splice(i + 1, 1);
        }
    }

    pos = pos.map(x => WorldToCanvas(x).toNumber());

    let color = ord.map(x => notation.classifyOrdinal(x))

    let ticks = new Array(ord.length)
    let label = new Array(ord.length)
    let ratio = canvas.width/canvas.height

    for (let i = 0 ; i < ord.length ; i++) {
        let y = pos[i]
        let x = pos[i] * ratio
        //[x1, y1, x2, y2, color, lineWidth]
        ticks[i] = [x,y - config.ticks_Height/2,x,y + config.ticks_Height/2 , color[i] , config.ticks_Width]
    }
    clearCanvas()
    renderTicks(ticks)
}