var request = require('ajax-request');

import Dialog_class from "../../libs/popup";
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';

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
        var settings = {
            title: 'Revision Graph - Not available yet 1',
            params: [
                { title: "AAAA:", value: "XXX XXX" },
                { title: "BBBB:", value: "Test test" },
                { title: "CCCC:", value: "Prova prova" },
            ],
        };
        this.POP.show(settings);
    }

    /*  getArray(_this, callback) {
          var dataToReturn = "";
          $.ajax({
              url: 'http://localhost:8081/elencoRepo',
              type: 'POST',
              success: function(elencoRepo) {
                  callback(elencoRepo);
              }
          });  
      }*/


}

export default VCS_class;
