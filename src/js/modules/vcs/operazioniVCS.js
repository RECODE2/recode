import Dialog_class from "../../libs/popup";
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';
import filesaver from './../../../../node_modules/file-saver/FileSaver.min.js';
import Base_layers_class from './../../../js/core/base-layers';
import Base_gui_class from './../../../js/core/base-gui';
import Helper_class from './../../libs/helpers.js';

var cytoscape = require('cytoscape');
var cydagre = require('cytoscape-dagre');
var dagre = require('dagre');

cytoscape.use(cydagre, dagre); // register extension
/**
 * In questa classe ci sono le seguenti funzionalità:
 * - new branch
 * - merge (e conflict resolving)
 * - add revision 
 */

class OperazioniVCS {

	constructor() {
		this.POP = new Dialog_class();
		this.Helper = new Helper_class();
	}

	newBranch() {
		var settings = {
			title: 'Branch - Not available yet 1',
			params: [
				{ title: "AAAA:", value: "XXX XXX" },
				{ title: "BBBB:", value: "Test test" },
				{ title: "CCCC:", value: "Prova prova" },
			],
		};
		this.POP.show(settings);
	}

	merge() {

		//PRENDIAMO IL JSON
		$.ajax({

			url: 'http://localhost:8081/readjson',
			type: 'POST',
			success: function (imgJson) {
				console.log("IMG JSON INFO: " + JSON.stringify(imgJson.info));
				$.ajax({
					url: 'http://localhost:8081/controllaselezionerepo',
					type: 'POST',
					success: function (repo) {
						if (repo) {

							$.ajax({
								url: 'http://localhost:8081/revg',
								type: 'POST',
								success: function (result) {
									this.POP = new Dialog_class();
									this.Helper = new Helper_class();
									this.POP.hide();
									var Base_layers = new Base_layers_class();
									var settings = {
										title: 'Merge',
										on_load: function () {

											/**
 * Function created by NEGLIA-VESTITA
 * This function is used in operazioniVCS.js (Merge)
 * @param {*} jsonObject 
 * @param {*} ctx 
 */
											function createCanvasForMerge(jsonObject, contesto) {
												for (var i = 0; i < jsonObject.layers.length; i++) {

													if (jsonObject.layers[i].type != null) {

														var value = jsonObject.layers[i];
														var _this = this;

														if (value.type == 'image') {

															console.log("value: HO RICONOSCIUTO CHE IL TIPO E' UN'IMMAGINE!!!");

															//add image data
															value.link = null;
															for (var j in jsonObject.data) {
																if (jsonObject.data[j].id == value.id) {
																	value.data = jsonObject.data[j].data;
																}
															}

															if (value.link == null) {
																if (typeof value.data == 'object') {
																	//load actual image
																	if (value.width == 0)
																		value.width = value.data.width;
																	if (value.height == 0)
																	value.height = value.data.height;
																	value.link = value.data.cloneNode(true);
																	/* value.link.onload = function () {
																		config.need_render = true;
																	}; */
																	value.data = null;
																}
																else if (typeof value.data == 'string') {
																	//try loading as imageData
																	value.link = new Image();
																	value.link.onload = function () {
																		//update dimensions
																		if (value.width == 0)
																			value.width = value.link.width;
																		if (value.height == 0)
																			value.height = value.link.height;
																		if (value.width_original == null)
																			value.width_original = value.width;
																		if (value.height_original == null)
																			value.height_original = value.height;
																		//free data
											
																		value.data = null;
																		Base_layers.autoresize(value.width, value.height, value.id, false);
																		Base_layers.render_object(contesto, value);

																		/* value.link.onload = function () {
																			config.need_render = true;
																		}; */
																		//resolve(true);
																	};
																	value.link.src = value.data;
																}
																else {
																	alertify.error('Error: can not load image.');
																}
															}
														}


														console.log("LAYER ATTUALE: " + value.id);

														var initial_x = null;
														var initial_y = null;
														if (value.x != null && value.y != null && value.width != null && value.height != null) {

															initial_x = value.x;
															initial_y = value.y;
															value.x = 0;
															value.y = 0;
														}

														Base_layers.convert_layers_to_canvas(contesto, value.id);

														if (initial_x != null && initial_x != null) {
															value.x = initial_x;
															value.y = initial_y;
														}
														Base_layers.render_object(contesto, value);
													}
													else {
														Base_layers.convert_layers_to_canvas(contesto, value);
													}
												}
											}


											//this.Base_layers = new Base_layers_class();


											/* INIZIO REVG */

											var popupx = document.getElementById('popup');
											popupx.style.left = "20%";
											popupx.style.right = "20%";
											popupx.style.width = "60%";

											var divRevg = document.createElement('div');
											document.getElementById('dialog_content').style.height = "400px";
											divRevg.setAttribute('id', 'cy');
											//divRevg.innerHTML="ciao questa e' una div con id: "+divRevg.getAttribute('id');
											divRevg.style.height = "50%";
											divRevg.style.marginTop = "5px";
											divRevg.style.position = "relative";
											divRevg.style.left = "0";
											divRevg.style.top = "0";
											divRevg.style.zIndex = "999";
											divRevg.style.border = "1px solid gray";


											document.querySelector('#popup #dialog_content').appendChild(divRevg);

											/* INIZIO PREVIEW MINICANVAS */
											var divJSON = document.createElement('div');
											divJSON.setAttribute('id', 'divjson');
											divJSON.style.height = "40%";
											divJSON.style.position = "relative";
											divJSON.style.marginTop = "5px";

											var divMinicanvas1 = document.createElement('div');
											divMinicanvas1.setAttribute('id', 'divminicanvas1');
											divMinicanvas1.style.height = "100%";
											divMinicanvas1.style.width = "30%";
											divMinicanvas1.style.border = "1px solid gray";
											divMinicanvas1.style.cssFloat = "left";


											var divMinicanvas2 = document.createElement('div');
											divMinicanvas2.setAttribute('id', 'divminicanvas2');
											divMinicanvas2.style.height = "100%";
											divMinicanvas2.style.width = "40%";
											divMinicanvas2.style.border = "1px solid gray";
											divMinicanvas2.style.cssFloat = "left";


											var divMinicanvas3 = document.createElement('div');
											divMinicanvas3.setAttribute('id', 'divminicanvas3');
											divMinicanvas3.style.height = "100%";
											divMinicanvas3.style.width = "30%";
											divMinicanvas3.style.border = "1px solid gray";
											divMinicanvas3.style.cssFloat = "left";





											//	var fname = "IMGTEMP.png";

											//create temp canvas
											var canvas = document.createElement('canvas');
											canvas.setAttribute('id', 'minicanvas1');
											var ourctx = canvas.getContext("2d");
											//	var ctx = canvas.getContext("2d");
											canvas.width = imgJson.info.width;
											canvas.height = imgJson.info.height;

											document.querySelector('#popup #dialog_content').appendChild(divJSON);
											document.querySelector('#popup #dialog_content #divjson').appendChild(divMinicanvas1);
											document.querySelector('#popup #dialog_content #divjson').appendChild(divMinicanvas2);
											document.querySelector('#popup #dialog_content #divjson').appendChild(divMinicanvas3);


											var cy = cytoscape({
												container: document.getElementById('cy'),
												boxSelectionEnabled: false,
												autounselectify: true
											});



											cy.style().selector('node').style({
												'content': 'data(id)',
												'text-opacity': 0.5,
												'text-valign': 'center',
												'text-halign': 'right'
											}).update();

											cy.style().selector('edge').style({
												'curve-style': 'bezier',
												'width': 4,
												'target-arrow-shape': 'triangle',
												'line-color': '#9dbaea',
												'target-arrow-color': '#9dbaea'
											}).update();


											for (var i = 0; i < result.length; i++) {

												if (result[i].tipo == "Com") {
													cy.add({
														data: { id: result[i].nome }
													}).style({ 'background-color': '#ff6600' });
												}
												else {
													cy.add({
														data: { id: result[i].nome }
													}).style({ 'background-color': '#03acac' });
												}

											}

											for (var i = 0; i < result.length; i++) {

												if (result[i].padre1 != 'init') {
													cy.add({
														data: {
															id: 'edge' + i,
															source: result[i].padre1,
															target: result[i].nome
														}
													});

													if (result[i].padre2 != '') {
														cy.add({
															data: {
																id: 'edgex' + i,
																source: result[i].padre2,
																target: result[i].nome
															}
														});
													}
												}
											}

											cy.elements().layout({ name: 'dagre', rankDir: 'LR' }).run();
											cy.autolock(true);



											cy.nodes().on("click", function (evt) {
												console.log("Result: " + result);
												document.querySelector('#divminicanvas1').appendChild(canvas);
												//QUI AGGIUNGERÒ COSA SUCCEDE QUANDO UN UTENTE CLICCA UN NODO
												var node = evt.target;
												alert("Questo nodo ha id: " + node.id());
											});
											/*FINE REVG*/

											createCanvasForMerge(imgJson, ourctx);
											canvas.setAttribute('id', 'minicanvas1');
											canvas.setAttribute('class', 'transparent');
											canvas.style.height = "100%";
											canvas.style.width = "100%";

											var canvas2 = document.createElement('canvas');
											var ctx2 = canvas2.getContext("2d");
											canvas2.width = imgJson.info.width;
											canvas2.height = imgJson.info.height;

											createCanvasForMerge(imgJson, ctx2);

											canvas2.setAttribute('id', 'minicanvas2');
											canvas2.setAttribute('class', 'transparent');
											canvas2.style.height = "100%";
											canvas2.style.width = "100%";

											var canvas3 = document.createElement('canvas');
											var ctx3 = canvas3.getContext("2d");
											canvas3.width = imgJson.info.width;
											canvas3.height = imgJson.info.height;

											createCanvasForMerge(imgJson, ctx3);

											canvas3.setAttribute('id', 'minicanvas3');
											canvas3.setAttribute('class', 'transparent');
											canvas3.style.height = "100%";
											canvas3.style.width = "100%";

											document.querySelector('#divminicanvas2').appendChild(canvas2);
											document.querySelector('#divminicanvas3').appendChild(canvas3);

										},
										onFinish() {
											alert("Hai cliccato onFinish!!!");
										}
									};
									this.POP.show(settings);
								}
							});
						}
						else {
							alertify.error("Non hai ancora selezionato la repository!");
						}
					}
				});

			}
		});



	}



	addRevision() {
		var settings = {
			title: 'Add revision - Not available yet 2',
			params: [
				{ title: "AAAA:", value: "XXX XXX" },
				{ title: "BBBB:", value: "Test test" },
				{ title: "CCCC:", value: "Prova prova" },
			],
		};
		this.POP.show(settings);
	}

	pippo() {
		alert("yayo");
	}

}
export default OperazioniVCS;