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
var promisify = require("promisify-node");
var fse = promisify(require("fs-extra"));
var fileName = "README.md";
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var morgan = require('morgan');
var nomeUtente = "";
var carica = require('./carica.js');
var AWS = require('aws-sdk');
const USER = 'recode18';
const PASS = 'Sfinge123';
var Github = require('github-api');

var github = new Github({
  username: "recode18",
  password: "Sfinge123",
});


var user = github.getUser();
var repo;


AWS.config = new AWS.Config();
AWS.config.accessKeyId = "AKIAIB7K4DL52XI3AKLA";
AWS.config.secretAccessKey = "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";


var s3Bucket = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {
    Bucket: 'recode18'
  }
})

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

  /**
   * INSERISCI COSA SUCCEDE CON GIT...
   * git init + creazione file readme.md + git commit + git add
   */

  ConnessioneDB.insertRepository(req, function (result) {
    var successo = false;
    if (result) {
      successo = true;
    }
    res.send(successo);
  });

  ConnessioneDB.inserisciDatiRepo(req, res, function (result) {
    idRepository = result.idRepository;
    ConnessioneDB.partecipazioneRepo(req, idRepository);

    //Quando si crea la repository, saranno create le cartelle (vuote inizialmente) IMMAGINI e JSON
    var params = {
      Key: idRepository + "/Immagini/",
      Body: ""
    }
    s3Bucket.upload(params, function (err, data) {
      if (err) {
        console.log("Errore s3 creazione cartella: " + params.Key + "  ... errore: " + err);
      }
    });

    req.session.branch = ConnessioneDB.branchMaster(req, idRepository);

    var params = {
      Key: idRepository + "/JSON/",
      Body: ""
    }
    s3Bucket.upload(params, function (err, data) {
      if (err) {
        console.log("Errore s3 creazione cartella: " + params.Key + "  ... errore: " + err);
      }
    });


    user.createRepo({"name": idRepository}, function(err, res) {});

    repo = github.getRepo('recode18', idRepository);


    //var fileContent = req.body.readme;
    var options = {
      author: {name: req.session.nickname, email: req.session.mail},
      committer: {name: 'recode18', email: 'davide300395@gmail.com'},
      encode: true // Whether to base64 encode the file. (default: true)
    }

    repo.writeFile('master','readme.md',req.body.readme,'readme creato',options, function(err){
      if(err){
        console.log("Errore..."+err);
      }
      else{
        console.log("Commit creato..");
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
    req.session.repository = result;
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

  //var immagineGit = req.body.file_jpeg_data.replace(/^data:image\/jpeg;base64,/,"");
  var img = req.body.file_jpeg_data;
  var data = img.replace(/^data:image\/(jpeg);base64,/,'');
  var buf = new Buffer(data, 'base64');
  var percorsoRepo = req.session.repository;
  var nomeFile = req.body.file_jpeg_name;
  var successo = false;

  //JSON
  var params = {
    Key: percorsoRepo + '/JSON/' + nomedelfile,
    Body: JSON.stringify(dataFile, null, '\t'),
  }

  s3Bucket.upload(params, function (err, data) {
    if (err) {
      console.log("Errore s3 upload del file: " + params.Key + "  ... errore: " + err);
    }
  });

  s3Bucket.getObject(params, function (err, data) {
    console.log("parametri.. " + params.Key);
  });

  //JPG
  var params = {
    Key: percorsoRepo + "/Immagini/" + nomeFile,
    Body: buf
  }
  s3Bucket.upload(params, function (err, data) {
    if (err) {
      console.log("Errore s3 upload del file: " + params.Key + "  ... errore: " + err);
    }
    else{

  var paramsX = {
    Bucket: 'recode18',
    Key: percorsoRepo+"/Immagini/"+nomeFile,
  }

  s3Bucket.getObject(paramsX,function(err,data){
    if(err){
      console.log("Errore s3 lettura del file: " + params.Key + "  ... errore: " + err);
    }
    else{
      var options = {
        author: {name: req.session.nickname, email: req.session.mail},
        committer: {name: 'recode18', email: 'davide300395@gmail.com'},
        encode: true,
        // Whether to base64 encode the file. (default: true)
        //inserisci la data...
        //date: variabiledata
      }
    
       //repo = github.getRepo('recode18',idRepository);
    
      //var test = repo.createBlob(buf,function(){});
      //var utf8encoded = (new Buffer(data, 'base64')).toString('utf8');
    
      //Invece di revision creata passagli la descrizione (desc)
      //var utf8encoded = new Buffer(data,'base64').toString('utf8');

      stringaIMG = buf.toString('base64'); //STRINGA FUNZIONANTE...
     // var immagineGit2 = 'data:image/jpeg;charset=utf-8;base64, '+immagineGit;

     // var dataX = Buffer.from(data.toString('binary'),'base64');
      //var blob = new Blob([req.body.file_jpeg_data], {type: 'image/jpeg'});
      //var dataX = Buffer.from(buf,'base64');

/*         repo.createBlob(buf,function(err,res){
        if(err){
          console.log("errore...."+err);
        }
        else{
          console.log("Blob creato..");
          console.log("res: "+JSON.stringify(res));
        }
      });  */

        repo.writeFile('master','revision.jpeg',stringaIMG,'Revision creata',options, function(err){
        if(err){
          console.log("Errore..."+err);
        }
        else{
          console.log("Commit creato..");
        }
      });
    }
  })
    }
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
  var params = {
    Bucket: 'recode18',
    Key: req.session.path,
  }

  s3Bucket.getObject(params, function (err, data) {
    if (err) {
      console.log("Errore s3 lettura del file: " + params.Key + "  ... errore: " + err);
    }
    else {
      //var imgJson = JSON.parse(fs.readFileSync(req.session.path));
      req.session.json = JSON.parse(data.Body.toString());
      if (req.session.tipo == "Rev" || req.session.tipo == "Mer") {
        res.send(req.session.json);
      } else if (req.session.tipo == "Com") {
        console.log("AAAA");

        var params = {
          Bucket: 'recode18',
          Key: req.session.repository + "/Eliminate/" + req.session.idCorrente + ".json",
        }

        s3Bucket.getObject(params, function (err, data1) {
          if (err) {
            console.log("Errore s3 lettura del file: " + params.Key + "  ... errore: " + err);
          }
          else {
            req.session.fileEliminate = JSON.parse(data1.Body.toString());
            loop(req, res);
          }
        })
      }
    }
  })


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

  console.log("BRANCH NEL MERGE.. " + req.body.branch);

  //JSON
  var params = {
    Key: percorsoRepo + '/JSON/' + nomedelfile,
    Body: JSON.stringify(dataFile, null, '\t')
  }

  s3Bucket.upload(params, function (err, data) {
    if (err) {
      console.log("Errore s3 upload del file: " + params.Key + "  ... errore: " + err);
    }
  });

  /*   fsPath.writeFile(percorsoRepo + '/JSON/' + nomedelfile, JSON.stringify(dataFile, null, '\t'), function (err) {
      if (err) {
        console.log("Errore scrittura JSON " + err);
      }
    }); */

  ConnessioneDB.insertMergeFile(req, res); //OK!
  ConnessioneDB.saveMerge(percorsoRepo, req, res, dataFile, nomedelfile);


  //CORREGGI QUESTO PER CREARE NUOVO BRANCH....

  /*  req.session.branch = ConnessioneDB.branchMasterC(req);
   console.log(req.session.branch); */
});
//FUNZIONI



function loop(req, res) {
  ConnessioneDB.datiPadre(req, function (req) {

    var params = {
      Bucket: 'recode18',
      Key: req.session.path,
    }

    s3Bucket.getObject(params, function (err, data) {
      if (err) {
        console.log("Errore s3 lettura del file: " + params.Key + "  ... errore: " + err);
      }
      else {
        if (req.session.tipo == "Com") {
          console.log(req.session.path + "Stampa del percorso");
          var jsonPadre = JSON.parse(data.Body.toString());
          req.session.json = carica.caricaImmagine(req.session.json, jsonPadre, req.session.fileEliminate);
          loop(req, res);
        } else {
          var jsonPadre = JSON.parse(data.Body.toString());
          req.session.json = carica.caricaImmagine(req.session.json, jsonPadre, req.session.fileEliminate);
          res.send(req.session.json);
          return;
        }
      }
    })


  })
}





module.exports = app;
