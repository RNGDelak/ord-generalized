
let PRECISION_SCALE = 10n ** 10n; 


function updateAdaptivePrecisionScale() {
    const canvasWidth = canvas.width;
    const currentWidth = Number(cam.view.x1 - cam.view.x0); 
    
    
    if (!currentWidth || currentWidth <= 0) {
        PRECISION_SCALE = 10n ** 10n;
        return;
    }

    
    
    const zoomMagnitude = Number(PRECISION_SCALE) / Number(cam.view.x1 - cam.view.x0);
    const log10Zoom = Math.log10(Math.max(1, zoomMagnitude));
    
    
    const requiredDigits = Math.max(10, Math.floor(log10Zoom) + 8);
    
    const nextScale = 10n ** BigInt(requiredDigits);
    
    
    if (nextScale !== PRECISION_SCALE) {
        const oldScale = PRECISION_SCALE;
        cam.view.x0 = (cam.view.x0 * nextScale) / oldScale;
        cam.view.x1 = (cam.view.x1 * nextScale) / oldScale;
        PRECISION_SCALE = nextScale;
    }
}


function toBigInt(num) {
    return BigInt(Math.round(num * 1e6)) * (PRECISION_SCALE / 1000000n);
}

function toNum(big) {
    if (PRECISION_SCALE === 0n) return 0;
    return Number(big * 1000000n / PRECISION_SCALE) / 1000000;
}

