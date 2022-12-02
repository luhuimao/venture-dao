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
const { entryDao, entryBank } = require("./access-control-util");
const { adaptersIdsMap, extensionsIdsMap } = require("./dao-ids-util");
const { UNITS, LOOT, ZERO_ADDRESS,
    sha3, embedConfigs, waitTx } = require("./contract-util.js");
const { ContractType } = require("../migrations/configs/contracts.config");
const { utils } = require("ethers");
const { web3 } = require("@openzeppelin/test-environment");
const hre = require("hardhat");
import * as config from '../.config';

const isDebug = process.env.DEBUG === "true";
// const log = (...data) => {
//     if (isDebug) console.log(data.join(""));
// };
const log = console.log;
const error = console.error;
// const error = (...data) => {
//     console.error(data.join(""));
// };

/**
 * Deploys a contract based on the contract name defined in the config parameter.
 * If the contract is not found in the options object the deployment reverts with an error.
 */
const deployContract = ({ config, options }) => {
    const contract = options[config.name];
    if (!contract)
        throw new Error(`Contract ${config.name} not found in environment options`);

    if (config.deploymentArgs && config.deploymentArgs.length > 0) {
        const args = config.deploymentArgs.map((argName) => {
            const arg = options[argName];
            if (arg !== null && arg !== undefined) return arg;
            throw new Error(
                `Missing deployment argument <${argName}> for ${config.name}`
            );
        });
        return options.deployFunction(contract, args, options.owner);
    }
    let args;
    return options.deployFunction(contract, args, options.owner);
};

/**
 * Deploys all the contracts defined with Factory type.
 * The contracts must be enabled in the migrations/configs/*.config.ts,
 * and should not be skipped in the auto deploy process.
 * The factory contract must be provided in the options object.
 * If the contract is not found in the options object the deployment reverts with an error.
 */
const createFactories = async ({ options }) => {
    const factories = {};
    const factoryList = Object.values(options.contractConfigs)
        .filter((config) => config.type === ContractType.Factory)
        .filter((config) => config.enabled)
        .filter((config) => !config.skipAutoDeploy);
    log("deploying or reusing ", factoryList.length, " factories...");
    await factoryList.reduce((p, config) => {
        return p
            .then((_) => {
                const factoryContract = options[config.name];
                if (!factoryContract)
                    throw new Error(`Missing factory contract ${config.name}`);

                const extensionConfig = options.contractConfigs.find(
                    (c) => c.id === config.generatesExtensionId
                );
                if (!extensionConfig)
                    throw new Error(
                        `Missing extension config ${config.generatesExtensionId}`
                    );

                const extensionContract = options[extensionConfig.name];
                if (!extensionContract)
                    throw new Error(`Missing extension contract ${extensionConfig.name}`);

                return options
                    .deployFunction(factoryContract, [extensionContract], options.owner)
                    .catch((e) => {
                        error(`Failed factory deployment [${config.name}].`, e);
                        throw e;
                    });
            })
            .then((factory) => (factories[factory.configs.alias] = factory));
    }, Promise.resolve());

    return factories;
};

/**
 * Deploys all the contracts defined with Extension type.
 * The contracts must be enabled in the migrations/configs/*.config.ts,
 * and should not be skipped in the auto deploy process.
 * The extension contract must be provided in the options object.
 * If the contract is not found in the options object the deployment reverts with an error.
 * In order to deploy the extension it uses the factory contract of each extension,
 * so the factories must be deployed first.
 */
