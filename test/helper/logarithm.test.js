const { hardhatArguments } = require("hardhat");
const hre = require("hardhat");

describe("Helper - Logarithm", () => {
    before("deploy contract", async () => {
        const TestMath = await hre.ethers.getContractFactory("TestMath");
        const testMath = await TestMath.deploy();
        await testMath.deployed();
        this.testMath = testMath;
    });

    it("calculate log_2", async () => {
        // 9223372036854775807
        console.log("uint256 to int128", (await this.testMath.fromUInt(hre.ethers.BigNumber.from('9223372036854775806'))).toString());
        const result = await this.testMath.log_2(hre.ethers.BigNumber.from('9223372036854775806'));
        console.log(`log_2(9223372036854775806): ${result}`);
    });
    it("calculate ln", async () => {
        const result = await this.testMath.ln(1);
        console.log(`ln(16): ${result}`);
    });
});