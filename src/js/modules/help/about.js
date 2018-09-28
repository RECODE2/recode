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
				{title: "Name:", html: '<span class="about-name">RECODE</span>'},
				{title: "Version:", value: "1.0.1"},
				{title: "Description:", value: "Revision Control System for Digital Images"},
				{title: "Author:", value: 'D. Mantellini, G. Neglia, S. Vestita'},
				{title: "GitHub:", html: '<a href="https://github.com/saso93/recode">https://github.com/saso93/recode</a>'},
				{title: "Image Editor:", html: '<a href="https://github.com/viliusle/miniPaint">https://github.com/viliusle/miniPaint</a>'},
			],
		};
		this.POP.show(settings);
	}

}

export default Help_about_class;
