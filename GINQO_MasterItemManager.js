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
							//console.log($scope.dimensionvalues);
							$element.find('#dialogSelect').on('click', function () {
								//console.log("element clicked")
								if (this.hasAttribute("data-value")) {
									var value = parseInt(this.getAttribute("data-value"), 10),
										dim = 0;
									self.selectValues(dim, [value], true);
								}
							});
							//console.log($element);
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
								//console.log("element clicked")
								if (this.hasAttribute("data-value")) {
									var value = parseInt(this.getAttribute("data-value"), 10),
										dim = 0;
									self.selectValues(dim, [value], true);
								}
							});
							//console.log($element);
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
														//console.log(element.qInfo.qId);
														arrayDimensions.push(element.qInfo.qId);
													})
												}).then(() => {
													dimensionvalues.rows.forEach(function (row, rowno) {
			
														if (!arrayDimensions.includes(row.cells[6].qText)) {
															
															var labelExpression = row.cells[2].qText;
															var description = row.cells[3].qText;
															var color = row.cells[4].qText;
															var tags = row.cells[5].qText
															if(labelExpression === '-'){
																labelExpression = '';
															}
															if(description === '-'){
																description = '';
															}
															if(color === '-'){
																color = '';
															}
															if(tags === '-'){
																tags ='';
															}
															enigma.app.createDimension({
																"qInfo": {
																	"qType": "dimension",
																	"qId": row.cells[6].qText
																},
																"qDim": {
																	//	"title": "something",
																	"qGrouping": "N",
																	"qLabelExpression": labelExpression,
																	"qFieldDefs": [
																		row.cells[1].qText //Dimension Field:
																	],
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
																	"tags": [tags], //Tags
																}
															});
														} else {
															//swal("Duplicates found. Some dimensions may not have been imported.")
														}
													});
												
											});

											swal({
												text:"Dimensions Created.", 
												icon: "success",
											});
										
									});
			
			
			
			
							}
							$scope.UpdateDimension = function() {
								// For each element that exists in MIM Definition => Do something
								
								
								dimensionvalues.rows.forEach(row => {
									var labelExpression = row.cells[2].qText;
									var description = row.cells[3].qText;
									var color = row.cells[4].qText;
									var tags = row.cells[5].qText
									if(labelExpression === '-'){
										labelExpression = '';
									}
									if(description === '-'){
										description = '';
									}
									if(color === '-'){
										color = '';
									}
									if(tags === '-'){
										tags ='';
									}
									enigma.app.getDimension(row.cells[6].qText).then(reply =>{
										reply.setProperties({
											"qInfo": {
												"qType": "dimension",
												"qId": row.cells[6].qText
											},
											"qDim": {
												//	"title": "something",
												"qGrouping": "N",
												"qLabelExpression": labelExpression,
												"qFieldDefs": [
													row.cells[1].qText //Dimension Field:
												],
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
												"tags": [tags], //Tags
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
								//console.log("Test")
			
								dimensionvalues.rows.forEach(element => {
									enigma.app.destroyDimension(element.cells[6].qText)
								})
								swal({
									text:"Dimensions Deleted.", 
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
												const response = element.getLayout();
												return response;
											})
											const itemsNotFormatted = Promise.all(testArray);
											
											
												var headers = {
													Field: "%MI%DimensionField", // remove commas to avoid errors
													Name: "%MI%DimensionName",
													LabelExpression: "%MI%DimensionLabelExpression",
													Description: "%MI%DimensionDescription",
													Color:"%MI%DimensionColor",
													Tags:"%MI%DimensionTags",
													ID:"%MI%DimensionId"
												};
												
												
												//console.log(itemsNotFormatted)
												var itemsFormatted = [];
												
												// format the data
												itemsNotFormatted.then((item) => {
													//console.log(item);
													item.map(item => {
													console.log(item)
														switch(item.qDim.coloring){
															case undefined: 
																item.qDim.coloring = {
																	baseColor:{
																		color:"",
																		index:-1
																	}
																};
															break;
														}
														switch(item.qDim.coloring.baseColor){
															case undefined: 
																item.qDim.coloring = {
																	baseColor:{
																		color:"",
																		index:-1
																	}
																};
															break;
														}
														
														//console.log(item.qDim.coloring)
														//console.log(item.qDim.coloring.baseColor)
													})
												
													item.map(item => {
														itemsFormatted.push({
															Field: `"${item.qDim.qFieldDefs[0]}"`, // remove commas to avoid errors,
															Name: `"${item.qDim.title}"`,
															LabelExpression: `"${item.qDim.qLabelExpression}"`.replace("undefined", ""),
															Description: `"${item.qMeta.description}"`,
															Color: `"${item.qDim.coloring.baseColor.color}"`,
															Tags: `"${item.qMeta.tags[0]}"`.replace("undefined", ""),
															ID: `"${item.qInfo.qId}"`
															
												//.replace(/(\u005Ct)/g, '\t').replace(/(\u005Cr\u005Cn)/g, '\n')
														});
													})
													
												
												 // call the exportCSVFile() function to process the JSON and trigger the download
												}).then(element => {
													itemsFormatted.forEach(function(obj) {
														for(var i in obj) { 
														  if(obj[i] === undefined) {
															obj[i] = "=''";
														  }
														}
													  });
													  var fileTitle = 'DimensionExport';
													  exportCSVFile(headers, itemsFormatted, fileTitle);
													  swal({
														text:"Measure Dimension Items Exported.", 
														icon: "success",
													});
												});
												// console.log(itemsFormatted)
												
												
				
											
										})
									}) 
								}) 
			
							}
					
							$scope.PartialReload = function () {
								swal({
									text:"Partial Reload Started.", 
									icon: "warning",
								});
								app.doReload(0, true, false).then(() => {
									app.doSave().then(reply => {
										swal({
											text:"Partial Reload Complete.", 
											icon: "success",
										});
									});
								});
								//console.log("reloaded")
							};

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
										//console.log($scope.dimensionvalues);
										$element.find('#dialogSelect').on('click', function () {
											//console.log("element clicked")
											if (this.hasAttribute("data-value")) {
												var value = parseInt(this.getAttribute("data-value"), 10),
													dim = 0;
												self.selectValues(dim, [value], true);
											}
										});
										//console.log($element);
									}]
								});
							};

							$scope.DestroyAllMeasures = function () {
								swal({
									text: "Warning. This will remove all Dimensions from the Master Item Panel (Including those you have defined manually). Are you sure you want to continue?",
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
												text:"Not deleted"
											});
										}
									});
			
			
							};

						
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
														//console.log(element.qInfo.qId);
														arrayMeasures.push(element.qInfo.qId);
													})
												}).then(() => {
													measurevalues.rows.forEach(function (row, rowno) {
														// If there exists a measureid already, don't create
														if (!arrayMeasures.includes(row.cells[6].qText)) {
														
															var labelExpression = row.cells[2].qText;
															var description = row.cells[3].qText;
															var color = row.cells[4].qText;
															var tags = row.cells[5].qText
															if(labelExpression === '-'){
																labelExpression = '';
															}
															if(description === '-'){
																description = '';
															}
															if(color === '-'){
																color = '';
															}
															if(tags === '-'){
																tags ='';
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
																	"qLabelExpression": labelExpression, // wrap this string in ='' so Qlik understands it as an expression
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
																	"tags": [tags], //Tags:
																}
															});
														} else {
															//swal("Duplicates found. Some measures may not have been imported")
														}
			
													});
												
											});
			
											swal({
												text:"Measures Created.", 
												icon: "success",
											});
										
									});
							}

							$scope.UpdateMeasure = function() {
								// For each element that exists in MIM Definition => Do something
								measurevalues.rows.forEach(row => {
									enigma.app.getMeasure(row.cells[6].qText).then(reply =>{
										var labelExpression = row.cells[2].qText;
										var description = row.cells[3].qText;
										var color = row.cells[4].qText;
										var tags = row.cells[5].qText
										if(labelExpression === '-'){
											labelExpression = '';
										}
										if(description === '-'){
											description = '';
										}
										if(color === '-'){
											color = '';
										}
										if(tags === '-'){
											tags ='';
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
												"tags": [tags], //Tags:
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

							$scope.DestroyMeasure = function(){
								measurevalues.rows.forEach(element => {
									enigma.app.destroyMeasure(element.cells[6].qText)
								});
								swal({
									text:"Measures Deleted.", 
									icon: "success",
								});
							}

							$scope.DestroyAllMeasures = function () {
								swal({
										text: "Warning. This will remove all Measures from the Master Item Panel (Including those you have defined manually). Are you sure you want to continue?",
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
												text:"Not deleted"
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
												const response = element.getLayout();
												return response;
											})
											const itemsNotFormatted = Promise.all(testArray);
											//console.log(itemsNotFormatted)
											
												var headers = {
													Expression: "%MI%MeasureExpression", // remove commas to avoid errors
													Name: "%MI%MeasureName",
													LabelExpression: "%MI%MeasureLabelExpression",
													Description: "%MI%MeasureDescription",
													Color:"%MI%MeasureColor",
													Tags:"%MI%MeasureTags",
													ID:"%MI%MeasureId"
												};
												
												
												// console.log('Unformatted', itemsNotFormatted)
												var itemsFormatted = [];
												
												// format the data
												itemsNotFormatted.then((item) => {
													item.map(item => {
														console.log(item);
														switch(item.qMeasure.coloring){
															case undefined: 
																item.qMeasure.coloring = {
																	baseColor:{
																		color:"",
																		index:-1
																	}
																};
															break;
														}
														switch(Object.keys(item.qMeasure.coloring).length){
															case 0:
															item.qMeasure.coloring = {
																baseColor:{
																	color:"",
																	index:-1
																}
															}
															break;
														}
														
													})
													
													item.map(item => {
														itemsFormatted.push({
															Expression: `"${item.qMeasure.qDef}"`,
															Name: `"${item.qMeasure.qLabel}"`,
															LabelExpression: `"${item.qMeasure.qLabelExpression}"`.replace("undefined", ""),
															Description: `"${item.qMeta.description}"`,
															Color:`"${item.qMeasure.coloring.baseColor.color}"`,
															Tags:`"${item.qMeta.tags[0]}"`.replace("undefined", ""),
															ID: `"${item.qInfo.qId}"`,
														});
													})
													//.replace(/(\u005Ct)/g, '\t').replace(/(\u005Cr\u005Cn)/g, '\n').replace(/(\u005Cn)/g, '\n'),
												
													
												
												}).then( element => {
													itemsFormatted.forEach(function(obj) {
														for(var i in obj) { 
														  if(obj[i] === undefined) {
															obj[i] = "=''";
														  }
														}
													  });
													  var fileTitle = 'MeasureExport';
													  //console.log(itemsFormatted)
													  exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
													  swal({
															text:"Measure Master Items Exported.", 
															icon: "success",
														});
													});
												//console.log('Formatted', itemsFormatted)
												
												
			
											
										})
									}) 
								})  
			
							
			
							
							};

							$scope.PartialReload = function () {
								swal({
									text:"Partial Reload Started.", 
									icon: "warning",
								});
								app.doReload(0, true, false).then(() => {
									app.doSave().then(reply => {
										swal({
											text:"Partial Reload Complete.", 
											icon: "success",
										});
									});
								});
								//console.log("reloaded")
							};

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
										//console.log($scope.dimensionvalues);
										$element.find('#dialogSelect').on('click', function () {
											//console.log("element clicked")
											if (this.hasAttribute("data-value")) {
												var value = parseInt(this.getAttribute("data-value"), 10),
													dim = 0;
												self.selectValues(dim, [value], true);
											}
										});
										//console.log($element);
									}]
								});
							};
						
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
											//console.log(element.qInfo.qId);
											arrayMeasures.push(element.qInfo.qId);
										})
									}).then(() => {
										measurevalues.rows.forEach(function (row, rowno) {
											// If there exists a measureid already, don't create
											if (!arrayMeasures.includes(row.cells[6].qText)) {
												enigma.app.createMeasure({
													"qInfo": {
														"qType": "measure",
														"qId": row.cells[6].qText
													},
													"qMeasure": {
														"qLabel": row.cells[0].qText,
														"qDef": row.cells[3].qText,
														"qGrouping": "N",
														"qLabelExpression": `${row.cells[2].qText}`, // wrap this string in ='' so Qlik understands it as an expression
														"qExpressions": [],
														"coloring": {
															"baseColor": {
																"color": row.cells[5].qText,
																"index": -1
															},
														},
														"qActiveExpression": 0
													},
													"qMetaDef": {
														"title": row.cells[0].qText,
														"description": `${row.cells[1].qText}`, // Description:
														"tags": [row.cells[4].qText], //Tags:
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
											//console.log(element.qInfo.qId);
											arrayDimensions.push(element.qInfo.qId);
										})
									}).then(() => {
										dimensionvalues.rows.forEach(function (row, rowno) {

											if (!arrayDimensions.includes(row.cells[6].qText)) {
												enigma.app.createDimension({
													"qInfo": {
														"qType": "dimension",
														"qId": row.cells[6].qText
													},
													"qDim": {
														//	"title": "something",
														"qGrouping": "N",
														"qLabelExpression": `${row.cells[2].qText}`,
														"qFieldDefs": [
															row.cells[1].qText //Dimension Field:
														],
														//"qFieldLabels": ["TEST"],
														"title": row.cells[0].qText,
														"coloring": {
															"baseColor": {
																"color": row.cells[4].qText, // Dimension Color:
																"index": -1
															},
														},
													},
													"qMetaDef": {
														"title": row.cells[0].qText, //Dimension Name
														"description": row.cells[3].qText, //Desciption:
														"tags": [row.cells[5].qText], //Tags
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
									"qId": row.cells[6].qText
								},
								"qMeasure": {
									"qLabel": row.cells[0].qText,
									"qDef": row.cells[3].qText,
									"qGrouping": "N",
									"qLabelExpression": `${row.cells[2].qText}`, // wrap this string in ='' so Qlik understands it as an expression
									"qExpressions": [],
									"coloring": {
										"baseColor": {
											"color": row.cells[5].qText,
											"index": -1
										},
									},
									"qActiveExpression": 0
								},
								"qMetaDef": {
									"title": row.cells[0].qText,
									"description": `${row.cells[1].qText}`, // Description:
									"tags": [row.cells[4].qText], //Tags:
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
									"qId": row.cells[6].qText
								},
								"qDim": {
									//	"title": "something",
									"qGrouping": "N",
									"qLabelExpression": `${row.cells[2].qText}`,
									"qFieldDefs": [
										row.cells[1].qText //Dimension Field:
									],
									//"qFieldLabels": ["TEST"],
									"title": row.cells[0].qText,
									"coloring": {
										"baseColor": {
											"color": row.cells[4].qText, // Dimension Color:
											"index": -1
										},
									},
								},
								"qMetaDef": {
									"title": row.cells[0].qText, //Dimension Name
									"description": row.cells[3].qText, //Desciption:
									"tags": [row.cells[5].qText], //Tags
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
						//console.log(reply)
					});
				};
				// Destroy Master items


				$scope.DestroyDimension = function () {
					// The Engine API DestroyMeasure function: https://help.qlik.com/en-US/sense-developer/September2018/APIs/EngineAPI/services-Doc-DestroyMeasure.html
					//console.log("Test")

					dimensionvalues.rows.forEach(element => {
						enigma.app.destroyDimension(element.cells[6].qText)
					})
				//	//console.log(dimensionvalues.rows)
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
										Expression: "%MI%MeasureExpression", // remove commas to avoid errors
										Name: "%MI%MeasureName",
										LabelExpression: "%MI%MeasureLabelExpression",
										Description: "%MI%MeasureDescription",
										Color:"%MI%MeasureColor",
										Tags:"%MI%MeasureTags",
										ID:"%MI%MeasureId"
									};
									
									
									 //console.log(itemsNotFormatted)
									var itemsFormatted = [];
									
									// format the data
									itemsNotFormatted.then((item) => {
										item.map(item => {
											itemsFormatted.push({
												Expression: JSON.stringify(item.qMeasure.qDef).replace(/(\u005Ct)/g, '\t').replace(/(\u005Cr\u005Cn)/g, '\n').replace(/(\u005Cn)/g, '\n'),
												Name: JSON.stringify(item.qMeasure.qLabel),
												LabelExpression:JSON.stringify(item.qMeasure.qLabelExpression),
												Description: JSON.stringify(item.qMeta.description),
												Color:JSON.stringify(item.qMeasure.coloring.baseColor.color),
												Tags:JSON.stringify(item.qMeta.tags[0]),
												ID: JSON.stringify(item.qInfo.qId),
											});
										})
										var fileTitle = 'MeasureExport';
									//
									exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
									});
									//console.log(itemsFormatted)
									
									

								
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
									
									
									////console.log(itemsNotFormatted)
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
									//console.log(itemsFormatted)
									
									
	
								
							})
						}) 
					}) 

				}
		
				$scope.ExportVariables = function () {
					//console.log("exportvariables")
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
								////console.log(itemsNotFormatted2)
								var headers = {
									qName: "qName",
									qVariable: "qDefinition",
									qId: "qId",
									qType: "qType",
								};

								var itemsFormatted = [];

								itemsNotFormatted.then(item => {
									
									item.map(item => {
										////console.log(item
											//console.log((item.qDefinition));
											
											
											itemsFormatted.push({
													qName: item.qName,
													qDefinition: item.qDefinition, 
													//qId: JSON.stringify(item.qInfo.qId),
													//qType: JSON.stringify(item.qInfo.qType),
											}) 
									})

////console.log(itemsFormatted)
var fileTitle = 'VariableExport';
		
									
//console.log("test", itemsFormatted)
exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download

								})

							})
								
						
									
									
						}) 


					}) 
					

				
				}

				$scope.PartialReload = function () {
					swal({
						text:"Partial Reload Started.", 
						icon: "warning",
					});
					app.doReload(0, true, false).then(() => {
						app.doSave().then(reply => {
							swal({
								text:"Partial Reload Complete.", 
								icon: "success",
							});
						});
					});
					//console.log("reloaded")
				};






			}]
		};
	});