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
    // Check syntax first
    try {
        new Function(codeString);
    } catch (err) {
        alert(
            "Syntax Error!\n\n" +
            err.message
        );
        return;
    }

    try {
        // Remove previous notation script
        const oldScript = document.getElementById("notation-script");
        if (oldScript) oldScript.remove();

        // Create Blob URL
        const blob = new Blob([codeString], {
            type: "application/javascript"
        });
        const blobURL = URL.createObjectURL(blob);

        // Create script element
        const newScript = document.createElement("script");
        newScript.id = "notation-script";
        newScript.src = blobURL;

        // Runtime loading failure
        newScript.onerror = () => {
            URL.revokeObjectURL(blobURL);
            alert("Failed to load injected script.");
        };

        // Successfully loaded
        newScript.onload = () => {
            URL.revokeObjectURL(blobURL);

            try {
                if (typeof init === "function") {
                    init();
                }
            } catch (err) {
                alert(
                    "Runtime Error!\n\n" +
                    err.stack
                );
            }
        };

        document.body.appendChild(newScript);

    } catch (err) {
        alert(
            "Execution Error!\n\n" +
            err.stack
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