# Step 1: Build the docker image

docker build -t eth-private -f Dockerfile .



# Step 2: Start the private network

docker run -it -p 8545:8545 eth-private


# Now, you can start working with the private network by connecting to the local rpc host via port 8545.
# See the '/client/index.html' file for more information.



# Optional: If you want to attach to the running node, but don't have the 'geth' on local computer then you can use the provided geth docker image:
#   - Get the name of running container: docker ps
#   - Then, get its IP address:          docker inspect <container-name> | grep IPAddress
#   - The result could be:
#         "IPAddress": "172.17.0.2"

docker run -it ethereum/client-go attach http://172.17.0.2:8545


