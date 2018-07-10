const Dapp = {
    userAddress: undefined,
    pollFactoryAddress:null,
    createNewAccount: function () {
        Dapp.web3.personal.newAccount(
            prompt("Please enter your password"),
            function (error, address) {
                if (error) {
                    alert(error);
                } else {
                    Dapp.setUserAddress(address);
                    $(".nav-tabs .nav-link").removeClass("disabled");
                }
            }
        );
    },

    inputUserAddress: function () {
        var address = prompt("Please enter address", "0x");
        if (!Dapp.web3.isAddress(address)) {
            alert("Please input a valid address!");
            return;
        }

        Dapp.web3.personal.unlockAccount(
            address,
            prompt("Please enter your password for this address"),
            function (error, result) {
                if (error) {
                    alert(error);
                } else {
                    
                    Dapp.setUserAddress(address);
                    $(".nav-tabs .nav-link").removeClass("disabled");
                }
            }
        );
    },

    setUserAddress: function (address) {
        Dapp.userAddress = address;
        $(".user-address").text(address);
        Dapp.refreshUserBalance();
    },

    refreshUserBalance: function () {
        if (Dapp.userAddress) {
            Dapp.web3.eth.getBalance(Dapp.userAddress, function (error, weiAmount) {
                var ethValue = Dapp.web3.fromWei(weiAmount, "ether");
                $(".user-balance").text(ethValue);
            });
        }
    },

    refreshNodeStatus: function () {
        Dapp.web3.eth.getCoinbase(function (e, v) {
            $(".node-status-coinbase").text(v);
        });
        Dapp.web3.eth.getMining(function (e, v) {
            $(".node-status-mining").text(v);
        });
        Dapp.web3.eth.getHashrate(function (e, v) {
            $(".node-status-hashrate").text(v);
        });
        Dapp.web3.eth.getBlockNumber(function (e, v) {
            $(".node-status-block-number").text(v);
        });
        Dapp.web3.eth.getGasPrice(function (e, v) {
            $(".node-status-gas-price").text(v);
        });
    },
    deployPollFactory: function () {
        var pollfactoryContract = Dapp.web3.eth.contract(JSON.parse(compiledFactory.interface));
        var pollfactory = pollfactoryContract.new(
            {
                from: Dapp.web3.eth.accounts[0],
                data: '0x'+compiledFactory.bytecode,
                gas: '4700000'
            }, function (e, contract) {
                console.log(e, contract);
                if (typeof contract.address !== 'undefined') {
                    Dapp.pollFactoryAddress = contract.address;
                    $("#pollFactoryAddress").text(contract.address);
                    $("#addPoll").css('display','block')
                    $('#deployPollFactory').addClass('disabled');
                    console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
                }
            })
    },
    createNewPoll:function(){
        const pollQuestion = $('#pollQuestion').val();
        console.log(pollQuestion);
        
      
    },
    addOption:function (){
       var input = jQuery(' <input type="text" style="margin-top: 5px" class="form-control option" placeholder="Option"/>');
       jQuery('#options').append(input);
    }


};
var intRefreshBalance = setInterval(Dapp.refreshUserBalance, 2000);
var intRefreshStatus = setInterval(Dapp.refreshNodeStatus, 2000);

window.addEventListener('load', function () {
    if (typeof web3 !== 'undefined') {
        console.log('Web3 Detected! ' + web3.currentProvider.constructor.name)
        Dapp.web3 = new Web3(web3.currentProvider);
    } else {
        console.log('No Web3 Detected... using HTTP Provider')
        Dapp.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    Dapp.setUserAddress (Dapp.web3.eth.accounts[0]);
    $(".nav-tabs .nav-link").removeClass("disabled");
})
