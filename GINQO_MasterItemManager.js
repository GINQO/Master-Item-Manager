define(['jquery', 'qlik', 'text!./template.ng.html', 'text!./dialog-template.ng.html', 'text!./dialog-template2.ng.html', 'text!./dialog-template3.ng.html', 'text!./dialog-template4.ng.html', './lib/swal'],
	function ($, qlik, template, dialogTemplate, dialogTemplate2, dialogTemplate3, dialogTemplate4) {
		'use strict';
	
		
		return {
			initialProperties:{

				qMeasureListDef: {
					qType: "measure",
					qData: {
						qMeasure: "/qMeasure"
					}
				},
				qDimensionListDef: {
					qType: "dimension",
					qData: {
						qDim: "/qDim",
						qDimInfos: "/qDimInfos"
					}
				},
				qVariableListDef: {
					qType: "variable",
					qShowReserved: true,
					qShowConfig: true
				},
			},
			template: template,
			controller: ['$scope', 'luiDialog', function ($scope, luiDialog) {
				
				const enigma = $scope.component.model.enigmaModel;
				var app = qlik.currApp(this);
				$scope.title = "GINQO Governed Metric Button";

				$scope.openDialog = function () {
					luiDialog.show({
						template: dialogTemplate,
						input: {
							name: $scope.name
						},
						controller: ['$scope', '$element', function ($scope, $element) {
							var measurevalues = app.createTable(['%MI%MeasureName', '%MI%MeasureDescription', '%MI%MeasureLabelExpression', '%MI%MeasureExpression', '%MI%MeasureTags', '%MI%MeasureColor', '%MI%MeasureId'], {
								rows: 200
							});
							var dimensionvalues = app.createTable(['%MI%DimensionName', '%MI%DimensionField', '%MI%DimensionLabelExpression', '%MI%DimensionDescription', '%MI%DimensionColor', '%MI%DimensionTags', '%MI%DimensionId'], {
								rows: 200
							});
							$scope.measurevalues = measurevalues;
							$scope.dimensionvalues = dimensionvalues;
							console.log($scope.dimensionvalues);
							$element.find('#dialogSelect').on('click', function () {
								console.log("element clicked")
								if (this.hasAttribute("data-value")) {
									var value = parseInt(this.getAttribute("data-value"), 10),
										dim = 0;
									self.selectValues(dim, [value], true);
								}
							});
							console.log($element);
						}]
					});
				};
				$scope.openDialog2 = function () {
					luiDialog.show({
						template: dialogTemplate2,
						input: {
							name: $scope.name
						},
						controller: ['$scope', '$element', function ($scope, $element) {
							var measurevalues = app.createTable(['%MI%MeasureName', '%MI%MeasureDescription', '%MI%MeasureLabelExpression', '%MI%MeasureExpression', '%MI%MeasureTags', '%MI%MeasureColor', '%MI%MeasureId'], {
								rows: 200
							});
							var dimensionvalues = app.createTable(['%MI%DimensionName', '%MI%DimensionField', '%MI%DimensionLabelExpression', '%MI%DimensionDescription', '%MI%DimensionColor', '%MI%DimensionTags', '%MI%DimensionId'], {
								rows: 200
							});
							$scope.measurevalues = measurevalues;
							$scope.dimensionvalues = dimensionvalues;
							$element.find('#dialogSelect').on('click', function () {
								console.log("element clicked")
								if (this.hasAttribute("data-value")) {
									var value = parseInt(this.getAttribute("data-value"), 10),
										dim = 0;
									self.selectValues(dim, [value], true);
								}
							});
							console.log($element);
						}]
					});
				};
				$scope.openDialogDim = function () {
					luiDialog.show({
						template: dialogTemplate3,
						input: {
							name: $scope.name
						},
						controller: ['$scope', '$element', function ($scope, $element) {
							var measurevalues = app.createTable(['%MI%MeasureName', '%MI%MeasureDescription', '%MI%MeasureLabelExpression', '%MI%MeasureExpression', '%MI%MeasureTags', '%MI%MeasureColor', '%MI%MeasureId'], {
								rows: 200
							});
							var dimensionvalues = app.createTable(['%MI%DimensionName', '%MI%DimensionField', '%MI%DimensionLabelExpression', '%MI%DimensionDescription', '%MI%DimensionColor', '%MI%DimensionTags', '%MI%DimensionId'], {
								rows: 200
							});
							$scope.measurevalues = measurevalues;
							$scope.dimensionvalues = dimensionvalues;
			
							
							// Create a table of all selected apps
							var appList = app.createTable(['id_u1'], {
								rows: 200
							});
			
							// Create Create Master Items Using the EngineAPI
							$scope.CreateDimension = function () {
								var arrayMeasures = [];
								var arrayDimensions = [];
										
											enigma.app.createSessionObject({
												qDimensionListDef: {
													qType: 'dimension',
													qData: {
														info: '/qDimInfos',
														dimension: '/qDim'
													},
													qMeta: {}
												},
												qInfo: {
													qId: "DimensionList",
													qType: "DimensionList"
												}
											}).then((list) => {
												list.getLayout().then((layout) => {
													layout.qDimensionList.qItems.forEach((element) => {
														console.log(element.qInfo.qId);
														arrayDimensions.push(element.qInfo.qId);
													})
												}).then(() => {
													dimensionvalues.rows.forEach(function (row, rowno) {
			
														if (!arrayDimensions.includes(row.cells[6].qText)) {
															enigma.app.createDimension({
																"qInfo": {
																	"qType": "dimension",
																	"qId": row.cells[6].qText.replace("-", "")
																},
																"qDim": {
																	//	"title": "something",
																	"qGrouping": "N",
																	"qLabelExpression": `${row.cells[2].qText.replace('-', '')}`,
																	"qFieldDefs": [
																		row.cells[1].qText.replace("-", "") //Dimension Field:
																	],
																	//"qFieldLabels": ["TEST"],
																	"title": row.cells[0].qText.replace("-", ""),
																	"coloring": {
																		"baseColor": {
																			"color": row.cells[4].qText.replace("-", ""), // Dimension Color:
																			"index": -1
																		},
																	},
																},
																"qMetaDef": {
																	"title": row.cells[0].qText.replace("-", ""), //Dimension Name
																	"description": row.cells[3].qText.replace("-", ""), //Desciption:
																	"tags": [row.cells[5].qText.replace("-", "")], //Tags
																}
															});
														} else {
															//swal("Duplicates found. Some dimensions may not have been imported.")
														}
													});
												
											})
			
											
											app.doReload(0, true, false);
			
											swal({
												text:"Dimensions Created.", 
												icon: "success",
											});
										
									});
			
			
			
			
							}
			
							$scope.UpdateDimension = function() {
								// For each element that exists in MIM Definition => Do something
								dimensionvalues.rows.forEach(row => {
									enigma.app.getDimension(row.cells[6].qText).then(reply =>{
										reply.setProperties({
											"qInfo": {
												"qType": "dimension",
												"qId": row.cells[6].qText.replace("-", "")
											},
											"qDim": {
												//	"title": "something",
												"qGrouping": "N",
												"qLabelExpression": `${row.cells[2].qText.replace('-', '')}`,
												"qFieldDefs": [
													row.cells[1].qText.replace("-", "") //Dimension Field:
												],
												//"qFieldLabels": ["TEST"],
												"title": row.cells[0].qText.replace("-", ""),
												"coloring": {
													"baseColor": {
														"color": row.cells[4].qText.replace("-", ""), // Dimension Color:
														"index": -1
													},
												},
											},
											"qMetaDef": {
												"title": row.cells[0].qText.replace("-", ""), //Dimension Name
												"description": row.cells[3].qText.replace("-", ""), //Desciption:
												"tags": [row.cells[5].qText.replace("-", "")], //Tags
											}
										}).then(reply => {
											swal({
												text:"Dimensions Updated.", 
												icon: "success",
											});
										})
									})
								});
							};
					
							$scope.DestroyDimension = function () {
								// The Engine API DestroyMeasure function: https://help.qlik.com/en-US/sense-developer/September2018/APIs/EngineAPI/services-Doc-DestroyMeasure.html
								console.log("Test")
			
								dimensionvalues.rows.forEach(element => {
									enigma.app.destroyDimension(element.cells[6].qText)
								})
								swal({
									text:"Dimensions Deleted.", 
									icon: "success",
								});
							//	console.log(dimensionvalues.rows)
							}
			
							
						
						}]
					});
				};
				$scope.openDialogMeas = function () {
					luiDialog.show({
						template: dialogTemplate4,
						input: {
							name: $scope.name
						},
						controller: ['$scope', '$element', function ($scope, $element) {
							var measurevalues = app.createTable(['%MI%MeasureName', '%MI%MeasureDescription', '%MI%MeasureLabelExpression', '%MI%MeasureExpression', '%MI%MeasureTags', '%MI%MeasureColor', '%MI%MeasureId'], {
								rows: 200
							});
							var dimensionvalues = app.createTable(['%MI%DimensionName', '%MI%DimensionField', '%MI%DimensionLabelExpression', '%MI%DimensionDescription', '%MI%DimensionColor', '%MI%DimensionTags', '%MI%DimensionId'], {
								rows: 200
							});
							$scope.measurevalues = measurevalues;
							$scope.dimensionvalues = dimensionvalues;
			
							
							// Create a table of all selected apps
							var appList = app.createTable(['id_u1'], {
								rows: 200
							});
			
							// Create Create Master Items Using the EngineAPI
							$scope.CreateMeasure = function () {
								var arrayMeasures = [];
								var arrayDimensions = [];
						
			
											enigma.app.createSessionObject({
												qMeasureListDef: {
													qType: 'measure',
													qData: {
														info: "/qMeasure"
													},
													qMeta: {}
												},
												qInfo: {
													qId: "MeasureList",
													qType: "MeasureList",
												}
											}).then((list) => {
												list.getLayout().then((layout) => {
													layout.qMeasureList.qItems.forEach((element) => {
														console.log(element.qInfo.qId);
														arrayMeasures.push(element.qInfo.qId);
													})
												}).then(() => {
													measurevalues.rows.forEach(function (row, rowno) {
														// If there exists a measureid already, don't create
														if (!arrayMeasures.includes(row.cells[6].qText)) {
															enigma.app.createMeasure({
																"qInfo": {
																	"qType": "measure",
																	"qId": row.cells[6].qText.replace("-", "")
																},
																"qMeasure": {
																	"qLabel": row.cells[0].qText.replace("-", ""),
																	"qDef": row.cells[3].qText.replace("-", ""),
																	"qGrouping": "N",
																	"qLabelExpression": `${row.cells[2].qText.replace("-", "")}`, // wrap this string in ='' so Qlik understands it as an expression
																	"qExpressions": [],
																	"coloring": {
																		"baseColor": {
																			"color": row.cells[5].qText.replace("-", ""),
																			"index": -1
																		},
																	},
																	"qActiveExpression": 0
																},
																"qMetaDef": {
																	"title": row.cells[0].qText.replace("-", ""),
																	"description": `${row.cells[1].qText.replace("-", "")}`, // Description:
																	"tags": [row.cells[4].qText.replace("-", "")], //Tags:
																}
															});
														} else {
															//swal("Duplicates found. Some measures may not have been imported")
														}
			
													});
												
											})
			
			
			
											app.doReload(0, true, false);
			
											swal({
												text:"Measures Created.", 
												icon: "success",
											});
										
									});
							}
			
							$scope.CreateDimension = function () {
								var arrayMeasures = [];
								var arrayDimensions = [];
								swal({
										title: "Create Master Items?",
										text: "",
										icon: "info",
										buttons: true,
										dangerMode: false,
									})
									.then((create) => {
										if (create) {
			
											enigma.app.createSessionObject({
												qDimensionListDef: {
													qType: 'dimension',
													qData: {
														info: '/qDimInfos',
														dimension: '/qDim'
													},
													qMeta: {}
												},
												qInfo: {
													qId: "DimensionList",
													qType: "DimensionList"
												}
											}).then((list) => {
												list.getLayout().then((layout) => {
													layout.qDimensionList.qItems.forEach((element) => {
														console.log(element.qInfo.qId);
														arrayDimensions.push(element.qInfo.qId);
													})
												}).then(() => {
													dimensionvalues.rows.forEach(function (row, rowno) {
			
														if (!arrayDimensions.includes(row.cells[6].qText)) {
															enigma.app.createDimension({
																"qInfo": {
																	"qType": "dimension",
																	"qId": row.cells[6].qText.replace("-", "")
																},
																"qDim": {
																	//	"title": "something",
																	"qGrouping": "N",
																	"qLabelExpression": `${row.cells[2].qText.replace('-', '')}`,
																	"qFieldDefs": [
																		row.cells[1].qText.replace("-", "") //Dimension Field:
																	],
																	//"qFieldLabels": ["TEST"],
																	"title": row.cells[0].qText.replace("-", ""),
																	"coloring": {
																		"baseColor": {
																			"color": row.cells[4].qText.replace("-", ""), // Dimension Color:
																			"index": -1
																		},
																	},
																},
																"qMetaDef": {
																	"title": row.cells[0].qText.replace("-", ""), //Dimension Name
																	"description": row.cells[3].qText.replace("-", ""), //Desciption:
																	"tags": [row.cells[5].qText.replace("-", "")], //Tags
																}
															});
														} else {
															//swal("Duplicates found. Some dimensions may not have been imported.")
														}
													});
												})
											})
			
											
											app.doReload(0, true, false);
			
											swal({
												title:"Dimension Master Items created!", 
												icon: "success",
											});
										} else {
											swal({
												title:"Dimension Master Items not created."
											});
										}
									});
			
			
			
			
							}
			
							$scope.UpdateMeasure = function() {
								// For each element that exists in MIM Definition => Do something
								measurevalues.rows.forEach(row => {
									enigma.app.getMeasure(row.cells[6].qText).then(reply =>{
										reply.setProperties({
											"qInfo": {
												"qType": "measure",
												"qId": row.cells[6].qText.replace("-", "")
											},
											"qMeasure": {
												"qLabel": row.cells[0].qText.replace("-", ""),
												"qDef": row.cells[3].qText.replace("-", ""),
												"qGrouping": "N",
												"qLabelExpression": `${row.cells[2].qText.replace("-", "")}`, // wrap this string in ='' so Qlik understands it as an expression
												"qExpressions": [],
												"coloring": {
													"baseColor": {
														"color": row.cells[5].qText.replace("-", ""),
														"index": -1
													},
												},
												"qActiveExpression": 0
											},
											"qMetaDef": {
												"title": row.cells[0].qText.replace("-", ""),
												"description": `${row.cells[1].qText.replace("-", "")}`, // Description:
												"tags": [row.cells[4].qText.replace("-", "")], //Tags:
											}
										}).then(reply => {
											swal({
												text:"Measure Master Items Updated.", 
												icon: "success",
											});
										})
									})
								});
							};
							$scope.UpdateDimension = function() {
								// For each element that exists in MIM Definition => Do something
								dimensionvalues.rows.forEach(row => {
									enigma.app.getDimension(row.cells[6].qText).then(reply =>{
										reply.setProperties({
											"qInfo": {
												"qType": "dimension",
												"qId": row.cells[6].qText.replace("-", "")
											},
											"qDim": {
												//	"title": "something",
												"qGrouping": "N",
												"qLabelExpression": `${row.cells[2].qText.replace('-', '')}`,
												"qFieldDefs": [
													row.cells[1].qText.replace("-", "") //Dimension Field:
												],
												//"qFieldLabels": ["TEST"],
												"title": row.cells[0].qText.replace("-", ""),
												"coloring": {
													"baseColor": {
														"color": row.cells[4].qText.replace("-", ""), // Dimension Color:
														"index": -1
													},
												},
											},
											"qMetaDef": {
												"title": row.cells[0].qText.replace("-", ""), //Dimension Name
												"description": row.cells[3].qText.replace("-", ""), //Desciption:
												"tags": [row.cells[5].qText.replace("-", "")], //Tags
											}
										}).then(reply => {
											swal({
												text:"Measures Updated."
											})
										})
									})
								});
							};
							// List all Master Items for Import
							$scope.ListImportMasterItems = function () {
								app.createGenericObject({
									qFieldListDef: {
										qShowHidden: true,
									}
								}, function (reply) {
									console.log(reply)
								});
							};
				
							// Destroy Master items
							$scope.DestroyAllMeasures = function () {
								swal({
										title: "Warning. This will purge all of your Master Items in this app. Are you sure you want to continue?",
										text: "Visualizations will NOT be affected.",
										icon: "warning",
										buttons: true,
										dangerMode: true,
									})
									.then((willDelete) => {
										if (willDelete) {
											var measureArray = [];
											var dimensionArray = [];
											enigma.app.createSessionObject({
												qMeasureListDef: {
													qType: 'measure',
													qData: {
														info: "/qMeasure"
													},
													qMeta: {}
												},
												qInfo: {
													qId: "MeasureList",
													qType: "MeasureList",
			
												}
											}).then((list) => {
												list.getLayout().then((layout) => {
													layout.qMeasureList.qItems.forEach((element) => {
														measureArray.push(element.qInfo.qId)
													})
												}).then(() => {
													console.log(measureArray);
													measureArray.forEach(element => {
														enigma.app.destroyMeasure(element);
													})
												});
											});
											enigma.app.createSessionObject({
												qDimensionListDef: {
													qType: 'dimension',
													qData: {
														info: '/qDimInfos',
														dimension: '/qDim'
													},
													qMeta: {}
												},
												qInfo: {
													qId: "DimensionList",
													qType: "DimensionList"
												}
											}).then((list) => {
												list.getLayout().then((layout) => {
													layout.qDimensionList.qItems.forEach((element) => {
														dimensionArray.push(element.qInfo.qId);
													})
												}).then(() => {
													console.log(dimensionArray);
													dimensionArray.forEach(element => {
														enigma.app.destroyDimension(element);
													})
												})
											})
											swal({
												title: "Master items have been deleted.", 
												icon: "success",
											});
										} else {
											swal({
												title:"Not deleted"
											});
										}
									});
			
			
							};
			
							$scope.DestroyDimension = function () {
								// The Engine API DestroyMeasure function: https://help.qlik.com/en-US/sense-developer/September2018/APIs/EngineAPI/services-Doc-DestroyMeasure.html
								console.log("Test")
			
								dimensionvalues.rows.forEach(element => {
									enigma.app.destroyDimension(element.cells[6].qText)
								})
							//	console.log(dimensionvalues.rows)
							}
			
							$scope.DestroyMeasure = function(){
								measurevalues.rows.forEach(element => {
									enigma.app.destroyMeasure(element.cells[6].qText)
								});
								swal({
									text:"Measures Deleted.", 
									icon: "success",
								});
							}
						
						}]
					});
				};
				var measurevalues = app.createTable(['%MI%MeasureName', '%MI%MeasureDescription', '%MI%MeasureLabelExpression', '%MI%MeasureExpression', '%MI%MeasureTags', '%MI%MeasureColor', '%MI%MeasureId'], {
					rows: 200
				});
				var dimensionvalues = app.createTable(['%MI%DimensionName', '%MI%DimensionField', '%MI%DimensionLabelExpression', '%MI%DimensionDescription', '%MI%DimensionColor', '%MI%DimensionTags', '%MI%DimensionId'], {
					rows: 200
				});
				$scope.measurevalues = measurevalues;
				$scope.dimensionvalues = dimensionvalues;

				
				// Create a table of all selected apps
				var appList = app.createTable(['id_u1'], {
					rows: 200
				});

				// Create Create Master Items Using the EngineAPI
				$scope.CreateMeasure = function () {
					var arrayMeasures = [];
					var arrayDimensions = [];
					swal({
							text: "Create Master Items?",
							icon: "info",
							buttons: true,
							dangerMode: false,
						})
						.then((create) => {
							if (create) {

								enigma.app.createSessionObject({
									qMeasureListDef: {
										qType: 'measure',
										qData: {
											info: "/qMeasure"
										},
										qMeta: {}
									},
									qInfo: {
										qId: "MeasureList",
										qType: "MeasureList",
									}
								}).then((list) => {
									list.getLayout().then((layout) => {
										layout.qMeasureList.qItems.forEach((element) => {
											console.log(element.qInfo.qId);
											arrayMeasures.push(element.qInfo.qId);
										})
									}).then(() => {
										measurevalues.rows.forEach(function (row, rowno) {
											// If there exists a measureid already, don't create
											if (!arrayMeasures.includes(row.cells[6].qText)) {
												enigma.app.createMeasure({
													"qInfo": {
														"qType": "measure",
														"qId": row.cells[6].qText.replace("-", "")
													},
													"qMeasure": {
														"qLabel": row.cells[0].qText.replace("-", ""),
														"qDef": row.cells[3].qText.replace("-", ""),
														"qGrouping": "N",
														"qLabelExpression": `${row.cells[2].qText.replace("-", "")}`, // wrap this string in ='' so Qlik understands it as an expression
														"qExpressions": [],
														"coloring": {
															"baseColor": {
																"color": row.cells[5].qText.replace("-", ""),
																"index": -1
															},
														},
														"qActiveExpression": 0
													},
													"qMetaDef": {
														"title": row.cells[0].qText.replace("-", ""),
														"description": `${row.cells[1].qText.replace("-", "")}`, // Description:
														"tags": [row.cells[4].qText.replace("-", "")], //Tags:
													}
												});
											} else {
												//swal("Duplicates found. Some measures may not have been imported")
											}

										});
									});
								})



								app.doReload(0, true, false);

								swal({
									text:"Measure Master Items created!", 
									icon: "success",
								});
							} else {
								swal({
									text:"Measure Master Items not created."
								});
							}
						});
				}

				$scope.CreateDimension = function () {
					var arrayMeasures = [];
					var arrayDimensions = [];
					swal({
							text: "Create Master Items?",
							icon: "info",
							buttons: true,
							dangerMode: false,
						})
						.then((create) => {
							if (create) {

								enigma.app.createSessionObject({
									qDimensionListDef: {
										qType: 'dimension',
										qData: {
											info: '/qDimInfos',
											dimension: '/qDim'
										},
										qMeta: {}
									},
									qInfo: {
										qId: "DimensionList",
										qType: "DimensionList"
									}
								}).then((list) => {
									list.getLayout().then((layout) => {
										layout.qDimensionList.qItems.forEach((element) => {
											console.log(element.qInfo.qId);
											arrayDimensions.push(element.qInfo.qId);
										})
									}).then(() => {
										dimensionvalues.rows.forEach(function (row, rowno) {

											if (!arrayDimensions.includes(row.cells[6].qText)) {
												enigma.app.createDimension({
													"qInfo": {
														"qType": "dimension",
														"qId": row.cells[6].qText.replace("-", "")
													},
													"qDim": {
														//	"title": "something",
														"qGrouping": "N",
														"qLabelExpression": `${row.cells[2].qText.replace('-', '')}`,
														"qFieldDefs": [
															row.cells[1].qText.replace("-", "") //Dimension Field:
														],
														//"qFieldLabels": ["TEST"],
														"title": row.cells[0].qText.replace("-", ""),
														"coloring": {
															"baseColor": {
																"color": row.cells[4].qText.replace("-", ""), // Dimension Color:
																"index": -1
															},
														},
													},
													"qMetaDef": {
														"title": row.cells[0].qText.replace("-", ""), //Dimension Name
														"description": row.cells[3].qText.replace("-", ""), //Desciption:
														"tags": [row.cells[5].qText.replace("-", "")], //Tags
													}
												});
											} else {
												//swal("Duplicates found. Some dimensions may not have been imported.")
											}
										});
									})
								})

								
								app.doReload(0, true, false);

								swal({
									text:"Dimension Master Items created!", 
									icon: "success",
								});
							} else {
								swal({
									title:"Dimension Master Items not created."
								});
							}
						});




				}

				$scope.UpdateMeasure = function() {
					// For each element that exists in MIM Definition => Do something
					measurevalues.rows.forEach(row => {
						enigma.app.getMeasure(row.cells[6].qText).then(reply =>{
							reply.setProperties({
								"qInfo": {
									"qType": "measure",
									"qId": row.cells[6].qText.replace("-", "")
								},
								"qMeasure": {
									"qLabel": row.cells[0].qText.replace("-", ""),
									"qDef": row.cells[3].qText.replace("-", ""),
									"qGrouping": "N",
									"qLabelExpression": `${row.cells[2].qText.replace("-", "")}`, // wrap this string in ='' so Qlik understands it as an expression
									"qExpressions": [],
									"coloring": {
										"baseColor": {
											"color": row.cells[5].qText.replace("-", ""),
											"index": -1
										},
									},
									"qActiveExpression": 0
								},
								"qMetaDef": {
									"title": row.cells[0].qText.replace("-", ""),
									"description": `${row.cells[1].qText.replace("-", "")}`, // Description:
									"tags": [row.cells[4].qText.replace("-", "")], //Tags:
								}
							}).then(reply => {
								swal({
									text:"Master Items Updated."
								})
							})
						})
					});
				};
				$scope.UpdateDimension = function() {
					// For each element that exists in MIM Definition => Do something
					dimensionvalues.rows.forEach(row => {
						enigma.app.getDimension(row.cells[6].qText).then(reply =>{
							reply.setProperties({
								"qInfo": {
									"qType": "dimension",
									"qId": row.cells[6].qText.replace("-", "")
								},
								"qDim": {
									//	"title": "something",
									"qGrouping": "N",
									"qLabelExpression": `${row.cells[2].qText.replace('-', '')}`,
									"qFieldDefs": [
										row.cells[1].qText.replace("-", "") //Dimension Field:
									],
									//"qFieldLabels": ["TEST"],
									"title": row.cells[0].qText.replace("-", ""),
									"coloring": {
										"baseColor": {
											"color": row.cells[4].qText.replace("-", ""), // Dimension Color:
											"index": -1
										},
									},
								},
								"qMetaDef": {
									"title": row.cells[0].qText.replace("-", ""), //Dimension Name
									"description": row.cells[3].qText.replace("-", ""), //Desciption:
									"tags": [row.cells[5].qText.replace("-", "")], //Tags
								}
							}).then(reply => {
								swal({
									text:"Master Items Updated."
								})
							})
						})
					});
				};
				// List all Master Items for Import
				$scope.ListImportMasterItems = function () {
					app.createGenericObject({
						qFieldListDef: {
							qShowHidden: true,
						}
					}, function (reply) {
						console.log(reply)
					});
				};
	
				// Destroy Master items
				$scope.DestroyAllMeasures = function () {
					swal({
							title: "Warning. This will purge all of your Master Items in this app. Are you sure you want to continue?",
							text: "Visualizations will NOT be affected.",
							icon: "warning",
							buttons: true,
							dangerMode: true,
						})
						.then((willDelete) => {
							if (willDelete) {
								var measureArray = [];
								var dimensionArray = [];
								enigma.app.createSessionObject({
									qMeasureListDef: {
										qType: 'measure',
										qData: {
											info: "/qMeasure"
										},
										qMeta: {}
									},
									qInfo: {
										qId: "MeasureList",
										qType: "MeasureList",

									}
								}).then((list) => {
									list.getLayout().then((layout) => {
										layout.qMeasureList.qItems.forEach((element) => {
											measureArray.push(element.qInfo.qId)
										})
									}).then(() => {
										console.log(measureArray);
										measureArray.forEach(element => {
											enigma.app.destroyMeasure(element);
										})
									});
								});
								enigma.app.createSessionObject({
									qDimensionListDef: {
										qType: 'dimension',
										qData: {
											info: '/qDimInfos',
											dimension: '/qDim'
										},
										qMeta: {}
									},
									qInfo: {
										qId: "DimensionList",
										qType: "DimensionList"
									}
								}).then((list) => {
									list.getLayout().then((layout) => {
										layout.qDimensionList.qItems.forEach((element) => {
											dimensionArray.push(element.qInfo.qId);
										})
									}).then(() => {
										console.log(dimensionArray);
										dimensionArray.forEach(element => {
											enigma.app.destroyDimension(element);
										})
									})
								})
								swal({
									title: "Master items have been deleted.", 
									icon: "success",
								});
							} else {
								swal({
									title:"Not deleted"
								});
							}
						});


				};

				$scope.DestroyDimension = function () {
					// The Engine API DestroyMeasure function: https://help.qlik.com/en-US/sense-developer/September2018/APIs/EngineAPI/services-Doc-DestroyMeasure.html
					console.log("Test")

					dimensionvalues.rows.forEach(element => {
						enigma.app.destroyDimension(element.cells[6].qText)
					})
				//	console.log(dimensionvalues.rows)
				}

				$scope.DestroyMeasure = function(){
					measurevalues.rows.forEach(element => {
						enigma.app.destroyMeasure(element.cells[6].qText)
					});
				}
				


				/*********************************************************************************************************************************************/
				/***************************     RETRIEVE OBJECTS FOR MASTER ITEM DATA, EXPORT TO CSV     ****************************************************/
				/*********************************************************************************************************************************************/
				function convertToCSV(objArray) {
					var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
					var str = '';
				
					for (var i = 0; i < array.length; i++) {
						var line = '';
						for (var index in array[i]) {
							if (line != '') line += ','
				
							line += array[i][index];
						}
				
						str += line + '\r\n';
					}
				
					return str;
				}
				
				function exportCSVFile(headers, items, fileTitle) {
					if (headers) {
						items.unshift(headers);
					}
				
					// Convert Object to JSON
					var jsonObject = JSON.stringify(items);
				
					var csv = convertToCSV(jsonObject);
				
					var exportedFilenmae = fileTitle + '.csv' || 'export.csv';
				
					var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
					if (navigator.msSaveBlob) { // IE 10+
						navigator.msSaveBlob(blob, exportedFilenmae);
					} else {
						var link = document.createElement("a");
						if (link.download !== undefined) { // feature detection
							// Browsers that support HTML5 download attribute
							var url = URL.createObjectURL(blob);
							link.setAttribute("href", url);
							link.setAttribute("download", exportedFilenmae);
							link.style.visibility = 'hidden';
							document.body.appendChild(link);
							link.click();
							document.body.removeChild(link);
						}
					}
				}
		
				$scope.ExportMeasures = function () {
					
					enigma.app.createSessionObject({
						"qProp": {
							"qInfo": {
								"qType": "MeasureList"
							},
							"qMeasureListDef": {
								"qType": "measure",
								"qData": {
									"title": "/title",
									"tags": "/tags"
								}
							}
						}
					}).then((reply) => {		
						reply.getLayout().then(reply => {
							// List of Measures (base form);
							const measDef = reply.qMeasureList.qItems.map(async element => {
								const response = enigma.app.getMeasure(element.qInfo.qId);
								return response;
							})
							const results = Promise.all(measDef);


							results.then(reply => {								
								
								const testArray = reply.map(element => {
									const response = element.getLayout();
									return response;
								})
								const itemsNotFormatted = Promise.all(testArray);
								
								
									var headers = {
										qInfo: "qInfo", // remove commas to avoid errors
										qType: "qType",
										qLabel: "qLabel",
										qDef: "qDef",
								//		owner:"owner"
									};
									
									
									//console.log(itemsNotFormatted)
									var itemsFormatted = [];
									
									// format the data
									itemsNotFormatted.then((item) => {
										item.map(item => {
											itemsFormatted.push({
												qInfo: JSON.stringify(item.qInfo.qId), // remove commas to avoid errors,
												qType: JSON.stringify(item.qInfo.qType),
												qLabel: JSON.stringify(item.qMeasure.qLabel),
												qDef: JSON.stringify(item.qMeasure.qDef).replace(/(\u005Ct)/g, '\t').replace(/(\u005Cr\u005Cn)/g, '\n').replace(/(\u005Cn)/g, '\n'),
									//			owner: JSON.stringify(item.qMeta.owner.name)
											});
										})
										var fileTitle = 'MeasureExport';
									//
									exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
									});
									console.log(itemsFormatted)
									
									

								
							})
						}) 
					})  

				

				
				};
				$scope.ExportDimensions = function () {
					enigma.app.createSessionObject({
						"qProp": {
							"qInfo": {
								"qType": "DimensionList"
							},
							"qDimensionListDef": {
								"qType": "dimension",
								"qData": {
									"title": "/title",
									"tags": "/tags",
									"grouping": "/qDim/qGrouping",
									"info": "/qDimInfos"
								}
							}
						}
					}).then((reply) => {		
						reply.getLayout().then(reply => {
						
							// List of Measures (base form);
							const measDef = reply.qDimensionList.qItems.map(async element => {
								const response = enigma.app.getDimension(element.qInfo.qId);
								return response;
							})
							const results = Promise.all(measDef);
	
	
							results.then(reply => {								
								
								const testArray = reply.map(element => {
									const response = element.getLayout();
									return response;
								})
								const itemsNotFormatted = Promise.all(testArray);
								
								
									var headers = {
										qId: "qId", // remove commas to avoid errors
										qType: "qType",
										qField: "qField",
										qTitle: "qTitle",
								//		owner:"owner"
									};
									
									
									//console.log(itemsNotFormatted)
									var itemsFormatted = [];
									
									// format the data
									itemsNotFormatted.then((item) => {
										item.map(item => {
											itemsFormatted.push({
												qId: JSON.stringify(item.qInfo.qId), // remove commas to avoid errors,
												qType: JSON.stringify(item.qInfo.qType),
												qField: JSON.stringify(item.qDim.qFieldDefs[0]),
												qTitle: JSON.stringify(item.qDim.title),
									//			owner: JSON.stringify(item.qMeta.owner.name)
									//.replace(/(\u005Ct)/g, '\t').replace(/(\u005Cr\u005Cn)/g, '\n')
											});
										})
										var fileTitle = 'DimensionExport';
									//
									exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
									});
									console.log(itemsFormatted)
									
									
	
								
							})
						}) 
					}) 

				}
		
				$scope.ExportVariables = function () {
					console.log("exportvariables")
					enigma.app.createSessionObject({
						"qProp": {
							"qInfo": {
								"qType": "VariableList"
							},
							"qVariableListDef": {
								"qType": "variable",
								"qShowReserved": true,
								"qShowConfig": true,
								"qData": {
									"tags": "/tags"
								}
							}
						}
					}).then((reply) => {	

						reply.getLayout().then(reply => {

							// List of Variables;
							const varDef = reply.qVariableList.qItems.map(async element => {
								const response = enigma.app.getVariableById(element.qInfo.qId);
								return response;
							});

							const results = Promise.all(varDef);

							results.then(reply => {

								const variableProperties = reply.map(element => {
									const response = element.getProperties();
									return response;
								})

								const itemsNotFormatted = Promise.all(variableProperties)
								//console.log(itemsNotFormatted2)
								var headers = {
									qName: "qName",
									qVariable: "qDefinition",
									qId: "qId",
									qType: "qType",
								};

								var itemsFormatted = [];

								itemsNotFormatted.then(item => {
									
									item.map(item => {
										//console.log(item
											console.log((item.qDefinition));
											
											
											itemsFormatted.push({
													qName: item.qName,
													qDefinition: item.qDefinition, 
													//qId: JSON.stringify(item.qInfo.qId),
													//qType: JSON.stringify(item.qInfo.qType),
											}) 
									})

//console.log(itemsFormatted)
var fileTitle = 'VariableExport';
		
									
console.log("test", itemsFormatted)
exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download

								})

							})
								
						
									
									
						}) 


					}) 
					

				
				}

				/*


var headers = {
										qName: "qName", // remove commas to avoid errors
										qId: "qId",
										qType: "qType",
										qDefinition: "qDefinition",
									};
									
							

									var vItemsFormatted = [];
				
									// format the 
									vItemsNotFormatted.map((item) => {
										//console.log(item)
										//.replace(/(\u005Cr\u005Cn)/g, '\n').replace(/(\u005Cn)/g, '\n'),
											vItemsFormatted.push({
												qName: JSON.stringify(item.qName), // remove commas to avoid errors
												qId: JSON.stringify(item.qInfo.qId),
												qType: JSON.stringify(item.qInfo.qType),
												qDefinition: JSON.stringify(item.qDefinition)
											});
									});
									//console.log(itemsFormatted)
									var fileTitle = 'VariableExport';
									
									
									console.log("test", vItemsFormatted)
									exportCSVFile(headers, vItemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download





				reply.getLayout().then(reply => {
							// List of Measures (base form);
							const measDef = reply.qMeasureList.qItems.map(async element => {
								const response = enigma.app.getMeasure(element.qInfo.qId);
								return response;
							})

							const results = Promise.all(measDef);

							results.then(reply => {
								const measPart = reply.map(element => {
									const response = element.getLayout();
									return response
								});
								var str = ''
								const results = Promise.all(measPart);
								const newres = results.then(reply => {
									console.log(reply[0].qMeasure)
									var table = qlik.table(reply[0].qMeasure);
									table.exportData();
									return table;
								})
								newres.then((reply)=> {
									console.log(reply);
								})
								
								
							})
						}) 
				*/

	/********************************************************************************************
	*********************************************************************************************/				
				$scope.PartialReload = function () {
					app.doReload(0, true, false);
					console.log("reloaded")
				};






			}]
		};
	});