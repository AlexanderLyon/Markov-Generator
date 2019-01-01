const markov = require('../Markov.js');
const Haystack = require('haystack-search');
const haystack = new Haystack({
  flexibility: 0,
  caseSensitive: false,
  ignoreStopWords: false,
  stemming: false
});
let vocabulary;

const keyupEvent = new Event('keyup');
const userInputBox = document.getElementById('user-input');
const textGenerateBox = document.getElementById('text-generation');
const suggestionButtons = document.getElementsByClassName('suggestion');
const predictionInput = document.getElementById('prediction-input');
const predictCol1 = document.querySelector('#column-1 ul');
const columnOneLi = document.querySelectorAll('#column-1 li');
const predictCol2 = document.querySelector('#column-2 ul');
const columnTwoLi = document.querySelectorAll('#column-2 li');
const predictCol3 = document.querySelector('#column-3 ul');
const columnThreeLi = document.querySelectorAll('#column-3 li');
const treeWordsNext = document.querySelectorAll('#column-1 li');

document.getElementById('loading-data').style.display = 'block';
markov.loadVocabulary().then(() => {
  document.getElementById('loading-data').style.display = 'none';
  vocabulary = markov.getVocabulary();

  if (Object.keys(vocabulary).length > 0) {
    const vocabCount = Object.keys(vocabulary).length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    document.getElementById('vocab-info').innerHTML = "<i class='fas fa-database'></i> Vocabulary: <span>" + vocabCount + "</span> words";
  }
  else {
    document.getElementById('vocab-info').innerHTML = "<i class='fas fa-database'></i> No Vocabulary found";
  }

  refreshButtons();
});


// ===== Event Handlers ===================================
document.getElementById('train-btn').addEventListener('click', (e) => {
  document.getElementById('train-btn').innerText = "Training...";
  const text = document.getElementById('training-box').value.trim();
  markov.train(text).then(() => {
    console.log("Training complete");
    document.getElementById('train-btn').innerText = "Training Complete!";
    vocabulary = markov.getVocabulary();

    setTimeout(() => {
      document.getElementById('train-btn').innerText = "Train";
    }, 5000);
  });
  refreshButtons();
});


document.querySelectorAll('#sample-text div').forEach(function(book) {
  book.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!book.classList.contains('reading')) {
      const title = this.getAttribute('data-title');
      book.classList.add('reading');

      readTextFile(title).then((text) => {
        // Got text, proceed to training...
        console.log("Reading: '" + title + "'")
        markov.train(text.trim()).then(() => {
          console.log("Training complete");
          vocabulary = markov.getVocabulary();
          refreshButtons();
          book.classList.remove('reading');

          // If 'Read' label isn't present, add it:
          if (!book.querySelector('p .book-read')) {
            let span = document.createElement('span');
            span.classList.add('book-read');
            span.innerHTML = '<i class="fas fa-check"></i> Read';
            book.querySelector('p').appendChild(span);
          }
        });
        
      })
      .catch((err) => {
        console.error(err);
        book.classList.remove('reading');
      });
    }
  });
});


document.getElementById('wiki-btn').addEventListener('click', (e) => {
  const wikiBtn = document.getElementById('wiki-btn');
  const limit = document.querySelector('.wiki-max').value;

  if (!wikiBtn.classList.contains('btn-loading')) {
    wikiBtn.innerText = "Fetching...";
    wikiBtn.classList.add('btn-loading');

    readWikipedia(limit)
    .then( () => {
      console.log("Training complete \nRead " + limit + " entries.");
      wikiBtn.classList.remove('btn-loading');
      wikiBtn.innerText = "Fetch Text from Wikipedia";
      vocabulary = markov.getVocabulary();
      refreshButtons();
    });
  }
});


userInputBox.addEventListener('keyup', (e) => {
  userInputKeyUp();
});


for (let i=0; i<document.getElementsByClassName("nav-btn").length; i++) {
  const thisBtn = document.getElementsByClassName("nav-btn")[i];

  thisBtn.addEventListener('click', (e) => {
    if (!thisBtn.classList.contains('current') && !thisBtn.classList.contains('unavailable')) {
      document.querySelector('.current').classList.remove('current');
      thisBtn.classList.add('current');

      switch (e.currentTarget.getAttribute("id")) {
        case "training-btn":
          document.querySelector('#section-training').style.display = "block";
          document.querySelector('#section-autocomplete').style.display = "none";
          document.querySelector('#section-textgen').style.display = "none";
          document.querySelector('#section-dialogtree').style.display = "none";
          break;
        case "autocomplete-btn":
          document.querySelector('#section-training').style.display = "none";
          document.querySelector('#section-autocomplete').style.display = "block";
          document.querySelector('#section-textgen').style.display = "none";
          document.querySelector('#section-dialogtree').style.display = "none";
          break;
        case "textgen-btn":
          document.querySelector('#section-training').style.display = "none";
          document.querySelector('#section-autocomplete').style.display = "none";
          document.querySelector('#section-textgen').style.display = "block";
          document.querySelector('#section-dialogtree').style.display = "none";
          break;
        case "dialogtree-btn":
          document.querySelector('#section-training').style.display = "none";
          document.querySelector('#section-autocomplete').style.display = "none";
          document.querySelector('#section-textgen').style.display = "none";
          document.querySelector('#section-dialogtree').style.display = "block";
          break;
      }
    }
  })
}


