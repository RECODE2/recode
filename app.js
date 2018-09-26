const express = require('express');
const port = process.env.PORT || 8081;
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const ConnessioneDB = require('./Backend/query');
const Filesaver = require('filesaver');
const fsPath = require('fs-path');
const fs = require('fs');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var morgan = require('morgan');
var nomeUtente = "";
var carica = require('./carica.js');

// *** Configurazione dati per GitHub ***
var Github = require('github-api');
var github = new Github({
  username: "recode18",
  password: "Sfinge123",
});
var user = github.getUser();
var repo;

// *** DATABASE ***
//ConnessioneDB.usaDB();
ConnessioneDB.creaConnessione();
app.use(session({
  resave: true,
  secret: 'stringacasualepercrittografareilcookie',
  saveUninitialized: true
}));
app.use(flash());
app.use(bodyParser.urlencoded({ limit: '80mb', extended: true }));
app.use(bodyParser.json({ limit: '80mb' }));
app.use(cors());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.static(__dirname));
app.listen(port, function () {
});

//READ EJS ENGINE
app.set('view engine', 'ejs');

//SET PAGINA INIZIALE
app.get('*', (req, res) => {
  if (!req.session.nickname) {
    nomeUtente = "Guest";
  }
  else {
    nomeUtente = req.session.nickname;
  }
  res.render('index', {
    username: nomeUtente,
    repository: req.session.nameRepository,
    branch: req.session.branch
  });
});

app.post('/logout', function (req, res) {
  req.session.destroy();
  res.send();
});

app.post('/login', function (req, res) {
  ConnessioneDB.login(req, function (result) {
    var successo = false;
    if (result) {
      successo = true;
      req.session.nickname = result.nickname;
      req.session.mail = result.mail;
      if (req.body.remember) {
        req.session.cookie.maxAge = 1000 * 60 * 3;
      } else {
        req.session.cookie.expires = false;
      }
    }
    res.send(successo);
  });
});

app.post('/registrazione', function (req, res) {
  ConnessioneDB.registrazione(req, function (result, err) {
    var successo = "";
    if (result) {
      successo = "ok";
    }
    else {
      if (err.toString().includes("ER_DUP_ENTRY")) {
        successo = "errore chiave";
      }
      else {
        successo = "errore";
      }
    }
    res.send(successo);
  });
});

app.post('/creaRepository', function (req, res) {
  ConnessioneDB.insertRepository(req, function (result) {
    var successo = false;
    if (result) {
      successo = true;
    }
    res.send(successo);
  });

  ConnessioneDB.inserisciDatiRepo(req, res, function (result) {
    /**
     * Quando l'utente crea un repository, verrà creata automaticamente
     * la cartella JSON all'interno del sistema centralizzato ./Server/idRepo/.
     * All'interno della repo su github invece verrà creato un file
     * README.md ed un file info.txt
     */

    idRepository = result.idRepository;
    var pathR = "./Server/" + result.idRepository;
    ConnessioneDB.partecipazioneRepo(req, idRepository);

    var filesaver = new Filesaver({ safenames: true });

    req.session.branch = ConnessioneDB.branchMaster(req, idRepository);

    filesaver.folder('JSON', pathR + "/JSON", function (err, data) {
      if (err) {
        console.log("Errore creazione cartella JSON: " + err);
      }
    });

    user.createRepo({ "name": idRepository }, function (err, res) {
      if (err) {
        console.log("Errore creazione Repo su GitHub: " + err);
      }
    });
    repo = github.getRepo('recode18', idRepository);

    var options = {
      author: { name: req.session.nickname, email: req.session.mail },
      committer: { name: 'recode18', email: 'davide300395@gmail.com' },
      encode: true
    }

    repo.writeFile('master', 'readme.md', req.body.readme, 'readme creato', options, function (err) {
      if (err) {
        console.log("Errore creazione readme.md: " + err);
      }
      else {
        console.log("Readme creato!");
      }
    })

    var help = `Momentaneamente le revisioni sono disponibili come dataURL (base64). \n
                Puoi utilizzare normalmente i comandi git per tornare a vecchie versioni 
                delle immagini. \n
                Le puoi visualizzare utilizzando un qualsiasi convertitore online (base64 to Image), 
                ad esempio: https://codebeautify.org/base64-to-image-converter
                Puoi salvare l'immagine nel formato desiderato ed avere a disposizione la revisione.`

    repo.writeFile('master', 'info.txt', help, 'readme creato', options, function (err) {
      if (err) {
        console.log("Errore creazione info.txt: " + err);
      }
      else {
        console.log("Help creato!");
      }
    })

  });
});

