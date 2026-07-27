// --- DOM & Canvas Setup ---
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let ui = document.getElementById("textOverlay");
let dynamicContainer = document.getElementById("dynamicLabels");
let displayElem = document.getElementById("depthDisplay");
let sampleElem = document.getElementById("sampleLabel");
let fpsElem = document.getElementById("fpsCounter");

// --- State & Configurations ---
let PRECISION_SCALE = 10n ** 10n;
let lastFrameTime = performance.now();
let isInteracting = false;

let config = {
    // --- Canvas & Layout ---
    aspectratio: 2 / 3,
    BackgroundColor: "#000000",
    maxAllowedWidthFactor: 0.1,

    // --- Controls & Navigation ---
    panSpeedBaseFactor: 0.5,
    zoomSpeedBase: 10.0,
    zoomDragFactor: 0.01,
    wheelZoomIn: 1.5,
    wheelZoomOut: 2 / 3,
    shiftMultiplier: 3.0,
    ctrlMultiplier: 0.25,
    ZoomIntoMouse: false,

    // --- Interactive & Rendering Modes ---
    modes: [0],
    MathstickMode: false,
    DiagonalTickArrangement: true,
    HarmonicInvtervalSpacing: false,
    MultipleNotationOnSample: false,
    EnableOrdinalFinder: false,
    SlowMode: false,

    // --- UI & HUD Visibility ---
    ShowHUD: true,
    ShowLegends: true,
    ShowTitle: true,
    ShowFPS: true,
    ShowDepthAdjustGui: true,
    ShowOrdinalNotationConfigGui: true,
    AlwaysShowDivisionOnIdle: false,
    AlwaysShowDivisionOnInteraction: true,
    //AlwaysShowMiddleNumberLineDivision: false,

    // --- Element Toggles (Show / Hide) ---
    ShowTick: true,
    ShowSample: true,
    ShowLabel: true,
    ShowTimelineLabel: true,

    // --- Element Coloring Toggles ---
    ColorTick: true,
    ColorSample: false,
    ColorLabel: false,
    ColorTimelineLabel: false,

    // --- Color Palette ---
    DefaultTickColor: '#a0a0a0',
    DefaultTimelineLabelColor: "#808080",
    DefaultSampleColor: '#ffffff',
    DefaultLabelColor: '#ffffff',
    ScreenDivisionLineColor: "#0000ff",
    FPSLabelColor: "#9083ff",
    DepthAdjustGuiColor: "#ffffff",
    //TitleColor: "#ffffff",
    //AddNotationBtnColor: "#"
    //RemoveNotationBtnColor: "#"
    //SelectNotationBoxColor: "#"
    //MiddleNumberLineDivisionColor: "#"

    // --- Ticks Properties ---
    TickSpacing: 1,
    Tickheight: 0.05,
    TickWidth: 2,
    TickAnchorPoint: 0.5,

    // --- Labels & Spacing ---
    labelscount: 8,
    LabelBetweenTimelineSpacing: 30,
    LabelBetweenTickSpacing: 5,
    LabelBetweenLabelSpacing: 25,
    TickBetweenLabelXoffest: -5,

    // --- Computation & Performance Limits ---
    fpsPrecision: 1,
    MaxIntervalsDivision: -1,
    MaxIntervalDepth: -1,
    BigIntPrecisionMantissa: 8
};

let cam = {
    w: 0,
    h: 0,
    yStart: 0,
    yEnd: 0,
    tHeight: 0,
    ilxw: 0,
    fps: 0,
    lastKeyboardTime: performance.now(),
    view: {
        x0: 0n,
        x1: 0n,
        mouse: { x: 0, y: 0, isDown: false, lastX: 0, lastY: 0 }
    },
    ticks: [],
    impor: [],
    labelsToDraw: [],
    samplerBd: 1e20,
    samplerOrd: null,
    activeKeys: {},
    history: [],
    selection: { active: false, startX: 0, currentX: 0, startY: 0, currentY: 0 }
};

// Selection Box Setup
let selectionBox = document.createElement("div");

