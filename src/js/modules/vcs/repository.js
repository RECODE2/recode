import Dialog_class from "../../libs/popup";
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';
import host from './../../host.js';
import File_open_class from "./../file/open.js";
import Base_layers_class from './../../../js/core/base-layers';

var moment = require('moment');
var cytoscape = require('cytoscape');
var cydagre = require('cytoscape-dagre');
var dagre = require('dagre');
cytoscape.use(cydagre, dagre);


/**
 * In questa classe ci sono le seguenti funzionalità:
 * - crea repository
 * - elenco (scegli) repository
 * - modifica repository
 * - revision graph 
 * - invita utente
 * - elimina utente
 */

class VCS_class {
    constructor() {
        this.POP = new Dialog_class(); //libreria popup
    }

    creaRepository() {
        this.POP.hide();
        var settings = {
            title: 'Crea repository',
            params: [
                { name: "name", title: "Nome repository:", value: "" },
                { name: "readme", title: "Readme:", value: "", type: "textarea" },
            ],
            on_finish: function (params) {
                $.ajax({
                    url: 'http://localhost:8081/creaRepository',
                    type: 'POST',
                    data: {
                        nomeRepo: params.name,
                        readme: params.readme,
                    }
                }).done(function (successo) {
                    if (successo) {
                        alertify.success("Repository creata con successo");
                    }
                    else {
                        alertify.error("ERRORE NELLA CREAZIONE DELLA REPOSITORY");
                    }
                });
            },
        };
        this.POP.show(settings);
        document.getElementById("pop_data_name").select();
    }

    elencoSceltaRepository() {
        $.ajax({
            url: 'http://localhost:8081/elencoRepo',
            type: 'POST',
            success: function (result) {
                if (result.length > 0) {
                    this.POP = new Dialog_class();
                    this.POP.hide();
                    var settings = {
                        title: 'Elenco repository',
                        params: [
                            { name: "name", values: result },
                        ],
                        on_finish: function (params) {
                            $.ajax({
                                url: 'http://localhost:8081/settaRepo',
                                type: 'POST',
                                data: {
                                    nomeRepo: params.name,
                                },
                                success: function () {
                                    alertify.success("Repository settata con successo, ATTENDERE...");
                                    window.setTimeout(function () {
                                        window.location.href = host.name;
                                    }, 2500);
                                }
                            });
                        }
                    };
                    this.POP.show(settings);
                }
                else {
                    alertify.error("ERRORE: attualmente non ci sono repository da visualizzare");
                }
            }
        });
    }

    modificaRepository() {
        this.controllaSelezioneRepo(function (repo) {
            if (repo) {
                $.ajax({
                    url: 'http://localhost:8081/infoRepo',
                    type: 'POST',
                    success: function (result) {
                        if (!result[0].descrizione) {
                            result[0].descrizione = "";
                        }
                        this.POP = new Dialog_class();
                        this.POP.hide();
                        var settings = {
                            title: 'Info repository',
                            params: [
                                { name: "name", title: "Nome repository:", value: result[0].nome },
                                { name: "readme", title: "Readme:", value: result[0].descrizione, type: "textarea" },
                            ],
                            on_finish: function (params) {
                                $.ajax({
                                    url: 'http://localhost:8081/modificaRepo',
                                    type: 'POST',
                                    data: {
                                        nome: params.name,
                                        descrizione: params.readme,
                                    },
                                    success: function (successo) {
                                        if (successo) {
                                            alertify.success("Repository modificata con successo");
                                        }
                                        else {
                                            alertify.error("ERRORE NELLA MODIFICA!");
                                        }
                                    }
                                });
                            }
                        };
                        this.POP.show(settings);
                    }
                });
            }
            else {
                alertify.error("ERRORE: Non hai ancora selezionato la repository!");
            }
        })
    }

