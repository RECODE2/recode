
var conc = require('merge-json');
var deepEqual = require('deep-equal')
var fs = require('fs');
const fsPath = require('fs-path');

function aggiustaOrder(j){
    var arrayO = [];
    var arrayT = []; //ho tutti gli order dei layers
    var i = 0; //
    if(j.layers.length != 1){
        for(var i = 0; i < j.layers.length; i++){
            arrayO[i] = j.layers[i].order;
            arrayT[i] = arrayO[i];
        }
        var i = 1;
        var min = minArray(arrayO);
        arrayO[arrayO.indexOf(min)] = 1;
        min = 1;
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
    } else j.layers[0].order = 1;

    return j;

}

function setMergeDx(j){
    j = aggiustaOrder(j);

    var arrayO = [];
    var arrayT = []; //ho tutti gli order dei layers
    var i = 0; //
    for(var i = 0; i < j.layers.length; i++){
        arrayO[i] = j.layers[i].order;
        arrayT[i] = arrayO[i];
    }
    var indice = 0;
    var k = 0;
    for(i = 0; i<arrayO.length; i++){
        indice = minArray(arrayT);
        arrayO[arrayT.indexOf(indice)] = arrayO[arrayT.indexOf(indice)] + k;
        arrayT[arrayT.indexOf(indice)] = 9999;
        k++;
    }
    for(i = 0; i < j.layers.length; i++){
        j.layers[i].order = arrayO[i];
    }
    fsPath.writeFile("C:/Users/Davide/Desktop/Inizio.json", JSON.stringify(j, null, "\t"), function(err){
        if(err) {
        throw err;
        } else {
        console.log('Json fatto');
        }
    });
    
    return j;
}
/*
    if(j.layers.length != 1){
            for(var i = 0; i < j.layers.length; i++){
                arrayO[i] = j.layers[i].order;
            }
        fsPath.writeFile("C:/Users/Davide/Desktop/Inizio.json", JSON.stringify(j, null, "\t"), function(err){
            if(err) {
            throw err;
            } else {
            console.log('Json fatto');
            }
        });
        var k = 0;
        for(var i = 0; i < j.layers.length; i++){
        j.layers[i].order = j.layers[i].order + k;
        k++;
        }
    }
    return j;
    */
 

function setMergeSx(j){
    j = aggiustaOrder(j);

    var arrayO = [];
    var arrayT = []; //ho tutti gli order dei layers
    var i = 0; //
    for(var i = 0; i < j.layers.length; i++){
        arrayO[i] = j.layers[i].order;
        arrayT[i] = arrayO[i];
    }
    var indice = 0;
    var k = 1;
    for(i = 0; i<arrayO.length; i++){
        indice = minArray(arrayT);
        arrayO[arrayT.indexOf(indice)] = arrayO[arrayT.indexOf(indice)] + k;
        arrayT[arrayT.indexOf(indice)] = 9999;
        k++;
    }
    for(i = 0; i < j.layers.length; i++){
        j.layers[i].order = arrayO[i];
    }
    fsPath.writeFile("C:/Users/Davide/Desktop/Inizio.json", JSON.stringify(j, null, "\t"), function(err){
        if(err) {
        throw err;
        } else {
        console.log('Json fatto');
        }
    });
    
    return j;
    
}
function incrementMerge(j){
    for(var i = 0; i < j.layers.length; i++){
        j.layers[i].order = j.layers[i].order + 2;
        }
    return j;
    
}

function decrementMerge(j){
    min = minArray(j.layers);
    if(min !== 1 || min !== 2 ){

        for(var i = 0; i < j.layers.length; i++){
            j.layers[i].order = j.layers[i].order - 2;
        }
    } else{
        console.log("Ehi, non puoi più andare indietro")
    }
        return j;

}

function minArray(array){
    var min = array[0];
    for (var i = 1; i < array.length; i++){
        min = Math.min(array[i], min);
    }
    return min;
}

function maxArray(array){
    var max = array[0];
    for (var i = 1; i < array.length; i++){
        max = Math.max(array[i], max);
    }
    return max;
}

function mergeDG(j1,j2){
    var lastID = controllaID(j1);
    lastID++;
    var idProv;
    for (i = 0; i < j2.layers.length; i++){
        idProv = j2.layers[i].id;
        j2.layers[i].id = lastID;
        if(j2.layers[i].type == "image"){
            for(j = 0; j<j2.data.length; j++){
                if(j2.data[j].id == idProv){
                    j2.data[j].id = lastID;
                }
            }
        }
        lastID++;
    }

    var j3 = conc.merge(j1,j2);
    j3.info.layer_active = j2.info.layer_active + j1.info.layer_active;
    j3 = aggiustaOrder(j3);
    return j3;
}


function controllaID(j1){
    var arrayO = [];
    for(var i = 0; i < j1.layers.length; i++){
        arrayO[i] = j1.layers[i].id;
    }
    max = maxArray(arrayO);
    return max;
}


exports.setMergeSx = setMergeSx;
exports.setMergeDx = setMergeDx;
exports.aggiustaOrder = aggiustaOrder;
exports.incrementMerge = incrementMerge;
exports.decrementMerge = decrementMerge;
exports.mergeDG = mergeDG;