let config = {
    aspectratio: 2 / 3,
    panSpeedBaseFactor: 0.5,
    zoomSpeedBase: 10.0,
    zoomDragFactor: 0.01,
    shiftMultiplier: 3.0,
    ctrlMultiplier: 0.25,
    wheelZoomIn: 1.5,
    wheelZoomOut: 2 / 3,
    maxAllowedWidthFactor: 0.5,
    labelscount: 8,
    
    mode: 0,
    MathstickMode: false,
    DiagonalTickArrangement: true,
    
    LabelBetweenTimelineSpacing: 0,
    LabelBetweenTickSpacing: 0,
    LabelBetweenLabelSpacing: 0,
    TickBetweenLabelXoffest: 0,
 
    Tickdensity: 100,
    SlowMode: false,
    SlowModeDepth: 5,
    
    Tickheight: 15,
    TickWidth: 2,
    TickAnchorPoint: 0,
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
        x0: 0n, 
        x1: 0n,
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

let lastFrameTime = performance.now();

function refreshLoop() {
    window.requestAnimationFrame(() => {
        const now = performance.now();
        const deltaTime = now - lastFrameTime;
        lastFrameTime = now;
        cam.fps = 1000 / deltaTime;

        const fpsElem = document.getElementById("fpsCounter");
        if (fpsElem && cam.fps !== undefined) {
            fpsElem.innerText = cam.fps.toFixed(1) + 'fps';
        }
        refreshLoop();
    });
}
refreshLoop();

function converge1BigInt(a, b, rescale = 1) {
    const rescaleBI = toBigInt(rescale * config.aspectratio);
    return b + ((a - b) * rescaleBI / PRECISION_SCALE);
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
    if (x0 < -150 || x0 >= width + 150) return;
    cam.labelsToDraw.push({ x: x0, ord: o0 });
}

function segmentBigInt(x0, x1, o0, o1, epsBI, xminBI, xmaxBI, depth, lefts, callback, widthNum) {
    if (x1 <= xminBI || x0 > xmaxBI) return;

    const x0Num = toNum(x0);
    const x1Num = toNum(x1);
    importanceSeg(x0Num, x1Num, widthNum);

    if ((x1 - x0) < epsBI) {
        callback(x0Num, x1Num, o0, widthNum);
        return;
    }

    if (cam.view.maxDepth >= 0 && depth >= cam.view.maxDepth) {
        callback(x0Num, x1Num, o0, widthNum);
        return;
    }

    if (notation.cmp(o1, notation.Limit) === 0 || (!notation.isSuccessor(o1) && notation.cmp(o1, notation.Zero) !== 0)) {
        let rescale = 2.0 / (lefts + 2);
        let top = x1 - epsBI;
        let s_x0 = x0;
        let s_x1 = x0;
        let n = 0;
        
        for (n = 0; s_x0 < top && s_x0 < xmaxBI; n++) {
            if (n > 0) s_x0 = s_x1;
            s_x1 = converge1BigInt(s_x0, x1, 1);
      
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
        for (n = 0; s_x0 < top && s_x0 < xmaxBI && ofs + n < m; n++) {
            if (n > 0) s_x0 = s_x1;
            s_x1 = converge1BigInt(s_x0, x1, n ? 1 : rescale);

            const next_o0 = (n === 0) ? o0 : seq[ofs + n - 1];
            const next_o1 = seq[ofs + n];

            segmentBigInt(s_x0, s_x1, next_o0, next_o1, epsBI, xminBI, xmaxBI, depth + 1, n ? 0 : lefts + 1, callback, widthNum);
        }
    } else {
        callback(x0Num, x1Num, o0, widthNum);
    }
}

function computeTree(width) {
    initTicks(width);
    
    const epsBI = toBigInt(1);
    const xminBI = toBigInt(0);
    const xmaxBI = toBigInt(width);
    
    segmentBigInt(cam.view.x0, cam.view.x1, notation.Zero, notation.Limit, epsBI, xminBI, xmaxBI, 0, 0, tickmark, width);

    tickmarkLabel(toNum(cam.view.x0), toNum(cam.view.x0), notation.Zero, width);
    
    const labelEpsBI = toBigInt(canvas.width / config.labelscount);
    segmentBigInt(cam.view.x0, cam.view.x1, notation.Zero, notation.Limit, labelEpsBI, xminBI, xmaxBI, 0, 0, tickmarkLabel, width);

    tickmarkLabel(toNum(cam.view.x1), toNum(cam.view.x1), notation.Limit, width);
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
    const currentViewX1Num = toNum(cam.view.x1);
    if (x >= currentViewX1Num) {
        const sampleElem = document.getElementById("sampleLabel");
        if (sampleElem) sampleElem.innerHTML = notation.display(notation.Limit);
        return;
    }

    cam.samplerBd = 1e20;
    cam.samplerOrd = null;

    const epsBI = toBigInt(1);
    const xminBI = toBigInt(x);
    const xmaxBI = toBigInt(x + 1);

    segmentBigInt(
        cam.view.x0,
        cam.view.x1,
        notation.Zero,
        notation.Limit,
        epsBI,
        xminBI,
        xmaxBI,
        0,
        0,
        samplerCallback,
        width
    );

    if (cam.samplerBd < 1e20) {
        const mode = notation.DisplayName[config.mode];
        const ordStr = notation.display(cam.samplerOrd, mode);
        const sampleElem = document.getElementById("sampleLabel");
        if (sampleElem) sampleElem.innerHTML = ordStr;
    }
}

function drawTimelineLabels() {
    const mode = notation.DisplayName[config.mode];
    const h = canvas.height;

    cam.labelsToDraw.forEach((lbl) => {
        const px = lbl.x;
        const py = h * px / canvas.width - cam.tHeight;

        const labelString = notation.display(lbl.ord, mode);

        createTextLabel(labelString, "#ffffff", px - 7, py - 10, "left", "bottom", "22px Serif");

        notation.Aliases.forEach(([name, defStr]) => {
            if (notation.cmp(lbl.ord, defStr) === 0) {
                createTextLabel(name, "#808080", px - 7, py - 35, "left", "bottom", "italic 20px Serif");
            }
        });
    });
}

function drawHUD() {
    let py = 7;
    const px = canvas.width - 7;
    notation.ordinalTypes.forEach(([name, color]) => {
        createTextLabel(name, color, px, py, "right", "top", "26px Serif");
        py += 30;
    });
}

function render() {
    
    updateAdaptivePrecisionScale();

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
            let tickHeight = cam.tHeight;

if (config.MathstickMode) {
    const importance = Math.max(1, cam.impor[n]);
    tickHeight *= 1 + Math.log2(importance);
}

drawLine(x, y - tickHeight, x, y, cam.ticks[n].color, 2);
        }
    }
    ctx.globalAlpha = 1.0;

    drawTimelineLabels();
    drawLine(cam.w / 2, 0, cam.w / 2, cam.h, "rgb(0, 0, 255)", 2);
    sampleHighPrecision(cam.w / 2, cam.w);
    drawHUD();
}
function resizeCanvas() {
    
    const oldWidth = canvas.width || window.innerWidth;
    
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    
    if (cam.view && cam.view.x0 !== undefined && cam.view.x1 !== undefined && oldWidth > 0) {
        const widthRatioBI = toBigInt(canvas.width / oldWidth);
        
        
        cam.view.x0 = (cam.view.x0 * widthRatioBI) / PRECISION_SCALE;
        cam.view.x1 = (cam.view.x1 * widthRatioBI) / PRECISION_SCALE;
    }
}
function init() {
    document.getElementById("Title").innerText = notation.title;
    resizeCanvas();

    const minZoom = canvas.width * 0.8;
    cam.view.x0 = toBigInt(0.5 * (canvas.width - minZoom));
    cam.view.x1 = toBigInt(0.5 * (canvas.width + minZoom));
    cam.lastKeyboardTime = performance.now();

    render();
}