const createExtensions = async ({ dao, factories, options }) => {
    const extensions = {};
    log("create extensions ...");
    const createExtension = async ({ dao, factory, options }) => {
        log("create extension ", factory.configs.alias);
        const factoryConfigs = factory.configs;
        const extensionConfigs = options.contractConfigs.find(
            (c) => c.id === factoryConfigs.generatesExtensionId
        );
        if (!extensionConfigs)
            throw new Error(
                `Missing extension configuration <generatesExtensionId> for in ${factoryConfigs.name} configs`
            );
        console.log("extensionConfigs: ", extensionConfigs.name);
        let extensionAddress = config.getExtensionAddressByName(extensionConfigs.name, hre.network.name);
        if (extensionAddress) {
            extensionAddress = await factory.instance.getExtensionAddress(
                options.daoAddress
            );
            let retryCount = 0;
            while (extensionAddress === ZERO_ADDRESS) {
                if (retryCount >= 50) break;
                extensionAddress = await factory.instance.getExtensionAddress(
                    options.daoAddress
                );
                retryCount++;
            }
            console.log(`reuse ${extensionConfigs.name} address: ${extensionAddress}`);
        } else {
            if (
                factoryConfigs.deploymentArgs &&
                factoryConfigs.deploymentArgs.length > 0
            ) {
                const args = factoryConfigs.deploymentArgs.map((argName) => {
                    const arg = options[argName];
                    if (arg !== null && arg !== undefined) return arg;
                    throw new Error(
                        `Missing deployment argument <${argName}> in ${factoryConfigs.name}.create`
                    );
                });
                await factory.instance.create(...args);
            } else {
                await factory.instance.create();
            }

        }
        extensionAddress = await factory.instance.getExtensionAddress(
            options.daoAddress
        );
        let retryCount = 0;
        while (extensionAddress === ZERO_ADDRESS) {
            if (retryCount >= 200) break;
            extensionAddress = await factory.instance.getExtensionAddress(
                options.daoAddress
            );
            retryCount++;
        }
        if (extensionAddress === ZERO_ADDRESS) throw Error("Invalid extension address");

        const extensionContract = options[extensionConfigs.name];
        if (!extensionContract)
            throw new Error(
                `Extension contract not found for ${extensionConfigs.name}`
            );
        const newExtension = embedConfigs(
            (await hre.ethers.getContractFactory(extensionContract.contractName)).attach(extensionAddress),
            extensionContract.contractName,
            options.contractConfigs
        );
        if (!newExtension || !newExtension.configs)
            throw new Error(
                `Unable to embed extension configs for ${extensionConfigs.name}`
            );
        await dao.addExtension(
            sha3(newExtension.configs.id),
            newExtension.address,
            options.owner.address
        );
        log(`${extensionContract.contractName} depoloed address ${newExtension.address}`);

        return newExtension;
    };

    await Object.values(factories).reduce(
        (p, factory) =>
            p
                .then(() =>
                    createExtension({
                        dao,
                        factory,
                        options,
                    })
                )
                .then((extension) => {
                    extensions[extension.configs.alias] = extension;
                })
                .catch((e) => {
                    error(`Failed extension deployment ${factory.configs.name}`, e);
                    throw e;
                }),
        Promise.resolve()
    );
    return extensions;
};

/**
 * Deploys all the contracts defined with Adapter type.
 * The contracts must be enabled in the migrations/configs/*.config.ts,
 * and should not be skipped in the auto deploy process.
 * The adapter contract must be provided in the options object.
 * If the contract is not found in the options object the deployment reverts with an error.
 */
const createAdapters = async ({ options }) => {
    const adapters = {};
    const adapterList = Object.values(options.contractConfigs)
        .filter((config) => config.type === ContractType.Adapter)
        .filter((config) => config.enabled)
        .filter((config) => !config.skipAutoDeploy);
    log("deploying or re-using ", adapterList.length, " adapters...");
    await adapterList.reduce(
        (p, config) =>
            p
                .then(() => deployContract({ config, options }))
                .then((adapter) => {
                    adapters[adapter.configs.alias] = adapter;
                })
                .catch((e) => {
                    error(`Error while creating adapter ${config.name}.`, e);
                    throw e;
                }),
        Promise.resolve()
    );

    return adapters;
};

/**
 * Deploys all the utility contracts defined with Util type.
 * The contracts must be enabled in the migrations/configs/*.config.ts,
 * and should not be skipped in the auto deploy process.
 * The util contract must be provided in the options object.
 * If the contract is not found in the options object the deployment reverts with an error.
 */
const createUtilContracts = async ({ options }) => {
    const utilContracts = {};

    await Object.values(options.contractConfigs)
        .filter((config) => config.type === ContractType.Util)
        .filter((config) => config.enabled)
        .filter((config) => !config.skipAutoDeploy)
        .reduce(
            (p, config) =>
                p
                    .then(() => deployContract({ config, options }))
                    .then((utilContract) => {
                        utilContracts[utilContract.configs.alias] = utilContract;
                    })
                    .catch((e) => {
                        error(`Error while creating util contract ${config.name}`, e);
                        throw e;
                    }),
            Promise.resolve()
        );
    return utilContracts;
};

