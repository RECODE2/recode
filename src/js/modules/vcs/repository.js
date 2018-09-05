var request = require('ajax-request');

import Dialog_class from "../../libs/popup";
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';
import { callbackify } from 'util';
import host from './../../host.js';
import File_open_class from "./../file/open.js";

var cytoscape = require('cytoscape');
var cydagre = require('cytoscape-dagre');
var dagre = require('dagre');
cytoscape.use( cydagre, dagre ); // register extension
/**
 * In questa classe ci sono le seguenti funzionalità:
 * - crea repository
 * - elenco / scegli repository
 * - modifica repository
 * - revision graph 
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
                    if(successo){
                        alertify.success("Repository creata con successo");
                    }
                    else{
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
                if(result.length>0){
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
                                data: { nomeRepo: params.name,
                                },
                                success: function(){
                                    alertify.success("Repository settata con successo, ATTENDERE...");
                                    window.setTimeout(function(){
                                        window.location.href = host.name;
                                    }, 2500);
                                }
                            });
                        }
                    };
                    this.POP.show(settings);
                }
                else{
                    alertify.error("ERRORE: attualmente non ci sono repository da visualizzare");
                }
            }
        });
    }

    modificaRepository() {
        this.controllaSelezioneRepo(function(repo){
            if(repo){
                $.ajax({
                    url: 'http://localhost:8081/infoRepo',
                    type: 'POST',
                    success: function (result) {
                        if(!result[0].descrizione){
                            result[0].descrizione="";
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
                                    success: function(successo){
                                        if(successo){
                                            alertify.success("Repository modificata con successo");
                                        }
                                        else{
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
            else{
                alertify.error("ERRORE: Non hai ancora selezionato la repository!"); 
            }
        })
    }

    revisionGraph() {
        this.controllaSelezioneRepo(function(repo){ 
            if(repo){
                $.ajax({
                    url: 'http://localhost:8081/revg',
                    type: 'POST',
                    success: function (result) {
                      this.POP = new Dialog_class();
                      this.POP.hide();
                      var open = new File_open_class();
                      var immagineJson;
                      var node;
                      var settings = {
                        title: 'Revision Graph',
                        on_load: function () {
                            var divRevg = document.createElement('div');
                            document.getElementById('dialog_content').style.height="400px";
                            divRevg.setAttribute('id','cy');
                            //divRevg.innerHTML="ciao questa e' una div con id: "+divRevg.getAttribute('id');
                            divRevg.style.height="400px";
                            divRevg.style.marginTop="40px";
                            divRevg.style.position="absolute";
                            divRevg.style.left="0";
                            divRevg.style.top="0";
                            divRevg.style.zIndex="999";
            
                            
                            document.querySelector('#popup #dialog_content').appendChild(divRevg);
            
                              var cy = cytoscape({
                                container: document.getElementById('cy'),
                                boxSelectionEnabled: false,
                                autounselectify: true
                              });
                              
            
                    
                    cy.style().selector('node').style({
                      'content': 'data(id)',
                      'text-opacity': 0.5,
                      'text-valign': 'center',
                      'text-halign': 'right'
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
            
                            if(result[i].tipo=="Com"){
                                cy.add({
                                    data: {
                                        id: result[i].ID,
                                        nome: result[i].nomeFile,
                                        tipo: result[i].tipo,
                                        path: result[i].path,
                                        branch: result[i].branch
                                    }
                                    }).style({'background-color':'#0066ff'});
                            }
                            else if(result[i].tipo=="Rev"){
                                cy.add({
                                    data: {
                                        id: result[i].ID,
                                        nome: result[i].nomeFile,
                                        tipo: result[i].tipo,
                                        path: result[i].path,
                                        branch: result[i].branch
                                    }
                                    }).style({'background-color':'#ffcc00'});   
                            }
                            else if(result[i].tipo=="Mer"){
                                cy.add({
                                    data: {
                                        id: result[i].ID,
                                        nome: result[i].nomeFile,
                                        tipo: result[i].tipo,
                                        path: result[i].path,
                                        branch: result[i].branch
                                    }
                                    }).style({'background-color':'#ff3300'});   
                            }
            
                              }
            
                              //ARCHI
                        for (var i = 0; i < result.length; i++) {
                                
                                if(result[i].padre1 != 'init'){
                                  cy.add({
                                    data: {
                                        id: 'edge' + i,
                                        source: result[i].padre1,
                                        target: result[i].ID
                                    }
                                });
            
                                if(result[i].padre2 != ''){
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
            
            
            
                       cy.elements().layout({ name: 'dagre' }).run();
                       cy.autolock( true );
            
                        cy.nodes().on("click", function(evt){
                        console.log("Result: " + result);
                        //QUI AGGIUNGERÒ COSA SUCCEDE QUANDO UN UTENTE CLICCA UN NODO
                        node = evt.target;
                        alert("Questo nodo ha id: "+ node.id());
                       //alert("Questo nodo ha nome: " + node.data('nome'));
                        });
                        },
                        on_finish: function(){ 
                            //alert("Questo nodo ha nome: " + node.data('nome'));
                            $.ajax({
                                url: 'http://localhost:8081/readjson',
                                type: 'POST',
                                data: {
                                    idCorrente: node.id(),
                                    nomeCorrente: node.data('nome'),
                                    tipo: node.data('tipo'),
                                    path: node.data('path'),
                                    branch: node.data('branch')
                                }
                            })
                        }
                    };
                      this.POP.show(settings);
                  }
                });
            }
            else{
                alertify.error("ERRORE: Non hai ancora selezionato la repository!");
            }
        });
    }

    invitaUtenteRepository() {
        this.controllaSelezioneRepo(function(repo){
            if(repo){
                $.ajax({
                    url: 'http://localhost:8081/verificaAdmin',
                    type: 'POST',
                    success: function (admin) {
                        if (admin){
                            $.ajax({
                                url: 'http://localhost:8081/elencoUtentiInvito',
                                type: 'POST',
                                success: function (result) {
                                    if(result.length>0){
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
                                                    data: { utente: params.utente,
                                                    }
                                                }).done (function(successo) {
                                                    if(successo){
                                                        alertify.success("Utente '"+params.utente+"' invitato con successo")
                                                    }
                                                    else {
                                                        alertify.error("ERRORE NELL'INVITO");
                                                    }
                                                });
                                            }
                                        };
                                        this.POP.show(settings);
                                    }
                                    else{
                                        alertify.error("ERRORE: attualmente non ci sono utenti da invitare alla repository");
                                    }
                                }
                            });
                        }
                        else{
                            alertify.error("ERRORE: Non hai i permessi per invitare gli utenti");
                        }
                    }
                });
            }
            else{
                alertify.error("ERRORE: Non hai ancora selezionato la repository!");
            }
        })
    }

    eliminaUtenteRepository() {
        this.controllaSelezioneRepo(function(repo){
            if(repo){
                $.ajax({
                    url: 'http://localhost:8081/verificaAdmin',
                    type: 'POST',
                    success: function (admin) {
                        if (admin){
                            $.ajax({
                                url: 'http://localhost:8081/elencoUtentiElimina',
                                type: 'POST',
                                success: function (result) {
                                    if(result.length>0){
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
                                                    data: { utente: params.utente,
                                                    }
                                                }).done (function(successo) {
                                                    if(successo){
                                                        alertify.success("Utente '"+params.utente+"' eliminato con successo")
                                                    }
                                                    else {
                                                        alertify.error("ERRORE NELL'ELIMINAZIONE");
                                                    }
                                                });
                                            }
                                        };
                                        this.POP.show(settings);
                                    }
                                    else{
                                        alertify.error("ERRORE: attualmente non ci sono utenti da eliminare dalla repository");
                                    }
                                }
                            });
                        }
                        else{
                            alertify.error("ERRORE: Non hai i permessi per eliminare gli utenti");
                        }
                    }
                });
            }
            else{
                alertify.error("ERRORE: Non hai ancora selezionato la repository!");
            }
        })
    }

    controllaSelezioneRepo(callback){
        $.ajax({
            url: 'http://localhost:8081/controllaSelezioneRepo',
            type: 'POST',
            success: function (repo){
                return callback(repo);
            }
        });
    }

}

export default VCS_class;
