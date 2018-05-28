let vocabulary;

// Create new vocabulary or restore from previous data
if (localStorage.getItem('savedVocabulary') != null) {
  vocabulary = JSON.parse( localStorage.getItem('savedVocabulary') );
  demos.style.display = 'block';
} else {
  vocabulary = {};
  demos.style.display = 'none';
}

function saveVocabulary(vocabulary) {
  localStorage.setItem('savedVocabulary', JSON.stringify(vocabulary));
}


function train(text) {
  let tokens = cleanText(text).split(" ");

  for(let i=0; i<tokens.length; i++){
    const thisWord = tokens[i];

    if (thisWord in vocabulary) {
      // Word is already in vocabulary, only add its next word:
      if (i+1 < tokens.length) {
        const nextWord = tokens[i+1];
        vocabulary[thisWord].push(nextWord);
      }
    }
    else {
      // Not yet in vocabulary, add it & its next word:
      vocabulary[thisWord] = [];
      if (i+1 < tokens.length){
        vocabulary[thisWord].push(tokens[i+1]);
      }
    }
  }

  for (let words in vocabulary){
    vocabulary[words] = sortByOccurrence(vocabulary[words]);
  }

  //console.table(vocabulary);
}


function generateParagraph(limit) {
  const words = Object.keys(vocabulary);
  const start = Math.floor(Math.random() * (words.length));
  let paragraph = words[start];
  let nextWord = vocabulary[paragraph][0];
  paragraph = paragraph.charAt(0).toUpperCase() + paragraph.slice(1);
  let capitalize = (nextWord.substring(nextWord.length-1) == '.') ? true : false;
  let iterator = 0;

  while (nextWord && iterator < limit) {
    if (capitalize) {
      // Capitalize first letter of new sentence
      nextWord = nextWord.charAt(0).toUpperCase() + nextWord.slice(1);
      capitalize = false;
    }
    paragraph += " " + nextWord;
    let nextIndex;
    const possibleNextWords = vocabulary[nextWord];

    if (typeof possibleNextWords != 'undefined' && possibleNextWords.length > 0) {
      nextIndex = Math.floor( Math.random() * (possibleNextWords.length) );
      nextWord = possibleNextWords[nextIndex];
    }
    else {
      // No words available, randomize next word:
      nextWord = words[ Math.floor(Math.random() * (words.length)) ];
    }

    capitalize = (nextWord.substring(nextWord.length-1) == '.') ? true : false;
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
    if (repeats) {
      console.log("Repeating phrase '" + phrase + "'");
    }
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


function getLastWord(text) {
  const tokens = text.split(" ");
  return tokens[tokens.length-1];
}


function predictPath( text ) {
  let possibilities = {};
  possibilities.one = vocabulary[text];
  if (possibilities.one.length > 0) {
    possibilities.two = vocabulary[possibilities.one[0]];
    if (possibilities.two.length > 0) {
      possibilities.three = vocabulary[possibilities.two[0]];
    }
  }

  return possibilities;
}


function speakText(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance();
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices[1];
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.text = text;

    speechSynthesis.speak(utterance);
  }
}


function cleanText(text) {
  /* Removes characters that will interfere with regexs, and converts to lowercase */
  text = text.replace(/[\s\s,\t \n,]+/g, " ").replace(/[\]*\[*\(*\)*]/g, "").toLowerCase().trim();
  return text;
}
