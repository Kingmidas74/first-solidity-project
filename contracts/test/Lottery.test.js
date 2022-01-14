const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());

const { abi, evm } = require('../compile')('Lottery');


let accounts;
let managerAccount;
let lottery;

beforeEach(async () => {
   accounts = await web3.eth.getAccounts();
   managerAccount = accounts[0];

   lottery = await new web3.eth.Contract(abi)
      .deploy({ data: evm.bytecode.object, arguments: [] })
      .send({ from: managerAccount, gas: '1000000' });
});

describe('Lottery Contract', () => {
   it('deploys a contract', () => {
      assert.ok(lottery.options.address);
   });

   it('has correct manager', async () => {
      const msg = await lottery.methods.manager().call();
      assert.equal(msg, managerAccount);
   });

   it('allow only one account to enter', async () => {
      await lottery.methods.enter().send({
         from: managerAccount,
         value: web3.utils.toWei('0.02', 'ether')
      });
      const players = await lottery.methods.getPlayers().call({
         from: managerAccount
      });

      assert.equal(players.length, 1);
      assert.equal(players[0], managerAccount);
   });

   it('allow multiple accounts to enter', async () => {
      const SLICE_COUNT = 3;

      await Promise.all(accounts.slice(0,SLICE_COUNT).map(async acc => {
         await lottery.methods.enter().send({
            from: acc,
            value: web3.utils.toWei('0.02', 'ether')
         });   
      }));

      const players = await lottery.methods.getPlayers().call({
         from: managerAccount
      });


      assert.equal(players.length, SLICE_COUNT);

      players.forEach((player, idx) => {
         assert.equal(player, accounts[idx]);   
      })
   });

   it('requires a minimum amount of ether to enter', async () => {
      try {
         await lottery.methods.enter().send({
            from: managerAccount,
            value: 0
         });
         assert(false);
      } catch (err) {
          assert(err);
      }
   });

   it('only manager can pick winner', async () => {
      try {
         await lottery.methods.pickWinner().send({
            from: acc[1],
            value: 0
         });
         assert(false);
      } catch (err) {
          assert(err);
      }
   });

   it('at least one player should exist', async () => {
      try {
         await lottery.methods.pickWinner().send({
            from: managerAccount,
            value: 0
         });
         assert(false);
      } catch (err) {
          assert(err);
      }
   });

   it('e2e test', async () => {
      await lottery.methods.enter().send({
         from: managerAccount,
         value: web3.utils.toWei('2', 'ether')
      });

      const initialBalance = await web3.eth.getBalance(managerAccount);
      await lottery.methods.pickWinner().send({
         from: managerAccount
      });
      const finalBalance = await web3.eth.getBalance(managerAccount);

      const diff = finalBalance - initialBalance;
      assert(diff > web3.utils.toWei('1.8', 'ether'));
   })
})
