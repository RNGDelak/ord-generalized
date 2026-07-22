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
    try {
        // 1. Completely clear out previous notation hooks/namespaces so old states don't bleed or lock up
        if (typeof window.notation !== 'undefined') {
            window.notation = undefined;
        }

        const wrappedCode =
            codeString +
            "\n//# sourceURL=InjectedCustomCode.js";

        const script = document.createElement("script");
        script.id = "notation-script";
        script.textContent = wrappedCode;

        // Remove the old script element completely before appending the new one
        const old = document.getElementById("notation-script");
        if (old) {
            old.remove();
        }

        document.body.appendChild(script);

        // 2. Check if a valid config was produced by this newly injected script
        let activeConfig = null;
        if (typeof window.notation !== 'undefined' && window.notation.config) {
            activeConfig = window.notation.config;
        } else if (typeof config !== 'undefined') {
            activeConfig = config;
        }

        // 3. Intelligent configuration merging:
        // If the new script has a custom config, selectively merge properties.
        // If it's a default/empty preset or switches away, fallback safely to initial clean state or keep standard properties.
        if (activeConfig && activeConfig.types && activeConfig.types.toLowerCase() === "custom") {
            config = { ...config, ...activeConfig };
        } else {
            // When switching to standard presets (like Vue, Ton, Cocf, etc.) that might rely on their own internal logic
            // reset back to clean state first so old properties from previous notations don't contaminate it.
            if (initialConfigBackup) {
                config = JSON.parse(JSON.stringify(initialConfigBackup));
            }
            if (activeConfig) {
                config = { ...config, ...activeConfig };
            }
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