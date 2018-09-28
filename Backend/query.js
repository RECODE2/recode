const mysql = require('mysql');
const dbconfig = require('./database');
const connection = mysql.createConnection(dbconfig.connection);
const fsPath = require('fs-path');
var fs = require('fs');
var diffJ = require('./../diff.js')

function creaConnessione() {
    connection.connect(function (err) {
        if (err) {
            console.log("Errore nella connessione al db: " + err);
        }
        else {
            console.log("Sei connesso!");
            connection.query('SET GLOBAL connect_timeout=28800')
            connection.query('SET GLOBAL wait_timeout=28800')
            connection.query('SET GLOBAL interactive_timeout=28800')
            usaDB();
        }
    })
}

function chiudiConnessione() {
    connection.end(function (err) {
        if (err) {
            console.log("Errore nella chiusura della connessione: " + err);
        }
        else {
            console.log("Connessione terminata!");
        }
    });
}

function usaDB() {
    connection.query('USE vit', function (err) {
        if (err) {
            console.log("Errore nella selezione del db: " + err);
        }
        else {
            console.log("Stai utilizzando il db vit!");
        }
    });
}

function insertRepository(req, callback) {
    var nomeRepository = req.body.nomeRepo;
    var descrizione = req.body.readme;
    var d = new Date();
    var anno = d.getFullYear();
    var mese = d.getMonth() + 1;
    var giorno = d.getDate();
    var ora = d.getHours();
    var minuto = d.getMinutes();
    var secondo = d.getSeconds();
    const dataCreazioneRepo = "'" + anno + "-" + mese + "-" + giorno + " " + ora + ":" + minuto + ":" + secondo + "'";
    var admin = req.session.nickname;
    connection.query("INSERT INTO repository (nome,admin,dataCreazione,descrizione) VALUES (?,?,"+dataCreazioneRepo+",?)", [nomeRepository, admin, descrizione], function (err, result) {
        if (err) {
            console.log("Errore inserimento repository: " + err);
        }
        else {
            console.log("Repository inserito con successo!");
        }
        return callback(result);
    });
}

function insertAddRevision(path, req, res, repository, callback) {
    var d = new Date();
    var anno = d.getFullYear();
    var mese = d.getMonth() + 1;
    var giorno = d.getDate();
    var ora = d.getHours();
    var minuto = d.getMinutes();
    var secondo = d.getSeconds();
    const dataModifica = "'" + anno + "-" + mese + "-" + giorno + " " + ora + ":" + minuto + ":" + secondo + "'";
    //var path1 = path + "/Immagini/" + req.body.file_jpeg_name;
    var path2 = path + "/JSON/" + req.body.file_json_name;
    var nome = req.body.file_jpeg_name;
    var nome1 = req.body.file_json_name;
    var querySQL = "INSERT INTO `file` (`path`, `nome`, `repository`, `utente`,`tipo`,`formato`) VALUES (?,?,?,?,?,?);";
/*     connection.query(querySQL, [path1, nome, repository, req.session.nickname, 'Rev', 'jpeg'], function (err, results, fields) {
        if (err) {
            console.log("Errore nell'inserimento della revisione: " + err);
        }
        else {
            console.log("Revisione inserita con successo! (IMG)");
        }
    }); */
    connection.query(querySQL, [path2, nome1, repository, req.session.nickname, 'Rev', 'json'], function (err, results, fields) {
        if (err) {
            console.log("Errore nell'inserimento della revisione: " + err);
        }
        else {
            console.log("Revisione inserita con successo! (JSON)");
        }
    });

    queryV = "Select * from file f where f.repository=? order by idFile desc";
    connection.query(queryV, [repository], function (err, result, fields) {
        var idModifiche = Math.random().toString(36).substring(7);
        if (result.length == 1) {
            console.log("sono nell'if..");
            querySQL = "INSERT INTO `commit` (`idModifiche`, `padre1`, `padre2`, `file`, `utente`, `descrizione`, `dataModifica`, `branch`) VALUES (?,?,?,?,?,?," + dataModifica + ",?)";
            connection.query(querySQL, [idModifiche, 'init', 'init', result[0].idFile, req.session.nickname, req.body.desc, req.session.branch], function (err, result, fields) {
                if (err) {
                    console.log("Errore inserimento (commit1): " + err);
                }
            });
        } else {
            console.log("sono qui... else");
            querySQL = "INSERT INTO `commit` (`idModifiche`, `padre1`, `padre2`, `file`, `utente`, `descrizione`, `dataModifica`, `branch`) VALUES (?,?,?,?,?,?," + dataModifica + ",?)";
            connection.query(querySQL, [idModifiche, req.session.idCorrente, 'init', result[0].idFile, req.session.nickname, req.body.desc, req.session.branch], function (err, result, fields) {
                if (err) {
                    console.log("Errore inserimento (commit2): " + err);
                }
            });

        }
        idRevision(req, res, function (results) {
            req.session.branch = branchMasterRev(req, results);
            var fileEliminate = { eliminate: [] };
            req.session.eliminate = path + "/Eliminate/" + results + ".json";

            fsPath.writeFile(req.session.eliminate, JSON.stringify(fileEliminate, null, "\t"), function (err) {
                if (err) {
                    console.log("Errore nella scrittura dell'eliminate: " + err);
                } else {
                    console.log('File eliminate creato con successo!');
                }
            });
            setGlobal(req, res);
        });
    });
}

