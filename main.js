const wordList = {};


//===== Event Handlers ===================================
document.getElementById('train-btn').addEventListener('click', (e) => {
  const text = document.getElementById('training-box').value;
  train(text);
});




//===== Functions ===================================
function train(text) {
  // Read and tokenize input
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

  console.table(wordList);
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
