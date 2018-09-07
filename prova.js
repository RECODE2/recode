var merge = require('./merge');
var fs = require('fs');
const fsPath = require('fs-path');
var deepEqual = require('deep-equal')
/*VERIFICARE generazione fileEliminate e come gestirle*/

var j1 = fs.readFileSync("C:/Users/Davide/Desktop/Casaca.json");
var j2 = fs.readFileSync("C:/Users/Davide/Desktop/J2.json");


var obj1 = JSON.parse(j1);
var obj2 = JSON.parse(j2);

obj3 = merge.mergeDG(obj1,obj2);


fsPath.writeFile("C:/Users/Davide/Desktop/yayo.json", JSON.stringify(obj3, null, "\t"), function(err){
    if(err) {
      throw err;
    } else {
      console.log('Json fatto');
    }
  });