function inserisciDatiRepo(req, res, callback) {
    var nome = "";
    nome = req.body.nomeRepo;
    var querySQL = "SELECT * FROM repository r WHERE r.nome=? order by r.dataCreazione desc";
    connection.query(querySQL, [nome], function (err, result) {
        if (err) {
            console.log("Errore nel reperimento del repository: " + err);
        }
        else {
            console.log("Repository reperito con successo!");
            return callback(result[0]);
        }
    });
}

function settaDatiRepo(req, res, callback) {
    var nome = "";
    if (!req.session.repository) {
        nome = req.body.nomeRepo;
    } else {
        nome = req.session.nameRepository;
    }
    var querySQL = "SELECT * FROM repository r, partecipazione p WHERE p.repository=r.idRepository AND r.nome=? AND p.utente=? order by r.dataCreazione desc";
    connection.query(querySQL, [nome, req.session.nickname], function (err, result) {
        if (err) {
            console.log("Errore nel settaggio dati di un repository: " + err);
        }
        else {
            console.log("Dati repository " + result[0].idRepository + " settati con successo!");
            return callback(result[0].idRepository);
        }
    });
}

function login(req, callback) {
    var queryL = "SELECT * FROM utenti WHERE nickname=? AND password=?";
    connection.query(queryL, [req.body.nickname, req.body.password], function (err, result) {
        var controllo = false;
        if (err) {
            console.log("C'è un errore nel login: " + err);
            return callback(err);
        }
        else {
            console.log("Login effettuato con successo! ");
        }
        if (!result.length) {
            console.log("Utente non trovato!");
            controllo = false;
        }
        else {
            console.log("Utente trovato: " + result[0].nickname);
            controllo = true;
            return callback(result[0]);
        }
    });
}

function registrazione(req, callback) {
    var nickname = req.body.nickname;
    var password = req.body.password;
    var nome = req.body.nome;
    var cognome = req.body.cognome;
    var mail = req.body.mail;

    var queryR = "INSERT INTO `utenti` (`nickname`, `password`, `nome`, `cognome`, `mail`) VALUES (?,?,?,?,?)";
    connection.query(queryR, [nickname, password, nome, cognome, mail], function (err, result) {
        controllo = false;
        if (err) {
            console.log("Errore durante la registrazione: " + err);
        }
        else {
            console.log("Registrazione effettuata con successo!");
        }
        return callback(result, err);
    });
}

