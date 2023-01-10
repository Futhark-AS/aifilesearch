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
        const projects = document.projects.map(project => project.namespace);

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