// Create a service SAS for a blob
// An HTTP trigger Azure Function that returns a SAS token for Azure Storage for the specified container. 
// You can also optionally specify a particular blob name and access permissions. 
// To learn more, see https://github.com/Azure-Samples/functions-dotnet-sas-token/blob/master/README.md

const azure = require('azure-storage');

module.exports = async function(context, req) {
    // get X-MS-CLIENT-PRINCIPAL-ID and X-MS-CLIENT-PRINCIPAL-NAME headers
    // from request
    const uid = req.headers["x-ms-client-principal-id"];
    //const client_principal_name = req.headers["x-ms-client-principal-name"];

    if (req.body && req.body.container) {
        // The following values can be used for permissions: 
        // "a" (Add), "r" (Read), "w" (Write), "d" (Delete), "l" (List)
        // Concatenate multiple permissions, such as "rwa" = Read, Write, Add
        const blobUserId = req.body.blobName.split("/")[0];
        context.log(`User ID: ${uid} is trying to access blob: ${req.body.blobName} with permissions: ${req.body.permissions?? "r"}`);
        if (blobUserId !== uid) {
            context.res = {
                status: 403,
                body: "User not allowed to access this blob"
            };
            return;
        }

        const sasBody = await generateSasToken(context, req.body.container, req.body.blobName, req.body.permissions);
        context.res = {
            status: 200,
            body: sasBody
        };
    } else {
        context.res = {
            status: 400,
            body: "Specify a value for 'container'"
        };
    }
    
    //context.done();
};

async function generateSasToken(context, container, blobName, permissions) {
    const connString = process.env.AzureWebJobsStorage;
    context.log("Generating SAS token for container: " + container + ", blob: " + blobName + ", permissions: " + permissions)

    const blobService = azure.createBlobService(connString);
    context.log("Blob service created");

    // Create a SAS token that expires in an hour
    // Set start time to five minutes ago to avoid clock skew.
    const startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - 15);
    const expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 120);

    permissions = permissions || azure.BlobUtilities.SharedAccessPermissions.READ;

    context.log("Start date: " + startDate);
    context.log("Expiry date: " + expiryDate);
    context.log("Permissions: " + permissions);

    var sharedAccessPolicy = {
        AccessPolicy: {
            Permissions: permissions,
            Start: startDate,
            Expiry: expiryDate
        }
    };
    
    var sasToken = blobService.generateSharedAccessSignature(container, blobName, sharedAccessPolicy);
    
    return {
        token: sasToken,
        uri: blobService.getUrl(container, blobName, sasToken, true)
    };
}