function partecipazioneRepo(req, idRepository) {
    var d = new Date();
    var anno = d.getFullYear();
    var mese = d.getMonth() + 1;
    var giorno = d.getDate();
    var ora = d.getHours();
    var minuto = d.getMinutes();
    var secondo = d.getSeconds();
    const dataPartecipazione = "'" + anno + "-" + mese + "-" + giorno + " " + ora + ":" + minuto + ":" + secondo + "'";
    queryP = "INSERT INTO `partecipazione` (`utente`, `repository`, `diritto`, `data`) VALUES (?,?,?," + dataPartecipazione + ")";
    connection.query(queryP, [req.session.nickname, idRepository, '0'], function (err, res) {
        if (err) {
            console.log("Errore nella partecipazione al repository: " + err);
        }
        else {
            console.log("Partecipazione al repository avvenuta con successo!");
        }
    });
}

function elencoRepo(req, callback) {
    queryE = "SELECT r.nome FROM repository r, partecipazione p where r.idRepository=p.repository and p.utente=?";
    connection.query(queryE, [req.session.nickname], function (err, result) {
        if (err) {
            console.log("Errore nell'elenco repository: " + err);
        }
        else {
            var arrayR = [];
            var i = 0;
            var numRows = result.length;
            while (i < numRows) {
                arrayR[i] = result[i].nome;
                i++;
            }
            result = "";
            result = arrayR;
            return callback(result);
        }
    })
}

function newBranch(req, res) {
    var idBranch = Math.random().toString(36).substring(7);
    queryB = "INSERT INTO `branch` (`idbranch`, `revision`, `nome`, `utente`) VALUES (?,?,?,?)"
    connection.query(queryB, [idBranch, req.session.idCorrente, req.body.nameBranch, req.session.nickname], function (err, result) {
        if (err) {
            console.log("Errore nell'inserimento di un nuovo branch: " + err)
        }
        else {
            console.log("Nuovo branch creato: " + idBranch);
        }
    });
}

function branchMaster(req, result) {
    var idBranch = Math.random().toString(36).substring(7);
    queryB1 = "INSERT INTO `branch` (`idbranch`, `nome`, `utente`,`repository`) VALUES (?,?,?,?)"

    connection.query(queryB1, [idBranch, 'master', req.session.nickname, result], function (err, result) {
        if (err) {
            console.log("Errore inserimento branch master: " + err);
        }
        else {
            console.log("Branch master inserito con successo: " + idBranch);
        }
    });
    return idBranch;
}

function setIdBranchMaster(req, res, callback) {
    queryB = "select idbranch from branch where repository=? AND nome=? AND revision IS NULL;"
    connection.query(queryB, [req.session.idRepository, 'master'], function (err, result) {
        if (err) {
            console.log("Errore nella selezione del branch master: " + err);
        } else {
            console.log("Branch master settato con successo: " + result[0].idbranch);
            return callback(result[0].idbranch);
        }
    });
}

function saveCommit(req, res, fileData, fileName) {
    var idModifiche = Math.random().toString(36).substring(7);
    queryV = "Select * from file f where f.repository=? order by idFile desc";
    connection.query(queryV, [req.session.idRepository], function (err, result, fields) {
        var d = new Date();
        var anno = d.getFullYear();
        var mese = d.getMonth() + 1;
        var giorno = d.getDate();
        var ora = d.getHours();
        var minuto = d.getMinutes();
        var secondo = d.getSeconds();
        const dataModifica = "'" + anno + "-" + mese + "-" + giorno + " " + ora + ":" + minuto + ":" + secondo + "'";
        querySQL = "INSERT INTO `commit` (`idModifiche`, `padre1`, `padre2`, `file`, `utente`, `descrizione`,`dataModifica`, `branch`) VALUES (?,?,?,?,?,?," + dataModifica + ",?)";

        connection.query(querySQL, [idModifiche, req.session.idCorrente, 'init', result[0].idFile, req.session.nickname, req.body.desc, req.session.branch], function (err, result) {
            if (err) {
                console.log("Errore nell'inserimento del commit: " + err);
            } else {
                console.log("Commit inserito con successo!");
                var fileEliminate = JSON.parse(fs.readFileSync(req.session.eliminate));
                var j2 = JSON.parse(fileData);
                var imgJson = diffJ.caricaJSONPadre(req);
                var jCommit = diffJ.diffJSON(imgJson, j2, fileEliminate, req, res);
                fsPath.writeFile(req.session.repository + '/JSON/' + fileName, JSON.stringify(jCommit, null, '\t'), function (err) {
                    if (err) {
                        console.log("Errore nella scrittura del JSON (Commit): " + err);
                    }
                    setGlobal(req, res);
                });
            }
        })
    });
}