    revisionGraph() {
        this.controllaSelezioneRepo(function (repo) {
            if (repo) {
                $.ajax({
                    url: 'http://localhost:8081/revg',
                    type: 'POST',
                    success: function (result) {
                        this.POP = new Dialog_class();
                        this.POP.hide();
                        var open = new File_open_class();
                        var Base_layers = new Base_layers_class();
                        var immagineJson;
                        var node;
                        var settings = {
                            title: 'Revision Graph',
                            on_load: function () {
                                /**
                                * Function created by NEGLIA-VESTITA
                                * This function is used in operazioniVCS.js (Merge)
                                * @param {*} jsonObject 
                                * @param {*} contesto 
                                */
                                function createCanvasForMerge(jsonObject, contesto) {

                                    for (var i in jsonObject.layers) {
                                        var value = jsonObject.layers[i];
                                        var initial_x = null;
                                        var initial_y = null;
                                        if (value.x != null && value.y != null && value.width != null && value.height != null) {
                                            initial_x = value.x;
                                            initial_y = value.y;
                                            value.x = 0;
                                            value.y = 0;
                                        }

                                        if (initial_x != null && initial_x != null) {
                                            value.x = initial_x;
                                            value.y = initial_y;
                                        }

                                        if (value.type == 'image') {
                                            //add image data
                                            value.link = null;
                                            for (var j in jsonObject.data) {
                                                if (jsonObject.data[j].id == value.id) {
                                                    value.data = jsonObject.data[j].data;
                                                }
                                            }
                                            if (value.link == null) {
                                                if (typeof value.data == 'object') {
                                                    //load actual image
                                                    if (value.width == 0)
                                                        value.width = value.data.width;
                                                    if (value.height == 0)
                                                        value.height = value.data.height;
                                                    value.link = value.data.cloneNode(true);

                                                    value.data = null;
                                                }
                                                else if (typeof value.data == 'string') {
                                                    value.link = new Image();
                                                    value.link.onload = function () {
                                                        //render canvas
                                                        for (var i in jsonObject.layers) {
                                                            var value = jsonObject.layers[i];
                                                            contesto.globalAlpha = value.opacity / 100;
                                                            contesto.globalCompositeOperation = value.composition;
                                                            Base_layers.render_object(contesto, value);
                                                        }
                                                    };
                                                    value.link.src = value.data;
                                                }
                                                else {
                                                    alertify.error('Error: can not load image.');
                                                }
                                            }
                                        }
                                        Base_layers.render_object(contesto, value);
                                    }
                                }

                                /* INIZIO REVG */
                                var popupx = document.getElementById('popup');
                                popupx.style.left = "25%";
                                popupx.style.right = "25%";
                                popupx.style.width = "50%";

                                var divRevg = document.createElement('div');
                                document.getElementById('dialog_content').style.height = "500px";
                                divRevg.setAttribute('id', 'cy');
                                divRevg.style.height = "50%";
                                divRevg.style.marginTop = "5px";
                                divRevg.style.position = "relative";
                                divRevg.style.left = "0";
                                divRevg.style.top = "0";
                                divRevg.style.zIndex = "999";
                                divRevg.style.border = "1px solid gray";

                                document.querySelector('#popup #dialog_content').appendChild(divRevg);


                                /* INIZIO PREVIEW MINICANVAS:
                                *  ci saranno due div:
                                *  1) div al cui interno ci sarà un canvas
                                *  2) div al cui interno ci saranno i dettagli del nodo selezionato
                                */
                                var divJSON = document.createElement('div');
                                divJSON.setAttribute('id', 'divjson');
                                divJSON.style.height = "40%";
                                divJSON.style.position = "relative";
                                divJSON.style.marginTop = "5px";

                                var divMinicanvas1 = document.createElement('div');
                                divMinicanvas1.setAttribute('id', 'divminicanvas1');
                                divMinicanvas1.style.height = "100%";
                                divMinicanvas1.style.width = "50%";
                                divMinicanvas1.style.border = "1px solid gray";
                                divMinicanvas1.style.cssFloat = "left";


                                var divDettagliNodo = document.createElement('div');
                                divDettagliNodo.setAttribute('id', 'divdettaglinodo');
                                divDettagliNodo.style.height = "100%";
                                divDettagliNodo.style.width = "50%";
                                divDettagliNodo.style.border = "1px solid gray";
                                divDettagliNodo.style.cssFloat = "left";

                                //create temp canvas
                                var canvas = document.createElement('canvas');
                                canvas.setAttribute('id', 'minicanvas1');
                                var ourctx = canvas.getContext("2d");
                                //	var ctx = canvas.getContext("2d");
                                canvas.width = "800";
                                canvas.height = "600";

                                var titoloInformazioni = document.createElement('p');
                                titoloInformazioni.setAttribute('align', 'center');
                                titoloInformazioni.style.fontWeight = "bold";
                                titoloInformazioni.innerHTML = "Informazioni nodo selezionato:";

                                //creo l'elenco delle proprietà
                                var elencoProp = document.createElement('ul');
                                elencoProp.setAttribute('id', 'elencoprop');

                                var idProp = document.createElement('li');
                                idProp.setAttribute('id', 'idprop');

                                var nomeFileProp = document.createElement('li');
                                nomeFileProp.setAttribute('id', 'nomefileprop');

                                var dataModificaProp = document.createElement('li');
                                dataModificaProp.setAttribute('id', 'datamodificaprop');

                                var utenteProp = document.createElement('li');
                                utenteProp.setAttribute('id', 'utenteprop');

                                var tipoProp = document.createElement('li');
                                tipoProp.setAttribute('id', 'tipoprop');

                                var branchProp = document.createElement('li');
                                branchProp.setAttribute('id', 'branchprop');

                                var padre1Prop = document.createElement('li');
                                padre1Prop.setAttribute('id', 'padre1prop');

                                var padre2Prop = document.createElement('li');
                                padre2Prop.setAttribute('id', 'padre2prop');

                                document.querySelector('#popup #dialog_content').appendChild(divJSON);
                                document.querySelector('#popup #dialog_content #divjson').appendChild(divMinicanvas1);
                                document.querySelector('#popup #dialog_content #divjson').appendChild(divDettagliNodo);


                                var cy = cytoscape({
                                    container: document.getElementById('cy'),
                                    boxSelectionEnabled: false,
                                    autounselectify: true,
                                    zoom: 0
                                });

                                cy.style().selector('node').style({
                                    'content': 'data(id)',
                                    'text-opacity': 1,
                                    'text-valign': 'center',
                                    'text-halign': 'center'
                                }).update();

                                cy.style().selector('edge').style({
                                    'curve-style': 'bezier',
                                    'width': 4,
                                    'target-arrow-shape': 'triangle',
                                    'line-color': '#9dbaea',
                                    'target-arrow-color': '#9dbaea'
                                }).update();

                                //NODI
                                for (var i = 0; i < result.length; i++) {
                                    if (result[i].tipo == "Com") {
                                        cy.add({
                                            data: {
                                                id: result[i].ID,
                                                nome: result[i].nomeFile,
                                                tipo: result[i].tipo,
                                                path: result[i].path,
                                                dataModifica: result[i].dataModifica,
                                                padre1: result[i].padre1,
                                                padre2: result[i].padre2,
                                                branch: result[i].branch,
                                                tipo: result[i].tipo,
                                                utente: result[i].utente
                                            }
                                        }).style({ 'background-color': '#0066ff' });
                                    }
                                    else if (result[i].tipo == "Rev") {
                                        cy.add({
                                            data: {
                                                id: result[i].ID,
                                                nome: result[i].nomeFile,
                                                tipo: result[i].tipo,
                                                path: result[i].path,
                                                dataModifica: result[i].dataModifica,
                                                padre1: result[i].padre1,
                                                padre2: result[i].padre2,
                                                branch: result[i].branch,
                                                tipo: result[i].tipo,
                                                utente: result[i].utente
                                            }
                                        }).style({ 'background-color': '#ffcc00' });
                                    }
                                    else if (result[i].tipo == "Mer") {
                                        cy.add({
                                            data: {
                                                id: result[i].ID,
                                                nome: result[i].nomeFile,
                                                tipo: result[i].tipo,
                                                path: result[i].path,
                                                dataModifica: result[i].dataModifica,
                                                padre1: result[i].padre1,
                                                padre2: result[i].padre2,
                                                branch: result[i].branch,
                                                tipo: result[i].tipo,
                                                utente: result[i].utente
                                            }
                                        }).style({ 'background-color': '#ff3300' });
                                    }
                                }

                                //ARCHI
                                for (var i = 0; i < result.length; i++) {
                                    if (result[i].padre1 != 'init') {
                                        cy.add({
                                            data: {
                                                id: 'edge' + i,
                                                source: result[i].padre1,
                                                target: result[i].ID
                                            }
                                        });
                                        if (result[i].padre2 != '') {
                                            cy.add({
                                                data: {
                                                    id: 'edgex' + i,
                                                    source: result[i].padre2,
                                                    target: result[i].ID
                                                }
                                            });
                                        }
                                    }
                                }

                                cy.elements().layout({ name: 'dagre', rankDir: 'LR' }).run();
                                cy.autolock(true);
                                cy.nodes().on("click", function (evt) {
                                    node = evt.target;
                                    $.ajax({
                                        url: 'http://localhost:8081/readjson',
                                        type: 'POST',
                                        data: {
                                            idCorrente: node.id(),
                                            nomeCorrente: node.data('nome'),
                                            tipo: node.data('tipo'),
                                            path: node.data('path')
                                        }, success: function (imgJson) {
                                            immagineJson = imgJson;
                                            node = evt.target;
                                            ourctx.clearRect(0, 0, canvas.width, canvas.height);
                                            createCanvasForMerge(imgJson, ourctx);
                                            canvas.setAttribute('id', 'minicanvas1');
                                            canvas.setAttribute('class', 'transparent');
                                            canvas.style.height = "100%";
                                            canvas.style.width = "100%";

                                            idProp.innerHTML = "ID: " + node.id();
                                            nomeFileProp.innerHTML = "Nome file: " + node.data('nome');

                                            var data = node.data('dataModifica');
                                            var dataMoment = moment.utc(data).add(2, 'hours').format("DD-MM-YYYY HH:mm:ss");

                                            dataModificaProp.innerHTML = "Data commit: " + dataMoment;
                                            utenteProp.innerHTML = "Utente: " + node.data('utente');
                                            tipoProp.innerHTML = "Tipo: " + node.data('tipo');
                                            branchProp.innerHTML = "Branch: " + node.data('branch');
                                            padre1Prop.innerHTML = "Padre: " + node.data('padre1');
                                            padre2Prop.innerHTML = "Padre 2: " + node.data('padre2');

                                            document.querySelector('#divminicanvas1').appendChild(canvas);
                                            document.querySelector('#divdettaglinodo').appendChild(titoloInformazioni);
                                            document.querySelector('#divdettaglinodo').appendChild(elencoProp);
                                            document.querySelector('#elencoprop').appendChild(idProp);
                                            document.querySelector('#elencoprop').appendChild(nomeFileProp);
                                            document.querySelector('#elencoprop').appendChild(dataModificaProp);
                                            document.querySelector('#elencoprop').appendChild(utenteProp);
                                            document.querySelector('#elencoprop').appendChild(tipoProp);
                                            document.querySelector('#elencoprop').appendChild(branchProp);
                                            document.querySelector('#elencoprop').appendChild(padre1Prop);
                                            
                                            if (node.data('tipo') == "Mer") {
                                                document.querySelector('#elencoprop').appendChild(padre2Prop);
                                            }
                                        }
                                    })
                                });
                            },
                            on_finish: function () {
                                //Al click dell'ok carico il json selezionato nel canvas principale
                                $.ajax({
                                    url: 'http://localhost:8081/readjson',
                                    type: 'POST',
                                    data: {
                                        idCorrente: node.id(),
                                        nomeCorrente: node.data('nome'),
                                        tipo: node.data('tipo'),
                                        path: node.data('path')
                                    },
                                    success: function (imgJson) {
                                        immagineJson = imgJson;
                                        open.load_json(immagineJson);
                                    },
                                })
                            }
                            /* FINE REVG */
                        };
                        this.POP.show(settings);
                    }
                });
            }
            else {
                alertify.error("ERRORE: Non hai ancora selezionato la repository!");
            }
        });
    }

