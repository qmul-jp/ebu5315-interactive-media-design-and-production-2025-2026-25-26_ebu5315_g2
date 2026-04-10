let questions = [
{
question: "What is the angle in a semicircle?",
answers: ["90°", "60°", "180°", "45°"],
correct: 0
},

{
question: "Angles in the same segment are?",
answers: ["Equal", "Different", "Always 90°", "Random"],
correct: 0
},

{
question: "The angle at the center is how many times the angle at the circumference?",
answers: ["2 times", "3 times", "Same", "Half"],
correct: 0
}
];

let currentQuestion = 0;
let score = 0;

function loadQuestion(){

let q = questions[currentQuestion];

document.getElementById("question").innerText = q.question;

let answersHTML = "";

for(let i=0;i<q.answers.length;i++){

answersHTML += `
<label>
<input type="radio" name="answer" value="${i}">
${q.answers[i]}
</label><br>
`;

}

document.getElementById("answers").innerHTML = answersHTML;

}

function submitAnswer(){

let options = document.getElementsByName("answer");

let selected = -1;

for(let i=0;i<options.length;i++){
if(options[i].checked){
selected = options[i].value;
}
}

if(selected == questions[currentQuestion].correct){

score++;

document.getElementById("feedback").innerText="Correct!";

}else{

document.getElementById("feedback").innerText="Incorrect.";

}

currentQuestion++;

if(currentQuestion < questions.length){

setTimeout(()=>{
document.getElementById("feedback").innerText="";
loadQuestion();
},1000);

}else{

document.getElementById("question").innerText="Quiz Finished!";
document.getElementById("answers").innerHTML="";
document.getElementById("score").innerText="Final Score: "+score+"/"+questions.length;

}

}

loadQuestion();