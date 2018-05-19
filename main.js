const wordList = {};
const userInputBox = document.getElementById('user-input');
const demos = document.getElementsByClassName('demo');
const suggestionButtons = document.getElementsByClassName('suggestion');


//===== Event Handlers ===================================
document.getElementById('train-btn').addEventListener('click', (e) => {
  const text = document.getElementById('training-box').value;
  train(text);
  for(let i=0; i<demos.length; i++){
    demos[i].style.display = 'block';
  }
});

userInputBox.addEventListener('keyup', (e) => {
  if (event.keyCode === 32 ) {
    userInputKeyUp();
  }
});

for(let i=0; i<suggestionButtons.length; i++){
  suggestionButtons[i].addEventListener('click', (e) => {
    const existingText = userInputBox.value;
    userInputBox.value = existingText + e.target.innerText + " ";
    userInputKeyUp();
  });
}



//===== Functions ===================================
function train(text) {
  // Read and tokenize input
  text = text.replace(/[\s\s,\t \n,]+/g, " ");
  let tokens = text.toLowerCase().split(" ");
  for(let i=0; i<tokens.length; i++){
    const thisWord = tokens[i];

    if (thisWord in wordList) {
      // Word is already in wordList, only add its next word:
      if (i+1 < tokens.length) {
        const nextWord = tokens[i+1];
        wordList[thisWord].push(nextWord);
      }
    }
    else {
      // Not yet in wordList, add it & its next word:
      wordList[thisWord] = [];
      if (i+1 < tokens.length){
        wordList[thisWord].push(tokens[i+1]);
      }
    }
  }

  for (let words in wordList){
    wordList[words] = sortByOccurrence(wordList[words]);
  }

  //console.table(wordList);
}


function sortByOccurrence(word) {
  const count = {};
  let sortedList = [];

  // Count occurrence of each word:
  for (let i=0; i<word.length; i++) {
    if (word[i] in count) {
      count[word[i]]++;
    } else {
      count[word[i]] = 1;
    }
  }

  // Sort:
  sortedList = Object.keys(count).sort( (a, b) => {
    return count[b] - count[a];
  });

  return sortedList;
}


function userInputKeyUp() {
  let words = userInputBox.value.split(" ");
  for(let i=0; i<words.length; i++){
    if (words[i] === "") {
      words.splice(i, 1);
    }
  }

  let lastWord = words[words.length-1];

  if (lastWord in wordList) {
    for(let i=0; i<3; i++){
      if(wordList[lastWord][i] !== undefined){
        suggestionButtons[i].innerText = wordList[lastWord][i];
      }
      else {
        suggestionButtons[i].innerText = "";
      }
    }
  }
  else {
    suggestionButtons[0].innerText = "";
    suggestionButtons[1].innerText = "";
    suggestionButtons[2].innerText = "";
  }
}
