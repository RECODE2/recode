import config from './../../config.js';
import Base_layers_class from './../../core/base-layers.js';
import Helper_class from './../../libs/helpers.js';
import Dialog_class from './../../libs/popup.js';
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';
var request = require('ajax-request');


var instance = null;

class Commit_Class{
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

    

    commit(){
        var _this = this;
        this.POP.hide();
        
        var settings = {
			title: 'Commit: ',
			params: [
				{name: "name", title: "Commit name:", value: "Nome..."},
				{name: "desc", title: "Descrizione", value: ""},
                {name: "layers",  values: ['All']},
			],
			on_change: function (params, canvas_preview, w, h) {
                _this.save_dialog_onchange(params);
                
			}, 
			on_finish: function (params) {
               var json_file = _this._action(params);
                request({
                    url: 'http://localhost:8081/commit',
                    method: 'POST',
                    data: {
                      file_json_name: json_file[1],
                      file_json_data: json_file[0],
                      desc: params.desc,
                      name: params.name
                    }
                  }, function(err, res, body) {
                    
                  });
               
			},
		};
		this.POP.show(settings);
    }

        _action(user_response) {
        var fname = user_response.name;
        
        var only_one_layer = false;
        
        if (user_response.layers == 'All')
            only_one_layer = false;
            
        var quality = parseInt(user_response.quality);
        if (quality > 100 || quality < 1 || isNaN(quality) == true)
            quality = 90;
        quality = quality / 100;
        var type = "JSON";
        if (this.Helper.strpos(fname, '.json') !== false)
            type = 'JSON';
        
       
    

        if (this.Helper.strpos(fname, '.json') == false)
            fname = fname + ".json";

        var data_json = this.export_as_json();

        var blob = new Blob([data_json], {type: "text/plain"});
        var data = window.URL.createObjectURL(blob); //html5
        return [data_json, fname];
        
    }

    export_as_json() {
		var export_data = {};

		//get date
		var today = new Date();
		var yyyy = today.getFullYear();
		var mm = today.getMonth() + 1; //January is 0!
		var dd = today.getDate();
		if (dd < 10)
			dd = '0' + dd;
		if (mm < 10)
			mm = '0' + mm;
		var today = yyyy + '-' + mm + '-' + dd;

		//data
		var export_data = {};
		export_data.info = {
			width: config.WIDTH,
			height: config.HEIGHT,
			about: 'Image data with multi-layers. Can be opened using miniPaint - '
				+ 'https://github.com/viliusle/miniPaint',
			date: today,
			version: "4.0.0",
			layer_active: config.layer.id
		};

		//layers
		export_data.layers = [];
		for (var i in config.layers) {
			var layer = {};
			for (var j in config.layers[i]) {
				if (j[0] == '_' || j == 'link_canvas') {
					//private data
					continue;
				}

				layer[j] = config.layers[i][j];
			}
			export_data.layers.push(layer);
		}

		//image data
		export_data.data = [];
		for (var i in config.layers) {
			if (config.layers[i].type != 'image')
				continue;

			var canvas = document.createElement('canvas');
			canvas.width = config.layers[i].width_original;
			canvas.height = config.layers[i].height_original;
			this.disable_canvas_smooth(canvas.getContext("2d"));

			canvas.getContext('2d').drawImage(config.layers[i].link, 0, 0);

			var data_tmp = canvas.toDataURL("image/png");
			export_data.data.push(
				{
					id: config.layers[i].id,
					data: data_tmp,
				}
			);
			canvas.width = 1;
			canvas.height = 1;
		}
		
		return JSON.stringify(export_data, null, "\t");
	}

	disable_canvas_smooth(ctx) {
		ctx.webkitImageSmoothingEnabled = false;
		ctx.oImageSmoothingEnabled = false;
		ctx.msImageSmoothingEnabled = false;
		ctx.imageSmoothingEnabled = false;
	}
} export default Commit_Class;