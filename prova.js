var carica = require('./carica');
var fs = require('fs');
const fsPath = require('fs-path');
var deepEqual = require('deep-equal')
/*VERIFICARE generazione fileEliminate e come gestirle*/

var j1 = fs.readFileSync("C:/Users/Davide/Desktop/ProgettoTesi/vomidax/Server/194/JSON/blabla.json");
var j2 = fs.readFileSync("C:/Users/Davide/Desktop/ProgettoTesi/vomidax/Server/194/JSON/cacasad.json");
var j3 = fs.readFileSync("C:/Users/Davide/Desktop/ProgettoTesi/vomidax/Server/194/Eliminate/223.json");

var obj1 = JSON.parse(j1);
var obj2 = JSON.parse(j2);
var obj3 = JSON.parse(j3);



var obj4 = carica.caricaImmagine(obj1,obj2);
obj4 = carica.purgaJSON(obj4,obj3);

fsPath.writeFile("C:/Users/Davide/Desktop/yayo.json", JSON.stringify(obj4, null, "\t"), function(err){
    if(err) {
      throw err;
    } else {
      console.log('Json fatto');
    }
  });