window.isSettingsOpen = false;

let initialConfigBackup = null;

// ==========================================
// CONFIG SLOT SAVING & LOADING (SLOTS 1-5)
// ==========================================

function saveConfigToSlot() {
    const slotSelect = document.getElementById("slotSelect");
    if (!slotSelect) return;
    
    const slotKey = `user_config_slot_${slotSelect.value}`;
    
    try {
        // Read directly from UI or fallback to global config object
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
        
        // Merge saved data into global config
        config = { ...config, ...parsedConfig };

        // Ensure modes array remains valid
        if (!config.modes || !Array.isArray(config.modes) || config.modes.length === 0) {
            config.modes = [0];
        }

        // Update UI Textarea and Notation UI
        syncConfigToTextArea();
        updateNotationConfigUI();
        render();

        alert(`Configuration loaded successfully from Slot ${slotSelect.value}!`);
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
                config.modes = [...window.notation.config.modes];
            } else if (typeof window.notation.config.mode === 'number') {
                config.modes = [window.notation.config.mode];
            } else {
                config.modes = [0];
            }
        } else {
            config.modes = [0];
        }
    }
    updateNotationConfigUI();
}

function adjustDepth(amount) {
    if(window.isSettingsOpen) return;
    if (amount < 0) {
        config.MaxIntervalDepth = Math.max(-1, config.MaxIntervalDepth - 1);
    } else {
        config.MaxIntervalDepth = config.MaxIntervalDepth === -1 ? 0 : config.MaxIntervalDepth + 1;
    }
    updateDepthDisplay();
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
        if (config.SlowMode) alert('Slow Mode Enabled')
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
        if (config.SlowMode) alert('Slow Mode Enabled')

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
    const container = document.getElementById("notationSelectContainer");
    if (!container) return;
    container.innerHTML = "";

    if (!config.modes || !Array.isArray(config.modes)) {
        config.modes = [0];
    }

    config.modes.forEach((modeVal, index) => {
        const row = document.createElement("div");
        row.style.marginBottom = "4px";

        const select = document.createElement("select");
        select.style.background = "transparent";
        select.style.color = "#fff";
        select.style.border = "none";
        select.style.outline = "none";
        select.style.cursor = "pointer";
        select.style.fontFamily = "inherit";

        if (window.notation && window.notation.DisplayName) {
            window.notation.DisplayName.forEach((name, idx) => {
                const opt = document.createElement("option");
                opt.value = idx;
                opt.innerText = name;
                opt.style.background = "#111";
                if (idx === modeVal) opt.selected = true;
                select.appendChild(opt);
            });
        }

        select.onchange = (e) => {
            config.modes[index] = parseInt(e.target.value);
            render();
        };

        const removeBtn = document.createElement("button");
        removeBtn.innerText = "Remove notation";
        removeBtn.style.background = "transparent";
        removeBtn.style.color = "#ff4444";
        removeBtn.style.border = "none";
        removeBtn.style.cursor = "pointer";
        removeBtn.style.marginLeft = "8px";

        removeBtn.onclick = () => {
            if (config.modes.length > 1 && !window.isSettingsOpen) {
                config.modes.splice(index, 1);
                updateNotationConfigUI();
                render();
            }
        };

        row.appendChild(select);
        row.appendChild(removeBtn);
        container.appendChild(row);
    });
}

function addNotationSelector() {
    if (!window.isSettingsOpen) {
        const nextMode = (config.modes.length > 0) ? (config.modes[0] + 1) % window.notation.DisplayName.length : 0;
        config.modes.unshift(nextMode);
        updateNotationConfigUI();
        render();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initialConfigBackup = JSON.parse(JSON.stringify(config));
    loadPresetNotation('Libs/BMS.js');
    
    const presetSelect = document.getElementById('presetSelect');
    if (presetSelect) presetSelect.value = 'Libs/BMS.js';
    
    updateNotationConfigUI();
});