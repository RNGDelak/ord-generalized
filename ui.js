window.isSettingsOpen = false;

// Store a pristine backup of the initial configuration on load
let initialConfigBackup = null;

function toggleConfigMenu() {
    const menu = document.getElementById('configMenu');
    const canvasElement = document.getElementById('canvas');

    window.isSettingsOpen = (menu.style.display !== 'block');

    if (window.isSettingsOpen) {
        menu.style.display = 'block';
    } else {
        menu.style.display = 'none';
    }
}

async function loadPresetNotation(scriptPath) {
    try {
        const response = await fetch(scriptPath);
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

        const scriptCode = await response.text();
        document.getElementById('codeInject').value = scriptCode;
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
            if (initialConfigBackup) {
                config = JSON.parse(JSON.stringify(initialConfigBackup));
            }
            syncConfigToTextArea();
            if (typeof render === "function") render();
            return;
        }

        const parsedConfig = JSON.parse(jsonInput);
        config = { ...config, ...parsedConfig };

        render();
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
    executeCustomScript(customCode);
}

function executeCustomScript(codeString) {
    // 1. Validate syntax explicitly first so incorrect/bad code throws an alert error immediately
    try {
        new Function(codeString);
    } catch (e) {
        alert(`Syntax Error\n\n${e.message}`);
        return; // Halt execution so bad code doesn't silently run or fail behind the scenes
    }

    try {
        // Completely clear out previous notation namespaces so cross-contamination (e.g. BMS -> cOCF -> Vue) doesn't occur
        if (typeof window.notation !== 'undefined') {
            window.notation = undefined;
        }

        const wrappedCode =
            codeString +
            "\n//# sourceURL=InjectedCustomCode.js";

        const script = document.createElement("script");
        script.id = "notation-script";
        script.textContent = wrappedCode;

        const old = document.getElementById("notation-script");
        if (old) {
            old.remove();
        }

        document.body.appendChild(script);

        // 2. Validate that the script successfully registered window.notation
        if (typeof window.notation === 'undefined') {
            throw new Error("The script executed, but failed to initialize a valid 'window.notation' object.");
        }

        let activeConfig = null;
        if (window.notation.config) {
            activeConfig = window.notation.config;
        } else if (typeof config !== 'undefined') {
            activeConfig = config;
        }

        // 3. Clean state handling to prevent switching crashes (e.g., cOCF <-> Vue <-> Ton)
        if (initialConfigBackup) {
            config = JSON.parse(JSON.stringify(initialConfigBackup));
        }

        if (activeConfig && activeConfig.types && activeConfig.types.toLowerCase() === "custom") {
            config = { ...config, ...activeConfig };
        } else if (activeConfig) {
            config = { ...config, ...activeConfig };
        }

        syncConfigToTextArea();
        
        if (typeof render === "function") {
            render();
        }

        if (typeof init === "function") {
            init();
        }

    } catch (e) {
        alert(
            `Runtime Error\n\n` +
            `${e.message}\n\n` +
            `${e.stack}`
        );
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (typeof config !== 'undefined' && !initialConfigBackup) {
        initialConfigBackup = JSON.parse(JSON.stringify(config));
    }
    loadPresetNotation('Libs/BMS.js');
    document.getElementById('presetSelect').value = 'Libs/BMS.js';
});

function dismissHint() {
    const hintElement = document.getElementById("hint");
    if (hintElement) {
        hintElement.style.opacity = "0";
        hintElement.style.visibility = "hidden";
        
        setTimeout(() => {
            hintElement.remove();
        }, 400); 
    }
}