app.post('/elencoRepo', function (req, res) {
  ConnessioneDB.elencoRepo(req, function (result) {
    res.send(result);
  })
});

app.post('/settaRepo', function (req, res) {
  req.session.nameRepository = req.body.nomeRepo;
  ConnessioneDB.settaDatiRepo(req, res, function (result) {
    req.session.repository = "./Server/" + result;
    req.session.idRepository = result;
    repo = github.getRepo('recode18', req.session.idRepository);
    res.write(res.toString(req.session.repository));

    ConnessioneDB.setIdBranchMaster(req, res, function (result) {
      req.session.branch = result;
      res.write(res.toString(req.session.branch));
      res.end()
    });
  });
});

/**
 * Quando l'utente effettua un ADD REVISION viene creato il JSON
 * sul sistema centralizzato. Sul sistema distribuito (GitHub) viene
 * effettuato il commit della revisione.
 */
app.post('/addRevision', function (req, res) {
  var nomedelfile = req.body.file_json_name;
  var dataFile = req.body.file_json_data;
  dataFile = JSON.parse(dataFile);
  dataFile.info.layer_active = 1;
  dataFile.layers[0].id = 1;
  dataFile.layers[0].order = 1;
  if (dataFile.layers[0].type == "image") {
    dataFile.data[0].id = 1;
  }

  var img = req.body.file_jpeg_data;
  var data = img.replace(/^data:image\/(jpeg);base64,/, '');
  var buf = new Buffer(data, 'base64');
  var percorsoRepo = req.session.repository;
  var nomeFile = req.body.file_jpeg_name;
  var successo = false;

  //JSON
  fsPath.writeFile(percorsoRepo + '/JSON/' + nomedelfile, JSON.stringify(dataFile, null, '\t'), function (err) {
    if (err) {
      console.log("Errore scrittura JSON " + err);
    }
  });


  //JPG (su GITHUB)
  var options = {
    author: { name: req.session.nickname, email: req.session.mail },
    committer: { name: 'recode18', email: 'davide300395@gmail.com' },
    encode: true, // Whether to base64 encode the file. (default: true)
    //date: variabiledata
  }
  stringaIMG = buf.toString('base64'); //STRINGA FUNZIONANTE...

  repo.writeFile('master', 'revision.txt', stringaIMG, 'Revision creata', options, function (err) {
    if (err) {
      console.log("Errore..." + err);
    }
    else {
      console.log("Commit creato..");
    }
  });

  ConnessioneDB.settaDatiRepo(req, res, function (result) {
    ConnessioneDB.insertAddRevision(percorsoRepo, req, res, result);
  });

});


app.post('/branch', function (req, res) {
  ConnessioneDB.newBranch(req, res);
});


app.post('/commit', function (req, res) {
  fileName1 = req.body.file_json_name;
  fileData = req.body.file_json_data;
  ConnessioneDB.insertCommitFile(req, res);
  ConnessioneDB.saveCommit(req, res, fileData, fileName1);
})


app.post('/revg', function (req, res) {
  var repoAttuale = req.session.idRepository;
  ConnessioneDB.elencoDatiRevG(repoAttuale, function (result) {
    res.send(result);
  });
});

app.post('/controllaselezionerepo', function (req, res) {
  var repo = false;
  if (req.session.idRepository) {
    repo = true;
  }
  res.send(repo);
});

app.post('/leggidatiutente', function (req, res) {
  var nomeUtente = req.session.nickname;
  ConnessioneDB.leggiDatiUtente(nomeUtente, function (result) {
    res.send(result);
  });
});

app.post('/modificadatiutente', function (req, res) {
  ConnessioneDB.modificaDatiUtente(req, function (result) {
    var successo = false;
    if (result) {
      successo = true;
    }
    res.send(successo);
  });
});

app.post('/infoRepo', function (req, res) {
  ConnessioneDB.infoRepo(req, function (result) {
    res.send(result);
  })
});

