
var conc = require('merge-json');
//var fs = require('fs');
//const fsPath = require('fs-path');
var deepEqual = require('deep-equal')
/*
var j1 = fs.readFileSync("C:/Users/Davide/Desktop/A.json");
var j2 = fs.readFileSync("C:/Users/Davide/Desktop/B.json");

var obj1 = JSON.parse(j1);
var obj2 = JSON.parse(j2);

var obj3 = diffJSON(obj1, obj2);
fsPath.writeFile("C:/Users/Davide/Desktop/YAYO.json", JSON.stringify(obj3, null, "\t"), function(err){
    if(err) {
      throw err;
    } else {
      console.log('Json fatto');
    }
  });*/
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
    j.info.layer_active = j.layers.length; //conto effettivamente quanti layers sono e lo salvo
    
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



function aggiustaJSON(j){
    var idProv;
    j.info.layer_active = j.layers.length;
    var z = 1;
    var k = 0;
    for (var i = 0 ; i < j.layers.length; i++){
        idProv = j.layers[i].id;
        j.layers[i].order = z;
        j.layers[i].id = z;
        if(j.layers[i].type == "image"){
            for(k = 0; k<j.data.length; k++){
                if(j.data[k].id == idProv){
                    j.data[k].id = z;
                }
            }
        }
        z++;
    }
    return j;

}

function aggiustaJSONCommit(j){
    var idProv;
    var z = 1;
    var k = 0;
    for (var i = 0 ; i < j.layers.length; i++){
        idProv = j.layers[i].id;
        j.layers[i].order = z;
        j.layers[i].id = z;
        if(j.layers[i].type == "image"){
            j.data[k].id = z;
            k++;
        }
        z++;
    }

    return j;

}
//INPUT JSON PIU' VECCHIO, JSON PIU' RECENTE
function diffJSON(obj1, obj2) {
    obj1 = aggiustaJSONCommit(obj1);
    obj2 = aggiustaJSONCommit(obj2);
    var result = {info: {}, layers: [], data: []};
    var i = 0;
    var j = 0
    result.info = obj2.info;
    result.info.layer_active = Math.abs(obj2.info.layer_active - obj1.info.layer_active);

    obj1.layers;
    obj2.layers;
    for(j=0; j< obj2.layers.length; j++){
        if(deepEqual(obj2.layers[j],obj1.layers[j])){
            console.log("Madonnina")
        }else {
            result.layers[i] = obj2.layers[j];
            i++;
            console.log(i + "merda");
        }
    }
    i = 0;
    for(j = 0; j<obj2.data.length; j++){
        if(deepEqual(obj2.data[j],obj1.data[j])){
            console.log("Madonnona")
        } else{
            result.data[i] = obj2.data[j];
            i++
        }
    }
    
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


exports.aggiustaJSON = aggiustaJSON;
exports.aggiustaJSONCommit = aggiustaJSONCommit;
exports.aggiustaOrderR = aggiustaOrderR;
exports.aggiustaOrder = aggiustaOrder;


