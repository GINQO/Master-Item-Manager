# GINQO Master Item Manager
Our intention at GINQO was to create an application that would help most with **efficiency in development**, *especially around Master Items*. 
Since Master Items are frequently reused across applications, and the process for creating them is a slow and manual one, we felt a *governed approach* would fit best. 

Using our template file, Master Items can be saved in excel for load and creation in Qlik Sense. Master Items can then be selected from a Qlik table, previewed (in batch), then syncronized or deleted using **The Master Item Manager** tool. Finally, by default, the application won't affect your manually created Master Items unless you first export them into the template file, making it a safe tool to use with in conjunction with previously defined apps & master items.

![](demo.gif)

# Prerequisites
- Qlik Sense Enterprise >= November 2022 
- Qlik Cloud >= November 2022 
- Qlik Sense Desktop >= November 2022

# Installation
1. Download this extension on a zip file using the 'Clone or Download' button (or select from an individual release)
2. Navigate to the 'Extensions' directory under the Qlik Management Console (QMC)
3. Import the zip file (note: you can only have version of the Master Item Manager imported at any given time, so you may need to delete the old version when reimporting)

# Getting Started
1. Navigate to the Data Load Editor
2. Create a Data Connection to your own copy of the template excel file (a copy provided for you in the zip file), dropbox and box.com both work well for this step
3. Insert the scripts for your **Dimensions and Measures tables** (you can add **REPLACE LOADs** if you want to enable partial reloads for larger applications)
4. Back in your Qlik Sense Application, create one table for the template file's Dimensions and another for template file's Measures (Highly recommend qsQuickTableViewer from ChristofSchwarz and Ralf Becher for this https://github.com/ChristofSchwarz/qsQuickTableViewer)
5. You can now use the Master Item Manager to create your Dimensions and Measures from the provided template file.

# Simple Script Example
```
Set HidePrefix = '%';		// Hide prefix to hide Master Item Manager selections from UI

[Dimensions]:
REPLACE LOAD			// Replace Load to allow for partial reloads (slims down the reload time)
	[%MI%DimensionField],
	[%MI%DimensionName],
	[%MI%DimensionLabelExpression],
	[%MI%DimensionDescription],
	[%MI%DimensionColor],
	[%MI%DimensionTags],
	[%MI%DimensionId]
 FROM [lib://AttachedFiles/Master Item Manager.xlsx]
(ooxml, embedded labels, table is Dimensions);

[Measures]:
REPLACE LOAD
	[%MI%MeasureExpression],
	[%MI%MeasureName],
	[%MI%MeasureLabelExpression],
	[%MI%MeasureDescription],
	[%MI%MeasureColor],
	[%MI%MeasureTags],
	[%MI%MeasureSegmentColor],
	[%MI%MeasureSegmentColorFormat],
	[%MI%MeasureId]
 FROM [lib://AttachedFiles/Master Item Manager.xlsx]
(ooxml, embedded labels, table is Measures);
```

# Using the Template file
1. Dimensions and Measures must have unique ID's
2. Remember to prefex any = (equals) signs with a '(single-quote) when using excel. This will prevent excel interpretting your Qlik expression as an excel function.
3. It is recommended that calculated expressions (usually label expressions) are wrapped in quotes: EG: '='Sum(Dim1)'
4. It is recommended that text based expressions (usually label expressions) are wrapped in quotes: ''Label Expression Example'
5. Measures required: Expression, Name
6. Dimensions required: Field, Name

# Actions
General:
1. Partial Reload: Using REPLACE LOADs in your load script will allow you to leverage this functionality to pull new Dimension/Measure schemas without running a large applications load.
2. Info/Help: Shows instructions for how to use the GINQO Master Item Manager

Editing Dimensions:
1. Syncronize: Creates and Updates Dimensions according to your template and selections
2. Delete: Deletes Dimensions according to your template and selections (requires dimensionID)
3. Delete All: Deletes ALL Dimensions in the application (warning: this applies also to metrics not defined through your template file)
4. Export: Will export a template list composite of your Dimension Master Items existing in the app
5. Validate: Shows which Dimensions your actions (synchronize/delete) will affect

Editing Measures:
1. Syncronize: Creates and Updates Measures according to your template and selections
2. Delete: Deletes Measures according to your template and selections (requires measureID)
3. Delete All: Deletes ALL Measures in the application (warning: this applies also to metrics not defined through your template file)
4. Export: Will export a template list composite of your Measure Master Items existing in the app
5. Validate: Shows which Measures your actions (synchronize/delete) will affect


# Authors
- Maxwell Marchand - Product Lead and Founder
- Riki Suharda - Developer

# Change Log
- 2019-12-17: Combined update and create functionality into syncronize option
- 2019-12-17: Added preview section after syncronizing to show which Dimensions and Measures will be created
- 2019-12-17: Added December 2019 release
- 2022-06-01: Custom format number is now supported
- 2020-06-01: Improved maintainability and overall performance for large imports. Improved schema handling.
- 2022-06-01: Measure segment colors are now exportable and importable in this version
- 2022-06-01: Dimension value colors are now exportable and importable in this version
- 2022-06-01: QlikCloud is now supported (Tested version: Februrary 2022)
- 2022-06-01: Some enhancements in layout and embedded images
- 2022-09-06: Fixes for media image links (.tff and .woff) display incorrect on Qlik Sense Enterprise
- 2022-12-21: Major updates on js code for handling missing columns in config file
- 2022-12-21: Fixed the master item preview that was not displaying correctly due to a missing config column
- 2023-03-30: Minor enhancements in the GINQO_MasterItemManager.js script to fix the measure item preview

# Known Issues and Limitations
	- Complex drilldown dimension expression is not supported.
	- Editing a "base" Master Item that other Master Items call will break all objects reusing it.
	  Workaround: Manually save the modified measure: Right-click -> edit the Base item, save it
  	- Delimiting for Comma Separation has not been completely handled. Complex cases of expressions might be parsed into multiple excel columns