app.post('/modificaRepo', function (req, res) {
  ConnessioneDB.modificaRepo(req, function (result) {
    var successo = false;
    if (result) {
      successo = true;
      req.session.nameRepository = req.body.nome;
    }
    res.send(successo);
  })
});

app.post('/elencoUtentiInvito', function (req, res) {
  ConnessioneDB.elencoUtentiInvito(req, function (result) {
    res.send(result);
  })
});

app.post('/invitaUtente', function (req, res) {
  ConnessioneDB.invitaUtente(req, function (result) {
    var successo = false;
    if (result) {
      successo = true;
    }
    res.send(successo);
  })
});

app.post('/verificaAdmin', function (req, res) {
  ConnessioneDB.verificaAdmin(req, function (result) {
    var admin = false;
    if (result[0].diritto == 0) {
      admin = true;
    }
    res.send(admin);
  })
});

app.post('/elencoUtentiElimina', function (req, res) {
  ConnessioneDB.elencoUtentiElimina(req, function (result) {
    res.send(result);
  })
});

app.post('/eliminaUtente', function (req, res) {
  ConnessioneDB.eliminaUtente(req, function (result) {
    var successo = false;
    if (result) {
      successo = true;
    }
    res.send(successo);
  })
});

app.post('/readjson', function (req, res) {
  req.session.branch = req.body.branch;
  req.session.idCorrente = req.body.idCorrente;
  req.session.tipo = req.body.tipo;
  req.session.path = req.body.path;
  req.session.padre = req.body.idCorrente;
  req.session.eliminate = req.session.repository + "/Eliminate/" + req.session.idCorrente + ".json";
  if (req.session.tipo == "Rev") {
    req.session.branch = ConnessioneDB.branchMasterC(req);
    console.log(req.session.branch);
  }
  res.send(req.session.branch);
});

app.post('/caricaImmagine', function (req, res) {
  var imgJson = JSON.parse(fs.readFileSync(req.session.path));
  req.session.json = imgJson;
  if (req.session.tipo == "Rev" || req.session.tipo == "Mer") {
    res.send(req.session.json);
  } else if (req.session.tipo == "Com") {
    console.log("Click..");
    req.session.fileEliminate = JSON.parse(fs.readFileSync(req.session.repository + "/Eliminate/" + req.session.idCorrente + ".json"));
    loop(req, res);
  }
});

app.post('/readJsonMerge', function (req, res) {
  var imgJson = JSON.parse(req.body.mergeJson);
  console.log(JSON.stringify(imgJson, null, '\t'));
  res.send(imgJson);
});



app.post('/merge', function (req, res) {
  req.session.branch = req.body.branch;
  req.session.idCorrente = req.body.idCorrente;
  req.session.padre = req.body.idCorrente;
  req.session.idCorrente2 = req.body.idCorrente2;
  req.session.padre2 = req.body.idCorrente2;

  var nomedelfile = req.body.nomeFile;
  var dataFile = req.body.jsonMerge;
  var percorsoRepo = req.session.repository;

  //JSON
  fsPath.writeFile(percorsoRepo + '/JSON/' + nomedelfile, JSON.stringify(dataFile, null, '\t'), function (err) {
    if (err) {
      console.log("Errore scrittura JSON " + err);
    }
  });

  ConnessioneDB.insertMergeFile(req, res); //OK!
  ConnessioneDB.saveMerge(percorsoRepo, req, res, dataFile, nomedelfile);
});

app.post('/idRepo', function (req, res) {
  var idRepo = req.session.idRepository;
  res.send(""+idRepo);
});

function loop(req, res) {
  ConnessioneDB.datiPadre(req, function (req) {
    if (req.session.tipo == "Com") {
      console.log(req.session.path + "Stampa del percorso");
      var jsonPadre = JSON.parse(fs.readFileSync(req.session.path));
      req.session.json = carica.caricaImmagine(req.session.json, jsonPadre, req.session.fileEliminate);
      loop(req, res);
    }
    else {
      var jsonPadre = JSON.parse(fs.readFileSync(req.session.path));
      req.session.json = carica.caricaImmagine(req.session.json, jsonPadre, req.session.fileEliminate);
      res.send(req.session.json);
      return;
    }
  })
}



module.exports = app;