/**
 * Deploys all the test contracts defined with Test type if flag `deployTestTokens`
 * is enabled in the options. The contracts must be enabled in the migrations/configs/*.config.ts,
 * and should not be skipped in the auto deploy process.
 * The test contract must be provided in the options object.
 * If the contract is not found in the options object the deployment reverts with an error.
 */
const createTestContracts = async ({ options }) => {
    const testContracts = {};

    if (!options.deployTestTokens) return testContracts;

    await Object.values(options.contractConfigs)
        .filter((config) => config.type === ContractType.Test)
        .filter((config) => config.enabled)
        .filter((config) => !config.skipAutoDeploy)
        .reduce(
            (p, config) =>
                p
                    .then(() => deployContract({ config, options }))
                    .then((testContract) => {
                        testContracts[testContract.configs.alias] = testContract;
                    })
                    .catch((e) => {
                        error(`Error while creating test contract ${config.name}`, e);
                        throw e;
                    }),
            Promise.resolve()
        );
    return testContracts;
};

/**
 * Creates the governance config roles in the DAO Registry based on the contract configs.governanceRoles.
 */
const createGovernanceRoles = async ({ options, dao, adapters }) => {
    const readConfigValue = (configName, contractName) => {
        const configValue = options[configName];
        if (!configValue)
            throw new Error(
                `Error while creating governance role [${configName}] for ${contractName}`
            );
        return configValue;
    };

    await Object.values(options.contractConfigs)
        .filter((c) => c.enabled)
        .filter((c) => c.governanceRoles)
        .reduce((p, c) => {
            const roles = Object.keys(c.governanceRoles);
            return p.then(() =>
                roles.reduce(
                    (q, role) =>
                        q.then(async () => {
                            const adapter = Object.values(adapters).find(
                                (a) => a.configs.name === c.name
                            );
                            const configKey = sha3(
                                web3.utils.encodePacked(
                                    role.replace("$contractAddress", ""),
                                    // utils.getAddress(adapter.address)
                                    adapter.address
                                )
                            );
                            const configValue = utils.getAddress(
                                readConfigValue(c.governanceRoles[role], c.name)
                            );
                            return await dao.setAddressConfiguration(configKey, configValue, {
                                from: options.owner,
                            });
                        }),
                    Promise.resolve()
                )
            );
        }, Promise.resolve());

    if (options.defaultMemberGovernanceToken) {
        const configKey = sha3(web3.utils.encodePacked("governance.role.default"));
        await dao.setAddressConfiguration(
            configKey,
            utils.getAddress(options.defaultMemberGovernanceToken),
            {
                from: options.owner,
            }
        );
    }
};

const validateContractConfigs = (contractConfigs) => {
    if (!contractConfigs) throw Error(`Missing contract configs`);

    const found = new Map();
    Object.values(contractConfigs)
        .filter(
            (c) =>
                c.type === ContractType.Adapter &&
                c.id !== adaptersIdsMap.VOTING_ADAPTER
        )
        .forEach((c) => {
            const current = found.get(c.id);
            if (current) {
                throw Error(`Duplicate contract Id detected: ${c.id}`);
            }
            found.set(c.id, true);
        });
};

