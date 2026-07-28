function blendColorWithBrightness(hexColor, b) {
    // Parse hex color string (e.g., "#d40000" or similar from classifyOrdinal)
    let cVal = parseInt(hexColor.replace("#", ""), 16);
    let r = (cVal >> 16) & 0xff;
    let g = (cVal >> 8) & 0xff;
    let bChan = cVal & 0xff;

    if (b <= 255) {
        // Equivalent to and24(0x10101 * b, col)
        let scale = b / 255;
        r = Math.floor(r * scale);
        g = Math.floor(g * scale);
        bChan = Math.floor(bChan * scale);
    } else {
        // Equivalent to or24 logic for brighter highlights
        let boost = Math.min(0x80, b - 256);
        r = Math.min(255, r + boost);
        g = Math.min(255, g + boost);
        bChan = Math.min(255, bChan + boost);
    }

    return `rgb(${r}, ${g}, ${bChan})`;
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

            // Use direct color channel blending instead of global alpha opacity
            const blendedColor = blendColorWithBrightness(cam.ticks[n].color, b);
            
            ctx.globalAlpha = 1.0; // Keep full alpha, rely on RGB modification
            drawLine(x, y - cam.tHeight, x, y, blendedColor, 2);
        }
    }
    ctx.globalAlpha = 1.0;

    drawTimelineLabels();
    drawLine(cam.w / 2, 0, cam.w / 2, cam.h, "rgb(0, 0, 255)", 2);
    sampleHighPrecision(cam.w / 2, cam.w);
    drawHUD();

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
    PRECISION_SCALE = 10n ** 10n;

    cam.history = [];

    if (cam.selection) cam.selection.active = false;
    if (typeof selectionBox !== 'undefined') selectionBox.style.display = "none";

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

function applySelectionZoom() {
    if (!config.SlowMode || !cam.selection.active) return;
    cam.selection.active = false;
    selectionBox.style.display = "none";

    const xStart = Math.min(cam.selection.startX, cam.selection.currentX);
    const xEnd = Math.max(cam.selection.startX, cam.selection.currentX);

    if (xEnd - xStart > 5) {
        cam.history.push({ x0: cam.view.x0, x1: cam.view.x1 });

        const W_BI = toBigInt(canvas.width);
        const xStartBI = toBigInt(xStart);
        const boxW_BI = toBigInt(xEnd - xStart);

        const v0_new = (cam.view.x0 - xStartBI) * W_BI / boxW_BI;
        const v1_new = (cam.view.x1 - xStartBI) * W_BI / boxW_BI;

        cam.view.x0 = v0_new;
        cam.view.x1 = v1_new;

        clampViewportBounds();
        render();
    }
}
const selectionBox = document.createElement("div");
selectionBox.style.position = "absolute";
selectionBox.style.background = "rgba(0, 150, 255, 0.2)";
selectionBox.style.border = "1px solid rgba(0, 150, 255, 0.8)";
selectionBox.style.pointerEvents = "none"; // Ensures it doesn't block mouse events
selectionBox.style.display = "none";
selectionBox.style.zIndex = "100";
document.body.appendChild(selectionBox);

window.addEventListener("resize", () => {
    resizeCanvas();
    render();
});

window.addEventListener("mousedown", (e) => {
    if (window.isSettingsOpen) return;
    cam.view.mouse.isDown = true;
    cam.view.mouse.lastX = e.clientX;
    cam.view.mouse.lastY = e.clientY;

    if (config.SlowMode) {
        cam.selection.active = true;
        cam.selection.startX = e.clientX;
        cam.selection.startY = e.clientY;

        cam.selection.currentX = e.clientX;
        cam.selection.currentY = e.clientY;
        selectionBox.style.left = e.clientX + "px";
        selectionBox.style.top = e.clientY + "px";
        selectionBox.style.width = "0px";
        selectionBox.style.height = "0px";
        selectionBox.style.display = "block";
    }
});

