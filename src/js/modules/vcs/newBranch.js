import config from './../../config.js';
import Base_layers_class from './../../core/base-layers.js';
import Helper_class from './../../libs/helpers.js';
import Dialog_class from './../../libs/popup.js';
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';
var bodyparser = require('body-parser');
var request = require('ajax-request');


var instance = null;
class New_Branch_Class{
    constructor() {
        //singleton
        if (instance) {
			return instance;
		}
        instance = this;
        var _this = this;

        this.Base_layers = new Base_layers_class();
		this.Helper = new Helper_class();
        this.POP = new Dialog_class();

        this.set_events();
    }
 //devo farli vedere da quale revision può partire, query sul tipo di file.
    

    newBranch(){
        var _this = this;

        this.POP.hide();
        var settings = {
			title: 'Add Repo: ',
			params: [
				{name: "name", title: "Nome Branch: ", value: "Inserisci nome"},
			],
			on_finish: function (params) {
               //funzioni
                request({
                    url: 'http://localhost:8081/branch',
                    method: 'POST',
                    data: {
                      nameBranch: params.name
                      //utente
                      //repo
                      //file AddREvision
                    }
                  }, function(err, res, body) {
                    
                  });
               
			},
		};
		this.POP.show(settings);

        
    }

    set_events() {

		document.addEventListener('keydown', function (event) {
			var code = event.keyCode;
			if (event.target.type == 'text' || event.target.tagName == 'INPUT' || event.target.type == 'textarea')
				return;

			if (code == 83) {
				//save
				_this.save();
				event.preventDefault();
			}
		}, false);
    }
} export default New_Branch_Class;
