//==============================================================================
//Welcome to the: DRAWING TOOL MODULE
//==============================================================================

//==============================================================================
//Grammar Tree Drawing Tool: Slightly Unfinished
//==============================================================================

function drawGrammarTree(tree, words, sentence) {
  let str = '';
  //This is just a cute little S at the top of the tree
  tree.push([{
    pos: 's',
    //This converts the final row of the tree to an array of the indices
    children: tree[tree.length-1].map((t, i) => i)
  }])
  let stringTree = [[]];
  //TEMP SOLUTION TO MAKE IT SO THAT WE DON'T NEED TO ADD SPACE IN SPACEINSENTENCE
  words.forEach((word, i) => {
    if (i > 0) {
      stringTree[0].push(' ');
    } else {
      stringTree[0].push('');
    }
    stringTree[0].push(word);
  });
  for (r = 0; r < tree.length; r++) {
    stringTree.push([]);
    //Draw lines
    //We don't want the lines on the first row
    if (r > 0) {
      row = '';
      for (c = 0; c < tree[r].length; c++) {
        for (ci = 0; ci < tree[r][c].children.length; ci ++) {
          child = tree[r][c].children[ci];
          nSpaces = spaceInSentence(child, stringTree[r]) - row.length;
          row += repeatString(' ', nSpaces) + '|';
        }
      }
      str = row + '\n' + str;
    }
    row = '';
    //Draw word rows
    for (c = 0; c < tree[r].length; c++) {
      firstChild = tree[r][c].children[0];
      lastChild = tree[r][c].children[tree[r][c].children.length-1];
      nSpaces = spaceInSentence(firstChild, stringTree[r]) - row.length;
      if (tree[r][c].children.length > 1) {
        //Trees with children will have dashes to complete the tree "look"
        nDashes = spaceInSentence(lastChild, stringTree[r]) -
                  spaceInSentence(firstChild, stringTree[r]) - 2;
        stringTree[r+1].push(repeatString(' ', nSpaces) + ',' +
                             repeatString('-', nDashes) + ' ');
        stringTree[r+1].push(tree[r][c].pos.toString());
        row += stringTree[r+1][c*2] + tree[r][c].pos;
      } else {
        stringTree[r+1].push(repeatString(' ', nSpaces));
        stringTree[r+1].push(tree[r][c].pos.toString());
        row += repeatString(' ', nSpaces) +
               tree[r][c].pos;
      }
    }
    str = row + '\n' + str;
  }
  str += repeatString ('=', sentence.length) + '\n' + sentence;
  console.log(repeatString('\n',5) + str + repeatString('\n',3));
}

function spaceInSentence(index, words) {
  let space = 0;
  for (i = 0; i < 2*index+1; i++) {
    space += words[i].length;
  }
  return space;
}

function repeatString(str, n) {
  let repeated = '';
  for (s = 0; s < n; s++) {
    repeated += str;
  }
  return repeated;
}

/*
Tree Template:
,------- s
|        |
np  ,--- vp
|   |    |
np  vp   np
|   |    |
n   v    n
-------------
It is raining
*/


module.exports = function() {
  this.drawGrammarTree = (tree, words, sentence) => {
    return drawGrammarTree(tree, words, sentence);
  }
}
