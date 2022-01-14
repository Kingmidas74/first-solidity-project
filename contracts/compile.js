const path = require('path');
const fs = require('fs');
const solc = require('solc');



module.exports = (contract) => {

    const contractFile = `${contract}.sol`;

    const inboxPath = path.resolve(__dirname,'contracts',contractFile);
    const source = fs.readFileSync(inboxPath, 'utf8');


    const input = {
        language: 'Solidity',
        sources: {
            
        },
        settings: {
        outputSelection: {
            '*': {
            '*': ['*'],
            },
        },
        },
    };
    input.sources[contractFile] = {
        content: source,
    };
    return JSON.parse(solc.compile(JSON.stringify(input))).contracts[contractFile][contract];
};