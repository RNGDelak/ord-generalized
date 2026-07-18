let config = {
    aspectratio: 2 / 3,
    panSpeedBaseFactor: 0.5,
    zoomSpeedBase: 10.0,
    zoomDragFactor: 0.01,
    shiftMultiplier: 3.0,
    ctrlMultiplier: 0.25,
    wheelZoomIn: 1.5,
    wheelZoomOut: 2 / 3,
    maxAllowedWidthFactor: 0.5
};
let cam = {
    w: canvas.width,
    h: canvas.height,
    yStart: 0,
    yEnd: canvas.height,
    tHeight: canvas.height * 0.05,
    ilxw: 1.0 / Math.log(canvas.width),
    fps: undefined,
    times: [],
    lastKeyboardTime: performance.now(), 
    view: {
        x0: 0, 
        x1: 0, 
        maxDepth: -1,
        mouse: { x: 0, y: 0, isDown: false, lastX: 0, lastY: 0 }
    },
    ticks: [],
    impor: [],
    labelsToDraw: [], 
    samplerBd: 1e20,
    samplerOrd: null,
    activeKeys: {} 
};

function refreshLoop() {
    window.requestAnimationFrame(() => {
        const now = performance.now();
        while (cam.times.length > 0 && cam.times[0] <= now - 1000) {
            cam.times.shift();
        }
        cam.times.push(now);
        cam.fps = cam.times.length;
        refreshLoop();
    });
}

refreshLoop();

function converge1(a, b, rescale = 1) {
    return b + (a - b) * rescale * config.aspectratio;
}

function initTicks(width) {
    cam.ticks = new Array(Math.ceil(width)).fill(null);
    cam.impor = new Array(Math.ceil(width)).fill(0);
    cam.labelsToDraw = []; 
}

