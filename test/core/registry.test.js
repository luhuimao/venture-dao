// Whole-script strict mode syntax
"use strict";

/**
MIT License
Copyright (c) 2020 Openlaw
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

const {
  toWei,
  toBN,
  fromAscii,
  fromUtf8,
  ETH_TOKEN,
  sha3
} = require("../../utils/contract-util");

const {
  expectRevert,
  expect,
  DaoFactory,
  DaoRegistry,
  FundingPoolExtension,
  web3,
  accounts,
} = require("../../utils/oz-util");

import { exec } from "child_process";
import {
  DaoFactory,
  DaoRegistry,
  FundingPoolExtension, deployDefaultDao, takeChainSnapshot, revertChainSnapshot, proposalIdGenerator, expect, expectRevert, web3
} from "../../utils/hh-util";

const hre = require("hardhat");

describe("Core - Registry", () => {
  before("deploy dao", async () => {
    let [owner, user1, user2, investor1, investor2, gp1, gp2, project_team1, project_team2] = await hre.ethers.getSigners();
    this.owner = owner;
    this.user1 = user1;
    this.user2 = user2;
    this.investor1 = investor1;
    this.investor2 = investor2;
    this.gp1 = gp1;
    this.gp2 = gp2;
    this.project_team1 = project_team1;
    this.project_team2 = project_team2;

    const { dao, adapters, extensions, testContracts } = await deployDefaultDao({
      owner: owner,
    });
    this.adapters = adapters;
    this.extensions = extensions;
    this.dao = dao;
    this.testContracts = testContracts;
    this.testtoken1 = testContracts.testToken1.instance
    this.testtoken2 = testContracts.testToken2.instance
    this.fundingPoolExt = this.extensions.fundingpoolExt.functions;
    this.gpdaoExt = this.extensions.gpDaoExt.functions;
    this.streamingPayment = this.adapters.sablierAdapter.instance;
    // this.manageMember = this.adapters.manageMemberAdapter.instance;
    this.allocationAdapter = this.adapters.allocationv2.instance;
    this.gpvoting = this.adapters.gpVotingAdapter.instance;
    // this.distributefund = this.adapters.distributeFundAdapter.instance;
    this.fundingpoolAdapter = this.adapters.fundingpoolAdapter.instance;
    this.gpdaoAdapter = this.adapters.gpdaoAdapter.instance;
    this.snapshotId = await takeChainSnapshot();

    console.log("dao member 1 addr: ", (await dao.getMemberAddress(0)));
    console.log("dao member 2 addr: ", (await dao.getMemberAddress(1)));
  });
  it("should not be possible to add a module with invalid id", async () => {
    let moduleId = fromUtf8("");
    let moduleAddress = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
    let registry = await DaoRegistry.new();
    await expectRevert(
      registry.replaceAdapter(moduleId, moduleAddress, 0, [], []),
      "adapterId must not be empty"
    );
  });

  it("should not be possible to add an adapter with invalid id", async () => {
    let adapterId = fromUtf8("");
    let adapterAddr = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
    let registry = await DaoRegistry.new();
    await expectRevert(
      registry.replaceAdapter(adapterId, adapterAddr, 0, [], []),
      "adapterId must not be empty"
    );
  });

  it("should not be possible to add an adapter with invalid address]", async () => {
    let adapterId = fromUtf8("1");
    let adapterAddr = "";
    let registry = await DaoRegistry.new();
    await expectRevert(
      registry.replaceAdapter(adapterId, adapterAddr, 0, [], []),
      "invalid address"
    );
  });

  it("should be possible to replace an adapter when the id is already in use", async () => {
    let adapterId = fromUtf8("1");
    let adapterAddr = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
    let newAdapterAddr = "0xd7bCe30D77DE56E3D21AEfe7ad144b3134438F5B";
    let registry = await DaoRegistry.new();
    //Add a module with id 1
    await registry.replaceAdapter(adapterId, adapterAddr, 0, [], []);
    await registry.replaceAdapter(adapterId, newAdapterAddr, 0, [], []);
    let address = await registry.getAdapterAddress(adapterId);
    expect(address).equal(newAdapterAddr);
  });

  it("should be possible to add an adapter with a valid id and address", async () => {
    let adapterId = fromUtf8("1");
    let adapterAddr = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
    let registry = await DaoRegistry.new();
    await registry.replaceAdapter(adapterId, adapterAddr, 0, [], []);
    let address = await registry.getAdapterAddress(adapterId);
    expect(address).equal(adapterAddr);
  });

  it("should be possible to remove an adapter", async () => {
    let adapterId = fromUtf8("2");
    let adapterAddr = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
    let registry = await DaoRegistry.new();
    await registry.replaceAdapter(adapterId, adapterAddr, 0, [], []);
    let address = await registry.getAdapterAddress(adapterId);
    expect(address).equal(adapterAddr);
    await registry.replaceAdapter(adapterId, ETH_TOKEN, 0, [], []);
    await expectRevert(
      registry.getAdapterAddress(adapterId),
      "adapter not found"
    );
  });

  it("should not be possible to remove an adapter with an empty id", async () => {
    let adapterId = fromUtf8("");
    let registry = await DaoRegistry.new();
    await expectRevert(
      registry.replaceAdapter(adapterId, ETH_TOKEN, 0, [], []),
      "adapterId must not be empty"
    );
  });

  it("should not be possible for a zero address to be considered a member", async () => {
    let registry = await DaoRegistry.new();
    let isMember = await registry.isMember(
      "0x0000000000000000000000000000000000000000"
    );
    expect(isMember).equal(false);
  });

  it("should not be possible to send ETH to the DaoRegistry via receive function", async () => {
    let registry = await DaoRegistry.new();
    await expectRevert(
      web3.eth.sendTransaction({
        to: registry.address,
        from: accounts[0],
        gasPrice: toBN("0"),
        value: toWei("1", "ether"),
      }),
      "revert"
    );
  });

  it("should not be possible to send ETH to the DaoRegistry via fallback function", async () => {
    let registry = await DaoRegistry.new();
    await expectRevert(
      web3.eth.sendTransaction({
        to: registry.address,
        from: accounts[0],
        gasPrice: toBN("0"),
        value: toWei("1", "ether"),
        data: fromAscii("should go to fallback func"),
      }),
      "revert"
    );
  });

  it("should be possible to set configuration when dao is not finalized", async () => {
    await this.dao.setConfiguration(sha3("voting.votingPeriod"), 60 * 5);
    console.log(`voting.votingPeriod: ${await this.dao.getConfiguration(sha3("voting.votingPeriod"))}`);
    expect(await this.dao.getConfiguration(sha3("voting.votingPeriod"))).equal(60 * 5);
  });

  it("should be no possible to set configuration by non member", async () => {
    console.log("key voting.votingPeriod: ", sha3("voting.votingPeriod"));
    console.log(`key voting.gracePeriod: ${sha3("voting.gracePeriod")}`);
    console.log(`key allocation.gpAllocationBonusRadio: ${sha3("allocation.gpAllocationBonusRadio")}`);
    console.log(`key allocation.riceStakeAllocationRadio: ${sha3("allocation.riceStakeAllocationRadio")}`);
    console.log("key voting.gpOnboardingVotingPeriod: ", sha3("voting.gpOnboardingVotingPeriod"));
    console.log(`key voting.gpOnboardingVotingGracePeriod: ${sha3("voting.gpOnboardingVotingGracePeriod")}`);

    console.log(`key distributeFund.proposalDuration: ${sha3("distributeFund.proposalDuration")}`);
    console.log(`key distributeFund.proposalInterval: ${sha3("distributeFund.proposalInterval")}`);
    console.log(`key distributeFund.proposalExecuteDuration: ${sha3("distributeFund.proposalExecuteDuration")}`);

    console.log(`voting.votingPeriod: ${await this.dao.getConfiguration(sha3("voting.votingPeriod"))}`);
    console.log(`voting.gracePeriod: ${await this.dao.getConfiguration(sha3("voting.gracePeriod"))}`);
    console.log(`allocation.gpAllocationBonusRadio: ${await this.dao.getConfiguration(sha3("allocation.gpAllocationBonusRadio"))}`);
    console.log(`allocation.riceStakeAllocationRadio: ${await this.dao.getConfiguration(sha3("allocation.riceStakeAllocationRadio"))}`);
    await expectRevert(this.dao.connect(this.user1).setConfiguration(sha3("voting.votingPeriod"), 60 * 5), "revert");
  });


  it("should be impossible to set configuration when dao is finalized", async () => {
    await this.dao.finalizeDao();
    await expectRevert(this.dao.setConfiguration(sha3("voting.votingPeriod"), 60 * 5), "revert");
  });

});
