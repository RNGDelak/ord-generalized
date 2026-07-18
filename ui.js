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
        const oldScript = document.getElementById('notation-script');
        if (oldScript) oldScript.remove();
        const blob = new Blob([codeString], { type: 'application/javascript' });
        const blobURL = URL.createObjectURL(blob);

        const newScript = document.createElement('script');
        newScript.id = 'notation-script';
        newScript.src = blobURL;

        newScript.onload = () => {
            URL.revokeObjectURL(blobURL);
            if (typeof init === 'function') {
                init();
            }
        };

        document.body.appendChild(newScript);

    } catch (err) {
        alert("Syntax or execution failure. Error: " + err.message);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadPresetNotation('Libs/BMS.js');
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