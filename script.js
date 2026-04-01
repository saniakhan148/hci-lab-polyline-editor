const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const modeText = document.getElementById("mode");
const statusText = document.getElementById("status");
const bottomBar = document.getElementById("bottom-bar");

let selectedPoint = null;
let mode = "draw";
let polylines = [];
let currentPolyline = [];
let mousePos = null;
let hoveredPoint = null;

let lineColor = "#333333";
let lineWidth = 2;
let pointRadius = 4;
let pointColor = "#000000";

let undoStack = [];
let redoStack = [];

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (e.ctrlKey && key === "z") {
    e.preventDefault();
    undo();
    return;
  }

  if (e.ctrlKey && key === "y") {
    e.preventDefault();
    redo();
    return;
  }

  if (e.ctrlKey && e.shiftKey && key === "z") {
    e.preventDefault();
    redo();
    return;
  }

  if (e.ctrlKey && key === "s") {
    e.preventDefault();
    exportPNG();
    return;
  }

  if (e.ctrlKey && key === "delete") {
    e.preventDefault();
    clearCanvas();
    return;
  }

  if (key === "b") {
    if (currentPolyline.length > 0) {
      saveState();
      polylines.push(currentPolyline);
      currentPolyline = [];
    }
    setMode("draw");
    redraw();
  } else if (key === "m") {
    if (mode === "draw" && currentPolyline.length > 0) {
      saveState();
      polylines.push(currentPolyline);
      currentPolyline = [];
    }
    setMode("move");
    redraw();
  } else if (key === "d") {
    if (mode === "draw" && currentPolyline.length > 0) {
      saveState();
      polylines.push(currentPolyline);
      currentPolyline = [];
    }
    setMode("delete");
    redraw();
  } else if (key === "r") {
    refreshCanvas();
  }
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (mode === "draw") {
    mousePos = { x, y };
    hoveredPoint = null;
  } else {
    const nearest = findNearestPoint(x, y);
    if (nearest) {
      hoveredPoint = nearest;
      const p = polylines[nearest.polylineIndex][nearest.pointIndex];
      updateStatus(`Hovering over point at (${p.x}, ${p.y})`, "#0077cc");
    } else {
      hoveredPoint = null;
      updateStatus(`Mode: ${mode.toUpperCase()}`, "#333");
    }
  }
  redraw();
});

canvas.addEventListener("mouseleave", () => {
  mousePos = null;
  if (mode === "draw") redraw();
});

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (mode === "draw") {
    saveState();
    currentPolyline.push({ x, y });
    redraw();
    updateStatus(`Point added at (${x}, ${y})`, "green");
  } else if (mode === "move") {
    if (!selectedPoint) {
      selectedPoint = findNearestPoint(x, y);
      if (selectedPoint) {
        const p =
          polylines[selectedPoint.polylineIndex][selectedPoint.pointIndex];
        updateStatus(`Selected point at (${p.x}, ${p.y})`, "orange");
        redraw();
      }
    } else {
      saveState();
      const { polylineIndex, pointIndex } = selectedPoint;
      polylines[polylineIndex][pointIndex] = { x, y };
      selectedPoint = null;
      hoveredPoint = null;
      updateStatus(`Point moved to (${x}, ${y})`, "orange");
      redraw();
    }
  } else if (mode === "delete") {
    const nearest = findNearestPoint(x, y);
    if (nearest) {
      saveState();
      const { polylineIndex, pointIndex } = nearest;
      polylines[polylineIndex].splice(pointIndex, 1);
      hoveredPoint = null;
      updateStatus(`Deleted point at (${x}, ${y})`, "red");
      redraw();
    }
  }
});

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  polylines.forEach((polyline, index) => {
    drawPolyline(polyline, index);
  });
  drawPolyline(currentPolyline, null);
}

