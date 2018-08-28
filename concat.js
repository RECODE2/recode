
var conc = require('merge-json');
var fs = require('fs');
const fsPath = require('fs-path');
var deepEqual = require('deep-equal')
/*VERIFICARE generazione fileEliminate e come gestirle*/

var j1 = fs.readFileSync("C:/Users/Davide/Desktop/JSON1.json");
var j2 = fs.readFileSync("C:/Users/Davide/Desktop/YAYO.json");
var j3 = fs.readFileSync("C:/Users/Davide/Desktop/Eliminate/file.json")

var obj1 = JSON.parse(j1);
var obj2 = JSON.parse(j2);
var obj4 = JSON.parse(j3);
/*
var obj3 = diffJSON(obj1, obj2, obj4);
fsPath.writeFile("C:/Users/Davide/Desktop/YAYO.json", JSON.stringify(obj3, null, "\t"), function(err){
    if(err) {
      throw err;
    } else {
      console.log('Json fatto');
    }
  });*/
  var obj3 = caricaImmagine(obj1,obj2);
  var obj3 = purgaJSON(obj3, obj4);
  fsPath.writeFile("C:/Users/Davide/Desktop/YAYO2.json", JSON.stringify(obj3, null, "\t"), function(err){
    if(err) {
      throw err;
    } else {
      console.log('Json fatto');
    }
  });

//Order for Revision

  function aggiustaOrderR(j){
    j.info.layer_active = j.layers.length;
    j.layers[0].order = 1;
    j.layers[0].id = 1;
    return j;
  }

  function aggiustaOrder(j){
    var arrayO = [];
    var arrayT = []; //ho tutti gli order dei layers
    var i = 0; //
    for(var i = 0; i < j.layers.length; i++){
        arrayO[i] = j.layers[i].order;
        arrayT[i] = arrayO[i];
    }
    
    var min = minArray(arrayO);
    arrayT[arrayT.indexOf(min)] = 9999;
    for(i = 0; i < arrayT.length; i++){
        var minT = minArray(arrayT);
        if (minT <= (min + 1)){
            arrayT[arrayT.indexOf(minT)] = 9999;
            min++;
        } else{
            arrayO[arrayO.indexOf(minT)] = min + 1;
            arrayT[arrayT.indexOf(minT)] = 9999;
            min++;
        }
    }

    for(i = 0; i < j.layers.length; i++){
        j.layers[i].order = arrayO[i];
    }

    for (j = 0; j < result.layers.length; j++){
        max = Math.max(result.layers[j].id, max)
    }
    result.info.layer_active = max;

    return j;

}


function controllaID(j1){
    var layer_active = j1.info.layer_active;//LAYERS_ACTIVE [0]
    var lunghezza = j1.layers.length - 1;
    var id = j1.layers[lunghezza].id; //ULTIMO ID [1]
    var valore = {};
    valore[0] = layer_active;
    valore[1] = id;
    return valore;
}

function mergeDG(j1,j2){
    var lastID = controllaID(j1);
    lastID[1]++;
    var idProv;
    for (i = 0; i < j2.layers.length; i++){
        idProv = j2.layers[i].id;
        j2.layers[i].id = lastID[1];
        j2.layers[i].order = lastID[1];
        if(j2.layers[i].type == "image"){
            for(j = 0; j<j2.data.length; j++){
                if(j2.data[j].id == idProv){
                    j2.data[j].id = lastID[1];
                }
            }
        }
        lastID[1]++;
    }
    layerSum = lastID[1]-1;
    var j3 = conc.merge(j1,j2);
    j3.info.layer_active = layerSum;
    return j3;
}

//j1 pezzo più vecchio, j2 pezzo nuovo
/*
function concat(j1,j2){
   var lunghezza = j1.layers.length; //lunghezza vecchio
   var lunghezzaD = j1.data.length;
   lunghezzaD++;
   lunghezzaL++;
   for(var i = 0; i<j2.layers.length; i++){
       j1.layers[lunghezzaL] = j2.layers[i];
       lunghezzaL++;
    }

   for(var k = 0; k<j2.data.length; k++){
       j1.data[lunghezzaD] = j2.layers[k];
       lunghezzaD++;
    }

    for(var i = j1.layers.length; i > 0; i--){
        for(var k = i-1; k>0; k--){
            if(j1.layers[i].id == j1.layers[k].id){
                j1.layers[k] = null;
            }
        }  
    }

    for(var i = j1.data.length; i > 0; i--){
        for(var k = i-1; k>0; k--){
            if(j1.data[i].id == j1.data[k].id){
                j1.data[k] = null;
            }
        }  
    }
   return j1;
}
*/


