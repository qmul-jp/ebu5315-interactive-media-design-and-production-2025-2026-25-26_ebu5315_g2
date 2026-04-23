// ===== 1. 画布与核心交互数据 =====
const canvas = document.getElementById('geomCanvas');
const ctx = canvas.getContext('2d');

const circle = { x: 200, y: 150, radius: 90 };
let points = {
    A: { x: 0, y: 0, fixed: true, name: 'A' },
    B: { x: 0, y: 0, fixed: true, name: 'B' },
    C: { x: 200, y: 60, fixed: false, name: 'C' }
};
let draggingPoint = null;

// ===== 2. 混合型题库 =====
let questionBank = {
    easy: [
        {
            id: 'easy_1',
            question: "试着拖动绿色的点 C。这是一个半圆，无论你怎么拖动，对应的圆周角 (∠ACB) 始终是多少度？",
            answers: ["90° (直角)", "60° (锐角)", "180° (平角)", "不断变化"],
            correct: 0,
            score: 10,
            drawType: 'semicircle'
        },
        {
            id: 'easy_2',
            question: "拖动点 C。仔细观察同弧 (AB) 对应的圆心角 (∠AOB) 与圆周角 (∠ACB)，它们有什么稳定的关系？",
            answers: ["圆周角是圆心角的两倍", "它们永远相等", "圆心角是圆周角的两倍", "两者没有数学关系"],
            correct: 2,
            score: 10,
            drawType: 'central'
        }
    ],
    medium: [
        {
            id: 'medium_1',
            question: "拖动点 C 和点 D。它们对着同一条弦 AB。这两个圆周角 (∠ACB 和 ∠ADB) 的大小关系是？",
            answers: ["互补 (和为180°)", "永远相等", "互余 (和为90°)", "大小不固定"],
            correct: 1,
            score: 20,
            drawType: 'chord'
        }
    ]
};

// 维护已答题目ID（避免重复抽题，修复核心逻辑：提交后才标记已答）
let answeredQuestionIds = [];

// 状态变量
let levels = ["easy", "medium"];
let currentLevelIndex = 0;
let currentQuestion = null;
let score = 0;
let questionCount = 0;

let stats = {
    totalQuestions: Object.values(questionBank).reduce((sum, level) => sum + level.length, 0),
    answered: 0, correct: 0, incorrect: 0
};

// ===== 3. 工具函数 =====
function getDistance(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

// 获取Canvas缩放比例（解决拖拽偏移）
function getCanvasScale() {
    const rect = canvas.getBoundingClientRect();
    return {
        scaleX: canvas.width / rect.width,
        scaleY: canvas.height / rect.height
    };
}

// ===== 4. Canvas 绘图与数学引擎 =====
// 设定不同题目的初始点位
function setupGeometry(type) {
    if (!type) return;
    if (type === 'semicircle') {
        points.A.x = circle.x - circle.radius; points.A.y = circle.y;
        points.B.x = circle.x + circle.radius; points.B.y = circle.y;
        delete points.D;
    } else if (type === 'central' || type === 'chord') {
        // A, B 在圆圈下方
        points.A.x = circle.x - circle.radius * Math.cos(Math.PI/4);
        points.A.y = circle.y + circle.radius * Math.sin(Math.PI/4);
        points.B.x = circle.x + circle.radius * Math.cos(Math.PI/4);
        points.B.y = circle.y + circle.radius * Math.sin(Math.PI/4);
        
        if (type === 'chord') {
            points.D = { x: 130, y: 100, fixed: false, name: 'D' };
        } else {
            delete points.D;
        }
    }
}

function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 画圆与圆心
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#5c6cff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(circle.x, circle.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffb84d';
    ctx.fill();
    ctx.fillStyle = '#23325f';
    ctx.font = 'bold 14px Arial';
    ctx.fillText("O", circle.x - 5, circle.y + 20);

    // 绘制几何线段
    if (currentQuestion) {
        ctx.beginPath();
        ctx.strokeStyle = '#7ed7ff';
        ctx.lineWidth = 2;

        if (currentQuestion.drawType === 'semicircle') {
            // 直径与圆周角
            ctx.moveTo(points.A.x, points.A.y);
            ctx.lineTo(points.B.x, points.B.y);
            ctx.lineTo(points.C.x, points.C.y);
            ctx.closePath();
            ctx.stroke();
        } else if (currentQuestion.drawType === 'central') {
            // 圆周角
            ctx.moveTo(points.A.x, points.A.y);
            ctx.lineTo(points.C.x, points.C.y);
            ctx.lineTo(points.B.x, points.B.y);
            ctx.stroke();
            
            // 圆心角
            ctx.beginPath();
            ctx.strokeStyle = '#f45aa6';
            ctx.moveTo(points.A.x, points.A.y);
            ctx.lineTo(circle.x, circle.y);
            ctx.lineTo(points.B.x, points.B.y);
            ctx.stroke();
        } else if (currentQuestion.drawType === 'chord') {
            // 弦 AB
            ctx.moveTo(points.A.x, points.A.y);
            ctx.lineTo(points.B.x, points.B.y);
            
            // 圆周角 1
            ctx.moveTo(points.A.x, points.A.y);
            ctx.lineTo(points.C.x, points.C.y);
            ctx.lineTo(points.B.x, points.B.y);

            // 圆周角 2
            if (points.D) {
                ctx.moveTo(points.A.x, points.A.y);
                ctx.lineTo(points.D.x, points.D.y);
                ctx.lineTo(points.B.x, points.B.y);
            }
            ctx.stroke();
        }
    }

    // 画控制点
    Object.values(points).forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.fixed ? 6 : 10, 0, Math.PI * 2);
        ctx.fillStyle = p.fixed ? '#7d88a8' : '#39c985';
        ctx.fill();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#23325f';
        ctx.fillText(p.name, p.x + 12, p.y - 12);
    });
}

