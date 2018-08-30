import config from './../../config.js';
import Base_layers_class from './../../core/base-layers.js';
import Helper_class from './../../libs/helpers.js';
import Dialog_class from './../../libs/popup.js';
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';
var request = require('ajax-request');


var instance = null;

class Add_Revision_Class{
    constructor() {
        //singleton
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
    
    addRevision() {
		var _this = this;
		this.POP.hide();

        
		var calc_size_value = false;
		var calc_size = false;
		if (config.WIDTH * config.HEIGHT < 1000000) {
			calc_size_value = true;
			calc_size = true;
		}

		var file_name = config.layers[0].name;
		var parts = file_name.split('.');
		if (parts.length > 1)
			file_name = parts[parts.length - 2];
        file_name = file_name.replace(/ /g, "-");
        var i = 0;
        var lunghezza = config.layers.length;
        if (config.layers.length > 1) {
			alertify.error('Ci sono più di un livello, devi fare il Merge Down');
			return false;
		}
		var settings = {
			title: 'Add Revision: ',
			params: [
				{name: "name", title: "File name:", value: file_name},
				{name: "desc", title: "Descrizione", value: ""},
                {name: "quality", title: "JPG qualità:", value: 90, range: [1, 100]},
                {name: "calc_size", title: "Show file size:", value: calc_size_value},
                {name: "layers",  values: ['All']},
                //{name: "type", value: "JPG"},
                //{name: "type1", value: "JSON"},
			],
			on_change: function (params, canvas_preview, w, h) {
                _this.save_dialog_onchange(params);
                
			}, 
			on_finish: function (params) {
               var jpeg_file = _this.save_action(params);
               var json_file = _this.save_action_json(params);
                request({
                    url: 'http://localhost:8081/addRevision',
                    method: 'POST',
                    data: {
                      file_json_name: json_file[1],
                      file_json_data: json_file[0],
                      file_jpeg_name: jpeg_file[1],
                      file_jpeg_data: jpeg_file[0],
                      desc: params.desc,
                      name: params.name
                    }
                  }, function(err, res, body) {
                    
                  });
               
			},
		};
		this.POP.show(settings);

        //document.getElementById("pop_data_name").select();

		if (calc_size == true) {
			//calc size once
			this.save_dialog_onchange(null);
		}
    }

    update_file_size(file_size) {
		if (typeof file_size == 'string') {
			//document.getElementById('file_size').innerHTML = file_size;
			return;
		}

		if (file_size > 1024 * 1024)
			file_size = this.Helper.number_format(file_size / 1024 / 1024, 2) + ' MB';
		else if (file_size > 1024)
			file_size = this.Helper.number_format(file_size / 1024, 2) + ' KB';
		else
			file_size = (file_size) + ' B';
		//document.getElementById('file_size').innerHTML = file_size;
	}

    update_file_size(file_size) {
		if (typeof file_size == 'string') {
			//document.getElementById('file_size').innerHTML = file_size;
			return;
		}

		if (file_size > 1024 * 1024)
			file_size = this.Helper.number_format(file_size / 1024 / 1024, 2) + ' MB';
		else if (file_size > 1024)
			file_size = this.Helper.number_format(file_size / 1024, 2) + ' KB';
		else
			file_size = (file_size) + ' B';
		//document.getElementById('file_size').innerHTML = file_size;
	}
    
    
    save_dialog_onchange(object) {
        var _this = this;
        this.update_file_size('...');
        

        var user_response = this.POP.get_params();

        var quality = parseInt(user_response.quality);
		if (quality > 100 || quality < 1 || isNaN(quality) == true)
			quality = 90;
        quality = quality / 100;

        var only_one_layer = false;
        if (user_response.layers == 'All')
			only_one_layer = false;
        
        if (user_response.calc_size == false) {
            document.getElementById('file_size').innerHTML = '-';
            return;
        }

			//CANVAS TEMPORANEO PER JPEG
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext("2d");
			canvas.width = config.WIDTH;
			canvas.height = config.HEIGHT;
			this.disable_canvas_smooth(ctx);

			//DATA
			if (only_one_layer == true && config.layer.type != null) {
				var layer = config.layer;

				var initial_x = null;
				var initial_y = null;
				if (layer.x != null && layer.y != null && layer.width != null && layer.height != null) {
					//POSIZIONE ANGOLO TOP-SX
					initial_x = layer.x;
					initial_y = layer.y;
					layer.x = 0;
					layer.y = 0;

					canvas.width = layer.width;
					canvas.height = layer.height;
				}

				this.Base_layers.convert_layers_to_canvas(ctx, layer.id);

				if (initial_x != null && initial_x != null) {
					//restore position
					layer.x = initial_x;
					layer.y = initial_y;
				}else {
                    this.Base_layers.convert_layers_to_canvas(ctx);
                }
			}
		
               //JSON this.Base_layers.convert_layers_to_canvas(ctx);
                
                if (config.TRANSPARENCY == false) {
                    //add white background
                    ctx.globalCompositeOperation = 'destination-over';
                    this.fillCanvasBackground(ctx, '#ffffff');
                    ctx.globalCompositeOperation = 'source-over';
                }

                canvas.toBlob(function (blob) {
                    _this.update_file_size(blob.size)
                }, "image/jpeg", quality);
                
                var data_json = this.export_as_json();

                var blob = new Blob([data_json], {type: "text/plain"});
                this.update_file_size(blob.size);
                
        }

        save_action(user_response) {
            var fname = user_response.name;
            
            var only_one_layer = false;
		    if (user_response.layers == 'All')
                only_one_layer = false;
                
            var quality = parseInt(user_response.quality);
		    if (quality > 100 || quality < 1 || isNaN(quality) == true)
			    quality = 90;
            quality = quality / 100;
            var type = "JPG";
            if (this.Helper.strpos(fname, '.jpg') !== false)
			{type = 'JPG';}
            


            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            canvas.width = config.WIDTH;
            canvas.height = config.HEIGHT;
            this.disable_canvas_smooth(ctx);
   
               //ask data
            if (only_one_layer == true && config.layer.type != null) {
                   //only current layer !!!
                var layer = config.layer;
   
                var initial_x = null;
                var initial_y = null;
                if (layer.x != null && layer.y != null && layer.width != null && layer.height != null) {
                       //change position to top left corner
                    initial_x = layer.x;
                    initial_y = layer.y;
                    layer.x = 0;
                    layer.y = 0;
   
                    canvas.width = layer.width;
                    canvas.height = layer.height;
                }
   
                this.Base_layers.convert_layers_to_canvas(ctx, layer.id);
   
                if (initial_x != null && initial_x != null) {
                    //restore position
                    layer.x = initial_x;
                    layer.y = initial_y;
                }
            }
            else {
                this.Base_layers.convert_layers_to_canvas(ctx);
            }

            if (config.TRANSPARENCY == false) {
                //add white background
                ctx.globalCompositeOperation = 'destination-over';
                this.fillCanvasBackground(ctx, '#ffffff');
                ctx.globalCompositeOperation = 'source-over';
            }
            

            if (this.Helper.strpos(fname, '.jpg') == false)
				fname = fname + ".jpg";
			var blob1 = canvas.toBlob(function (blob) {
				
            }, "image/jpeg", quality); 
            
            var img = canvas.toDataURL("image/jpeg");
            return [img, fname];
            


            //if (this.Helper.strpos(fname, '.json') == false)
				//fname = fname + ".json";

			//var data_json = this.export_as_json();

			//var blob = new Blob([data_json], {type: "text/plain"});
			//var data = window.URL.createObjectURL(blob); //html5
            //filesaver.saveAs(blob, fname);
        }

        fillCanvasBackground(ctx, color, width = config.WIDTH, height = config.HEIGHT) {
            ctx.beginPath();
            ctx.rect(0, 0, width, height);
            ctx.fillStyle = color;
            ctx.fill();
        }
        
       check_format_support(canvas, data_header, show_error) {
            var data = canvas.toDataURL(data_header);
            var actualType = data.replace(/^data:([^;]*).*/, '$1');
        
            if (data_header != actualType && data_header != "text/plain") {
                if (show_error == undefined || show_error == true) {
                    //error - no support
                    alertify.error('Your browser does not support this format.');
                }
                return false;
            }
            return true;
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


        save_action_json(user_response) {
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

        
    

		
		


}
export default Add_Revision_Class;