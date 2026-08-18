window.isSettingsOpen = false;

let initialConfigBackup = null;

const container = document.getElementById("notationSelectContainer");
const notationControls = document.getElementById("notationControls");
const fpsCounter = document.getElementById("fpsCounter");
const mobileDepthControls = document.getElementById("mobileDepthControls");
const mobileDepthControlsbtn = document.getElementsByClassName("mobileDepthControlsbtn");
const depthDisplay = document.getElementById("depthDisplay");
const AddNotationBtn = document.getElementById("AddNotationBtn");
const revertBtn = document.getElementById("revertBtn");
const resetBtn = document.getElementById("resetBtn");
const configToggleBtn = document.getElementById("configToggleBtn");
const hudStats = document.getElementById("hudStats");

const finderUI = document.getElementById('ordinalFinderContainer');

finderUI.addEventListener('keydown', (e) => e.stopPropagation());
finderUI.addEventListener('keyup', (e) => e.stopPropagation());

const setUI = document.getElementById("viewportZoomContainer");

setUI.addEventListener('keydown', (e) => e.stopPropagation());
setUI.addEventListener('keyup', (e) => e.stopPropagation());

const hintUI = document.getElementById('hint');
['touchstart', 'touchmove', 'touchend','mousedown', 'mousemove', 'mouseup', 'wheel', 'click'].forEach((eventType) => {
    hintUI.addEventListener(eventType, (e) => {
        e.stopPropagation();
    }, { passive: false });
});

// ==========================================
// IMPORT / EXPORT & LINK MANAGEMENT
// Uniform tags: source & href
// ==========================================

// Import custom .tnls or script file
function importTNLSFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        document.getElementById('codeInject').value = content;
        resetNotationsForSystem();
        executeCustomScript(content);
        alert(`Successfully imported: ${file.name}`);
    };
    reader.readAsText(file);
    event.target.value = '';
}

// 1. Export inline compressed script payload link using "source"
function exportToCodeLink() {
    const code = document.getElementById('codeInject').value.trim();
    if (!code) {
        alert("No script code found to export!");
        return;
    }

    if (typeof LZString === "undefined") {
        alert("LZString compression library not loaded yet.");
        return;
    }

    const compressed = LZString.compressToEncodedURIComponent(code);
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const shareableLink = `${baseUrl}#source=${compressed}`;

    navigator.clipboard.writeText(shareableLink).then(() => {
        alert("Inline script shareable link copied to clipboard!\n\nTag: source");
    }).catch(() => {
        prompt("Copy your link below:", shareableLink);
    });
}

// 2. Export external script URL link using "href"
function exportToUrlLink() {
    const defaultUrl = "https://raw.githubusercontent.com/.../script.js";
    const userScriptUrl = prompt("Enter the raw URL of the script to load:", defaultUrl);

    if (!userScriptUrl || !userScriptUrl.trim()) return;

    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const shareableLink = `${baseUrl}#href=${encodeURIComponent(userScriptUrl.trim())}`;

    navigator.clipboard.writeText(shareableLink).then(() => {
        alert("Script URL link copied to clipboard!\n\nTag: href");
    }).catch(() => {
        prompt("Copy your link below:", shareableLink);
    });
}

