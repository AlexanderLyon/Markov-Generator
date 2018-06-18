
const keyupEvent = new Event('keyup');
const userInputBox = document.getElementById('user-input');
const textGenerateBox = document.getElementById('text-generation');
const demos = document.getElementById('demos');
const suggestionButtons = document.getElementsByClassName('suggestion');
const predictionInput = document.getElementById('prediction-input');
const predictCol1 = document.querySelector('#column-1 ul');
const columnOneLi = document.querySelectorAll('#column-1 li');
const predictCol2 = document.querySelector('#column-2 ul');
const columnTwoLi = document.querySelectorAll('#column-2 li');
const predictCol3 = document.querySelector('#column-3 ul');
const columnThreeLi = document.querySelectorAll('#column-3 li');
const treeWordsNext = document.querySelectorAll('#column-1 li');


//===== Event Handlers ===================================
document.getElementById('train-btn').addEventListener('click', (e) => {
  const text = document.getElementById('training-box').value.trim();
  train(text);
  demos.style.display = 'block';
  if (document.getElementById('saveVocab').checked) {
    saveVocabulary(vocabulary);
  }
});


document.getElementById('wiki-btn').addEventListener('click', (e) => {
  const limit = document.querySelector('.wiki-max').value;
  for (let i=0; i<limit; i++) {
    getWikiText().then((response) => {
      train(response);
    });
  }

  //console.log("Training complete \nRead " + limit + " entries.");
  if (document.getElementById('saveVocab').checked) {
    saveVocabulary(vocabulary);
  }
});


userInputBox.addEventListener('keyup', (e) => {
  if (event.keyCode === 32) {
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
  const max = document.querySelector('.gen-max').value;
  textGenerateBox.innerText = generateParagraph(max);
  if (textGenerateBox.value.length > 0) {
    document.getElementById('speak-text').style.display = "inline-block";
  }
});

document.getElementById('speak-text').addEventListener('click', (e) => {
  speakText(textGenerateBox.value);
});


predictionInput.addEventListener('keyup', (e) => {
  if( e.target.value == ""){
    predictCol1.style.display = "none";
    predictCol2.style.display = "none";
    predictCol3.style.display = "none";
  }
  else if (getLastWord(cleanText(e.target.value)) in vocabulary) {
    const path = predictPath( getLastWord(cleanText(e.target.value)) );
    if (path.one) {
      predictCol1.style.display = "inline-block";
      columnOneLi.forEach( (el, index) => {
        if (path.one[index]) {
          el.style.display = "block";
          el.innerText = path.one[index];
        }
        else {
          el.style.display = "none";
          el.innerText = "";
        }
      });
    }
    else {
      predictCol1.style.display = "none";
    }
    if (path.two) {
      predictCol2.style.display = "inline-block";
      columnTwoLi.forEach( (el, index) => {
        if (path.two[index]) {
          el.style.display = "block";
          el.innerText = path.two[index];
        }
        else {
          el.style.display = "none";
          el.innerText = "";
        }
      });
    }
    else {
      predictCol2.style.display = "none";
    }
    if (path.three) {
      predictCol3.style.display = "inline-block";
      columnThreeLi.forEach( (el, index) => {
        if (path.three[index]) {
          el.style.display = "block";
          el.innerText = path.three[index];
        }
        else {
          el.style.display = "none";
          el.innerText = "";
        }
      });
    }
    else {
      predictCol3.style.display = "none";
    }
  }
});

for(let i=0; i<treeWordsNext.length; i++){
  treeWordsNext[i].addEventListener('click', (e) => {
    const word = e.target.innerText;
    const firstChar = predictionInput.value[predictionInput.value.length-1] == " " ? "" : " ";
    predictionInput.value = predictionInput.value + firstChar + word + " ";
    predictionInput.dispatchEvent(keyupEvent);
  });
}

function userInputKeyUp() {
  let words = userInputBox.value.split(" ");
  for(let i=0; i<words.length; i++){
    if (words[i] === "") {
      words.splice(i, 1);
    }
  }

  const lastWord = words[words.length-1];
  const nextWords = vocabulary[lastWord];

  for(let i=0; i<3; i++) {
    if (nextWords[i]) {
      suggestionButtons[i].innerText = nextWords[i];
    }
    else {
      suggestionButtons[i].innerText = "";
    }
  }
}
