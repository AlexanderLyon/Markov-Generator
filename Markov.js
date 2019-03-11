const allData = {
  vocabulary: {},
  sentenceStarters: [],
  sentenceEnders: []
};


function getVocabulary() {
  return allData.vocabulary;
}


function loadVocabulary() {
  return fetch('../utilities/getVocabulary.php')
  .then(response => response.json())
  .then((data) => {
    if (data) {
      allData.vocabulary = data.vocabulary;
      allData.sentenceStarters = data.sentenceStarters;
      allData.sentenceEnders = data.sentenceEnders;
      console.log("Vocabulary loaded");
    }
    else {
      allData.vocabulary = {};
    }
  })
  .catch((err) => {
    console.warn("Unable to fetch vocabulary. The JSON file is most likely empty. \nCreating a new vocabulary object...");
    allData.vocabulary = {};
  });
}


function saveVocabulary(obj) {
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
    xhr.send("data=" + encodeURIComponent(JSON.stringify(obj)));
  });
}


function train(text) {
  return new Promise((resolve, reject) => {
    let tokens = cleanText(text).split(" ");

    for (let i=0; i<tokens.length; i++) {
      const prevWord = (i-1 > -1) ? tokens[i-1] : null;
      const thisWord = tokens[i];
      const nextWord = (i+1 < tokens.length) ? tokens[i+1] : null;

      if (thisWord in allData.vocabulary) {
        // Word is already in vocabulary, only add its next word:
        if (nextWord) {
          allData.vocabulary[thisWord].push(nextWord);
        }
      }
      else {
        // Not yet in vocabulary, add it & its next word:
        allData.vocabulary[thisWord] = [];
        if (i+1 < tokens.length) {
          allData.vocabulary[thisWord].push(tokens[i+1]);
        }
      }

      // Record sentence starters / enders:
      if (prevWord && prevWord.charAt(prevWord.length-1).match(/[.:!?]/)) {
        if (allData.sentenceEnders.indexOf(prevWord) === -1) {
          allData.sentenceEnders.push(prevWord);
        }
        if (allData.sentenceStarters.indexOf(thisWord) === -1) {
          allData.sentenceStarters.push(thisWord);
        }
      }
      else if (i === 0) {
        if (allData.sentenceStarters.indexOf(thisWord) === -1) {
          allData.sentenceStarters.push(thisWord);
        }
      }
    }

    for (let words in allData.vocabulary) {
      allData.vocabulary[words] = sortByOccurrence(allData.vocabulary[words]);
    }
    resolve();
  }).then(() => {
    return saveVocabulary(allData);
  });
}


function cleanText(text) {
  /* Removes HTML tags and other characters from Wikipedia that will interfere with regexs */
  return text.replace(/(<([^>]+)>)/ig,"").replace(/[\s\s,\t \n,]+/g, " ").replace(/[\]*\[*\(*\)*\_*]/g, "").trim();
}


function generateParagraph(limit) {
  const words = Object.keys(allData.vocabulary);
  const startIndex = Math.floor(Math.random() * (allData.sentenceStarters.length));
  let firstWord = allData.sentenceStarters[startIndex];
  let nextWord = allData.vocabulary[firstWord][0];
  firstWord = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
  let capitalize = (firstWord.search(/(\.|\?|!)/g) != -1) ? true : false;
  const paragraph = [firstWord];
  let iterator = 0;

  while (nextWord && iterator < limit) {
    let thisWord = nextWord;

    if (capitalize) {
      // Capitalize first letter of new sentence
      thisWord = thisWord.charAt(0).toUpperCase() + thisWord.slice(1);
      capitalize = false;
    }
    paragraph.push(" " + thisWord);

    let nextIndex;
    let possibleNextWords;

    if (thisWord.charAt(thisWord.length-1).match(/[.:!?]/)) {
      // End of sentence, start with a sentenceStarter
      possibleNextWords = allData.sentenceStarters;
    }
    else {
      possibleNextWords = allData.vocabulary[thisWord]
    }

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

  return paragraph.join('');
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
  possibilities.one = allData.vocabulary[text];
  if (possibilities.one.length > 0) {
    possibilities.two = allData.vocabulary[possibilities.one[0]];
    if (possibilities.two.length > 0) {
      possibilities.three = allData.vocabulary[possibilities.two[0]];
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