 document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const centralEl = document.getElementById('centralAngle');
    const inscribedEl = document.getElementById('inscribedAngle');
    const resetBtn = document.getElementById('resetBtn');

    const circle = { x: 400, y: 300, radius: 200 };

    let points = {
        A: { x: 200, y: 300, dragging: false },
        B: { x: 600, y: 300, dragging: false },
        C: { x: 400, y: 100, dragging: false }
    };

    function getDistance(p1, p2) {
        return Math.hypot(p2.x - p1.x, p2.y - p1.y);
    }

    function getAngle(center, p) {
        return Math.atan2(p.y - center.y, p.x - center.x);
    }

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
        const angle = Math.acos((a*a + b*b - c*c) / (2*a*b)) * 180 / Math.PI;
        return isNaN(angle) ? 0 : angle;
    }

    function draw() {
        ctx.clearRect(0, 0, 800, 600);

        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(circle.x, circle.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillText('O', circle.x + 10, circle.y - 10);

        ctx.beginPath();
        ctx.moveTo(circle.x, circle.y);
        ctx.lineTo(points.A.x, points.A.y);
        ctx.moveTo(circle.x, circle.y);
        ctx.lineTo(points.B.x, points.B.y);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(points.C.x, points.C.y);
        ctx.lineTo(points.A.x, points.A.y);
        ctx.lineTo(points.B.x, points.B.y);
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 2;
        ctx.stroke();

        for (const [name, p] of Object.entries(points)) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
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

    function getMouse(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    canvas.addEventListener('mousedown', (e) => {
        const m = getMouse(e);
        for (const p of Object.values(points)) {
            if (getDistance(m, p) < 15) {
                p.dragging = true;
            }
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const m = getMouse(e);
        for (const p of Object.values(points)) {
            if (p.dragging) {
                const angle = Math.atan2(m.y - circle.y, m.x - circle.x);
                p.x = circle.x + circle.radius * Math.cos(angle);
                p.y = circle.y + circle.radius * Math.sin(angle);
            }
        }
        draw();
    });

    canvas.addEventListener('mouseup', () => {
        for (const p of Object.values(points)) p.dragging = false;
    });

    resetBtn.addEventListener('click', () => {
        points = {
            A: { x: 200, y: 300, dragging: false },
            B: { x: 600, y: 300, dragging: false },
            C: { x: 400, y: 100, dragging: false }
        };
        draw();
    });

    draw();
    console.log("V2 loaded successfully");
});