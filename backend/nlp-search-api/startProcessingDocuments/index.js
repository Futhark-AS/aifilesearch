module.exports = async function (context, req) {
    try{
        context.log('JavaScript HTTP trigger function processed a request.');

        const user_id = req.headers["x-ms-client-principal-id"];
        const project = req.body.project
        const namespace = user_id + "/" + project
        let file_names = req.body.file_names
        // add namespace to file_names
        file_names = file_names.map(name => namespace + "/" + name)

        // check if all file_names start with uid
        if (file_names.some(name => !name.startsWith(user_id))) {
            context.res = {
                status: 403,
                body: "User not allowed to access this blob"
            };
            return;
        }

        if (req.body && req.body.project && req.body.file_names) {
            // post to process-upload without waiting for response
            //fetch("https://process-upload.azurewebsites.net/api/startProcessingDocuments", {
            const res = await fetch("https://process-upload.azurewebsites.net/api/orchestrators/StartProcessing", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                    },
                body: JSON.stringify({
                    file_names,
                    namespace,
                    user_id: user_id,
                })
            })

            const data = await res.json()
            const uri = data.statusQueryGetUri
            context.log("uri: ", uri)

            context.res = {
                status: 200,
                body: {
                    message: "Now processing documents. The status of the processing can be checked at the following URI: " + uri,
                    uri: uri
                }
            };
        } else {
            context.res = {
                status: 400,
                body: "Specify a value for 'project' and 'file_names'"
            };
        }   
    } catch (error) {
        context.log.error(error);
        context.res = {
            status: 500,
            body: error.message
        };
    }
}