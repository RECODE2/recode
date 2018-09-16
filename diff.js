var conc = require('merge-json');
var deepEqual = require('deep-equal')
var fs = require('fs');
const fsPath = require('fs-path');
const ConnessioneDB = require('./Backend/query');

function diffJSON(obj1, obj2, fileEliminate2, req, res) {
    var result = {info: {}, layers: [], data: []};
    var fileEliminate = {eliminate:[]};
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
                } else if(obj1.layers.length == 1 && obj2.layers.length == obj1.layers.length){
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
    ConnessioneDB.idRevision(req, res, function(result){
       fsPath.writeFile(req.session.repository + "/Eliminate/"+result+".json", JSON.stringify(fileEliminate, null, "\t"), function(err){
            if(err) {
              throw err;
            } else {
                
              console.log('Eliminate Fatto');
            }
          });
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

function caricaJSONPadre(req){
    imgJson = JSON.parse(fs.readFileSync(req.session.path));
    return imgJson;
}

exports.diffJSON = diffJSON;
exports.caricaJSONPadre = caricaJSONPadre;