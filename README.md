# GINQO MasterItemManager™


# Getting Started
1. Download this extension on a zip file using the 'Clone or Download' button
2. Using the QMC import the zip file as an extension
3. You can now drag and drop the extension into your Qlik Sense application

# Prerequisites
Qlik Sense Enterprise >= 3.0 
(Desktop not supported)


# Installing
1. Import this extension as a zip file into the QMC
2. Using the provided xlsx file, update the master items as you need (Don't rename the headers)
3. Using the load script, import the xlsx file.
4. Click the import button to update your master items!
# Versioning

# Usage	# Installing
1. From the Load Editor, create a Data Connection to the template excel file (provided in zip)
2. Import the Dimensions and Measures table into your script, adding REPLACE LOADs if you want to enable partial reload
3. In your Qlik Sense Application, create one table for the template Dimensions and another for template Measures
4. Only items filtered in the table will be affected by actions from the Master Item Manager
5. You can now use the Actions on the Master Items to create your Master Items from the template file.

# Actions	
1. Actions (Eg: Create, Update, Delete) will only affect Master Items that are shown in the Dimensions and Measures tables.	
2. Selecting values from the tables will allow actions to be performed only on those selected.	
3. Manually defined metrics (though Qlik Sense interface) WILL NOT be affected by this tool's Create, Update, Delete actions 	

 # Extra Actions	
4. Partial Reload: If you are managing a very large Sense App and your excel template scheme has changed, you can use the partial reload option to update the schema without waiting for a full reload to finish to edit your existing Master Items.	
5. Delete All: This will delete all Dimensions/Measures, including ones defined through Qlik Sense's Interface.	
6. Export Measures/Dimensions: This will export Master Items based on the template file scheme, making it easy to copy over manually created Master Items from applications.

# Authors
GINQO Development

# Change Log

# Known Issues and Limitations
> None

# Licence

### Copyright (C) 2019 GINQO Consulting Ltd. - All Rights Reserved

