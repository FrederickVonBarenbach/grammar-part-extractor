const createCSVWriter = require('csv-writer').createObjectCsvWriter;
const csv = require('csv-parser');
const fs = require('fs');
//const http = require('http')
const prompt = require('prompt-sync')();
const grammar = require('./modules')();

var lexicon = [];
var rules = [];
var langProb = [];

/*
Lexicon Rules:
 - n, noun
 - v, verb
 - a, adjective
 - av, adverb
 - p, preposition
 - d, determiner //to indicate possessive, we can have a list of "associate words"
                 //and if the word "possesive" is in the determiner one, we use it
                 //instead

 NOTE: Could add positional dependence like pp/i means independent, while pp/d
       means that it is positionally dependent

 - np, noun phrase
 - vp, verb phrase
 - pp, preposition phrase
 - ap, adjective phrase

* means essential
 s => np, vp, pp, ap
      np => d, a, n*, pp
      vp => av, v*, np
      pp => p*, np
      ap => av, a*
*/

/*http.createServer(function (req, res) {
  fs.readFile('index.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
}).listen(8000);*/
loadLexicon(
  fs.createReadStream('assets/rules.csv')
    .pipe(csv())
    .on('data', (row) => {
      let arrb = [];
      let arra = [];

      row.b.split('/').forEach((pos, i, arr) => {
          arrb.push({
            pos: pos,
            c: row.c.split(';')[0].split('/')[i]
          })
         })
      row.a.split('/').forEach((pos, i, arr) => {
           arra.push({
             pos: pos,
             c: row.c.split(';')[1].split('/')[i]
           })
          })

    rules.push({
      pos: row.pos,
      b: arrb,
      a: arra
    })})
    .on('end', () => {
      console.log('Rules file processed successfully');
      //We update the public definition of rules
      module.exports.rules = rules;
      main();
    }));

function main() {
  console.log("Please type something.")
  var input = prompt();
  //When we get an input, we immediately load our langProb
  fs.createReadStream('assets/language-prob.csv')
    .pipe(csv())
    .on('data', (row) => {
      let arr = [];
      row.prob.split('/').forEach((prob) => {
        arr.push({
          pos: prob.split(':')[0],
          num: parseInt(prob.split(':')[1])
        });
      });
      if (row.level == 0 || langProb.length == row.level) {
        langProb.push(arr);
      }
    })
    .on('end', () => {
      console.log('Language Probability file processed successfully');
      //We update the public definition of langProb
      module.exports.langProb = langProb;
      wordAnalysis(sentenceToWords(input), input);
      saveLexicon();
      saveLangProb();
    });
}

function sentenceToWords(sentence) {
  //Words are seperated from the sentence (include "," and "?")
  var words = sentence.split(' ');
  for (i = 0; i < words.length; i++) {
    var w = words[i];
    //This just seperates "," and "?" from the rest of the words
    if (w.charAt(w.length-1)== '?' || w.charAt(w.length-1)== ',') {
      words[i] = w.substring(0,w.length-1);
      words.splice(i+1, 0, w.charAt(w.length-1));
      //Skip the next word in the sentence since the next word is '?'
      //So that it isn't repeated over and over again
      i += 2;
    }
  }
  return words;
}

function wordAnalysis(words, sentence) {
  var parts = [];
  words.forEach((word,i) => {
    lexiconWord = lexicon.find(w => w.word === word.toLowerCase());
    if (lexiconWord == undefined) {
      console.log("Please indicate the part of speech of",
                  word.toLowerCase() + ":");
      let pos = prompt();
      lexicon.push({
        word: word.toLowerCase(),
        pos: pos
      });
      parts.push(pos.split('/'));
    } else {
      parts.push(lexiconWord.pos.split('/'));
    }
  });
  drawGrammarTree(generateGrammarTree(parts), words, sentence);
}

//==============================================================================

function loadLexicon(fn) {
  fs.createReadStream('assets/lexicon.csv')
    .pipe(csv())
    .on('data', (row) => lexicon.push(row))
    .on('end', () => {
      console.log('Lexicon file processed successfully');
      fn;
    });
}

function saveLexicon() {
  let lexiconWriter = createCSVWriter({
    path: 'assets/lexicon.csv',
    header: [
      {id: 'word', title: 'word'},
      {id: 'pos', title: 'pos'},
    ]
  });
  //Sorts the list alphabetically
  lexicon.sort(function(a, b){
      if(a.word < b.word) { return -1; }
      if(a.word > b.word) { return 1; }
      return 0;
  });
  lexiconWriter
  .writeRecords(lexicon)
  .then(()=> console.log('Lexicon file was written successfully'));
}

function saveLangProb() {
  let arr = [];
  langProb.forEach((level,i) => {
    let level_ = [];
    level.forEach(prob => {
      level_.push(prob.pos + ':' + prob.num);
    });
    arr.push({
      level: i,
      prob: level_.join('/')
    });
  });
  let langProbWriter = createCSVWriter({
    path: 'assets/language-prob.csv',
    header: [
      {id: 'level', title: 'level'},
      {id: 'prob', title: 'prob'},
    ]
  });
  langProbWriter
  .writeRecords(arr)
  .then(()=> console.log('Language Probability file was ' +
                         'written successfully'));
}

//==============================================================================
//NEXT STEP:
// - MAYBE POINT SYSTEM WILLBE DIFFERENT FOR EACH POS (instead 1 for all)
// - Problem: np can take pp before or after, which messes with everything
// - What if words have multiple uses? How do we tackle that?
// - Since it's sorted alphabetically, we can optimize the searching in lexicon
//   thing by making it start searching for the word at its starting letter
//   position
// - MAKE FUCNTION THAT CAN NBE CaLLED TO "LOAD LANGPROB AND LEXICON????" okie/
// - WE ADD A THING THAT MAKES HER MAKE A SENTENCE
//   she uses the rules and she should store an array in which exist
//   the probabilities of witnessing certain parts of speech
//   for example, at the top level we only see: 1 np and 1 vp
//   on the next level we might see 2 np and 1 vp
//   this is stored as a probability which she uses to:
//   1) determine how many nodes she wants
//   2) determine what those nodes should be (np, vp, pp, etc.)
//   then, she gets to the bottom (who knows how) and sticks in random words
//   that fit the pos, this is because she does not know agreements and word
//   pairs, which is fine
//==============================================================================

//==============================================================================
//RECENT CHANGES
// - READING RULES.csv
//   -x/x;x/x means that a number x corresponds to the b: y/y and the a: y/y
//==============================================================================

//==============================================================================
//ORDER OF OPS:
// 1st, we break up our sentence into its parts of speech
// 2nd, for each part of speech we make a probability vector (the phrase which
//      is most likely formed with that part of speech, its index, and p score)
// 3rd, we generate a list of these probabilities
// 4th, we then refine our list of proabbilities by removing the probabilities
//      that have overlapping indicies (of the parts of speech) and lesser p
// 5th, we combine our list of pos and list of prob to make a new list of pos
//      to then feed back into step 2 and so on...
// 6th, we get to the final two parts of speech from which we form our tree
//==============================================================================
