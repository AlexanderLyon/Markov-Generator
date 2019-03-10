let vocabulary;


function getVocabulary() {
  return vocabulary;
}


function loadVocabulary() {
  return fetch('../utilities/getVocabulary.php')
  .then(response => response.json())
  .then((data) => {
    if (data) {
      vocabulary = data;
      console.log("Vocabulary loaded");
    }
    else {
      vocabulary = {};
    }
  })
  .catch((err) => {
    console.warn("Unable to fetch vocabulary. The JSON file is most likely empty. \nCreating a new vocabulary object...");
    vocabulary = {};
  });
}


function saveVocabulary(vocabulary) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '../utilities/saveVocabulary.php');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = () => {
      if (xhr.status === 200) {
        // console.log("Saved!");
        resolve();
      }
    };
    xhr.send("data=" + encodeURIComponent(JSON.stringify(vocabulary)));
  });
}


function train(text) {
  return new Promise((resolve, reject) => {
    let tokens = cleanText(text).split(" ");

    for (let i=0; i<tokens.length; i++) {
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
        if (i+1 < tokens.length) {
          vocabulary[thisWord].push(tokens[i+1]);
        }
      }
    }

    for (let words in vocabulary) {
      vocabulary[words] = sortByOccurrence(vocabulary[words]);
    }
    resolve();
  }).then(() => {
    return saveVocabulary(vocabulary);
  });
}


function cleanText(text) {
  /* Removes HTML tags and other characters that will interfere with regexs */
  return text.replace(/(<([^>]+)>)/ig,"").replace(/[\s\s,\t \n,]+/g, " ").replace(/[\]*\[*\(*\)*\_*]/g, "").trim();
}


function generateParagraph(limit) {
  const words = Object.keys(vocabulary);
  const start = Math.floor(Math.random() * (words.length));
  let paragraph = words[start];
  let nextWord = vocabulary[paragraph][0];
  paragraph = paragraph.charAt(0).toUpperCase() + paragraph.slice(1);
  let capitalize = (paragraph.search(/(\.|\?|!)/g) != -1) ? true : false;
  let iterator = 0;

  while (nextWord && iterator < limit) {
    let thisWord = nextWord;

    if (capitalize) {
      // Capitalize first letter of new sentence
      thisWord = thisWord.charAt(0).toUpperCase() + thisWord.slice(1);
      capitalize = false;
    }
    paragraph += " " + thisWord;

    let nextIndex;
    const possibleNextWords = vocabulary[thisWord];

    if (typeof possibleNextWords != 'undefined' && possibleNextWords.length > 0) {
      nextIndex = Math.floor( Math.random() * (possibleNextWords.length) );
      nextWord = possibleNextWords[nextIndex];
    }
    else {
      // No words available, randomize next word:
      nextWord = words[Math.floor(Math.random() * (words.length))];
    }

    capitalize = (thisWord.search(/(\.|\?|!)/g) != -1) ? true : false;
    iterator++;
  }

  return paragraph;
}


function sortByOccurrence(word) {
  const count = {};
  let sortedList = [];

  // Count occurrence of each word:
  for (let i=0; i<word.length; i++) {
    if (word[i] in count) {
      count[word[i]]++;
    }
    else {
      count[word[i]] = 1;
    }
  }

  // Sort:
  sortedList = Object.keys(count).sort( (a, b) => {
    return count[b] - count[a];
  });

  return sortedList;
}


function predictPath(text) {
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


module.exports = {
  getVocabulary: getVocabulary,
  loadVocabulary: loadVocabulary,
  train: train,
  predictPath: predictPath,
  generateParagraph: generateParagraph,
}