function importanceSeg(x0, x1, width) {
    if (x0 <= 0 || x0 > width) return;
    const l = x1 - x0;
    const idx = Math.max(0, Math.min(cam.ticks.length - 1, Math.floor(x0)));
    cam.impor[idx] = Math.max(cam.impor[idx], l);
}
function tickmark(x0, x1, o0, width) {
    if (x0 < 0 || x0 >= width) return;
    importanceSeg(x0, x1, width);
    const idx = Math.max(0, Math.min(cam.ticks.length - 1, Math.floor(x0)));
    cam.ticks[idx] = {
        color: notation.classifyOrdinal(o0),
        ord: o0
    };
}
function tickmarkLabel(x0, x1, o0, width) {
    if (x0 < 0 - 150 || x0 >= width + 150) return;

    cam.labelsToDraw.push({
        x: x0,
        ord: o0
    });
}
function segment(x0, x1, o0, o1, eps, xmin, xmax, depth, lefts, callback) {
    if (x1 <= xmin || x0 > xmax) return; 

    importanceSeg(x0, x1, xmax);

    if (x1 - x0 < eps) {
        callback(x0, x1, o0, xmax);
        return;
    }

    if (cam.view.maxDepth >= 0 && depth >= cam.view.maxDepth) {
        callback(x0, x1, o0, xmax);
        return;
    }
    if (notation.cmp(o1, notation.Limit) === 0 || (!notation.isSuccessor(o1) && notation.cmp(o1, notation.Zero) !== 0)) {
        let rescale = 2.0 / (lefts + 2);
        let top = x1 - eps;
        let s_x0 = x0;
        let s_x1 = x0;
        let n = 0;
        for (n = 0; s_x0 < top && s_x0 < xmax; n++) {
            if (n > 0) s_x0 = s_x1;
            s_x1 = converge1(s_x0, x1, 1);
            if (n > 1000) break; 
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
function computeTree(width) {
    initTicks(width);
    segment(cam.view.x0, cam.view.x1, notation.Zero, notation.Limit, 1, 0, width, 0, 0, tickmark);

    tickmarkLabel(cam.view.x0, cam.view.x0, notation.Zero, width);
    segment(cam.view.x0, cam.view.x1, notation.Zero, notation.Limit, 80, 0, width, 0, 0, tickmarkLabel);

    tickmarkLabel(cam.view.x1, cam.view.x1, notation.Limit, width);
}

function samplerCallback(x0, x1, o0, xmax) {
    const targetX = xmax - 0.5;
    const d = Math.abs(x0 - targetX);

    if (d < cam.samplerBd) {
        cam.samplerBd = d;
        cam.samplerOrd = o0;
    }
}

function sampleHighPrecision(x, width) {
    cam.samplerBd = 1e20;
    cam.samplerOrd = null;

    const eps = 1;
    const xmin = x;
    const xmax = x + eps;

    segment(
        cam.view.x0,
        cam.view.x1,
        notation.Zero,
        notation.Limit,
        eps,
        xmin,
        xmax,
        0,
        0,
        samplerCallback
    );

    if (cam.samplerBd < 1e20) {
        const mode = notation.DisplayName[1];
        const ordStr = notation.display(cam.samplerOrd, mode);

        createTextLabel(
            ordStr,
            "#ffffff",
            0,
            canvas.height * 0.9,
            "left",
            "middle",
            "bold 24px Arial"
        );
    }
}

function drawTimelineLabels() {
    const mode = notation.DisplayName[1];
    const h = canvas.height;

    cam.labelsToDraw.forEach((lbl) => {
        const px = lbl.x;
        const py = h * px / canvas.width - cam.tHeight;

        const labelString = (lbl.ord === notation.Limit)
            ? "Limit"
            : notation.display(lbl.ord, mode);

        createTextLabel(
            labelString,
            "#ffffff",
            px,
            py,
            "left",
            "bottom",
            "12px Arial"
        );

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

function drawHUD() {
    let py = 20;
    const px = canvas.width - 20;

    notation.ordinalTypes.forEach(([name, color]) => {
        createTextLabel(name, color, px, py, "right", "top", "14px Arial");
        py += 22;
    });
}
function render() {
    clearCanvas();
    clearTextLabels();

    cam.w = canvas.width;
    cam.h = canvas.height;

    computeTree(cam.w);

    cam.yStart = 0;
    cam.yEnd = cam.h;
    cam.tHeight = cam.h * 0.05;
    cam.ilxw = 1.0 / Math.log(cam.w);

    for (let n = 0; n < cam.ticks.length; n++) {
        if (cam.ticks[n]) {
            const x = n;
            const y = cam.yStart + (cam.yEnd - cam.yStart) * (n / cam.w);
            const b = 128.0 + 256.0 * Math.log(1.0 + cam.impor[n]) * cam.ilxw;

            const opacity = Math.min(1.0, Math.max(0.3, b / 255));
            ctx.globalAlpha = opacity;
            drawLine(x, y - cam.tHeight, x, y, cam.ticks[n].color, 2);
        }
    }
    ctx.globalAlpha = 1.0;

    drawTimelineLabels();

    drawLine(cam.w / 2, 0, cam.w / 2, cam.h, "rgb(0, 0, 255)", 2);

    createTextLabel(
        (cam.fps ? cam.fps : '60') + 'fps',
        "#ffffff",
        0,
        canvas.height * 1,
        "left",
        "bottom",
        "bold 24px Arial"
    );

    sampleHighPrecision(cam.w / 2, cam.w);
    drawHUD();
}

function init() {
    document.getElementById("Title").innerText = notation.title;
    resizeCanvas();

    const minZoom = canvas.width * 0.8;
    cam.view.x0 = 0.5 * (canvas.width - minZoom);
    cam.view.x1 = 0.5 * (canvas.width + minZoom);
    cam.lastKeyboardTime = performance.now();

    render();
}

function clampViewportBounds() {
    const minOverlap = canvas.width * 0.1;
    const currentWidth = cam.view.x1 - cam.view.x0;
    if (cam.view.x0 > canvas.width - minOverlap) {
        cam.view.x0 = canvas.width - minOverlap;
        cam.view.x1 = cam.view.x0 + currentWidth;
    }
    if (cam.view.x1 < minOverlap) {
        cam.view.x1 = minOverlap;
        cam.view.x0 = cam.view.x1 - currentWidth;
    }
}


window.addEventListener("resize", () => {
    resizeCanvas();
    render();
});

window.addEventListener("mousedown", (e) => {
    if (window.isSettingsOpen) return;
    cam.view.mouse.isDown = true;
    cam.view.mouse.lastX = e.clientX;
    cam.view.mouse.lastY = e.clientY;
});

window.addEventListener("mousemove", (e) => {
    if (window.isSettingsOpen) return;
    if (!cam.view.mouse.isDown) return;

    const dx = e.clientX - cam.view.mouse.lastX;
    const dy = e.clientY - cam.view.mouse.lastY;
    const mx = e.clientX;
    cam.view.x0 += dx;
    cam.view.x1 += dx;
    if (dy !== 0) {
        const zoomFactor = Math.max(0.05, 1 - (dy * config.zoomDragFactor));


        const nextX0 = mx + (cam.view.x0 - mx) * zoomFactor;
        const nextX1 = mx + (cam.view.x1 - mx) * zoomFactor;
        let maxAllowedWidth = canvas.width * config.maxAllowedWidthFactor;
        const nextWidth = nextX1 - nextX0;

        if (nextWidth >= maxAllowedWidth) {
            cam.view.x0 = nextX0;
            cam.view.x1 = nextX1;
        } else {
            const currentWidth = cam.view.x1 - cam.view.x0;
            const scaleToLimit = maxAllowedWidth / currentWidth;

            cam.view.x0 = mx + (cam.view.x0 - mx) * scaleToLimit;
            cam.view.x1 = mx + (cam.view.x1 - mx) * scaleToLimit;
        }
    }
    clampViewportBounds();

    cam.view.mouse.lastX = e.clientX;
    cam.view.mouse.lastY = e.clientY;
    render();
});

window.addEventListener("wheel", (e) => {
    if (window.isSettingsOpen) return;
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? config.wheelZoomIn : config.wheelZoomOut;
    const mx = e.clientX;

    if (cam.view.x1 - cam.view.x0 >= canvas.width * config.maxAllowedWidthFactor || e.deltaY < 0) {
        cam.view.x0 = mx + (cam.view.x0 - mx) * zoomFactor;
        cam.view.x1 = mx + (cam.view.x1 - mx) * zoomFactor;
    }
    clampViewportBounds();

    render();
}, { passive: false });

window.addEventListener("mouseup", () => cam.view.mouse.isDown = false);
window.addEventListener("mouseleave", () => cam.view.mouse.isDown = false);

window.addEventListener("keydown", (e) => {
    cam.activeKeys[e.key.toLowerCase()] = true;
    cam.activeKeys[e.code] = true;

    let actionTriggered = false;

    if (e.key === "s") {
        cam.view.maxDepth = Math.max(-1, cam.view.maxDepth - 1);
        actionTriggered = true;
    }

    if (e.key === "d") {
        cam.view.maxDepth = cam.view.maxDepth === -1 ? 0 : cam.view.maxDepth + 1;
        actionTriggered = true;
    }

    if (actionTriggered) {
        render();
    }
});

window.addEventListener("keyup", (e) => {
    cam.activeKeys[e.key.toLowerCase()] = false;
    cam.activeKeys[e.code] = false;
});
function updateKeyboardInput() {
    if (window.isSettingsOpen) {
        requestAnimationFrame(updateKeyboardInput);
        return true;
    }

    const now = performance.now();
    let dt = Math.min((now - cam.lastKeyboardTime) / 1000, 0.1);
    cam.lastKeyboardTime = now;
    if (cam.activeKeys["shift"]) {
        dt *= config.shiftMultiplier;
    } else if (cam.activeKeys["control"] || cam.activeKeys["ctrl"]) {
        dt *= config.ctrlMultiplier;
    }

    let moved = false;
    const panSpeed = canvas.width * config.panSpeedBaseFactor * dt;
    const zoomFactorIn = Math.pow(config.zoomSpeedBase, dt);
    const zoomFactorOut = Math.pow(1 / config.zoomSpeedBase, dt);

    const mx = canvas.width / 2;
    if (cam.activeKeys["arrowleft"]) {
        cam.view.x0 += panSpeed;
        cam.view.x1 += panSpeed;
        moved = true;
    }
    if (cam.activeKeys["arrowright"]) {
        cam.view.x0 -= panSpeed;
        cam.view.x1 -= panSpeed;
        moved = true;
    }
    if (cam.activeKeys["arrowup"]) {
        cam.view.x0 = mx + (cam.view.x0 - mx) * zoomFactorIn;
        cam.view.x1 = mx + (cam.view.x1 - mx) * zoomFactorIn;
        moved = true;
    }
    if (cam.activeKeys["arrowdown"]) {
        const currentWidth = cam.view.x1 - cam.view.x0;
        const maxAllowedWidth = canvas.width * config.maxAllowedWidthFactor;
        const targetWidth = currentWidth * zoomFactorOut;

        if (targetWidth >= maxAllowedWidth) {
            cam.view.x0 = mx + (cam.view.x0 - mx) * zoomFactorOut;
            cam.view.x1 = mx + (cam.view.x1 - mx) * zoomFactorOut;
        } else {
            const scaleToLimit = maxAllowedWidth / currentWidth;
            cam.view.x0 = mx + (cam.view.x0 - mx) * scaleToLimit;
            cam.view.x1 = mx + (cam.view.x1 - mx) * scaleToLimit;
        }
        moved = true;
    }

    if (moved) {
        clampViewportBounds();
        render();
    }

    requestAnimationFrame(updateKeyboardInput);
}
updateKeyboardInput();

window.addEventListener("touchstart", (e) => {
    if (window.isSettingsOpen) return;
    
    // Stop the mobile screen from bouncing or pulling-to-refresh
    if (e.target === canvas) e.preventDefault(); 

    cam.view.mouse.isDown = true;
    
    // Map touch positions exactly to your desktop mouse tracking anchors
    cam.view.mouse.lastX = e.touches[0].clientX;
    cam.view.mouse.lastY = e.touches[0].clientY;
}, { passive: false });

window.addEventListener("touchmove", (e) => {
    if (window.isSettingsOpen || !cam.view.mouse.isDown) return;
    if (e.target === canvas) e.preventDefault();

    // Use the exact same tracking logic as the desktop mousemove listener
    const dx = e.touches[0].clientX - cam.view.mouse.lastX;
    const dy = e.touches[0].clientY - cam.view.mouse.lastY;
    const mx = e.touches[0].clientX;

    // 1. Pan (Horizontal drag matches mouse horizontal drag)
    cam.view.x0 += dx;
    cam.view.x1 += dx;

    // 2. Zoom (Vertical drag matches mouse vertical drag)
    if (dy !== 0) {
        const zoomFactor = Math.max(0.05, 1 - (dy * config.zoomDragFactor));

        const nextX0 = mx + (cam.view.x0 - mx) * zoomFactor;
        const nextX1 = mx + (cam.view.x1 - mx) * zoomFactor;
        let maxAllowedWidth = canvas.width * config.maxAllowedWidthFactor;
        const nextWidth = nextX1 - nextX0;

        if (nextWidth >= maxAllowedWidth) {
            cam.view.x0 = nextX0;
            cam.view.x1 = nextX1;
        } else {
            const currentWidth = cam.view.x1 - cam.view.x0;
            const scaleToLimit = maxAllowedWidth / currentWidth;

            cam.view.x0 = mx + (cam.view.x0 - mx) * scaleToLimit;
            cam.view.x1 = mx + (cam.view.x1 - mx) * scaleToLimit;
        }
    }

    // Always enforce viewport limits and redraw
    clampViewportBounds();

    cam.view.mouse.lastX = e.touches[0].clientX;
    cam.view.mouse.lastY = e.touches[0].clientY;
    render();
}, { passive: false });

window.addEventListener("touchend", () => cam.view.mouse.isDown = false);
window.addEventListener("touchcancel", () => cam.view.mouse.isDown = false);

init();