window.addEventListener("mousemove", (e) => {
    if (window.isSettingsOpen || !cam.view.mouse.isDown) return;

    if (config.SlowMode) {
        cam.selection.currentX = e.clientX;
        cam.selection.currentY = e.clientY;

        // Update the HTML selection box dimensions
        const x = Math.min(cam.selection.startX, cam.selection.currentX);
        const y = Math.min(cam.selection.startY, cam.selection.currentY);
        const w = Math.abs(cam.selection.currentX - cam.selection.startX);
        const h = Math.abs(cam.selection.currentY - cam.selection.startY);

        selectionBox.style.left = x + "px";
        selectionBox.style.top = y + "px";
        selectionBox.style.width = w + "px";
        selectionBox.style.height = h + "px";
        return;
    }

    // Original panning/zooming logic
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
    if (window.isSettingsOpen || config.SlowMode) return; // Disable wheel zoom in SlowMode
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

window.addEventListener("mouseup", () => {
    cam.view.mouse.isDown = false;
    applySelectionZoom();
});
window.addEventListener("mouseleave", () => {
    cam.view.mouse.isDown = false;
    applySelectionZoom();
});

// Add this logic block to plot.js
function updateDepthDisplay() {
    const displayElem = document.getElementById("depthDisplay");
    if (displayElem) {
        displayElem.innerText = cam.view.maxDepth === -1 ? "Depth: Infinite" : `Depth: ${cam.view.maxDepth}`;
    }
}

function undoViewport() {
    if (config.SlowMode && cam.history && cam.history.length > 0) {
        const prevState = cam.history.pop();
        cam.view.x0 = prevState.x0;
        cam.view.x1 = prevState.x1;
        return true;
    }
    return false;
}

window.addEventListener("keydown", (e) => {
    if (window.isSettingsOpen) return;
    cam.activeKeys[e.key.toLowerCase()] = true;
    cam.activeKeys[e.code] = true;

    let actionTriggered = false;

    // -- Undo Logic --
    if (e.key.toLowerCase() === "z" && (e.ctrlKey || e.metaKey)) {
        if (undoViewport()) {
            actionTriggered = true;
        }
    }

    // Existing bindings
    if (e.key === "m") {
        config.modes[0] = (config.modes[0] + 1) % notation.DisplayName.length;
        actionTriggered = true;
    }
    if (e.key === "a") {
        cam.view.maxDepth = Math.max(-1, cam.view.maxDepth - 1);
        updateDepthDisplay();
        actionTriggered = true;
    }
    if (e.key === "s") {
        cam.view.maxDepth = cam.view.maxDepth === -1 ? 0 : cam.view.maxDepth + 1;
        updateDepthDisplay();
        actionTriggered = true;
    }

    if (actionTriggered) {
        render();
    }
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

    const now = performance.now();
    let dt = Math.min((now - cam.lastKeyboardTime) / 1000, 0.1);
    cam.lastKeyboardTime = now;

    if (cam.activeKeys["shift"]) {
        dt *= config.shiftMultiplier;
    } else if (cam.activeKeys["control"] || cam.activeKeys["ctrl"]) {
        dt *= config.ctrlMultiplier;
    }

    let moved = false;

    // Only process keyboard navigation if SlowMode is off
    if (!config.SlowMode) {
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

    if (config.SlowMode) {
        cam.selection.active = true;
        cam.selection.startX = e.touches[0].clientX;
        cam.selection.startY = e.touches[0].clientY;
        cam.selection.currentX = e.touches[0].clientX;
        cam.selection.currentY = e.touches[0].clientY;

        selectionBox.style.left = e.touches[0].clientX + "px";
        selectionBox.style.top = e.touches[0].clientY + "px";
        selectionBox.style.width = "0px";
        selectionBox.style.height = "0px";
        selectionBox.style.display = "block";
    }
}, { passive: false });

window.addEventListener("touchmove", (e) => {
    if (window.isSettingsOpen || !cam.view.mouse.isDown) return;
    if (e.target === canvas) e.preventDefault();

    if (config.SlowMode) {
        cam.selection.currentX = e.touches[0].clientX;
        cam.selection.currentY = e.touches[0].clientY;

        // Update the HTML selection box dimensions for touch
        const x = Math.min(cam.selection.startX, cam.selection.currentX);
        const y = Math.min(cam.selection.startY, cam.selection.currentY);
        const w = Math.abs(cam.selection.currentX - cam.selection.startX);
        const h = Math.abs(cam.selection.currentY - cam.selection.startY);

        selectionBox.style.left = x + "px";
        selectionBox.style.top = y + "px";
        selectionBox.style.width = w + "px";
        selectionBox.style.height = h + "px";

        return; // Prevent heavy render calls
    }

    // Original touch panning/zooming logic (SlowMode is OFF)
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

window.addEventListener("touchend", () => {
    cam.view.mouse.isDown = false;
    applySelectionZoom();
});
window.addEventListener("touchcancel", () => {
    cam.view.mouse.isDown = false;
    applySelectionZoom();
});

updateKeyboardInput();
init();