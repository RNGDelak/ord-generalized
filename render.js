//Rendering section : only render

const canvas = document.getElementById("canvas"); //get canvas
const ui = document.getElementById("textOverlay");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas() //resize so it fit the screen

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


