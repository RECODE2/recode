const express = require('express');
const path = require('path');
const port = process.env.PORT || 8081;
const cors = require('cors');
const app = express();
const mysql = require('mysql');
const dbconfig = require('./Backend/database');
const bodyParser = require('body-parser');
const ConnessioneDB = require('./Backend/query');
const Filesaver = require('filesaver');
const fsPath = require('fs-path');
var nodegit = require('./node_modules/nodegit');
var addLfs = require('./node_modules/nodegit-lfs');
var promisify = require("promisify-node");
var fse = promisify(require("fs-extra"));
var fileName = "README.md";
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var morgan = require('morgan');
var nomeUtente = "";
var fs = require('fs');
var carica = require('./carica.js');


//chiamiamo la funzione ritornata da nodegit-lfs con nodegit come parametro
addLfs(nodegit);

//dopo che è stato argomentato nodegit, possiamo utilizzare LFS tramite l'oggetto LFS
nodegit.LFS.register()
  .then(() => {
    console.log('The LFS filter has been registered!');
  });

// *** DATABASE ***
// creiamo la connessione al database ed utilizziamo il db 'vit'
mysql.createConnection(dbconfig.connection);
ConnessioneDB.creaConnessione();
ConnessioneDB.usaDB();
app.use(session({
  resave: true,
  secret: 'stringacasualepercrittografareilcookie',
  saveUninitialized: true
}));
app.use(flash());
//SET APP
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

//GESTIONE COOKIE




//SET PAGINA INIZIALE
app.get('*', (req, res) => {
  //res.sendFile(path.resolve(__dirname, 'index.html'));
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

// *** LATO BACKEND ***


// *** LOGOUT
app.post('/logout', function (req, res) {
  req.session.destroy();
  res.send();
});

// *** LOGIN
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
/*
app.post('/login', function(req, res){
  console.log(req.session.nickname);
  ConnessioneDB.datiUtente(req,function(result){
    console.log(result.mail + "PIPPO");
    req.session.mail = result.mail;
    console.log(req.session.mail);
  });
});*/


// REGISTRAZIONE NEGLIA MANTELLINI
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

  var repository;
  var index;

  ConnessioneDB.inserisciDatiRepo(req, res, function (result) {
    idRepository = result.idRepository;
    var pathR = "./Server/" + result.idRepository;
    ConnessioneDB.partecipazioneRepo(req, idRepository);
    var repoDir = pathR + "/.git";
    fse.ensureDir(path.resolve(__dirname, repoDir))
    .then(function () {
      //Inseriamo la repository sul DB
      //Creiamo la cartella .git all'interno della repository
      return nodegit.Repository.init(path.resolve(__dirname, repoDir), 0);
    }).then(function (repo) {
      repository = repo;
      var fileContent = req.body.readme;
      /*
     / Emuliamo il comportamento di GIT LFS TRACK "*.jpg"
     / andando a creare il file .gitattributes al cui interno ci sarà la stringa:
     / *.jpg filter=lfs diff=lfs merge=lfs -text
     / (stringa che avremmo avuto andando ad effettuare il comando git lfs track "*.jpg")
     */
      fse.writeFile(path.join(repository.workdir(), ".gitattributes"), "*.jpg filter=lfs diff=lfs merge=lfs -text");

      //aggiungiamo il file README.MD all'interno della working directory
      return fse.writeFile(path.join(repository.workdir(), fileName), fileContent);
    }).then(function () {
      return repository.refreshIndex();
    })
      .then(function (idx) {
        index = idx;
      })
      .then(function () {
        return index.addByPath(fileName);
      })
      .then(function () {
        return index.write();
      })
      .then(function () {
        return index.writeTree();
      })
      .then(function (oid) {

        var dataOdierna = new Date().getTime() / 1000;

        //in author e in committer si scrive: nome, email, data, GMT
        //abbiamo scritto 120 in quanto è GMT +2 (i minuti in più rispetto al meridiano di Greenwich)
        var author = nodegit.Signature.create(req.session.nickname, req.session.mail, dataOdierna, 120);

        var committer = nodegit.Signature.create(req.session.nickname, req.session.mail, dataOdierna, 120);

        return repository.createCommit("HEAD", author, committer, "Readme creato", oid, []);
      }).then(function (commitId) {
        console.log("Commit readme: " + commitId);
      });


    //Quando si crea la repository, saranno create le cartelle (vuote inizialmente) IMMAGINI e JSON
    var filesaver = new Filesaver({ safenames: true });

    filesaver.folder('Immagini', pathR + "/Immagini", function (err, data) {
      if (err) {
        console.log("Errore " + err);
      }
    });
    req.session.branch = ConnessioneDB.branchMaster(req, idRepository);

    filesaver.folder('JSON', pathR + "/JSON", function (err, data) {
      if (err) {
        console.log("Errore " + err);
      }
    });
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
    res.write(res.toString(req.session.repository));

    ConnessioneDB.setIdBranchMaster(req, res, function (result) {
      req.session.branch = result;
      res.write(res.toString(req.session.branch));
      res.end()
    });
  });
});


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
  var data = img.replace(/^data:image\/\w+;base64,/, "");
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
  
  
  //JPG
  /**
  * GIT ADD AND COMMIT (ADD REVISION)
  */
  var repo;
  var oid;
  var index;

  nodegit.Repository.open(path.resolve(__dirname, percorsoRepo + "/.git"))
    .then(function (repoResult) {
      repo = repoResult;
    }).then(function () {

      //ADD FILE
      return fse.writeFile(percorsoRepo +"/Immagini/" + nomeFile, buf, function (err) {
        if (err) {
          console.log("Errore scrittura JPG " + err);
        }
      });
    })
    .then(function () {
      return repo.refreshIndex();
    })
    .then(function (indexResult) {
      index = indexResult;
    })
    .then(function () {
      return index.writeTree();
    })
    .then(function(oidResult) {
      oid = oidResult;
      return nodegit.Reference.nameToId(repo, "HEAD");
    })
    .then(function(head) {
      return repo.getCommit(head);
    })
    .then(function (parent) {
      var dataOdierna = new Date().getTime() / 1000;

      var author = nodegit.Signature.create(req.session.nickname, req.session.mail, dataOdierna, 120);

      var committer = nodegit.Signature.create(req.session.nickname, req.session.mail, dataOdierna, 120);

      //COMMIT
      return repo.createCommit("HEAD", author, committer, "Immagine creata... ", oid, [parent]);
    })
    .done(function (commitId) {
      console.log("Commit add revision: ", commitId);
    });
  ConnessioneDB.settaDatiRepo(req, res, function (result) {
    ConnessioneDB.insertAddRevision(percorsoRepo, req, res, result);
  });
  successo = true;
  res.write(toString(successo));
});

