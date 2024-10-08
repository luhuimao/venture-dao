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
import { deployDefaultDao, takeChainSnapshot, revertChainSnapshot, proposalIdGenerator, expect, expectRevert, web3 } from "../../utils/hh-util";

const {
    unitPrice,
    numberOfUnits,
    maximumChunks,
    maxAmount,
    maxUnits,
    ETH_TOKEN,
    UNITS,
    toBN,
    toWei,
    fromUtf8,
    fromAscii,
    sha3,
    GUILD,
    DAOSQUARE_TREASURY
} = require("../../utils/contract-util");
const proposalCounter = proposalIdGenerator().generator;

const { checkBalance } = require("../../utils/test-util");
const hre = require("hardhat");

function getProposalCounter() {
    return proposalCounter().next().value;
}

async function advanceTime(addr1, addr2, token) {

    for (var i = 0; i < 10; i++) {
        await token.transfer(addr2.address, 1);

        await token.connect(addr2).transfer(addr1.address, 1);

    }
}


describe("Adapter - Flex No Escorw Funding Succeed", () => {
    before("deploy dao", async () => {
        let [owner, gp1, gp2, user1] = await hre.ethers.getSigners();
        this.owner = owner;
        this.gp1 = gp1;
        this.gp2 = gp2;
        this.user1 = user1;
        const { dao, adapters, extensions, testContracts } = await deployDefaultDao({
            owner: owner,
        });
        this.adapters = adapters;
        this.extensions = extensions;
        this.dao = dao;
        this.testContracts = testContracts;
        this.snapshotId = await takeChainSnapshot();
        this.testtoken1 = testContracts.testToken1.instance;
        this.testtoken2 = testContracts.testToken2.instance;
        this.testricetoken = testContracts.testRiceToken.instance;

        this.flexFundingAdapterContract = this.adapters.flexFundingAdapterContract.instance;
        this.flexVotingContract = this.adapters.flexVotingContract.instance;
        this.flexFundingPoolAdapterContract = this.adapters.flexFundingPoolAdapterContract.instance;
        this.flexERC721Contract = this.adapters.flexERC721.instance;
        this.flexFundingPoolExt = this.extensions.flexFundingPoolExt.functions;

        const isGP = await extensions.gpDaoExt.functions.isGeneralPartner(owner.address);
        console.log(`owner is a GP: ${isGP}`);
    });

    beforeEach(async () => {
        await revertChainSnapshot(this.snapshotId);
        this.snapshotId = await takeChainSnapshot();
    });

    it("should be possible submit an flex no escrow funding proposal", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = this.dao;

        let tokenAddress = this.testtoken1.address;
        let minFundingAmount = hre.ethers.utils.parseEther("1000000");
        let maxFundingAmount = hre.ethers.utils.parseEther("10000000");
        let escrow = false;
        let returnTokenAddr = this.testtoken2.address;
        let returnTokenAmount = hre.ethers.utils.parseEther("1000000");
        let price = hre.ethers.utils.parseEther("0.6");
        let minReturnAmount = hre.ethers.utils.parseEther("1000000");
        let maxReturnAmount = hre.ethers.utils.parseEther("1000000");
        let approverAddr = this.user1.address;
        let recipientAddr = this.user1.address;

        let fundingInfo = [
            tokenAddress,
            minFundingAmount,
            maxFundingAmount,
            escrow,
            returnTokenAddr,
            returnTokenAmount,
            price,
            minReturnAmount,
            maxReturnAmount,
            approverAddr,
            recipientAddr
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let vestingStartTime = blocktimestamp + 100000;
        let vestingCliffDuration = 600;
        let vestingStepDuration = 600;
        let vestingSteps = 10;
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

        let vestInfo = [
            vestingStartTime,
            vestingCliffDuration,
            vestingStepDuration,
            vestingSteps,
            vestingCliffLockAmount
        ];

        let fundRaiseType = 1;
        let fundRaiseStartTime = blocktimestamp;
        let fundRaiseEndTime = fundRaiseStartTime + 100000;
        let minDepositAmount = hre.ethers.utils.parseEther("1000");
        let maxDepositAmount = hre.ethers.utils.parseEther("10000000");
        let backerIdentification = false;

        let bType = 0;
        let bChainId = 1;
        let bTokanAddr = this.testtoken1.address;
        let bTokenId = 1;
        let bMinHoldingAmount = 100;
        let bakckerIdentificationInfo = [
            bType,
            bChainId,
            bTokanAddr,
            bTokenId,
            bMinHoldingAmount
        ];

        let priorityDeposit = true;

        let pPeriod = 100;
        let pPeriods = 10;
        let pType = 0;
        let pChainId = 1;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;

        let priorityDepositInfo = [
            pPeriod,
            pPeriods,
            pType,
            pChainId,
            pTokenAddr,
            pTokenId,
            pMinHolding
        ];

        let fundRaiseInfo = [
            fundRaiseType,
            fundRaiseStartTime,
            fundRaiseEndTime,
            minDepositAmount,
            maxDepositAmount,
            backerIdentification,
            bakckerIdentificationInfo,
            priorityDeposit,
            priorityDepositInfo
        ];

        let tokenRewardAmount = 2;
        let cashRewardAmount = hre.ethers.utils.parseEther("1000");
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];
        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos
        ];
        console.log(fundingParams);
        const tx = await flexFundingAdapterContract.submitProposal(dao.address, fundingParams);
        const result = await tx.wait();
        const ProposalId = result.events[2].args.proposalId;
        console.log(`ProposalId: ${hre.ethers.utils.toUtf8String(ProposalId)}`);
        this.proposalId = ProposalId;
        let proposalInfo = await flexFundingAdapterContract.Proposals(dao.address, ProposalId);
        console.log(`
        proposer ${proposalInfo.proposer}

        FundingInfo:
        tokenAddress ${proposalInfo.fundingInfo.tokenAddress}
        minFundingAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.minFundingAmount)}
        maxFundingAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.maxFundingAmount)}
        escrow ${proposalInfo.fundingInfo.escrow}
        returnTokenAddr ${proposalInfo.fundingInfo.returnTokenAddr}
        returnTokenAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.returnTokenAmount)}
        minReturnAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.minReturnAmount)}
        maxReturnAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.maxReturnAmount)}
        approverAddr ${proposalInfo.fundingInfo.approverAddr}
        recipientAddr ${proposalInfo.fundingInfo.recipientAddr}

        vestInfo:
        vestingStartTime  ${proposalInfo.vestInfo.vestingStartTime};
        vestingCliffDuration ${proposalInfo.vestInfo.vestingCliffDuration};
        vestingStepDuration ${proposalInfo.vestInfo.vestingStepDuration};
        vestingSteps ${proposalInfo.vestInfo.vestingSteps};
        vestingCliffLockAmount ${hre.ethers.utils.formatEther(proposalInfo.vestInfo.vestingCliffLockAmount)};
       
        fundRaiseInfo:
        fundRaiseType  ${proposalInfo.fundRaiseInfo.fundRaiseType};
        fundRaiseStartTime ${proposalInfo.fundRaiseInfo.fundRaiseStartTime};
        fundRaiseEndTime ${proposalInfo.fundRaiseInfo.fundRaiseEndTime};
        minDepositAmount ${hre.ethers.utils.formatEther(proposalInfo.fundRaiseInfo.minDepositAmount)};
        maxDepositAmount ${hre.ethers.utils.formatEther(proposalInfo.fundRaiseInfo.maxDepositAmount)};

        fundRaiseInfo -> backerIdentification:  ${proposalInfo.fundRaiseInfo.backerIdentification};
        bakckerIdentificationInfo:
        bakckerIdentificationInfo bType ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bType};
        bakckerIdentificationInfo bChainId ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bChainId};
        bakckerIdentificationInfo bTokanAddr ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bTokanAddr};
        bakckerIdentificationInfo bTokenId ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bTokenId};
        bakckerIdentificationInfo bMinHoldingAmount ${hre.ethers.utils.formatEther(proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bMinHoldingAmount)};

        priorityDeposit ${proposalInfo.fundRaiseInfo.priorityDeposit};

        fundRaiseInfo ->priorityDepositInfo:
        priorityDepositInfo pPeriod ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pPeriod};
        priorityDepositInfo pPeriods ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pPeriods};
        priorityDepositInfo pType ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pType};
        priorityDepositInfo pTokenAddr ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pTokenAddr};
        priorityDepositInfo pTokenId ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pTokenId};
        priorityDepositInfo pMinHolding ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pMinHolding};:

        proposerRewardInfo:
        tokenRewardAmount ${hre.ethers.utils.formatEther(proposalInfo.proposerRewardInfo.tokenRewardAmount)};
        cashRewardAmount ${hre.ethers.utils.formatEther(proposalInfo.proposerRewardInfo.cashRewardAmount)};

        startVoteTime ${proposalInfo.startVoteTime}
        stopVoteTime ${proposalInfo.stopVoteTime}
        state  ${proposalInfo.state}
        `);
    })

    it("deposit fund", async () => {
        const dao = this.dao;
        const fundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexFundingContract = this.flexFundingAdapterContract;

        let fundRaiseStartTime = (await flexFundingContract.Proposals(dao.address, this.proposalId))
            .fundRaiseInfo
            .fundRaiseStartTime;
        let fundRaiseEndTime = (await flexFundingContract.Proposals(dao.address, this.proposalId))
            .fundRaiseInfo
            .fundRaiseEndTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        console.log(`
        fundRaiseStartTime ${fundRaiseStartTime}
        fundRaiseEndTime   ${fundRaiseEndTime}
        current blocktimestamp ${blocktimestamp}
        `);

        if (parseInt(fundRaiseStartTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseStartTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await USDT.approve(fundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await expectRevert(fundingPoolAdapt.deposit(dao.address, this.proposalId, hre.ethers.utils.parseEther("10")), "revert");
        // await expectRevert(fundingPoolAdapt.deposit(dao.address, this.proposalId, hre.ethers.utils.parseEther("100000")), "revert");
        await fundingPoolAdapt.deposit(dao.address, this.proposalId, hre.ethers.utils.parseEther("1000000"));
        const poolBal = await this.testtoken1.balanceOf(this.extensions.flexFundingPoolExt.address);
        const bal = await this.flexFundingPoolExt.balanceOf(this.proposalId, this.owner.address);
        console.log(`
        funding pool contract Bal ${hre.ethers.utils.formatEther(poolBal.toString())}
        balance   ${hre.ethers.utils.formatEther(bal.toString())}
        `);
    });


    it("withdraw fund", async () => {
        const dao = this.dao;
        const fundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexFundingContract = this.flexFundingAdapterContract;

        await fundingPoolAdapt.withdraw(dao.address, this.proposalId, hre.ethers.utils.parseEther("1000"));
        const bal = await fundingPoolAdapt.balanceOf(dao.address, this.proposalId, this.owner.address);
        console.log(`
        balance   ${hre.ethers.utils.formatEther(bal.toString())}
        `);
    });


    it("process proposal", async () => {
        const dao = this.dao;
        const fundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexFundingContract = this.flexFundingAdapterContract;
        const flexERC721Contract = this.flexERC721Contract;
        const flexFundingPoolExtension = this.flexFundingPoolExt;
        let fundRaiseStartTime = (await flexFundingContract.Proposals(dao.address, this.proposalId))
            .fundRaiseInfo
            .fundRaiseStartTime;
        let fundRaiseEndTime = (await flexFundingContract.Proposals(dao.address, this.proposalId))
            .fundRaiseInfo
            .fundRaiseEndTime;

        const minFundingAmount = await flexFundingContract.getMinFundingAmount(dao.address, this.proposalId);
        console.log(`
        min fund raise amount ${hre.ethers.utils.formatEther(minFundingAmount.toString())}
        `);
        const protocolFee = await dao.getConfiguration(sha3("FLEX_PROTOCOL_FEE"));
        await fundingPoolAdapt.deposit(dao.address, this.proposalId, minFundingAmount);
        let bal = await fundingPoolAdapt.balanceOf(dao.address, this.proposalId, this.owner.address);
        let totalFund = await fundingPoolAdapt.getTotalFundByProposalId(dao.address, this.proposalId);
        let proposalState = (await flexFundingContract.Proposals(dao.address, this.proposalId)).state;

        const protocolFeeAccount = await dao.getAddressConfiguration(sha3("FLEX_PROTOCOL_FEE_RECEIVE_ADDRESS"));
        const managementFeeAccount = await dao.getAddressConfiguration(sha3("FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS"));

        let protocolFeeAccountBal = await this.testtoken1.balanceOf(protocolFeeAccount);
        let managementFeeAccountBal = await this.testtoken1.balanceOf(managementFeeAccount);
        let receiverAccountBal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        owner deposit balance   ${hre.ethers.utils.formatEther(bal.toString())}
        total fund ${hre.ethers.utils.formatEther(totalFund.toString())}
        state ${proposalState}
        protocol Fee Account Bal   ${hre.ethers.utils.formatEther(protocolFeeAccountBal.toString())}
        management Fee Account Bal   ${hre.ethers.utils.formatEther(managementFeeAccountBal.toString())}
        receiver Account Bal   ${hre.ethers.utils.formatEther(receiverAccountBal.toString())}

        `);
        console.log("process proposal ...");

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        await flexFundingContract.processProposal(dao.address, this.proposalId);

        proposalState = (await flexFundingContract.Proposals(dao.address, this.proposalId)).state;
        bal = await fundingPoolAdapt.balanceOf(dao.address, this.proposalId, this.owner.address);

        totalFund = await fundingPoolAdapt.getTotalFundByProposalId(dao.address, this.proposalId);
        protocolFeeAccountBal = await this.testtoken1.balanceOf(protocolFeeAccount);
        managementFeeAccountBal = await this.testtoken1.balanceOf(managementFeeAccount);
        receiverAccountBal = await this.testtoken1.balanceOf(this.user1.address);
        const state = await flexFundingContract.getProposalState(dao.address, this.proposalId);

        let totalSendOutAmount = totalFund.add(protocolFeeAccountBal).add(managementFeeAccountBal);

        console.log(`
        owner deposit balance  ${hre.ethers.utils.formatEther(bal.toString())}
        total fund ${hre.ethers.utils.formatEther(totalFund.toString())}
        state ${proposalState}
        protocol Fee Account Bal   ${hre.ethers.utils.formatEther(protocolFeeAccountBal.toString())}
        management Fee Account Bal   ${hre.ethers.utils.formatEther(managementFeeAccountBal.toString())}
        receiver Account Bal   ${hre.ethers.utils.formatEther(receiverAccountBal.toString())}
        proposal state ${state}
        totalSendOutAmount ${hre.ethers.utils.formatEther(totalSendOutAmount.toString())}
        `);

        const investors = await flexFundingPoolExtension.getInvestorsByProposalId(this.proposalId);
        console.log("investors: ", investors);
        console.log("mint NFT...");

        let nftBal = await flexERC721Contract.balanceOf(this.owner.address);
        console.log(`
        nft bal ${nftBal.toString()}
        `);
        await flexERC721Contract.mint(dao.address, this.proposalId);

        nftBal = await flexERC721Contract.balanceOf(this.owner.address);
        console.log(`
        nft bal ${nftBal.toString()}
        `);
        // const tokenId = await flexERC721Contract.
        const tokenAmount = await flexERC721Contract.getTokenAmountByTokenId(dao.address, this.proposalId, 1);
        console.log(`
        token amount in future ${hre.ethers.utils.formatEther(tokenAmount.toString())}
        `);

        await expectRevert(flexERC721Contract.mint(dao.address, this.proposalId), "revert");
    });
});


describe("Adapter - Flex No Escorw Funding Failed", () => {
    before("deploy dao", async () => {
        let [owner, gp1, gp2, user1, user2, user3, user4, user5, user6] = await hre.ethers.getSigners();
        this.owner = owner;
        this.gp1 = gp1;
        this.gp2 = gp2;
        this.user1 = user1;
        this.user2 = user2;
        this.user3 = user3;
        this.user4 = user4;
        this.user5 = user5;
        this.user6 = user6;

        const { dao, adapters, extensions, testContracts } = await deployDefaultDao({
            owner: owner,
        });
        this.adapters = adapters;
        this.extensions = extensions;
        this.dao = dao;
        this.testContracts = testContracts;
        this.snapshotId = await takeChainSnapshot();
        this.testtoken1 = testContracts.testToken1.instance;
        this.testtoken2 = testContracts.testToken2.instance;
        this.testricetoken = testContracts.testRiceToken.instance;

        this.flexFundingAdapterContract = this.adapters.flexFundingAdapterContract.instance;
        this.flexVotingContract = this.adapters.flexVotingContract.instance;
        this.flexFundingPoolAdapterContract = this.adapters.flexFundingPoolAdapterContract.instance;
        this.flexERC721Contract = this.adapters.flexERC721.instance;
        this.flexFundingPoolExt = this.extensions.flexFundingPoolExt.functions;

        const isGP = await extensions.gpDaoExt.functions.isGeneralPartner(owner.address);
        console.log(`owner is a GP: ${isGP}`);
    });

    beforeEach(async () => {
        await revertChainSnapshot(this.snapshotId);
        this.snapshotId = await takeChainSnapshot();
    });

    it("should be possible submit an flex funding proposal", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = this.dao;

        let tokenAddress = this.testtoken1.address;
        let minFundingAmount = hre.ethers.utils.parseEther("1000000");
        let maxFundingAmount = hre.ethers.utils.parseEther("10000000");
        let escrow = false;
        let returnTokenAddr = this.testtoken2.address;
        let returnTokenAmount = hre.ethers.utils.parseEther("1000000");
        let price = hre.ethers.utils.parseEther("0.6");
        let minReturnAmount = hre.ethers.utils.parseEther("1000000");
        let maxReturnAmount = hre.ethers.utils.parseEther("1000000");
        let approverAddr = this.user1.address;
        let recipientAddr = this.user1.address;

        let fundingInfo = [
            tokenAddress,
            minFundingAmount,
            maxFundingAmount,
            escrow,
            returnTokenAddr,
            returnTokenAmount,
            price,
            minReturnAmount,
            maxReturnAmount,
            approverAddr,
            recipientAddr
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let vestingStartTime = blocktimestamp + 100000;
        let vestingCliffDuration = 600;
        let vestingStepDuration = 600;
        let vestingSteps = 10;
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

        let vestInfo = [
            vestingStartTime,
            vestingCliffDuration,
            vestingStepDuration,
            vestingSteps,
            vestingCliffLockAmount
        ];

        let fundRaiseType = 1;
        let fundRaiseStartTime = blocktimestamp;
        let fundRaiseEndTime = fundRaiseStartTime + 100000;
        let minDepositAmount = hre.ethers.utils.parseEther("1000");
        let maxDepositAmount = hre.ethers.utils.parseEther("10000000");
        let backerIdentification = false;

        let bType = 0;
        let bChainId = 1;
        let bTokanAddr = this.testtoken1.address;
        let bTokenId = 1;
        let bMinHoldingAmount = 100;
        let bakckerIdentificationInfo = [
            bType,
            bChainId,
            bTokanAddr,
            bTokenId,
            bMinHoldingAmount
        ];

        let priorityDeposit = true;

        let pPeriod = 100;
        let pPeriods = 10;
        let pType = 0;
        let pChainId = 1;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;

        let priorityDepositInfo = [
            pPeriod,
            pPeriods,
            pType,
            pChainId,
            pTokenAddr,
            pTokenId,
            pMinHolding
        ];

        let fundRaiseInfo = [
            fundRaiseType,
            fundRaiseStartTime,
            fundRaiseEndTime,
            minDepositAmount,
            maxDepositAmount,
            backerIdentification,
            bakckerIdentificationInfo,
            priorityDeposit,
            priorityDepositInfo
        ];

        let tokenRewardAmount = 2;
        let cashRewardAmount = hre.ethers.utils.parseEther("1000");
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];
        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos
        ];
        console.log(fundingParams);
        const tx = await flexFundingAdapterContract.submitProposal(dao.address, fundingParams);
        const result = await tx.wait();
        const ProposalId = result.events[2].args.proposalId;
        console.log(`ProposalId: ${hre.ethers.utils.toUtf8String(ProposalId)}`);
        this.proposalId = ProposalId;
        let proposalInfo = await flexFundingAdapterContract.Proposals(dao.address, ProposalId);
        console.log(`
        proposer ${proposalInfo.proposer}

        FundingInfo:
        tokenAddress ${proposalInfo.fundingInfo.tokenAddress}
        minFundingAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.minFundingAmount)}
        maxFundingAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.maxFundingAmount)}
        escrow ${proposalInfo.fundingInfo.escrow}
        returnTokenAddr ${proposalInfo.fundingInfo.returnTokenAddr}
        returnTokenAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.returnTokenAmount)}
        minReturnAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.minReturnAmount)}
        maxReturnAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.maxReturnAmount)}
        approverAddr ${proposalInfo.fundingInfo.approverAddr}
        recipientAddr ${proposalInfo.fundingInfo.recipientAddr}

        vestInfo:
        vestingStartTime  ${proposalInfo.vestInfo.vestingStartTime};
        vestingCliffDuration ${proposalInfo.vestInfo.vestingCliffDuration};
        vestingStepDuration ${proposalInfo.vestInfo.vestingStepDuration};
        vestingSteps ${proposalInfo.vestInfo.vestingSteps};
        vestingCliffLockAmount ${hre.ethers.utils.formatEther(proposalInfo.vestInfo.vestingCliffLockAmount)};
       
        fundRaiseInfo:
        fundRaiseType  ${proposalInfo.fundRaiseInfo.fundRaiseType};
        fundRaiseStartTime ${proposalInfo.fundRaiseInfo.fundRaiseStartTime};
        fundRaiseEndTime ${proposalInfo.fundRaiseInfo.fundRaiseEndTime};
        minDepositAmount ${hre.ethers.utils.formatEther(proposalInfo.fundRaiseInfo.minDepositAmount)};
        maxDepositAmount ${hre.ethers.utils.formatEther(proposalInfo.fundRaiseInfo.maxDepositAmount)};

        fundRaiseInfo -> backerIdentification:  ${proposalInfo.fundRaiseInfo.backerIdentification};
        bakckerIdentificationInfo:
        bakckerIdentificationInfo bType ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bType};
        bakckerIdentificationInfo bChainId ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bChainId};
        bakckerIdentificationInfo bTokanAddr ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bTokanAddr};
        bakckerIdentificationInfo bTokenId ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bTokenId};
        bakckerIdentificationInfo bMinHoldingAmount ${hre.ethers.utils.formatEther(proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bMinHoldingAmount)};

        priorityDeposit ${proposalInfo.fundRaiseInfo.priorityDeposit};

        fundRaiseInfo ->priorityDepositInfo:
        priorityDepositInfo pPeriod ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pPeriod};
        priorityDepositInfo pPeriods ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pPeriods};
        priorityDepositInfo pType ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pType};
        priorityDepositInfo pTokenAddr ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pTokenAddr};
        priorityDepositInfo pTokenId ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pTokenId};
        priorityDepositInfo pMinHolding ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pMinHolding};:

        proposerRewardInfo:
        tokenRewardAmount ${hre.ethers.utils.formatEther(proposalInfo.proposerRewardInfo.tokenRewardAmount)};
        cashRewardAmount ${hre.ethers.utils.formatEther(proposalInfo.proposerRewardInfo.cashRewardAmount)};

        startVoteTime ${proposalInfo.startVoteTime}
        stopVoteTime ${proposalInfo.stopVoteTime}
        state  ${proposalInfo.state}
        `);
    })

    it("deposit fund", async () => {
        const dao = this.dao;
        const fundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexFundingContract = this.flexFundingAdapterContract;

        let fundRaiseStartTime = (await flexFundingContract.Proposals(dao.address, this.proposalId))
            .fundRaiseInfo
            .fundRaiseStartTime;
        let fundRaiseEndTime = (await flexFundingContract.Proposals(dao.address, this.proposalId))
            .fundRaiseInfo
            .fundRaiseEndTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        console.log(`
        fundRaiseStartTime ${fundRaiseStartTime}
        fundRaiseEndTime   ${fundRaiseEndTime}
        current blocktimestamp ${blocktimestamp}
        `);

        if (parseInt(fundRaiseStartTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseStartTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        await USDT.approve(fundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));

        await USDT.connect(this.user1).approve(fundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.user2).approve(fundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.user3).approve(fundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.user4).approve(fundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.user5).approve(fundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await USDT.connect(this.user6).approve(fundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));

        await USDT.transfer(this.user1.address, hre.ethers.utils.parseEther("10000"));
        await USDT.transfer(this.user2.address, hre.ethers.utils.parseEther("10000"));
        await USDT.transfer(this.user3.address, hre.ethers.utils.parseEther("10000"));
        await USDT.transfer(this.user4.address, hre.ethers.utils.parseEther("10000"));
        await USDT.transfer(this.user5.address, hre.ethers.utils.parseEther("10000"));
        await USDT.transfer(this.user6.address, hre.ethers.utils.parseEther("10000"));

        // deposit amount cant small than min deposit amount
        await expectRevert(fundingPoolAdapt.deposit(dao.address, this.proposalId, hre.ethers.utils.parseEther("10")), "revert");
        // deposit amount cant grater than max deposit amount
        await expectRevert(fundingPoolAdapt.deposit(dao.address, this.proposalId, hre.ethers.utils.parseEther("10000001")), "revert");

        await fundingPoolAdapt.deposit(dao.address, this.proposalId, hre.ethers.utils.parseEther("100000"));
        await fundingPoolAdapt.connect(this.user1).deposit(dao.address, this.proposalId, hre.ethers.utils.parseEther("10000"));
        await fundingPoolAdapt.connect(this.user2).deposit(dao.address, this.proposalId, hre.ethers.utils.parseEther("10000"));
        await fundingPoolAdapt.connect(this.user3).deposit(dao.address, this.proposalId, hre.ethers.utils.parseEther("10000"));
        await fundingPoolAdapt.connect(this.user4).deposit(dao.address, this.proposalId, hre.ethers.utils.parseEther("10000"));

        // cant exceed max participant
        const maxParticipantEnable = await dao.getConfiguration(sha3("MAX_PARTICIPANTS_ENABLE"));
        const maxParticipants = await dao.getConfiguration(sha3("MAX_PARTICIPANTS"));
        console.log(`
        max Participant Enable ${maxParticipantEnable}
        max Participants  ${maxParticipants}
        `);
        await expectRevert(fundingPoolAdapt.connect(this.user5).deposit(dao.address, this.proposalId, hre.ethers.utils.parseEther("10000")), "revert");

        const poolBal = await this.testtoken1.balanceOf(this.extensions.flexFundingPoolExt.address);
        const bal = await this.flexFundingPoolExt.balanceOf(this.proposalId, this.owner.address);
        console.log(`
        funding pool contract Bal ${hre.ethers.utils.formatEther(poolBal.toString())}
        balance   ${hre.ethers.utils.formatEther(bal.toString())}
        `);
    });


    it("withdraw fund during fund raise", async () => {
        const dao = this.dao;
        const fundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexFundingContract = this.flexFundingAdapterContract;


        let bal = await fundingPoolAdapt.balanceOf(dao.address, this.proposalId, this.owner.address);
        console.log(`
        balance   ${hre.ethers.utils.formatEther(bal.toString())}

        withdraw ...
        `);

        await fundingPoolAdapt.withdraw(dao.address, this.proposalId, hre.ethers.utils.parseEther("1000"));

        bal = await fundingPoolAdapt.balanceOf(dao.address, this.proposalId, this.owner.address);
        console.log(`
        balance   ${hre.ethers.utils.formatEther(bal.toString())}
        `);
    });


    it("process proposal", async () => {
        const dao = this.dao;
        const fundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexFundingContract = this.flexFundingAdapterContract;
        const flexERC721Contract = this.flexERC721Contract;
        const flexFundingPoolExtension = this.flexFundingPoolExt;
        let fundRaiseStartTime = (await flexFundingContract.Proposals(dao.address, this.proposalId))
            .fundRaiseInfo
            .fundRaiseStartTime;
        let fundRaiseEndTime = (await flexFundingContract.Proposals(dao.address, this.proposalId))
            .fundRaiseInfo
            .fundRaiseEndTime;

        const minFundingAmount = await flexFundingContract.getMinFundingAmount(dao.address, this.proposalId);
        console.log(`
        min fund raise amount ${hre.ethers.utils.formatEther(minFundingAmount.toString())}
        `);
        const protocolFee = await dao.getConfiguration(sha3("FLEX_PROTOCOL_FEE"));
        let bal = await fundingPoolAdapt.balanceOf(dao.address, this.proposalId, this.owner.address);
        let totalFund = await fundingPoolAdapt.getTotalFundByProposalId(dao.address, this.proposalId);
        let proposalState = (await flexFundingContract.Proposals(dao.address, this.proposalId)).state;

        const protocolFeeAccount = await dao.getAddressConfiguration(sha3("FLEX_PROTOCOL_FEE_RECEIVE_ADDRESS"));
        const managementFeeAccount = await dao.getAddressConfiguration(sha3("FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS"));

        let protocolFeeAccountBal = await this.testtoken1.balanceOf(protocolFeeAccount);
        let managementFeeAccountBal = await this.testtoken1.balanceOf(managementFeeAccount);
        let receiverAccountBal = await this.testtoken1.balanceOf(this.user1.address);
        console.log(`
        owner deposit balance   ${hre.ethers.utils.formatEther(bal.toString())}
        total fund ${hre.ethers.utils.formatEther(totalFund.toString())}
        state ${proposalState}
        protocol Fee Account Bal   ${hre.ethers.utils.formatEther(protocolFeeAccountBal.toString())}
        management Fee Account Bal   ${hre.ethers.utils.formatEther(managementFeeAccountBal.toString())}
        receiver Account Bal   ${hre.ethers.utils.formatEther(receiverAccountBal.toString())}

        process proposal ...
        `);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        // cant deposit when fund raise time is up
        await expectRevert(fundingPoolAdapt.deposit(dao.address, this.proposalId, hre.ethers.utils.parseEther("100000")), "revert");

        await flexFundingContract.processProposal(dao.address, this.proposalId);

        proposalState = (await flexFundingContract.Proposals(dao.address, this.proposalId)).state;
        bal = await fundingPoolAdapt.balanceOf(dao.address, this.proposalId, this.owner.address);

        totalFund = await fundingPoolAdapt.getTotalFundByProposalId(dao.address, this.proposalId);
        protocolFeeAccountBal = await this.testtoken1.balanceOf(protocolFeeAccount);
        managementFeeAccountBal = await this.testtoken1.balanceOf(managementFeeAccount);
        receiverAccountBal = await this.testtoken1.balanceOf(this.user1.address);
        const state = await flexFundingContract.getProposalState(dao.address, this.proposalId);

        let totalSendOutAmount = totalFund.add(protocolFeeAccountBal).add(managementFeeAccountBal);

        console.log(`
        owner deposit balance  ${hre.ethers.utils.formatEther(bal.toString())}
        total fund ${hre.ethers.utils.formatEther(totalFund.toString())}
        state ${proposalState}
        protocol Fee Account Bal   ${hre.ethers.utils.formatEther(protocolFeeAccountBal.toString())}
        management Fee Account Bal   ${hre.ethers.utils.formatEther(managementFeeAccountBal.toString())}
        receiver Account Bal   ${hre.ethers.utils.formatEther(receiverAccountBal.toString())}
        proposal state ${state}
        totalSendOutAmount ${hre.ethers.utils.formatEther(totalSendOutAmount.toString())}
        `);

        const investors = await flexFundingPoolExtension.getInvestorsByProposalId(this.proposalId);
        console.log("investors: ", investors);
    });

    it("withdraw when fund raise failed", async () => {

        const dao = this.dao;
        const fundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexFundingContract = this.flexFundingAdapterContract;


        let bal = await fundingPoolAdapt.balanceOf(dao.address, this.proposalId, this.owner.address);
        let user1Bal = await fundingPoolAdapt.balanceOf(dao.address, this.proposalId, this.user1.address);
        let ownerUSDTBal = await USDT.balanceOf(this.owner.address);
        let user1USDTBal = await USDT.balanceOf(this.user1.address);

        console.log(`
        owner balance   ${hre.ethers.utils.formatEther(bal.toString())}
        user1 bal   ${hre.ethers.utils.formatEther(user1Bal.toString())}
        onwer usdt bal  ${hre.ethers.utils.formatEther(ownerUSDTBal.toString())}
        user1 usdt bal  ${hre.ethers.utils.formatEther(user1USDTBal.toString())}
        withdraw ...
        `);

        await fundingPoolAdapt.withdraw(dao.address, this.proposalId, hre.ethers.utils.parseEther("1000"));
        await fundingPoolAdapt.connect(this.user1).withdraw(dao.address, this.proposalId, hre.ethers.utils.parseEther("1000"));

        bal = await fundingPoolAdapt.balanceOf(dao.address, this.proposalId, this.owner.address);
        user1Bal = await fundingPoolAdapt.balanceOf(dao.address, this.proposalId, this.user1.address);
        ownerUSDTBal = await USDT.balanceOf(this.owner.address);
        user1USDTBal = await USDT.balanceOf(this.user1.address);
        console.log(`
        balance   ${hre.ethers.utils.formatEther(bal.toString())}
        user1 bal   ${hre.ethers.utils.formatEther(user1Bal.toString())}
        onwer usdt bal  ${hre.ethers.utils.formatEther(ownerUSDTBal.toString())}
        user1 usdt bal  ${hre.ethers.utils.formatEther(user1USDTBal.toString())}
        withdraw all ...
        `);

        await fundingPoolAdapt.withdraw(dao.address, this.proposalId, bal);
        await fundingPoolAdapt.connect(this.user1).withdraw(dao.address, this.proposalId, user1Bal);

        bal = await fundingPoolAdapt.balanceOf(dao.address, this.proposalId, this.owner.address);
        user1Bal = await fundingPoolAdapt.balanceOf(dao.address, this.proposalId, this.user1.address);
        ownerUSDTBal = await USDT.balanceOf(this.owner.address);
        user1USDTBal = await USDT.balanceOf(this.user1.address);
        console.log(`
        balance   ${hre.ethers.utils.formatEther(bal.toString())}
        user1 bal   ${hre.ethers.utils.formatEther(user1Bal.toString())}
        onwer usdt bal  ${hre.ethers.utils.formatEther(ownerUSDTBal.toString())}
        user1 usdt bal  ${hre.ethers.utils.formatEther(user1USDTBal.toString())}
        `);
    });


    it("should be possible submit another flex funding proposal", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = this.dao;

        let tokenAddress = this.testtoken1.address;
        let minFundingAmount = hre.ethers.utils.parseEther("1000000");
        let maxFundingAmount = hre.ethers.utils.parseEther("10000000");
        let escrow = false;
        let returnTokenAddr = this.testtoken2.address;
        let returnTokenAmount = hre.ethers.utils.parseEther("1000000");
        let price = hre.ethers.utils.parseEther("0.6");
        let minReturnAmount = hre.ethers.utils.parseEther("1000000");
        let maxReturnAmount = hre.ethers.utils.parseEther("1000000");
        let approverAddr = this.user1.address;
        let recipientAddr = this.user1.address;

        let fundingInfo = [
            tokenAddress,
            minFundingAmount,
            maxFundingAmount,
            escrow,
            returnTokenAddr,
            returnTokenAmount,
            price,
            minReturnAmount,
            maxReturnAmount,
            approverAddr,
            recipientAddr
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let vestingStartTime = blocktimestamp + 100000;
        let vestingCliffDuration = 600;
        let vestingStepDuration = 600;
        let vestingSteps = 10;
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

        let vestInfo = [
            vestingStartTime,
            vestingCliffDuration,
            vestingStepDuration,
            vestingSteps,
            vestingCliffLockAmount
        ];

        let fundRaiseType = 1;
        let fundRaiseStartTime = blocktimestamp;
        let fundRaiseEndTime = fundRaiseStartTime + 100000;
        let minDepositAmount = hre.ethers.utils.parseEther("1000");
        let maxDepositAmount = hre.ethers.utils.parseEther("10000000");
        let backerIdentification = false;

        let bType = 0;
        let bChainId = 1;
        let bTokanAddr = this.testtoken1.address;
        let bTokenId = 1;
        let bMinHoldingAmount = 100;
        let bakckerIdentificationInfo = [
            bType,
            bChainId,
            bTokanAddr,
            bTokenId,
            bMinHoldingAmount
        ];

        let priorityDeposit = true;

        let pPeriod = 100;
        let pPeriods = 10;
        let pType = 0;
        let pChainId = 1;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;

        let priorityDepositInfo = [
            pPeriod,
            pPeriods,
            pType,
            pChainId,
            pTokenAddr,
            pTokenId,
            pMinHolding
        ];

        let fundRaiseInfo = [
            fundRaiseType,
            fundRaiseStartTime,
            fundRaiseEndTime,
            minDepositAmount,
            maxDepositAmount,
            backerIdentification,
            bakckerIdentificationInfo,
            priorityDeposit,
            priorityDepositInfo
        ];

        let tokenRewardAmount = 2;
        let cashRewardAmount = hre.ethers.utils.parseEther("1000");
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];
        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos
        ];
        console.log("fundingParams", fundingParams);
        const tx = await flexFundingAdapterContract.submitProposal(dao.address, fundingParams);
        const result = await tx.wait();
        const ProposalId = result.events[2].args.proposalId;
        console.log(`ProposalId: ${hre.ethers.utils.toUtf8String(ProposalId)}`);
        this.proposalId = ProposalId;
        let proposalInfo = await flexFundingAdapterContract.Proposals(dao.address, ProposalId);
        console.log(`
        proposer ${proposalInfo.proposer}

        FundingInfo:
        tokenAddress ${proposalInfo.fundingInfo.tokenAddress}
        minFundingAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.minFundingAmount)}
        maxFundingAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.maxFundingAmount)}
        escrow ${proposalInfo.fundingInfo.escrow}
        returnTokenAddr ${proposalInfo.fundingInfo.returnTokenAddr}
        returnTokenAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.returnTokenAmount)}
        minReturnAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.minReturnAmount)}
        maxReturnAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.maxReturnAmount)}
        approverAddr ${proposalInfo.fundingInfo.approverAddr}
        recipientAddr ${proposalInfo.fundingInfo.recipientAddr}

        vestInfo:
        vestingStartTime  ${proposalInfo.vestInfo.vestingStartTime};
        vestingCliffDuration ${proposalInfo.vestInfo.vestingCliffDuration};
        vestingStepDuration ${proposalInfo.vestInfo.vestingStepDuration};
        vestingSteps ${proposalInfo.vestInfo.vestingSteps};
        vestingCliffLockAmount ${hre.ethers.utils.formatEther(proposalInfo.vestInfo.vestingCliffLockAmount)};
       
        fundRaiseInfo:
        fundRaiseType  ${proposalInfo.fundRaiseInfo.fundRaiseType};
        fundRaiseStartTime ${proposalInfo.fundRaiseInfo.fundRaiseStartTime};
        fundRaiseEndTime ${proposalInfo.fundRaiseInfo.fundRaiseEndTime};
        minDepositAmount ${hre.ethers.utils.formatEther(proposalInfo.fundRaiseInfo.minDepositAmount)};
        maxDepositAmount ${hre.ethers.utils.formatEther(proposalInfo.fundRaiseInfo.maxDepositAmount)};

        fundRaiseInfo -> backerIdentification:  ${proposalInfo.fundRaiseInfo.backerIdentification};
        bakckerIdentificationInfo:
        bakckerIdentificationInfo bType ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bType};
        bakckerIdentificationInfo bChainId ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bChainId};
        bakckerIdentificationInfo bTokanAddr ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bTokanAddr};
        bakckerIdentificationInfo bTokenId ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bTokenId};
        bakckerIdentificationInfo bMinHoldingAmount ${hre.ethers.utils.formatEther(proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bMinHoldingAmount)};

        priorityDeposit ${proposalInfo.fundRaiseInfo.priorityDeposit};

        fundRaiseInfo ->priorityDepositInfo:
        priorityDepositInfo pPeriod ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pPeriod};
        priorityDepositInfo pPeriods ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pPeriods};
        priorityDepositInfo pType ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pType};
        priorityDepositInfo pTokenAddr ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pTokenAddr};
        priorityDepositInfo pTokenId ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pTokenId};
        priorityDepositInfo pMinHolding ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pMinHolding};:

        proposerRewardInfo:
        tokenRewardAmount ${hre.ethers.utils.formatEther(proposalInfo.proposerRewardInfo.tokenRewardAmount)};
        cashRewardAmount ${hre.ethers.utils.formatEther(proposalInfo.proposerRewardInfo.cashRewardAmount)};

        startVoteTime ${proposalInfo.startVoteTime}
        stopVoteTime ${proposalInfo.stopVoteTime}
        state  ${proposalInfo.state}
        `);
    })
});


describe("Adapter - Flex Escorw Funding Succeed", () => {
    before("deploy dao", async () => {
        let [owner, gp1, gp2, user1] = await hre.ethers.getSigners();
        this.owner = owner;
        this.gp1 = gp1;
        this.gp2 = gp2;
        this.user1 = user1;
        const { dao, adapters, extensions, testContracts } = await deployDefaultDao({
            owner: owner,
        });
        this.adapters = adapters;
        this.extensions = extensions;
        this.dao = dao;
        this.testContracts = testContracts;
        this.snapshotId = await takeChainSnapshot();
        this.testtoken1 = testContracts.testToken1.instance;
        this.testtoken2 = testContracts.testToken2.instance;
        this.testricetoken = testContracts.testRiceToken.instance;

        this.flexFundingAdapterContract = this.adapters.flexFundingAdapterContract.instance;
        this.flexVotingContract = this.adapters.flexVotingContract.instance;
        this.flexFundingPoolAdapterContract = this.adapters.flexFundingPoolAdapterContract.instance;
        this.flexERC721Contract = this.adapters.flexERC721.instance;
        this.flexFundingPoolExt = this.extensions.flexFundingPoolExt.functions;
        this.flexVesting = this.adapters.flexVesting.instance;
        this.flexAlloc = this.adapters.flexAllocationAdapterContract.instance;

        const isGP = await extensions.gpDaoExt.functions.isGeneralPartner(owner.address);
        console.log(`owner is a GP: ${isGP}`);
    });

    beforeEach(async () => {
        await revertChainSnapshot(this.snapshotId);
        this.snapshotId = await takeChainSnapshot();
    });

    it("should be possible submit an flex escrow funding proposal", async () => {
        const flexFundingAdapterContract = this.flexFundingAdapterContract;
        const dao = this.dao;

        let tokenAddress = this.testtoken1.address;
        let minFundingAmount = hre.ethers.utils.parseEther("1000000");
        let maxFundingAmount = hre.ethers.utils.parseEther("10000000");
        let escrow = true;
        let returnTokenAddr = this.testtoken2.address;
        let returnTokenAmount = hre.ethers.utils.parseEther("1000000");
        let price = hre.ethers.utils.parseEther("0.6");
        let minReturnAmount = minFundingAmount.div(price).mul(hre.ethers.utils.parseEther("1"));
        let maxReturnAmount = maxFundingAmount.div(price).mul(hre.ethers.utils.parseEther("1"));
        let approverAddr = this.user1.address;
        let recipientAddr = this.user1.address;

        let fundingInfo = [
            tokenAddress,
            minFundingAmount,
            maxFundingAmount,
            escrow,
            returnTokenAddr,
            returnTokenAmount,
            price,
            minReturnAmount,
            maxReturnAmount,
            approverAddr,
            recipientAddr
        ];

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;

        let vestingStartTime = blocktimestamp + 100000;
        let vestingCliffDuration = 600;
        let vestingStepDuration = 600;
        let vestingSteps = 10;
        let vestingCliffLockAmount = hre.ethers.utils.parseEther("1000");

        let vestInfo = [
            vestingStartTime,
            vestingCliffDuration,
            vestingStepDuration,
            vestingSteps,
            vestingCliffLockAmount
        ];

        let fundRaiseType = 1;
        let fundRaiseStartTime = blocktimestamp;
        let fundRaiseEndTime = fundRaiseStartTime + 100000;
        let minDepositAmount = hre.ethers.utils.parseEther("1000");
        let maxDepositAmount = hre.ethers.utils.parseEther("10000000");
        let backerIdentification = false;

        let bType = 0;
        let bChainId = 1;
        let bTokanAddr = this.testtoken1.address;
        let bTokenId = 1;
        let bMinHoldingAmount = 100;

        let bakckerIdentificationInfo = [
            bType,
            bChainId,
            bTokanAddr,
            bTokenId,
            bMinHoldingAmount
        ];

        let priorityDeposit = true;

        let pPeriod = 100;
        let pPeriods = 10;
        let pType = 0;
        let pChainId = 1;
        let pTokenAddr = this.testtoken1.address;
        let pTokenId = 1;
        let pMinHolding = 10;

        let priorityDepositInfo = [
            pPeriod,
            pPeriods,
            pType,
            pChainId,
            pTokenAddr,
            pTokenId,
            pMinHolding
        ];

        let fundRaiseInfo = [
            fundRaiseType,
            fundRaiseStartTime,
            fundRaiseEndTime,
            minDepositAmount,
            maxDepositAmount,
            backerIdentification,
            bakckerIdentificationInfo,
            priorityDeposit,
            priorityDepositInfo
        ];

        let tokenRewardAmount = 2;
        let cashRewardAmount = hre.ethers.utils.parseEther("1000");
        let proposerRewardInfos = [
            tokenRewardAmount,
            cashRewardAmount
        ];
        const fundingParams = [
            fundingInfo,
            vestInfo,
            fundRaiseInfo,
            proposerRewardInfos
        ];
        console.log(fundingParams);

        await this.testtoken2.transfer(this.user1.address, maxReturnAmount);
        await this.testtoken2.connect(this.user1).approve(flexFundingAdapterContract.address, maxReturnAmount);

        const tx = await flexFundingAdapterContract.submitProposal(dao.address, fundingParams);
        const result = await tx.wait();
        const ProposalId = result.events[result.events.length - 1].args.proposalId;
        console.log(`ProposalId: ${hre.ethers.utils.toUtf8String(ProposalId)}`);
        this.proposalId = ProposalId;
        let proposalInfo = await flexFundingAdapterContract.Proposals(dao.address, ProposalId);
        let escorwedTokenAmount = await flexFundingAdapterContract.escrowedTokens(dao.address, this.proposalId, this.user1.address);

        console.log(`
        proposer ${proposalInfo.proposer}

        escorwed Token Amount  ${hre.ethers.utils.formatEther(escorwedTokenAmount.toString())}

        FundingInfo:
        tokenAddress ${proposalInfo.fundingInfo.tokenAddress}
        minFundingAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.minFundingAmount)}
        maxFundingAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.maxFundingAmount)}
        escrow ${proposalInfo.fundingInfo.escrow}
        returnTokenAddr ${proposalInfo.fundingInfo.returnTokenAddr}
        returnTokenAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.returnTokenAmount)}
        minReturnAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.minReturnAmount)}
        maxReturnAmount ${hre.ethers.utils.formatEther(proposalInfo.fundingInfo.maxReturnAmount)}
        approverAddr ${proposalInfo.fundingInfo.approverAddr}
        recipientAddr ${proposalInfo.fundingInfo.recipientAddr}

        vestInfo:
        vestingStartTime  ${proposalInfo.vestInfo.vestingStartTime};
        vestingCliffDuration ${proposalInfo.vestInfo.vestingCliffDuration};
        vestingStepDuration ${proposalInfo.vestInfo.vestingStepDuration};
        vestingSteps ${proposalInfo.vestInfo.vestingSteps};
        vestingCliffLockAmount ${hre.ethers.utils.formatEther(proposalInfo.vestInfo.vestingCliffLockAmount)};
       
        fundRaiseInfo:
        fundRaiseType  ${proposalInfo.fundRaiseInfo.fundRaiseType};
        fundRaiseStartTime ${proposalInfo.fundRaiseInfo.fundRaiseStartTime};
        fundRaiseEndTime ${proposalInfo.fundRaiseInfo.fundRaiseEndTime};
        minDepositAmount ${hre.ethers.utils.formatEther(proposalInfo.fundRaiseInfo.minDepositAmount)};
        maxDepositAmount ${hre.ethers.utils.formatEther(proposalInfo.fundRaiseInfo.maxDepositAmount)};

        fundRaiseInfo -> backerIdentification:  ${proposalInfo.fundRaiseInfo.backerIdentification};
        bakckerIdentificationInfo:
        bakckerIdentificationInfo bType ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bType};
        bakckerIdentificationInfo bChainId ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bChainId};
        bakckerIdentificationInfo bTokanAddr ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bTokanAddr};
        bakckerIdentificationInfo bTokenId ${proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bTokenId};
        bakckerIdentificationInfo bMinHoldingAmount ${hre.ethers.utils.formatEther(proposalInfo.fundRaiseInfo.bakckerIdentificationInfo.bMinHoldingAmount)};

        priorityDeposit ${proposalInfo.fundRaiseInfo.priorityDeposit};

        fundRaiseInfo ->priorityDepositInfo:
        priorityDepositInfo pPeriod ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pPeriod};
        priorityDepositInfo pPeriods ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pPeriods};
        priorityDepositInfo pType ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pType};
        priorityDepositInfo pTokenAddr ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pTokenAddr};
        priorityDepositInfo pTokenId ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pTokenId};
        priorityDepositInfo pMinHolding ${proposalInfo.fundRaiseInfo.priorityDepositInfo.pMinHolding};:

        proposerRewardInfo:
        tokenRewardAmount ${hre.ethers.utils.formatEther(proposalInfo.proposerRewardInfo.tokenRewardAmount)};
        cashRewardAmount ${hre.ethers.utils.formatEther(proposalInfo.proposerRewardInfo.cashRewardAmount)};

        startVoteTime ${proposalInfo.startVoteTime}
        stopVoteTime ${proposalInfo.stopVoteTime}
        state  ${proposalInfo.state}
        `);
    })

    it("deposit fund", async () => {
        const dao = this.dao;
        const fundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexFundingContract = this.flexFundingAdapterContract;


        const fundRiseTimes = await flexFundingContract.getFundRaiseTimes(dao.address, this.proposalId);
        console.log("fundRaiseStartTime  : ", fundRiseTimes[0]);
        console.log("fundRaiseEndTime  : ", fundRiseTimes[1]);

        let fundRaiseStartTime = (await flexFundingContract.Proposals(dao.address, this.proposalId))
            .fundRaiseInfo
            .fundRaiseStartTime;
        let fundRaiseEndTime = (await flexFundingContract.Proposals(dao.address, this.proposalId))
            .fundRaiseInfo
            .fundRaiseEndTime;

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        await USDT.approve(fundingPoolAdapt.address, hre.ethers.utils.parseEther("100000000000"));
        await fundingPoolAdapt.deposit(dao.address, this.proposalId, hre.ethers.utils.parseEther("10000"));

        console.log(`
        fundRaiseStartTime ${fundRaiseStartTime}
        fundRaiseEndTime   ${fundRaiseEndTime}
        current blocktimestamp ${blocktimestamp}
        `);

        if (parseInt(fundRaiseStartTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseStartTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        let poolBal = await this.testtoken1.balanceOf(this.extensions.flexFundingPoolExt.address);
        let bal = await this.flexFundingPoolExt.balanceOf(this.proposalId, this.owner.address);
        console.log(`
        funding pool contract Bal ${hre.ethers.utils.formatEther(poolBal.toString())}
        balance   ${hre.ethers.utils.formatEther(bal.toString())}
        `);
        console.log("deposit...");
        await expectRevert(fundingPoolAdapt.deposit(dao.address, this.proposalId, hre.ethers.utils.parseEther("10")), "revert");
        // await expectRevert(fundingPoolAdapt.deposit(dao.address, this.proposalId, hre.ethers.utils.parseEther("100000")), "revert");
        await fundingPoolAdapt.deposit(dao.address, this.proposalId, hre.ethers.utils.parseEther("1000000"));
        poolBal = await this.testtoken1.balanceOf(this.extensions.flexFundingPoolExt.address);
        bal = await this.flexFundingPoolExt.balanceOf(this.proposalId, this.owner.address);
        console.log(`
        funding pool contract Bal ${hre.ethers.utils.formatEther(poolBal.toString())}
        balance   ${hre.ethers.utils.formatEther(bal.toString())}
        `);
    });


    it("withdraw fund", async () => {
        const dao = this.dao;
        const fundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexFundingContract = this.flexFundingAdapterContract;

        let poolBal = await this.testtoken1.balanceOf(this.extensions.flexFundingPoolExt.address);

        console.log(`
        funding pool contract Bal ${hre.ethers.utils.formatEther(poolBal.toString())}
        `);

        console.log("withdraw...");
        await fundingPoolAdapt.withdraw(dao.address, this.proposalId, hre.ethers.utils.parseEther("1000"));
        const bal = await fundingPoolAdapt.balanceOf(dao.address, this.proposalId, this.owner.address);
        poolBal = await this.testtoken1.balanceOf(this.extensions.flexFundingPoolExt.address);
        console.log(`
        balance   ${hre.ethers.utils.formatEther(bal.toString())}
        funding pool contract Bal ${hre.ethers.utils.formatEther(poolBal.toString())}
        `);
    });


    it("process proposal", async () => {
        const dao = this.dao;
        const fundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const flexFundingContract = this.flexFundingAdapterContract;
        const flexERC721Contract = this.flexERC721Contract;
        const flexFundingPoolExtension = this.flexFundingPoolExt;
        let fundRaiseStartTime = (await flexFundingContract.Proposals(dao.address, this.proposalId))
            .fundRaiseInfo
            .fundRaiseStartTime;
        let fundRaiseEndTime = (await flexFundingContract.Proposals(dao.address, this.proposalId))
            .fundRaiseInfo
            .fundRaiseEndTime;

        const minFundingAmount = await flexFundingContract.getMinFundingAmount(dao.address, this.proposalId);
        console.log(`
        min fund raise amount ${hre.ethers.utils.formatEther(minFundingAmount.toString())}
        `);
        const protocolFee = await dao.getConfiguration(sha3("FLEX_PROTOCOL_FEE"));
        await fundingPoolAdapt.deposit(dao.address, this.proposalId, minFundingAmount);
        let bal = await fundingPoolAdapt.balanceOf(dao.address, this.proposalId, this.owner.address);
        let totalFund = await fundingPoolAdapt.getTotalFundByProposalId(dao.address, this.proposalId);
        let proposalState = (await flexFundingContract.Proposals(dao.address, this.proposalId)).state;

        const protocolFeeAccount = await dao.getAddressConfiguration(sha3("FLEX_PROTOCOL_FEE_RECEIVE_ADDRESS"));
        const managementFeeAccount = await dao.getAddressConfiguration(sha3("FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS"));
        const ownerBal1 = await this.testtoken1.balanceOf(this.owner.address);
        let protocolFeeAccountBal = await this.testtoken1.balanceOf(protocolFeeAccount);
        let managementFeeAccountBal = await this.testtoken1.balanceOf(managementFeeAccount);
        let receiverAccountBal = await this.testtoken1.balanceOf(this.user1.address);
        let escorwedTokenAmount = await flexFundingContract.escrowedTokens(dao.address, this.proposalId, this.user1.address);
        let returnTokenAmount = (await flexFundingContract.Proposals(dao.address, this.proposalId)).fundingInfo.returnTokenAmount;
        console.log(`
        owner deposit balance   ${hre.ethers.utils.formatEther(bal.toString())}
        total fund ${hre.ethers.utils.formatEther(totalFund.toString())}
        state ${proposalState}
        protocol Fee Account Bal   ${hre.ethers.utils.formatEther(protocolFeeAccountBal.toString())}
        management Fee Account Bal   ${hre.ethers.utils.formatEther(managementFeeAccountBal.toString())}
        receiver Account Bal   ${hre.ethers.utils.formatEther(receiverAccountBal.toString())}
        escorwed Token Amount  ${hre.ethers.utils.formatEther(escorwedTokenAmount.toString())}
        return Token Amount ${hre.ethers.utils.formatEther(returnTokenAmount.toString())}
        `);
        console.log("process proposal ...");

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(fundRaiseEndTime) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(fundRaiseEndTime) + 1]);
            await hre.network.provider.send("evm_mine");
        }
        await flexFundingContract.processProposal(dao.address, this.proposalId);

        //cant process twice
        await expectRevert(flexFundingContract.processProposal(dao.address, this.proposalId), "revert");

        proposalState = (await flexFundingContract.Proposals(dao.address, this.proposalId)).state;
        bal = await fundingPoolAdapt.balanceOf(dao.address, this.proposalId, this.owner.address);
        returnTokenAmount = (await flexFundingContract.Proposals(dao.address, this.proposalId)).fundingInfo.returnTokenAmount;
        totalFund = await fundingPoolAdapt.getTotalFundByProposalId(dao.address, this.proposalId);
        protocolFeeAccountBal = await this.testtoken1.balanceOf(protocolFeeAccount);
        managementFeeAccountBal = await this.testtoken1.balanceOf(managementFeeAccount);
        receiverAccountBal = await this.testtoken1.balanceOf(this.user1.address);
        const state = await flexFundingContract.getProposalState(dao.address, this.proposalId);
        const ownerBal2 = await this.testtoken1.balanceOf(this.owner.address);
        const proposerCashReward = ownerBal2.sub(ownerBal1);
        let totalSendOutAmount = protocolFeeAccountBal.add(managementFeeAccountBal).add(receiverAccountBal).add(proposerCashReward);
        escorwedTokenAmount = await flexFundingContract.escrowedTokens(dao.address, this.proposalId, this.user1.address);
        const returnTokenEscrowInContract = await this.testtoken2.balanceOf(this.flexAlloc.address);
        console.log(`
        owner deposit balance  ${hre.ethers.utils.formatEther(bal.toString())}
        total fund ${hre.ethers.utils.formatEther(totalFund.toString())}
        state ${proposalState}
        proposerCashReward ${hre.ethers.utils.formatEther(proposerCashReward.toString())}
        protocol Fee Account Bal   ${hre.ethers.utils.formatEther(protocolFeeAccountBal.toString())}
        management Fee Account Bal   ${hre.ethers.utils.formatEther(managementFeeAccountBal.toString())}
        receiver Account Bal   ${hre.ethers.utils.formatEther(receiverAccountBal.toString())}
        proposal state ${state}
        totalSendOutAmount ${hre.ethers.utils.formatEther(totalSendOutAmount.toString())}
        escorwed Token Amount  ${hre.ethers.utils.formatEther(escorwedTokenAmount.toString())}
        return Token Amount ${hre.ethers.utils.formatEther(returnTokenAmount.toString())}
        return Token Escrow In Contract ${hre.ethers.utils.formatEther(returnTokenEscrowInContract.toString())}
        `);
    });

    it("create vesting", async () => {
        const dao = this.dao;
        const fundingPoolAdapt = this.flexFundingPoolAdapterContract;
        const USDT = this.testtoken1;
        const returnToken = this.testtoken2;
        const flexFundingContract = this.flexFundingAdapterContract;
        const flexERC721Contract = this.flexERC721Contract;

        const flexFundingPoolExtension = this.flexFundingPoolExt;
        const flexVesting = this.flexVesting;

        const investors = await flexFundingPoolExtension.getInvestorsByProposalId(this.proposalId);
        console.log("investors: ", investors);
        console.log("create vesting...");

        // cant create if not eligible
        await expectRevert(flexVesting.createVesting(dao.address, this.user1.address, this.proposalId), "revert");

        const tx = await flexVesting.createVesting(dao.address, this.owner.address, this.proposalId);
        const result = await tx.wait();
        const vestId = parseInt(result.events[result.events.length - 1].args.vestId);
        console.log("created vest id ", vestId);

        // cant create twice
        await expectRevert(flexVesting.createVesting(dao.address, this.owner.address, this.proposalId), "revert");

        let vestInfo = await flexVesting.vests(vestId);
        console.log(`
        proposalId: ${vestInfo.proposalId},
        owner: ${vestInfo.owner},
        recipient:  ${vestInfo.recipient},
        token: ${vestInfo.token},
        start: ${vestInfo.start},
        cliffDuration: ${vestInfo.cliffDuration},
        stepDuration: ${vestInfo.stepDuration},
        steps: ${vestInfo.steps},
        cliffShares: ${hre.ethers.utils.formatEther(vestInfo.cliffShares)},
        stepShares: ${hre.ethers.utils.formatEther(vestInfo.stepShares)},
        claimed: ${hre.ethers.utils.formatEther(vestInfo.claimed)}
        `);

        let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        if (parseInt(vestInfo.start) + parseInt(vestInfo.cliffDuration) > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [parseInt(vestInfo.start) + parseInt(vestInfo.cliffDuration) + 1]);
            await hre.network.provider.send("evm_mine");
        }

        let onwerVestingBal = await flexVesting.vestBalance(vestId);
        let ownerReturnTokenBal = await returnToken.balanceOf(this.owner.address);

        console.log(`
        owner vesting bal ${hre.ethers.utils.formatEther(onwerVestingBal.toString())}
        owner return bal ${hre.ethers.utils.formatEther(ownerReturnTokenBal.toString())}
        `);

        console.log("withdraw cliff amount from vesting...");

        await flexVesting.withdraw(dao.address, vestId);
        onwerVestingBal = await flexVesting.vestBalance(vestId);
        ownerReturnTokenBal = await returnToken.balanceOf(this.owner.address);
        vestInfo = await flexVesting.vests(vestId);

        console.log(`
        owner vesting bal ${hre.ethers.utils.formatEther(onwerVestingBal.toString())}
        owner return bal ${hre.ethers.utils.formatEther(ownerReturnTokenBal.toString())}
        claimed: ${hre.ethers.utils.formatEther(vestInfo.claimed)}
        `);


        console.log("withdraw all...");

        blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
        const vestingEndTime = parseInt(vestInfo.start) + parseInt(vestInfo.cliffDuration) + parseInt(vestInfo.stepDuration) * parseInt(vestInfo.steps);
        if (vestingEndTime > blocktimestamp) {
            await hre.network.provider.send("evm_setNextBlockTimestamp", [vestingEndTime + 1]);
            await hre.network.provider.send("evm_mine");
        }

        onwerVestingBal = await flexVesting.vestBalance(vestId);
        ownerReturnTokenBal = await returnToken.balanceOf(this.owner.address);
        vestInfo = await flexVesting.vests(vestId);

        console.log(`
        owner vesting bal ${hre.ethers.utils.formatEther(onwerVestingBal.toString())}
        owner return bal ${hre.ethers.utils.formatEther(ownerReturnTokenBal.toString())}
        claimed: ${hre.ethers.utils.formatEther(vestInfo.claimed)}
        `);

        await flexVesting.withdraw(dao.address, vestId);
        onwerVestingBal = await flexVesting.vestBalance(vestId);
        ownerReturnTokenBal = await returnToken.balanceOf(this.owner.address);
        vestInfo = await flexVesting.vests(vestId);

        console.log(`
        owner vesting bal ${hre.ethers.utils.formatEther(onwerVestingBal.toString())}
        owner return bal ${hre.ethers.utils.formatEther(ownerReturnTokenBal.toString())}
        claimed: ${hre.ethers.utils.formatEther(vestInfo.claimed)}
        `);


    });
});
