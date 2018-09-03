/*
 * miniPaint - https://github.com/viliusle/miniPaint
 * author: Vilius L.
 */

import config from './../../config.js';
//import menu_template from './../../config-menu.js';
import ddsmoothmenu from './../../libs/menu.js';

/**
 * class responsible for rendering main menu
 */
class GUI_menu_class {

	render_main() {
		//document.getElementById('main_menu').innerHTML = menu_template;
		ddsmoothmenu.init({
			mainmenuid: "main_menu",
			method: 'toggle', //'hover' (default) or 'toggle'
			contentsource: "markup",
		});
/* 		var tastologin = localStorage.getItem('idlogin');
		var tastologout = localStorage.getItem('idlogout');
		var tastoregistrazione = localStorage.getItem('idregistrazione');
		var tastovcs = localStorage.getItem('idvcs');
		var modificadati = localStorage.getItem('idmodificadati');
		
		//Se l'utente è loggato visualizzerà i tasti: MODIFICA DATI E LOGOUT
		//Se l'utente non è loggato, visualizzerà i tasti: LOGIN e REGISTRAZIONE

		if(tastologin == 'false'){
			document.getElementById('idlogin').style.display = "none";
		}
		else{
			document.getElementById('idlogout').style.display = "none";
			document.getElementById('idvcs').style.display = "none";
			document.getElementById('idmodificadati').style.display = "none";
		}

		if(tastologout == 'false'){
			document.getElementById('idlogout').style.display = "none";
		}

		if(tastoregistrazione == 'false'){
			document.getElementById('idregistrazione').style.display = "none";
		}

		if(tastovcs == 'false'){
			document.getElementById('idvcs').style.display = "none";
		}

		if(modificadati == 'false'){
			document.getElementById('idmodificadati').style.display = "none";
		} */
	}

}

export default GUI_menu_class;