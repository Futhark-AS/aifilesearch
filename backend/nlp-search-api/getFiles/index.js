module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const document = context.bindings.document;
    const project = req.params.project;

    if (!document) {
        context.res = {
            status: 400,
            body: "No projects found for user"
        };
        return;
    }
    let body = {};
    document.projects.forEach((p) => {
        if (p.namespace.split("/")[1] === project) {
            body["files"] = p.files;
            return
        }
    }); 

    context.res = {
        // status: 200, /* Defaults to 200 */
        body
    };
}