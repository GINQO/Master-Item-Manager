# GINQO MasterItemManager
Our intention was to create an application that would help with **efficiency with development**, *especially around Master Items*. 
Since Master Items are frequently reused across applications, we felt a *governed approach* would fit best. 

Using our template file, Master Items can be saved for later creation. Master Items can then be selected using a Qlik table and syncronized or deleted using The Master Item Manager. Finally, by default, the application won't affect your manually created Master Items unless specifically requested, making it a safe tool to use with in conjunction with previously defined apps & master items.

![](demo.gif)

# Prerequisites
Qlik Sense Enterprise >= February 2019 
(Desktop not supported)

# Installation
1. Download this extension on a zip file using the 'Clone or Download' button
2. Navigate to the 'Extensions' directory under the Qlik Management Console (QMC)
3. Import the zip file

# Getting Started
1. Navigate to the Data Load Editor
2. Create a Data Connection to the template excel file(it is provided in the zip file), dropbox and box.com both work well for this step
3. Insert the scripts for your **Dimensions and Measures tables** (you can add **REPLACE LOADs** if you want to enable partial reloads for larger applications)
4. Back in your Qlik Sense Application, create one table for the template file's Dimensions and another for template file's Measures (Highly recommend qsQuickTableViewer from ChristofSchwarz and Ralf Becher for this https://github.com/ChristofSchwarz/qsQuickTableViewer)
5. You can now use the Master Item Manager to create your Dimensions and Measures from the provided template file.

# Using the Template file
1. Dimensions and Measures must have unique ID's
2. It is recommended that calculated expressions (usually label expressions) are wrapped in quotes: EG: '='Sum(Dim1)'
3. It is recommended that text based expressions (usually label expressions) are wrapped in quotes: ''Label Expression Example'
4. Measures required: Expression, Name
5. Dimensions required: Field, Name

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
GINQO

# Change Log
2019-12-17: Combined update and create functionality into syncronize option
2019-12-17: Added preview section after syncronizing to show which Dimensions and Measures will be created
2019-12-17: Added December 2019 release
2020-06-01: Improved maintainability and overall performance for large imports. Improved schema handling.

# Known Issues and Limitations
	- Measure Segments are not exportable in this version
	- Measure Segments are not importable in this version
	- Dimension Value Colors are not exportable in this version
	- Dimension Value Colors are not importable in this version
	- Attempting to Export Measure values with corresponding Segment Colors will cause the export to fail
  	- Delimiting for Comma Separation has not been completely handled. Complex cases of expressions might be parsed into multiple excel columns
