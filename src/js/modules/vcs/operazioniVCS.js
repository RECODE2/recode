import Dialog_class from "../../libs/popup";
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';
import Base_layers_class from './../../../js/core/base-layers';
import Helper_class from './../../libs/helpers.js';


var cytoscape = require('cytoscape');
var cydagre = require('cytoscape-dagre');
var dagre = require('dagre');
cytoscape.use(cydagre, dagre);


/**
 * In questa classe ci sono le seguenti funzionalità:
 * - merge + conflict resolving
 **/

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
							var node;
							var Base_layers = new Base_layers_class();
							var immagineJson;
							var settings = {
								title: 'Merge',
								on_load: function () {
									/**
									* Function created by NEGLIA-VESTITA
									* This function is used in operazioniVCS.js (Merge)
									* @param {*} jsonObject 
									* @param {*} contesto 
									*/
									function createCanvasForMerge(jsonObject, contesto) {
										for (var i in jsonObject.layers) {
											var value = jsonObject.layers[i];
											var initial_x = null;
											var initial_y = null;
											if (value.x != null && value.y != null && value.width != null && value.height != null) {
												initial_x = value.x;
												initial_y = value.y;
												value.x = 0;
												value.y = 0;
											}

											if (initial_x != null && initial_x != null) {
												value.x = initial_x;
												value.y = initial_y;
											}

											if (value.type == 'image') {
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

														value.data = null;
													}
													else if (typeof value.data == 'string') {
														value.link = new Image();
														value.link.onload = function () {
															//render canvas
															for (var i in jsonObject.layers) {
																var value = jsonObject.layers[i];
																contesto.globalAlpha = value.opacity / 100;
																contesto.globalCompositeOperation = value.composition;
																Base_layers.render_object(contesto, value);
															}
														};
														value.link.src = value.data;
													}
													else {
														alertify.error('Error: can not load image.');
													}
												}
											}
											Base_layers.render_object(contesto, value);
										}
									}

									/* INIZIO REVG */
									var popupx = document.getElementById('popup');
									popupx.style.left = "20%";
									popupx.style.right = "20%";
									popupx.style.width = "60%";

									var divRevg = document.createElement('div');
									document.getElementById('dialog_content').style.height = "400px";
									divRevg.setAttribute('id', 'cy');
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

									//create temp canvas
									var canvas = document.createElement('canvas');
									canvas.setAttribute('id', 'minicanvas1');
									var ourctx = canvas.getContext("2d");
									canvas.width = "800";
									canvas.height = "600";


									var canvas2 = document.createElement('canvas');




									var canvas3 = document.createElement('canvas');
									var ctx3 = canvas3.getContext("2d");
									canvas3.width = "800";
									canvas3.height = "600";

									var selezionaDiv1= true;


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
										'text-opacity': 1,
										'text-valign': 'center',
										'text-halign': 'center'
									}).update();

									cy.style().selector('edge').style({
										'curve-style': 'bezier',
										'width': 4,
										'target-arrow-shape': 'triangle',
										'line-color': '#9dbaea',
										'target-arrow-color': '#9dbaea'
									}).update();

                                //NODI
                                for (var i = 0; i < result.length; i++) {
                                    if (result[i].tipo == "Com") {
                                        cy.add({
                                            data: {
                                                id: result[i].ID,
                                                nome: result[i].nomeFile,
                                                tipo: result[i].tipo,
                                                path: result[i].path,
                                                dataModifica: result[i].dataModifica,
                                                padre1: result[i].padre1,
                                                padre2: result[i].padre2,
                                                branch: result[i].branch,
                                                tipo: result[i].tipo,
                                                utente: result[i].utente
                                            }
                                        }).style({ 'background-color': '#0066ff' });
                                    }
                                    else if (result[i].tipo == "Rev") {
                                        cy.add({
                                            data: {
                                                id: result[i].ID,
                                                nome: result[i].nomeFile,
                                                tipo: result[i].tipo,
                                                path: result[i].path,
                                                dataModifica: result[i].dataModifica,
                                                padre1: result[i].padre1,
                                                padre2: result[i].padre2,
                                                branch: result[i].branch,
                                                tipo: result[i].tipo,
                                                utente: result[i].utente
                                            }
                                        }).style({ 'background-color': '#ffcc00' });
                                    }
                                    else if (result[i].tipo == "Mer") {
                                        cy.add({
                                            data: {
                                                id: result[i].ID,
                                                nome: result[i].nomeFile,
                                                tipo: result[i].tipo,
                                                path: result[i].path,
                                                dataModifica: result[i].dataModifica,
                                                padre1: result[i].padre1,
                                                padre2: result[i].padre2,
                                                branch: result[i].branch,
                                                tipo: result[i].tipo,
                                                utente: result[i].utente
                                            }
                                        }).style({ 'background-color': '#ff3300' });
                                    }
                                }

                                //ARCHI
                                for (var i = 0; i < result.length; i++) {
                                    if (result[i].padre1 != 'init') {
                                        cy.add({
                                            data: {
                                                id: 'edge' + i,
                                                source: result[i].padre1,
                                                target: result[i].ID
                                            }
                                        });
                                        if (result[i].padre2 != 'init') {
                                            cy.add({
                                                data: {
                                                    id: 'edgex' + i,
                                                    source: result[i].padre2,
                                                    target: result[i].ID
                                                }
                                            });
                                        }
                                    }
                                }

									cy.elements().layout({ name: 'dagre', rankDir: 'LR' }).run();
									cy.autolock(true);


									cy.nodes().on("click", function (evt) {
										node = evt.target;

										$.ajax({
											url: 'http://localhost:8081/readjson',
											type: 'POST',
											data: {
												idCorrente: node.id(),
												nomeCorrente: node.data('nome'),
												tipo: node.data('tipo'),
												path: node.data('path'),
												branch: node.data('branch')
											}
										});

										$.ajax({
											url: 'http://localhost:8081/caricaImmagine',
											type: 'POST',
											success: function (imgJson) {
												immagineJson = imgJson;
												node = evt.target;
												console.log("SELEZIONADIV1 PRIMA DEL CONTROLLO... " + selezionaDiv1);
											
												if(selezionaDiv1==true){
													ourctx.clearRect(0, 0, canvas.width, canvas.height);
													createCanvasForMerge(imgJson, ourctx);
													canvas.setAttribute('id', 'minicanvas1');
													canvas.setAttribute('class', 'transparent');
													canvas.style.height = "100%";
													canvas.style.width = "100%";
													selezionaDiv1=false;
													document.querySelector('#divminicanvas1').appendChild(canvas);
												}
												else{
													ctx3.clearRect(0, 0, canvas3.width, canvas3.height);
													createCanvasForMerge(imgJson, ctx3);
													canvas3.setAttribute('id', 'minicanvas3');
													canvas3.setAttribute('class', 'transparent');
													canvas3.style.height = "100%";
													canvas3.style.width = "100%";
													selezionaDiv1=true;
													document.querySelector('#divminicanvas3').appendChild(canvas3);
												}

												// ctx2 è quello del MERGE
												var ctx2 = canvas2.getContext("2d");
												canvas2.width = imgJson.info.width;
												canvas2.height = imgJson.info.height;
												//createCanvasForMerge(imgJson, ctx2);
												canvas2.setAttribute('id', 'minicanvas2');
												canvas2.setAttribute('class', 'transparent');
												canvas2.style.height = "100%";
												canvas2.style.width = "100%";
											}
										})

/* 										$.ajax({
											url: 'http://localhost:8081/caricaImmagine',
											type: 'POST',
											data: {
												idCorrente: node.id(),
												nomeCorrente: node.data('nome'),
												tipo: node.data('tipo'),
												path: node.data('path')
											},
											success: function (imgJson) {
												immagineJson = imgJson;
												node = evt.target;
												ourctx.clearRect(0, 0, canvas.width, canvas.height);
												
												if(selezionaDiv1==true){
													createCanvasForMerge(imgJson, ourctx);
													canvas.setAttribute('id', 'minicanvas1');
													canvas.setAttribute('class', 'transparent');
													canvas.style.height = "100%";
													canvas.style.width = "100%";
													selezionaDiv1=false;
													document.querySelector('#divminicanvas1').appendChild(canvas);
												}
												else{
													createCanvasForMerge(imgJson, ctx3);
													canvas3.setAttribute('id', 'minicanvas3');
													canvas3.setAttribute('class', 'transparent');
													canvas3.style.height = "100%";
													canvas3.style.width = "100%";
													selezionaDiv1=true;
													document.querySelector('#divminicanvas3').appendChild(canvas3);
												}

												// ctx2 è quello del MERGE
												var ctx2 = canvas2.getContext("2d");
												canvas2.width = imgJson.info.width;
												canvas2.height = imgJson.info.height;
												//createCanvasForMerge(imgJson, ctx2);
												canvas2.setAttribute('id', 'minicanvas2');
												canvas2.setAttribute('class', 'transparent');
												canvas2.style.height = "100%";
												canvas2.style.width = "100%";
											}

										}) */
									});
								},
								on_finish: function () {
									/* Quì inserirò il codice che consentirà di effettuare
										il merge tra i due json selezionati dall'utente */
								},
								/*FINE REVG*/
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
}
export default OperazioniVCS;
