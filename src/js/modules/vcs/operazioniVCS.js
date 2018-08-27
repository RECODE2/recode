import Dialog_class from "../../libs/popup";

/**
 * In questa classe ci sono le seguenti funzionalità:
 * - new branch
 * - merge (e conflict resolving)
 * - add revision 
 */

class OperazioniVCS {

	constructor() {
		this.POP = new Dialog_class();
	}

    newBranch() {		
		var settings = {
			title: 'Branch - Not available yet 1',
			params: [
				{title: "AAAA:", value: "XXX XXX"},
				{title: "BBBB:", value: "Test test"},
				{title: "CCCC:", value: "Prova prova"},
			],
		};
		this.POP.show(settings);
    }
    
    merge() {		
		var settings = {
			title: 'Merge - Not available yet 2',
			params: [
				{title: "AAAA:", value: "XXX XXX"},
				{title: "BBBB:", value: "Test test"},
				{title: "CCCC:", value: "Prova prova"},
			],
		};
		this.POP.show(settings);
    }
    
    addRevision() {		
		var settings = {
			title: 'Add revision - Not available yet 2',
			params: [
				{title: "AAAA:", value: "XXX XXX"},
				{title: "BBBB:", value: "Test test"},
				{title: "CCCC:", value: "Prova prova"},
			],
		};
		this.POP.show(settings);
	}

}
export default OperazioniVCS;
