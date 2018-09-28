import Dialog_class from './../../libs/popup.js';
var request = require('ajax-request');
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';
var sha1 = require('sha1');
import host from './../../host.js';


class Utente_class {
	
	constructor() {
		this.POP = new Dialog_class();
	}
	
	
	registrazione(){
		this.POP.hide();
		var settings = {
			title: 'Registrazione Utente',
			params: [
				{name: "nickname", title: "Inserisci Username:", value:"" },
				{name: "password", title: "Inserisci Password:",type: "password" ,value:"" },
				{name: "nome", title: "Inserisci Nome:", value:"" },
				{name: "cognome", title: "Inserisci Cognome:", value:"" },
				{name: "mail", title: "Inserisci Email:", value:"" },
			],
			on_finish: function (params) {
				$.ajax({
					url: host.name + 'registrazione',
					type: 'POST',
					data: {
						nickname : params.nickname,
						password : sha1(params.password),
						nome : params.nome,
						cognome : params.cognome,
						mail : params.mail,
					}
				}).done (function(successo) {
					if(successo=="ok"){
						alertify.success("Registrazione effetuata con successo");
					}
					else{
						if(successo=="errore chiave"){
							alertify.error("ERRORE: username '"+params.nickname+"' già presente, inserirne uno diverso");
						}
						else{
							alertify.error("ERRORE NELLA REGISTRAZIONE");
						}
					}
				});
			}
		};
		this.POP.show(settings);
	}
	
	
	login() {
		var settings = {
			title: 'Login Utente',
			params: [
				{name: "nickname", title: "Inserisci Nickname:", value: ""},
				{name: "password", title: "Inserisci Password:", type: "password", value: ""},
			],
			on_finish: function (params){
				$.ajax({
					url: host.name + 'connessioneDB',
					type: 'POST'	
				}).done(
					function(erroreConnessione){
						if(erroreConnessione){
							alertify.error("Errore nella connessione al database..");
						}
						else{
							$.ajax({
								url: host.name + 'login',
								type: 'POST',
								data: {
									nickname : params.nickname,
									password : sha1(params.password),
								}
							}).done (function(successo) {
								if(successo){
									alertify.success("Login in corso, ATTENDERE...");
									window.setTimeout(function(){
			/* 							localStorage.setItem('idlogin', 'false');
										localStorage.setItem('idregistrazione', 'false');
										localStorage.setItem('idlogout','true');
										localStorage.setItem('idvcs', 'true');
										localStorage.setItem('idmodificadati','true'); */
										window.location.href = host.name;
									}, 2500);
								}
								else{
									alertify.error("ERRORE: username e/o password non corretti");
								}
							});
						}
					}
				);

			}
		};
		this.POP.show(settings);
	}
	
	logout() {		
		var settings = {
			title: 'Logout',
			params: [
				{title: "", value: 'Sei sicuro di voler uscire?'},
			],
			on_finish: function (){
				request({
					url: host.name + 'logout',
					method: 'POST',
				}, function() {
					
/* 					localStorage.setItem('idlogin', 'true');
					localStorage.setItem('idregistrazione', 'true');
					localStorage.setItem('idvcs','false');
					localStorage.setItem('idmodificadati','false'); */
					
					window.location= host.name;
				});
			}
		};
		this.POP.show(settings);
	}
	
	modificadati() {
		$.ajax({
			url: host.name + 'leggidatiutente',
			type: 'POST',
			success: function(result){
				this.POP = new Dialog_class();
				this.POP.hide();
				var settings = {
					title: 'Modifica dati utente',
					params: [
						{name: "password", title: "Inserisci Password:",type: "password" ,value: ""},
						{name: "nome", title: "Inserisci Nome:", value: result[0].nome},
						{name: "cognome", title: "Inserisci Cognome:", value: result[0].cognome},
						{name: "mail", title: "Inserisci Email:", value: result[0].mail},
					],
					
					on_finish: function (params) {
						$.ajax({
							url: host.name + 'modificadatiutente',
							type: 'POST',
							data: {
								password : sha1(params.password),
								nome : params.nome,
								cognome : params.cognome,
								mail : params.mail,
							}
						}).done (function(successo) {
							if(successo){
								alertify.success("Dati modificati con successo!");
							}
							else{
								alertify.error("Errore nella modifica dei dati");
							}
						});
					}
				};
				this.POP.show(settings);
			}
		})	
	}
	
}

export default Utente_class;