// Parse URL hash or search parameters for uniform tags: "source" and "href"
async function handleUrlParameters() {
    let rawQuery = window.location.hash ? window.location.hash.substring(1) : window.location.search.substring(1);
    const urlParams = new URLSearchParams(rawQuery);

    const sourceParam = urlParams.get('source');
    const hrefParam = urlParams.get('href');

    if (sourceParam) {
        try {
            const decompressed = LZString.decompressFromEncodedURIComponent(sourceParam);
            if (decompressed) {
                document.getElementById('codeInject').value = decompressed;
                resetNotationsForSystem();
                executeCustomScript(decompressed);
                return true;
            }
        } catch (e) {
            console.error("Failed to decompress source link payload:", e);
        }
    }

    if (hrefParam) {
        try {
            // Check if hrefParam matches a preset selection option
            const presetSelect = document.getElementById('presetSelect');
            if (presetSelect) {
                for (let option of presetSelect.options) {
                    if (option.value === hrefParam) {
                        presetSelect.value = hrefParam;
                        break;
                    }
                }
            }

            const response = await fetch(hrefParam);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const fetchedScript = await response.text();
            document.getElementById('codeInject').value = fetchedScript;
            resetNotationsForSystem();
            executeCustomScript(fetchedScript);
            return true;
        } catch (e) {
            alert(`Failed to load script from href link: ${e.message}`);
        }
    }

    return false;
}

// Update active URL parameter to keep URL clean using only "href"
function updateUrlHrefParam(scriptPath) {
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState(null, '', `${baseUrl}#href=${encodeURIComponent(scriptPath)}`);
}

// ==========================================
// CONFIG SLOT SAVING & LOADING (SLOTS 1-5)
// ==========================================

function saveConfigToSlot() {
    const slotSelect = document.getElementById("slotSelect");
    if (!slotSelect) return;

    const slotKey = `user_config_slot_${slotSelect.value}`;

    try {
        const jsonTextArea = document.getElementById("envConfigJson");
        let dataToSave = config;

        if (jsonTextArea.value.trim()) {
            dataToSave = JSON.parse(jsonTextArea.value.trim());
        }

        localStorage.setItem(slotKey, JSON.stringify(dataToSave));
        alert(`Configuration saved successfully to Slot ${slotSelect.value}!`);
    } catch (err) {
        alert("Failed to save config: " + err.message);
    }
}

function loadConfigFromSlot() {
    const slotSelect = document.getElementById("slotSelect");
    if (!slotSelect) return;

    const slotKey = `user_config_slot_${slotSelect.value}`;
    const savedData = localStorage.getItem(slotKey);

    if (!savedData) {
        alert(`Slot ${slotSelect.value} is empty!`);
        return;
    }

    try {
        const parsedConfig = JSON.parse(savedData);
        config = { ...config, ...parsedConfig };

        if (!config.modes || !Array.isArray(config.modes) || config.modes.length === 0) {
            config.modes = [0];
        }

        syncConfigToTextArea();
        updateNotationConfigUI();
        checkAndInitFloatingGui();
        applyingCSSUpdate();
        displayElem.innerText = config.MaxIntervalDepth === -1 ? "Depth: Infinite" : `Depth: ${config.MaxIntervalDepth}`;
        render();

        alert(`Configuration loaded successfully from Slot ${slotSelect.value}! ` + (config.SlowMode ? "Slow Mode Enabled" : ""));
    } catch (err) {
        alert("Failed to load config: " + err.message);
    }
}

// ==========================================
// CORE SETTINGS LOGIC
// ==========================================

function toggleConfigMenu() {
    const menu = document.getElementById('configMenu');
    window.isSettingsOpen = (menu.style.display !== 'block');
    menu.style.display = window.isSettingsOpen ? 'block' : 'none';
}

function resetNotationsForSystem() {
    if (typeof config !== 'undefined') {
        if (window.notation && window.notation.config) {
            if (Array.isArray(window.notation.config.modes)) {
                config.modes = window.notation.config.modes.map(normalizeMode);
            } else if (typeof window.notation.config.mode === 'number') {
                config.modes = [{ mode: window.notation.config.mode, target: 'both' }];
            } else {
                config.modes = [{ mode: 0, target: 'both' }];
            }
        } else {
            config.modes = [{ mode: 0, target: 'both' }];
        }
    }
    updateNotationConfigUI();
}

