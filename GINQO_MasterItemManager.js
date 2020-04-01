define([
'jquery',
'qlik',
'text!./mainModal.ng.html',
'text!./helpModal.ng.html',
'text!./dimModalMain.ng.html',
'text!./dimModalConfirm.ng.html',
'text!./dimModalConfirmPopover.ng.html',
'text!./measModalMain.ng.html',
'text!./measModalConfirm.ng.html',
'text!./measModalConfirmPopover.ng.html',
'text!', './lib/swal', './lib/lodash'],
	function ($, qlik, mainModalWindow, helpModalWindow, dimModalWindow, dimModalConfirmWindow, dimModalConfirmPopoverWindow, measModalWindow, measModalConfirmWindow, measModalConfirmPopoverWindow, _) {
		'use strict';

return {
	initialProperties: {},
	template: mainModalWindow,
	controller: ['$scope', 'luiDialog', function ($scope, luiDialog) {
		// Create reference to enigmaModel
		const enigma = $scope.component.model.enigmaModel;
		// Reference the current application that the extension is running in.
		var app = qlik.currApp(this);
		// Get Engine Version
		enigma.app.global.engineVersion().then(reply => {
			console.log(reply);
		});

		// Create a Modal Window for the Help Dialog
		$scope.openHelpModal = function () {
			luiDialog.show({
				template: helpModalWindow,
				input: {
					name: $scope.name
				},
				controller: ['$scope', '$element', function ($scope, $element) {}]
			});
		};
		// Menu option for changing DIMENSIONS
		$scope.openDimModalMain = function () {
			luiDialog.show({
				template: dimModalWindow,
				input: {
					name: $scope.name
				},
				controller: ['$scope', '$element', function ($scope, $element) {
					var dimensionvalues = app.createTable(['%MI%DimensionName', '%MI%DimensionField', '%MI%DimensionLabelExpression', '%MI%DimensionDescription', '%MI%DimensionColor', '%MI%DimensionTags', '%MI%DimensionId'], {
						rows: 200
					});
					$scope.dimensionvalues = dimensionvalues;


					// Create Create Master Items Using the EngineAPI
					$scope.CreateDimension = function () {
						var arrayMeasures = [];
						var arrayDimensions = [];

							// Function for confirmation dialog on Edit Measures
							$scope.runDimModalConfirm = function () {
								luiDialog.show({
									template: dimModalConfirmWindow,
									input: {
										name: $scope.name
									},
									controller: ['$scope', 'luiPopover', '$element', function ($scope, luiPopover, $element) {
										// Get a Selectable List from the qlik selection based on fields
										var dimensionvalues = app.createTable(['%MI%DimensionName', '%MI%DimensionField', '%MI%DimensionLabelExpression', '%MI%DimensionDescription', '%MI%DimensionColor', '%MI%DimensionTags', '%MI%DimensionId'], {
											rows: 200
										});
										$scope.dimensionvalues = dimensionvalues;
										$scope.openPopover = function(index, row) {
														luiPopover.show({
															template: dimModalConfirmPopoverWindow,
															input: {},
															alignTo: document.getElementsByClassName("popover")[index], //This is the key to making the popover work and attach to the element
															dock: "right",
															controller: ['$scope', function( $scope ){
																console.log(enigma.app.engineApp);
																$scope.dimensionvalues = dimensionvalues;
																$scope.DimensionName = row[0].qText;
																$scope.DimensionDescription = row[3].qText;
																$scope.DimensionDescriptionEvaluated;
																enigma.app.engineApp.expandExpression(row[3].qText).then(reply => {
																	$scope.DimensionDescriptionEvaluated = reply.qExpandedExpression;
																	console.log(reply);
																})
																$scope.DimensionLabelExpression = row[2].qText;
																$scope.DimensionLabelExpressionEvaluated;
																enigma.app.engineApp.evaluateEx(row[2].qText).then(reply => {
																	$scope.DimensionLabelExpressionEvaluated = reply.qValue.qText
																})
																$scope.DimensionField = row[1].qText;
																$scope.DimensionTags = row[5].qText;
																$scope.DimensionColor = row[4].qText;
																$scope.DimensionID = row[6].qText;
																console.log($scope);
																$scope.SelectValue = function(){
																	app.field('%MI%DimensionId').toggleSelect($scope.DimensionID, true);
																	$scope.close();
																}
															}]
														});
													};
										$scope.selState = app.selectionState();

										$scope.createdimension = function(){
											console.log('User confirmed: Creating Dimensions...');
											enigma.app.global.engineVersion().then(reply => {
											// If matches February 2019
											if (reply.qComponentVersion === "12.287.2") {
												console.log("You are running February 2019")
											}
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
														//console.log(element.qInfo.qId);
														arrayDimensions.push(element.qInfo.qId);
													})
												}).then(() => {
													dimensionvalues.rows.forEach(function (row, rowno) {

														if (!arrayDimensions.includes(row.cells[6].qText)) {

															console.log(row);
															var dimensionfields = row.cells[1].qText.split(",").map(item => {
																return item.trim();
															})
															var labelExpression = row.cells[2].qText;
															//var description = row.cells[3].qText;
															var description;

															async function myfunction(){
																enigma.app.engineApp.expandExpression(row.cells[3].qText).then(reply => {
																	description = reply.qExpandedExpression;
																	console.log(description);
																});
															};
															myfunction();
															console.log(description);
															var color = row.cells[4].qText;
															var tags = row.cells[5].qText.split(",").map(item => {
																return item.trim(); // Return item with no whitespace
															});
															tags.push('Master Item Manager')
															var qGrouping;
															if (dimensionfields.length > 1) {
																qGrouping = "H"
															} else {
																qGrouping = "N"
															};
															if (labelExpression === '-') {
																labelExpression = '';
															}
															if (description === '-') {
																description = '';
															}
															if (color === '-') {
																color = '';
															}
															if (tags === '-') {
																tags = '';
															}

															var dimensionSchema = {
																"qInfo": {
																	"qType": "dimension",
																	"qId": row.cells[6].qText
																},
																"qDim": {
																	//	"title": "something",
																	"qGrouping": qGrouping,
																	"qLabelExpression": labelExpression,
																	"qFieldDefs": dimensionfields,
																	//"qFieldLabels": ["TEST"],
																	"title": row.cells[0].qText,
																	"coloring": {
																		"baseColor": {
																			"color": color, // Dimension Color:
																			"index": -1
																		},
																	},
																},
																"qMetaDef": {
																	"title": row.cells[0].qText, //Dimension Name
																	"description": description, //Desciption:
																	"tags": tags, //Tags
																}
															};

															enigma.app.createDimension(dimensionSchema);
															swal({
																text: "Dimensions Created.",
																icon: "success",
															});
															$scope.close();
														} else {
															swal({
																text:"Found Existing Dimensions. Synchronizing...",
																icon:"warning"
															})
															$scope.UpdateDimension = function () {
																// For each element that exists in MIM Definition => Do something


																dimensionvalues.rows.forEach(row => {
																	var labelExpression = row.cells[2].qText;
																	var description = row.cells[3].qText;
																	var color = row.cells[4].qText;
																	var tags = row.cells[5].qText.split(",").map(item => {
																		return item.trim(); // Return item with no whitespace
																	});
																	tags.push('Master Item Manager');
																	var dimensionfields = row.cells[1].qText.split(",").map(item => {
																		return item.trim();
																	})
																	var qGrouping;

																	if (dimensionfields.length > 1) {
																		qGrouping = "H"
																	} else {
																		qGrouping = "N"
																	};

																	if (labelExpression === '-') {
																		labelExpression = '';
																	}
																	if (description === '-') {
																		description = '';
																	}
																	if (color === '-') {
																		color = '';
																	}
																	if (tags === '-') {
																		tags = '';
																	}
																	enigma.app.getDimension(row.cells[6].qText).then(reply => {
																		reply.setProperties({
																			"qInfo": {
																				"qType": "dimension",
																				"qId": row.cells[6].qText
																			},
																			"qDim": {
																				//	"title": "something",
																				"qGrouping": qGrouping,
																				"qLabelExpression": labelExpression,
																				"qFieldDefs": dimensionfields, //Dimension Field:
																				//"qFieldLabels": ["TEST"],
																				"title": row.cells[0].qText,
																				"coloring": {
																					"baseColor": {
																						"color": color, // Dimension Color:
																						"index": -1
																					},
																				},
																			},
																			"qMetaDef": {
																				"title": row.cells[0].qText, //Dimension Name
																				"description": description, //Desciption:
																				"tags": tags, //Tags
																			}
																		}).then(reply => {
																			setTimeout(function () {
																				swal({
																					text: "Dimension Master Items Synchronized",
																					icon: "success",
																				});
																			}, 2000);

																		})
																	})
																});
															};
															$scope.UpdateDimension();
														}
													});
													$scope.close();

												});
											});
										})
										}
									}]
								});
								// Check engine version for most recent schema. If not most recent use new schema

							};
							var arrayMeasures = [];
							var arrayDimensions = [];

							// Run Confirm Metrics Modal Window
							$scope.runDimModalConfirm();
					}



					$scope.DestroyDimension = function () {
						// The Engine API DestroyMeasure function: https://help.qlik.com/en-US/sense-developer/September2018/APIs/EngineAPI/services-Doc-DestroyMeasure.html
						//console.log("Test")

						dimensionvalues.rows.forEach(element => {
							enigma.app.destroyDimension(element.cells[6].qText)
						})
						swal({
							text: "Dimensions Deleted.",
							icon: "success",
						});
						//	//console.log(dimensionvalues.rows)
					}

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
										//	const response = element.getLayout(); (2019-01-07: Wrong method to get definition of formula. Should use getProperties() instead)
										const response = element.getProperties();
										return response;
									})
									const itemsNotFormatted = Promise.all(testArray);


									var headers = {
										Field: "%MI%DimensionField", // remove commas to avoid errors
										Name: "%MI%DimensionName",
										LabelExpression: "%MI%DimensionLabelExpression",
										Description: "%MI%DimensionDescription",
										Color: "%MI%DimensionColor",
										Tags: "%MI%DimensionTags",
										ID: "%MI%DimensionId"
									};


									//console.log(itemsNotFormatted)
									var itemsFormatted = [];

									// format the data
									itemsNotFormatted.then((item) => {
										//console.log(item);
										item.map(item => {
											console.log(item)
											switch (item.qDim.coloring) {
												case undefined:
													item.qDim.coloring = {
														baseColor: {
															color: "",
															index: -1
														}
													};
													break;
											}
											switch (item.qDim.coloring.baseColor) {
												case undefined:
													item.qDim.coloring = {
														baseColor: {
															color: "",
															index: -1
														}
													};
													break;
											}

											//console.log(item.qDim.coloring)
											//console.log(item.qDim.coloring.baseColor)
										})

										item.map(item => {
											itemsFormatted.push({
												Field: `"${item.qDim.qFieldDefs.join(', ')}"`,
												Name: `"${item.qDim.title}"`,
												LabelExpression: `"${item.qDim.qLabelExpression}"`.replace("undefined", ""),
												Description: `"${item.qMetaDef.description}"`,
												Color: `"${item.qDim.coloring.baseColor.color}"`,
												Tags: `"${item.qMetaDef.tags[0]}"`.replace("undefined", ""),
												ID: `"${item.qInfo.qId}"`

												//.replace(/(\u005Ct)/g, '\t').replace(/(\u005Cr\u005Cn)/g, '\n')
											});
										})


										// call the exportCSVFile() function to process the JSON and trigger the download
									}).then(element => {
										itemsFormatted.forEach(function (obj) {
											for (var i in obj) {
												if (obj[i] === undefined) {
													obj[i] = "=''";
												}
											}
										});
										var fileTitle = 'DimensionExport';
										exportCSVFile(headers, itemsFormatted, fileTitle);
										swal({
											text: "Dimension Master Items Exported.",
											icon: "success",
										});
									});
									// console.log(itemsFormatted)




								})
							})
						})

					}

					$scope.DestroyAllMeasures = function () {
						swal({
							text: "Warning: This feature will delete all Dimensions in this app whether they have been created natively through the Qlik Sense interface, or by the Master Item Manager. Are you sure you want to Delete All Dimensions?",
							icon: "warning",
							buttons: true,
							dangerMode: true,
						})
							.then((willDelete) => {
								if (willDelete) {
									var measureArray = [];
									var dimensionArray = [];
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
											//console.log(dimensionArray);
											dimensionArray.forEach(element => {
												enigma.app.destroyDimension(element);
											})
										})
									})
									swal({
										text: "Master items have been deleted.",
										icon: "success",
									});
								} else {
									swal({
										text: "Master items have not been deleted.",
										icon: "error"
									});
								}
							});


					};


				}]
			});
		};
		// Menu option for changing MEASURES

		$scope.openMeasModalMain = function () {
		// Open luiDialog for actions on Measures
			luiDialog.show({
				template: measModalWindow,
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
					// Create Create Master Items Using the EngineAPI
					$scope.CreateMeasure = function () {
						// Function for confirmation dialog on Edit Measures
						$scope.confirmDialog = function () {
							luiDialog.show({
								template: measModalConfirmWindow,
								input: {
									name: $scope.name
								},
								controller: ['$scope', 'luiPopover', '$element', function ($scope, luiPopover, $element) {
									// Get a Selectable List from the qlik selection based on fields
									var measurevalues = app.createTable(['%MI%MeasureName', '%MI%MeasureDescription', '%MI%MeasureLabelExpression', '%MI%MeasureExpression', '%MI%MeasureTags', '%MI%MeasureColor', '%MI%MeasureId'], {
										rows: 200
									});
									$scope.measurevalues = measurevalues;

									var SelectionArray = [];
									$scope.mousedown = function(index, row){
										console.log('mousedown')
										$scope.mousemove = function(index, row){
											console.log(index);
											SelectionArray.push(index);
										}
										$scope.mouseup = function(index, row){
											console.log('mouseup');
											$scope.mousemove = null;
											console.log(SelectionArray)
										}
									}
									$scope.openPopover = function(index, row) {
													luiPopover.show({
														template: measModalConfirmPopoverWindow,
														input: {},
														alignTo: document.getElementsByClassName("popover")[index], //This is the key to making the popover work and attach to the element
														dock: "right",
														controller: ['$scope', function( $scope ) {
															$scope.measurevalues = measurevalues;
															$scope.MeasureName = row[0].qText;
															$scope.MeasureDescription = row[1].qText;
															$scope.MeasureLabelExpression = row[2].qText;
															$scope.MeasureLabelExpressionEvaluated;
															enigma.app.engineApp.evaluateEx(row[2].qText).then(reply => {
																$scope.MeasureLabelExpressionEvaluated = reply.qValue.qText;
															})
															$scope.MeasureExpression = row[3].qText;
															$scope.MeasureExpressionEvaluated;
															enigma.app.engineApp.evaluateEx(row[3].qText).then(reply => {
																$scope.MeasureExpressionEvaluated = reply.qValue.qText;
															})
															$scope.MeasureTags = row[4].qText;
															$scope.MeasureColor = row[5].qText;
															$scope.MeasureID = row[6].qText;
															console.log($scope.MeasureID)

															$scope.SelectValue = function(){
																app.field('%MI%MeasureId').toggleSelect($scope.MeasureID, true);
																$scope.close();
															}
															$scope.SelectAlternative = function(){
																app.field('%MI%MeasureId').selectAlternative();
															}
															//app.field('%MI%MeasureId').toggleSelect($scope.MeasureID, true);
														}]
													});
												};
									$scope.selState = app.selectionState();
									var measurevalues = app.createTable(['%MI%MeasureName', '%MI%MeasureDescription', '%MI%MeasureLabelExpression', '%MI%MeasureExpression', '%MI%MeasureTags', '%MI%MeasureColor', '%MI%MeasureId'], {
										rows: 200
									});
									var dimensionvalues = app.createTable(['%MI%DimensionName', '%MI%DimensionField', '%MI%DimensionLabelExpression', '%MI%DimensionDescription', '%MI%DimensionColor', '%MI%DimensionTags', '%MI%DimensionId'], {
										rows: 200
									})
									$scope.measurevalues = measurevalues;

									$scope.dimensionvalues = dimensionvalues;
									// Get value of measures from memory
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
																				});

																				// Get a Promise for the measDef
																				const results = Promise.all(measDef);


																				results.then(reply => {

																					const testArray = reply.map(element => {
																						const response = element.getLayout();
																						return response;
																					});
																					const itemsNotFormatted = Promise.all(testArray);
																					//console.log(itemsNotFormatted);
																					var itemsFormatted = [];

																						var measurevalues = app.createTable(['%MI%MeasureName', '%MI%MeasureDescription', '%MI%MeasureLabelExpression', '%MI%MeasureExpression', '%MI%MeasureTags', '%MI%MeasureColor', '%MI%MeasureId'], {
																							rows: 200
																						});
																						var dimensionvalues = app.createTable(['%MI%DimensionName', '%MI%DimensionField', '%MI%DimensionLabelExpression', '%MI%DimensionDescription', '%MI%DimensionColor', '%MI%DimensionTags', '%MI%DimensionId'], {
																							rows: 200
																						})
																						$scope.measurevalues = measurevalues;

																						$scope.dimensionvalues = dimensionvalues;

																						$scope.createmeasure = function(){
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
																										arrayMeasures.push(element.qInfo.qId);
																									})
																								}).then(() => {

																									console.log(itemsFormatted)
																									measurevalues.rows.forEach(function (row, rowno) {
																										// If there exists a measureid already, don't create
																										// console.log(measurevalues.rows);

																										if (!arrayMeasures.includes(row.cells[6].qText)) {

																											var labelExpression = row.cells[2].qText;
																											var description = row.cells[1].qText;
																											var color = row.cells[5].qText;
																											//var tags = row.cells[4].qText;
																											var tags = row.cells[4].qText.split(",").map(item => {
																												return item.trim(); // Return item with no whitespace
																											});
																											tags.push('Master Item Manager');

																											if (labelExpression === '-') {
																												labelExpression = '';
																											}
																											if (description === '-') {
																												description = '';
																											}
																											if (color === '-') {
																												color = '';
																											}
																											if (tags === '-') {
																												tags = '';
																											}
																											enigma.app.createMeasure({
																												"qInfo": {
																													"qType": "measure",
																													"qId": row.cells[6].qText
																												},
																												"qMeasure": {
																													"qLabel": row.cells[0].qText,
																													"qDef": row.cells[3].qText,
																													"qGrouping": "N",
																													"qLabelExpression": labelExpression,
																													"qExpressions": [],
																													"coloring": {
																														"baseColor": {
																															"color": color,
																															"index": -1
																														},
																													},
																													"qActiveExpression": 0
																												},
																												"qMetaDef": {
																													"title": row.cells[0].qText,
																													"description": description, // Description:
																													"tags": tags, //Tags:
																												}
																											});

																											$scope.close();
																											swal({
																												text:"Measures Created",
																												icon:"success"
																											});

																										} else {
																											swal({
																												text:"Found Existing Measures. Synchronizing...",
																												icon:"warning"
																											});
																											$scope.UpdateMeasure = function () {
																												console.log("Updated Measures")
																												// For each element that exists in MIM Definition => Do something
																												measurevalues.rows.forEach(row => {
																													enigma.app.getMeasure(row.cells[6].qText).then(reply => {
																														var labelExpression = row.cells[2].qText;
																														var description = row.cells[1].qText;
																														var color = row.cells[5].qText;
																														var tags = row.cells[4].qText.split(",").map(item => {
																															return item.trim(); // Return item with no whitespace
																														});
																														tags.push('Master Item Manager')
																														if (labelExpression === '-') {
																															labelExpression = '';
																														}
																														if (description === '-') {
																															description = '';
																														}
																														if (color === '-') {
																															color = '';
																														}
																														if (tags === '-') {
																															tags = '';
																														}
																														reply.setProperties({
																															"qInfo": {
																																"qType": "measure",
																																"qId": row.cells[6].qText
																															},
																															"qMeasure": {
																																"qLabel": row.cells[0].qText,
																																"qDef": row.cells[3].qText,
																																"qGrouping": "N",
																																"qLabelExpression": labelExpression,
																																"qExpressions": [],
																																"coloring": {
																																	"baseColor": {
																																		"color": color,
																																		"index": -1
																																	},
																																},
																																"qActiveExpression": 0
																															},
																															"qMetaDef": {
																																"title": row.cells[0].qText,
																																"description": description, // Description:
																																"tags": tags, //Tags:
																															}
																														}).then(reply => {
																															setTimeout(function () {
																																swal({
																																	text: "Measure Master Items Synchronized",
																																	icon: "success",
																																});
																													    }, 2000);

																														})
																													})
																												});
																											};
																											$scope.UpdateMeasure();
																											$scope.close();
																										}

																									});

																								});

																							});
																						}
																						// Format the in memory values

																						// Get value of measures from memory


																				})
																			})
																		})
								}]
							});
						};
						var arrayMeasures = [];
						var arrayDimensions = [];


						// Run Confirm Metrics Modal Window
						$scope.confirmDialog();



					}
					$scope.DestroyMeasure = function () {
						measurevalues.rows.forEach(element => {
							enigma.app.destroyMeasure(element.cells[6].qText)
						});
						swal({
							text: "Measures Deleted.",
							icon: "success",
						});
					}
					$scope.DestroyAllMeasures = function () {
						swal({
							text: "Warning: This feature will delete all Measures in this app whether they have been created natively through the Qlik Sense interface, or by the Master Item Manager. Are you sure you want to Delete All Measures?",
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
											//console.log(measureArray);
											measureArray.forEach(element => {
												enigma.app.destroyMeasure(element);
											})
										});
									});
									swal({
										text: "Master items have been deleted.",
										icon: "success",
									});
								} else {
									swal({
										text: "Master items have not been deleted",
										icon:"error"
									});
								}
							});


					};
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
									//console.log(results)
									const testArray = reply.map(element => {
										// const response = element.getLayout();
										const response = element.getProperties();
										return response;
									})
									const itemsNotFormatted = Promise.all(testArray);
									//console.log(itemsNotFormatted)

									var headers = {
										Expression: "%MI%MeasureExpression", // remove commas to avoid errors
										Name: "%MI%MeasureName",
										LabelExpression: "%MI%MeasureLabelExpression",
										Description: "%MI%MeasureDescription",
										Color: "%MI%MeasureColor",
										Tags: "%MI%MeasureTags",
										ID: "%MI%MeasureId"
									};


									// console.log('Unformatted', itemsNotFormatted)
									var itemsFormatted = [];

									// format the data
									itemsNotFormatted.then((item) => {
										item.map(item => {
											console.log(item);
											switch (item.qMeasure.coloring) {
												case undefined:
													item.qMeasure.coloring = {
														baseColor: {
															color: "",
															index: -1
														}
													};
													break;
											}
											switch (Object.keys(item.qMeasure.coloring).length) {
												case 0:
													item.qMeasure.coloring = {
														baseColor: {
															color: "",
															index: -1
														}
													}
													break;
											}


										})

										item.map(item => {
											console.log(item);
											itemsFormatted.push({
												Expression: `"${item.qMeasure.qDef}"`.replace("undefined", ""),
												Name: `"${item.qMeasure.qLabel}"`,
												LabelExpression: `"${item.qMeasure.qLabelExpression}"`.replace("undefined", ""),
												Description: `"${item.qMetaDef.description}"`,
												Color: `"${item.qMeasure.coloring.baseColor.color}"`,
												Tags: `"${item.qMetaDef.tags[0]}"`.replace("undefined", ""),
												ID: `"${item.qInfo.qId}"`,
											});
										})
										//.replace(/(\u005Ct)/g, '\t').replace(/(\u005Cr\u005Cn)/g, '\n').replace(/(\u005Cn)/g, '\n'),



									}).then(element => {
										itemsFormatted.forEach(function (obj) {
											for (var i in obj) {
												if (obj[i] === undefined) {
													obj[i] = "=''";
												}
											}
										});
										var fileTitle = 'MeasureExport';
										//console.log(itemsFormatted)
										exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
										swal({
											text: "Measure Master Items Exported.",
											icon: "success",
										});
									});
									//console.log('Formatted', itemsFormatted)




								})
							})
						})




					};

				}]
			});
		};
		// global function for executing a partial reload
		$scope.PartialReload = function () {
			swal({
				text: "Partial Reload Started.",
				icon: "info",
			});
			app.doReload(0, true, false).then(() => {
				app.doSave().then(reply => {
					swal({
						text: "Partial Reload Complete.",
						icon: "success",
					});
				});
			});
			//console.log("reloaded")
		};
		// function for converting objects to CSV
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
		// function for exporting csv objects
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
			}]
		};
	});