    invitaUtenteRepository() {
        this.controllaSelezioneRepo(function (repo) {
            if (repo) {
                $.ajax({
                    url: 'http://localhost:8081/verificaAdmin',
                    type: 'POST',
                    success: function (admin) {
                        if (admin) {
                            $.ajax({
                                url: 'http://localhost:8081/elencoUtentiInvito',
                                type: 'POST',
                                success: function (result) {
                                    if (result.length > 0) {
                                        this.POP = new Dialog_class();
                                        this.POP.hide();
                                        var settings = {
                                            title: 'Seleziona utente da invitare alla Repository',
                                            params: [
                                                { name: "utente", values: result },
                                            ],
                                            on_finish: function (params) {
                                                $.ajax({
                                                    url: 'http://localhost:8081/invitaUtente',
                                                    type: 'POST',
                                                    data: {
                                                        utente: params.utente,
                                                    }
                                                }).done(function (successo) {
                                                    if (successo) {
                                                        alertify.success("Utente '" + params.utente + "' invitato con successo")
                                                    }
                                                    else {
                                                        alertify.error("ERRORE NELL'INVITO");
                                                    }
                                                });
                                            }
                                        };
                                        this.POP.show(settings);
                                    }
                                    else {
                                        alertify.error("ERRORE: attualmente non ci sono utenti da invitare alla repository");
                                    }
                                }
                            });
                        }
                        else {
                            alertify.error("ERRORE: Non hai i permessi per invitare gli utenti");
                        }
                    }
                });
            }
            else {
                alertify.error("ERRORE: Non hai ancora selezionato la repository!");
            }
        })
    }

