//query.js

const mysql = require('mysql');
const dbconfig = require('./database');
const connection = mysql.createConnection(dbconfig.connection);


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

function insertRepository(req, nomeRepository, dataCreazioneRepo, callback) {
    var admin = req.session.nickname;
    connection.query("INSERT INTO repository (nome,admin,dataCreazione) VALUES ('" + nomeRepository + "','" + admin + "'," + dataCreazioneRepo + ")", function (err, result) {
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

function insertAddRevision(path, req, repository) {

    var path1 = path + "/Immagini/" + req.body.file_jpeg_name;
    var path2 = path + "/JSON/" + req.body.file_json_name;
    
    var nome = req.body.file_jpeg_name;
    var nome1 = req.body.file_json_name;
    var querySQL = "INSERT INTO `vit`.`file` (`path`, `nome`, `repository`, `utente`,tipo) VALUES ('" + path1 + "', '" + nome + "', '" + repository + "', '" + req.session.nickname + "', 'Rev');";
    var querySQL1 = "INSERT INTO `vit`.`file` (`path`, `nome`, `repository`, `utente`,tipo) VALUES ('" + path2 + "', '" + nome1 + "', '" + repository + "', '" + req.session.nickname + "', 'Rev');";
    //var querySQL1 = "INSERT INTO `vit`.`file` (`path`, `nome`, `repository`, `utente`,tipo) VALUES ('"+path+"', '"+nome+"', '"+repository+"', '"+utente+"', 'Rev');";
    connection.query(querySQL, function (err, results, fields) {
        if (err) throw err;
    });
    connection.query(querySQL1, function (err, results, fields) {
        if (err) throw err;
    });
    queryV = "Select * from file f where f.repository ='"+repository+"'";
    connection.query(queryV, function(err, result, fields){
        if (result.length == 2){
            var idModifiche = Math.random().toString(36).substring(7);
            querySQL = "INSERT INTO `vit`.`commit` (`idModifiche`, `padre1`, `padre2`, `file`, `utente`, `descrizione`, `branch`) VALUES ('"+idModifiche+"', '-1', '-1', '"+result[1].idFile+"', '"+req.session.nickname+"', '"+req.body.desc+"', '"+req.session.branch+"');";
            connection.query(querySQL, function(err,result,fields){
                if (err) throw err;
            });
        }
    });
    

}

function datiRepo(req, res, callback) {
    var nome = "";
    if (!req.session.repository) {
        nome = req.body.nomeRepo;
    } else {
        nome = req.session.nameRepository;
    }
    var querySQL = "SELECT * FROM repository r WHERE r.nome ='" + nome + "' order by r.dataCreazione desc";
    connection.query(querySQL, function (err, result) {

        if (err) {
            console.log(err);
        }
        return callback(result[0]);
    });
}

function login(req, callback) {
    var controllo = false;
    var queryL = "SELECT * FROM utenti WHERE nickname='" + req.body.nickname + "' and password='" + req.body.password + "'"
    connection.query(queryL, function (err, result) {
        controllo = false;
        if (err) {
            console.log("C'è un errore nella query: " + err);
            return callback(err);
        }
        else {
            console.log("Query ok!");
        }
        if (!result.length) {
            console.log("Utente non trovato!");
            console.log("BLABLA");
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
        return callback(result);
    });
}

function partecipazioneRepo(req, idRepository) {
    queryP = "INSERT INTO `vit`.`partecipazione` (`utente`, `repository`, `diritto`) VALUES ('" + req.session.nickname + "', '" + idRepository + "', '0')";
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
function branchMaster(req,res,result){
    var idBranch = Math.random().toString(36).substring(7);
    //METTERE REVISION PRESA DAL GRAFO QUANDO SELEZIONO
    queryB = "INSERT INTO `vit`.`branch` (`idbranch`, `nome`, `utente`,`repository`) VALUES ('"+idBranch+"', 'master', '"+req.session.nickname+"', '"+result.idRepository+"');"
    connection.query(queryB, function(err, result){
        if(err){
            console.log("Errore nella query"+ err)
        }
    });
    return idBranch;
}

function setIdBranchMaster(req,res,callback){
    console.log(req.session.idRepository + " QUA")
    queryB = "select idbranch from branch where repository ='" +req.session.idRepository+"' AND nome = 'master' AND revision IS NULL;"
    connection.query(queryB, function(err, result){
        if (err) throw err;
        console.log(req.session.repository);
        return callback(result[0].idbranch);
    });
}

function saveCommit(req,res){
    var idModifiche = Math.random().toString(36).substring(7);
    queryV = "Select * from file f where f.repository ='"+req.session.idRepository+"' AND nome='"+req.body.file_json_name+"'";
    connection.query(queryV, function(err, result, fields){
        querySQL = "INSERT INTO `vit`.`commit` (`idModifiche`, `padre1`, `padre2`, `file`, `utente`, `descrizione`, `branch`) VALUES ('"+idModifiche+"', '-1', '-1', '"+result[0].idFile+"', '"+req.session.nickname+"', '"+req.body.desc+"', '"+req.session.branch+"');";
        connection.query(querySQL, function(err,result){
            if (err){
                console.log("CIAO" + err);
            }
        })
    });
    

}

function insertCommitFile(req,res){
    var nome = req.body.file_json_name;
    var path1 = req.session.repository + "/JSON/" + nome;
    var querySQL = "INSERT INTO `vit`.`file` (`path`, `nome`, `repository`, `utente`,tipo) VALUES ('" + path1 + "', '" + nome + "', '" + req.session.idRepository + "', '" + req.session.nickname + "', 'Com');";
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
        console.log(result);
        return callback(result);
    });
}
    
exports.creaConnessione = creaConnessione;
exports.chiudiConnessione = chiudiConnessione;
exports.usaDB = usaDB;
exports.insertRepository = insertRepository;
exports.insertAddRevision = insertAddRevision;
exports.registrazione = registrazione;
exports.login = login;
exports.partecipazioneRepo = partecipazioneRepo;
exports.datiRepo = datiRepo;
exports.elencoRepo = elencoRepo;
exports.newBranch = newBranch;
exports.branchMaster = branchMaster;
exports.setIdBranchMaster = setIdBranchMaster;
exports.insertCommitFile = insertCommitFile;
exports.saveCommit = saveCommit;
exports.elencoDatiRevG = elencoDatiRevG;
exports.leggiDatiUtente = leggiDatiUtente;
exports.modificaDatiUtente = modificaDatiUtente;