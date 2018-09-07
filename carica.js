var conc = require('merge-json');
var fs = require('fs');
const fsPath = require('fs-path');
var deepEqual = require('deep-equal');
var filter = require('array-filter');

function caricaImmagine(j1, j2, fileEliminate){

    for(var i = 0; i < j2.layers.length; i++){
        if(!controllaJSON(j2.layers[i].id, j1)){
            for(var z = j1.layers.length; z>0; z--){
                j1.layers[z] = j1.layers[z-1];
            }
            j1.layers[0] = j2.layers[i];
            if(j2.layers[i].type == "image"){
               for(var g = j2.data.length; g > 0; g--){
                    if(j2.layers[i].id == j2.data[g-1].id){
                        for(var z = j1.data.length; z>0; z--){
                            j1.data[z] = j1.data[z-1];
                        }
                        j1.data[0] = j2.data[i];
                    }
               }
            }
        }
    }
    var j2 = purgaJSON(j1,fileEliminate);
    return j2;
}

function purgaJSON(j1, fileEliminate){
    var j2 = j1;
    for(var i = 0; i<j2.layers.length; i++){
        if(controllaFileEliminate(j2.layers[i].id, fileEliminate)){
            for(var j = 0; j < j2.layers.length - 1; j++){
                delete j2.layers[i];
                
            }
        }
    }
    j2.layers = filter(j2.layers, function(undefined){
        return true;
    })
    for(var i = 0; i<j2.data.length; i++){
        if(controllaFileEliminate(j2.data[i].id, fileEliminate)){
            for(var j = 0; j < j2.data.length - 1; j++){
                delete j2.data[i];
                
            }
        }
    }
    j2.data = filter(j2.data, function(undefined){
        return true;
    })
    j1 = j2;
    return j1;
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



exports.caricaImmagine = caricaImmagine;
