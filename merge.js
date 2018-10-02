
var conc = require('merge-json');

function aggiustaOrder(j) {
    var arrayO = [];
    var arrayT = []; //ho tutti gli order dei layers
    var i = 0; //
    if (j.layers.length != 1) {
        for (var i = 0; i < j.layers.length; i++) {
            arrayO[i] = j.layers[i].order;
            arrayT[i] = arrayO[i];
        }
        var i = 1;
        var min = minArray(arrayO);
        arrayT[arrayO.indexOf(min)] = 9999;
        arrayO[arrayO.indexOf(min)] = 1;
        min = 1;
        for (i = 1; i < arrayT.length; i++) {
            var minT = minArray(arrayT);
            if (minT <= (min + 1)) {
                arrayT[arrayT.indexOf(minT)] = 9999;
                min++;
            } else {
                arrayO[arrayO.indexOf(minT)] = min + 1;
                arrayT[arrayT.indexOf(minT)] = 9999;
                min++;
            }
        }

        for (i = 0; i < j.layers.length; i++) {
            j.layers[i].order = arrayO[i];
        }
    } else j.layers[0].order = 1;

    return j;

}

function setMergeSx(j) {

    j = aggiustaOrder(j);



    var arrayO = [];
    var arrayT = []; //ho tutti gli order dei layers
    var i = 0; //
    for (var i = 0; i < j.layers.length; i++) {
        arrayO[i] = j.layers[i].order;
        arrayT[i] = arrayO[i];
    }
    var indice = 0;
    var k = 0;
    for (i = 0; i < arrayO.length; i++) {
        indice = minArray(arrayT);
        arrayO[arrayT.indexOf(indice)] = arrayO[arrayT.indexOf(indice)] + k;
        arrayT[arrayT.indexOf(indice)] = 9999;
        k++;
    }
    for (i = 0; i < j.layers.length; i++) {
        j.layers[i].order = arrayO[i];
    }

    return j;

}

function setMergeDx(j) {
    j = aggiustaOrder(j);

    var arrayO = [];
    var arrayT = []; //ho tutti gli order dei layers
    var i = 0; //
    for (var i = 0; i < j.layers.length; i++) {
        arrayO[i] = j.layers[i].order;
        arrayT[i] = arrayO[i];
    }
    var indice = 0;
    var k = 1;
    for (i = 0; i < arrayO.length; i++) {
        indice = minArray(arrayT);
        arrayO[arrayT.indexOf(indice)] = arrayO[arrayT.indexOf(indice)] + k;
        arrayT[arrayT.indexOf(indice)] = 9999;
        k++;
    }
    for (i = 0; i < j.layers.length; i++) {
        j.layers[i].order = arrayO[i];
    }
    return j;

}


function incrementMerge(j) {
    //console.log("Appena entrato " + JSON.stringify(j, null, '\t'));
    for (var i = 0; i < j.layers.length; i++) {
        j.layers[i].order = j.layers[i].order + 2;
    }
    //console.log("J IN INCREMENT MERGE prima del return: " + JSON.stringify(j, null, '\t'));
    return j;

}

function decrementMerge(j) {
    //console.log("Appena entrato " + JSON.stringify(j, null, '\t'));
    var ArrayO = [];
    for (var i = 0; i < j.layers.length; i++) {
        ArrayO[i] = j.layers[i].order;
    }
    var min = minArray(ArrayO);
    if (min !== 1 && min !== 2) {

        for (var i = 0; i < j.layers.length; i++) {
            j.layers[i].order = j.layers[i].order - 2;
        }
    } else {
        //console.log("Ehi, non puoi più andare indietro!")
    }

    //console.log("J IN DECREMENT MERGE prima del return: " + JSON.stringify(j, null, '\t'));

    return j;

}

function minArray(array) {
    var min = array[0];
    for (var i = 1; i < array.length; i++) {
        min = Math.min(array[i], min);
    }
    return min;
}

function maxArray(array) {
    var max = array[0];
    for (var i = 1; i < array.length; i++) {
        max = Math.max(array[i], max);
    }
    return max;
}

function mergeDG(j1, j2) {
    var jA = JSON.parse(JSON.stringify(j1));
    var jB = JSON.parse(JSON.stringify(j2));
    var lastID = controllaID(jA);
    lastID++;
    var idProv;
    for (var i = 0; i < jB.layers.length; i++) {
        idProv = jB.layers[i].id;
        jB.layers[i].id = lastID;
        if (jB.layers[i].type == "image") {
            for (var j = 0; j < jB.data.length; j++) {
                if (jB.data[j].id == idProv) {
                    jB.data[j].id = lastID;
                }
            }
        }
        lastID++;
    }
    var j3 = { info: {}, layers: [], data: [] };
    j3 = conc.merge(jA, jB);
    j3 = aggiustaOrder(j3);
    var max = 0;
    for (var z = 0; z < j3.layers.length; z++) {
        //console.log("max: " + max)
        max = Math.max(j3.layers[z].id, max)
    }
    j3.info.layer_active = max;
    return j3;
}


function controllaID(j1) {
    var arrayO = [];
    for (var i = 0; i < j1.layers.length; i++) {
        arrayO[i] = j1.layers[i].id;
    }
    var max = maxArray(arrayO);
    return max;
}

function controllaOrder(j1) {
    var arrayO = [];
    for (var i = 0; i < j1.layers.length; i++) {
        arrayO[i] = j1.layers[i].order;
    }
    var max = maxArray(arrayO);
    var id = arrayO.indexOf(max);
    return id;
}


exports.setMergeSx = setMergeSx;
exports.setMergeDx = setMergeDx;
exports.aggiustaOrder = aggiustaOrder;
exports.incrementMerge = incrementMerge;
exports.decrementMerge = decrementMerge;
exports.mergeDG = mergeDG;