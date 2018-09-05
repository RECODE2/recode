var conc = require('merge-json');
var deepEqual = require('deep-equal')
var fs = require('fs');
const fsPath = require('fs-path');

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