function insertCommitFile(req, res) {
    var nome = req.body.file_json_name;
    var path1 = req.session.repository + "/JSON/" + nome;
    var querySQL = "INSERT INTO `file` (`path`, `nome`, `repository`, `utente`,tipo, `formato`) VALUES (?,?,?,?,?,?)";

    connection.query(querySQL, [path1, nome, req.session.idRepository, req.session.nickname, 'Com', 'json'], function (err, result) {
        if (err) {
            console.log("Errore nell'inserimento del commit nel database (FILE): " + err);
        }
    });
}

function elencoDatiRevG(idRepository, callback) {
    var queryA = "SELECT * FROM revg WHERE repository=?";
    connection.query(queryA, [idRepository], function (err, result) {
        if (err) {
            console.log("Errore selezione repository: " + err);
        }
        else {
            return callback(result);
        }
    });
}


function leggiDatiUtente(nomeutente, callback) {
    var queryA = "SELECT * FROM utenti where nickname=?";
    connection.query(queryA, [nomeutente], function (err, result) {
        if (err) {
            console.log("Errore lettura dati utente: " + err);
        }
        else {
            return callback(result);
        }
    });
}

function modificaDatiUtente(req, callback) {
    var nickname = req.session.nickname;
    var nome = req.body.nome;
    var password = req.body.password;
    var cognome = req.body.cognome;
    var mail = req.body.mail;
    var queryA = "UPDATE utenti SET password=?, nome=?, cognome=?, mail=? WHERE nickname=?";

    connection.query(queryA, [password, nome, cognome, mail, nickname], function (err, result) {
        if (err) {
            console.log("Errore aggiornamento dati utente: " + err);
        }
        else {
            console.log("Dati utente aggiornati con successo!");
            return callback(result);
        }
    });
}

function infoRepo(req, callback) {
    var repo = req.session.idRepository;
    var queryR = "SELECT r.nome, r.descrizione FROM repository r where r.idRepository=?";

    connection.query(queryR, [repo], function (err, result) {
        if (err) {
            console.log("Errore info repository: " + err);
        }
        else {
            return callback(result);
        }
    })
}

function modificaRepo(req, callback) {
    var repo = req.session.idRepository;
    var nome = req.body.nome;
    var descrizione = req.body.descrizione;
    var queryR = "UPDATE repository SET nome=?, descrizione=? WHERE idRepository=?";

    connection.query(queryR, [nome, descrizione, repo], function (err, result) {
        if (err) {
            console.log("Errore nell'aggiornamento dati del repository: " + err);
        }
        else {
            console.log("Repository aggiornato con successo!");
            return callback(result);
        }
    })
}

function elencoUtentiInvito(req, callback) {
    var queryE = "SELECT u.nickname FROM utenti u WHERE u.nickname NOT IN (SELECT p.utente FROM partecipazione p where p.repository=?)";
    connection.query(queryE, [req.session.idRepository], function (err, result) {
        if (err) {
            console.log("Errore elenco utenti invito: " + err);
        }
        else {
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
        }
    })
}