function adjustDepth(amount) {
    if (window.isSettingsOpen) return;
    if (amount < 0) {
        config.MaxIntervalDepth = Math.max(-1, config.MaxIntervalDepth - 1);
    } else {
        config.MaxIntervalDepth = config.MaxIntervalDepth === -1 ? 0 : config.MaxIntervalDepth + 1;
    }
    displayElem.innerText = config.MaxIntervalDepth === -1 ? "Depth: Infinite" : `Depth: ${config.MaxIntervalDepth}`;
    render();
}

async function loadPresetNotation(scriptPath) {
    try {
        const response = await fetch(scriptPath);
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

        const scriptCode = await response.text();
        document.getElementById('codeInject').value = scriptCode;
        resetNotationsForSystem();
        executeCustomScript(scriptCode);

        // Update URL parameter using uniform "href" tag
        updateUrlHrefParam(scriptPath);
    } catch (err) {
        alert("Could not load preset text: " + err.message);
    }
}

function syncConfigToTextArea() {
    const configTextArea = document.getElementById('envConfigJson');
    if (configTextArea) {
        configTextArea.value = JSON.stringify(config, null, 4);
    }
}

function applyingCSSUpdate() {
    notationControls.style.visibility = config.ShowOrdinalNotationConfigGui ? "visible" : "hidden";
    fpsCounter.style.visibility = config.ShowFPS ? "visible" : "hidden";
    fpsCounter.style.color = config.FPSLabelColor;
    mobileDepthControls.style.visibility = config.ShowDepthAdjustGui ? "visible" : "hidden";
    mobileDepthControlsbtn[0].style.color = config.DepthAdjustGuiColor;
    mobileDepthControlsbtn[1].style.color = config.DepthAdjustGuiColor;
    depthDisplay.style.color = config.DepthAdjustGuiColor;
    revertBtn.style.color = config.RevertBtnColor;
    resetBtn.style.color = config.ResetBtnColor;
    configToggleBtn.style.color = config.ConfigMenuBtnColor;
    AddNotationBtn.style.color = config.AddNotationBtnColor;
    hudStats.style.color = config.CurrentPositionStateTextColor;
    sampleElem.style.font = config.samplefont;
    sampleElem.style.left = config.sampleleftspacing;
    sampleElem.style.maxWidth = config.sampleMaxWidth;
    sampleElem.style.transform = config.sampleTransform;
    sampleElem.style.top = config.sampletopspacing;
}

window.applyInjectedConfig = function () {
    try {
        const jsonInput = document.getElementById('envConfigJson').value.trim();

        if (!jsonInput) {
            syncConfigToTextArea();
            render();
            return;
        }

        const parsedConfig = JSON.parse(jsonInput);
        config = { ...config, ...parsedConfig };

        render();
        if (config.SlowMode) alert('Slow Mode Enabled');
        checkAndInitFloatingGui();
        applyingCSSUpdate();
        displayElem.innerText = config.MaxIntervalDepth === -1 ? "Depth: Infinite" : `Depth: ${config.MaxIntervalDepth}`;
    } catch (err) {
        alert("Malformed configuration injection script. Error: " + err.message);
    }
};

if (typeof config !== 'undefined' && !initialConfigBackup) {
    initialConfigBackup = JSON.parse(JSON.stringify(config));
}
syncConfigToTextArea();

function applyInjectedCode() {
    const customCode = document.getElementById('codeInject').value.trim();
    if (!customCode) {
        alert("Please paste some code first!");
        return;
    }
    resetNotationsForSystem();
    executeCustomScript(customCode);
}

