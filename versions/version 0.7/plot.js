// plot.js - The Visual Orchestration Engine
let w = canvas.width;
let h = canvas.height;

// Rasterize horizontal subdivisions (Ticks)
let yStart = 0;
let yEnd = h;
let tHeight = h * 0.05;
let ilxw = 1.0 / Math.log(w);


const times = [];
let fps;

function refreshLoop() {
    window.requestAnimationFrame(() => {
        const now = performance.now();
        while (times.length > 0 && times[0] <= now - 1000) {
            times.shift();
        }
        times.push(now);
        fps = times.length;
        refreshLoop();
    });
}

refreshLoop();

// Define the state of our camera/viewport
let view = {
    x0: 0, // Screen X coordinate corresponding to ordinal Zero
    x1: 0, // Screen X coordinate corresponding to ordinal Limit
    maxDepth: -1,
    mouse: { x: 0, y: 0, isDown: false, lastX: 0, lastY: 0 }
};

let aspectratio = 2 / 3

function converge1(a, b, rescale = 1) {
    return b + (a - b) * rescale * aspectratio;
}

// Tick system state to track drawn screen intervals and intensities
let ticks = [];
let impor = [];
let labelsToDraw = []; // NEW: Stores computed placement positions for ordinal text labels

function initTicks(width) {
    ticks = new Array(Math.ceil(width)).fill(null);
    impor = new Array(Math.ceil(width)).fill(0);
    labelsToDraw = []; // Reset screen labels array on each compute frame
}

function importanceSeg(x0, x1, width) {
    if (x0 <= 0 || x0 > width) return;
    const l = x1 - x0;
    const idx = Math.max(0, Math.min(ticks.length - 1, Math.floor(x0)));
    impor[idx] = Math.max(impor[idx], l);
}

// Tick recorder during recursive traversal
function tickmark(x0, x1, o0, width) {
    if (x0 < 0 || x0 >= width) return;
    importanceSeg(x0, x1, width);
    const idx = Math.max(0, Math.min(ticks.length - 1, Math.floor(x0)));
    ticks[idx] = {
        color: notation.classifyOrdinal(o0),
        ord: o0
    };
}

// NEW: Traversal function targeting label placement (Ports C's tickmark_label and segment structure)
function tickmarkLabel(x0, x1, o0, width) {
    // If the interval is wide enough on screen, mark it to receive a permanent timeline label
    if (x0 < 0 - 150 || x0 >= width + 150) return;

    labelsToDraw.push({
        x: x0,
        ord: o0
    });
}

// Plot segment traversal function (ports PlotSegment2.c's segment() logic)
function segment(x0, x1, o0, o1, eps, xmin, xmax, depth, lefts, callback) {
    if (x1 <= xmin || x0 > xmax) return; // Off-screen clipping

    importanceSeg(x0, x1, xmax);

    if (x1 - x0 < eps) {
        callback(x0, x1, o0, xmax);
        return;
    }

    if (view.maxDepth >= 0 && depth >= view.maxDepth) {
        callback(x0, x1, o0, xmax);
        return;
    }

    // If o1 is a Limit ordinal
    if (notation.cmp(o1, notation.Limit) === 0 || (!notation.isSuccessor(o1) && notation.cmp(o1, notation.Zero) !== 0)) {
        let rescale = 2.0 / (lefts + 2);
        let top = x1 - eps;
        let s_x0 = x0;
        let s_x1 = x0;
        let n = 0;

        // Converging interval bounds estimation
        for (n = 0; s_x0 < top && s_x0 < xmax; n++) {
            if (n > 0) s_x0 = s_x1;
            s_x1 = converge1(s_x0, x1, 1);
            if (n > 1000) break; // Infinite loop safety
        }

        let m = n + 2;
        let seq = [];
        for (let idx = 0; idx < m; idx++) {
            seq.push(notation.fs(o1, idx));
        }

        let ofs = 0;
        for (ofs = 0; ofs < m && notation.cmp(seq[ofs], o0) <= 0; ofs++);

        while (ofs + n > m) {
            m = ofs + n;
            seq = [];
            for (let idx = 0; idx < m; idx++) {
                seq.push(notation.fs(o1, idx));
            }
            for (ofs = 0; ofs < m && notation.cmp(seq[ofs], o0) <= 0; ofs++);
        }

        if (ofs < m && seq[ofs].length > 0) {
            // Check if terms collapse to finite successor bounds to stabilize scale
            const lastVal = seq[ofs][seq[ofs].length - 1];
            if (lastVal === 0) rescale = 1;
        }

        s_x0 = x0;
        s_x1 = x0;
        for (n = 0; s_x0 < top && s_x0 < xmax && ofs + n < m; n++) {
            if (n > 0) s_x0 = s_x1;
            s_x1 = converge1(s_x0, x1, n ? 1 : rescale);

            const next_o0 = n === 0 ? o0 : seq[ofs + n - 1];
            const next_o1 = seq[ofs + n];

            segment(s_x0, s_x1, next_o0, next_o1, eps, xmin, xmax, depth + 1, n ? 0 : lefts + 1, callback);
        }
    } else {
        callback(x0, x1, o0, xmax);
    }
}

