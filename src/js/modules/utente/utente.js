import Dialog_class from './../../libs/popup.js';
import host from './../../host.js';
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';
var request = require('ajax-request');
var sha1 = require('sha1');


class Utente_class {
    constructor() {
        this.POP = new Dialog_class();
    }

    registrazione() {
        this.POP.hide();
        var settings = {
            title: 'Registrazione Utente',
            params: [
                { name: "nickname", title: "Inserisci Username:", value: "" },
                { name: "password", title: "Inserisci Password:", type: "password", value: "" },
                { name: "nome", title: "Inserisci Nome:", value: "" },
                { name: "cognome", title: "Inserisci Cognome:", value: "" },
                { name: "mail", title: "Inserisci Email:", value: "" },
            ],
            on_finish: function(params) {
                $.ajax({
                    url: host.name + 'registrazione',
                    type: 'POST',
                    data: {
                        nickname: params.nickname,
                        password: sha1(params.password),
                        nome: params.nome,
                        cognome: params.cognome,
                        mail: params.mail,
                    }
                }).done(function(successo) {
                    if (successo == "ok") {
                        alertify.success("Registrazione effetuata con successo!");
                    }
                    else {
                        if (successo == "errore chiave") {
                            alertify.error("ERRORE: username '" + params.nickname + "' già presente, inserirne uno diverso!");
                        }
                        else {
                            alertify.error("Errore nella registrazione!");
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
                { name: "nickname", title: "Inserisci Nickname:", value: "" },
                { name: "password", title: "Inserisci Password:", type: "password", value: "" },
            ],
            on_finish: function(params) {
                $.ajax({
                    url: host.name + 'login',
                    type: 'POST',
                    data: {
                        nickname: params.nickname,
                        password: sha1(params.password),
                    }
                }).done(function(successo) {
                    if (successo) {
                        alertify.success("Login effettuato con successo, attendere...");
                        window.setTimeout(function() {
                            window.location.href = host.name;
                        }, 2500);
                    }
                    else {
                        alertify.error("ERRORE: username e/o password non corretti");
                    }
                });
            }
        }
        this.POP.show(settings);
    }

    logout() {
        var settings = {
            title: 'Logout',
            params: [
                { title: "", value: 'Sei sicuro di voler uscire?' },
            ],
            on_finish: function() {
                request({
                    url: host.name + 'logout',
                    method: 'POST',
                }, function() {
                    window.location = host.name;
                });
            }
        };
        this.POP.show(settings);
    }

    modificadati() {
        $.ajax({
            url: host.name + 'leggidatiutente',
            type: 'POST',
            success: function(result) {
                this.POP = new Dialog_class();
                this.POP.hide();
                var settings = {
                    title: 'Modifica dati utente',
                    params: [
                        { name: "password", title: "Inserisci Password:", type: "password", value: "" },
                        { name: "nome", title: "Inserisci Nome:", value: result[0].nome },
                        { name: "cognome", title: "Inserisci Cognome:", value: result[0].cognome },
                        { name: "mail", title: "Inserisci Email:", value: result[0].mail },
                    ],

                    on_finish: function(params) {
                        $.ajax({
                            url: host.name + 'modificadatiutente',
                            type: 'POST',
                            data: {
                                password: sha1(params.password),
                                nome: params.nome,
                                cognome: params.cognome,
                                mail: params.mail,
                            }
                        }).done(function(successo) {
                            if (successo) {
                                alertify.success("Dati modificati con successo!");
                            }
                            else {
                                alertify.error("Errore nella modifica dei dati.");
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
