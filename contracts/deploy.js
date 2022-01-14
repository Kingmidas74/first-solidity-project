const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

const { abi, evm } = require('./compile')(process.argv[2]);

const provider = new HDWalletProvider(
    '{{key_phrase}}',
    'https://rinkeby.infura.io/v3/f082111fe5fc436c8088a12563c7ed84'
);
const web3 = new Web3(provider);

const deploy = async () => {
    const accs = await web3.eth.getAccounts();

    console.log('Attemting to deploy from acc', accs[0]);

    const result = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object, arguments: [] })
        .send({ gas: '1000000', from: accs[0] });

    console.log('Contract deployed to', result.options.address);
    provider.engine.stop();
}
deploy();