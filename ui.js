window.isSettingsOpen = false;

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
        const jsonInput = document.getElementById('envConfigJson').value;
        const parsedConfig = JSON.parse(jsonInput);

        config = { ...config, ...parsedConfig };

        render();
    } catch (err) {
        alert("Malformed configuration injection script. Error: " + err.message);
    }
};
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
        // Validate syntax
        new Function(codeString);
    } catch (e) {
        alert(
            `Syntax Error\n\n` +
            `${e.message}`
        );
        return;
    }

    try {
        const wrappedCode =
            codeString +
            "\n//# sourceURL=InjectedCustomCode.js";

        const script = document.createElement("script");
        script.id = "notation-script";
        script.textContent = wrappedCode;

        const old = document.getElementById("notation-script");
        if (old) old.remove();

        document.body.appendChild(script);

        // --- FIXED: Check inside window.notation or global scope ---
        let activeConfig = null;
        if (typeof window.notation !== 'undefined' && window.notation.config) {
            activeConfig = window.notation.config;
        } else if (typeof config !== 'undefined') {
            activeConfig = config;
        }

        if (activeConfig && activeConfig.types) {
            const notationType = activeConfig.types;

            // Check if type is "custom" (case-insensitive to match "Custom")
            if (notationType && notationType.toLowerCase() === "custom") {
                // Merge activeConfig into your global config object
                config = { ...config, ...activeConfig };

                // Sync the updated config object back to the UI textarea
                syncConfigToTextArea();
                
                // Trigger a re-render if necessary to apply aspect ratio or other settings
                if (typeof render === "function") {
                    render();
                }
            }
        }
        // -------------------------------------------------------------

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
    loadPresetNotation('Libs/BMS.js');
    document.getElementById('presetSelect').value='Libs/BMS.js';
});

function dismissHint() {
    const hintElement = document.getElementById("hint");
    if (hintElement) {
        // Fade it out cleanly using the CSS transitions defined above
        hintElement.style.opacity = "0";
        hintElement.style.visibility = "hidden";
        
        // Remove pointer interactions entirely once closed so users can interact with elements behind it
        setTimeout(() => {
            hintElement.remove();
        }, 400); 
    }
}