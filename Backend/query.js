//query.js

const mysql = require('mysql');
const dbconfig = require('./database');
const connection = mysql.createConnection(dbconfig.connection);
const fsPath = require('fs-path');
var fs = require('fs');
var diffJ = require('./../diff.js')


function creaConnessione() {
    connection.connect(function (err) {
        if (err) console.log("Errore nella connessione al db!");
        else console.log("Sei connesso!");
    });
}

function chiudiConnessione() {
    connection.end(function (err) {
        if (err) console.log("Non puoi terminare la connessione se non sei connesso! LOL");
        else console.log("Connessione terminata!");
    });
}

function usaDB() {
    const querySQL = 'USE ' + dbconfig.database;
    connection.query(querySQL, function (err, result) {
        if (err) console.log("Errore!");
        else console.log("Stai utilizzando il db: " + dbconfig.database);
    });
}

function insertRepository(req, callback) {
    var nomeRepository = req.body.nomeRepo;
    var descrizione = req.body.readme;
    var d = new Date();
    var anno = d.getFullYear();
    var mese = d.getMonth()+1;
    var giorno = d.getDate();
    var ora = d.getHours();
    console.log("ora: "+ora);
    var minuto = d.getMinutes();
    console.log("minuti: "+minuto);
    var secondo = d.getSeconds();
    console.log("secondi: "+secondo);
    const dataCreazioneRepo = "'"+anno+"-"+mese+"-"+giorno+" "+ora+":"+minuto+":"+secondo+"'";
    var admin = req.session.nickname;
    connection.query("INSERT INTO repository (nome,admin,dataCreazione,descrizione) VALUES ('" + nomeRepository + "','" + admin + "'," + dataCreazioneRepo + ",'"+ descrizione +"')", function (err, result) {
        if (err) {
            console.log("C'è un errore nella query: " + err);
            console.log("C'è un errore nella query: " + admin);
        }
        else {
            console.log("Repository inserita sul DB!");
        }
        return callback(result);
    });
}

