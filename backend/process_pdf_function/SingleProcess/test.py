import os
from azure.cosmos import CosmosClient
#----------- COsmos DB ----------
cosmos_endpoint = "https://nlpcosmos.documents.azure.com:443/"
cosmos_key = os.getenv("ENV_COSMOS_KEY")
cosmos_client = CosmosClient(url=cosmos_endpoint, credential=cosmos_key)
cosmos_database = cosmos_client.get_database_client("nlp-search") 
cosmos_container = cosmos_database.get_container_client("users")

# Retrieve the connection string for use with the application. The blob storage
connect_str = os.getenv('AZURE_STORAGE_CONNECTION_STRING')

#test data
price = 0.01
user_id = "sid:61fdee33eb5fc49c1e82df86d649c8cd"
namespace = "sid:61fdee33eb5fc49c1e82df86d649c8cd/michael"
blob_name = "sid:61fdee33eb5fc49c1e82df86d649c8cd/michael/test.pdf"


# update projects total cost and files in prpoject in cosmos db
user = cosmos_container.read_item(item=user_id, partition_key=user_id)
print(user)
projects = user["projects"]
for project in projects:
    if project["namespace"] == namespace:
        # update cost
        if "cost" in project:
            project["cost"] += price
        else:
            project["cost"] = price

        # update files
        if "files" in project:
            project["files"].append(blob_name)
        else:
            project["files"] = [blob_name]

print(projects)

cosmos_container.upsert_item(user)