function executeCustomScript(codeString) {
    try {
        new Function(codeString);
    } catch (e) {
        alert(`Syntax Error\n\n${e.message}`);
        return;
    }

    try {
        const wrappedCode = codeString + "\n//# sourceURL=InjectedCustomCode.js";

        const script = document.createElement("script");
        script.id = "notation-script";
        script.textContent = wrappedCode;

        const old = document.getElementById("notation-script");
        if (old) old.remove();

        document.body.appendChild(script);

        if (initialConfigBackup) {
            config = JSON.parse(JSON.stringify(initialConfigBackup));
        }

        let activeConfig = null;
        if (typeof window.notation !== 'undefined' && window.notation.config) {
            activeConfig = window.notation.config;
        } else if (typeof config !== 'undefined') {
            activeConfig = config;
        }

        if (activeConfig) {
            config = { ...config, ...activeConfig };
        }

        if (!config.modes || !Array.isArray(config.modes) || config.modes.length === 0) {
            config.modes = [0];
        }

        syncConfigToTextArea();

        render();
        init();
        updateNotationConfigUI();
        applyingCSSUpdate();
        if (config.SlowMode) alert('Slow Mode Enabled');
        displayElem.innerText = config.MaxIntervalDepth === -1 ? "Depth: Infinite" : `Depth: ${config.MaxIntervalDepth}`;
        checkAndInitFloatingGui();

    } catch (e) {
        alert(`Runtime Error\n\n${e.message}\n\n${e.stack}`);
    }
}

function dismissHint() {
    const hintElement = document.getElementById("hint");
    if (hintElement) {
        hintElement.style.opacity = "0";
        hintElement.style.visibility = "hidden";
        setTimeout(() => hintElement.remove(), 400);
    }
}

function updateNotationConfigUI() {
    container.innerHTML = "";

    if (!config.modes || !Array.isArray(config.modes)) {
        config.modes = [{ mode: 0, target: 'both' }];
    }

    config.modes.forEach((modeItem, index) => {
        const item = normalizeMode(modeItem);

        const row = document.createElement("div");
        row.style.marginBottom = "4px";
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.gap = "6px";

        // Notation Selector
        const select = document.createElement("select");
        select.id = `selectnotationbox_${index}`;
        select.style.background = "transparent";
        select.style.color = config.SelectNotationBoxColor;
        select.style.border = "none";
        select.style.outline = "none";
        select.style.cursor = "pointer";
        select.style.fontFamily = "inherit";

        if (window.notation && window.notation.DisplayName) {
            window.notation.DisplayName.forEach((name, idx) => {
                const opt = document.createElement("option");
                opt.value = idx;
                opt.innerText = name;
                opt.style.background = "#000000";
                opt.style.color = "#ffffff";
                if (idx === item.mode) opt.selected = true;
                select.appendChild(opt);
            });
        }

        select.onchange = (e) => {
            const current = normalizeMode(config.modes[index]);
            current.mode = parseInt(e.target.value);
            config.modes[index] = current;
            render();
        };

        // Remove Notation Button
        const removeBtn = document.createElement("button");
        removeBtn.innerText = "Remove notation";
        removeBtn.style.background = "transparent";
        removeBtn.style.color = config.RemoveNotationBtnColor;
        removeBtn.style.border = "none";
        removeBtn.style.cursor = "pointer";

        removeBtn.onclick = () => {
            if (config.modes.length > 1 && !window.isSettingsOpen) {
                config.modes.splice(index, 1);
                updateNotationConfigUI();
                render();
            }
        };

        // Target Switcher Button: Display on number line / sample / both
        const targetBtn = document.createElement("button");
        targetBtn.style.background = "transparent";
        targetBtn.style.color = config.ChangeNotationDisplayLocationBtnColor;
        targetBtn.style.padding = "2px 6px";
        targetBtn.style.cursor = "pointer";
        targetBtn.style.fontSize = "12px";
        targetBtn.style.border = "none";
        targetBtn.style.outline = "none";

        const targetLabels = {
            both: "Display: both",
            line: "Display: number line",
            sample: "Display: sample"
        };

        const targetCycle = {
            both: "line",
            line: "sample",
            sample: "both"
        };

        targetBtn.innerText = targetLabels[item.target] || targetLabels.both;

        targetBtn.onclick = () => {
            if (!window.isSettingsOpen) {
                const current = normalizeMode(config.modes[index]);
                current.target = targetCycle[current.target] || "both";
                config.modes[index] = current;
                targetBtn.innerText = targetLabels[current.target];
                render();
            }
        };

        row.appendChild(select);
        row.appendChild(removeBtn);
        row.appendChild(targetBtn);
        container.appendChild(row);
    });
}

