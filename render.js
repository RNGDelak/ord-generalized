// Rendering section : only render
const canvas = document.getElementById("canvas"); // get canvas
const ui = document.getElementById("textOverlay");

function resizeCanvas() {
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        // 1. Capture ratios of the existing layout view if it exists
        let ratioX0 = 0.2; // Default fallback ratios
        let ratioX1 = 0.8;
        
        if (canvas.width > 0 && typeof cam !== 'undefined' && cam.view) {
            ratioX0 = cam.view.x0 / canvas.width;
            ratioX1 = cam.view.x1 / canvas.width;
        }

        // 2. Adjust physical canvas resolution boundaries
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // 3. Re-map viewport boundaries to new pixel dimensions safely
        if (typeof cam !== 'undefined' && cam.view) {
            cam.view.x0 = ratioX0 * canvas.width;
            cam.view.x1 = ratioX1 * canvas.width;
        }
        
        // 4. Wipe out cached text elements so DOM tracking doesn't overlap
        clearTextLabels(); 

        if (typeof render === "function" && window.notation) {
            render();
        }
    }
}

// Initial sync
resizeCanvas();

// Handle device rotation or desktop viewport snapping instantly
window.addEventListener("resize", resizeCanvas);

// Continuous safeguard loop: Catches layout shifts on mobile device address-bar hiding
function continuousResizeCheck() {
    resizeCanvas();
    requestAnimationFrame(continuousResizeCheck);
}
continuousResizeCheck();

const ctx = canvas.getContext("2d"); //get drawing context

function clearCanvas() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
clearCanvas() //clear the canvas

function drawLine(x1, y1, x2, y2, color, lineWidth = 2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function createTextLabel(text, color, x, y, alignX, alignY, font) {
    const label = document.createElement("div");

    label.className = "textLabel";
    label.innerHTML = text;
    label.style.left = x + "px";
    label.style.top = y + "px";
    label.style.color = color;
    label.style.font = font // [weight][size][family] for example "bold 24px Arial"

    let tx = "0";
    let ty = "0";

    switch (alignX) {
        case "center": tx = "-50%"; break;
        case "right": tx = "-100%"; break;
    }

    switch (alignY) {
        case "middle": ty = "-50%"; break;
        case "bottom": ty = "-100%"; break;
    }

    label.style.transform = `translate(${tx}, ${ty})`;

    ui.appendChild(label);

    return label;
}

function clearTextLabels() {
    ui.replaceChildren();
}


