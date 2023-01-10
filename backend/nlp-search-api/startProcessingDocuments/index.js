//const { v4: uuidv4 } = require('uuid');

//TODO: fix this!!!
const uuidv4 = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
            const uuid = uuidv4()
            // post to process-upload without waiting for response
            fetch("https://process-upload.azurewebsites.net/api/startProcessingDocuments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                    },
                body: JSON.stringify({
                    file_names,
                    namespace,
                    id: user_id,
                    cosmos_result_id: uuid
                })
            })

            context.res = {
                status: 200,
                body: {
                    /* It's a placeholder for the message that will be returned to the user. */
                    "message": "Now processing documents. The status of the processing can be checked at https://nlp-search-api.azurewebsites.net/api/getProcessingStatus?uuid="+uuid,
                    "uuid": uuid,
                    "uri": "https://nlp-search-api.azurewebsites.net/api/getProcessingStatus?uuid="+uuid
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