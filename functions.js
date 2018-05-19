
function train(text) {
  // Reset wordList:
  wordList = {};

  // Read and tokenize input
  text = cleanText(text);
  let tokens = text.split(" ");
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



function generateParagraph(limit) {
  const words = Object.keys(wordList);
  const start = Math.floor(Math.random() * (words.length));
  let iterator = 0;
  let paragraph = words[start];
  let nextWord = getNextWords(paragraph)[0];
  paragraph = paragraph.charAt(0).toUpperCase() + paragraph.slice(1);

  while (nextWord && iterator < limit) {
    paragraph += " " + nextWord;
    let nextIndex;
    const possibleNextWords = getNextWords(nextWord);

    if (isRepeating(paragraph)) {
      // The dialog seems to be looping, randomize the next word:
      nextIndex = Math.floor( Math.random() * (possibleNextWords.length) );
    }
    else {
      // Use the next logical word:
      nextIndex = 0;
    }

    nextWord = possibleNextWords[nextIndex];
    iterator++;
  }

  return paragraph;
}



function isRepeating(text) {
  const tokens = text.split(" ");
  let repeats = false;

  if (tokens.length > 10) {
    let phrase = tokens.slice(Math.max(tokens.length - 3, 1)).join(" ");
    let lastTenWords = tokens.slice(Math.max(tokens.length - 25, 1)).splice(0, 22).join(" ");
    repeats = (lastTenWords.search(phrase) == -1) ? false : true;
  }

  return repeats;
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

  const lastWord = words[words.length-1];
  const nextWords = getNextWords(lastWord);

  for(let i=0; i<3; i++) {
    if (nextWords[i]) {
      suggestionButtons[i].innerText = nextWords[i];
    }
    else {
      suggestionButtons[i].innerText = "";
    }
  }
}



function getNextWords(current) {
  /* Returns an array of possible next words */
  let nextWords =[];

  if (current in wordList) {
    for(let i=0; i<wordList[current].length; i++){
      nextWords.push( wordList[current][i] );
    }
  }

  return nextWords;
}



function cleanText(text) {
  /* Removes characters that will interfere with regexs, and converts to lowercase */
  text = text.replace(/[\s\s,\t \n,]+/g, " ").replace(/[\]*\[*\(*\)*]/g, "").toLowerCase();
  return text;
}