function addNotationSelector() {
    if (!window.isSettingsOpen) {
        const firstItem = normalizeMode(config.modes[0]);
        const nextMode = (config.modes.length > 0 && window.notation?.DisplayName)
            ? (firstItem.mode + 1) % window.notation.DisplayName.length
            : 0;

        // Default target is "both"
        config.modes.unshift({ mode: nextMode, target: "both" });
        updateNotationConfigUI();
        render();
    }
}

function checkAndInitFloatingGui() {
    let isshowordfinder = (typeof window.notation !== 'undefined' && typeof window.notation.parse === 'function' && config.EnableOrdinalFinder);
    if (isshowordfinder) {
        finderUI.style.display = "flex";
    } else {
        finderUI.style.display = "none";
    }

    if (config.EnableSetViewPort) {
        setUI.style.display = "flex";
    } else {
        setUI.style.display = "none";
    }

    if (!config.EnableSetViewPort) {
        finderUI.style.top = '15px';
    } else {
        finderUI.style.top = '65px';
    }
}

function parseToBigIntScaled(str, scale) {
    if (!str || typeof str !== "string") throw new Error("Invalid string");
    str = str.trim().toLowerCase();

    let isNegative = false;
    if (str.startsWith("-")) {
        isNegative = true;
        str = str.slice(1);
    } else if (str.startsWith("+")) {
        str = str.slice(1);
    }

    let parts = str.split("e");
    let coeff = parts[0];
    let expBI = parts.length > 1 ? BigInt(parts[1]) : 0n;

    let [intPart, fracPart = ""] = coeff.split(".");
    let combinedDigits = (intPart + fracPart).replace(/^0+/, "") || "0";
    let netExponent = expBI - BigInt(fracPart.length);

    let baseBI = BigInt(combinedDigits);
    let result;

    if (netExponent >= 0n) {
        result = baseBI * (10n ** netExponent) * scale;
    } else {
        let divisor = 10n ** (-netExponent);
        result = (baseBI * scale) / divisor;
    }

    return isNegative ? -result : result;
}

function triggerViewportZoom() {
    let posStr = document.getElementById("viewportPosInput").value.trim();
    let zoomStr = document.getElementById("viewportZoomInput").value.trim();

    if (!posStr || !zoomStr) {
        alert("Invalid position or zoom");
        return;
    }

    let parts = zoomStr.trim().toLowerCase().split("e");
    let expVal = parts.length > 1 ? parseInt(parts[1], 10) : 0;
    if (isNaN(expVal)) expVal = 0;

    let requiredDigits = Math.max(
        35,
        Math.abs(expVal) + (config.BigIntPrecisionMantissa || 8) + 50
    );

    let nextScale = 10n ** BigInt(requiredDigits);

    if (nextScale > PRECISION_SCALE) {
        let oldScale = PRECISION_SCALE;
        cam.view.x0 = (cam.view.x0 * nextScale) / oldScale;
        cam.view.x1 = (cam.view.x1 * nextScale) / oldScale;
        PRECISION_SCALE = nextScale;
    }

    let pos, zoom;
    try {
        pos = parseToBigIntScaled(posStr, PRECISION_SCALE);
        zoom = parseToBigIntScaled(zoomStr, PRECISION_SCALE);
    } catch (e) {
        alert("Invalid position or zoom");
        return;
    }

    if (zoom <= 0n) {
        alert("Invalid position or zoom");
        return;
    }

    cam.history.push({
        x0: cam.view.x0,
        x1: cam.view.x1
    });

    let canvasWidthBI = toBigInt(canvas.width);
    let widthBI = (canvasWidthBI * zoom) / PRECISION_SCALE;
    let centerScreenBI = toBigInt(canvas.width / 2);

    let x0 = centerScreenBI - (widthBI * pos) / PRECISION_SCALE;
    let x1 = x0 + widthBI;

    cam.view.x0 = x0;
    cam.view.x1 = x1;
    render();
}

