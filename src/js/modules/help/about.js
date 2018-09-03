import config from './../../config.js';
import Dialog_class from './../../libs/popup.js';

class Help_about_class {

	constructor() {
		this.POP = new Dialog_class();
	}

	//about
	about() {		
		var settings = {
			title: 'About',
			params: [
				{title: "Name:", html: '<span class="about-name">NOME SOFTWARE</span>'},
				{title: "Version:", value: VERSION},
				{title: "Description:", value: "Version Control System for Image Editing"},
				{title: "Author:", value: 'D. Mantellini, G. Neglia, S. Vestita'},
				{title: "GitHub:", html: '<a href="https://github.com/viliusle/miniPaint">https://github.com/viliusle/miniPaint</a>'},
			],
		};
		this.POP.show(settings);
	}

}

export default Help_about_class;
