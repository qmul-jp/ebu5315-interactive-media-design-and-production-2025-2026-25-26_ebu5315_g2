// 三个level题库
let questionBank = {
    easy: [
        {
            question: {
                zh: "半圆中的角度是多少？",
                en: "What is the angle in a semicircle?"
            },
            answers: ["90°", "60°", "180°", "45°"],
            correct: 0
        },
        {
            question: {
                zh: "同一段弧上的角度是？",
                en: "Angles in the same segment are?"
            },
            answers: [
                { zh: "相等", en: "Equal" },
                { zh: "不同", en: "Different" },
                { zh: "随机", en: "Random" },
                { zh: "总是90°", en: "Always 90°" }
            ],
            correct: 0
        }
    ],

    medium: [
        {
            question: {
                zh: "圆心角是圆周角的多少倍？",
                en: "Angle at center is how many times angle at circumference?"
            },
            answers: [
                { zh: "2倍", en: "2 times" },
                { zh: "相同", en: "Same" },
                { zh: "一半", en: "Half" },
                { zh: "3倍", en: "3 times" }
            ],
            correct: 0
        },
        {
            question: {
                zh: "切线垂直于？",
                en: "A tangent is perpendicular to?"
            },
            answers: [
                { zh: "半径", en: "Radius" },
                { zh: "直径", en: "Diameter" },
                { zh: "弦", en: "Chord" },
                { zh: "弧", en: "Arc" }
            ],
            correct: 0
        }
    ],

    hard: [
        {
            question: {
                zh: "圆内接四边形的对角是？",
                en: "Opposite angles in cyclic quadrilateral are?"
            },
            answers: [
                { zh: "互补", en: "Supplementary" },
                { zh: "相等", en: "Equal" },
                { zh: "90°", en: "90°" },
                { zh: "随机", en: "Random" }
            ],
            correct: 0
        },
        {
            question: {
                zh: "切线与弦之间的角度等于？",
                en: "Angle between tangent and chord equals?"
            },
            answers: [
                { zh: "对弧中的角度", en: "Angle in opposite arc" },
                { zh: "90°", en: "90°" },
                { zh: "45°", en: "45°" },
                { zh: "随机", en: "Random" }
            ],
            correct: 0
        }
    ]
};

let levels = ["easy", "medium", "hard"];
let currentLevelIndex = 0;

let currentQuestion;
let score = 0;
let questionCount = 0;
let currentLang = 'zh'; // 默认语言


// 随机抽题
function getRandomQuestion(level){
    let list = questionBank[level];
    let index = Math.floor(Math.random() * list.length);
    return list[index];
}


// 加载题目
function loadQuestion(){

    let level = levels[currentLevelIndex];
    const levelText = {
        zh: {
            easy: "难度：简单",
            medium: "难度：中等",
            hard: "难度：困难"
        },
        en: {
            easy: "Level: EASY",
            medium: "Level: MEDIUM",
            hard: "Level: HARD"
        }
    };
    document.getElementById("level").innerText = levelText[currentLang][level];

    currentQuestion = getRandomQuestion(level);

    // 显示问题
    if (typeof currentQuestion.question === 'object') {
        document.getElementById("question").innerText = currentQuestion.question[currentLang];
    } else {
        document.getElementById("question").innerText = currentQuestion.question;
    }

    let answersHTML = "";

    currentQuestion.answers.forEach((ans, i)=>{
        let answerText = ans;
        if (typeof ans === 'object') {
            answerText = ans[currentLang];
        }
        answersHTML += `
        <label>
        <input type="radio" name="answer" value="${i}">
        ${answerText}
        </label>
        `;
    });

    document.getElementById("answers").innerHTML = answersHTML;
    
    // 更新其他文本
    updateQuizText();
}

// 更新测验文本
function updateQuizText(){
    const textMap = {
        zh: {
            questionNumber: `问题 ${questionCount + 1}/10`,
            currentScore: `得分: ${score}`,
            submitBtn: "✅ 提交答案",
            nextBtn: "➡️ 下一题",
            alert: "请选择一个答案！",
            correct: "✅ 正确！",
            incorrect: "❌ 错误！",
            scoreDisplay: `得分: ${score}`
        },
        en: {
            questionNumber: `Question ${questionCount + 1}/10`,
            currentScore: `Score: ${score}`,
            submitBtn: "✅ Submit Answer",
            nextBtn: "➡️ Next Question",
            alert: "Please select an answer!",
            correct: "✅ Correct!",
            incorrect: "❌ Incorrect!",
            scoreDisplay: `Score: ${score}`
        }
    };
    
    document.getElementById("questionNumber").innerText = textMap[currentLang].questionNumber;
    document.getElementById("currentScoreDisplay").innerText = textMap[currentLang].currentScore;
    document.getElementById("submitBtn").innerText = textMap[currentLang].submitBtn;
    document.getElementById("nextQuestionBtn").innerText = textMap[currentLang].nextBtn;
    document.getElementById("score").innerText = textMap[currentLang].scoreDisplay;
}

// 切换语言
function updateQuizLanguage(lang){
    currentLang = lang;
    loadQuestion();
}

// 暴露给全局
window.updateQuizLanguage = updateQuizLanguage;


// 提交答案
function submitAnswer(){

    let options = document.getElementsByName("answer");
    let selected = -1;

    options.forEach(opt=>{
        if(opt.checked){
            selected = opt.value;
        }
    });

    const textMap = {
        zh: {
            alert: "请选择一个答案！",
            correct: "✅ 正确！",
            incorrect: "❌ 错误！",
            scoreDisplay: `得分: ${score}`
        },
        en: {
            alert: "Please select an answer!",
            correct: "✅ Correct!",
            incorrect: "❌ Incorrect!",
            scoreDisplay: `Score: ${score}`
        }
    };

    if(selected == -1){
        alert(textMap[currentLang].alert);
        return;
    }

    // 正确
    if(selected == currentQuestion.correct){
        score++;
        document.getElementById("feedback").innerHTML = textMap[currentLang].correct;
        document.body.style.background = "#d4edda";
    }else{
        document.getElementById("feedback").innerHTML = textMap[currentLang].incorrect;
        document.body.style.background = "#f8d7da";
    }

    questionCount++;

    // 每2题升级
    if(questionCount % 2 === 0 && currentLevelIndex < levels.length - 1){
        currentLevelIndex++;
    }

    setTimeout(()=>{
        document.body.style.background = "#f0f0f0";
        document.getElementById("feedback").innerHTML = "";
        loadQuestion();
    },1000);

    document.getElementById("score").innerText = textMap[currentLang].scoreDisplay;
}


// 初始化
loadQuestion();