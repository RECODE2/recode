var deepEqual = require('deep-equal')
var fs = require('fs');
const fsPath = require('fs-path');
const ConnessioneDB = require('./Backend/query');

var filter = require('array-filter');

function diffJSON(obj1, obj2, fileEliminate2, req, res) {
    var result = { info: {}, layers: [], data: [] };
    var fileEliminate = { eliminate: [] };
    var i = 0; //CONTATORI
    var j = 0;
    var k = 0;
    var g = 0;
    correggiJSON(obj2);
//Controllo se ci sono bug dovuti dall'id del modello dati
/*
    for (var i = 0; i < obj2.layers.length; i++) {
        var idC = obj2.layers[i].id
        var cont = 0;
        for (var j = 0; j < obj2.layers.length; j++) {
            if (idC == obj2.layers[i].id) {
                cont++;
                if (cont > 1) {
                    delete obj2.layers[i];
                    obj2.layers = filter(obj2.layers, function (undefined) {
                        return true;
                    });
                }
            }
        }
    }

*/
    result.info = obj2.info;
    //INSERISCO NEL JSON RISULTATO TUTTI I LAYERS CON ID UGUALE, MA CON EVENTUALI MODIFICHE
    for (i = 0; i < obj1.layers.length; i++) {
        for (j = 0; j < obj2.layers.length; j++) {
            if (obj1.layers[i].id == obj2.layers[j].id) {
                if (!deepEqual(obj1.layers[i], obj2.layers[j])) {
                    result.layers[k] = obj2.layers[j];
                    if (obj2.layers[j].type == "image") {
                        for (var t = 0; t < obj2.data.length; t++) {
                            if (obj2.layers[j].id == obj2.data[t].id) {
                                result.data[g] = obj2.data[t];
                                g++;
                            }
                        }
                    }
                    k++;
                } else if (obj1.layers.length == 1 && obj2.layers.length == obj1.layers.length) {
                    result.layers[k] = obj2.layers[j];
                    if (obj2.layers[j].type == "image") {
                        for (var t = 0; t < obj2.data.length; t++) {
                            if (obj2.layers[j].id == obj2.data[t].id) {
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
    for (i = 0; i < obj2.layers.length; i++) {
        if (!controllaJSON(obj2.layers[i].id, obj1)) {
            result.layers[k] = obj2.layers[i];
            if (obj2.layers[i].type == "image") {
                for (var t = 0; t < obj2.data.length; t++) {
                    if (obj2.layers[i].id == obj2.data[t].id) {
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
    fileEliminate = JSON.parse(JSON.stringify(fileEliminate2));
    var f = fileEliminate2.eliminate.length;
    for (i = 0; i < obj1.layers.length; i++) {
        if (!controllaJSON(obj1.layers[i].id, obj2)) {
            fileEliminate.eliminate[f] = obj1.layers[i].id;
            //console.log("Sto inserendo nell'eliminate" + fileEliminate.eliminate[f]);
            f++;
        }
    }
    ConnessioneDB.idRevision(req, res, function (result) {
        fsPath.writeFile(req.session.repository + "/Eliminate/" + result + ".json", JSON.stringify(fileEliminate, null, "\t"), function (err) {
            if (err) {
                throw err;
            } else {

                //console.log('Eliminate Fatto');
            }
        });
    });

    //SETTO IL L'ULTIMO LAYER ATTIVO

    if (result.layers.length == 0) {
        //console.log("Result non ha layers")
        for (var i = 0; i < obj2.layers.length; i++) {
            result.layers[i] = obj2.layers[i];
        }
        if (obj2.data.length !== 0) {
            for (var i = 0; i < obj2.data.length; i++) {
                //console.log("i" + i);
                result.data[i] = obj2.data[i];
            }
        }
    }
    max = 0;
    for (j = 0; j < result.layers.length; j++) {
        max = Math.max(result.layers[j].id, max)
    }
    result.info.layer_active = max;
    return result;
}

function correggiJSON(j1) {
    for (var i = 0; i < j1.layers.length; i++) {
        var counter = 0;
        var indice;
        for (var j = 0; j < j1.layers.length; j++) {
            if (j1.layers[i].id == j1.layers[j].id) {
                counter++;
                if (counter > 1) {
                    delete j1.layers[j];
                    j1.layers = filter(j1.layers, function (undefined) {
                        return true;
                    });
                }
            }
        }
    }
}

function controllaJSON(id2, obj1) {
    for (var i = 0; i < obj1.layers.length; i++) {
        if (id2 == obj1.layers[i].id) {
            return true;
        }
    }
    return false;
}

function controllaFileEliminate(id2, fileEliminate) {
    for (var i = 0; i < fileEliminate.eliminate.length; i++) {
        if (id2 == fileEliminate.eliminate[i]) {
            return true;
        }
    }
    return false;
}

function caricaJSONPadre(req) {
    imgJson = JSON.parse(fs.readFileSync(req.session.path));
    return imgJson;
}


exports.correggiJSON = correggiJSON;
exports.diffJSON = diffJSON;
exports.caricaJSONPadre = caricaJSONPadre;