// Top level traversal wrapper
function computeTree(width) {
    initTicks(width);

    // Pass 1: Render high-density ticks on screen
    segment(view.x0, view.x1, notation.Zero, notation.Limit, 1, 0, width, 0, 0, tickmark);

    tickmarkLabel(view.x0, view.x0, notation.Zero, width);
    // Pass 2: Calculate timeline labels based on visual priority (eps = 80px)

    segment(view.x0, view.x1, notation.Zero, notation.Limit, 80, 0, width, 0, 0, tickmarkLabel);

    tickmarkLabel(view.x1, view.x1, notation.Limit, width);
}

// High-precision sampler state matching C's float sampler_bd; Ord sampler_ord;
let samplerBd = 1e20;
let samplerOrd = null;

/**
 * Targeted callback that runs during the 1-pixel wide mathematical recursion.
 * Replaces C's void sampler(PlotSegment r)
 */
function samplerCallback(x0, x1, o0, xmax) {
    // Get the absolute distance between this segment's start coordinate and the center of our 1px window
    const targetX = xmax - 0.5; // Since our window is xmin = x, xmax = x + 1
    const d = Math.abs(x0 - targetX);

    if (d < samplerBd) {
        samplerBd = d;
        // Copy/reference the mathematical ordinal
        samplerOrd = o0; 
    }
}

/**
 * Replaces the post-process pixel scan with a localized recursive search.
 * Replaces C's void sample(PlotSegment r, const float x)
 */
function sampleHighPrecision(x, width) {
    // Reset sampler state
    samplerBd = 1e20;
    samplerOrd = null;

    const eps = 1; // 1-pixel tolerance window
    const xmin = x; // Left boundary of our probe
    const xmax = x + eps; // Right boundary of our probe

    // Re-run the mathematical recursion targeted ONLY inside this 1-pixel window
    segment(
        view.x0, 
        view.x1, 
        notation.Zero, 
        notation.Limit, 
        eps, 
        xmin, 
        xmax, 
        0, 
        0, 
        samplerCallback
    );

    // If a segment mathematically intersected our 1-pixel wide slice
    if (samplerBd < 1e20) {
        const mode = notation.DisplayName[1];
        const ordStr = notation.display(samplerOrd, mode);

        // Render the mathematically accurate label above the center line
        createTextLabel(
            ordStr,
            "#ffffff",
            0,
            canvas.height * 0.9, // Placed matching original yres * 0.78 C positioning
            "left",
            "middle",
            "bold 24px Arial"
        );
    }
}