const setDaoConfiguration = async ({ options, dao, testContracts }) => {
    const configKey_FundRaisingTarget = sha3(web3.utils.encodePacked("FUND_RAISING_TARGET"));
    const configKey_FundRaisingMax = sha3(web3.utils.encodePacked("FUND_RAISING_MAX"));
    const configKey_FundRaisingMinInvestmentAmountOfLP = sha3(web3.utils.encodePacked("FUND_RAISING_MIN_INVESTMENT_AMOUNT_OF_LP"));
    const configKey_FundRaisingWindowBegin = sha3(web3.utils.encodePacked("FUND_RAISING_WINDOW_BEGIN"));
    const configKey_FundRaisingWindowEnd = sha3(web3.utils.encodePacked("FUND_RAISING_WINDOW_END"));
    const configKey_FundRaisingLockupPeriod = sha3(web3.utils.encodePacked("FUND_RAISING_LOCKUP_PERIOD"));
    const configKey_FundRaisingRedemption = sha3(web3.utils.encodePacked("FUND_RAISING_REDEMPTION"));
    const configKey_FundRaisingRedemptionPeriod = sha3(web3.utils.encodePacked("FUND_RAISING_REDEMPTION_PERIOD"));
    const configKey_FundRaisingRedemptionDuration = sha3(web3.utils.encodePacked("FUND_RAISING_REDEMPTION_DURATION"));
    const configKey_FundRaisingTerm = sha3(web3.utils.encodePacked("FUND_RAISING_TERM"));
    const configKey_FundStartTime = sha3(web3.utils.encodePacked("FUND_START_TIME"));
    const configKey_FundEndTime = sha3(web3.utils.encodePacked("FUND_END_TIME"));
    const configKey_RewardForProposer = sha3(web3.utils.encodePacked("REWARD_FOR_PROPOSER"));
    const configKey_RewardForGP = sha3(web3.utils.encodePacked("REWARD_FOR_GP"));
    const configKey_MangementFee = sha3(web3.utils.encodePacked("MANAGEMENT_FEE"));
    const configKey_MangementFeePerYear = sha3(web3.utils.encodePacked("MANAGEMENT_FEE_PER_YEAR"));
    const configKey_RedemptionFee = sha3(web3.utils.encodePacked("REDEMPTION_FEE"));
    const configKey_ProtocolFee = sha3(web3.utils.encodePacked("PROTOCOL_FEE"));
    const configKey_ProposalExecuteDuration = sha3(web3.utils.encodePacked("PROPOSAL_EXECUTE_DURATION"));
    const configKey_flexManagementFee = sha3(web3.utils.encodePacked("FLEX_MANAGEMENT_FEE_AMOUNT"));
    const configKey_flexProtocolFee = sha3(web3.utils.encodePacked("FLEX_PROTOCOL_FEE"));

    log("config FLEX_MANAGEMENT_FEE_AMOUNT");
    let tx = await dao.setConfiguration(configKey_flexManagementFee, options.flexManagementFeeRatio);
    await tx.wait(); 
    log("config FLEX_PROTOCOL_FEE");
    tx = await dao.setConfiguration(configKey_flexProtocolFee, options.flexProtocolFeeRatio);
    await tx.wait();

    log("config FUND_RAISING_TARGET");
    tx = await dao.setConfiguration(configKey_FundRaisingTarget, options.fundRaisingTarget);
    await tx.wait();
    log("config FUND_RAISING_MAX");
    tx = await dao.setConfiguration(configKey_FundRaisingMax, options.fundRaisingMax);
    await tx.wait();
    log("config FUND_RAISING_MIN_INVESTMENT_AMOUNT_OF_LP");
    tx = await dao.setConfiguration(configKey_FundRaisingMinInvestmentAmountOfLP, options.fundRaisingMinInvestmentAmountOfLP);
    await tx.wait();
    log("config FUND_RAISING_WINDOW_BEGIN");
    tx = await dao.setConfiguration(configKey_FundRaisingWindowBegin, options.fundRaisingWindowBegin);
    await tx.wait();
    log("config FUND_RAISING_WINDOW_END");
    tx = await dao.setConfiguration(configKey_FundRaisingWindowEnd, options.fundRaisingWindowEnd);
    await tx.wait();
    log("config FUND_RAISING_LOCKUP_PERIOD");
    tx = await dao.setConfiguration(configKey_FundRaisingLockupPeriod, options.fundRaisingLockupPeriod);
    await tx.wait();

    log("config FUND_RAISING_REDEMPTION");
    tx = await dao.setConfiguration(configKey_FundRaisingRedemption, options.fundRaisingRedemption);
    await tx.wait();
    log("config FUND_RAISING_REDEMPTION_PERIOD");
    tx = await dao.setConfiguration(configKey_FundRaisingRedemptionPeriod, options.fundRaisingRedemptionPeriod);
    await tx.wait();
    log("config FUND_RAISING_REDEMPTION_DURATION");
    tx = await dao.setConfiguration(configKey_FundRaisingRedemptionDuration, options.fundRaisingRedemptionDuration);
    await tx.wait();
    log("config FUND_RAISING_TERM");
    tx = await dao.setConfiguration(configKey_FundRaisingTerm, options.fundRaisingTerm);
    await tx.wait();
    log("config FUND_START_TIME");
    tx = await dao.setConfiguration(configKey_FundStartTime, options.fundStartTime);
    await tx.wait();
    log("config FUND_END_TIME");
    tx = await dao.setConfiguration(configKey_FundEndTime, options.fundEndTime);
    await tx.wait();
    log("config REWARD_FOR_PROPOSER");
    tx = await dao.setConfiguration(configKey_RewardForProposer, options.rewardForProposer);
    await tx.wait();
    log("config REWARD_FOR_GP");
    tx = await dao.setConfiguration(configKey_RewardForGP, options.rewardForGP);
    await tx.wait();
    log("config MANAGEMENT_FEE");
    tx = await dao.setConfiguration(configKey_MangementFee, options.managementFee);
    await tx.wait();
    log("config MANAGEMENT_FEE_PER_YEAR");
    tx = await dao.setConfiguration(configKey_MangementFeePerYear, options.managementFeePerYear);
    await tx.wait();
    log("config REDEMPTION_FEE");
    tx = await dao.setConfiguration(configKey_RedemptionFee, options.redemptionFee);
    await tx.wait();
    log("config PROTOCOL_FEE");
    tx = await dao.setConfiguration(configKey_ProtocolFee, options.protocolFee);
    await tx.wait();
    log("config PROPOSAL_EXECUTE_DURATION");
    tx = await dao.setConfiguration(configKey_ProposalExecuteDuration, options.proposalExecuteDurantion);
    await tx.wait();


};
const setDaoAddressConfiguration = async ({ options, dao, testContracts }) => {
    const configKey_DaoSquareAddress = sha3(web3.utils.encodePacked("DAO_SQUARE_ADDRESS"));
    const configKey_GPAddress = sha3(web3.utils.encodePacked("GP_ADDRESS"));
    const configKey_FundRaisingCurrencyAddress = sha3(web3.utils.encodePacked("FUND_RAISING_CURRENCY_ADDRESS"));

    const configKey_FlexProtocolFeeReceiveAddress = sha3(web3.utils.encodePacked("FLEX_PROTOCOL_FEE_RECEIVE_ADDRESS"));
    const configKey_FlexManagementFeeReceiveAddress = sha3(web3.utils.encodePacked("FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS"));


    log("config DAO_SQUARE_ADDRESS");
    let tx = await dao.setAddressConfiguration(configKey_DaoSquareAddress, options.daoSquareAddress);
    await tx.wait();
    log("config GP_ADDRESS");
    tx = await dao.setAddressConfiguration(configKey_GPAddress, options.gpAddress);
    await tx.wait();
    log("config FUND_RAISING_CURRENCY_ADDRESS");
    tx = await dao.setAddressConfiguration(configKey_FundRaisingCurrencyAddress,
        options.fundRaisingCurrencyAddress === undefined ? testContracts.testToken1.instance.address : options.fundRaisingCurrencyAddress);
    await tx.wait();

    log("config FLEX_PROTOCOL_FEE_RECEIVE_ADDRESS");
    tx = await dao.setAddressConfiguration(configKey_FlexProtocolFeeReceiveAddress, options.daoSquareAddress);
    await tx.wait();
    log("config FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS");
    tx = await dao.setAddressConfiguration(configKey_FlexManagementFeeReceiveAddress, options.gpAddress);
    await tx.wait();
};