/*
Da save.js prendiamo il nome del file e andiamo a creare una cartella
sul desktop.. (è giusto un tentativo per dimostrare il passaggio da frontend
a backend tramite ajax)
*/
app.post('/branch', function (req, res) {

  //console.log("Hai creato il branch" + req.body.nameBranch);

  ConnessioneDB.newBranch(req, res);

});

// FINE MODIFICHE DAVIDE MANTELLINI

//INIZIO MODIFICHE COMMIT DM
app.post('/commit', function (req, res) {
  fileName1 = req.body.file_json_name;
  fileData = req.body.file_json_data;
  //INSERIRE QUI LA FUNZIONE diffJSON non appena avrò il caricamento file col REVG
  ConnessioneDB.insertCommitFile(req, res);
  ConnessioneDB.saveCommit(req, res, fileData, fileName1);



})
//FINE MODIFICHE COMMIT DM


// REVISION GRAPH VESTITA
app.post('/revg', function (req, res) {

  var repoAttuale = req.session.idRepository;
  // console.log("Repo attuale: " + repoAttuale);
  ConnessioneDB.elencoDatiRevG(repoAttuale, function (result) {
    res.send(result);
  });
});

// CONTROLLA SELEZIONE REPO VESTITA
// (Controlliamo se è stata selezionata la repo prima di aprire il revg)
app.post('/controllaselezionerepo', function (req, res) {
  var repo = false;
  if (req.session.idRepository) {
    repo = true;
    //console.log("La repo è stata selezionata");
  }
  res.send(repo);
});

// LEGGI DATI UTENTE VESTITA
app.post('/leggidatiutente', function (req, res) {
  var nomeUtente = req.session.nickname;
  //console.log("Utente attuale: " + nomeUtente);
  ConnessioneDB.leggiDatiUtente(nomeUtente, function (result) {
    res.send(result);
  });
});

// MODIFICA DATI UTENTE VESTITA
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
    console.log("AAAA");
    req.session.fileEliminate = JSON.parse(fs.readFileSync(req.session.repository + "/Eliminate/" + req.session.idCorrente + ".json"));
    loop(req, res);
  }
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

  ConnessioneDB.insertMergeFile(req,res); //OK!
  ConnessioneDB.saveMerge(percorsoRepo,req,res,dataFile,nomedelfile);


  //CORREGGI QUESTO PER CREARE NUOVO BRANCH....

 /*  req.session.branch = ConnessioneDB.branchMasterC(req);
  console.log(req.session.branch); */
});
//FUNZIONI



function loop(req, res) {
  ConnessioneDB.datiPadre(req, function (req) {
    if (req.session.tipo == "Com") {
      console.log(req.session.path + "Stampa del percorso");
      var jsonPadre = JSON.parse(fs.readFileSync(req.session.path));
      req.session.json = carica.caricaImmagine(req.session.json, jsonPadre, req.session.fileEliminate);
      loop(req, res);
    } else {
      var jsonPadre = JSON.parse(fs.readFileSync(req.session.path));
      req.session.json = carica.caricaImmagine(req.session.json, jsonPadre, req.session.fileEliminate);
      res.send(req.session.json);
      return;
    }
  })
}





module.exports = app;