Object.assign(selectionBox.style, {
    position: "absolute",
    background: "rgba(0, 150, 255, 0.2)",
    border: "1px solid rgba(0, 150, 255, 0.8)",
    pointerEvents: "none",
    display: "none",
    zIndex: "100"
});
document.body.appendChild(selectionBox);

// Division Line Setup
let divisionLine = document.createElement("div");
Object.assign(divisionLine.style, {
    position: "absolute",
    top: "0",
    left: "50%",
    width: "2px",
    height: "100%",
    backgroundColor: config.ScreenDivisionLineColor,
    transform: "translateX(-50%)",
    pointerEvents: "none",
    zIndex: "90",
    display: "none"
});
document.body.appendChild(divisionLine);

function updateDivisionLine() {
    // Check if mouse is down or navigation keys are held
    let isInteracting = cam.view.mouse.isDown ||
        cam.activeKeys["arrowleft"] ||
        cam.activeKeys["arrowright"] ||
        cam.activeKeys["arrowup"] ||
        cam.activeKeys["arrowdown"];

    let shouldShow = (isInteracting && config.AlwaysShowDivisionOnInteraction) ||
        (!isInteracting && config.AlwaysShowDivisionOnIdle);

    divisionLine.style.display = shouldShow ? "block" : "none";
    divisionLine.style.backgroundColor = config.ScreenDivisionLineColor;
}

// --- Math & BigInt Conversion Helpers ---
function toBigInt(num) {
    return BigInt(Math.round(num * 1e6)) * (PRECISION_SCALE / 1000000n);
}

function toNum(big) {
    return PRECISION_SCALE === 0n ? 0 : Number(big) / Number(PRECISION_SCALE);
}

function converge1BigInt(a, b, rescale = 1) {
    let rescaleBI = toBigInt(rescale * config.aspectratio);
    return b + ((a - b) * rescaleBI / PRECISION_SCALE);
}

function updateAdaptivePrecisionScale() {
    let currentWidth = Number(cam.view.x1 - cam.view.x0);

    if (!currentWidth || currentWidth <= 0) {
        PRECISION_SCALE = 10n ** 10n;
        return;
    }

    let zoomMagnitude = Number(PRECISION_SCALE) / currentWidth;
    let log10Zoom = Math.log10(Math.max(1, zoomMagnitude));
    let requiredDigits = Math.max(10, Math.floor(log10Zoom) + config.BigIntPrecisionMantissa);
    let nextScale = 10n ** BigInt(requiredDigits);

    if (nextScale !== PRECISION_SCALE) {
        let oldScale = PRECISION_SCALE;
        cam.view.x0 = (cam.view.x0 * nextScale) / oldScale;
        cam.view.x1 = (cam.view.x1 * nextScale) / oldScale;
        PRECISION_SCALE = nextScale;
    }
}