/**
 * Deploys all the contracts defined in the migrations/configs/*.config.ts.
 * The contracts must be enabled in the migrations/configs/*.config.ts,
 * and should not be skipped in the auto deploy process.
 * Each one of the contracts must be provided in the options object.
 * If the contract is not found in the options object the deployment reverts with an error.
 * It also configures the DAO with the proper access, and configuration parameters for all
 * adapters and extensions.
 *
 * The Offchain voting is deployed only if it is required via options.offchainVoting parameter.
 *
 * All the deployed contracts will be returned in a map with the aliases defined in the
 * migrations/configs/*.config.ts.
 */
const deployDao = async (options) => {
    log("validateContractConfigs...");
    validateContractConfigs(options.contractConfigs);
    log("cloneDao...");
    const { dao, daoFactory } = await cloneDao({
        ...options,
        name: options.daoName || "test-dao",
    });
    options = {
        ...options,
        daoAddress: dao.address,
        unitTokenToMint: UNITS,
        lootTokenToMint: LOOT,
    };
    const factories = await createFactories({ options });
    const extensions = await createExtensions({ dao, factories, options });
    const adapters = await createAdapters({
        dao,
        daoFactory,
        extensions,
        options,
    });
    // await createGovernanceRoles({ options, dao, adapters });

    await configureDao({
        owner: options.owner.address,
        dao,
        daoFactory,
        extensions,
        adapters,
        options,
    });

    const votingHelpers = await configureOffchainVoting({
        ...options,
        dao,
        daoFactory,
        extensions,
    });

    // If the offchain contract was created, set it to the adapters map using the alias
    if (votingHelpers.offchainVoting) {
        adapters[votingHelpers.offchainVoting.configs.alias] =
            votingHelpers.offchainVoting;
    }

    // deploy utility contracts
    const utilContracts = await createUtilContracts({ options });

    // deploy test token contracts for testing convenience
    const testContracts = await createTestContracts({ options });

    // const configKey = sha3(web3.utils.encodePacked("rice.token.address"));
    // const configValue = testContracts.testRiceToken.instance.address;
    // log('set Address Configuration ...');
    // let tx = await dao.setAddressConfiguration(configKey, configValue);
    // await tx.wait();
    // log('end set Address Configuration ...');

    //set rice address 
    // log("fundingpoolAdapter set rice address");
    // tx = await adapters.fundingpoolAdapter.instance.setRiceTokenAddress(dao.address, testContracts.testRiceToken.instance.address);
    // await tx.wait();
    console.log("network name", hre.network.name);
    if (hre.network.name == "hardhat") {
        await setDaoConfiguration({ options, dao, testContracts });
        await setDaoAddressConfiguration({ options, dao, testContracts });
    }

    // log("registerPotentialNewToken to funding pool");
    // tx = await adapters.fundingpoolAdapter.instance.registerPotentialNewToken(dao.address, testContracts.testToken1.instance.address);
    // await tx.wait();


    // if (options.finalize) {
    //     await dao.finalizeDao({ from: options.owner.address });
    // }

    return {
        dao: dao,
        adapters: adapters,
        extensions: extensions,
        testContracts: testContracts,
        utilContracts: utilContracts,
        votingHelpers: votingHelpers,
        factories: { ...factories, daoFactory },
    };
};

