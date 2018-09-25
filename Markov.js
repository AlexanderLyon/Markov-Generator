let vocabulary;
loadVocabulary();

function loadVocabulary() {
  document.getElementById('loading-data').style.display = 'block';
  fetch('../utilities/getVocabulary.php')
  .then(response => response.json())
  .then((data) => {
    if (data) {
      vocabulary = data;
      document.getElementById('loading-data').style.display = 'none';
      document.getElementById('vocab-info').innerHTML = "Vocabulary loaded: <span>" + Object.keys(vocabulary).length + "</span> words";
      console.log("Vocabulary loaded");
      refreshButtons();
    }
    else {
      vocabulary = {};
      document.getElementById('loading-data').style.display = 'none';
      refreshButtons();
    }
  })
  .catch((err) => {
    console.warn("Unable to fetch vocabulary. The JSON file is most likely empty. \nCreating a new vocabulary object...");
    vocabulary = {};
    document.getElementById('loading-data').style.display = 'none';
    refreshButtons();
  });
}


function saveVocabulary(vocabulary) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '../utilities/saveVocabulary.php');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log("Saved!");
        resolve();
      }
    };
    xhr.send("data=" + JSON.stringify(vocabulary));
  });
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

    document.getElementById('vocab-info').innerHTML = "Vocabulary loaded: <span>" + Object.keys(vocabulary).length + "</span> words";
    resolve();
  });
}


async function getWikiText() {
  return new Promise((resolve, reject) => {

    // Get random article title:
    const randomURL = 'https://en.wikipedia.org/w/api.php?action=query&origin=*&generator=random&grnnamespace=0&prop=content&exchars=500&format=json';
    fetch(randomURL).then(response => { return response.json(); })
    .then(data => {
      let pageID = Object.keys(data["query"]["pages"])[0];
      let title = data["query"]["pages"][pageID]["title"];
      let formattedTitle = title.replace(/\s+/g, "_");
      console.log("Reading article: '" + title + "'");

      const article = document.createElement("li");
      var articleText = document.createTextNode("Reading article: \"" + title + "\"");
      article.appendChild(articleText);
      document.getElementById('wiki-history').prepend(article);

      // Now fetch its text contents:
      const contentURL = 'https://en.wikipedia.org/w/api.php?action=query&origin=*&prop=extracts&explaintext&format=json&titles=';
      fetch(contentURL + formattedTitle)
      .then(response => { return response.json(); })
      .then( pageData => {
        let page = Object.keys(pageData['query']['pages'])[0];
        let text = pageData['query']['pages'][page]['extract'];
        cleanWikiText(text).then(formattedText => {
          resolve(formattedText);
        });
      });
    })
    .catch(err => {
      reject(err);
    });

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
        utterance.rate = 0.85;
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


function cleanWikiText(wikiText) {
  /* Removes markup and excessive spacing from Wikipedia text */

  return new Promise((resolve, reject) => {
    let headings = ["======", "=====", "====", "===", "=="];
    let workingText = wikiText;
    let chunks;

    // Remove each heading:
    const removeHeadings = new Promise((resolve, reject) => {
      for (let i=0; i<headings.length; i++) {
        let edits = [];
        chunks = workingText.split(headings[i]);

        if (chunks.length > 2) {
          for(let j=0; j<chunks.length; j++) {
            if (j%2 == 0) {
              //Odd number, add to array
              edits.push(chunks[j]);
            }
          }

          workingText = edits.join("");
        }

        if (i == headings.length-1) {
          // Done with loop
          resolve(workingText);
        }
      }

    });


    removeHeadings.then(finalText => {
      //Remove excessive spaces:
      finalText = finalText.replace(/\s\s+/g, ' ');
      resolve(finalText);
    });

  });
}
