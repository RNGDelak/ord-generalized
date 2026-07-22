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

// Keep track of active animation frames or intervals if your notations use them
let activeAnimationId = null;

function executeCustomScript(codeString) {
    try {
        // 1. Syntax Validation
        new Function(codeString);
    } catch (e) {
        alert(`Syntax Error\n\n${e.message}`);
        return;
    }

    try {
        // 2. CLEANUP PREVIOUS NOTATION STATE
        // Stop any running requestAnimationFrame loops if defined globally
        if (typeof window.cancelAnimationFrame === 'function' && activeAnimationId) {
            cancelAnimationFrame(activeAnimationId);
            activeAnimationId = null;
        }

        // Clear out old global notation object to prevent property bleeding
        if (window.notation) {
            window.notation = undefined;
        }

        // Remove the old script element cleanly
        const old = document.getElementById("notation-script");
        if (old) old.remove();

        // 3. INJECT NEW SCRIPT
        const wrappedCode = codeString + "\n//# sourceURL=InjectedCustomCode.js";
        const script = document.createElement("script");
        script.id = "notation-script";
        script.textContent = wrappedCode;
        document.body.appendChild(script);

        // 4. CONFIGURATION MERGE
        let activeConfig = null;
        if (typeof window.notation !== 'undefined' && window.notation.config) {
            activeConfig = window.notation.config;
        } else if (typeof config !== 'undefined') {
            activeConfig = config;
        }

        if (activeConfig && typeof activeConfig === 'object') {
            function deepMerge(target, source) {
                for (const key of Object.keys(source)) {
                    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                        if (!target[key] || typeof target[key] !== 'object') {
                            target[key] = {};
                        }
                        deepMerge(target[key], source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
                return target;
            }

            if (typeof config === 'undefined') {
                config = {};
            }

            deepMerge(config, activeConfig);
            syncConfigToTextArea();

            if (typeof render === "function") {
                render();
            }
        }

        // 5. RE-INITIALIZE
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