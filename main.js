let wordList = {};
const userInputBox = document.getElementById('user-input');
const textGenerateBox = document.getElementById('text-generation');
const demos = document.getElementById('demos');
const suggestionButtons = document.getElementsByClassName('suggestion');


//===== Event Handlers ===================================
document.getElementById('train-btn').addEventListener('click', (e) => {
  const text = document.getElementById('training-box').value.trim();
  train(text);
  demos.style.display = 'block';
});


userInputBox.addEventListener('keyup', (e) => {
  if (event.keyCode === 32 ) {
    userInputKeyUp();
  }
});


for(let i=0; i<suggestionButtons.length; i++){
  suggestionButtons[i].addEventListener('click', (e) => {
    if (e.target.innerText.trim() != "") {
      const existingText = userInputBox.value;
      userInputBox.value = existingText + e.target.innerText + " ";
      userInputKeyUp();
    }
  });
}


document.getElementById('generateBtn').addEventListener('click', (e) => {
  const max = document.getElementById('maximum').value;
  textGenerateBox.innerText = generateParagraph(max);
});