// ===== 5. 交互事件（鼠标+触摸） =====
// 鼠标按下/触摸开始
function startDrag(e) {
    e.preventDefault();
    const isTouch = e.type.startsWith('touch');
    const eventSource = isTouch ? e.touches[0] : e;
    
    const rect = canvas.getBoundingClientRect();
    const scale = getCanvasScale();
    const mouseX = (eventSource.clientX - rect.left) * scale.scaleX;
    const mouseY = (eventSource.clientY - rect.top) * scale.scaleY;

    for (let key in points) {
        if (!points[key].fixed && getDistance({x: mouseX, y: mouseY}, points[key]) < 20) {
            draggingPoint = points[key];
            break;
        }
    }
}

// 鼠标移动/触摸移动
function dragMove(e) {
    e.preventDefault();
    if (!draggingPoint) return;
    
    const isTouch = e.type.startsWith('touch');
    const eventSource = isTouch ? e.touches[0] : e;
    
    const rect = canvas.getBoundingClientRect();
    const scale = getCanvasScale();
    const mouseX = (eventSource.clientX - rect.left) * scale.scaleX;
    const mouseY = (eventSource.clientY - rect.top) * scale.scaleY;

    // 核心计算：计算角度并将坐标强行限制在圆的半径上
    let angle = Math.atan2(mouseY - circle.y, mouseX - circle.x);
    draggingPoint.x = circle.x + circle.radius * Math.cos(angle);
    draggingPoint.y = circle.y + circle.radius * Math.sin(angle);
    
    drawScene();
}

// 鼠标松开/触摸结束
function endDrag() {
    draggingPoint = null;
}

// 注册鼠标事件
canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', dragMove);
canvas.addEventListener('mouseup', endDrag);
canvas.addEventListener('mouseleave', endDrag);

// 注册触摸事件（移动端适配）
canvas.addEventListener('touchstart', startDrag);
canvas.addEventListener('touchmove', dragMove);
canvas.addEventListener('touchend', endDrag);
canvas.addEventListener('touchcancel', endDrag);

// ===== 6. 问答测验系统（彻底修复递归问题） =====
// 核心：获取当前可答的题目列表
function getAvailableQuestions() {
    const currentLevel = levels[currentLevelIndex];
    const levelQuestions = questionBank[currentLevel] || [];
    // 过滤掉已答的题目
    return levelQuestions.filter(q => !answeredQuestionIds.includes(q.id));
}

// 检查是否所有题目都已完成
function checkAllFinished() {
    let allAnswered = true;
    for (let level of levels) {
        const levelQuestions = questionBank[level] || [];
        for (let q of levelQuestions) {
            if (!answeredQuestionIds.includes(q.id)) {
                allAnswered = false;
                break;
            }
        }
        if (!allAnswered) break;
    }
    return allAnswered;
}

