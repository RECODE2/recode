var merge = require('./merge');
var fs = require('fs');
const fsPath = require('fs-path');
var deepEqual = require('deep-equal')
/*VERIFICARE generazione fileEliminate e come gestirle*/

var j1 = fs.readFileSync("C:/Users/tmant/OneDrive/Desktop/yayoSx.json");
var j2 = fs.readFileSync("C:/Users/tmant/OneDrive/Desktop/yayoDx.json");



var obj1 = JSON.parse(j1);
var obj2 = JSON.parse(j2);

var obj1 = merge.decrementMerge(obj1);
var obj2 = merge.decrementMerge(obj2);



fsPath.writeFile("C:/Users/tmant/OneDrive/Desktop/decYayoSxN.json", JSON.stringify(obj1, null, "\t"), function(err){
    if(err) {
      throw err;
    } else {
      console.log('Json fatto');
    }
  });

  fsPath.writeFile("C:/Users/tmant/OneDrive/Desktop/decYayoDxN.json", JSON.stringify(obj2, null, "\t"), function(err){
    if(err) {
      throw err;
    } else {
      console.log('Json fatto');
    }
  });