function insertAddRevision(path, req,res, repository,callback) {
    var d = new Date();
    var anno = d.getFullYear();
    var mese = d.getMonth()+1;
    var giorno = d.getDate();
    var ora = d.getHours();
    console.log("ora: "+ora);
    var minuto = d.getMinutes();
    console.log("minuti: "+minuto);
    var secondo = d.getSeconds();
    console.log("secondi: "+secondo);
    const dataModifica = "'"+anno+"-"+mese+"-"+giorno+" "+ora+":"+minuto+":"+secondo+"'";

    var path1 = path + "/Immagini/" + req.body.file_jpeg_name;
    var path2 = path + "/JSON/" + req.body.file_json_name;
    
    var nome = req.body.file_jpeg_name;
    var nome1 = req.body.file_json_name;
    console.log(repository + "SOLUZIONE FINALE");
    var querySQL = "INSERT INTO `vit`.`file` (`path`, `nome`, `repository`, `utente`,`tipo`,`formato`) VALUES ('" + path1 + "', '" + nome + "', '" + repository + "', '" + req.session.nickname + "', 'Rev', 'jpeg');";
    var querySQL1 = "INSERT INTO `vit`.`file` (`path`, `nome`, `repository`, `utente`,`tipo`,`formato`) VALUES ('"+ path2 + "', '" + nome1 + "', '" + repository + "', '" + req.session.nickname + "', 'Rev', 'json');";
    //var querySQL1 = "INSERT INTO `vit`.`file` (`path`, `nome`, `repository`, `utente`,tipo) VALUES ('"+path+"', '"+nome+"', '"+repository+"', '"+utente+"', 'Rev');";
    connection.query(querySQL, function (err, results, fields) {
        if (err) throw err;
    });
    connection.query(querySQL1, function (err, results, fields) {
        if (err) throw err;

    });
    queryV = "Select * from file f where f.repository ='"+repository+"'";
    
    connection.query(queryV, function(err, result, fields){
        var idModifiche = Math.random().toString(36).substring(7);
        if (result.length == 2){
            querySQL = "INSERT INTO `vit`.`commit` (`idModifiche`, `padre1`, `padre2`, `file`, `utente`, `descrizione`, `dataModifica`, `branch`) VALUES ('"+idModifiche+"', 'init', 'init', '"+result[1].idFile+"', '"+req.session.nickname+"', '"+req.body.desc+"', "+dataModifica + ", '"+req.session.branch+"');"
            connection.query(querySQL, function(err,result,fields){
                if (err) throw err;
            });
        } else {querySQL = "INSERT INTO `vit`.`commit` (`idModifiche`, `padre1`, `padre2`, `file`, `utente`, `descrizione`, `dataModifica`, `branch`) VALUES ('"+idModifiche+"', '"+req.session.idCorrente+"', 'init', '"+result[1].idFile+"', '"+req.session.nickname+"', '"+req.body.desc+"', "+dataModifica + ", '"+req.session.branch+"');";
        connection.query(querySQL, function(err,result,fields){
            if (err) throw err;
        });

        }
        //AGGIUNGERE ELSE SE CI SONO PIU' FILE PERCHE' ha PADRE
        idRevision(req,res, function(results){
            req.session.branch = branchMasterRev(req, results);
            res.write(toString(req.session.branch));
            var fileEliminate = {eliminate:[]};
            req.session.eliminate = path+"/Eliminate/"+results+".json";
            fsPath.writeFile(req.session.eliminate, JSON.stringify(fileEliminate, null, "\t"), function(err){
                if(err) {
                    throw err;
                } else {
                    console.log('Eliminate Fatto');
                }
            });
            res.end();
            });
    });

}
function inserisciDatiRepo(req, res, callback) {
    var nome = "";
    nome = req.body.nomeRepo;
    var querySQL = "SELECT * FROM repository r WHERE r.nome ='" + nome + "' order by r.dataCreazione desc";
    connection.query(querySQL, function (err, result) {

        if (err) {
            console.log(err);
        }
        return callback(result[0]);
    });
}

function settaDatiRepo(req, res, callback) {
    var nome = "";
    if (!req.session.repository) {
        nome = req.body.nomeRepo;
    } else {
        nome = req.session.nameRepository;
    }
   
    var querySQL = "SELECT * FROM repository r WHERE r.nome ='" + nome + "' AND r.admin = '"+req.session.nickname+"'order by r.dataCreazione desc";
    connection.query(querySQL, function (err, result) {

        if (err) {
            console.log(err);
        }
        console.log(result);
        console.log(result[0].idRepository + "SettaDatiRepo")
        return callback(result[0].idRepository);
    });
}

function login(req, callback) {
    var queryL = "SELECT * FROM utenti WHERE nickname='" + req.body.nickname + "' and password='" + req.body.password + "'"
    connection.query(queryL, function (err, result) {
        var controllo = false;
        if (err) {
            console.log("C'è un errore nella query: " + err);
            return callback(err);
        }
        else {
            console.log("Query ok!");
        }
        if (!result.length) {
            console.log("Utente non trovato!");
            controllo = false;
        }
        else {
            console.log("utente trovato: " + result[0].nickname);
            controllo = true;
        }
        return callback(result[0]);
    });
}

function registrazione(req, callback) {
    var nickname = req.body.nickname;
    var password = req.body.password;
    var nome = req.body.nome;
    var cognome = req.body.cognome;
    var mail = req.body.mail;
    var queryR = "INSERT INTO `vit`.`utenti` (`nickname`, `password`, `nome`, `cognome`, `mail`) VALUES ('" + nickname + "', '" + password + "', '" + nome + "', '" + cognome + "', '" + mail + "');";
    connection.query(queryR, function (err, result) {
        controllo = false;
        if (err) {
            console.log("C'è un errore nella query: " + err);
        }
        else {
            console.log("Query ok!");
        }
        return callback(result, err);
    });
}