for (let i=0; i<suggestionButtons.length; i++) {
  suggestionButtons[i].addEventListener('click', (e) => {
    if (e.target.innerText.trim() != "") {
      const existingText = userInputBox.value;
      let newText;
      if (existingText[existingText.length-1] !== " ") {
        // Replace last word
        let tokens = existingText.split(' ');
        tokens.pop();
        newText = tokens.join(' ') + " " + e.target.innerText + " ";
      }
      else {
        // Add new word
        newText = existingText + e.target.innerText + " ";
      }
      userInputBox.value = newText;
      userInputKeyUp();
    }
  });
}


document.getElementById('generateBtn').addEventListener('click', (e) => {
  const max = document.querySelector('.gen-max').value - 1;
  textGenerateBox.innerText = markov.generateParagraph(max);
  if (textGenerateBox.value.length > 0) {
    document.getElementById('speak-text').style.display = "inline-block";
  }
});

document.getElementById('speak-text').addEventListener('click', (e) => {
  speakText(textGenerateBox.value);
});


predictionInput.addEventListener('keyup', (e) => {
  let foundInVocab = getLastWord(cleanText(e.target.value)) in vocabulary;

  if (!foundInVocab || e.target.value == "") {
    predictCol1.style.display = "none";
    predictCol2.style.display = "none";
    predictCol3.style.display = "none";
    document.getElementById('no-branches').style.display = "block";
  }
  else if (foundInVocab) {
    document.getElementById('no-branches').style.display = "none";
    const path = markov.predictPath( getLastWord(cleanText(e.target.value)) );
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

for (let i=0; i<treeWordsNext.length; i++) {
  treeWordsNext[i].addEventListener('click', (e) => {
    const word = e.target.innerText;
    const firstChar = predictionInput.value[predictionInput.value.length-1] == " " ? "" : " ";
    predictionInput.value = predictionInput.value + firstChar + word + " ";
    predictionInput.dispatchEvent(keyupEvent);
  });
}


async function readWikipedia(limit) {
// async function readWikipedia(limit) {
  for (let i=0; i<limit; i++) {
    await new Promise((resolve) => {
      getWikiText()
      .then((response) => {
        return markov.train(response);
      })
      .then(() => {
        const progress = Math.floor(((i+1) / limit) * 100) + "%";
        document.getElementById('wiki-btn').innerText = "Fetching... (" + progress + ")";
        resolve();
      });
    });
  }
}


function readTextFile(name) {
  return new Promise((resolve, reject) => {
    const rawFile = new XMLHttpRequest();
    rawFile.open("GET", "Sample Text/" + name + ".txt", true);
    rawFile.onload = function(e) {
      if (rawFile.status === 200) {
        const fileContents = rawFile.responseText;
        resolve(fileContents);
      }
      else {
        reject;
      }
    }
    rawFile.send();
  });
}


function userInputKeyUp() {
  const lastChar = userInputBox.value[userInputBox.value.length-1];
  let words = userInputBox.value.split(" ");
  let lastWord = words[words.length-1];

  if (lastChar !== ' ' && lastWord.length > 1) {
    // Word in progress, guess what it will be
    const wordPool = Object.keys(vocabulary);
    const completions = haystack.search(lastWord, wordPool, 3);

    for (let i=0; i<3; i++) {
      if (completions && completions[i]) {
        suggestionButtons[i].innerText = completions[i];
      }
      else {
        suggestionButtons[i].innerText = "";
      }
    }
  }
  else {
    // Guess next word
    for (let i=0; i<words.length; i++) {
      if (words[i] === "") {
        words.splice(i, 1);
      }
    }
  
    lastWord = words[words.length-1];
    const nextWords = vocabulary[lastWord];
  
    for (let i=0; i<3; i++) {
      if (nextWords && nextWords[i]) {
        suggestionButtons[i].innerText = nextWords[i];
      }
      else {
        suggestionButtons[i].innerText = "";
      }
    }
  }
}


function refreshButtons() {
  const buttons = document.querySelectorAll('nav button:not(.current)');

  if (!vocabulary || Object.keys(vocabulary).length === 0) {
    for (let i=0; i<buttons.length; i++) {
      buttons[i].classList.add('unavailable');
    }
  }
  else {
    for (let i=0; i<buttons.length; i++) {
      buttons[i].classList.remove('unavailable');
    }
  }
}


function getLastWord(text) {
  const tokens = text.split(" ");
  return tokens[tokens.length-1];
}


function cleanText(text) {
  /* Removes HTML tags and other characters that will interfere with regexs */
  return text.replace(/(<([^>]+)>)/ig,"").replace(/[\s\s,\t \n,]+/g, " ").replace(/[\]*\[*\(*\)*\_*]/g, "").trim();
}


async function getWikiText() {
  return new Promise((resolve, reject) => {
    // Get random article title:
    const randomURL = 'https://en.wikipedia.org/w/api.php?action=query&origin=*&generator=random&grnnamespace=0&prop=content&exchars=500&format=json';
    fetch(randomURL).then(response => { return response.json(); })
    .then((data) => {
      let pageID = Object.keys(data["query"]["pages"])[0];
      let title = data["query"]["pages"][pageID]["title"];
      let formattedTitle = title.replace(/\s+/g, "_");
      console.log("Reading article: '" + title + "'");

      const article = document.createElement("li");
      const articleText = document.createTextNode("Reading article: \"" + title + "\"");
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
          for (let j=0; j<chunks.length; j++) {
            if (j%2 == 0) {
              // Odd number, add to array
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


    removeHeadings.then((finalText) => {
      //Remove excessive spaces:
      finalText = finalText.replace(/\s\s+/g, ' ');
      resolve(finalText);
    });
  });
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