import Dialog_class from './../../libs/popup.js';
var request = require('ajax-request');
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';


class Utente_class {

    constructor() {
        this.POP = new Dialog_class();
    }


    registrazione(){
        this.POP.hide();
        var settings = {
            title: 'Registrazione - Non ancora implementata',
            params: [
                {name: "nickname", title: "Inserisci Username:", value:"" },
				{name: "password", title: "Inserisci Password:",type: "password" ,value:"" },
				{name: "nome", title: "Inserisci Nome:", value:"" },
				{name: "cognome", title: "Inserisci Cognome:", value:"" },
				{name: "mail", title: "Inserisci Email:", value:"" },
            ],

            on_finish: function (params) {
                 /*request({
                    url: 'http://localhost:8081/registrazione',
                    method: 'POST',
                    data: {
						nickname : params.nickname,
						password : params.password,
						nome : params.nome,
						cognome : params.cognome,
						mail : params.mail,
					},
                  }, function(err, res, body) {
					  window.location="http://localhost:8081/";
					  alertify.error(body.messaggio);
					  window.setTimeout(function(){

						// Move to a new location or you can do something else
						window.location.href = "http://localhost:8081/";
				
					}, 2500);
				  });*/
				  $.ajax({
					url: 'http://localhost:8081/registrazione',
					type: 'POST',
					data: {
							nickname : params.nickname,
							password : params.password,
							nome : params.nome,
							cognome : params.cognome,
							mail : params.mail,
					}
				}).done (function(messaggio) {
					//alert(messaggio);
					var _this = this;
					alertify.error(messaggio);
					window.setTimeout(function(){

						// Move to a new location or you can do something else
						window.location.href = "http://localhost:8081/";
				
					}, 2500);
					//window.location="http://localhost:8081/";
				});
			}
        };

        this.POP.show(settings);
	}
	

    login() {
		var _this = this;
			var settings = {
			title: 'Login',
			params: [
				{name: "nickname", title: "Inserisci Nickname:", value: ""},
				{name: "password", title: "Inserisci Password:", type: "password", value: ""},
			],
			on_finish: function (params){
				$.ajax({
						url: 'http://localhost:8081/login',
						type: 'POST',
						data: {
								nickname : params.nickname,
								password : params.password,
						}
					}).done (function(messaggio) {
						//alert(messaggio);
						var _this = this;
						alertify.error(messaggio);
						window.setTimeout(function(){

							// Move to a new location or you can do something else
							window.location.href = "http://localhost:8081/";
					
						}, 2500);
						//window.location="http://localhost:8081/";
					});
			}
		};
		//alertify.error("errore");
		this.POP.show(settings);
	}
	
	logout() {		
		var settings = {
			title: 'Logout',
			params: [
				{title: "", value: 'Sei sicuro di voler uscire?'},
			],
			on_finish: function (params){
				request({
						url: 'http://localhost:8081/logout',
						method: 'POST',
					}, function(err, res, body) {
						window.location="http://localhost:8081/";
					});
			}
		};
		this.POP.show(settings);
    }

}

export default Utente_class;