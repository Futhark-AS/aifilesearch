# Define a variable called "local" and set its default value to "false"
local=true
debug=false

# Define a variable called "name" and set its default value to "sample-endpoint"
name="sample-endpoint"

# Use getopts to parse the command-line arguments
while getopts ":ln:" opt; do
  case ${opt} in
    l ) local=false;;
    n ) name=$OPTARG;;
    d ) debug=true;;
    \? ) echo "Invalid option: -$OPTARG" 1>&2;;
  esac
done

# Shift the arguments to get rid of the options
shift $((OPTIND -1))

# Set the value of the "local" flag in the Azure ML commands
if [ $local = true ]; then
  local_flag="--local"
else
  local_flag=""
fi

# Set the value of the "debug" flag in the Azure ML commands
if [ $debug = true ]; then
  debug_flag="--debug"
else
  debug_flag=""
fi

# Set the value of the ENDPOINT_NAME variable
export ENDPOINT_NAME=$name

az ml online-deployment update -n blue --endpoint $ENDPOINT_NAME -f managed/sample/blue-deployment.yml $local_flag $debug_flag
az ml online-endpoint show -n $ENDPOINT_NAME $local_flag $debug_flag
az ml online-endpoint invoke --name $ENDPOINT_NAME --request-file model-1/sample-request.json $local_flag $debug_flag