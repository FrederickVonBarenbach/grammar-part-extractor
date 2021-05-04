/*
function generateProbList(posList) {
  var probList = [];
  posList.forEach((pos,i) => {
    switch (true) {
      case pos.includes('n') || pos.includes('np'):
        //np => d, a, n*, pp
        probList.push(generateProb('np', ['d', 'a', 'n', 'pp'], posList, i));
        break;
      case pos.includes('v') || pos.includes('vp'):
        //vp => av, v*, np
        probList.push(generateProb('vp', ['av', 'v', 'np'], posList, i));
        break;
      case pos.includes('p') || pos.includes('pp'):
        //pp => p*, np
        probList.push(generateProb('pp', ['p', 'np'], posList, i));
        break;
      case pos.includes('a') || pos.includes('ap'):
        //ap => av*, a
        probList.push(generateProb('ap', ['av', 'a'], posList, i));
        break;
    }
  });
  probList.forEach((prob,n) => {
    //If multiple possible phrases have same index
    prob.index.forEach(index => {
      //This is quite intricate: it checks if probList has elements not including
      //the element currently being checked which contain "index" in their
      //list of indices and this element has a greater probability than the
      //element at n
      if (probList.some(p => p != prob && p.index.includes(index) &&
                             prob.p < p.p)) {
        //If this is true, then we remove the element at index n
        probList.splice(n,1);
      }
      if (probList.some(p => p != prob && p.index.includes(index) &&
                             prob.p == p.p)) {
        console.log('This is a known error where the probabilities are equal,\n'
                    + 'it will be resolved soon.')
      }
    });
  });
  return (probList);
}

function generateProb(rules, posList, index, probList) {
  indicesIncluded = [];
  rules.b.forEach(pos => {
    //Checks if the part of speech before the initial pos is equal to any of
    //the rules
    if (posList[index-1] != null && (posList[index-1] == pos ||
                                     posList[index-1] == pos + 'p')) {
      probList.push({
        pos: [rules.pos + 'p'],
        index: [index-1, index],
        p: 2
      })
    }
  });
  rules.a.forEach(pos => {
    //Checks if the part of speech after the initial pos is equal to any of
    //the rules
    if (posList[index+1] != null && (posList[index+1] == pos ||
                                     posList[index+1] == pos + 'p')) {
      probList.push({
        pos: [rules.pos + 'p'],
        index: [index-1, index],
        p: 2
      })
    }
  });
  return (probList)
}
*/
/*
function generateProb(phrase, rules, posList, index) {
  prob = 0
  indicesIncluded = [];
  //Look for maximum number of pos for a phrase on either side of initial pos
  for (n = index-rules.length; n < index+rules.length; n++) {
    if (posList[n] != null) {
      //isRule simply checks if the pos is one of the components of the phrase
      if (isRule(posList[n], rules)) {
        indicesIncluded.push(n);
        prob += 1;
      } else {
        if (prob > 0 && n < index) {
          //All the rules of a phrase must appear consecutively
          //If there is break before the root of the phrase (the word that
          //initiated the call) then we reset the probability
          indicesIncluded = [];
          prob = 0;
        } else if (n > index) {
          //If there is break after the root of the phrase, then we simply
          //end the probability counting
          break;
        }
      }
    }
  }
  return ({
    pos: [phrase],
    index: indicesIncluded,
    p: prob
  });
}*/
/*
function isRule(pos, rules) {
  //We check if the pos matches any of the rules, we also check if it matches
  //any secondary phrases such as np or vp
  rules.forEach(rule => {
    if (pos.includes(rules[r]) ||
        pos.includes(rules[r] + 'p')) {
      return true;
    }
  });
  for (r = 0; r < rules.length; r++) {
    if (pos.includes(rules[r]) ||
        pos.includes(rules[r] + 'p')) {
      return true;
    }
  }
}
*/
