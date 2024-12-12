const ethers = require('ethers');
const { Pool } = require('@uniswap/v3-sdk');
const { Token } = require('@uniswap/sdk-core');

// ABIs
const UniswapV2RouterABI = [
    "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
    "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)"
];

const ERC20ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)"
];

class UniswapLiquidityProvider {
    constructor(V2Routers, rpcUrl, privateKey) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        
        
        this.v2RouterAddress = V2Routers;
  
       
        this.v2Router = new ethers.Contract(
            this.v2RouterAddress,
            UniswapV2RouterABI,
            this.wallet
        );
    }

    async checkAndApproveToken(tokenAddress, spenderAddress, amount) {
        const token = new ethers.Contract(tokenAddress, ERC20ABI, this.wallet);
        const allowance = await token.allowance(this.wallet.address, spenderAddress);
        if (!allowance) {
            console.error("Allowance not returned from the contract.");
            return;
        }
        
        const allowanceBigNumber = ethers.BigNumber.from(allowance);
        
        if (allowanceBigNumber.lt(amount)) {
            console.log(`Approving token ${tokenAddress}...`);
            const tx = await token.approve(spenderAddress, amount);
            await tx.wait();
            console.log(`Token ${tokenAddress} approved`);
        }
    }

    async addLiquidityV2(tokenA, tokenB, amountA, amountB) {
        try {
           
            const amountAWei = ethers.parseUnits(amountA.toString(), 18);
            const amountBWei = ethers.parseUnits(amountB.toString(), 18);

           
        
            
            const deadline = Math.floor(Date.now() / 1000) + 300; 
            const tx = await this.v2Router.addLiquidityETH(
                tokenB,
                amountBWei,
                0,
                0,
                this.wallet.address,
                deadline,
                {
                    value: amountAWei,
                    gasLimit: 5000000
                }
            );

            const receipt = await tx.wait();
            console.log(receipt)
            return {
                success: true,
                transactionHash: receipt.hash,
            };

        } catch (error) {
            console.error('Error adding V2 liquidity:', error);
            throw error;
        }
    }
}

module.exports = UniswapLiquidityProvider;
