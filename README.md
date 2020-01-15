# GINQO Master Item Manager
Our intention was to create an application that would help with efficiency with development, especially around Master Items. Since Master Items are frequently reused across applications, we felt a governed approach would fit best. Using our template file, Master Items can be saved for later creation. Master Items can then be selected using a Qlik table and syncronized or deleted using The Master Item Manager. Finally, by default, the application won't affect your manually created Master Items unless specifically requested, making it a safe tool to use with in conjunction with previously defined apps & master items.

![](demo.gif)

# Prerequisites
Qlik Sense Enterprise >= June 2018 
(Desktop not supported)

# Installation
1. Download this extension on a zip file using the 'Clone or Download' button
2. Navigate to the 'Extensions' directory under the Qlik Management Console (QMC)
3. Import the zip file

# Getting Started
1. Navigate to the Data Load Editor
2. Create a Data Connection to the template excel file(it is provided in the zip file), dropbox and box.com both work well for this step
3. Insert the scripts for your Dimensions and Measures tables (add REPLACE LOADs if you want to enable partial reloads for larger applications)
4. Back in your Qlik Sense Application, create one table for the template file's Dimensions and another for template file's Measures (Highly recommend qsQuickTableViewer from ChristofSchwarz and Ralf Becher for this https://github.com/ChristofSchwarz/qsQuickTableViewer)
5. You can now use the Master Item Manager to create your Dimensions and Measures from the provided template file.

# Using the Template file
1. Dimensions and Measures must have unique ID's
2. It is recommended that calculated expressions (usually label expressions) are wrapped in quotes: EG: '='Sum(Dim1)'
3. It is recommended that text based expressions (usually label expressions) are wrapped in quotes: ''Label Expression Example'
4. Measures required: Expression, Name
5. Dimensions required: Field, Name

# Actions	
1. Syncronize: Inserts & Updates Dimensions/Measures based on selections
2. Delete: Deletes Dimensions/Measures based on selections
3. Partial Reload: Partially reloads dataset to avoid high reload times on large apps (Need to add REPLACE LOADs in Data Load Editor)
4. Delete All: Deletes ALL Dimensions/Measures (warning: this applies also to metrics not defined through this tool)
5. Export: Exports Dimensions/Measures from your application so that you can copy them back into your template file for later use.

# Authors
GINQO

# Change Log
2019-12-17: Combined update and create functionality into syncronize option
2019-12-17: Added preview section after syncronizing to show which Dimensions and Measures will be created
2019-12-17: Added December 2019 release

# Known Issues and Limitations
> Exporting of Master Items will sometimes add an additional single quote to the end of a complex expression. Just make sure to remove it when copying back to your template spreadsheet
> Exporting Measures with Segmented Colors will cause the export to fail during this release.