window.addEventListener('DOMContentLoaded', async () => {
    initialConfigBackup = JSON.parse(JSON.stringify(config));

    // Handle URL parameters or default load
    const handledByUrl = await handleUrlParameters();
    if (!handledByUrl) {
        loadPresetNotation('Libs/BMS.js');
        const presetSelect = document.getElementById('presetSelect');
        if (presetSelect) presetSelect.value = 'Libs/BMS.js';
    }

    updateNotationConfigUI();
    checkAndInitFloatingGui();
});

function findOrdinalPathBigInt(targetOrd, precisionDigits) {
    let SCALE = 10n ** BigInt(document.getElementById('precisionInput').valueAsNumber);
    let X0 = 0n;
    let X1 = SCALE;
    let o0 = notation.Zero;
    let o1 = notation.Limit;
    let lefts = 0;

    for (let depth = 0; depth < Infinity; depth++) {
        if (notation.cmp(o0, targetOrd) === 0) {
            return { x: X0, width: X1 - X0, scale: SCALE };
        }
        if (notation.cmp(targetOrd, o0) < 0 || notation.cmp(targetOrd, o1) >= 0) {
            break;
        }

        if (notation.cmp(o1, notation.Limit) === 0 || (!notation.isSuccessor(o1) && notation.cmp(o1, notation.Zero) !== 0)) {
            let rescaleNum = config.HarmonicInvtervalSpacing ? 1.0 : 2.0 / (lefts + 2);
            let m = 2;
            let seq = Array.from({ length: m }, (_, idx) => notation.fs(o1, idx));
            let ofs = 0;
            for (ofs = 0; ofs < m && notation.cmp(seq[ofs], o0) <= 0; ofs++);

            let n = 0;
            let foundSub = false;
            while (true) {
                if (ofs + n >= m) {
                    m = ofs + n + 5;
                    seq = Array.from({ length: m }, (_, idx) => notation.fs(o1, idx));
                }
                let next_o0 = (n === 0) ? o0 : seq[ofs + n - 1];
                let next_o1 = seq[ofs + n];

                if (notation.cmp(targetOrd, next_o0) >= 0 && notation.cmp(targetOrd, next_o1) < 0) {
                    let isZeroEnd = (ofs < m && seq[ofs].length > 0 && seq[ofs][seq[ofs].length - 1] === 0);
                    let actualRescaleNum = isZeroEnd ? 1.0 : rescaleNum;
                    let s_x0 = X0, s_x1 = X0;

                    for (let step = 0; step <= n; step++) {
                        if (step > 0) s_x0 = s_x1;
                        let rNum = step ? 1.0 : actualRescaleNum;
                        let factor = BigInt(Math.round(rNum * config.aspectratio * 1e6));
                        s_x1 = X1 + (s_x0 - X1) * factor / 1000000n;
                    }
                    X0 = s_x0;
                    X1 = s_x1;
                    o0 = next_o0;
                    o1 = next_o1;
                    lefts = n === 0 ? lefts + 1 : 0;
                    foundSub = true;
                    break;
                }
                n++;
            }
            if (foundSub) continue;
        }
        break;
    }
}

