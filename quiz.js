function checkAnswer() {

let options = document.getElementsByName("q1");
let answer = "";

for (let i = 0; i < options.length; i++) {
if (options[i].checked) {
answer = options[i].value;
}
}

if (answer === "A") {
document.getElementById("result").innerHTML = "Correct!";
}
else {
document.getElementById("result").innerHTML = "Incorrect. The answer is 90°.";
}

}