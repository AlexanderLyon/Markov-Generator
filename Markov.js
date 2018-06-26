let vocabulary;
loadVocabulary();

function loadVocabulary() {
  if (true) {
    // Create new vocabulary or restore from previous data
    if (localStorage.getItem('savedVocabulary') != null) {
      vocabulary = JSON.parse( localStorage.getItem('savedVocabulary') );
      demos.style.display = 'block';
    } else {
      vocabulary = {};
      demos.style.display = 'none';
    }
  }
  else {
    // v2 -- Retreive vocabulary from API
  }
}


function saveVocabulary(vocabulary) {
  localStorage.setItem('savedVocabulary', JSON.stringify(vocabulary));

  // Also send to database:

}


function train(text) {
  return new Promise((resolve, reject) => {
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

    resolve();
  });
}


async function getWikiText() {
  return new Promise((resolve, reject) => {
    fetch("https://cors-anywhere.herokuapp.com/"
      + "http://en.wikipedia.org/w/api.php?"
      + "action=query&generator=random&prop=extracts&exchars=500&format=json")
    .then(response => response.json())
    .then((wikiData) => {
      let wikiText = wikiData["query"]["pages"][Object.keys(wikiData["query"]["pages"])[0]]["extract"];
      wikiText = cleanText(wikiText.substring(0, wikiText.length - 3));
      resolve(wikiText);
    })
    .catch((err) => {
      console.error("Unable to fetch text from Wikipedia", err);
    })

  });
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
      nextWord = words[ Math.floor(Math.random() * (words.length)) ];
    }

    capitalize = (thisWord.search(/(\.|\?|!)/g) != -1) ? true : false;
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

    //Load voices before proceeding:
    const loadingVoices = setInterval( () => {
      const voices = window.speechSynthesis.getVoices();

      if (voices.length > 0) {
        utterance.voice = voices[10];
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.text = text;

        speechSynthesis.speak(utterance);
        clearInterval(loadingVoices);
      }
    }, 500);

  }
}


function cleanText(text) {
  /* Removes HTML tags and other characters that will interfere with regexs */
  return text.replace(/(<([^>]+)>)/ig,"").replace(/[\s\s,\t \n,]+/g, " ").replace(/[\]*\[*\(*\)*\_*]/g, "").trim();
}
