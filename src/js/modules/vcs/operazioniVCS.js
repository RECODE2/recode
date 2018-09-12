import Dialog_class from "../../libs/popup";
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';
import Base_layers_class from './../../../js/core/base-layers';
import Helper_class from './../../libs/helpers.js';
import merge from './../../../../merge';
import File_open_class from "./../file/open.js";
import Base_selection_class from "./../../core/base-selection"
import filesaver from './../../../../node_modules/file-saver/FileSaver.min.js';
var request = require('ajax-request');


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
							var node2;
							var open = new File_open_class();
							var Base_layers = new Base_layers_class();
							var immagineJson;
							var selezionaDiv1 = true;
							var selezionato1 = false;
							var selezionato2 = false;
							var imgJson1;
							var imgJson2;
							var imgJson3;
							var imgJsonA;
							var imgJsonB;
							var imgJsonX;
							var imgJsonMerge;
							var imgJsonMerge2;
							var imgJsonMergeX;
							var controllomerge = false;
							var idPadre2;
							var primoPadre;
							var settings = {
								title: 'Merge',
								on_load: function () {

									alertify.warning("Assicurati di aver effettuato il commit prima di procedere con la prova del merge..");
									/**
									* Function created by NEGLIA-VESTITA
									* This function is used in operazioniVCS.js (Merge)
									* @param {*} jsonObject 
									* @param {*} contesto 
									*/
									function createCanvasForMerge(jsonObject, contesto) {
										//var json = JSON.parse(JSON.stringify(jsonObject));
										var json = jsonObject;
										for (var i in json.layers) {
											var value = json.layers[i];
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
												for (var j in json.data) {
													if (json.data[j].id == value.id) {
														value.data = json.data[j].data;
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
															for (var i in json.layers) {
																var value = json.layers[i];
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
									popupx.style.left = "55%";
									popupx.style.width = "40%";

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
									divJSON.style.height = "35%";
									divJSON.style.position = "relative";
									divJSON.style.marginTop = "5px";

									var divSpan = document.createElement('div');
									divSpan.setAttribute('id', 'divspan');
									divSpan.style.height = '5%';
									divSpan.style.position = "relative";
									divSpan.style.marginTop = "5px";


									var divSpan1 = document.createElement('div');
									divSpan1.setAttribute('id', 'divspan1');
									divSpan1.style.height = "100%";
									divSpan1.style.width = "48%";
									divSpan1.style.cssFloat = "left";

								

									var divSpan2 = document.createElement('div');
									divSpan2.setAttribute('id', 'divspan2');
									divSpan2.style.height = "100%";
									divSpan2.style.width = "48%";
									divSpan2.style.cssFloat = "left";


									var span1 = document.createElement('span');
									span1.setAttribute('id', 'span1');
									span1.style.marginLeft = "30%";
									span1.style.fontSize = "30px";
									span1.innerHTML = "&#8249;";

									var span2 = document.createElement('span');
									span2.setAttribute('id', 'span2');
									span2.style.marginLeft = "30%";
									span2.style.fontSize = "30px";
									span2.innerHTML = "&#8250;";

									var span1b = document.createElement('span');
									span1b.setAttribute('id', 'span1b');
									span1b.style.marginLeft = "30%";
									span1b.style.fontSize = "30px";
									span1b.innerHTML = "&#8249;";

									var span2b = document.createElement('span');
									span2b.setAttribute('id', 'span2b');
									span2b.style.marginLeft = "30%";
									span2b.style.fontSize = "30px";
									span2b.innerHTML = "&#8250;";

									var divMinicanvas1 = document.createElement('div');
									divMinicanvas1.setAttribute('id', 'divminicanvas1');
									divMinicanvas1.style.height = "100%";
									divMinicanvas1.style.width = "48%";
									divMinicanvas1.style.border = "1px solid gray";
									divMinicanvas1.style.cssFloat = "left";

									var divMinicanvas3 = document.createElement('div');
									divMinicanvas3.setAttribute('id', 'divminicanvas3');
									divMinicanvas3.style.height = "100%";
									divMinicanvas3.style.width = "48%";
									divMinicanvas3.style.border = "1px solid gray";
									divMinicanvas3.style.cssFloat = "left";

									//create temp canvas
									var canvas = document.createElement('canvas');
									canvas.setAttribute('id', 'minicanvas1');
									var ourctx = canvas.getContext("2d");


								

									var canvas3 = document.createElement('canvas');
									var ctx3 = canvas3.getContext("2d");



									document.querySelector('#popup #dialog_content').appendChild(divJSON);
									document.querySelector('#popup #dialog_content').appendChild(divSpan);
									document.querySelector('#popup #dialog_content #divspan').appendChild(divSpan1);
									document.querySelector('#popup #dialog_content #divspan').appendChild(divSpan2);

									document.querySelector('#divspan1').appendChild(span1);
									document.querySelector('#divspan1').appendChild(span2);


									document.querySelector('#divspan2').appendChild(span1b);
									document.querySelector('#divspan2').appendChild(span2b);

									document.querySelector('#popup #dialog_content #divjson').appendChild(divMinicanvas1);
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
												//immagineJson = imgJson;


											
											/* 	var imgJsonS = JSON.stringify(imgJson, null, '\t');
												var blob = new Blob([imgJsonS], {type: "text/plain"});
												//var data = window.URL.createObjectURL(blob); //html5
												filesaver.saveAs(blob, "imgJson.json"); */

												if (selezionaDiv1 == true) {
													node = evt.target;

													canvas.width = imgJson.info.width;
													canvas.height = imgJson.info.height;
													ourctx.clearRect(0, 0, canvas.width, canvas.height);
													createCanvasForMerge(imgJson, ourctx);
													canvas.setAttribute('id', 'minicanvas1');
													canvas.setAttribute('class', 'transparent');
													canvas.style.height = "100%";
													canvas.style.width = "100%";
													selezionaDiv1 = false;
													selezionato1 = true;
													document.querySelector('#divminicanvas1').appendChild(canvas);
													imgJson1 = JSON.parse(JSON.stringify(merge.setMergeSx(imgJson)));

													primoPadre = node.id();
													
													$.ajax({
														url: 'http://localhost:8081/readjson',
														type: 'POST',
														data: {
															idCorrente: primoPadre,
															nomeCorrente: node.data('nome'),
															tipo: node.data('tipo'),
															path: node.data('path'),
															branch: node.data('branch')
														}
													})

												
												}

												else {

													ctx3.clearRect(0, 0, canvas3.width, canvas3.height);
													canvas3.width = imgJson.info.width;
													canvas3.height = imgJson.info.height;
													createCanvasForMerge(imgJson, ctx3);
													canvas3.setAttribute('id', 'minicanvas3');
													canvas3.setAttribute('class', 'transparent');
													canvas3.style.height = "100%";
													canvas3.style.width = "100%";
													selezionaDiv1 = true;
													selezionato2 = true;
													document.querySelector('#divminicanvas3').appendChild(canvas3);
													imgJson2 = JSON.parse(JSON.stringify(merge.setMergeDx(imgJson)));
												

													
												
													$.ajax({
														url: 'http://localhost:8081/readjson',
														type: 'POST',
														data: {
															idCorrente2: node.id()
														}
													})
												}



												/**
												 * CONTROLLA IL MERGE.. SE COMMENTIAMO IL MERGE, L'INCREMENT FUNZIONA BENE..
												 */
												if (selezionato1 == true && selezionato2 == true) {													

											 		imgJsonA = JSON.parse(JSON.stringify(imgJson1));
													imgJsonB = JSON.parse(JSON.stringify(imgJson2));
													imgJsonMergeX = merge.mergeDG(imgJson1, imgJson2);


											
													//imgJsonMergeX = JSON.parse(JSON.stringify(imgJsonMerge));		

													var base_selection = new Base_selection_class();
													open.load_json(imgJsonMergeX);
													base_selection.reset_selection();
												}


												
												$('#span1').click(function () {
													imgJsonA = JSON.parse(JSON.stringify(imgJson1));
													imgJsonB = JSON.parse(JSON.stringify(imgJson2));
													
													imgJsonX = merge.decrementMerge(imgJsonA);
													imgJsonMerge = merge.mergeDG(imgJsonX, imgJsonB);
													imgJsonMergeX = JSON.parse(JSON.stringify(imgJsonMerge));
												
													var base_selection = new Base_selection_class();
													open.load_json(imgJsonMergeX);
													base_selection.reset_selection();

												})

												
												$('#span2').click(function () {
													imgJsonA = JSON.parse(JSON.stringify(imgJson1));
													imgJsonB = JSON.parse(JSON.stringify(imgJson2));

													imgJsonX = merge.incrementMerge(imgJsonA);

													imgJsonMerge = merge.mergeDG(imgJsonX, imgJsonB);
													imgJsonMergeX = JSON.parse(JSON.stringify(imgJsonMerge));
													var base_selection = new Base_selection_class();
													open.load_json(imgJsonMergeX);
													base_selection.reset_selection();
												})

												$('#span1b').click(function () {
													imgJsonA = JSON.parse(JSON.stringify(imgJson1));
													imgJsonB = JSON.parse(JSON.stringify(imgJson2));

													imgJsonX = merge.decrementMerge(imgJsonB);

													imgJsonMerge = merge.mergeDG(imgJsonA, imgJsonX);
													imgJsonMergeX = JSON.parse(JSON.stringify(imgJsonMerge));


											
													var base_selection = new Base_selection_class();
													open.load_json(imgJsonMergeX);
													base_selection.reset_selection();
												})


												$('#span2b').click(function () {

													imgJsonA = JSON.parse(JSON.stringify(imgJson1));
													imgJsonB = JSON.parse(JSON.stringify(imgJson2));

													imgJsonX = merge.incrementMerge(imgJsonB);

													imgJsonMerge = merge.mergeDG(imgJsonA, imgJsonX);
													imgJsonMergeX = JSON.parse(JSON.stringify(imgJsonMerge));


											
													var base_selection = new Base_selection_class();
													open.load_json(imgJsonMergeX);
													base_selection.reset_selection();
												})
											
											}
										})
									
									});
								},
								on_finish: function () {

									var imgJsonSS = JSON.stringify(imgJsonMergeX, null, '\t');
									var blob = new Blob([imgJsonSS], {type: "text/plain"});
									//var data = window.URL.createObjectURL(blob); //html5
									filesaver.saveAs(blob, "imgJsonMerge.json");

									request({
										url: 'http://localhost:8081/merge',
										method: 'POST',
										data: {
											jsonMerge: imgJsonMergeX,
											nomeFile: "merge.json",
											idCorrente: primoPadre,
											nomeCorrente: node.data('nome'),
											branch: node.data('branch'),
											idCorrente2: node.id()
										}
									}, function(err, res, body) {
										if(err) {throw err;}
										else{
											alertify.success("Merge effettuato..");
										}
										
									});
							

								}
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
