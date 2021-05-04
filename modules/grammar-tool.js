//==============================================================================
//Welcome to the: SENTENCE TO GRAMMAR TREE MODULE
//==============================================================================

//==============================================================================
//Interesting Tree Analyses
//np + vp = (normal sentence) subject + verb phrase
//vp = (imperative) assumed subject + verb phrase
//pp + vp = (particle sentence) example: with the victory having been won
//==============================================================================
var rules = [];
var langProb = [];

function generateGrammarTree(initialPosList) {
  var grammarTree = [];
  let treeRow = [];
  rules = require('../main.js').rules;
  //We generate the first row of the tree which is jus t the posList
  initialPosList.forEach((pos, i) => {
    treeRow.push({
      pos: pos,
      children: [i]
    })
  });
  grammarTree.push(treeRow);
  while (true) {
    nextTreeRow = generateNextTreeRow(posListFromTreeRow(treeRow));
    if (treeRow.map(e => e.pos).join(' ') ==
        nextTreeRow.map(e => e.pos).join(' ')) break;
    treeRow = nextTreeRow;
    grammarTree.push(treeRow);
  }
  updateLangProb(grammarTree);
  return grammarTree;
}

function generateNextTreeRow(posList) {
  let probList = generateProbList(posList);
  let treeRow = [];
  posList.forEach((pos,i) => {
    //Checks if index of current pos exists anywhere in probList
    if (!probList.some(p => p.index.includes(i))) {
      treeRow.push({
        pos: pos,
        children: [i]
      });
    } else {
      //Checks if probList has an element (prob) of which the final index
      //is that same as that of the current pos
      prob = probList.find(p => p.index[p.index.length-1] === i);
      if (prob != undefined) {
        treeRow.push({
          pos: prob.pos,
          children: prob.index
        });
      }
    }
  });
  return treeRow;
}

function posListFromTreeRow(treeRow) {
  return(treeRow.map(r => r.pos));
}

//==============================================================================
//Probablistic Engine (Highly Dangerous to the Touch)
//==============================================================================

function generateProbList(posList) {
  let probList = [];
  posList.forEach((pos,i) => {
    //This is a temporary solution where we treat the rule for np the same
    //as the rule for n
    if (rules.some(r => pos.includes(r.pos) || pos.includes(r.pos+'p'))) {
      rule = rules.find(r => pos.includes(r.pos) || pos.includes(r.pos+'p'));
      probList = generateProb(rule, posList, i, probList);
    }
  });
  //This is used to refine the probList and remove overlapping probabilities
  for (i = 0; i < probList.length; i++) {
    prob = probList[i];
    //If multiple possible phrases have same index
    for (j = 0; j < prob.index.length; j++) {
      index = prob.index[j];
      //This is quite intricate: it checks if probList has elements not including
      //the element currently being checked which contain "index" in their
      //list of indices and this element has a greater probability than the
      //element at i
      if (probList.some(p => p != prob && p.index.includes(index) &&
                             prob.p <= p.p)) {
                               //ADDED <= BE TENTATIVE
        //If this is true, then we remove the element at index i
        probList.splice(i,1);
        i--;
        break;
        //This break statement stops searching through the indices of this prob
        //since we have switched this prob to another one
      }
    }
  }
  return probList;
}

function generateProb(rule, posList, index, probList) {
  let indicesIncluded = [];
  rule.b.forEach(b => {
    //Checks if the part of speech before the initial pos is equal to any of
    //the rules
    if (posList[index-1] != null && (posList[index-1].includes(b.pos) ||
                                     posList[index-1].includes(b.pos+'p'))) {
      probList.push({
        pos: [rule.pos + 'p'],
        index: [index-1, index],
        p: parseInt(b.c)
      })
    }
  });
  rule.a.forEach(a => {
    //Checks if the part of speech after the initial pos is equal to any of
    //the rules
    if (posList[index+1] != null && (posList[index+1].includes(a.pos) ||
                                     posList[index+1].includes(a.pos+'p'))) {
      probList.push({
        pos: [rule.pos + 'p'],
        index: [index, index+1],
        p: parseInt(a.c)
      })
    }
  });
  //In case no matches are found, we just save the group as itself
  //If there is overlap with another group, it will be automatically removed
  //The preposition should not be given a phrase on its own
  probList.push({
    pos: [rule.pos + 'p'],
    index: [index],
    p: 1
  });
  /*
  if (rule.pos != 'p') {
    probList.push({
      pos: [rule.pos + 'p'],
      index: [index],
      p: 1
    });
  }*/
  return probList;
}

//==============================================================================
//MR LANG UPDATE, WHAT ARE YOU DOING IN THIS FILE? XD
//==============================================================================

function updateLangProb(grammarTree) {
  langProb = require('../main.js').langProb;
  for (r = grammarTree.length-1; r >= 0; r--) {
    let level = langProb[grammarTree.length-1-r];
    if (level == undefined) {
      langProb.push([]);
      r++;
      continue;
    }
    let arr = [];
    grammarTree[r].forEach(prob => {
      prob.pos.forEach(pos => {
        //Checks if this pos has already appeared at this level
        let prob_ = level.find(p => p.pos === pos);
        //If it doesn't exist, we add it, if it does, we add 1 to its num
        if (prob_ == undefined) {
          level.push({
            pos: pos,
            num: 1
          })
        } else {
          prob_.num++;
        }
      });
    });
  }
  require('../main.js').langProb = langProb;
}

//==============================================================================

module.exports = function() {
  this.generateGrammarTree = (initialPosList) => {
    return generateGrammarTree(initialPosList);
  }
}