    eliminaUtenteRepository() {
        this.controllaSelezioneRepo(function (repo) {
            if (repo) {
                $.ajax({
                    url: 'http://localhost:8081/verificaAdmin',
                    type: 'POST',
                    success: function (admin) {
                        if (admin) {
                            $.ajax({
                                url: 'http://localhost:8081/elencoUtentiElimina',
                                type: 'POST',
                                success: function (result) {
                                    if (result.length > 0) {
                                        this.POP = new Dialog_class();
                                        this.POP.hide();
                                        var settings = {
                                            title: 'Seleziona utente da eliminare dalla repository',
                                            params: [
                                                { name: "utente", values: result },
                                            ],
                                            on_finish: function (params) {
                                                $.ajax({
                                                    url: 'http://localhost:8081/eliminaUtente',
                                                    type: 'POST',
                                                    data: {
                                                        utente: params.utente,
                                                    }
                                                }).done(function (successo) {
                                                    if (successo) {
                                                        alertify.success("Utente '" + params.utente + "' eliminato con successo")
                                                    }
                                                    else {
                                                        alertify.error("ERRORE NELL'ELIMINAZIONE");
                                                    }
                                                });
                                            }
                                        };
                                        this.POP.show(settings);
                                    }
                                    else {
                                        alertify.error("ERRORE: attualmente non ci sono utenti da eliminare dalla repository");
                                    }
                                }
                            });
                        }
                        else {
                            alertify.error("ERRORE: Non hai i permessi per eliminare gli utenti");
                        }
                    }
                });
            }
            else {
                alertify.error("ERRORE: Non hai ancora selezionato la repository!");
            }
        })
    }

    controllaSelezioneRepo(callback) {
        $.ajax({
            url: 'http://localhost:8081/controllaSelezioneRepo',
            type: 'POST',
            success: function (repo) {
                return callback(repo);
            }
        });
    }

}

export default VCS_class;
