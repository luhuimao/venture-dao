import { deployDefaultDao, takeChainSnapshot, revertChainSnapshot, proposalIdGenerator, expect, expectRevert, web3 } from "../utils/hh-util";
import { getOwnerPrivateKey } from '../.privatekey';
const hre = require("hardhat");
const {
    toBN,
    toWei,
    fromUtf8,
    fromAscii,
    unitPrice,
    UNITS,
    ETH_TOKEN,
    sha3,
    numberOfUnits,
    maximumChunks,
    maxAmount,
    maxUnits,
    ZERO_ADDRESS
} = require("../utils/contract-util");
const {
    contracts: allContractConfigs,
} = require("../migrations/configs/test.config");
const { ContractType } = require("../migrations/configs/contracts.config");

const daoFactoryAddress = "";
const daoAddress = "0xD3450206C0ecB016C7A9359Dd7B1899D0Fe147B6";

const deployGPVotingContract = async () => {
    const GPVotingContract = await hre.ethers.getContractFactory("GPVotingContract");
    const gPVotingContract = await Greeter.deploy();

    await gPVotingContract.deployed();

    console.log("GPVotingContract deployed to:", gPVotingContract.address);
}

const configureExtensionAccess = async (contracts, extension) => {
    log("configure Extension Access ...");
    const withAccess = Object.values(contracts).reduce((accessRequired, c) => {
        const configs = c.configs;
        console.log(`adapter name: ${configs.name}`);
        accessRequired.push(
            extension.configs.buildAclFlag(c.instance.address, configs.acls)
        );
        return accessRequired;
    }, []);
    if (withAccess.length > 0)
        await daoFactory.instance.configureExtension(
            dao.address,
            extension.address,
            withAccess
        );
    log("end configure Extension Access ...");

};

const configAdapter = async (daoFactory, allContractConfigs) => {
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
        await daoFactory.instance.addAdapters(dao.address, contractsWithAccess);
    };
    const configureExtensionAccess = async (contracts, extension) => {
        log("configure Extension Access ...");
        const withAccess = Object.values(contracts).reduce((accessRequired, c) => {
            const configs = c.configs;
            console.log(`adapter name: ${configs.name}`);
            accessRequired.push(
                extension.configs.buildAclFlag(c.instance.address, configs.acls)
            );
            return accessRequired;
        }, []);
        if (withAccess.length > 0)
            await daoFactory.configureExtension(
                dao.address,
                extension.address,
                withAccess
            );
        log("end configure Extension Access ...");

    };
    const configureExtensionAccess = async (contracts, extension) => {
        log("configure Extension Access ...");
        const withAccess = Object.values(contracts).reduce((accessRequired, c) => {
            const configs = c.configs;
            console.log(`adapter name: ${configs.name}`);
            accessRequired.push(
                extension.configs.buildAclFlag(c.instance.address, configs.acls)
            );
            return accessRequired;
        }, []);
        if (withAccess.length > 0)
            await daoFactory.instance.configureExtension(
                dao.address,
                extension.address,
                withAccess
            );
        log("end configure Extension Access ...");

    };
    log("configure adapters ...");
    await configureAdaptersWithDAOAccess();
    await configureAdaptersWithDAOParameters();
    await Object.values(extensions)
        .filter((targetExtension) => targetExtension.configs.enabled)
        .filter((targetExtension) => !targetExtension.configs.skipAutoDeploy)
        .reduce((p, targetExtension) => {
            // Filters the enabled adapters that have access to the targetExtension
            const contracts = Object.values(allContractConfigs)
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
                        `Error while configuring adapters access to extension ${extensions.configs.name} `,
                        e
                    );
                    throw e;
                });
        }, Promise.resolve());
}

(async () => { })();