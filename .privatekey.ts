import { ethers, network, waffle } from 'hardhat';
export const ACCOUNT_PRIVATE_KEY_BSC_TESTNET = process.env.RINKEBY_TEST_PRIVATE_KEY?.toString();
export const ACCOUNT_PRIVATE_KEY_RINKEBY = process.env.RINKEBY_TEST_PRIVATE_KEY?.toString();
export const ACCOUNT_PRIVATE_KEY_GOERLI = process.env.GOERLI_TEST_PRIVATE_KEY?.toString();
export const XDAI_ACCOUNT_PRIV_KEY = process.env.XDAI_TEST_PRIVATE_KEY?.toString();

export async function getOwnerPrivateKey(name: string): Promise<string> {
    switch (name) {
        case 'xdai':
            return XDAI_ACCOUNT_PRIV_KEY!;
        case 'bsctestnet':
            return ACCOUNT_PRIVATE_KEY_BSC_TESTNET!;
        case 'bsc':
            return ACCOUNT_PRIVATE_KEY_BSC_TESTNET!;
        case 'rinkeby':
            return ACCOUNT_PRIVATE_KEY_RINKEBY!;
        case 'goerli':
            return ACCOUNT_PRIVATE_KEY_GOERLI!;
        case 'mainnet':
            return ACCOUNT_PRIVATE_KEY_RINKEBY!;
        case 'devnet':
            {
                let owner = new ethers.Wallet(ACCOUNT_PRIVATE_KEY_RINKEBY!, ethers.provider);
                const [, user] = await ethers.getSigners();
                let ownerBalance = await owner.getBalance();
                if (ownerBalance.toString() <= '1') {
                    await user.sendTransaction({
                        value: ethers.utils.parseEther('10'),
                        to: owner.address,
                    });
                }
            }
            return ACCOUNT_PRIVATE_KEY_RINKEBY!;
        case 'ganache':
            {
                let owner = new ethers.Wallet(ACCOUNT_PRIVATE_KEY_RINKEBY!, ethers.provider);
                const [, user] = await ethers.getSigners();
                let ownerBalance = await owner.getBalance();
                if (ownerBalance.toString() <= '0') {
                    await user.sendTransaction({
                        value: ethers.utils.parseEther('10'),
                        to: owner.address,
                    });
                }
            }
            return ACCOUNT_PRIVATE_KEY_RINKEBY!;
        case 'localhost':
            {
                let owner = new ethers.Wallet(ACCOUNT_PRIVATE_KEY_RINKEBY!, ethers.provider);
                const [, user] = await ethers.getSigners();
                let ownerBalance = await owner.getBalance();
                if (ownerBalance.toString() <= '0') {
                    await user.sendTransaction({
                        value: ethers.utils.parseEther('10'),
                        to: owner.address,
                    });
                }
            }
            return ACCOUNT_PRIVATE_KEY_RINKEBY!;
        case 'hardhat':
            const [owner] = waffle.provider.getWallets();
            return owner.privateKey;
    }
    return ACCOUNT_PRIVATE_KEY_BSC_TESTNET!;
}
