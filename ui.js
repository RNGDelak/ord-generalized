window.isSettingsOpen = false;

// Store a pristine backup of the initial configuration on load
let initialConfigBackup = null;

function toggleConfigMenu() {
    const menu = document.getElementById('configMenu');
    const canvasElement = document.getElementById('canvas');

    // Flip state
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
        
        // If empty, revert or fallback to initial configuration state
        if (!jsonInput) {
            if (initialConfigBackup) {
                config = JSON.parse(JSON.stringify(initialConfigBackup));
            }
            syncConfigToTextArea();
            if (typeof render === "function") render();
            return;
        }

        const parsedConfig = JSON.parse(jsonInput);

        // Merge incoming configuration safely without destroying untouched properties
        config = { ...config, ...parsedConfig };

        render();
    } catch (err) {
        alert("Malformed configuration injection script. Error: " + err.message);
    }
};

// Capture initial configuration state right after it's first available
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
    // 1. Removed strict syntax blocking check so code runs regardless of syntax errors/warnings.
    // 2. Old script variables/elements are completely bypassed/overwritten dynamically.

    try {
        const wrappedCode =
            codeString +
            "\n//# sourceURL=InjectedCustomCode.js";

        const script = document.createElement("script");
        script.id = "notation-script-" + Date.now(); // Unique ID to prevent collision/stale variables
        script.textContent = wrappedCode;

        // Clean up old script element if it exists
        const old = document.getElementById("notation-script");
        if (old) old.remove();

        document.body.appendChild(script);

        // Check inside window.notation or global scope
        let activeConfig = null;
        if (typeof window.notation !== 'undefined' && window.notation.config) {
            activeConfig = window.notation.config;
        } else if (typeof config !== 'undefined') {
            activeConfig = config;
        }

        if (activeConfig && activeConfig.types) {
            const notationType = activeConfig.types;

            if (notationType && notationType.toLowerCase() === "custom") {
                config = { ...config, ...activeConfig };
            } else {
                // If it's default or empty, fallback to the initial backup config
                if (initialConfigBackup) {
                    config = JSON.parse(JSON.stringify(initialConfigBackup));
                }
            }
        } else {
            // Fallback to initial backup if configuration data is missing/empty
            if (initialConfigBackup) {
                config = JSON.parse(JSON.stringify(initialConfigBackup));
            }
        }

        // Sync the updated config object back to the UI textarea
        syncConfigToTextArea();
        
        // Trigger re-render
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
    // Capture backup right when DOM loads if config is defined
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