/*
riformatta il JSON del SW originale, inserendo la quantità
giusta di layers utilizzati e inserendo i giusti "ID" e "Order"
nel JSON in ordine crescente a partire da 1.
*/

/*
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

}*/

function aggiustaOrder(j){
    var arrayO = [];
    var arrayT = []; //ho tutti gli order dei layers
    var i = 0; //
    if(j.layers.length != 1){
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
    } else j.layers[0].order = 1;
    return j;

}

function setMergeDx(j){
    j = aggiustaOrder(j);
    var k = 0;
    for(var i = 0; i < j.layers.length; i++){
       j.layers[i].order = j.layers[i].order + k;
       k++;
    }
    return j;

} 

function setMergeSx(j){
    j = aggiustaOrder(j);
    var k = 1;
    for(var i = 0; i < j.layers.length; i++){
       j.layers[i].order = j.layers[i].order + k;
       k++;
    }
    return j;
    
} 

function incrementMerge(j){
    for(var i = 0; i < j.layers.length; i++){
       j.layers[i].order = j.layers[i].order + 2;
    }
    return j;
    
}

function decrementMerge(j){
    if(j.layers[0].order != 1){

    for(var i = 0; i < j.layers.length; i++){
        j.layers[i].order = j.layers[i].order - 2;
     }
    } else{
        console.log("Ehi, non puoi più andare indietro")
    }
     return j;

}//copio nel nuovo JSON
    


/*
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

}*/

function minArray(array){
    var min = array[0];
    for (var i = 1; i < array.length; i++){
        min = Math.min(array[i], min);
    }
    return min;
}
exports.aggiustaOrder = aggiustaOrder;