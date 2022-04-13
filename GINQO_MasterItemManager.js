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
    'text!', './lib/swal', './lib/lodash'
],
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
            
            // METHOD FOR GETTING ENGINE VERSION
            $scope.getEngineVersion = () => {
                //Get Engine Version Promise
                return new Promise((resolve, reject) => {
                        resolve(enigma.app.global.engineVersion());
                    })
                    .then((message) => {
                        console.log(message.qComponentVersion);
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            };

            $scope.getEngineVersion();

            // Create a Modal Window for the Help Dialog
            $scope.openHelpModal = () => {
                var helpModalSchema = {
                    template: helpModalWindow,
                    input: {
                        name: $scope.name
                    },
                    controller: ['$scope', '$element', function ($scope, $element) {}]
                };
                luiDialog.show(helpModalSchema);
            };

            /***************************************************
             * 												   *
             *					MEASURES 					   *
             * 												   *
             ***************************************************/

            var measurevalues = app.createTable(['%MI%MeasureName', '%MI%MeasureDescription', '%MI%MeasureLabelExpression', '%MI%MeasureExpression', '%MI%MeasureTags', '%MI%MeasureColor','%MI%MeasureId','%MI%MeasureSegmentColor','%MI%MeasureSegmentColorFormat'], {
                rows: 1000
            });
			
			var fmtvalues = app.createTable(['%MI%MeasureId','%MI%MeasureFormatType', '%MI%MeasureFormatNDec', '%MI%MeasureFormatUseThou', '%MI%MeasureFormatFmt', '%MI%MeasureFormatDec', '%MI%MeasureFormatThou'], {
                rows: 1000
            });
										
            // Menu option for changing MEASURES
            $scope.openMeasModalMain = function () {
                // Open luiDialog for actions on Measures
                luiDialog.show({
                    template: measModalWindow,
                    input: {
                        name: $scope.name
                    },
                    controller: ['$scope', '$element', function ($scope, $element) {
                        // Create virtual table of Master Items in $scope
                        $scope.measurevalues = measurevalues;
						$scope.fmtvalues = fmtvalues;
                        // Method in $scope for Processing Measures
                        $scope.ProcessMeasures = ProcessMeasures;
                        // Method in $scope for DestroyMeasures
                        $scope.DestroyMeasure = DestroyMeasure;
                        // Method in $scope for DestroyAllMeasures
                        $scope.DestroyAllMeasures = DestroyAllMeasures;
                        // Method in $scope for running Confirm Dialog
                        $scope.ConfirmDialogMeas = ConfirmDialogMeas;
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
                                            SegmentColor: "%MI%MeasureSegmentColor", // 2020-09-09 (Riki) Added Segment Color 
                                            SegmentColorFormat: "%MI%MeasureSegmentColorFormat", // 2020-09-09 (Riki) Added SegmentColor Format
                                            ID: "%MI%MeasureId",
											FormatType: "%MI%MeasureFormatType", // 2022-04-01 (HGR) Added Format Type
											FormatNDec: "%MI%MeasureFormatNDec", // 2022-04-01 (HGR) Added Format Type
                                            FormatUseThou: "%MI%MeasureFormatUseThou", // 2022-04-01 (HGR) Added Format Type
                                            FormatFmt: "%MI%MeasureFormatFmt", // 2022-04-01 (HGR) Added Format Type
                                            FormatDec: "%MI%MeasureFormatDec", // 2022-04-01 (HGR) Added Format Type
                                            FormatThou: "%MI%MeasureFormatThou" // 2022-04-01 (HGR) Added Format Type
                                        };


                                        // console.log('Unformatted', itemsNotFormatted)
                                        var itemsFormatted = [];

                                        // format the data
                                        itemsNotFormatted.then((item) => {
                                            item.map(item => {

                                                // console.log(item);
                                                /*
                                                switch (item.qMeasure.coloring) { // 2020-09-09 (Riki) Added second statement to check base color
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
                                                */

                                                // 2020-09-23 (Riki) Parse measure name & id
                                               var itemName = item.qMeasure.qLabel;
                                               var itemID = item.qInfo.qId;

                                                // 2020-09-09 (Riki) Parse and convert segment color json to comma separated string for exporting
                                               var segmentColorFormatted
                                               var segmentColorLimitType
                                                if (item.qMeasure.coloring.gradient !== undefined && item.qMeasure.coloring.gradient != '') {
                                                    
                                                    // Get segment color json data
                                                    var segmentColorItem = item.qMeasure.coloring.gradient;
                                                    var segmentColorFormatted=[];

                                                    var colors = segmentColorItem.colors;  
                                                    var limits = segmentColorItem.limits;
                                                    var breaks = segmentColorItem.breakTypes;	

                                                    // Get segment color limit number type
                                                    segmentColorLimitType = segmentColorItem.limitType	
                                                    if(segmentColorLimitType == 'absolute'){
                                                        segmentColorLimitType = 'fixed';
                                                    }

                                                    // Append color code, limit value and gradient to list
                                                    for(let i = 0; i < colors.length; i++){
                                                      if(i<colors.length-1) {
														if(segmentColorLimitType=='fixed') {
															segmentColorFormatted.push(colors[i].color + '|' +  limits[i] + '|' + breaks [i])
														}
                                                        else{
															segmentColorFormatted.push(colors[i].color + '|' +  (limits[i]*100).toFixed(2).replace(/\.00$/, "") + '|' + breaks [i])
														}
                                                      }
                                                      else {
                                                        segmentColorFormatted.push(colors[i].color)
                                                      }
                                                    }
                                                    
                                                    // Join color code list into comma separated string
                                                    segmentColorFormatted = segmentColorFormatted.join(",");
                                                    
                                                }	
                                                else {
                                                    segmentColorFormatted = "";
                                                    segmentColorLimitType = "";

                                                }													
                                            
                                                // 2020-09-09 (Riki) Conditional statement to parse Measure description with expression
                                                var itemDescription;
                                                if(item.qMeasure.descriptionExpression !== undefined){
                                                    itemDescription = item.qMeasure.descriptionExpression.qStringExpression.qExpr.replace(/\"/g,'""');
                                                }
                                                else{
                                                    itemDescription = item.qMetaDef.description.replace(/\"/g,'""');
                                                }
                                                
                                                // 2020-09-23 (Riki) Conditional statement to parse Measure base color
                                                var itemBaseColor;
                                                if(item.qMeasure.coloring.baseColor !== undefined){
                                                    itemBaseColor = item.qMeasure.coloring.baseColor.color;
                                                }
                                                else{
                                                    itemBaseColor =  "";
                                                }

                                                // 2020-09-23 (Riki) Conditional statement to parse Measure Expression
                                                var itemExpression
                                                if(item.qMeasure.qDef !== undefined){
                                                    itemExpression = item.qMeasure.qDef.replace(/\"/g,'""');
                                                }
                                                else{
                                                    itemExpression =  "";
                                                }

                                                // 2020-09-23 (Riki) Conditional statement to parse Measure Expression
                                                var itemTags
                                                if(item.qMetaDef.tags[0] !== undefined){
                                                    itemTags = item.qMetaDef.tags.join(",");
                                                }
                                                else{
                                                    itemTags =  "";
                                                }
                                                
                                                // 2020-09-23 (Riki) Conditional statement to parse Measure Label Expression
                                                var itemLabelExpression
                                                if(item.qMeasure.qLabelExpression !== undefined){
                                                    itemLabelExpression = item.qMeasure.qLabelExpression.replace(/\"/g,'""');
                                                }
                                                else{
                                                    itemLabelExpression =  "";
                                                }


												// 2022-04-01 (HGR) Added Format Type
                                                var itemNumFormat
                                                var itemNumFormatType
												var itemNumFormatNDec
                                                var itemNumFormatUseThou
                                                var itemNumFormatFmt
                                                var itemNumFormatDec
                                                var itemNumFormatThou                                                

                                                if(item.qMeasure.qNumFormat !== undefined){
                                                    itemNumFormat = item.qMeasure.qNumFormat;
                                                    itemNumFormatType = itemNumFormat.qType;
													itemNumFormatNDec = itemNumFormat.qnDec;
                                                    itemNumFormatUseThou = itemNumFormat.qUseThou;
                                                    itemNumFormatFmt = itemNumFormat.qFmt;                                                    
													itemNumFormatDec = itemNumFormat.qDec;
                                                    itemNumFormatThou = itemNumFormat.qThou;
                                                }
                                                else{
                                                    itemNumFormat =  "";
                                                    itemNumFormatType = "";
													itemNumFormatNDec = 1;
                                                    itemNumFormatUseThou = 1;
                                                    itemNumFormatFmt = "";
                                                    itemNumFormatDec = "";
                                                    itemNumFormatThou = "";
                                                }    

                                                // 2020-09-23 (Riki) Push data into list
                                                itemsFormatted.push({
                                                    Expression: `"${itemExpression}"`,
                                                    Name: `"${itemName}"`,
                                                    LabelExpression: `"${itemLabelExpression}"`,
                                                    Description: `"${itemDescription}"`,
                                                    Color: `"${itemBaseColor}"`,
                                                    Tags: `"${itemTags}"`,
                                                    SegmentColor: `"${segmentColorFormatted}"`,
                                                    SegmentColorFormat: `"${segmentColorLimitType}"`, 
                                                    ID: `"${itemID}"`,
                                                    FormatType: `"${itemNumFormatType}"`,
													FormatNDec: `"${itemNumFormatNDec}"`,
                                                    FormatUseThou: `"${itemNumFormatUseThou}"`,
                                                    FormatFmt: `"${itemNumFormatFmt}"`,
                                                    FormatDec: `"${itemNumFormatDec}"`,
                                                    FormatThou: `"${itemNumFormatThou}"`,
                                                }); 
                                            })

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

            const ProcessMeasures = () => {
                // 1. Get MeasureList Object of Existing Measures
                new Promise((resolve,reject) => {
                    resolve(
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
                        })
                    );
                })
                // 2. Get the MeasureList Object Properties Clean
                .then(measureList => {
                    return measureList.getLayout();
                })					
                // 3. Get the MeasureList Info
                .then(measureListInfo => {					
                    
                    // List of Measures (base form);
                    const measDef = measureListInfo.qMeasureList.qItems.map(async element => {
                        const response = enigma.app.getMeasure(element.qInfo.qId);
                        return response;
                    })                    
					return Promise.all(measDef);
					
                })
                // 4. Get the MeasureList Properties
                .then(measureListProperties => {

                    const testArray = measureListProperties.map(element => {
                        const response = element.getProperties();
                        return response;
                    })

                    return Promise.all(testArray);			
                   
				})  
				// 5. Push the Measures in the MeasureList Properties Object to an Array              
                .then(measureListPropertyItems => {

                        var arrayMeasures = [];
                        //console.log(measureListPropertyItems)
                        measureListPropertyItems.forEach((element) => {
                            arrayMeasures.push({
                                mId:   element.qInfo.qId,
                                mLabel: element.qMeasure.qLabel,
                                mGradient: element.qMeasure.coloring.gradient
                            });
                        });                                                                    
                        return arrayMeasures;
                    
                })   
                // 6. Take the measures in the array and compare them to the in memory table of Measures
                .then(arrayMeasures => {

                    var measureIdList = []
                    var measureGradientList = []
                    var measureLabelList = []
                    arrayMeasures.forEach(function(entry) {
                        measureIdList.push(entry.mId)
                        measureGradientList.push(entry.mGradient)
                        measureLabelList.push(entry.mLabel)
                    });
					
					function zip() {
						var args = [].slice.call(arguments);
						var shortest = args.length==0 ? [] : args.reduce(function(a,b){
							return a.length<b.length ? a : b
						});

						return shortest.map(function(_,i){
							return args.map(function(array){return array[i]})
						});
					}

					// add measure formats to measure values
					var measures = zip(measurevalues.rows,fmtvalues.rows)
                    
                    measures.forEach((row_tuple, rowno) => {
						var row = row_tuple[0]
						var fmt = row_tuple[1]
						
						// make sure that rows are in same order
						if(row.cells[6].qText == fmt.cells[0].qText) {
							var cells = row.cells.concat(fmt.cells.slice(1))
							
							// 6a. If the Measure already exists, update it instead of creating a new one
							var mIndex = measureIdList.indexOf(cells[6].qText)							
							if(mIndex == -1){ 
								console.log(rowno+1 + '. Creating Measure: ' + cells[0].qText + ', Id:' + cells[6].qText)
								$scope.CreateMeasure = CreateMeasure(cells);
							} 
							// 6b. If the Measure does not exist already, create a new one
							else {
								console.log(rowno+1 + '. Updating Measure: ' + measureLabelList[mIndex] + ', Id:' + measureIdList[mIndex])									
								$scope.UpdateMeasure = UpdateMeasure(cells, measureGradientList[mIndex]);
							}
						}
						else {
							console.log("Rows are not in same order!")
						}
                    });

                })
                .then(() => {
                    swal({
                        text: "Measures Created",
                        icon: "success"
                    });
                    // swal({
                    // 	text: "Found Existing Measures. Synchronizing...",
                    // 	icon: "warning"
                    // })
                })
            }
            const CreateMeasure =(cells) => {
                // Filter and parse EXPRESSION
                var expression
                if (typeof cells[3].qText != 'undefined'){
                    expression = cells[3].qText;
                }
                if (expression === '-') {
                    expression = '';
                }
                // Filter and parse LABELEXPRESSION
                var labelExpression
                if (typeof cells[2].qText != 'undefined'){
                    labelExpression = cells[2].qText;
                }
                if (labelExpression === '-') {
                    labelExpression = '';
                }
                // Filter and parse COLOR
                var color
                if (typeof cells[5].qText != 'undefined'){
                    color = cells[5].qText;
                }
                if (color === '-') {
                    color = '';
                }
                // Filter and parse DESCRIPTION
                var description;
                if (typeof cells[1].qText != 'undefined'){
                    description = cells[1].qText;
                }
                if (description === '-') {
                    description = '';
                }
                // Filter and parse TAGS
                var tags = cells[4].qText;
                var tagsList = [];
                if (typeof tags != 'undefined') {
                    tagsList = tags.split(",");
                    //console.log(tagsList);
                    tagsList = tagsList.filter(a => a !== '-');
                }
                tagsList.push('Master Item Manager')
                
                // 2020-09-09 (Riki) Filter and parse SEGMENTCOLOR                
                var segmentColor
                if (typeof cells[7] != 'undefined'){
					
					// Get the segment number format from config file
                    var segmentTypeInput = cells[8].qText.toLowerCase();
                    var segmentFormat;
                    switch (true) {
                      case segmentTypeInput == 'percent':
                        segmentFormat = 'percent';
                        break;
                      case segmentTypeInput == 'fixed':
                        segmentFormat = 'absolute';
                        break;
                      default:
                        segmentFormat = 'percent';
                    }
                    
                    // Get the segment color list from config file, then parse the value to JSON
                    var segmentColorList = cells[7].qText;
                    if (segmentColorList === '-') {							
                        segmentColor = ''
                    }
                    else {							
                        var arr = segmentColorList.split(',')

                        var colors=[]
                        var limits=[]
                        var breaks=[]

                        for(let i = 0; i < arr.length; i++){
                          var item = arr[i]
                          var item_color = item.match('\#[A-Za-z0-9]{3,6}')[0]

                          var item_index =  -1
                          
                          var item_limit
                          if(segmentFormat == 'percent'){								  
                            item_limit = +((parseFloat(item.substring(item.indexOf("|")+1,item.lastIndexOf('|')))/100).toFixed(2)).replace(/\.00$/, "")								
                          }
                          else{
                            item_limit = +(parseFloat(item.substring(item.indexOf("|")+1,item.lastIndexOf('|'))))
                          }

                          var item_break = item.substring(item.lastIndexOf("|")+1).toLowerCase()
                          var isBreakTrueSet = (item_break == 'true')
                          
                          colors.push({color:  item_color,index: item_index});
        
                          if(i<arr.length-1) {
                              limits.push(item_limit);
                              breaks.push(isBreakTrueSet);
                          }

                        }

                        segmentColor = {colors: colors, limits: limits, breakTypes: breaks, limitType: segmentFormat};
                    
                    }
                }
				
								// HGR 2022-04-01 Added Measure Format
				if(cells.length >= 15) {
					// Filter and parse FormatType
					var formatType;
					if (typeof cells[9].qText != 'undefined'){
						formatType = cells[9].qText;
					}
					if (formatType === '-') {
						formatType = '';
					}
					
					// Filter and parse FormatNDec
					var formatNDec;
					if (typeof cells[10].qText != 'undefined'){
						formatNDec = cells[10].qText;
					}
					if (formatNDec === '-') {
						formatNDec = '';
					}
					
					// Filter and parse FormatUseThou
					var formatUseThou;
					if (typeof cells[11].qText != 'undefined'){
						formatUseThou = cells[11].qText;
					}
					if (formatUseThou === '-') {
						formatUseThou = '';
					}
					
					// Filter and parse FormatFmt
					var formatFmt;
					if (typeof cells[12].qText != 'undefined'){
						formatFmt = cells[12].qText;
					}
					if (formatFmt === '-') {
						formatFmt = '';
					}
									
					// Filter and parse FormatDec
					var formatDec;
					if (typeof cells[13].qText != 'undefined'){
						formatDec = cells[13].qText;
					}
					if (formatDec === '-') {
						formatDec = '';
					}
									
					// Filter and parse FormatThou
					var formatThou;
					if (typeof cells[14].qText != 'undefined'){
						formatThou = cells[14].qText;
					}
					if (formatThou === '-') {
						formatThou = '';
					}
                }    
                
                var properties = {
                    "qInfo": {
                        "qType": "measure",
                        "qId": cells[6].qText
                    },
                    "qMeasure": {
                        "qLabel": cells[0].qText,
                        "qDef": expression,
                        "qGrouping": "N",
                        "qLabelExpression": labelExpression,
                        "qExpressions": [],
                        "coloring": {
                            "baseColor": {
                                "color": color,
                                "index": -1
                            },
                            "gradient": segmentColor // 2020-09-09 (Riki) Added segment color
                        },
                        "qActiveExpression": 0,
						
						// HGR 2022-04-01 Added Number Format
						"qNumFormat": {
							"qType": formatType,
							"qnDec": parseInt(formatNDec),
							"qUseThou": parseInt(formatUseThou),
							"qFmt": formatFmt,
							"qDec": formatDec,
							"qThou": formatThou
						}
                    },
                    "qMetaDef": {
                        "title": cells[0].qText,
                        "description": description, // Description:
                        "tags": tagsList, //Tags:
                    }
                };
				
                enigma.app.createMeasure(properties);
            }
            const UpdateMeasure = (cells, gradient) => {
                //console.log("Updated Measures")
                // For each element that exists in MIM Definition => Do something
                enigma.app.getMeasure(cells[6].qText).then(reply => {
                // Filter and parse EXPRESSION
                var expression
                if (typeof cells[3].qText != 'undefined'){
                    expression = cells[3].qText;
                }
                if (expression === '-') {
                    expression = '';
                }
                // Filter and parse LABELEXPRESSION
                var labelExpression
                if (typeof cells[2].qText != 'undefined'){
                    labelExpression = cells[2].qText;
                }
                if (labelExpression === '-') {
                    labelExpression = '';
                }
                // Filter and parse COLOR
                var color
                if (typeof cells[5].qText != 'undefined'){
                    color = cells[5].qText;
                }
                if (color === '-') {
                    color = '';
                }
                // Filter and parse DESCRIPTION
                var description;
                if (typeof cells[1].qText != 'undefined'){
                    description = cells[1].qText;
                }
                if (description === '-') {
                    description = '';
                }
                // Filter and parse TAGS
                var tags = cells[4].qText;
                var tagsList = [];
                if (typeof tags != 'undefined') {
                    tagsList = tags.split(",");
                    //console.log(tagsList);
                    tagsList = tagsList.filter(a => a !== '-');
                }
                tagsList.push('Master Item Manager')
    
            
                // 2020-09-09 (Riki) Filter and parse SEGMENTCOLOR
                var segmentColor
                if (typeof cells[7] != 'undefined'){
					
					// Get the segment number format from config file
                    var segmentTypeInput = cells[8].qText.toLowerCase();
                    var segmentFormat;
                    switch (true) {
                      case segmentTypeInput == 'percent':
                        segmentFormat = 'percent';
                        break;
                      case segmentTypeInput == 'fixed':
                        segmentFormat = 'absolute';
                        break;
                      default:
                        segmentFormat = 'percent';
                    }
                    
                    // Get the segment color list from config file, then parse the value to JSON
                    var segmentColorList = cells[7].qText;
                    if (segmentColorList === '-') {							
                        segmentColor = gradient // if no color list defined in the config file, use the old color instead
                    }
                    else {							
                        var arr = segmentColorList.split(',')

                        var colors=[]
                        var limits=[]
                        var breaks=[]

                        for(let i = 0; i < arr.length; i++){
                          var item = arr[i]
                          var item_color = item.match('\#[A-Za-z0-9]{3,6}')[0]

                          var item_index =  -1
                          
                          var item_limit
                          if(segmentFormat == 'percent'){								  
                            item_limit = +((parseFloat(item.substring(item.indexOf("|")+1,item.lastIndexOf('|')))/100).toFixed(2)).replace(/\.00$/, "")								
                          }
                          else{
                            item_limit = +(parseFloat(item.substring(item.indexOf("|")+1,item.lastIndexOf('|'))))
                          }

                          var item_break = item.substring(item.lastIndexOf("|")+1).toLowerCase()
                          var isBreakTrueSet = (item_break == 'true')
                          
                          colors.push({color:  item_color,index: item_index});
        
                          if(i<arr.length-1) {
                              limits.push(item_limit);
                              breaks.push(isBreakTrueSet);
                          }

                        }

                        segmentColor = {colors: colors, limits: limits, breakTypes: breaks, limitType: segmentFormat};
                    
                    }
                }
				
				// HGR 2022-04-01 Added Measure Format
				if(cells.length >= 15) {
					// Filter and parse FormatType
					var formatType;
					if (typeof cells[9].qText != 'undefined'){
						formatType = cells[9].qText;
					}
					if (formatType === '-') {
						formatType = '';
					}
					
					// Filter and parse FormatNDec
					var formatNDec;
					if (typeof cells[10].qText != 'undefined'){
						formatNDec = cells[10].qText;
					}
					if (formatNDec === '-') {
						formatNDec = '';
					}
					
					// Filter and parse FormatUseThou
					var formatUseThou;
					if (typeof cells[11].qText != 'undefined'){
						formatUseThou = cells[11].qText;
					}
					if (formatUseThou === '-') {
						formatUseThou = '';
					}
					
					// Filter and parse FormatFmt
					var formatFmt;
					if (typeof cells[12].qText != 'undefined'){
						formatFmt = cells[12].qText;
					}
					if (formatFmt === '-') {
						formatFmt = '';
					}
									
					// Filter and parse FormatDec
					var formatDec;
					if (typeof cells[13].qText != 'undefined'){
						formatDec = cells[13].qText;
					}
					if (formatDec === '-') {
						formatDec = '';
					}
									
					// Filter and parse FormatThou
					var formatThou;
					if (typeof cells[14].qText != 'undefined'){
						formatThou = cells[14].qText;
					}
					if (formatThou === '-') {
						formatThou = '';
					}
                }    
				
				var properties = {
                    "qInfo": {
                        "qType": "measure",
                        "qId": cells[6].qText
                    },
                    "qMeasure": {
                        "qLabel": cells[0].qText,
                        "qDef": expression,
                        "qGrouping": "N",
                        "qLabelExpression": labelExpression,
                        "qExpressions": [],
                        "coloring": {
                            "baseColor": {
                                "color": color,
                                "index": -1
                            },
                            "gradient": segmentColor // 2020-09-09 (Riki) Added segment color
                        },
                        "qActiveExpression": 0,
						
						// HGR 2022-04-01 Added Number Format
						"qNumFormat": {
							"qType": formatType,
							"qnDec": parseInt(formatNDec),
							"qUseThou": parseInt(formatUseThou),
							"qFmt": formatFmt,
							"qDec": formatDec,
							"qThou": formatThou
						}
                    },
                    "qMetaDef": {
                        "title": cells[0].qText,
                        "description": description, // Description:
                        "tags": tagsList, //Tags:
                    }
                };
				
                reply.setProperties(properties);
                    
                });
            };
            const DestroyMeasure = () => {
                // 1. Create in memory table of Measures Loaded into the MIM App
                const table = app.createTable(['%MI%MeasureName', '%MI%MeasureDescription', '%MI%MeasureLabelExpression', '%MI%MeasureExpression', '%MI%MeasureTags', '%MI%MeasureColor','%MI%MeasureId','%MI%MeasureSegmentColor','%MI%MeasureSegmentColorFormat','%MI%MeasureFormatType', '%MI%MeasureFormatNDec', '%MI%MeasureFormatUseThou', '%MI%MeasureFormatFmt', '%MI%MeasureFormatDec', '%MI%MeasureFormatThou'], {
                    rows: 1000
                });

                // 2. Create listener to detect new data in table api
                let listener = () => { 
                    console.log("1. Deleting Measures... (Sync started)");

                    // 3. Destroy each measure in the table
                    new Promise((resolve, reject) => {
                        resolve(
                            table.rows.forEach(element => {
                                console.log("Deleting measure id: " + element.cells[6].qText)
                                enigma.app.destroyMeasure(element.cells[6].qText)
                            })
                        )
                    })
                    // 4. Display that the dimensions have been deleted
                    .then(() => {
                        console.log("2. Measures Deleted... (Sync complete)")
                        swal({
                            text: "Measures Deleted.",
                            icon: "success",
                        });
                    })

                    
                    table.OnData.unbind( listener );  //unregister the listener when no longer notification is needed.   
                }; 
                table.OnData.bind( listener ); //bind the listener
            
            }
            const DestroyAllMeasures = () => {
                // 1. Display message to ask if users should delete
                console.log("1. User prompted for Delete all Measures...")
                var swaltext = {
                    text: "Warning: This feature will delete all Measures in this app whether they have been created natively through the Qlik Sense interface, or by the Master Item Manager. Are you sure you want to Delete All Measures?",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                }
                new Promise((resolve, reject) => {
                    resolve(
                        swal(swaltext)
                    );
                })
                // 2. If user decides to delete, create a list of all the application's Dimensions
                .then((willDelete) => {
                    if(willDelete){
                        console.log("2. Measures will be deleted... (Sync started)")
                        return new Promise((resolve, reject) => {
                            resolve(								
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
                                })
                            );
                        });
                    } else {
                        
                        return new Promise((resolve, reject) => {
                            console.log("2. Measures will not be deleted... (Sync started)")
                            reject(
                                swal({
                                    text: "Master items have not been deleted.",
                                    icon: "error"
                                })
                            )
                        })
                    }
                })
                // 3. Evaluate the list of Dimensions with the GetLayout function
                .then((measureList) => {
                    console.log("3. Creating Measure List... (Sync in progress)");
                    return measureList.getLayout();
                })
                // 4. Push each ID for existing dimension into an array to be deleted
                .then((measureLayout) => {
                    var measureArray = [];
                    console.log("4. MeasureList created... (Sync in progress)")
                    console.log("5. Creating properties layout... (Sync in progress)");
                    measureLayout.qMeasureList.qItems.forEach((element) => {
                        measureArray.push(element.qInfo.qId)
                    });
                    return measureArray;
                })
                // 5. Run the DestoryMeasure() method against each element in that array
                .then((measureArray) => {
                    console.log("6. Properties layout has been created... (Sync in progress)")
                    console.log("7. Creating array of list of measures for deletion... (Sync in progress)")
                    measureArray.forEach(measure => {
                        enigma.app.destroyMeasure(measure);
                    })
                })
                // 6. Display message that Master Items have been successfully deleted
                .then(() => {
                    console.log("8. Measures have been deleted (Sync in progress)")
                    console.log("9. Displaying confirmation message to user... (Sync complete)")
                    swal({
                        text: "All Measure type Master Items in the current application have been deleted.",
                        icon: "success",
                    });
                })
                // 7. Display status on error or reject
                .catch(err => {
                    console.log("3. Measures have not been deleted (Terminated).");
                })

            };
            // MODAL FUNCTIONS
            const ConfirmDialogMeas = () => {
                luiDialog.show({
                    template: measModalConfirmWindow,
                    input: {
                        name: $scope.name
                    },
                    controller: ['$scope', 'luiPopover', '$element', function ($scope, luiPopover, $element) {
                        const OpenPopover = (index, row) => {
                            luiPopover.show({
                                template: measModalConfirmPopoverWindow,
                                input: {},
                                alignTo: document.getElementsByClassName("popover")[index], //This is the key to making the popover work and attach to the element
                                dock: "right",
                                controller: ['$scope', function ($scope) {
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

                                    // 2020-11-01 (Riki) Added conditional statement to show measure segment color values
                                    $scope.MeasureSegmentColor = (typeof row[7] !== 'undefined') ? row[7].qText : "-"; 
                                    $scope.MeasureSegmentColorFormat =(typeof row[8] !== 'undefined') ? row[8].qText : "-";											
                                    
                                    $scope.MeasureID = row[6].qText;
                                    //console.log($scope.MeasureID)
        
                                    $scope.SelectValue = function () {
                                        app.field('%MI%MeasureId').toggleSelect($scope.MeasureID, true);
                                        $scope.close();
                                    }
                                    $scope.SelectAlternative = function () {
                                        app.field('%MI%MeasureId').selectAlternative();
                                    }
                                    //app.field('%MI%MeasureId').toggleSelect($scope.MeasureID, true);
                                }]
                            });
                        };
                        // Get a Selectable List from the qlik selection based on fields
                        $scope.measurevalues = measurevalues;

                        $scope.OpenPopover = OpenPopover;

                        $scope.selState = app.selectionState();
                        
                    }]
                });
            };

            /***************************************************
             * 												   *
             *					DIMENSIONS 					   *
             * 												   *
             ***************************************************/

            // Create in memory table of Qlik Sense Dimensions
            var dimensionvalues = app.createTable(['%MI%DimensionName', '%MI%DimensionField', '%MI%DimensionLabelExpression', '%MI%DimensionDescription', '%MI%DimensionColor', '%MI%DimensionTags', '%MI%DimensionId'], {
                rows: 1000
            });
            // Menu option for changing DIMENSIONS
            $scope.openDimensionModalMain = function () {
                console.log("Opened Dimension Modal")
                var dimensionModalConfig = {
                    
                    template: dimModalWindow,
                    input: {
                        name: $scope.name
                    },
                    controller: ['$scope', '$element', function ($scope, $element) {

                        $scope.ConfirmDialogDim = ConfirmDialogDim;
                        // Method in $scope for ProcessDimensions
                        $scope.ProcessDimensions = ProcessDimensions;
                        // Method in $scope for CreateDimensions
                        $scope.SynchronizeDimensions = SynchronizeDimensions;
                        // Method in $scope for DestroyDimension
                        $scope.DestroyDimension = DestroyDimension;
                        // Method in $scope for DestroyAllDimensions
                        $scope.DestroyAllDimensions = DestroyAllDimensions;
                        
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
                                                //console.log(item)
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
                    }]
                }

                // Display the Modal Window for Dimensions
                luiDialog.show(dimensionModalConfig);
            };
            /**DIMENSION FUNCTIONS**/
            const ConfirmDialogDim = () => {
                luiDialog.show({
                    template: dimModalConfirmWindow,
                    input: {
                        name: $scope.name
                    },
                    controller: ['$scope', 'luiPopover', '$element', function ($scope, luiPopover, $element) {
                        // Get a Selectable List from the qlik selection based on fields
                        //var arrayDimensions = [];
                        var arrayMeasures = [];
                        
                        $scope.dimensionvalues = dimensionvalues;
                        $scope.openPopover = function (index, row) {
                            luiPopover.show({
                                template: dimModalConfirmPopoverWindow,
                                input: {},
                                alignTo: document.getElementsByClassName("popover")[index], //This is the key to making the popover work and attach to the element
                                dock: "right",
                                controller: ['$scope', function ($scope) {
                                    //console.log(enigma.app.engineApp);
                                    $scope.dimensionvalues = dimensionvalues;
                                    $scope.DimensionName = row[0].qText;
                                    $scope.DimensionDescription = row[3].qText;
                                    $scope.DimensionDescriptionEvaluated;
                                    enigma.app.engineApp.expandExpression(row[3].qText).then(reply => {
                                        $scope.DimensionDescriptionEvaluated = reply.qExpandedExpression;
                                        //console.log(reply);
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
                                    //console.log($scope);
                                    $scope.SelectValue = function () {
                                        app.field('%MI%DimensionId').toggleSelect($scope.DimensionID, true);
                                        $scope.close();
                                    }
                                }]
                            });
                        };
                        $scope.selState = app.selectionState();
                        $scope.createdimension = CreateDimension;
                    }]
                });
            };
            // Create Dimensions
            const SynchronizeDimensions = () => {
                // 1. Bind the DimModalConfirm method to the $scope
                $scope.runDimModalConfirm = runDimModalConfirm;

                // 2. Run Confirm Metrics Modal Window
                $scope.runDimModalConfirm();
            };
            // Process Dimensions
            const ProcessDimensions = () => {
                // 1. Get MeasureList Object of Existing Measures
                new Promise((resolve,reject) => {
                    resolve(
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
                        })
                    );
                })
                .then(dimensionList => {
                    return dimensionList.getLayout();
                })
                // 3. Push the Measures in the MeasureList Object to an Array
                .then(dimensionListProperties => {
                    var arrayDimensions = [];
                    //console.log(dimensionListProperties);
                    dimensionListProperties.qDimensionList.qItems.forEach((element) => {
                        arrayDimensions.push(element.qInfo.qId)
                    });
                    return arrayDimensions;
                })
                // 4. Take the measures in the array and compare them to the in memory table of Measures
                .then(arrayDimensions => {
                    //console.log(measurevalues);
                    dimensionvalues.rows.forEach((row, rowno) => {
                        //console.log(row);
                        // 4a. If the Dimension does not already exist create it
                        if(!arrayDimensions.includes(row.cells[6].qText)){
                            console.log(rowno+1 + '. Creating Dimension, ID: ' + row.cells[6].qText);
                            $scope.CreateDimension = CreateDimension(row);
                        } 
                        // 4b. If the Dimension does already exist, update
                        else {
                            console.log(rowno+1 + '. Updating Dimension, ID: ' + row.cells[6].qText);
                            $scope.UpdateDimension = UpdateDimension(row);
                        }
                    });

                })
                .then(() => {
                    swal({
                        text: "Dimensions Synchronized",
                        icon: "success"
                    });
                })
            };
            // Create Dimensions
            const CreateDimension =(row) => {
            
            /* 
            var dimensionfields = row.cells[1].qText.split(",").map(item => {
                return item.trim();
            });
            */

            // 2020-12-02 (Riki/MarredCheese) Fix importing expression-based dimensions
            var qText = row.cells[1].qText;
            var dimensionfields;
            if (qText.startsWith('='))  // expression
                dimensionfields = [qText.trim()];
            else {  // single field or drill-down field list
                dimensionfields = qText.split(",").map(item => {
                    return item.trim();
                });
            }


            var labelExpression;
            if (typeof row.cells[2].qText != 'undefined'){
                labelExpression = row.cells[2].qText;
            }
            if (labelExpression === '-') {
                labelExpression = '';
            }

            var description;
            if (typeof row.cells[3].qText != 'undefined'){
                description = row.cells[3].qText;
            }
            if (description === '-') {
                description = '';
            }

            var color;
            if (typeof row.cells[4].qText != 'undefined'){
                color = row.cells[4].qText;
            }
            if (color === '-') {
                color = '';
            }

            var tags = row.cells[5].qText;
            var tagsList = [];
            if (typeof tags != 'undefined') {
                tagsList = tags.split(",");
                //console.log(tagsList);
                tagsList = tagsList.filter(a => a !== '-');
            }

            var qGrouping;
            if (dimensionfields.length > 1) {
                qGrouping = "H"
            } else {
                qGrouping = "N"
            };

                // Filter and parse TAGS

                tagsList.push('Master Item Manager')
                enigma.app.createDimension({
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
                        "tags": tagsList, //Tags
                    }
                });
            };
            // Update Dimension
            const UpdateDimension = (row) => {
                // For each element that exists in MIM Definition => Do something
                /*
                var dimensionfields = row.cells[1].qText.split(",").map(item => {
                    return item.trim();
                });
                */
               
                // 2020-12-02 (Riki/MarredCheese) Fix importing expression-based dimensions
                var qText = row.cells[1].qText;
                var dimensionfields;
                if (qText.startsWith('='))  // expression
                    dimensionfields = [qText.trim()];
                else {  // single field or drill-down field list
                    dimensionfields = qText.split(",").map(item => {
                        return item.trim();
                    });
                }


                var labelExpression;
                if (typeof row.cells[2].qText != 'undefined'){
                    labelExpression = row.cells[2].qText;
                }
                if (labelExpression === '-') {
                    labelExpression = '';
                }

                var description;
                if (typeof row.cells[3].qText != 'undefined'){
                    description = row.cells[3].qText;
                }
                if (description === '-') {
                    description = '';
                }

                var color;
                if (typeof row.cells[4].qText != 'undefined'){
                    color = row.cells[4].qText;
                }
                if (color === '-') {
                    color = '';
                }

                var tags = row.cells[5].qText;
                var tagsList = [];
                if (typeof tags != 'undefined') {
                    tagsList = tags.split(",");
                    //console.log(tagsList);
                    tagsList = tagsList.filter(a => a !== '-');
                }

                var qGrouping;
                if (dimensionfields.length > 1) {
                    qGrouping = "H"
                } else {
                    qGrouping = "N"
                };

                // Filter and parse TAGS

                tagsList.push('Master Item Manager');

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
                            "tags": tagsList, //Tags
                        }
                    })
                })
    
            };
            // Destroy Dimension
            const DestroyDimension = () => {
                // 1. Create in memory table of Dimensions Loaded into the MIM App
                const table = app.createTable(['%MI%DimensionName','%MI%DimensionField','%MI%DimensionLabelExpression','%MI%DimensionDescription','%MI%DimensionColor','%MI%DimensionTags','%MI%DimensionId'],{rows: 1000})
                
                // 2. Create listener to detect new data in table api
                let listener = () => { 
                    console.log("1. Deleting Dimensions... (Sync started)");

                    // 3. Destroy each dimension in the table
                    new Promise((resolve, reject) => {
                        resolve(
                            table.rows.forEach(element => {
                                console.log("Deleting dimension id: " + element.cells[6].qText)
                                enigma.app.destroyDimension(element.cells[6].qText)
                            })
                        )
                    })
                    // 4. Display that the dimensions have been deleted
                    .then(() => {
                        console.log("2. Dimensions Deleted... (Sync complete)")
                        swal({
                            text: "Dimensions Deleted.",
                            icon: "success",
                        });
                    })

                    
                    table.OnData.unbind( listener );  //unregister the listener when no longer notification is needed.   
                }; 
                table.OnData.bind( listener ); //bind the listener
            };
            // Destroy All Dimensions
            const DestroyAllDimensions = () => {
                // 1. Display message to ask if users should delete
                console.log("1. User prompted for Delete all Dimensions...")
                var swaltext = {
                    text: "Warning: This feature will delete all Dimensions in this app whether they have been created natively through the Qlik Sense interface, or by the Master Item Manager. Are you sure you want to Delete All Dimensions?",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                }
                new Promise((resolve, reject) => {
                    resolve(
                        swal(swaltext)
                    );
                })
                // 2. If user decides to delete, create a list of all the application's Dimensions
                .then((willDelete) => {
                    if(willDelete){
                        console.log("2. Dimensions will be deleted... (Sync started)")
                        return new Promise((resolve, reject) => {
                            resolve(								
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
                                })
                            );
                        });
                    } else {
                        return new Promise((resolve, reject) => {
                            console.log("2. Dimensions will not be deleted... (Sync started)")
                            reject(
                                swal({
                                    text: "Master items have not been deleted.",
                                    icon: "error"
                                })
                            )
                        })
                    }
                })
                // 3. Evaluate the list of Dimensions with the GetLayout function
                .then((dimensionList) => {
                    console.log("3. Creating Dimension List... (Sync in progress)");
                    return dimensionList.getLayout();
                })
                // 4. Push each ID for existing dimension into an array to be deleted
                .then((dimensionLayout) => {
                    var dimensionArray = [];
                    console.log("4. DimensionList created... (Sync in progress)")
                    console.log("5. Creating properties layout... (Sync in progress)");
                    dimensionLayout.qDimensionList.qItems.forEach((element) => {
                        dimensionArray.push(element.qInfo.qId)
                    });
                    return dimensionArray;
                })
                // 5. Run the DestoryDimension() method against each element in that array
                .then((dimensionArray) => {
                    console.log("6. Properties layout has been created... (Sync in progress)")
                    console.log("7. Creating array of list of dimensions for deletion... (Sync in progress)")
                    dimensionArray.forEach(dimension => {
                        enigma.app.destroyDimension(dimension);
                    })
                })
                // 6. Display message that Master Items have been successfully deleted
                .then(() => {
                    console.log("8. Dimensions have been deleted (Sync in progress)")
                    console.log("9. Displaying confirmation message to user... (Sync complete)")
                    swal({
                        text: "All Dimension type Master Items in the current application have been deleted.",
                        icon: "success",
                    });
                })
                // 7. Display status on error or reject
                .catch(err => {
                    console.log("3. Dimensions have not been deleted (Terminated).");
                })
            };
            // global function for executing a partial reload
            const PartialReload = () => {

                // 1. Show Partial Reload Message
                new Promise((resolve, reject) => {
                        resolve(
                            swal({
                                text: "Partial Reload Started. Click OK to continue",
                                icon: "info",
                            })
                        );
                    })
                    // 2. Perform a Partial Reload
                    .then(() => {
                        return new Promise((resolve, reject) => {
                            resolve(app.doReload(0, true, false));
                        });
                    })
                    // 3. Save the application After Reloading
                    .then(reloadStatus => {
                        console.log("Reload status: " + reloadStatus);

                        return new Promise((resolve, reject) => {
                            resolve(app.doSave())
                        });
                    })
                    // 4. Display message that Partial Reload is Complete.
                    .then(saveStatus => {
                        //console.log(saveStatus);

                        return new Promise((resolve, reject) => {
                            resolve(swal({
                                text: "Partial Reload Complete.",
                                icon: "success",
                            }))
                        })
                    })


            };

            /***************************************************
             * 												   *
             *				  EXTRA FUNCTIONS				   *
             * 												   *
             ***************************************************/
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

                var blob = new Blob([csv], {
                    type: 'text/csv;charset=utf-8;'
                });
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

            // Set Method in the Current Scope
            $scope.PartialReload = PartialReload;

        }]
    };
});