function caricaImmagine(j1, j2){
    
    for(var i = 0; i < j2.layers.length; i++){
        if(!controllaJSON(j2.layers[i].id, j1)){
            j1.layers[j1.layers.length] = j2.layers[i];
        }
    }
    return j1;
}

function purgaJSON(j1, fileEliminate){
    var j2 = j1;
    for(var i = 0; i<j1.layers.length; i++){
        if(controllaFileEliminate(j1.layers[i].id, fileEliminate)){
            for(var j = 0; j < j2.layers.length - 1; j++){
                j2.layers[i] = j2.layers[j+1];
            }
        }
    }
    j1 = j2;
    return j1;
}



function diffJSON(obj1, obj2/* ,idCommit, req*/,fileEliminate2) {
    var result = {info: {}, layers: [], data: []};
    var fileEliminate = {id: "idCommit", eliminate:[]};
    var i = 0; //CONTATORI
    var j = 0;
    var k = 0;
    var g = 0;

    result.info = obj2.info;

    //INSERISCO NEL JSON RISULTATO TUTTI I LAYERS CON ID UGUALE, MA CON EVENTUALI MODIFICHE
    for(i = 0; i < obj1.layers.length; i++){
        for(j = 0; j< obj2.layers.length; j++){
            if(obj1.layers[i].id == obj2.layers[j].id){
                if(!deepEqual(obj1.layers[i], obj2.layers[j])){
                    
                    result.layers[k] = obj2.layers[j];
                    if(obj2.layers[j].type == "image"){
                        for(var t = 0; t < obj2.data.length; t++){
                            if(obj2.layers[j].id == obj2.data[t].id){
                                result.data[g] = obj2.data[t];
                                g++;
                            }
                        }
                    }
                    k++;
                } 
            }
        }
    }

    //INSERISCO NEL JSON RISULTATO TUTTI I LAYERS NUOVI INSERITI CHE NON SONO PRESENTI NEL COMMIT CORRENTE
    for(i = 0; i < obj2.layers.length; i++){
        if(!controllaJSON(obj2.layers[i].id,obj1)){
            result.layers[k] = obj2.layers[i];
            if(obj2.layers[i].type == "image"){
                for(var t = 0; t < obj2.data.length; t++){
                    if(obj2.layers[i].id == obj2.data[t].id){
                        result.data[g] = obj2.data[t];
                        g++;
                    }
                }
            }
            k++;
        }
    }
    //MI SALVO NELLA CARTELLA ELIMINATE TUTTI GLI ID DEI LAYER ELIMINATI
    //E CHE QUINDI NON CONSIDERO NEL CARICAMENTO DEL COMMIT
        fileEliminate = fileEliminate2;
    for(i = 0; i < obj1.layers.length; i++){
        if(!controllaJSON(obj1.layers[i].id,obj2)){
            fileEliminate.eliminate[fileEliminate2.eliminate.length] = obj1.layers[i].id;
        }
    }
    fsPath.writeFile("C:/Users/Davide/Desktop/Eliminate/file.json", JSON.stringify(fileEliminate, null, "\t"), function(err){
        if(err) {
          throw err;
        } else {
          console.log('Eliminate Fatto');
        }
      });

    //SETTO IL L'ULTIMO LAYER ATTIVO
    max = 0;
    for (j = 0; j < result.layers.length; j++){
        max = Math.max(result.layers[j].id, max)
    }
    result.info.layer_active = max;

    
    console.log("ciao");
    return result;
}

function minArray(array){
    var min = array[0];
    for (var i = 1; i < array.length; i++){
        min = Math.min(array[i], min);
    }
    return min;
}

function controllaJSON(id2,obj1){
    for (var i = 0; i<obj1.layers.length; i++){
        if(id2 == obj1.layers[i].id){
            return true;
        }
    }
    return false;
}

function controllaFileEliminate(id2,fileEliminate){
    for (var i = 0; i<fileEliminate.eliminate.length; i++){
        if(id2 == fileEliminate.eliminate[i]){
            return true;
        }
    }
    return false;
}



exports.aggiustaOrderR = aggiustaOrderR;
exports.aggiustaOrder = aggiustaOrder;