function findAndZoomToOrdinal() {
    let inputStr = document.getElementById("ordinalInput").value.trim();
    if (!inputStr) return;

    if (typeof notation.parse === 'undefined') {
        alert("The current notation system does not support parsing.");
        return;
    }

    let targetOrd;
    try {
        targetOrd = notation.parse(inputStr);
    } catch (e) {
        alert("Failed to parse ordinal: " + e.message);
        return;
    }
    let P = findOrdinalPathBigInt(targetOrd);

    if (P !== null) {
        cam.history.push({ x0: cam.view.x0, x1: cam.view.x1 });
        let pWidth = P.width <= 0n ? 1n : P.width;
        let targetPixelWidthBI = toBigInt(canvas.width * 0.1);
        let totalWidth_BI = (targetPixelWidthBI * P.scale) / pWidth;
        let centerOffsetBI = toBigInt(canvas.width / 2);
        cam.view.x0 = centerOffsetBI - (totalWidth_BI * P.x) / P.scale;
        cam.view.x1 = cam.view.x0 + totalWidth_BI;
        config.MaxIntervalDepth = -1;
        if (displayElem) displayElem.innerText = "Depth: Infinite";

        clampViewportBounds();
        render();
    } else {
        alert("Ordinal parsed, but could not be located on the timeline (too deep or not a rendered component).");
    }
}

function copyPositionAndZoom() {
    let posText = posElem.innerText || "";
    let zoomText = zoomElem.innerText || "";

    let formattedText = `${posText}\n${zoomText}`;

    navigator.clipboard.writeText(formattedText).then(() => {
        alert("Copied to clipboard!\n\n" + formattedText);
    }).catch(err => {
        // Fallback for older browsers / strict security contexts
        let textarea = document.createElement("textarea");
        textarea.value = formattedText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        alert("Copied to clipboard!\n\n" + formattedText);
    });
}

// Toggle between Interactive Sliders and JSON Editor View
function toggleJsonEditorView() {
    const interactivePanel = document.getElementById("interactiveControlsPanel");
    const jsonPanel = document.getElementById("jsonEditorPanel");
    const toggleBtn = document.getElementById("toggleJsonBtn");

    if (interactivePanel.style.display === "none") {
        interactivePanel.style.display = "flex";
        jsonPanel.style.display = "none";
        toggleBtn.innerText = "Use JSON Editor";
        syncConfigToInteractiveControls();
    } else {
        interactivePanel.style.display = "none";
        jsonPanel.style.display = "block";
        toggleBtn.innerText = "Use Sliders Editor";
        syncConfigToTextArea();
    }
}

// Sync current JS config object to interactive controls
function syncConfigToInteractiveControls() {
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
            el.value = val;
            const display = document.getElementById(`val_${id}`);
            if (display) display.innerText = val;
        }
    };
    const setCheck = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.checked = !!val;
    };

    setVal("aspectratio", config.aspectratio ?? 0.66);
    setVal("BackgroundColor", config.BackgroundColor ?? "#000000");
    setVal("TickSpacing", config.TickSpacing ?? 1);
    setVal("Tickheight", config.Tickheight ?? 0.05);
    setVal("TickWidth", config.TickWidth ?? 2);
    setVal("TickAnchorPoint", config.TickAnchorPoint ?? 0.5);
    setVal("labelscount", config.labelscount ?? 8);
    setVal("fpsPrecision", config.fpsPrecision ?? 1);
    setVal("MaxIntervalsDivision", config.MaxIntervalsDivision ?? -1);
    setVal("MaxIntervalDepth", config.MaxIntervalDepth ?? -1);

    setCheck("MathstickMode", config.MathstickMode);
    setCheck("DiagonalTickArrangement", config.DiagonalTickArrangement);
    setCheck("HarmonicInvtervalSpacing", config.HarmonicInvtervalSpacing);
    setCheck("EnableOrdinalFinder", config.EnableOrdinalFinder);
    setCheck("EnableSetViewPort", config.EnableSetViewPort);
    setCheck("SlowMode", config.SlowMode);
    setCheck("ShowCurrentPositionState", config.ShowCurrentPositionState);
}

