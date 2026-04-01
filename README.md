🖊️ Polyline Editor — Implementation & Deployment

📌 Project Overview

The Polyline Editor is an interactive web application for creating, editing, and managing multiple polylines on a canvas.

It supports:

Drawing, moving, and deleting points
Undo/redo functionality
Canvas refresh & clearing
Exporting canvas as PNG
Real-time styling of lines and points

💡 The project demonstrates Human-Computer Interaction (HCI) principles through:

Intuitive mouse & keyboard controls
Immediate visual feedback
Responsive and clean UI

✨ Features
Feature	Description
Draw (b)	Create polylines by clicking sequential points with live preview
Move (m)	Select and reposition points (Undo/Redo supported)
Delete (d)	Remove points while maintaining polyline continuity
Undo / Redo	Ctrl+Z / Ctrl+Y or toolbar buttons
Refresh (r)	Redraw canvas to remove artifacts
Clear	Reset all polylines
Export PNG	Save canvas as an image
Real-time Styling	Adjust line color, width, point color, radius
Hover Feedback	Orange highlight on hover
Selection Feedback	Red highlight with shadow
Limits	Max 100 polylines, 10px selection radius

🖼️ Screenshots

Drawing Mode
![Draw Mode] path: D:\HCI-LAB\hci-lab-polyline-editor\screenshots\draw.png
Move Mode
![Move Mode] path: D:\HCI-LAB\hci-lab-polyline-editor\screenshots\move.png
Delete / Refresh
![Delete Mode] path: D:\HCI-LAB\hci-lab-polyline-editor\screenshots\delete.png

🏗️ System Architecture
🔹 Tech Stack
HTML — Structure (Canvas + UI)
CSS — Responsive styling (gradients, shadows, layout)
JavaScript — Core logic & interactivity
🔹 Core Components

UI Elements

Canvas (drawing area)
Toolbar (modes & actions)
Left panel (styling controls)
Status bar (feedback)

Data Structures

polylines[]        // Stores all polylines
currentPolyline    // Active drawing polyline
undoStack          // Undo history
redoStack          // Redo history

Core Functions

redraw() — Re-render canvas
drawPolyline() — Draw lines & points
findNearestPoint() — Detect closest point
saveState() — Store history
undo() / redo() — Navigate states
clearCanvas() — Reset canvas
exportPNG() — Download image
setMode() — Switch interaction mode
🔄 Data Flow
User Input → Event Listener → Mode Handler  
→ Update Data → Redraw Canvas → Visual Feedback
💻 Code Walkthrough
🎹 Event Handling

Keyboard Shortcuts

b → Draw mode
m → Move mode
d → Delete mode
r → Refresh
Ctrl+Z / Ctrl+Y → Undo / Redo
Ctrl+S → Export PNG
Ctrl+Delete → Clear

Mouse Events

mousemove → Hover detection & preview
click → Draw / Move / Delete actions

Resize

Maintains canvas responsiveness and redraws elements
⚙️ Core Logic
Redraw System ensures smooth updates
Nearest Point Detection within 10px radius
Undo/Redo uses deep copies for reliability
Real-time Styling updates instantly
🚀 Deployment
🌐 Live Demo

👉 https://hci-lab-polyline-editor.vercel.app

🔹 Deploy on Vercel
Push project to GitHub
Connect repo to Vercel
Deploy as static site
🔹 Run Locally
git clone https://github.com/Sana-212/hci-lab-polyline-editor
cd polyline-editor

# Open directly
index.html

# OR run local server
python -m http.server 8000

Visit: http://localhost:5500

🧪 Testing & Validation
✅ Functional Testing
All features verified: Draw, Move, Delete, Undo/Redo, Export, Styling
⚠️ Edge Cases
Max 100 polylines handled
Overlapping point detection works
Empty canvas operations safe
Responsive resizing preserves data
🎨 Visual Validation
Hover → Orange highlight
Selected → Red with shadow
PNG export matches canvas
⚖️ Challenges & Trade-offs
🔸 Challenges
Accurate hover detection
Reliable undo/redo state management
Maintaining responsiveness
Real-time styling without lag
🔸 Trade-offs
Deep copies (memory vs reliability)
100 polyline limit (performance vs flexibility)
🧠 Design Decisions
Arrays of objects → simple & efficient
Canvas API → fast rendering
10px selection radius → better UX
🔗 Links
📂 GitHub Repo
https://github.com/Sana-212/hci-lab-polyline-editor
🌍 Live Demo
https://hci-lab-polyline-editor.vercel.app
📎 Notes

This project was developed as part of an HCI Lab Exercise, focusing on usability, responsiveness, and interaction design principles.