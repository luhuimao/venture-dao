// Whole-script strict mode syntax
"use strict";

const { toBN, UNITS } = require("./contract-util");

const { expect, advanceTime, web3 } = require("./oz-util");

const checkLastEvent = async (dao, testObject) => {
  let pastEvents = await dao.getPastEvents();
  let returnValues = pastEvents[0].returnValues;

  Object.keys(testObject).forEach((key) =>
    expect(testObject[key], "value mismatch for key " + key).equal(
      returnValues[key]
    )
  );
};

const checkBalance = async (bank, address, token, expectedBalance) => {
  const balance = await bank.balanceOf(address, token);

  expect(balance.toString()).equal(expectedBalance.toString());
};

const checkSignature = async (
  signatureExtension,
  permissionHash,
  signature,
  magicValue
) => {
  const returnedValue = await signatureExtension.isValidSignature(
    permissionHash,
    signature
  );

  expect(returnedValue).equal(magicValue);
};

const encodeDaoInfo = (daoAddress) =>
  web3.eth.abi.encodeParameter(
    {
      DaoInfo: {
        dao: "address",
      },
    },
    {
      dao: daoAddress,
    }
  );

const isMember = async (bank, member) => {
  const units = await bank.balanceOf(member, UNITS);

  return units > toBN("0");
};

const submitNewMemberProposal = async (
  proposalId,
  member,
  onboarding,
  dao,
  newMember,
  unitPrice,
  token,
  desiredUnits = toBN(10)
) => {
  console.log(unitPrice.mul(desiredUnits));
  await onboarding.submitProposal(
    dao.address,
    proposalId,
    newMember,
    token,
    unitPrice.mul(desiredUnits),
    [],
    {
      from: member,
      gasPrice: toBN("0"),
    }
  );
};

const onboardingNewMember = async (
  proposalId,
  dao,
  onboarding,
  voting,
  newMember,
  sponsor,
  unitPrice,
  token,
  desiredUnits = toBN(10)
) => {
  await submitNewMemberProposal(
    proposalId,
    sponsor,
    onboarding,
    dao,
    newMember,
    unitPrice,
    token,
    desiredUnits
  );
  //vote and process it
  await voting.submitVote(dao.address, proposalId, 1, {
    from: sponsor,
    gasPrice: toBN("0"),
  });
  await advanceTime(10000);

  await onboarding.processProposal(dao.address, proposalId, {
    from: sponsor,
    value: unitPrice.mul(desiredUnits),
    gasPrice: toBN("0"),
  });
};

const guildKickProposal = async (
  dao,
  guildkickContract,
  memberToKick,
  sender,
  proposalId
) => {
  await guildkickContract.submitProposal(
    dao.address,
    proposalId,
    memberToKick,
    [],
    {
      from: sender,
      gasPrice: toBN("0"),
    }
  );
};

const submitConfigProposal = async (
  dao,
  proposalId,
  sender,
  configuration,
  voting,
  configs
) => {
  //Submit a new configuration proposal
  await configuration.submitProposal(dao.address, proposalId, configs, [], {
    from: sender,
    gasPrice: toBN("0"),
  });

  await voting.submitVote(dao.address, proposalId, 1, {
    from: sender,
    gasPrice: toBN("0"),
  });

  await advanceTime(10000);
  await configuration.processProposal(dao.address, proposalId, {
    from: sender,
    gasPrice: toBN("0"),
  });
};

const depositToFundingPool = async (
  fundingpoolAdapter,
  dao,
  investor,
  amount,
  token) => {
  // console.log(`FUND_RAISING_WINDOW_BEGIN: ${(await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_BEGIN")))}`);
  // console.log(`FUND_RAISING_WINDOW_END: ${(await dao.getConfiguration(sha3("FUND_RAISING_WINDOW_END")))}`);

  // let blocktimestamp = (await hre.ethers.provider.getBlock("latest")).timestamp;
  // console.log(`current blocktimestamp: ${blocktimestamp}`);

  await token.connect(investor).approve(fundingpoolAdapter.address, amount);
  await fundingpoolAdapter.connect(investor).deposit(dao.address, amount);
  console.log(`
      ${investor.address} deposit ${amount.toString()}
  `);
};

const createDistributeFundsProposal = async (
  dao,
  distributeFundContract,
  requestedFundAmount,
  tradingOffTokenAmount,
  vestingStartTime,
  vestingcliffDuration,
  vestingStepDuration,
  vestingSteps,
  projectTeamAddr,
  projectTokenAddr,
  sender
) => {
  const tx = await distributeFundContract.connect(sender).submitProposal(
    dao.address,
    [projectTeamAddr, projectTokenAddr],
    [requestedFundAmount, tradingOffTokenAmount, vestingStartTime,
      vestingcliffDuration,
      vestingStepDuration,
      vestingSteps],
  );
  const result = await tx.wait();
  const newProposalId = result.events[2].args.proposalId;
  return { proposalId: newProposalId };
};

module.exports = {
  checkLastEvent,
  checkBalance,
  checkSignature,
  submitNewMemberProposal,
  onboardingNewMember,
  guildKickProposal,
  submitConfigProposal,
  isMember,
  encodeDaoInfo,
  depositToFundingPool,
  createDistributeFundsProposal,
};
