### API documentation

## /api/query
## POST
headers: {
    x-zumo-auth: azure token,
}
body: 
{
    user_id: sid:...,
    prompt: "What is competitive advantage?",
    project: "michael",
    topK: 5
}
# response
{
    matches: [
        {
            id: 1,
            metadata: {
                file_name: "sid:.../michael/michael.pdf",
                page_number: 10,
                bounding_box: [[0, 0, 100, 100], [300, 300, 100, 100]]],
                content: "Competitive advantage is ..."
            }
        },...
    ]
}

## /api/getSasToken
## POST
headers: {
    x-zumo-auth: azure token,
}
body: 
{
    blobName: "sid:.../michael/michael.pdf",
    permissions: "r",
}
# response
{
    token: ...,
    uri: "https://...", path to blob file
}


## /api/getProjects
## GET
headers: {
    x-zumo-auth: azure token,
}

query_paramas: {
    user_id: sid:...,
}
# response
{
    projects: ["michael", "project2"]
}

## /api/startProcessingDocuments
## POST
# headers: {
    x-zumo-auth: azure token,
}
# body: 
{
    file_names: ["michael.pdf", "michael2.pdf"],
    project: "michael",
}

# response
{
    "uri": "https://...", This uri is used to check the status
    "message": "Documents are being processed"
}