function invitaUtente(req, callback) {
    var utente = req.body.utente;
    var repo = req.session.idRepository;
    var queryU = "INSERT INTO `partecipazione` (`utente`, `repository`, `diritto`) VALUES (?,?,?)";
    connection.query(queryU, [utente, repo, '1'], function (err, result) {
        if (err) {
            console.log("Errore inserimento utente in partecipazione: " + err);
        }
        else {
            return callback(result);
        }
    })
}

function verificaAdmin(req, callback) {
    var utente = req.session.nickname;
    var repo = req.session.idRepository;
    var queryV = "SELECT p.diritto FROM partecipazione p WHERE p.utente=? and p.repository=?";

    connection.query(queryV, [utente, repo], function (err, result) {
        if (err) {
            console.log("Errore nella verifica dell'admin: " + err);
        }
        else {
            return callback(result);
        }
    });
}

function elencoUtentiElimina(req, callback) {
    var repo = req.session.idRepository;
    var queryE = "SELECT p.utente FROM partecipazione p WHERE p.diritto!=0 and p.repository=?";

    connection.query(queryE, [repo], function (err, result) {
        if (err) {
            console.log("Errore nella selezione dell'utente da eliminare: " + err);
        }
        else {
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
        }
    })
}

function eliminaUtente(req, callback) {
    var utente = req.body.utente;
    var repo = req.session.idRepository;
    var queryU = "DELETE FROM partecipazione WHERE `utente`= ? and`repository`= ?";
    connection.query(queryU, [utente, repo], function (err, result) {
        if (err) {
            console.log("Errore nell'eliminazione dell'utente: " + err);
        }
        else {
            console.log("Utente rimosso con successo!");
            return callback(result);
        }
    })
}

function idRevision(req, res, callback) {
    var queryRev = "SELECT * from commit c where utente = ? order by file desc";
    connection.query(queryRev, [req.session.nickname], function (err, results, fields) {
        if (err) {
            console.log("Errore selezione commit: " + err);
        }
        else {
            return callback(results[0].file);
        }
    });
}

function branchMasterRev(req, idRev, result) {
    var idBranch = Math.random().toString(36).substring(7);
    queryB1 = "INSERT INTO `branch` (`idbranch`,`Revision`, `nome`, `utente`,`repository`) VALUES (?,?,?,?,?)";
    connection.query(queryB1, [idBranch, idRev, 'master', req.session.nickname, req.session.idRepository], function (err, result) {
        if (err) {
            console.log("Errore nell'inserimento del branch master: " + err);
        }
    });

    return idBranch;
}

function branchMasterC(req) {
    var idBranch = Math.random().toString(36).substring(7);
    var name = Math.random().toString(36).substring(7);
    queryB1 = "INSERT INTO `branch` (`idbranch`,`Revision`, `nome`, `utente`,`repository`) VALUES (?,?,?,?,?)"
    connection.query(queryB1, [idBranch, req.session.idCorrente, name, req.session.nickname, req.session.idRepository], function (err, result) {
        if (err) {
            console.log("Errore inserimento branch: " + err);
        }
    });
    req.session.branch = idBranch;
    return idBranch;

}

function datiPadre(req, callback) {
    var queryP = "SELECT padre1 FROM commit where file = ?";
    connection.query(queryP, [req.session.padre], function (err, result) {
        if (err) {
            console.log("Errore selezione dati padre: " + err);
        }
        else {
            req.session.padre = result[0].padre1;
        }
    });
    var queryPath = "Select path, tipo from file where idFile= ?";
    connection.query(queryPath, [req.session.padre], function (err, result) {
        if (err) {
            console.log("errore selezione path e tipo: " + err);
        }
        else {
            req.session.path = result[0].path;
            req.session.tipo = result[0].tipo;
            return callback(req);
        }
    })
}

