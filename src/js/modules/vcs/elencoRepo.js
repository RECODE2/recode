import config from './../../config.js';
import Base_layers_class from './../../core/base-layers.js';
import Helper_class from './../../libs/helpers.js';
import Dialog_class from './../../libs/popup.js';
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';
var request = require('ajax-request');


var instance = null;

class Elenco_Class{
    constructor() {
        if (instance) {
			return instance;
		}
        instance = this;
        
        this.Base_layers = new Base_layers_class();
		this.Helper = new Helper_class();
		this.POP = new Dialog_class();
    
        this.set_events();
    }

    set_events() {
		var _this = this;

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

    elenco(){
        var _this = this;
        this.POP.hide();

        request({
            url: 'http://localhost:8081/elenco',
            method: 'POST',
            data: {
            }
          }, function(err, res, body) {
            
          });
        
        var settings = {
			title: 'Scegli Repo: ',
			params: [
				//{name: "layers", title: "Repo:", values: rows},
			], 
			on_finish: function (params) {
        
               
			},
		};
		this.POP.show(settings);

    }

    
}export default Elenco_Class;