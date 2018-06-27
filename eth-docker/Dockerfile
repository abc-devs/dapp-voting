FROM ethereum/client-go

RUN addgroup -S app && adduser -S -G app app

USER app

ADD genesis.json /home/app/

RUN geth init /home/app/genesis.json --datadir=/home/app/.ethereum

EXPOSE 8545 8546 30303 30303/udp

CMD ["--rpc", "--rpcaddr", "0.0.0.0", "--rpccorsdomain", "*", "--rpcapi", "admin,debug,miner,personal,eth,web3", "--nodiscover", "--datadir", "home/app/.ethereum"]

ENTRYPOINT ["geth"]