function partecipazioneRepo(req, idRepository) {
    var d = new Date();
    var anno = d.getFullYear();
    var mese = d.getMonth()+1;
    var giorno = d.getDate();
    var ora = d.getHours();
    console.log("ora: "+ora);
    var minuto = d.getMinutes();
    console.log("minuti: "+minuto);
    var secondo = d.getSeconds();
    console.log("secondi: "+secondo);
    const dataPartecipazione = "'"+anno+"-"+mese+"-"+giorno+" "+ora+":"+minuto+":"+secondo+"'";
    queryP = "INSERT INTO `vit`.`partecipazione` (`utente`, `repository`, `diritto`, `data`) VALUES ('" + req.session.nickname + "', '" + idRepository + "', '0', "+dataPartecipazione+")";
    connection.query(queryP);
}

function elencoRepo(req, callback) {
    queryE = "SELECT r.nome FROM repository r, partecipazione p where r.idRepository=p.repository and p.utente='" + req.session.nickname + "'";
    connection.query(queryE, function (err, result) {
        var arrayR = [];
        var i = 0;
        var numRows = result.length;
        console.log(numRows);
        while (i < numRows) {
            arrayR[i] = result[i].nome;
            i++;
        }
        result = "";
        result = arrayR;
        return callback(result);
    })
}

function newBranch(req,res){
    console.log(req.body.nameBranch);
    var idBranch = Math.random().toString(36).substring(7);
    //METTERE REVISION PRESA DAL GRAFO QUANDO SELEZIONO
    queryB = "INSERT INTO `vit`.`branch` (`idbranch`, `revision`, `nome`, `utente`) VALUES ('"+idBranch+"', '15', '"+req.body.nameBranch+"', '"+req.session.nickname+"');"
    connection.query(queryB, function(err, result){
        if(err){
            console.log("Errore nella query"+ err)
        }
    });
}
function branchMaster(req,result){
    var idBranch = Math.random().toString(36).substring(7);
    //METTERE REVISION PRESA DAL GRAFO QUANDO SELEZION
        queryB1 = "INSERT INTO `vit`.`branch` (`idbranch`, `nome`, `utente`,`repository`) VALUES ('"+idBranch+"', 'master', '"+req.session.nickname+"', '"+result+"');"
        connection.query(queryB1, function(err, result){
            if(err){
                console.log("Errore nella query"+ err)
            }
        });
    
    return idBranch;
}

function setIdBranchMaster(req,res,callback){
    console.log(req.session.idRepository + " QUAA"); 
    queryB = "select idbranch from branch where repository ='" +req.session.idRepository+"' AND nome = 'master' AND utente = '"+req.session.nickname+"' AND revision IS NULL;"
    connection.query(queryB, function(err, result){
        if (err) throw err;
        console.log(req.session.repository +"  " +result[0].idbranch);
        return callback(result[0].idbranch);
    });
}

function saveCommit(req,res, fileData, fileName){
    var idModifiche = Math.random().toString(36).substring(7);
    queryV = "Select * from file f where f.repository ='"+req.session.idRepository+"' AND nome='"+req.body.file_json_name+"'";
    connection.query(queryV, function(err, result, fields){
        querySQL = "INSERT INTO `vit`.`commit` (`idModifiche`, `padre1`, `padre2`, `file`, `utente`, `descrizione`, `branch`) VALUES ('"+idModifiche+"', '"+req.session.idCorrente+"', 'init', '"+result[0].idFile+"', '"+req.session.nickname+"', '"+req.body.desc+"', '"+req.session.branch+"');";
        connection.query(querySQL, function(err,result){
            if (err){
                console.log("CIAO" + err);
            } else{
                   var fileEliminate = JSON.parse(fs.readFileSync(req.session.eliminate));
                    var j2 = JSON.parse(fileData);
                    var imgJson = diffJ.caricaJSONPadre(req);
                    var jCommit = diffJ.diffJSON(imgJson,j2, fileEliminate, req, res);
                    fsPath.writeFile(req.session.repository + '/JSON/' + fileName, JSON.stringify(jCommit, null, '\t'), function (err) {
                    if (err) {
                        throw err;
                    } else {
                        // console.log('Json fatto');
                    }
                });
            }
        })
    });
    

}