// --- Canvas & Rendering Helpers ---
function clearCanvas() {
    ctx.fillStyle = config.BackgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawLine(x1, y1, x2, y2, color, lineWidth = 2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function createTextLabel(text, color, x, y, alignX, alignY, font) {
    let label = document.createElement("div");
    label.className = "textLabel";
    label.innerHTML = text;

    let tx = "0", ty = "0";
    if (alignX === "center") tx = "-50%";
    else if (alignX === "right") tx = "-100%";

    if (alignY === "middle") ty = "-50%";
    else if (alignY === "bottom") ty = "-100%";

    Object.assign(label.style, {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        color: color,
        font: font,
        transform: `translate(${tx}, ${ty})`
    });

    dynamicContainer.appendChild(label);
    return label;
}

function clearTextLabels() {
    dynamicContainer.replaceChildren();
}

function blendColorWithBrightness(hexColor, b) {
    let cVal = parseInt(hexColor.replace("#", ""), 16);
    let r = (cVal >> 16) & 0xff;
    let g = (cVal >> 8) & 0xff;
    let bChan = cVal & 0xff;

    if (b <= 255) {
        let scale = b / 255;
        r = Math.floor(r * scale);
        g = Math.floor(g * scale);
        bChan = Math.floor(bChan * scale);
    } else {
        let boost = Math.min(0x80, b - 256);
        r = Math.min(255, r + boost);
        g = Math.min(255, g + boost);
        bChan = Math.min(255, bChan + boost);
    }

    return `rgb(${r}, ${g}, ${bChan})`;
}

// --- Computation & Tree Logic ---
function initTicks(width) {
    let size = Math.ceil(width);
    cam.ticks = new Array(size).fill(null);
    cam.impor = new Array(size).fill(0);
    cam.labelsToDraw = [];
}

function importanceSeg(x0, x1, width) {
    if (x0 <= 0 || x0 > width) return;
    let idx = Math.max(0, Math.min(cam.ticks.length - 1, Math.floor(x0)));
    cam.impor[idx] = Math.max(cam.impor[idx], x1 - x0);
}

function tickmark(x0, x1, o0, width) {
    if (x0 < 0 || x0 >= width) return;
    importanceSeg(x0, x1, width);
    let idx = Math.max(0, Math.min(cam.ticks.length - 1, Math.floor(x0)));
    let l = x1 - x0;
    if (!cam.ticks[idx] || l > (cam.ticks[idx].importance || 0)) {
        cam.ticks[idx] = {
            color: notation.classifyOrdinal(o0),
            ord: o0,
            importance: l
        };
    }
}

function tickmarkLabel(x0, x1, o0, width) {
    if (x0 < 0 || x0 >= width) return;
    let idx = Math.max(0, Math.min(cam.impor.length - 1, Math.floor(x0)));
    cam.labelsToDraw.push({ x: x0, ord: o0, impor: cam.impor[idx] || 0 });
}

function segmentBigInt(x0, x1, o0, o1, epsBI, xminBI, xmaxBI, depth, lefts, callback, widthNum) {
    if (x1 <= xminBI || x0 > xmaxBI) return;

    let x0Num = toNum(x0);
    let x1Num = toNum(x1);
    importanceSeg(x0Num, x1Num, widthNum);

    if ((x1 - x0) < epsBI || (config.MaxIntervalDepth >= 0 && depth >= config.MaxIntervalDepth)) {
        callback(x0Num, x1Num, o0, widthNum);
        return;
    }

    if (notation.cmp(o1, notation.Limit) === 0 || (!notation.isSuccessor(o1) && notation.cmp(o1, notation.Zero) !== 0)) {
        let rescale = config.HarmonicInvtervalSpacing ? 1 : 2.0 / (lefts + 2);
        let top = x1 - epsBI;
        let s_x0 = x0, s_x1 = x0;
        let n = 0;

        for (n = 0; s_x0 < top && s_x0 < xmaxBI; n++) {
            if (n > 0) s_x0 = s_x1;
            s_x1 = converge1BigInt(s_x0, x1, 1);
            if (n > config.MaxIntervalsDivision && config.MaxIntervalsDivision > -1) break;
        }

        let m = n + 2;
        let seq = Array.from({ length: m }, (_, idx) => notation.fs(o1, idx));

        let ofs = 0;
        for (ofs = 0; ofs < m && notation.cmp(seq[ofs], o0) <= 0; ofs++);

        while (ofs + n > m) {
            m = ofs + n;
            seq = Array.from({ length: m }, (_, idx) => notation.fs(o1, idx));
            for (ofs = 0; ofs < m && notation.cmp(seq[ofs], o0) <= 0; ofs++);
        }

        if (ofs < m && seq[ofs].length > 0 && seq[ofs][seq[ofs].length - 1] === 0) {
            rescale = 1;
        }

        s_x0 = x0;
        s_x1 = x0;
        for (n = 0; s_x0 < top && s_x0 < xmaxBI && ofs + n < m; n++) {
            if (n > 0) s_x0 = s_x1;
            s_x1 = converge1BigInt(s_x0, x1, n ? 1 : rescale);

            let next_o0 = (n === 0) ? o0 : seq[ofs + n - 1];
            let next_o1 = seq[ofs + n];

            segmentBigInt(s_x0, s_x1, next_o0, next_o1, epsBI, xminBI, xmaxBI, depth + 1, n ? 0 : lefts + 1, callback, widthNum);
        }
    } else {
        callback(x0Num, x1Num, o0, widthNum);
    }
}

function computeTree(width) {
    initTicks(width);

    let epsBI = toBigInt(config.TickSpacing);
    let xminBI = 0n;
    let xmaxBI = toBigInt(width);

    segmentBigInt(cam.view.x0, cam.view.x1, notation.Zero, notation.Limit, epsBI, xminBI, xmaxBI, 0, 0, tickmark, width);

    tickmarkLabel(toNum(cam.view.x0), toNum(cam.view.x0), notation.Zero, width);

    let labelEpsBI = toBigInt(canvas.width / config.labelscount);
    segmentBigInt(cam.view.x0, cam.view.x1, notation.Zero, notation.Limit, labelEpsBI, xminBI, xmaxBI, 0, 0, tickmarkLabel, width);

    tickmarkLabel(toNum(cam.view.x1), toNum(cam.view.x1), notation.Limit, width);
}

function samplerCallback(x0, x1, o0, xmax) {
    let d = Math.abs(x0 - (xmax - 0.5));
    if (d < cam.samplerBd) {
        cam.samplerBd = d;
        cam.samplerOrd = o0;
    }
}

function sampleHighPrecision(x, width) {
    if (!config.ShowSample) {sampleElem.innerHTML = '';return;}
    cam.samplerBd = 1e20;
    cam.samplerOrd = null;
    sampleElem.innerHTML = `<div></div>`;

    let xBI = toBigInt(x);
    if (xBI <= cam.view.x0) {
        cam.samplerOrd = notation.Zero;
        cam.samplerBd = 0;
    } else if (xBI >= cam.view.x1) {
        cam.samplerOrd = notation.Limit;
        cam.samplerBd = 0;
    } else {
        segmentBigInt(
            cam.view.x0, cam.view.x1,
            notation.Zero, notation.Limit,
            toBigInt(1), xBI, toBigInt(x + 1),
            0, 0, samplerCallback, width
        );
    }

    if (cam.samplerBd < 1e20 && cam.samplerOrd !== null) {
        let htmlContent = "";
        if (config.MultipleNotationOnSample) {
            config.modes.forEach(modeIdx => {
                const mode = notation.DisplayName[modeIdx];
                const ordStr = notation.display(cam.samplerOrd, mode);
                htmlContent += `<div>${ordStr}</div>`;
            });
        } else {
            const mode = notation.DisplayName[config.modes[0]];
            const ordStr = notation.display(cam.samplerOrd, mode);
            htmlContent = `<div>${ordStr}</div>`;
        }
        sampleElem.innerHTML = htmlContent;
        sampleElem.style.color = config.ColorSample ? notation.classifyOrdinal(cam.samplerOrd) : config.DefaultSampleColor;
    }
}

function drawTimelineLabels() {
    let h = canvas.height;

    cam.labelsToDraw.forEach((lbl) => {
        let px = lbl.x;
        let tH = config.MathstickMode ? cam.tHeight * lbl.impor : cam.tHeight;

        let py = config.DiagonalTickArrangement
            ? h * px / canvas.width - tH * (1 - config.TickAnchorPoint) - config.LabelBetweenTickSpacing
            : cam.h / 2 - tH * (1 - config.TickAnchorPoint) - config.LabelBetweenTickSpacing;

        let totalModes = config.modes.length;
        let totalStackHeight = (totalModes - 1) * config.LabelBetweenLabelSpacing;

        // 1. Check if THIS specific label has an alias
        let aliasName = null;
        notation.Aliases.forEach(([name, defStr]) => {
            if (notation.cmp(lbl.ord, defStr) === 0) {
                aliasName = name;
            }
        });

        let topLimit = totalStackHeight + 22;
        if (config.ShowTimelineLabel && aliasName) {
            topLimit += config.LabelBetweenTimelineSpacing;
        }

        if (py < topLimit && config.MathstickMode) {
            py = topLimit;
        }

        if (config.ShowLabel) {
            config.modes.forEach((modeIdx, i) => {
                let mode = window.notation.DisplayName[modeIdx];
                let labelString = notation.display(lbl.ord, mode);
                let color = config.ColorLabel ? notation.classifyOrdinal(lbl.ord) : config.DefaultLabelColor;
                let currentY = py - ((totalModes - 1 - i) * config.LabelBetweenLabelSpacing);

                createTextLabel(labelString, color, px + config.TickBetweenLabelXoffest, currentY, "left", "bottom", "22px Serif");
            });
        }

        if (config.ShowTimelineLabel && aliasName) {
            let aliasY = py - totalStackHeight - config.LabelBetweenTimelineSpacing;
            createTextLabel(aliasName, config.DefaultTimelineLabelColor, px + config.TickBetweenLabelXoffest, aliasY, "left", "bottom", "italic 20px Serif");
        }
    });
}

function drawHUD() {
    let py = 0;
    let px = canvas.width - 7;
    if (config.ShowTitle) { createTextLabel(notation.title, "rgb(255,255,255)", px, 0, "right", "top", "bold 30px Serif"); py = 30 }

    if (config.ShowLegends) notation.ordinalTypes.forEach(([name, color]) => { createTextLabel(name, color, px, py, "right", "top", "26px Serif"); py += 26; });

    if (config.ShowHUD) {
        let hudItems = [];
        if (config.SlowMode) { hudItems.push({ text: 'Slow Mode Enabled', color: 'rgb(255, 0, 0)' }); }
        if (config.ZoomIntoMouse) { hudItems.push({ text: 'Zoom Into Mouse Enabled', color: 'rgb(0, 255, 0)' }); }
        let lineHeight = 20;
        hudItems.forEach((item, index) => { createTextLabel(item.text, item.color, 0, index * lineHeight, "left", "top", "20px Serif"); });
    }
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
    cam.tHeight = cam.h * config.Tickheight;
    cam.ilxw = 1.0 / Math.log(cam.w);

    // Define a safe maximum height for the canvas (e.g., twice the screen height)
    // This prevents graphics engine crashes while still making the line look like it goes off-screen
    const MAX_SAFE_HEIGHT = cam.h * 2;

    if (config.ShowTick) {
        for (let n = 0; n < cam.ticks.length; n++) {
            if (cam.ticks[n]) {
                let x = n;
                let y = config.DiagonalTickArrangement
                    ? cam.yStart + (cam.yEnd - cam.yStart) * (n / cam.w)
                    : cam.h / 2;

                // 1. Calculate and sanitize brightness
                let b = 128.0 + 256.0 * Math.log(1.0 + cam.impor[n]) * cam.ilxw;
                if (!isFinite(b)) b = 255; // Fallback if math results in Infinity/NaN
                b = Math.max(0, Math.min(b, 255)); // Clamp between 0 and 255

                let blendedColor = config.ColorTick
                    ? blendColorWithBrightness(cam.ticks[n].color, b)
                    : blendColorWithBrightness(config.DefaultTickColor, b);

                // 2. Calculate and clamp the tick height
                let currentTickHeight = config.MathstickMode ? cam.tHeight * cam.impor[n] : cam.tHeight;

                // Fallback for Infinity or NaN
                if (!isFinite(currentTickHeight)) {
                    currentTickHeight = MAX_SAFE_HEIGHT;
                }
                // Clamp to our safe maximum to prevent canvas floating point breakage
                currentTickHeight = Math.min(currentTickHeight, MAX_SAFE_HEIGHT);

                ctx.globalAlpha = 1.0;
                drawLine(
                    x, y - currentTickHeight * (1 - config.TickAnchorPoint),
                    x, y + currentTickHeight * config.TickAnchorPoint,
                    blendedColor, config.TickWidth
                );
            }
        }
    }

    ctx.globalAlpha = 1.0;
    drawTimelineLabels();
    sampleHighPrecision(cam.w / 2, cam.w);
    drawHUD();
}

function refreshLoop() {
    requestAnimationFrame(() => {
        let now = performance.now();
        let deltaTime = now - lastFrameTime;
        lastFrameTime = now;
        cam.fps = 1000 / deltaTime;
        fpsElem.innerText = cam.fps.toFixed(config.fpsPrecision) + 'fps';

        updateDivisionLine()

        refreshLoop();
    });
}
refreshLoop();

// --- Viewport & Camera Helpers ---
function resizeCanvas() {
    let oldWidth = canvas.width;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (cam.view?.x0 !== undefined && cam.view?.x1 !== undefined && oldWidth > 0) {
        let widthRatioBI = toBigInt(canvas.width / oldWidth);
        cam.view.x0 = (cam.view.x0 * widthRatioBI) / PRECISION_SCALE;
        cam.view.x1 = (cam.view.x1 * widthRatioBI) / PRECISION_SCALE;
    }
}

function init() {
    PRECISION_SCALE = 10n ** 10n;
    cam.history = [];
    if (cam.selection) cam.selection.active = false;
    selectionBox.style.display = "none";

    resizeCanvas();

    let minZoom = canvas.width * 0.8;
    cam.view.x0 = toBigInt(0.5 * (canvas.width - minZoom));
    cam.view.x1 = toBigInt(0.5 * (canvas.width + minZoom));
    cam.lastKeyboardTime = performance.now();

    render();
}

function clampViewportBounds() {
    let minOverlap = toBigInt(canvas.width * 0.1);
    let currentWidth = cam.view.x1 - cam.view.x0;
    let canvasWidthBI = toBigInt(canvas.width);

    if (cam.view.x0 > canvasWidthBI - minOverlap) {
        cam.view.x0 = canvasWidthBI - minOverlap;
        cam.view.x1 = cam.view.x0 + currentWidth;
    }
    if (cam.view.x1 < minOverlap) {
        cam.view.x1 = minOverlap;
        cam.view.x0 = cam.view.x1 - currentWidth;
    }
}

function applySelectionZoom() {
    if (!config.SlowMode || !cam.selection.active) return;
    cam.selection.active = false;
    selectionBox.style.display = "none";

    let xStart = Math.min(cam.selection.startX, cam.selection.currentX);
    let xEnd = Math.max(cam.selection.startX, cam.selection.currentX);

    if (xEnd - xStart > 5) {
        cam.history.push({ x0: cam.view.x0, x1: cam.view.x1 });

        let W_BI = toBigInt(canvas.width);
        let xStartBI = toBigInt(xStart);
        let boxW_BI = toBigInt(xEnd - xStart);

        cam.view.x0 = (cam.view.x0 - xStartBI) * W_BI / boxW_BI;
        cam.view.x1 = (cam.view.x1 - xStartBI) * W_BI / boxW_BI;

        clampViewportBounds();
        render();
    }
}

function undoViewport() {
    if (window.isSettingsOpen) return;
    if (cam.history?.length > 0) {
        let prevState = cam.history.pop();
        cam.view.x0 = prevState.x0;
        cam.view.x1 = prevState.x1;
        return true;
    }
    return false;
}

// --- Interaction Handlers ---
function getEventCoords(e) {
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

function handlePointerDown(e) {
    if (window.isSettingsOpen) return;
    let { x, y } = getEventCoords(e);

    cam.view.mouse.isDown = true;
    cam.view.mouse.lastX = x;
    cam.view.mouse.lastY = y;

    if (config.SlowMode) {
        cam.selection.active = true;
        cam.selection.startX = x;
        cam.selection.startY = y;
        cam.selection.currentX = x;
        cam.selection.currentY = y;

        Object.assign(selectionBox.style, {
            left: `${x}px`,
            top: `${y}px`,
            width: "0px",
            height: "0px",
            display: "block"
        });
    }
}

function handlePointerMove(e) {
    if (window.isSettingsOpen || !cam.view.mouse.isDown) return;
    let { x: clientX, y: clientY } = getEventCoords(e);

    if (config.SlowMode) {
        cam.selection.currentX = clientX;
        cam.selection.currentY = clientY;

        let x = Math.min(cam.selection.startX, cam.selection.currentX);
        let y = Math.min(cam.selection.startY, cam.selection.currentY);
        let w = Math.abs(cam.selection.currentX - cam.selection.startX);
        let h = Math.abs(cam.selection.currentY - cam.selection.startY);

        Object.assign(selectionBox.style, {
            left: `${x}px`,
            top: `${y}px`,
            width: `${w}px`,
            height: `${h}px`
        });
        return;
    }

    let dxBI = toBigInt(clientX - cam.view.mouse.lastX);
    let dy = clientY - cam.view.mouse.lastY;

    cam.view.x0 += dxBI;
    cam.view.x1 += dxBI;

    if (dy !== 0) {
        let zoomFactor = Math.max(0.05, 1 - (dy * config.zoomDragFactor));
        let zoomFactorBI = toBigInt(zoomFactor);
        let targetX = config.ZoomIntoMouse ? clientX : (canvas.width / 2);
        let mxBI = toBigInt(targetX);

        let nextX0 = mxBI + ((cam.view.x0 - mxBI) * zoomFactorBI / PRECISION_SCALE);
        let nextX1 = mxBI + ((cam.view.x1 - mxBI) * zoomFactorBI / PRECISION_SCALE);
        let maxAllowedWidthBI = toBigInt(canvas.width * config.maxAllowedWidthFactor);

        if ((nextX1 - nextX0) >= maxAllowedWidthBI) {
            cam.view.x0 = nextX0;
            cam.view.x1 = nextX1;
        } else {
            let currentWidth = cam.view.x1 - cam.view.x0;
            if (currentWidth > 0n) {
                let scaleToLimitBI = (maxAllowedWidthBI * PRECISION_SCALE) / currentWidth;
                cam.view.x0 = mxBI + ((cam.view.x0 - mxBI) * scaleToLimitBI / PRECISION_SCALE);
                cam.view.x1 = mxBI + ((cam.view.x1 - mxBI) * scaleToLimitBI / PRECISION_SCALE);
            }
        }
    }

    clampViewportBounds();
    cam.view.mouse.lastX = clientX;
    cam.view.mouse.lastY = clientY;
    render();
}

function handlePointerUp() {
    cam.view.mouse.isDown = false;
    applySelectionZoom();
}

// --- Event Listeners ---
window.addEventListener("resize", () => {
    resizeCanvas();
    render();
});

window.addEventListener("mousedown", handlePointerDown);
window.addEventListener("mousemove", handlePointerMove);
window.addEventListener("mouseup", handlePointerUp);
window.addEventListener("mouseleave", handlePointerUp);

window.addEventListener("touchstart", (e) => {
    if (e.target === canvas) e.preventDefault();
    handlePointerDown(e);
}, { passive: false });

window.addEventListener("touchmove", (e) => {
    if (e.target === canvas) e.preventDefault();
    handlePointerMove(e);
}, { passive: false });

window.addEventListener("touchend", handlePointerUp);
window.addEventListener("touchcancel", handlePointerUp);

window.addEventListener("wheel", (e) => {
    if (window.isSettingsOpen || config.SlowMode) return;
    e.preventDefault();

    let zoomFactor = e.deltaY < 0 ? config.wheelZoomIn : config.wheelZoomOut;
    let zoomFactorBI = toBigInt(zoomFactor);
    let mxBI = toBigInt(e.clientX);
    let maxAllowedWidthBI = toBigInt(canvas.width * config.maxAllowedWidthFactor);

    if ((cam.view.x1 - cam.view.x0) >= maxAllowedWidthBI || e.deltaY < 0) {
        cam.view.x0 = mxBI + ((cam.view.x0 - mxBI) * zoomFactorBI / PRECISION_SCALE);
        cam.view.x1 = mxBI + ((cam.view.x1 - mxBI) * zoomFactorBI / PRECISION_SCALE);
    }
    clampViewportBounds();
    render();
}, { passive: false });

window.addEventListener("keydown", (e) => {
    if (window.isSettingsOpen) return;
    let key = e.key.toLowerCase();
    cam.activeKeys[key] = true;
    cam.activeKeys[e.code] = true;

    let actionTriggered = false;

    if (key === "z" && (e.ctrlKey || e.metaKey)) {
        actionTriggered = undoViewport();
    } else if (key === "a") {
        config.MaxIntervalDepth = Math.max(-1, config.MaxIntervalDepth - 1);
        displayElem.innerText = config.MaxIntervalDepth === -1 ? "Depth: Infinite" : `Depth: ${config.MaxIntervalDepth}`;
        actionTriggered = true;
    } else if (key === "s" && !(e.shiftKey || e.metaKey)) {
        config.MaxIntervalDepth = config.MaxIntervalDepth === -1 ? 0 : config.MaxIntervalDepth + 1;
        displayElem.innerText = config.MaxIntervalDepth === -1 ? "Depth: Infinite" : `Depth: ${config.MaxIntervalDepth}`;
        actionTriggered = true;
    } else if (key === "f") {
        config.EnableOrdinalFinder = !(config.EnableOrdinalFinder)
        checkAndInitOrdinalFinder();
    } else if (key === "m") {
        config.MathstickMode = !(config.MathstickMode)
        config.TickBetweenLabelXoffest = config.MathstickMode ? 5 : -5
        config.Tickheight = config.MathstickMode ? 0.0035 : 0.05
        render();
    } else if (key === "h") {
        config.HarmonicInvtervalSpacing = !(config.HarmonicInvtervalSpacing)
        render();
    } else if (key === "s" && (e.shiftKey || e.metaKey)) {
        config.SlowMode = !(config.SlowMode)
        alert((config.SlowMode ? "Enabled" : "Disabled") + " Slow Mode");
        render();
    } else if (key === "d") {
        config.DiagonalTickArrangement = !(config.DiagonalTickArrangement)
        render();
    } else if (key === "z" && !(e.ctrlKey || e.metaKey)) {
        config.ZoomIntoMouse = !(config.ZoomIntoMouse)
        alert((config.ZoomIntoMouse ? "Enabled" : "Disabled") + " Zoom into Mouse");
        render();
    }

    if (actionTriggered) render();
});

window.addEventListener("keyup", (e) => {
    if (window.isSettingsOpen) return;
    cam.activeKeys[e.key.toLowerCase()] = false;
    cam.activeKeys[e.code] = false;
});

function updateKeyboardInput() {
    if (window.isSettingsOpen) {
        requestAnimationFrame(updateKeyboardInput);
        return;
    }

    let now = performance.now();
    let dt = Math.min((now - cam.lastKeyboardTime) / 1000, 0.1);
    cam.lastKeyboardTime = now;

    if (cam.activeKeys["shift"]) {
        dt *= config.shiftMultiplier;
    } else if (cam.activeKeys["control"] || cam.activeKeys["ctrl"]) {
        dt *= config.ctrlMultiplier;
    }

    let moved = false;

    if (!config.SlowMode) {
        let panSpeedBI = toBigInt(canvas.width * config.panSpeedBaseFactor * dt);
        let zoomFactorInBI = toBigInt(Math.pow(config.zoomSpeedBase, dt));
        let zoomFactorOutBI = toBigInt(Math.pow(1 / config.zoomSpeedBase, dt));
        let mxBI = toBigInt(canvas.width / 2);

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
            let currentWidth = cam.view.x1 - cam.view.x0;
            let maxAllowedWidthBI = toBigInt(canvas.width * config.maxAllowedWidthFactor);
            let targetWidth = currentWidth * zoomFactorOutBI / PRECISION_SCALE;

            if (targetWidth >= maxAllowedWidthBI) {
                cam.view.x0 = mxBI + ((cam.view.x0 - mxBI) * zoomFactorOutBI / PRECISION_SCALE);
                cam.view.x1 = mxBI + ((cam.view.x1 - mxBI) * zoomFactorOutBI / PRECISION_SCALE);
            } else if (currentWidth > 0n) {
                let scaleToLimitBI = (maxAllowedWidthBI * PRECISION_SCALE) / currentWidth;
                cam.view.x0 = mxBI + ((cam.view.x0 - mxBI) * scaleToLimitBI / PRECISION_SCALE);
                cam.view.x1 = mxBI + ((cam.view.x1 - mxBI) * scaleToLimitBI / PRECISION_SCALE);
            }
            moved = true;
        }
    }

    if (moved) {
        clampViewportBounds();
        render();
    }

    requestAnimationFrame(updateKeyboardInput);
}

// Start Main Application
updateKeyboardInput();
init();