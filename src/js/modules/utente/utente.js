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
            title: 'Sign-up',
            params: [
                { name: "nickname", title: "Insert Username:", value: "" },
                { name: "password", title: "Insert Password:", type: "password", value: "" },
                { name: "nome", title: "Insert Name:", value: "" },
                { name: "cognome", title: "Insert Surname:", value: "" },
                { name: "mail", title: "Insert Email:", value: "" },
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
                        alertify.success("Successful registration!");
                    }
                    else {
                        if (successo == "errore chiave") {
                            alertify.error("ERRORE: username '" + params.nickname + "' already present, insert a different one!");
                        }
                        else {
                            alertify.error("Registration error!");
                        }
                    }
                });
            }
        };
        this.POP.show(settings);
    }


    login() {
        var settings = {
            title: 'Sign-in',
            params: [
                { name: "nickname", title: "Insert Username:", value: "" },
                { name: "password", title: "Insert Password:", type: "password", value: "" },
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
                        alertify.success("Login successfully, wait ...");
                        window.setTimeout(function() {
                            window.location.href = host.name;
                        }, 2500);
                    }
                    else {
                        alertify.error("ERROR: username and/or password not correct");
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
                { title: "", value: 'Are you sure you want to quit?' },
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
                        { name: "password", title: "Insert Password:", type: "password", value: "" },
                        { name: "nome", title: "Insert Name:", value: result[0].nome },
                        { name: "cognome", title: "Insert Surname:", value: result[0].cognome },
                        { name: "mail", title: "Insert Email:", value: result[0].mail },
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
                                alertify.success("Data changed successfully!");
                            }
                            else {
                                alertify.error("Error in data modification.");
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
