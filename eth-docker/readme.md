## Step 1: Build the docker image

> Go to the folder **eth-docker**

```
docker build -t eth-private -f Dockerfile .
```

## Step 2: Start the private network

```
docker run -it -p 8545:8545 eth-private
```

## Step 3: Start hacking

Now, you can start working with the private network by connecting to the local rpc host via port 8545.

See the `/client/index.html` file for more information.

## Optional:
 If you want to attach to the running node, but don't have the 'geth' on local computer then you can use the provided geth docker image:

### Get the name of running container: 

```
docker ps
```

Result:

> CONTAINER ID | IMAGE | COMMAND | CREATED | STATUS | PORTS | NAMES
> ------------ | ----- | ------- | ------- | ------ | ----- | -----
> 1420505df7da | eth-private | "geth --rpc --rpcadd…" | 6 seconds ago | Up 5 seconds | 8546/tcp, 0.0.0.0:8545->8545/tcp, 30303/tcp, 30303/udp | **loving_cat**

### Then, get its IP address:

```
docker inspect loving_cat | grep IPAddress
```

The result could be like this:
>     "IPAddress": "172.17.0.2"

### Connect to the running node

```
docker run -it ethereum/client-go attach http://172.17.0.2:8545
```