function setGlobal(req, res) {
    var queryC = "Select * from revg where Utente = ? order by dataModifica desc;";
    connection.query(queryC, [req.session.nickname], function (err, result) {
        if (err) {
            console.log("Errore seleziona dati dal RevG (setGlobal): " + err);
        }
        else {
            req.session.branch = result[0].branch;
            req.session.idCorrente = result[0].ID;
            req.session.tipo = result[0].tipo;
            req.session.path = result[0].path;
            req.session.eliminate = req.session.repository + "/Eliminate/" + req.session.idCorrente + ".json";
            res.write(toString(req.session.branch));
            res.write(toString(req.session.idCorrente));
            res.write(toString(req.session.tipo));
            res.write(toString(req.session.path));
            res.write(toString(req.session.eliminate));
            successo = true;
            res.write(toString(successo));
            res.end()
        }
    });
}


function setGlobal2(req, res, results) {
    req.session.branch = branchMasterRev(req, results);
    var queryC = "Select * from revg where Utente = ? order by dataModifica desc;";
    connection.query(queryC, [req.session.nickname], function (err, result) {
        if (err) {
            console.log("Errore selezione dati RevG (setGlobal2): " + err);
        }
        else {
            req.session.idCorrente = result[0].ID;
            req.session.tipo = result[0].tipo;
            req.session.path = result[0].path;
            req.session.eliminate = req.session.repository + "/Eliminate/" + req.session.idCorrente + ".json";
            res.write(toString(req.session.idCorrente));
            res.write(toString(req.session.tipo));
            res.write(toString(req.session.path));
            res.write(toString(req.session.branch));
            res.write(toString(req.session.eliminate));
            res.end();
        }
    });
}

function saveMerge(path, req, res, fileData, fileName) {

    var idModifiche = Math.random().toString(36).substring(7);
    queryV = "Select * from file f where f.repository = ?  order by idFile desc";
    connection.query(queryV, [req.session.idRepository], function (err, result, fields) {
        if (err) {
            console.log("Errore selezione dati per saveMerge: " + err);
        }
        else {
            var d = new Date();
            var anno = d.getFullYear();
            var mese = d.getMonth() + 1;
            var giorno = d.getDate();
            var ora = d.getHours();
            var minuto = d.getMinutes();
            var secondo = d.getSeconds();
            const dataModifica = "'" + anno + "-" + mese + "-" + giorno + " " + ora + ":" + minuto + ":" + secondo + "'";
            querySQL = "INSERT INTO `commit` (`idModifiche`, `padre1`, `padre2`, `file`, `utente`, `descrizione`,`dataModifica`, `branch`) VALUES (?,?,?,?,?,?," + dataModifica + ",?)";
            connection.query(querySQL, [idModifiche, req.session.idCorrente, req.session.padre2, result[0].idFile, req.session.nickname, '', req.session.branch], function (err, result) {
                if (err) {
                    console.log("Errore inserimento nella tabella commit: " + err);
                } else {
                    idRevision(req, res, function (results) {
                        req.session.branch = branchMasterRev(req, results);
                        var fileEliminate = { eliminate: [] };
                        req.session.eliminate = path + "/Eliminate/" + results + ".json";
                        fsPath.writeFile(req.session.eliminate, JSON.stringify(fileEliminate, null, "\t"), function (err) {
                            if (err) {
                                console.log("Errore nella scrittura dell'eliminate: " + err)
                            }
                        });
                        setGlobal2(req, res, results);
                    });
                }
            })
        }
    });
}

function insertMergeFile(req, res) {
    var nome = req.body.nomeFile;
    var path1 = req.session.repository + "/JSON/" + nome;
    var querySQL = "INSERT INTO `file` (`path`, `nome`, `repository`, `utente`,tipo, `formato`) VALUES (?,?,?,?,?,?);";
    connection.query(querySQL, [path1, nome, req.session.idRepository, req.session.nickname, 'Mer', 'json'], function (err, result) {
        if (err) {
            console.log("Errore inserimento merge (file): " + err);
        }
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
exports.branchMasterC = branchMasterC;
exports.datiPadre = datiPadre;
exports.insertMergeFile = insertMergeFile;
exports.saveMerge = saveMerge;