function clampViewportBounds() {
    const minOverlap = toBigInt(canvas.width * 0.1);
    const currentWidth = cam.view.x1 - cam.view.x0;
    const canvasWidthBI = toBigInt(canvas.width);

    if (cam.view.x0 > canvasWidthBI - minOverlap) {
        cam.view.x0 = canvasWidthBI - minOverlap;
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

    const dxBI = toBigInt(e.clientX - cam.view.mouse.lastX);
    const dy = e.clientY - cam.view.mouse.lastY;
    const mxBI = toBigInt(e.clientX);

    cam.view.x0 += dxBI;
    cam.view.x1 += dxBI;

    if (dy !== 0) {
        const zoomFactor = Math.max(0.05, 1 - (dy * config.zoomDragFactor));
        const zoomFactorBI = toBigInt(zoomFactor);

        const nextX0 = mxBI + ((cam.view.x0 - mxBI) * zoomFactorBI / PRECISION_SCALE);
        const nextX1 = mxBI + ((cam.view.x1 - mxBI) * zoomFactorBI / PRECISION_SCALE);
        
        const maxAllowedWidthBI = toBigInt(canvas.width * config.maxAllowedWidthFactor);
        const nextWidth = nextX1 - nextX0;

        if (nextWidth >= maxAllowedWidthBI) {
            cam.view.x0 = nextX0;
            cam.view.x1 = nextX1;
        } else {
            const currentWidth = cam.view.x1 - cam.view.x0;
            if (currentWidth > 0n) {
                const scaleToLimitBI = (maxAllowedWidthBI * PRECISION_SCALE) / currentWidth;
                cam.view.x0 = mxBI + ((cam.view.x0 - mxBI) * scaleToLimitBI / PRECISION_SCALE);
                cam.view.x1 = mxBI + ((cam.view.x1 - mxBI) * scaleToLimitBI / PRECISION_SCALE);
            }
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
    const zoomFactorBI = toBigInt(zoomFactor);
    const mxBI = toBigInt(e.clientX);

    const maxAllowedWidthBI = toBigInt(canvas.width * config.maxAllowedWidthFactor);

    if ((cam.view.x1 - cam.view.x0) >= maxAllowedWidthBI || e.deltaY < 0) {
        cam.view.x0 = mxBI + ((cam.view.x0 - mxBI) * zoomFactorBI / PRECISION_SCALE);
        cam.view.x1 = mxBI + ((cam.view.x1 - mxBI) * zoomFactorBI / PRECISION_SCALE);
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
    if (e.key === "m") {
        config.mode = (config.mode + 1) % notation.DisplayName.length;
        actionTriggered = true;
    }
    if (e.key === "a") {
        cam.view.maxDepth = Math.max(-1, cam.view.maxDepth - 1);
        actionTriggered = true;
    }
    if (e.key === "s") {
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
        return;
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
    const panSpeedBI = toBigInt(canvas.width * config.panSpeedBaseFactor * dt);
    const zoomFactorInBI = toBigInt(Math.pow(config.zoomSpeedBase, dt));
    const zoomFactorOutBI = toBigInt(Math.pow(1 / config.zoomSpeedBase, dt));

    const mxBI = toBigInt(canvas.width / 2);

    if (cam.activeKeys["arrowleft"]) {
        cam.view.x0 += panSpeedBI;
        cam.view.x1 += panSpeedBI;
        moved = true;
    }
    if (cam.activeKeys["arrowright"]) {
        cam.view.x0 -= panSpeedBI;
        cam.view.x1 -= panSpeedBI;
        moved = true;
    }
    if (cam.activeKeys["arrowup"]) {
        cam.view.x0 = mxBI + ((cam.view.x0 - mxBI) * zoomFactorInBI / PRECISION_SCALE);
        cam.view.x1 = mxBI + ((cam.view.x1 - mxBI) * zoomFactorInBI / PRECISION_SCALE);
        moved = true;
    }
    if (cam.activeKeys["arrowdown"]) {
        const currentWidth = cam.view.x1 - cam.view.x0;
        const maxAllowedWidthBI = toBigInt(canvas.width * config.maxAllowedWidthFactor);
        const targetWidth = currentWidth * zoomFactorOutBI / PRECISION_SCALE;

        if (targetWidth >= maxAllowedWidthBI) {
            cam.view.x0 = mxBI + ((cam.view.x0 - mxBI) * zoomFactorOutBI / PRECISION_SCALE);
            cam.view.x1 = mxBI + ((cam.view.x1 - mxBI) * zoomFactorOutBI / PRECISION_SCALE);
        } else {
            if (currentWidth > 0n) {
                const scaleToLimitBI = (maxAllowedWidthBI * PRECISION_SCALE) / currentWidth;
                cam.view.x0 = mxBI + ((cam.view.x0 - mxBI) * scaleToLimitBI / PRECISION_SCALE);
                cam.view.x1 = mxBI + ((cam.view.x1 - mxBI) * scaleToLimitBI / PRECISION_SCALE);
            }
        }
        moved = true;
    }

    if (moved) {
        clampViewportBounds();
        render();
    }

    requestAnimationFrame(updateKeyboardInput);
}


window.addEventListener("touchstart", (e) => {
    if (window.isSettingsOpen) return;
    if (e.target === canvas) e.preventDefault();
    cam.view.mouse.isDown = true;
    cam.view.mouse.lastX = e.touches[0].clientX;
    cam.view.mouse.lastY = e.touches[0].clientY;
}, { passive: false });

window.addEventListener("touchmove", (e) => {
    if (window.isSettingsOpen || !cam.view.mouse.isDown) return;
    if (e.target === canvas) e.preventDefault();

    const dxBI = toBigInt(e.touches[0].clientX - cam.view.mouse.lastX);
    const dy = e.touches[0].clientY - cam.view.mouse.lastY;
    const mxBI = toBigInt(e.touches[0].clientX);

    cam.view.x0 += dxBI;
    cam.view.x1 += dxBI;

    if (dy !== 0) {
        const zoomFactor = Math.max(0.05, 1 - (dy * config.zoomDragFactor));
        const zoomFactorBI = toBigInt(zoomFactor);

        const nextX0 = mxBI + ((cam.view.x0 - mxBI) * zoomFactorBI / PRECISION_SCALE);
        const nextX1 = mxBI + ((cam.view.x1 - mxBI) * zoomFactorBI / PRECISION_SCALE);
        const maxAllowedWidthBI = toBigInt(canvas.width * config.maxAllowedWidthFactor);
        const nextWidth = nextX1 - nextX0;

        if (nextWidth >= maxAllowedWidthBI) {
            cam.view.x0 = nextX0;
            cam.view.x1 = nextX1;
        } else {
            const currentWidth = cam.view.x1 - cam.view.x0;
            if (currentWidth > 0n) {
                const scaleToLimitBI = (maxAllowedWidthBI * PRECISION_SCALE) / currentWidth;
                cam.view.x0 = mxBI + ((cam.view.x0 - mxBI) * scaleToLimitBI / PRECISION_SCALE);
                cam.view.x1 = mxBI + ((cam.view.x1 - mxBI) * scaleToLimitBI / PRECISION_SCALE);
            }
        }
    }

    clampViewportBounds();

    cam.view.mouse.lastX = e.touches[0].clientX;
    cam.view.mouse.lastY = e.touches[0].clientY;
    render();
}, { passive: false });

window.addEventListener("touchend", () => cam.view.mouse.isDown = false);
window.addEventListener("touchcancel", () => cam.view.mouse.isDown = false);

updateKeyboardInput();
init();