/**
 * Creates an instance of the DAO based of the DaoFactory contract.
 * Returns the new DAO instance, and dao name.
 */
const cloneDao = async ({
    owner,
    creator,
    deployFunction,
    DaoRegistry,
    DaoFactory,
    name,
}) => {
    log("deploy daoFactory...");
    let daoFactory = await deployFunction(DaoFactory, [DaoRegistry], owner);
    log("createDao...");
    const daoAddress = config.getDaoAddressByNetwork(hre.network.name);
    let newDao;
    if (daoAddress) {
        console.log("reuse dao address: ", daoAddress);
        newDao = (await hre.ethers.getContractFactory('DaoRegistry')).attach(daoAddress)
    } else {
        await daoFactory.instance.createDao(name, creator ? creator : owner.address);
        let _address = await daoFactory.instance.getDaoAddress(name);
        let retryCount = 0;
        while (_address === ZERO_ADDRESS) {
            if (retryCount >= 200) break;
            _address = await daoFactory.instance.getDaoAddress(name);
            retryCount++;
        }
        if (_address === ZERO_ADDRESS) throw Error("Invalid dao address");

        log(`dao ${name} deployed address ${_address}`);
        newDao = (await hre.ethers.getContractFactory('DaoRegistry')).attach(_address)
    }

    // let newDao = await DaoRegistry.at(_address);
    return { dao: newDao, daoFactory, daoName: name };
};

/**
 * Configures an instance of the DAO to work with the provided factories, extension, and adapters.
 * It ensures that every extension and adapter has the correct ACL Flags enabled to be able to communicate
 * with the DAO instance.
 * Adapters can communicate with the DAO registry, with different extensions or even other adapters.
 * Extensions can communicate with the DAO registry, other extensions and adapters.
 */
