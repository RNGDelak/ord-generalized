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
        // Clear previous notation object completely
        window.notation = undefined;

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

        // If the script doesn't explicitly attach to window.notation but defines it locally or globally, 
        // fallback to checking global scope or auto-wrap it.
        if (typeof window.notation === 'undefined') {
            // Check if a local variable named 'notation' was left or defined
            try {
                if (typeof notation !== 'undefined') {
                    window.notation = notation;
                }
            } catch (err) {}
        }

        if (typeof window.notation === 'undefined') {
            throw new Error("The script executed, but failed to initialize a valid 'window.notation' object. Ensure your script returns or assigns a valid notation module.");
        }

        let activeConfig = null;
        if (window.notation.config) {
            activeConfig = window.notation.config;
        } else if (typeof config !== 'undefined') {
            activeConfig = config;
        }

        if (initialConfigBackup) {
            config = JSON.parse(JSON.stringify(initialConfigBackup));
        }

        if (activeConfig) {
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