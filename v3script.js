document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const centralEl = document.getElementById('centralAngle');
    const inscribedEl = document.getElementById('inscribedAngle');
    const resetBtn = document.getElementById('resetBtn');
    const levelBtns = document.querySelectorAll('.level-btn');
    const theoremTitle = document.getElementById('theoremTitle');

    const circle = { x: 400, y: 300, radius: 200 };
    let currentLevel = 1;

    // Level 1 points
    let points = {
        A: { x: 200, y: 300, dragging: false },
        B: { x: 600, y: 300, dragging: false },
        C: { x: 400, y: 100, dragging: false }
    };

    // Level 2 points
    let tangentPoint = { x: 600, y: 300 };
    let externalPoint = { x: 700, y: 300, dragging: false };

    // -------------------------------
    // Tools
    // -------------------------------
    function getDistance(p1, p2) {
        return Math.hypot(p2.x - p1.x, p2.y - p1.y);
    }
    function getAngle(center, p) {
        return Math.atan2(p.y - center.y, p.x - center.x);
    }

    // -------------------------------
    // Level 1: Central / Inscribed
    // -------------------------------
    function calcCentralAngle() {
        const a1 = getAngle(circle, points.A);
        const a2 = getAngle(circle, points.B);
        let diff = Math.abs(a1 - a2) * 180 / Math.PI;
        return diff > 180 ? 360 - diff : diff;
    }
    function calcInscribedAngle() {
        const a = getDistance(points.B, points.C);
        const b = getDistance(points.A, points.C);
        const c = getDistance(points.A, points.B);
        if (a*b === 0) return 0;
        const cosVal = (a*a + b*b - c*c) / (2*a*b);
        const clamped = Math.max(-1, Math.min(1, cosVal));
        return Math.acos(clamped) * 180 / Math.PI;
    }

    // -------------------------------
    // Draw
    // -------------------------------
    function draw() {
        ctx.clearRect(0, 0, 800, 600);

        // Draw circle
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI*2);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Center
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, 6, 0, Math.PI*2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillText('O', circle.x + 10, circle.y - 10);

        if (currentLevel === 1) {
            drawLevel1();
        } else {
            drawLevel2();
        }
    }

    function drawLevel1() {
        // Radius lines
        ctx.beginPath();
        ctx.moveTo(circle.x, circle.y);
        ctx.lineTo(points.A.x, points.A.y);
        ctx.moveTo(circle.x, circle.y);
        ctx.lineTo(points.B.x, points.B.y);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inscribed angle lines
        ctx.beginPath();
        ctx.moveTo(points.C.x, points.C.y);
        ctx.lineTo(points.A.x, points.A.y);
        ctx.lineTo(points.B.x, points.B.y);
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Points
        for (const [name, p] of Object.entries(points)) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8, 0, Math.PI*2);
            ctx.fillStyle = p.dragging ? '#f39c12' : '#9b59b6';
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillText(name, p.x + 12, p.y - 10);
        }

        const ca = calcCentralAngle();
        const ia = calcInscribedAngle();
        centralEl.textContent = ca.toFixed(1) + '°';
        inscribedEl.textContent = ia.toFixed(1) + '°';
    }

    function drawLevel2() {
        // Radius to tangent
        ctx.beginPath();
        ctx.moveTo(circle.x, circle.y);
        ctx.lineTo(tangentPoint.x, tangentPoint.y);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Tangent line
        ctx.beginPath();
        ctx.moveTo(tangentPoint.x, tangentPoint.y);
        ctx.lineTo(externalPoint.x, externalPoint.y);
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Points
        ctx.beginPath();
        ctx.arc(tangentPoint.x, tangentPoint.y, 8, 0, Math.PI*2);
        ctx.fillStyle = '#9b59b6';
        ctx.fill();
        ctx.fillText('T', tangentPoint.x + 12, tangentPoint.y - 10);

        ctx.beginPath();
        ctx.arc(externalPoint.x, externalPoint.y, 8, 0, Math.PI*2);
        ctx.fillStyle = externalPoint.dragging ? '#f39c12' : '#27ae60';
        ctx.fill();
        ctx.fillText('P', externalPoint.x + 12, externalPoint.y - 10);

        centralEl.textContent = '90°';
        inscribedEl.textContent = 'Tangent ⊥ Radius';
    }

    // -------------------------------
    // Mouse
    // -------------------------------
    function getMouse(e) {
        const r = canvas.getBoundingClientRect();
        return {
            x: e.clientX - r.left,
            y: e.clientY - r.top
        };
    }

    canvas.addEventListener('mousedown', (e) => {
        const m = getMouse(e);
        if (currentLevel === 1) {
            for (const p of Object.values(points)) {
                if (getDistance(m, p) < 15) p.dragging = true;
            }
        } else {
            if (getDistance(m, externalPoint) < 15) externalPoint.dragging = true;
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const m = getMouse(e);
        if (currentLevel === 1) {
            for (const p of Object.values(points)) {
                if (p.dragging) {
                    const ang = Math.atan2(m.y - circle.y, m.x - circle.x);
                    p.x = circle.x + circle.radius * Math.cos(ang);
                    p.y = circle.y + circle.radius * Math.sin(ang);
                }
            }
        } else {
            if (externalPoint.dragging) {
                externalPoint.x = m.x;
                externalPoint.y = m.y;
            }
        }
        draw();
    });

    canvas.addEventListener('mouseup', () => {
        if (currentLevel === 1) {
            for (const p of Object.values(points)) p.dragging = false;
        } else {
            externalPoint.dragging = false;
        }
    });

    // -------------------------------
    // Reset & Level Switch
    // -------------------------------
    function reset() {
        if (currentLevel === 1) {
            points = {
                A: { x: 200, y: 300, dragging: false },
                B: { x: 600, y: 300, dragging: false },
                C: { x: 400, y: 100, dragging: false }
            };
        } else {
            tangentPoint = { x: 600, y: 300 };
            externalPoint = { x: 700, y: 300, dragging: false };
        }
        draw();
    }
    resetBtn.addEventListener('click', reset);

    levelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            levelBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLevel = parseInt(btn.dataset.level);

            if (currentLevel === 1) {
                theoremTitle.textContent = 'Central Angle = 2 × Inscribed Angle';
            } else {
                theoremTitle.textContent = 'Tangent ⊥ Radius (90°)';
            }
            reset();
        });
    });

    draw();
    console.log('V3 loaded: multi-level & responsive OK');
});