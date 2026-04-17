// 三个level题库
let questionBank = {
    easy: [
        {
            question: "What is the angle in a semicircle?",
            answers: ["90°", "60°", "180°", "45°"],
            correct: 0
        },
        {
            question: "Angles in the same segment are?",
            answers: ["Equal", "Different", "Random", "Always 90°"],
            correct: 0
        }
    ],

    medium: [
        {
            question: "Angle at center is how many times angle at circumference?",
            answers: ["2 times", "Same", "Half", "3 times"],
            correct: 0
        },
        {
            question: "A tangent is perpendicular to?",
            answers: ["Radius", "Diameter", "Chord", "Arc"],
            correct: 0
        }
    ],

    hard: [
        {
            question: "Opposite angles in cyclic quadrilateral are?",
            answers: ["Supplementary", "Equal", "90°", "Random"],
            correct: 0
        },
        {
            question: "Angle between tangent and chord equals?",
            answers: ["Angle in opposite arc", "90°", "45°", "Random"],
            correct: 0
        }
    ]
};

let levels = ["easy", "medium", "hard"];
let currentLevelIndex = 0;

let currentQuestion;
let score = 0;
let questionCount = 0;


// 随机抽题
function getRandomQuestion(level){
    let list = questionBank[level];
    let index = Math.floor(Math.random() * list.length);
    return list[index];
}


// 加载题目
function loadQuestion(){

    let level = levels[currentLevelIndex];
    document.getElementById("level").innerText = "Level: " + level.toUpperCase();

    currentQuestion = getRandomQuestion(level);

    document.getElementById("question").innerText = currentQuestion.question;

    let answersHTML = "";

    currentQuestion.answers.forEach((ans, i)=>{
        answersHTML += `
        <label>
        <input type="radio" name="answer" value="${i}">
        ${ans}
        </label>
        `;
    });

    document.getElementById("answers").innerHTML = answersHTML;
}


// 提交答案
function submitAnswer(){

    let options = document.getElementsByName("answer");
    let selected = -1;

    options.forEach(opt=>{
        if(opt.checked){
            selected = opt.value;
        }
    });

    if(selected == -1){
        alert("Please select an answer!");
        return;
    }

    // 正确
    if(selected == currentQuestion.correct){
        score++;
        document.getElementById("feedback").innerHTML = "✅ Correct!";
        document.body.style.background = "#d4edda";
    }else{
        document.getElementById("feedback").innerHTML = "❌ Incorrect!";
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

    document.getElementById("score").innerText = "Score: " + score;
}


// 初始化
loadQuestion();