const configureDao = async ({
    owner,
    dao,
    daoFactory,
    extensions,
    adapters,
    options,
}) => {
    log("configure new dao ...");
    const configureAdaptersWithDAOAccess = async () => {
        log("configure adapters with access");
        const adaptersWithAccess = Object.values(adapters)
            .filter((a) => a.configs.enabled)
            .filter((a) => !a.configs.skipAutoDeploy)
            .filter((a) => a.configs.acls.dao)
            .reduce((withAccess, a) => {
                const configs = a.configs;
                withAccess.push(entryDao(configs.id, a.instance.address, configs.acls));
                return withAccess;
            }, []);

        // If an extension needs access to other extension,
        // the extension needs to be added as an adapter to the DAO,
        // but without any ACL flag enabled.
        const contractsWithAccess = Object.values(extensions)
            .filter((e) => e.configs.enabled)
            .filter((a) => !a.configs.skipAutoDeploy)
            .filter((e) => Object.keys(e.configs.acls.extensions).length > 0)
            .reduce((withAccess, e) => {
                const configs = e.configs;
                const v = entryDao(configs.id, e.address, configs.acls);
                withAccess.push(v);
                return withAccess;
            }, adaptersWithAccess);
        const tx = await daoFactory.instance.addAdapters(dao.address, contractsWithAccess);
        await tx.wait();
        log("configure adapters with access FINISHED!");
    };

    const configureAdaptersWithDAOParameters = async () => {
        log("configure Adapters With DAO Parameters ...");
        const readConfigValue = (configName, contractName) => {
            // 1st check for configs that are using extension addresses
            if (Object.values(extensionsIdsMap).includes(configName)) {
                const extension = Object.values(extensions).find(
                    (e) => e.configs.id === configName
                );
                if (!extension || !extension.address)
                    throw new Error(
                        `Error while configuring dao parameter[${configName}]for ${contractName}`
                    );
                return extension.address;
            }
            // 2nd lookup for configs in the options object
            const configValue = options[configName];
            if (configValue === undefined)
                throw new Error(
                    `Error while configuring dao parameter[${configName}]for ${contractName}`
                );
            return configValue;
        };

        const adapterList = Object.values(adapters)
            .filter((a) => a.configs.enabled)
            .filter((a) => !a.configs.skipAutoDeploy)
            .filter((a) => a.configs.daoConfigs && a.configs.daoConfigs.length > 0);

        await adapterList.reduce(async (p, adapter) => {
            const contractConfigs = adapter.configs;
            return await p.then(() =>
                contractConfigs.daoConfigs.reduce(
                    (q, configEntry) =>
                        q.then(async () => {
                            const configValues = configEntry.map((configName) =>
                                readConfigValue(configName, contractConfigs.name)
                            );
                            const p = adapter.instance.configureDao(...configValues).catch((err) => {
                                error(
                                    `Error while configuring dao with contract ${contractConfigs.name}. `,
                                    err
                                );
                                throw err;
                            });
                            return await waitTx(p);
                        }),
                    Promise.resolve()
                )
            );
        }, Promise.resolve());
        log("configure Adapters With DAO Parameters ... FINISHED!");

    };

    const configureExtensionAccess = async (contracts, extension) => {
        log("configure Extension Access ...");
        const withAccess = Object.values(contracts).reduce((accessRequired, c) => {
            const configs = c.configs;
            console.log(`extension/adapter name: ${configs.name}`);
            accessRequired.push(
                extension.configs.buildAclFlag(configs.type == ContractType.Extension ? c.address : c.instance.address, configs.acls)
            );
            return accessRequired;
        }, []);
        if (withAccess.length > 0) {
            const tx = await daoFactory.instance.configureExtension(
                dao.address,
                extension.address,
                withAccess
            );
            await tx.wait();
        }
        log("end configure Extension Access ...");

    };

    /**
     * Configures all the adapters that need access to the DAO and each enabled extension
     */
    const configureAdapters = async () => {
        log("configure adapters ...");
        await configureAdaptersWithDAOAccess();
        await configureAdaptersWithDAOParameters();
        await Object.values(extensions)
            .filter((targetExtension) => targetExtension.configs.enabled)
            .filter((targetExtension) => !targetExtension.configs.skipAutoDeploy)
            .reduce((p, targetExtension) => {
                // Filters the enabled adapters that have access to the targetExtension
                const contracts = Object.values(adapters)
                    .filter((a) => a.configs.enabled)
                    .filter((a) => !a.configs.skipAutoDeploy)
                    .filter((a) =>
                        // The adapters must have at least 1 ACL flag defined to access the targetExtension
                        Object.keys(a.configs.acls.extensions).some(
                            (extId) => extId === targetExtension.configs.id
                        )
                    );
                return p
                    .then(() => configureExtensionAccess(contracts, targetExtension))
                    .catch((e) => {
                        error(
                            `Error while configuring adapters access to extension ${e} `,
                            e
                        );
                        throw e;
                    });
            }, Promise.resolve());
        log("configure adapters ...FINISHED!");

    };

    /**
     * Configures all the extensions that need access to
     * other enabled extensions
     */
    const configureExtensions = async () => {
        log("configure extensions ...");
        await Object.values(extensions)
            .filter((targetExtension) => targetExtension.configs.enabled)
            .reduce((p, targetExtension) => {
                // Filters the enabled extensions that have access to the targetExtension
                const contracts = Object.values(extensions)
                    .filter((e) => e.configs.enabled)
                    .filter((e) => e.configs.id !== targetExtension.configs.id)
                    .filter((e) =>
                        // The other extensions must have at least 1 ACL flag defined to access the targetExtension
                        Object.keys(e.configs.acls.extensions).some(
                            (extId) => extId === targetExtension.configs.id
                        )
                    );

                return p
                    .then(() => configureExtensionAccess(contracts, targetExtension))
                    .catch((e) => {
                        error(
                            `Error while configuring extensions access to extension ${e} `
                        );
                        throw e;
                    });
            }, Promise.resolve());
        log("configure extensions ... FINISHED!");

    };

    await configureAdapters();
    await configureExtensions();
};