function insertCommitFile(req,res){
    var nome = req.body.file_json_name;
    var path1 = req.session.repository + "/JSON/" + nome;
    var querySQL = "INSERT INTO `vit`.`file` (`path`, `nome`, `repository`, `utente`,tipo, `formato`) VALUES ('" + path1 + "', '" + nome + "', '" + req.session.idRepository + "', '" + req.session.nickname + "', 'Com', 'json');";
    connection.query(querySQL, function(err, result){
        if (err) throw err;
    });
}

function elencoDatiRevG(idRepository, callback){
    var queryA = "SELECT * FROM revg WHERE repository="+idRepository;
    connection.query(queryA, function (err, result) {
        if (err) console.log("Errore!"+err);
        console.log(result);
        return callback(result);
    });}


function leggiDatiUtente(nomeutente, callback){
    var queryA = "SELECT * FROM utenti where nickname="+"'"+nomeutente+"'";
    connection.query(queryA, function (err, result) {
        if (err) console.log("Errore!"+err);
        console.log(result);
        return callback(result);
    });
}

 function modificaDatiUtente(req, callback){
    var nickname = req.session.nickname;
    var nome = req.body.nome;
    var password = req.body.password;
    var cognome = req.body.cognome;
    var mail = req.body.mail;

    var queryA = "UPDATE utenti SET password='"+password+"', nome='"+nome+"', cognome='"+cognome+"', mail='"+mail+"' WHERE nickname='"+nickname+"'";
    connection.query(queryA, function (err, result) {
        if (err) console.log("Errore!"+err);
        return callback(result);
    });
}

function infoRepo(req, callback) {
    var repo = req.session.idRepository;
    var queryR = "SELECT r.nome, r.descrizione FROM repository r where r.idRepository="+repo;
    connection.query(queryR, function(err, result) {
        if (err) {
            console.log("C'è un errore nella query: " + err);
        }
        else{
            console.log("Query ok!");
        }
        return callback(result);
    })
}

function modificaRepo(req, callback) {
    var repo = req.session.idRepository;
    var nome = req.body.nome;
    var descrizione = req.body.descrizione;
    var queryR = "UPDATE repository SET `nome`='"+nome+"', `descrizione`='"+descrizione+"' WHERE `idRepository`="+repo;
    connection.query(queryR, function(err, result) {
        if (err) {
            console.log("C'è un errore nella query: " + err);
        }
        else{
            console.log("Query ok!");
        }
        return callback(result);
    })
}

function elencoUtentiInvito(req, callback) {
    var queryE = "SELECT u.nickname FROM utenti u WHERE u.nickname NOT IN (SELECT p.utente FROM partecipazione p where p.repository="+req.session.idRepository+")";
    connection.query(queryE, function (err, result) {
        var arrayR = [];
        var i = 0;
        var numRows = result.length;
        while (i < numRows) {
            arrayR[i] = result[i].nickname;
            i++;
        }
        result = "";
        result = arrayR;
        return callback(result);
    })
}

function invitaUtente(req, callback) {
    var utente = req.body.utente;
    var repo = req.session.idRepository;
    var queryU = "INSERT INTO `vit`.`partecipazione` (`utente`, `repository`, `diritto`) VALUES ('"+utente+"', '"+repo+"', '1')";
    connection.query(queryU, function (err, result) {
        if (err) {
            console.log("C'è un errore nella query: " + err);
        }
        else {
            console.log("Query ok!");
        }
        return callback(result);
    })
}

