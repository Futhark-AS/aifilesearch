module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const uid = req.headers["x-ms-client-principal-id"];
    const project = req.body.project
    const file_names = req.body.file_names
    const namespace = uid + "/" + project

    // check if all file_names start with uid
    if (file_names.some(name => !name.startsWith(uid))) {
        context.res = {
            status: 403,
            body: "User not allowed to access this blob"
        };
        return;
    }

    // check that all file_names are in the same project
    if (file_names.some(name => !name.startsWith(namespace))) {
        context.res = {
            status: 403,
            body: "All files must be in the same project"
        };      
        return;
    }


    if (req.body && req.body.project && req.body.file_names) {
        const uuid = 12345 //TODO: fix this!
        // post to process-upload without waiting for response
        fetch("https://process-upload.azurewebsites.net/api/startProcessingDocuments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
                },
            body: JSON.stringify({
                file_names,
                namespace,
                "id": uid,
                uuid
            })
        })

        context.res = {
            status: 200,
            body: "Now processing documents. The status of the processing can be checked at https://nlp-search-api.azurewebsites.net/api/getProcessingStatus?uuid="+uuid
        };
    } else {
        context.res = {
            status: 400,
            body: "Specify a value for 'project' and 'file_names'"
        };
    }   

}