function drawPolyline(points, polylineIndex = null) {
  if (!points || points.length === 0) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  points.forEach((p, index) => {
    ctx.beginPath();
    let radius = pointRadius;
    let fillColor = pointColor;
    ctx.shadowBlur = 0;

    if (
      selectedPoint &&
      selectedPoint.polylineIndex === polylineIndex &&
      selectedPoint.pointIndex === index
    ) {
      radius = pointRadius + 2;
      fillColor = "red";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(255,0,0,0.5)";
    } else if (
      hoveredPoint &&
      hoveredPoint.polylineIndex === polylineIndex &&
      hoveredPoint.pointIndex === index
    ) {
      radius = pointRadius + 2;
      fillColor = "orange";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(255,165,0,0.7)";
    }

    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
  });
  if (
    mode === "draw" &&
    points === currentPolyline &&
    points.length > 0 &&
    mousePos
  ) {
    const last = points[points.length - 1];
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.strokeStyle = "#0077cc";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(mousePos.x, mousePos.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#0077cc";
    ctx.fill();
  }
}

function findNearestPoint(x, y) {
  let minDist = Infinity;
  let nearest = null;

  polylines.forEach((polyline, pIdx) => {
    polyline.forEach((point, ptIdx) => {
      const dist = Math.hypot(point.x - x, point.y - y);
      if (dist < minDist) {
        minDist = dist;
        nearest = { polylineIndex: pIdx, pointIndex: ptIdx };
      }
    });
  });
  return minDist < 10 ? nearest : null;
}

document.getElementById("lineColor").addEventListener("input", (e) => {
  lineColor = e.target.value;
  redraw();
});

document.getElementById("lineWidth").addEventListener("input", (e) => {
  lineWidth = parseInt(e.target.value);
  redraw();
});

document.getElementById("pointRadius").addEventListener("input", (e) => {
  pointRadius = parseInt(e.target.value);
  redraw();
});

document.getElementById("pointColor").addEventListener("input", (e) => {
  pointColor = e.target.value;
  redraw();
});

function setMode(newMode) {
  mode = newMode.toLowerCase();

  document
    .querySelectorAll(".mode-btn")
    .forEach((btn) => btn.classList.remove("active"));

  let btnId = null;
  if (mode === "draw") btnId = "btnDraw";
  else if (mode === "move") btnId = "btnMove";
  else if (mode === "delete") btnId = "btnDelete";

  if (btnId) {
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.add("active");
  }
}

document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const btnMode = btn.getAttribute("data-mode"); // safer than dataset.mode

    if (btnMode === "refresh") {
      refreshCanvas();
    } else {
      if (mode === "draw" && currentPolyline.length > 0) {
        polylines.push(currentPolyline);
        currentPolyline = [];
      }
      setMode(btnMode);
      redraw();
    }
  });
});

function updateStatus(message, color = "#333") {
  bottomBar.innerText = message;
  bottomBar.style.color = color;
}

function refreshCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateStatus("Refreshing canvas...", "#0077cc");

  setTimeout(() => {
    redraw();
    updateStatus("Canvas refreshed", "#0077cc");
    setMode("draw");
  }, 300);
}

function saveState() {
  undoStack.push(
    JSON.parse(
      JSON.stringify({
        polylines,
        currentPolyline,
      })
    )
  );
  redoStack = [];
}
function undo() {
  if (undoStack.length === 0) return;

  redoStack.push(
    JSON.parse(
      JSON.stringify({
        polylines,
        currentPolyline,
      })
    )
  );

  const prevState = undoStack.pop();

  polylines = prevState.polylines;
  currentPolyline = prevState.currentPolyline;

  redraw();
  updateStatus("Undo performed", "#f59e0b");
}

function undo() {
  if (undoStack.length === 0) return;

  redoStack.push(
    JSON.parse(
      JSON.stringify({
        polylines,
        currentPolyline,
      })
    )
  );

  const prevState = undoStack.pop();

  polylines = prevState.polylines;
  currentPolyline = prevState.currentPolyline;
  selectedPoint = null;
  hoveredPoint = null;
  redraw();
  updateStatus("Undo performed", "#f59e0b");
}
function redo() {
  if (redoStack.length === 0) return;

  undoStack.push(
    JSON.parse(
      JSON.stringify({
        polylines,
        currentPolyline,
      })
    )
  );

  const nextState = redoStack.pop();

  polylines = nextState.polylines;
  currentPolyline = nextState.currentPolyline;

  redraw();
  updateStatus("Redo performed", "#10b981");
}

function clearCanvas() {
  saveState();

  polylines = [];
  currentPolyline = [];
  selectedPoint = null;
  hoveredPoint = null;

  redraw();
  updateStatus("Canvas cleared", "red");
}

function exportPNG() {
  const link = document.createElement("a");
  link.download = "canvas.png";
  link.href = canvas.toDataURL("image/png");
  link.click();

  updateStatus("Exported as PNG", "#0369a1");
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  redraw();
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

document.getElementById("btnUndo")?.addEventListener("click", undo);
document.getElementById("btnRedo")?.addEventListener("click", redo);
document.getElementById("btnClear")?.addEventListener("click", clearCanvas);
document.getElementById("btnExportPNG")?.addEventListener("click", exportPNG);
