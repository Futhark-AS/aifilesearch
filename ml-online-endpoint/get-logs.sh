# Define a variable called "local" and set its default value to "false"
local=true

# Define a variable called "name" and set its default value to "sample-endpoint"
name="sample-endpoint"

# Use getopts to parse the command-line arguments
while getopts ":ln:" opt; do
  case ${opt} in
    l ) local=false;;
    n ) name=$OPTARG;;
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

# Set the value of the ENDPOINT_NAME variable
export ENDPOINT_NAME=$name

az ml online-deployment get-logs -n blue --endpoint $ENDPOINT_NAME $local_flag