function verificaAdmin(req, callback){
    var utente = req.session.nickname;
    var repo = req.session.idRepository;
    var queryV = "SELECT p.diritto FROM partecipazione p WHERE p.utente='"+utente+"' and p.repository="+repo;
    connection.query(queryV, function(err, result){
        if (err) {
            console.log("C'è un errore nella query: " + err);
        }
        else {
            console.log("Query ok!");
        }
        return callback(result);
    }); 
}

function elencoUtentiElimina(req, callback) {
    var repo = req.session.idRepository;
    var queryE = "SELECT p.utente FROM partecipazione p WHERE p.diritto!=0 and p.repository="+repo;
    connection.query(queryE, function (err, result) {
        var arrayR = [];
        var i = 0;
        var numRows = result.length;
        while (i < numRows) {
            arrayR[i] = result[i].utente;
            i++;
        }
        result = "";
        result = arrayR;
        return callback(result);
    })
}

function eliminaUtente(req, callback) {
    var utente = req.body.utente;
    var repo = req.session.idRepository;
    var queryU = "DELETE FROM partecipazione WHERE `utente`='"+utente+"' and`repository`="+repo;
    connection.query(queryU, function (err, result) {
        if (err) {
            console.log("C'è un errore nella query: " + err);
        }
        else {
            console.log("Query ok!");
        }
        return callback(result);
    })
}

function idRevision(req,res, callback){
    console.log(req.session.nickname);
    var queryRev="SELECT * from commit c where utente ='"+req.session.nickname+"' order by file desc";
    connection.query(queryRev, function(err,results, fields){
        if(err){
            console.log("Sono in idRevision "+ err);
        }
        console.log(results[0].file);
        return callback(results[0].file);
    });  
}

/*DAVIDE NEW QUERY BRANCH*/
function branchMasterRev(req, idRev, result){
    var idBranch = Math.random().toString(36).substring(7);
    //METTERE REVISION PRESA DAL GRAFO QUANDO SELEZION
        console.log(idRev + "SEI TU?")
        queryB1 = "INSERT INTO `vit`.`branch` (`idbranch`,`Revision`, `nome`, `utente`,`repository`) VALUES ('"+idBranch+"','"+idRev+"', 'master', '"+req.session.nickname+"', '"+req.session.idRepository+"');"
        connection.query(queryB1, function(err, result){
            if(err) throw err;
        });
    
    return idBranch;

}


/*FINE*/
    
exports.creaConnessione = creaConnessione;
exports.chiudiConnessione = chiudiConnessione;
exports.usaDB = usaDB;
exports.insertRepository = insertRepository;
exports.insertAddRevision = insertAddRevision;
exports.registrazione = registrazione;
exports.login = login;
exports.partecipazioneRepo = partecipazioneRepo;
exports.settaDatiRepo = settaDatiRepo;
exports.inserisciDatiRepo = inserisciDatiRepo;
exports.elencoRepo = elencoRepo;
exports.newBranch = newBranch;
exports.branchMaster = branchMaster;
exports.setIdBranchMaster = setIdBranchMaster;
exports.insertCommitFile = insertCommitFile;
exports.saveCommit = saveCommit;
exports.elencoDatiRevG = elencoDatiRevG;
exports.leggiDatiUtente = leggiDatiUtente;
exports.modificaDatiUtente = modificaDatiUtente;
exports.infoRepo = infoRepo;
exports.modificaRepo = modificaRepo;
exports.elencoUtentiInvito = elencoUtentiInvito;
exports.invitaUtente = invitaUtente;
exports.verificaAdmin = verificaAdmin;
exports.elencoUtentiElimina = elencoUtentiElimina;
exports.eliminaUtente = eliminaUtente;
exports.branchMasterRev = branchMasterRev;
exports.idRevision = idRevision