module.exports = async function (context, req, document) {
  context.log("JavaScript HTTP trigger function processed a request.");

  // get X-MS-CLIENT-PRINCIPAL-ID and X-MS-CLIENT-PRINCIPAL-NAME headers
  // from request
  const uid = req.headers["x-ms-client-principal-id"];
  //const client_principal_name = req.headers["x-ms-client-principal-name"];

  if (document.user_id !== uid) {
    context.res = {
      status: 403,
      body: "User not allowed to access this document",
    };
    return;
  }

  try{
    const file_names = document.file_names
    const body = {
      "processed": file_names,
      "message": "",
      "ready": false
      //"progress": 
    }
    if(document.status == "error"){
      body.message = `Error while processing. Error message: ${document.error_message}`
    }
    else if(document.status == "done"){
      body.message = `Done processing ${len(file_names)} files. [${file_names}]. Index ready to be queried.`
      body.ready = true
    }
    else if(document.status == "running"){
      body.message = `Done processing ${len(file_names)} files. [${file_names}]. Index not yet ready.`
    }

    const res = {
      status: 200,
      body: body
    };
  }
  catch(error){
    context.log.error(error)
    context.res = {
      status: 500,
      body: error,
    };
  }

};