/**
 * If the flag `flag options.offchainVoting` is enabled, it deploys and configures all the
 * contracts required to enable the Offchain voting adapter.
 */
const configureOffchainVoting = async ({
    dao,
    daoFactory,
    offchainVoting,
    owner,
    offchainAdmin,
    votingPeriod,
    gracePeriod,
    SnapshotProposalContract,
    KickBadReporterAdapter,
    OffchainVotingContract,
    OffchainVotingHashContract,
    OffchainVotingHelperContract,
    deployFunction,
    extensions,
}) => {
    const votingHelpers = {
        snapshotProposalContract: null,
        handleBadReporterAdapter: null,
        offchainVoting: null,
    };

    // Offchain voting is disabled
    if (!offchainVoting) return votingHelpers;

    const currentVotingAdapterAddress = await dao.getAdapterAddress(
        sha3(adaptersIdsMap.VOTING_ADAPTER)
    );

    const snapshotProposalContract = await deployFunction(
        SnapshotProposalContract
    );

    const offchainVotingHashContract = await deployFunction(
        OffchainVotingHashContract,
        [snapshotProposalContract.address]
    );

    const offchainVotingHelper = await deployFunction(
        OffchainVotingHelperContract,
        [offchainVotingHashContract.address]
    );

    const handleBadReporterAdapter = await deployFunction(KickBadReporterAdapter);
    const offchainVotingContract = await deployFunction(OffchainVotingContract, [
        currentVotingAdapterAddress,
        offchainVotingHashContract.address,
        offchainVotingHelper.address,
        snapshotProposalContract.address,
        handleBadReporterAdapter.address,
        offchainAdmin,
    ]);

    await daoFactory.updateAdapter(
        dao.address,
        entryDao(
            offchainVotingContract.configs.id,
            offchainVotingContract.address,
            offchainVotingContract.configs.acls
        ),
        {
            from: owner,
        }
    );

    await dao.setAclToExtensionForAdapter(
        extensions.bankExt.address,
        offchainVotingContract.address,
        entryBank(
            offchainVotingContract.address,
            offchainVotingContract.configs.acls
        ).flags,
        { from: owner }
    );

    await offchainVotingContract.configureDao(
        dao.address,
        votingPeriod,
        gracePeriod,
        10,
        { from: owner }
    );

    votingHelpers.offchainVoting = offchainVotingContract;
    votingHelpers.handleBadReporterAdapter = handleBadReporterAdapter;
    votingHelpers.snapshotProposalContract = snapshotProposalContract;

    return votingHelpers;
};

const networks = [
    {
        name: "ganache",
        chainId: 1337,
    },
    {
        name: "rinkeby",
        chainId: 4,
    },
    {
        name: "rinkeby-fork",
        chainId: 4,
    },
    {
        name: "goerli",
        chainId: 5,
    },
    {
        name: "test",
        chainId: 1,
    },
    {
        name: "coverage",
        chainId: 1,
    },
    {
        name: "mainnet",
        chainId: 1,
    },
    {
        name: "harmony",
        chainId: 1666600000,
    },
    {
        name: "harmonytest",
        chainId: 1666700000,
    },
];

const getNetworkDetails = (name) => {
    return networks.find((n) => n.name === name);
};

module.exports = {
    createFactories,
    createExtensions,
    createAdapters,
    deployDao,
    cloneDao,
    getNetworkDetails,
};