// 加载题目（彻底移除递归，无死循环风险）
function loadQuestion() {
    // 1. 先检查是否所有题目都完成
    if (checkAllFinished()) {
        document.getElementById("question").innerText = "🎉 所有题目已完成！恭喜你掌握圆几何知识！";
        document.getElementById("answers").innerHTML = "";
        document.getElementById("submitBtn").disabled = true;
        document.getElementById("finishModal").classList.remove("hidden");
        return;
    }

    // 2. 获取当前难度的可答题
    let availableQuestions = getAvailableQuestions();

    // 3. 当前难度无可用题，自动切换下一个难度
    if (availableQuestions.length === 0) {
        if (currentLevelIndex < levels.length - 1) {
            currentLevelIndex++;
            // 显示升级提示
            document.getElementById("levelUpModal").classList.remove("hidden");
            // 重新获取新难度的可答题
            availableQuestions = getAvailableQuestions();
        } else {
            // 所有难度都无可用题，走完成逻辑
            checkAllFinished();
            return;
        }
    }

    // 4. 更新难度显示
    const currentLevel = levels[currentLevelIndex];
    document.getElementById("level").innerText = `当前难度: ${currentLevel === 'easy' ? '入门' : '进阶'}`;

    // 5. 随机抽题
    const randomIdx = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[randomIdx];

    // 6. 渲染题目
    const questionDom = document.getElementById("question");
    if (questionDom) questionDom.innerText = currentQuestion.question;

    // 7. 初始化画布
    setupGeometry(currentQuestion.drawType);
    drawScene();

    // 8. 渲染选项
    let answersHTML = "";
    currentQuestion.answers.forEach((ans, i) => {
        answersHTML += `
        <label>
            <input type="radio" name="answer" value="${i}">
            ${ans}
        </label>
        `;
    });
    
    const answersDom = document.getElementById("answers");
    if (answersDom) answersDom.innerHTML = answersHTML;

    // 9. 重置反馈和按钮
    const feedbackDom = document.getElementById("feedback");
    if (feedbackDom) feedbackDom.innerText = "";
    
    const btn = document.getElementById("submitBtn");
    if (btn) {
        btn.innerText = "提交答案";
        btn.disabled = false;
    }
}

// 提交答案
function submitAnswer() {
    if (!currentQuestion) return;

    let options = document.getElementsByName("answer");
    let selected = -1;
    options.forEach(opt => { if (opt.checked) selected = parseInt(opt.value); });

    const fb = document.getElementById("feedback");
    if (selected === -1) {
        fb.innerText = "⚠️ 请先选择一个选项！";
        fb.className = "incorrect";
        return;
    }

    // 判断对错
    const isCorrect = selected === currentQuestion.correct;
    stats.answered++;
    questionCount++;

    // 核心修复：提交答案后，才标记题目为已答
    if (!answeredQuestionIds.includes(currentQuestion.id)) {
        answeredQuestionIds.push(currentQuestion.id);
    }

    // 更新得分和反馈
    if (isCorrect) {
        stats.correct++;
        score += currentQuestion.score;
        fb.innerText = "✅ 回答正确！棒极了！";
        fb.className = "correct";
    } else {
        stats.incorrect++;
        fb.innerText = `❌ 回答错误。正确答案是: ${currentQuestion.answers[currentQuestion.correct]}`;
        fb.className = "incorrect";
    }

    // 更新页面显示
    document.getElementById("score").innerText = `得分: ${score}`;
    document.getElementById("submitBtn").disabled = true;

    // 2秒后加载下一题
    setTimeout(() => {
        loadQuestion();
    }, 2000);
}

// ===== 7. 弹窗控制 =====
function closeLevelUpModal() {
    document.getElementById("levelUpModal").classList.add("hidden");
}

function closeFinishModal() {
    document.getElementById("finishModal").classList.add("hidden");
}

// ===== 8. 统计与生命周期管理 =====
function resetQuiz() {
    // 重置所有状态
    score = 0;
    questionCount = 0;
    currentLevelIndex = 0;
    currentQuestion = null;
    answeredQuestionIds = [];
    stats = {
        totalQuestions: Object.values(questionBank).reduce((sum, level) => sum + level.length, 0),
        answered: 0, correct: 0, incorrect: 0
    };

    // 更新页面
    document.getElementById("score").innerText = `得分: ${score}`;

    // 关闭所有弹窗
    document.getElementById("statsModal").classList.add("hidden");
    document.getElementById("levelUpModal").classList.add("hidden");
    document.getElementById("finishModal").classList.add("hidden");

    // 重新加载第一题
    loadQuestion();
}

function showStats() {
    const correctRate = stats.answered === 0 
        ? "暂无答题" 
        : `${((stats.correct / stats.answered) * 100).toFixed(1)}%`;
    document.getElementById("totalQ").innerText = stats.totalQuestions;
    document.getElementById("answeredQ").innerText = stats.answered;
    document.getElementById("correctRate").innerText = correctRate;
    document.getElementById("finalScore").innerText = score;
    document.getElementById("statsModal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("statsModal").classList.add("hidden");
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const modals = ['statsModal', 'levelUpModal', 'finishModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.classList.add("hidden");
        }
    });
};

// 启动应用
window.onload = loadQuestion;