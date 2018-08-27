var request = require('ajax-request');

import Dialog_class from "../../libs/popup";
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';

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
                /*request({
                    url: 'http://localhost:8081/creaRepository',
                    method: 'POST',
                    data: {
                        nomeRepo: params.name,
                        readme: params.readme,
                    }
                  }, function(err, res, body) {
                    
                  });*/
                $.ajax({
                    url: 'http://localhost:8081/creaRepository',
                    type: 'POST',
                    data: {
                        nomeRepo: params.name,
                        readme: params.readme,
                    }
                }).done(function (messaggio) {
                    //alert(messaggio);
                    var _this = this;
                    alertify.error(messaggio);
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
                            }
                        });
                    }
                };
                this.POP.show(settings);
            }
        });





    }

    modificaRepository() {
        var settings = {
            title: 'Modifica repository - Not available yet 1',
            params: [
                { title: "AAAA:", value: "XXX XXX" },
                { title: "BBBB:", value: "Test test" },
                { title: "CCCC:", value: "Prova prova" },
            ],
        };
        this.POP.show(settings);
    }

    revisionGraph() {

        $.ajax({
            url: 'http://localhost:8081/controllaselezionerepo',
            type: 'POST',
            success: function(repo){
                if(repo){

                    $.ajax({
                        url: 'http://localhost:8081/revg',
                        type: 'POST',
                        success: function (result) {
                          this.POP = new Dialog_class();
                          this.POP.hide();
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
                
                
                            for (var i = 0; i < result.length; i++) {
                
                                if(result[i].tipo=="Com"){
                                    cy.add({
                                        data: { id: result[i].nome }
                                        }).style({'background-color':'#ff6600'});
                                }
                                else{
                                    cy.add({
                                        data: { id: result[i].nome }
                                        }).style({'background-color':'#03acac'});   
                                }
                
                                  }
                
                            for (var i = 0; i < result.length; i++) {
                                    
                                    if(result[i].padre1 != 'init'){
                                      cy.add({
                                        data: {
                                            id: 'edge' + i,
                                            source: result[i].padre1,
                                            target: result[i].nome
                                        }
                                    });
                
                                    if(result[i].padre2 != ''){
                                      cy.add({
                                        data: {
                                          id: 'edgex' + i,
                                          source: result[i].padre2,
                                          target: result[i].nome
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
                            var node = evt.target;
                            alert("Questo nodo ha id: "+ node.id());
                            });
                            },
                        };
                          this.POP.show(settings);
                      }
                    });
                }
                else{
                    alertify.error("Non hai ancora selezionato la repository!");
                }
            }
        });


    }
}

export default VCS_class;