// Update config properties based on control changes
function updateConfigFromControls() {
    const getNum = (id) => parseFloat(document.getElementById(id).value);
    const getCheck = (id) => document.getElementById(id).checked;

    config.aspectratio = getNum("aspectratio");
    config.BackgroundColor = document.getElementById("BackgroundColor").value;
    config.TickSpacing = getNum("TickSpacing");
    config.Tickheight = getNum("Tickheight");
    config.TickWidth = getNum("TickWidth");
    config.TickAnchorPoint = getNum("TickAnchorPoint");
    config.labelscount = getNum("labelscount");
    config.fpsPrecision = getNum("fpsPrecision");
    config.MaxIntervalsDivision = getNum("MaxIntervalsDivision");
    config.MaxIntervalDepth = getNum("MaxIntervalDepth");

    config.MathstickMode = getCheck("MathstickMode");
    config.DiagonalTickArrangement = getCheck("DiagonalTickArrangement");
    config.HarmonicInvtervalSpacing = getCheck("HarmonicInvtervalSpacing");
    config.EnableOrdinalFinder = getCheck("EnableOrdinalFinder");
    config.EnableSetViewPort = getCheck("EnableSetViewPort");
    config.SlowMode = getCheck("SlowMode");
    config.ShowCurrentPositionState = getCheck("ShowCurrentPositionState");

    // Update value displays
    ["aspectratio", "TickSpacing", "Tickheight", "TickWidth", "TickAnchorPoint", "labelscount", "fpsPrecision", "MaxIntervalsDivision", "MaxIntervalDepth"].forEach(id => {
        const display = document.getElementById(`val_${id}`);
        if (display) display.innerText = document.getElementById(id).value;
    });

    const configTextArea = document.getElementById('envConfigJson');
    if (configTextArea) {
        configTextArea.value = JSON.stringify(config, null, 4);
    }

    displayElem.innerText = config.MaxIntervalDepth === -1 ? "Depth: Infinite" : `Depth: ${config.MaxIntervalDepth}`;
    checkAndInitFloatingGui();
    render();
}

// Hook original config syncing to update both views
const originalSyncConfigToTextArea = syncConfigToTextArea;
syncConfigToTextArea = function () {
    const configTextArea = document.getElementById('envConfigJson');
    if (configTextArea) {
        configTextArea.value = JSON.stringify(config, null, 4);
    }
    syncConfigToInteractiveControls();
};

// --- Mobile Touch-Resize Handler for Config Panel ---
(function makeConfigPanelTouchResizable() {
    const panel = document.getElementById("configMenu");
    if (!panel) return;

    let isResizing = false;
    let startWidth, startHeight, startX, startY;

    panel.addEventListener("touchstart", (e) => {
        if (e.touches.length !== 1) return;

        const rect = panel.getBoundingClientRect();
        const touch = e.touches[0];
        const cornerThreshold = 35; // Touch zone radius around bottom-right corner

        // Check if touch target is near bottom-right corner
        const nearRight = (touch.clientX >= rect.right - cornerThreshold);
        const nearBottom = (touch.clientY >= rect.bottom - cornerThreshold);

        if (nearRight && nearBottom) {
            isResizing = true;
            startX = touch.clientX;
            startY = touch.clientY;
            startWidth = rect.width;
            startHeight = rect.height;
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false });

    window.addEventListener("touchmove", (e) => {
        if (!isResizing) return;

        const touch = e.touches[0];
        const newWidth = Math.max(260, Math.min(window.innerWidth * 0.9, startWidth + (touch.clientX - startX)));
        const newHeight = Math.max(200, Math.min(window.innerHeight * 0.85, startHeight + (touch.clientY - startY)));

        panel.style.width = `${newWidth}px`;
        panel.style.height = `${newHeight}px`;

        e.preventDefault();
    }, { passive: false });

    window.addEventListener("touchend", () => {
        isResizing = false;
    });
})();
