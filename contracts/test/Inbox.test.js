const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());

const { abi, evm } = require('../compile')('Inbox');


let accounts;
let inbox;
const INIT_MSG = "Hi there!";

beforeEach(async () => {
   accounts = await web3.eth.getAccounts();

   inbox = await new web3.eth.Contract(abi)
      .deploy({ data: evm.bytecode.object, arguments: [INIT_MSG] })
      .send({ from: accounts[0], gas: '1000000' });
});

describe('Inbox', () => {
   it('deploys a contract', () => {
      assert.ok(inbox.options.address);
   });

   it('has a default msg', async () => {
      const msg = await inbox.methods.message().call();
      assert.equal(msg, INIT_MSG);
   });

   it('can change msg', async () => {
      const newMsg = 'bye';
      await inbox.methods.setMessage(newMsg).send({ from: accounts[0] });
      const msg = await inbox.methods.message().call();
      assert.equal(msg, newMsg);
   });
})
