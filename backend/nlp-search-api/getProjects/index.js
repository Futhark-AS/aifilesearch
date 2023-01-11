module.exports = async function (context, req, document) {
    context.log('JavaScript HTTP trigger function processed a request.');
    // the binding needs id in query

    try {
        if (!document) {
            context.res = {
                status: 400,
                body: "No projects found for user"
            };
            return;
        }

        const uid = req.headers["x-ms-client-principal-id"];
        const document_uid = context.bindings.document.id
        context.log("document_uid: ", document_uid)

        if (document_uid !== uid) {
        context.res = {
            status: 403,
            body: "User not allowed to access this document",
        };
        return;
        }

        const projects = document.projects.map(project => project.namespace.split("/")[1]);

        const responseMessage = {
            status: 200,
            body: {projects}
        };
        context.res = responseMessage;
    } catch (error) {
        context.log.error(error);
        context.res = {
            status: 500,
            body: "An error occurred while getting projects"
        };
    }
}