// V1: 基础Canvas初始化
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // 圆的基础参数
    const circle = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 200
    };

    // 绘制基础圆
    function drawCircle() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制圆
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 绘制圆心
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
    }

    // 初始绘制
    drawCircle();
    console.log('V1 loaded: Basic canvas setup complete');
});