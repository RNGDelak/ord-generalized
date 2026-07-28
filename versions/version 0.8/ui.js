function toggleConfigMenu() {
    const menu = document.getElementById('configMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function loadPresetNotation(scriptPath) {
    const oldScript = document.getElementById('notation-script');
    if (oldScript) {
        oldScript.remove();
    }

    const newScript = document.createElement('script');
    newScript.id = 'notation-script';
    newScript.src = scriptPath;

    newScript.onload = () => {
        if (typeof init === 'function') {
            init();
        }
    };

    document.body.appendChild(newScript);
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

// Fire on script bootstrap initialization
syncConfigToTextArea();

function applyInjectedCode() {
    const customCode = document.getElementById('codeInject').value.trim();
    
    if (!customCode) {
        alert("Please paste some code first!");
        return;
    }

    try {
        // Method 1: Using a dynamic Blob to load it isolated like a real module script
        const oldScript = document.getElementById('notation-script');
        if (oldScript) oldScript.remove();

        const blob = new Blob([customCode], { type: 'application/javascript' });
        const blobURL = URL.createObjectURL(blob);

        const newScript = document.createElement('script');
        newScript.id = 'notation-script';
        newScript.src = blobURL;
        
        newScript.onload = () => {
            console.log("Custom code script executed successfully!");
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