// Draw timeline labels computed during tree segment traversal
function drawTimelineLabels() {
    const mode = notation.DisplayName[1]; // Display using standard representation
    const h = canvas.height;

    labelsToDraw.forEach((lbl) => {
        const px = lbl.x;
        const py = h * px / canvas.width - tHeight

        // Safely determine the display string for the label
        const labelString = (lbl.ord === notation.Limit)
            ? "Limit"
            : notation.display(lbl.ord, mode);

        // Render primary mathematical label
        createTextLabel(
            labelString,
            "#ffffff",
            px,
            py,
            "left",
            "bottom",
            "12px Arial"
        );

        // Check if matching specific notable notation bounds
        notation.Aliases.forEach(([name, defStr]) => {
            let targetOrd = defStr === "Limit" ? notation.Limit : defStr;
            if (notation.cmp(lbl.ord, targetOrd) === 0) {
                createTextLabel(
                    name,
                    "#808080",
                    px,
                    py - 20,
                    "left",
                    "bottom",
                    "italic 20px Arial"
                );
            }
        });
    });
}
// Display legends on screen
function drawHUD() {
    let py = 20;
    const px = canvas.width - 20;

    // Draw Legend Key
    notation.ordinalTypes.forEach(([name, color]) => {
        createTextLabel(name, color, px, py, "right", "top", "14px Arial");
        py += 22;
    });
}

// Render execution loop
function render() {
    clearCanvas();
    clearTextLabels();

    w = canvas.width;
    h = canvas.height;

    // Compute ordinals representation space
    computeTree(w);

    // Rasterize horizontal subdivisions (Ticks)
    yStart = 0;
    yEnd = h;
    tHeight = h * 0.05;
    ilxw = 1.0 / Math.log(w);

    for (let n = 0; n < ticks.length; n++) {
        if (ticks[n]) {
            const x = n;
            const y = yStart + (yEnd - yStart) * (n / w);
            const b = 128.0 + 256.0 * Math.log(1.0 + impor[n]) * ilxw;

            // Draw ticks with a glow gradient/alpha calculation matching impor
            const opacity = Math.min(1.0, Math.max(0.3, b / 255));
            ctx.globalAlpha = opacity;
            drawLine(x, y - tHeight, x, y, ticks[n].color, 2);
        }
    }
    ctx.globalAlpha = 1.0;

    // Draw timeline ordinal markers
    drawTimelineLabels();

    // Draw viewport alignment hair-line
    drawLine(w / 2, 0, w / 2, h, "rgb(0, 0, 255)", 2);

    createTextLabel(
        (fps ? fps : '60') + 'fps',
        "#ffffff",
        0,
        canvas.height * 1,
        "left",
        "bottom",
        "bold 24px Arial"
    );

    // Sample details under hair-line
    sampleHighPrecision(w / 2, w);

    // Render remaining labels & HUD components
    drawHUD();
}

// Setup canvas and view matrix variables on load
function init() {
    document.getElementById("Title").innerText = notation.title;
    resizeCanvas();

    // Set initial view centered nicely
    const minZoom = canvas.width * 0.8;
    view.x0 = 0.5 * (canvas.width - minZoom);
    view.x1 = 0.5 * (canvas.width + minZoom);

    render();
}

// Event Listeners
window.addEventListener("resize", () => {
    resizeCanvas();
    render();
});

// --- Updated Controls: Drag to Pan (X) & Zoom (Y) ---

// Track mouse down state and starting position
window.addEventListener("mousedown", (e) => {
    view.mouse.isDown = true;
    view.mouse.lastX = e.clientX;
    view.mouse.lastY = e.clientY;
});

window.addEventListener("mousemove", (e) => {
    if (!view.mouse.isDown) return;

    const dx = e.clientX - view.mouse.lastX;
    const dy = e.clientY - view.mouse.lastY;
    const mx = e.clientX;

    // 1. Pan (Horizontal drag moves the viewport)
    view.x0 += dx;
    view.x1 += dx;

    // 2. Zoom (Vertical drag scales the viewport centered on the cursor)
    if (dy !== 0) {
        // Dragging up (negative dy) zooms in; dragging down (positive dy) zooms out
        const zoomFactor = 1 - (dy * 0.01);

        // Simulate the new zoom bounds
        const nextX0 = mx + (view.x0 - mx) * zoomFactor;
        const nextX1 = mx + (view.x1 - mx) * zoomFactor;
        let maxAllowedWidth = canvas.width * 0.5;
        const nextWidth = nextX1 - nextX0;


        // Only zoom out if the new width is smaller than our maximum threshold
        if (nextWidth >= maxAllowedWidth) {
            view.x0 = nextX0;
            view.x1 = nextX1;
        } else {
            // Force the viewport bounds to exactly match the maximum allowed zoom-out limit
            const currentWidth = view.x1 - view.x0;
            const scaleToLimit = maxAllowedWidth / currentWidth;

            view.x0 = mx + (view.x0 - mx) * scaleToLimit;
            view.x1 = mx + (view.x1 - mx) * scaleToLimit;
        }
    }

    // Keep track of current mouse position
    view.mouse.lastX = e.clientX;
    view.mouse.lastY = e.clientY;
    render();
});

