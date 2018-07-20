const Dapp = {
  userAddress: undefined,
  pollFactoryAddress: null,
  createNewAccount: function() {
    Dapp.web3.personal.newAccount(
      prompt("Please enter your password"),
      function(error, address) {
        if (error) {
          alert(error);
        } else {
          Dapp.setUserAddress(address);
          $(".nav-tabs .nav-link").removeClass("disabled");
        }
      }
    );
  },

  inputUserAddress: function() {
    var address = prompt("Please enter address", "0x");
    if (!Dapp.web3.isAddress(address)) {
      alert("Please input a valid address!");
      return;
    }

    Dapp.web3.personal.unlockAccount(
      address,
      prompt("Please enter your password for this address"),
      function(error, result) {
        if (error) {
          alert(error);
        } else {
          Dapp.setUserAddress(address);
          $(".nav-tabs .nav-link").removeClass("disabled");
        }
      }
    );
  },

  setUserAddress: function(address) {
    Dapp.userAddress = address;
    $(".user-address").text(address);
    Dapp.refreshUserBalance();
  },

  refreshUserBalance: function() {
    if (Dapp.userAddress) {
      Dapp.web3.eth.getBalance(Dapp.userAddress, function(error, weiAmount) {
        var ethValue = Dapp.web3.fromWei(weiAmount, "ether");
        $(".user-balance").text(ethValue);
      });
    }
  },

  refreshNodeStatus: function() {
    Dapp.web3.eth.getCoinbase(function(e, v) {
      $(".node-status-coinbase").text(v);
    });
    Dapp.web3.eth.getMining(function(e, v) {
      $(".node-status-mining").text(v);
    });
    Dapp.web3.eth.getHashrate(function(e, v) {
      $(".node-status-hashrate").text(v);
    });
    Dapp.web3.eth.getBlockNumber(function(e, v) {
      $(".node-status-block-number").text(v);
    });
    Dapp.web3.eth.getGasPrice(function(e, v) {
      $(".node-status-gas-price").text(v);
    });
  },
  deployPollFactory: function() {
    var pollfactoryContract = Dapp.web3.eth.contract(
      JSON.parse(compiledFactory.interface)
    );
    console.log("Deploying poll factory...");
    pollfactoryContract.new(
      {
        from: Dapp.userAddress,
        data: compiledFactory.bytecode,
        gas: "4700000"
      },
      function(e, contract) {
        if (typeof contract.address !== "undefined") {
          Dapp.pollFactoryAddress = contract.address;
          $("#pollFactoryAddress").text(contract.address);
          $("#addPoll").css("display", "block");
          $("#findAllPolls").css("display", "block");
          $("#viewPolls").css("display", "block");
          $("#deployPollFactory").css("display", "none");
          console.log("PollFactory's address: " + contract.address);
        }
      }
    );
  },
  createNewPoll: function() {
    const pollQuestion = $("#pollQuestion").val();
    const options = [];
    $(".option").each(function(index) {
      var option = $(this).val();
      if (option) {
        options.push(option);
      }
    });

    /* we can deploy Poll directly without PollFactory but we can not keep track all the poll's address */
    // var pollContract = Dapp.web3.eth.contract(
    //   JSON.parse(compiledPoll.interface)
    // );
    // var poll = pollContract.new(
    //     initQuestion,
    //     {
    //         from: Dapp.web3.eth.accounts[0],
    //         data: '0x'+compiledPoll.bytecode,
    //         gas: '4700000'
    //     }, function (e, contract){
    //         console.log(e, contract);
    //         if (typeof contract.address !== 'undefined') {
    //              console.log('Contract mined! address: ' + contract.address );
    //         }
    //      });
    if (
        !pollQuestion||typeof options == "undefined" ||
        options == null ||
        options.length == null ||
        options.length == 0
    ) {
        alert('please input the question and options!');
        return;

    }
    var factory = this.getPollFactory();
    factory.createPoll(
      pollQuestion,
      {
        from: Dapp.userAddress,
        gas: 1000000
      },
      function(e, txHash) {
        if (!e) {
          console.log("Create poll - transaction hash:");
          console.log(txHash);
          
          var pollCreatedEvent = factory.PollCreated();
          pollCreatedEvent.watch(function(error, result) {
            if (!error) {
              if (result.transactionHash == txHash) {
                console.log("On PollCreated -> Start adding options");
                Dapp.addOptions(result.args.pollAddress, options);
              }
            }
            pollCreatedEvent.stopWatching();
          });          
        }
      }
    );
  },
  viewPolls: () => {
    var factory = Dapp.getPollFactory();
    var pollAdresses = factory.getDeployedPolls();
    var detailE = $("#pollDetail");
    detailE.empty();
    pollAdresses.forEach(addr => {
      Dapp.viewPoll(addr);
    });
  },
  viewPoll: pollAddress => {
    var pollContract = Dapp.getPoll(pollAddress);
    var pollSummary = pollContract.getSummary();
    var question = pollSummary[0];
    var nOfOption = pollSummary[1];
    var options = [];
    for (i = 0; i < nOfOption; i++) {
      options.push(pollContract.options(i));
    }
    var detailE = $("#pollDetail");
    var pollRow = $('<div class="row"></div>');
    var questionE = $(
      '<div class="col-lg-4"><label style="margin-top: 5px"><strong>Question:</strong> ' + question + "</label></div>"
    );

    var optionE = $("<div class='col-lg-8'></div>");
    options.forEach(option => {
      var optionName = $(
        "<div class='row'><label><strong>Option[" + (options.indexOf(option) + 1) + "]:</strong> " + option[0] + "</label></div>"
      );
      optionE.append(optionName);
    });
    pollRow.append(questionE);
    pollRow.append(optionE);
    detailE.append(pollRow);
  },
  addOptions: function(pollAddress, options) {
    var poll = this.getPoll(pollAddress);
    options.forEach(option => {
      poll.createNewOption(
        option,
        {
          from: Dapp.userAddress,
          gas: 1000000
        },
        (e, r) => {
          if (!e) {
            this.findAllPolls();
          }
        }
      );
    });
  },
  clearCreatingPollBox: () => {
    $("#options").empty();
    $("#pollQuestion").val("");
  },
  findAllPolls: function() {
    var factory = this.getPollFactory();
    var pollAdresses = factory.getDeployedPolls();
    $("#pollAdresses").empty();
    pollAdresses.forEach(addr => {
      var element = $('<div><label style="margin-top: 2px">' + addr + "</label></div>"
      );
      $("#pollAdresses").append(element);
    });
  },
  getPoll: function(address) {
    var pollContract = Dapp.web3.eth.contract(
      JSON.parse(compiledPoll.interface)
    );
    return pollContract.at(address);
  },
  getPollFactory: function() {
    var factoryContract = Dapp.web3.eth.contract(
      JSON.parse(compiledFactory.interface)
    );
    return factoryContract.at(Dapp.pollFactoryAddress);
  },

  addOption: function() {
    var input = $(
      ' <input type="text" style="margin-top: 5px" class="form-control option" placeholder="Option"/>'
    );
    $("#options").append(input);
  },

  // Voting feature
  getPollOptions: function(pollContract) {
    var pollSummary = pollContract.getSummary();
    var question = pollSummary[0];
    var nOfOption = pollSummary[1];
    var options = [];
    for (i = 0; i < nOfOption; i++) {
      options.push(pollContract.options(i));
    }
    return options;
  },

  loadPollForVoting: function() {
    inputPollAddress = $("#inputPollAddress");
    pollAddress = inputPollAddress.val();
    if (!Dapp.web3.isAddress(pollAddress)) {
      alert("Please input a valid poll address!");
      return;
    }

    pollContract = this.getPoll(pollAddress);
    var options = this.getPollOptions(pollContract);
    
    var pollTemplate = doT.template(document.getElementById('templateVoting').text, undefined, undefined);
		document.getElementById('votingContainer').innerHTML = pollTemplate({'address': pollAddress, 'question': pollContract.question(), 'options': options});
  },

  submitChoices: function() {
    pollAddress = $("#pollAddressText").text().trim();
    console.log("Submit choices for poll " + pollAddress);
    selectedOptions = []
    $(".form-voting .poll-option").each((i, ckb) => {
      if (ckb.checked) {
        selectedOptions.push(parseInt(ckb.value))
      }
    });
    
    if (selectedOptions.length == 0) {
      console.log('No options selected. Display poll result.');
      this.loadPollResult(pollAddress);
      return;
    }

    console.log('Selected options: ' + selectedOptions);
    pollContract = this.getPoll(pollAddress);
    pollContract.vote(selectedOptions, {from: Dapp.userAddress, gas: 1000000}, (error, txHash) => {
      if (!error) {
        console.log('Voting transaction hash: ' + txHash);
      } else {
        console.log('Failed to vote for poll: ' + pollAddress);
        console.log(error);
      }
      this.loadPollResult(pollAddress);
    })
  },

  viewPollResult: function() {
    pollAddress = $("#inputPollAddress").val();
    if (Dapp.web3.isAddress(pollAddress)) {
      this.loadPollResult(pollAddress);
    }
  },

  loadPollResult: function(pollAddress) {
    pollContract = this.getPoll(pollAddress);
    var options = this.getPollOptions(pollContract);
    var pollTemplate = doT.template(document.getElementById('templateVoteResult').text, undefined, undefined);
		document.getElementById('votingContainer').innerHTML = pollTemplate({'address': pollAddress, 'question': pollContract.question(), 'options': options});
  }
};
var intRefreshBalance = setInterval(Dapp.refreshUserBalance, 2000);
var intRefreshStatus = setInterval(Dapp.refreshNodeStatus, 2000);

window.addEventListener("load", function() {
  if (typeof web3 !== "undefined") {
    console.log("Web3 Detected! " + web3.currentProvider.constructor.name);
    Dapp.web3 = new Web3(web3.currentProvider);
  } else {
    console.log("No Web3 Detected... using HTTP Provider");
    Dapp.web3 = new Web3(
      new Web3.providers.HttpProvider("http://localhost:8545")
    );
  }

//   Dapp.setUserAddress(Dapp.web3.eth.accounts[0]);
//   $(".nav-tabs .nav-link").removeClass("disabled");
});
