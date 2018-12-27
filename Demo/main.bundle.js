/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./Demo/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./Demo/main.js":
/*!**********************!*\
  !*** ./Demo/main.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("\nconst keyupEvent = new Event('keyup');\nconst userInputBox = document.getElementById('user-input');\nconst textGenerateBox = document.getElementById('text-generation');\nconst suggestionButtons = document.getElementsByClassName('suggestion');\nconst predictionInput = document.getElementById('prediction-input');\nconst predictCol1 = document.querySelector('#column-1 ul');\nconst columnOneLi = document.querySelectorAll('#column-1 li');\nconst predictCol2 = document.querySelector('#column-2 ul');\nconst columnTwoLi = document.querySelectorAll('#column-2 li');\nconst predictCol3 = document.querySelector('#column-3 ul');\nconst columnThreeLi = document.querySelectorAll('#column-3 li');\nconst treeWordsNext = document.querySelectorAll('#column-1 li');\n\n\n// ===== Event Handlers ===================================\ndocument.getElementById('train-btn').addEventListener('click', (e) => {\n  document.getElementById('train-btn').innerText = \"Training...\";\n  const text = document.getElementById('training-box').value.trim();\n  train(text).then(() => {\n    console.log(\"Training complete\");\n    document.getElementById('train-btn').innerText = \"Training Complete!\";\n\n    saveVocabulary(vocabulary);\n\n    setTimeout(() => {\n      document.getElementById('train-btn').innerText = \"Train\";\n    }, 5000);\n  });\n  refreshButtons();\n});\n\n\ndocument.querySelectorAll('#sample-text div').forEach(function(book) {\n  book.addEventListener('click', function(e) {\n    e.stopPropagation();\n    if (!book.classList.contains('reading')) {\n      const title = this.getAttribute('data-title');\n      book.classList.add('reading');\n\n      readTextFile(title).then((text) => {\n        // Got text, proceed to training...\n        console.log(\"Reading: '\" + title + \"'\")\n        train(text.trim()).then(() => {\n          console.log(\"Training complete\");\n          saveVocabulary(vocabulary);\n        });\n        refreshButtons();\n        book.classList.remove('reading');\n\n        // If 'Read' label isn't present, add it:\n        if (!book.querySelector('p .book-read')) {\n          let span = document.createElement('span');\n          span.classList.add('book-read');\n          span.innerHTML = '<i class=\"fas fa-check\"></i> Read';\n          book.querySelector('p').appendChild(span);\n        }\n      })\n      .catch((err) => {\n        console.error(err);\n        book.classList.remove('reading');\n      });\n    }\n  });\n});\n\n\ndocument.getElementById('wiki-btn').addEventListener('click', (e) => {\n  const wikiBtn = document.getElementById('wiki-btn');\n  const limit = document.querySelector('.wiki-max').value;\n\n  if (!wikiBtn.classList.contains('btn-loading')) {\n    wikiBtn.innerText = \"Fetching...\";\n    wikiBtn.classList.add('btn-loading');\n\n    readWikipedia(limit).then(() => {\n      return saveVocabulary(vocabulary);\n    })\n    .then( () => {\n      console.log(\"Training complete \\nRead \" + limit + \" entries.\");\n      wikiBtn.classList.remove('btn-loading');\n      wikiBtn.innerText = \"Fetch Text from Wikipedia\";\n      refreshButtons();\n\n      // Update vocabulary word count\n    });\n  }\n});\n\n\nuserInputBox.addEventListener('keyup', (e) => {\n  userInputKeyUp();\n});\n\n\nfor (let i=0; i<document.getElementsByClassName(\"nav-btn\").length; i++) {\n  const thisBtn = document.getElementsByClassName(\"nav-btn\")[i];\n\n  thisBtn.addEventListener('click', (e) => {\n    if (!thisBtn.classList.contains('current') && !thisBtn.classList.contains('unavailable')) {\n      document.querySelector('.current').classList.remove('current');\n      thisBtn.classList.add('current');\n\n      switch (e.currentTarget.getAttribute(\"id\")) {\n        case \"training-btn\":\n          document.querySelector('#section-training').style.display = \"block\";\n          document.querySelector('#section-autocomplete').style.display = \"none\";\n          document.querySelector('#section-textgen').style.display = \"none\";\n          document.querySelector('#section-dialogtree').style.display = \"none\";\n          break;\n        case \"autocomplete-btn\":\n          document.querySelector('#section-training').style.display = \"none\";\n          document.querySelector('#section-autocomplete').style.display = \"block\";\n          document.querySelector('#section-textgen').style.display = \"none\";\n          document.querySelector('#section-dialogtree').style.display = \"none\";\n          break;\n        case \"textgen-btn\":\n          document.querySelector('#section-training').style.display = \"none\";\n          document.querySelector('#section-autocomplete').style.display = \"none\";\n          document.querySelector('#section-textgen').style.display = \"block\";\n          document.querySelector('#section-dialogtree').style.display = \"none\";\n          break;\n        case \"dialogtree-btn\":\n          document.querySelector('#section-training').style.display = \"none\";\n          document.querySelector('#section-autocomplete').style.display = \"none\";\n          document.querySelector('#section-textgen').style.display = \"none\";\n          document.querySelector('#section-dialogtree').style.display = \"block\";\n          break;\n      }\n    }\n  })\n}\n\n\nfor (let i=0; i<suggestionButtons.length; i++) {\n  suggestionButtons[i].addEventListener('click', (e) => {\n    if (e.target.innerText.trim() != \"\") {\n      const existingText = userInputBox.value;\n      let newText;\n      if (existingText[existingText.length-1] !== \" \") {\n        newText = existingText + \" \" + e.target.innerText + \" \";\n      }\n      else {\n        newText = existingText + e.target.innerText + \" \";\n      }\n      userInputBox.value = newText;\n      userInputKeyUp();\n    }\n  });\n}\n\n\ndocument.getElementById('generateBtn').addEventListener('click', (e) => {\n  const max = document.querySelector('.gen-max').value - 1;\n  textGenerateBox.innerText = generateParagraph(max);\n  if (textGenerateBox.value.length > 0) {\n    document.getElementById('speak-text').style.display = \"inline-block\";\n  }\n});\n\ndocument.getElementById('speak-text').addEventListener('click', (e) => {\n  speakText(textGenerateBox.value);\n});\n\n\npredictionInput.addEventListener('keyup', (e) => {\n  let foundInVocab = getLastWord(cleanText(e.target.value)) in vocabulary;\n\n  if (!foundInVocab || e.target.value == \"\") {\n    predictCol1.style.display = \"none\";\n    predictCol2.style.display = \"none\";\n    predictCol3.style.display = \"none\";\n    document.getElementById('no-branches').style.display = \"block\";\n  }\n  else if (foundInVocab) {\n    document.getElementById('no-branches').style.display = \"none\";\n    const path = predictPath( getLastWord(cleanText(e.target.value)) );\n    if (path.one) {\n      predictCol1.style.display = \"inline-block\";\n      columnOneLi.forEach( (el, index) => {\n        if (path.one[index]) {\n          el.style.display = \"block\";\n          el.innerText = path.one[index];\n        }\n        else {\n          el.style.display = \"none\";\n          el.innerText = \"\";\n        }\n      });\n    }\n    else {\n      predictCol1.style.display = \"none\";\n    }\n    if (path.two) {\n      predictCol2.style.display = \"inline-block\";\n      columnTwoLi.forEach( (el, index) => {\n        if (path.two[index]) {\n          el.style.display = \"block\";\n          el.innerText = path.two[index];\n        }\n        else {\n          el.style.display = \"none\";\n          el.innerText = \"\";\n        }\n      });\n    }\n    else {\n      predictCol2.style.display = \"none\";\n    }\n    if (path.three) {\n      predictCol3.style.display = \"inline-block\";\n      columnThreeLi.forEach( (el, index) => {\n        if (path.three[index]) {\n          el.style.display = \"block\";\n          el.innerText = path.three[index];\n        }\n        else {\n          el.style.display = \"none\";\n          el.innerText = \"\";\n        }\n      });\n    }\n    else {\n      predictCol3.style.display = \"none\";\n    }\n  }\n});\n\nfor (let i=0; i<treeWordsNext.length; i++) {\n  treeWordsNext[i].addEventListener('click', (e) => {\n    const word = e.target.innerText;\n    const firstChar = predictionInput.value[predictionInput.value.length-1] == \" \" ? \"\" : \" \";\n    predictionInput.value = predictionInput.value + firstChar + word + \" \";\n    predictionInput.dispatchEvent(keyupEvent);\n  });\n}\n\nasync function readWikipedia(limit) {\n// async function readWikipedia(limit) {\n  for (let i=0; i<limit; i++) {\n    await new Promise((resolve) => {\n      getWikiText()\n      .then((response) => {\n        train(response);\n      })\n      .then(() => {\n        const progress = Math.floor(((i+1) / limit) * 100) + \"%\";\n        document.getElementById('wiki-btn').innerText = \"Fetching... (\" + progress + \")\";\n        resolve();\n      });\n    });\n  }\n}\n\n\nfunction readTextFile(name) {\n  return new Promise((resolve, reject) => {\n    const rawFile = new XMLHttpRequest();\n    rawFile.open(\"GET\", \"Sample Text/\" + name + \".txt\", true);\n    rawFile.onload = function(e) {\n      if (rawFile.status === 200) {\n        const fileContents = rawFile.responseText;\n        resolve(fileContents);\n      }\n      else {\n        reject;\n      }\n    }\n    rawFile.send();\n  });\n}\n\n\nfunction userInputKeyUp() {\n  let words = userInputBox.value.split(\" \");\n  for (let i=0; i<words.length; i++) {\n    if (words[i] === \"\") {\n      words.splice(i, 1);\n    }\n  }\n\n  const lastWord = words[words.length-1];\n  const nextWords = vocabulary[lastWord];\n\n  for (let i=0; i<3; i++) {\n    if (nextWords && nextWords[i]) {\n      suggestionButtons[i].innerText = nextWords[i];\n    }\n    else {\n      suggestionButtons[i].innerText = \"\";\n    }\n  }\n}\n\n\nfunction refreshButtons() {\n  const buttons = document.querySelectorAll('nav button:not(.current)');\n\n  if (!vocabulary || Object.keys(vocabulary).length === 0) {\n    for (let i=0; i<buttons.length; i++) {\n      buttons[i].classList.add('unavailable');\n    }\n  }\n  else {\n    for (let i=0; i<buttons.length; i++) {\n      buttons[i].classList.remove('unavailable');\n    }\n  }\n}\n\n\n//# sourceURL=webpack:///./Demo/main.js?");

/***/ })

/******/ });