// Zoom (Mouse Wheel zoom centered near cursor)
window.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.5 : 2 / 3;
    const mx = e.clientX;

    // Linearly scale bounds relative to coordinate cursor
    if (view.x1 - view.x0 >= canvas.width * 0.5 || e.deltaY < 0) {
        view.x0 = mx + (view.x0 - mx) * zoomFactor;
        view.x1 = mx + (view.x1 - mx) * zoomFactor;
    }

    render();
}, { passive: false });

window.addEventListener("mouseup", () => view.mouse.isDown = false);
window.addEventListener("mouseleave", () => view.mouse.isDown = false);

// --- Keyboard Controls ---

// Object to track active state of keys for continuous actions (smooth panning/zooming)
const activeKeys = {};

window.addEventListener("keydown", (e) => {
    activeKeys[e.key.toLowerCase()] = true;
    activeKeys[e.code] = true; // Support both characters and standard layout codes

    let actionTriggered = false;


    if (e.key === "s") {
        // Decrease rendering recursion depth limit
        view.maxDepth = Math.max(-1, view.maxDepth - 1);
        actionTriggered = true;
    }

    if (e.key === "d") {
        // Increase rendering recursion depth limit
        view.maxDepth = view.maxDepth === -1 ? 0 : view.maxDepth + 1;
        actionTriggered = true;
    }

    if (actionTriggered) {
        render();
    }
});

window.addEventListener("keyup", (e) => {
    activeKeys[e.key.toLowerCase()] = false;
    activeKeys[e.code] = false;
});

// A small, lightweight loop to handle smooth, continuous keyboard navigation
function updateKeyboardInput() {
    let moved = false;

    // Scale movement speeds based on canvas width
    const panSpeedBase = canvas.width * 0.015;
    const zoomSpeedBase = 1.1;

    const panSpeed = panSpeedBase;
    const zoomSpeed = zoomSpeedBase;

    // Center point of the screen for zooming
    const mx = canvas.width / 2;

    // 1. Continuous Panning (Left / Right Arrow keys or A / D)
    if (activeKeys["arrowleft"]) {
        view.x0 += panSpeed;
        view.x1 += panSpeed;
        moved = true;
    }
    if (activeKeys["arrowright"]) {
        view.x0 -= panSpeed;
        view.x1 -= panSpeed;
        moved = true;
    }

    // 2. Continuous Zooming (Up / Down Arrow keys, W / S, or Z / X)
    if (activeKeys["arrowup"]) {
        // Zoom In
        const zoomFactor = zoomSpeed;
        view.x0 = mx + (view.x0 - mx) * zoomFactor;
        view.x1 = mx + (view.x1 - mx) * zoomFactor;
        moved = true;
    }
    if (activeKeys["arrowdown"]) {
        // Zoom Out
        const zoomFactor = 1 / zoomSpeed;
    
        const currentWidth = view.x1 - view.x0;
        const maxAllowedWidth = canvas.width * 0.5;
        const targetWidth = currentWidth * zoomFactor;

        if (targetWidth >= maxAllowedWidth) {
            view.x0 = mx + (view.x0 - mx) * zoomFactor;
            view.x1 = mx + (view.x1 - mx) * zoomFactor;
        } else {
            const scaleToLimit = maxAllowedWidth / currentWidth;
            view.x0 = mx + (view.x0 - mx) * scaleToLimit;
            view.x1 = mx + (view.x1 - mx) * scaleToLimit;
        }
        moved = true;
    }

    if (moved) {
        render();
    }

    // Request next update step
    requestAnimationFrame(updateKeyboardInput);
}

// Start tracking keyboard ticks
updateKeyboardInput();

// Fire up
init();