# BasedKenToken (BKT)

A complete ERC-20 token implementation for BasedKen with advanced features including minting, burning, pausable functionality, and ownership management.

## Overview

BasedKenToken is a Solidity smart contract implementing the ERC-20 standard with additional enterprise-level features:

- **ERC-20 Compliant**: Full implementation of the ERC-20 standard
- **Mintable**: Owner can mint new tokens
- **Burnable**: Users can burn their own tokens
- **Pausable**: Owner can pause/unpause all transfers
- **Ownable**: Ownership transfer and management
- **18 Decimals**: Standard token decimal precision
- **Security**: OpenZeppelin Contracts used for security best practices

## Token Details

| Property | Value |
|----------|-------|
| Name | BasedKenToken |
| Symbol | BKT |
| Decimals | 18 |
| Type | ERC-20 |
| Standard | OpenZeppelin v5.0+ |

## Features

### 1. Standard ERC-20 Functions
- `transfer()` - Transfer tokens to another address
- `approve()` - Approve spending of tokens
- `transferFrom()` - Transfer tokens from approved address
- `balanceOf()` - Check token balance
- `allowance()` - Check approved spending amount
- `totalSupply()` - Get total token supply

### 2. Enhanced Approval Functions
- `increaseAllowance()` - Safely increase spending approval
- `decreaseAllowance()` - Safely decrease spending approval

### 3. Minting & Burning
- `mint()` - Create new tokens (owner only)
- `burn()` - Destroy tokens from caller's balance
- `burnFrom()` - Destroy tokens from another address (owner only, requires approval)

### 4. Pausable Functions
- `pause()` - Pause all token transfers (owner only)
- `unpause()` - Resume token transfers (owner only)
- `paused()` - Check if contract is paused

### 5. Ownership Management
- `owner()` - Get current owner address
- `transferOwnership()` - Transfer ownership to new address
- `renounceOwnership()` - Renounce ownership (address becomes 0x0)

## Getting Started

### Prerequisites

- Node.js v16+
- Hardhat
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/kramu39/BasedKenToken.git
cd BasedKenToken

# Install dependencies
npm install

# Or with yarn
yarn install
```

### Environment Setup

Create a `.env` file in the root directory:

```bash
# RPC URLs
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
BASE_RPC_URL=https://mainnet.base.org

# Private key for deployment (DO NOT SHARE)
PRIVATE_KEY=your_private_key_here

# API Keys
ETHERSCAN_API_KEY=your_etherscan_key_here
COINMARKETCAP_API_KEY=your_coinmarketcap_key_here

# Gas reporting
REPORT_GAS=true
```

### Compilation

```bash
# Compile the contract
npx hardhat compile
```

### Testing

```bash
# Run all tests
npx hardhat test

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test

# Run specific test file
npx hardhat test test/BasedKenToken.test.js

# Run tests with coverage
npx hardhat coverage
```

### Deployment

#### Deploy to Sepolia Testnet

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

#### Deploy to Ethereum Mainnet

```bash
npx hardhat run scripts/deploy.js --network mainnet
```

#### Deploy to Base Chain

```bash
npx hardhat run scripts/deploy.js --network base
```

#### Deploy to All Networks

```bash
npx hardhat run scripts/deploy.js --network all
```

## Contract Interaction

### Using Ethers.js

```javascript
const { ethers } = require("ethers");

// Connect to contract
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// Transfer tokens
await contract.transfer(recipientAddress, ethers.parseEther("100"));

// Check balance
const balance = await contract.balanceOf(userAddress);
console.log(ethers.formatEther(balance));

// Mint tokens (owner only)
await contract.mint(recipientAddress, ethers.parseEther("1000"));

// Burn tokens
await contract.burn(ethers.parseEther("50"));

// Approve spending
await contract.approve(spenderAddress, ethers.parseEther("100"));

// Pause transfers (owner only)
await contract.pause();
```

### Using Web3.js

```javascript
const Web3 = require("web3");

const web3 = new Web3(RPC_URL);
const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

// Transfer tokens
const tx = {
  from: senderAddress,
  to: CONTRACT_ADDRESS,
  data: contract.methods
    .transfer(recipientAddress, web3.utils.toWei("100", "ether"))
    .encodeABI(),
};

await web3.eth.sendTransaction(tx);
```

## Test Suite

The project includes comprehensive tests covering:

- ✅ Deployment and initialization
- ✅ ERC-20 transfer functionality
- ✅ Approval and transferFrom operations
- ✅ Minting and burning
- ✅ Pause/unpause functionality
- ✅ Ownership transfer
- ✅ Balance and supply queries
- ✅ Edge cases and security scenarios
- ✅ Event emissions

### Running Tests

```bash
# Run all tests
npm test

# Run with verbose output
npm test -- --verbose

# Run with gas reporter
REPORT_GAS=true npm test

# Generate coverage report
npm run coverage
```

## Security Considerations

1. **OpenZeppelin Contracts**: Uses audited OpenZeppelin v5.0+ contracts
2. **Pausable**: Can pause all transfers in case of emergency
3. **Ownership**: Controlled access to sensitive functions
4. **No Ether Acceptance**: Contract rejects accidental Ether transfers
5. **Event Logging**: All important state changes emit events

### Audit Recommendations

Before mainnet deployment:
- [ ] Get professional smart contract audit
- [ ] Run static analysis tools (Slither, MythX)
- [ ] Conduct thorough testing
- [ ] Review gas optimization
- [ ] Set up monitoring and alerts

## File Structure

```
BasedKenToken/
├── contracts/
│   └── BasedKenToken.sol       # Main token contract
├── scripts/
│   ├── deploy.js               # Deployment script
│   └── deploy.sol              # Solidity deployment contract
├── test/
│   └── BasedKenToken.test.js   # Comprehensive test suite
├── hardhat.config.js           # Hardhat configuration
├── package.json                # Project dependencies
└── README.md                   # This file
```

## Deployment History

| Network | Address | Status | Date |
|---------|---------|--------|------|
| Sepolia | TBD | Not Deployed | - |
| Ethereum | TBD | Not Deployed | - |
| Base | TBD | Not Deployed | - |

## Functions Reference

### View Functions

```solidity
function name() public view returns (string memory)
function symbol() public view returns (string memory)
function decimals() public view returns (uint8)
function totalSupply() public view returns (uint256)
function balanceOf(address account) public view returns (uint256)
function allowance(address owner, address spender) public view returns (uint256)
function owner() public view returns (address)
function paused() public view returns (bool)
```

### State-Changing Functions

```solidity
// Transfers
function transfer(address to, uint256 amount) public returns (bool)
function transferFrom(address from, address to, uint256 amount) public returns (bool)

// Approvals
function approve(address spender, uint256 amount) public returns (bool)
function increaseAllowance(address spender, uint256 addedValue) public returns (bool)
function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool)

// Minting & Burning
function mint(address to, uint256 amount) public onlyOwner
function burn(uint256 amount) public
function burnFrom(address account, uint256 amount) public onlyOwner

// Pause/Unpause
function pause() public onlyOwner
function unpause() public onlyOwner

// Ownership
function transferOwnership(address newOwner) public onlyOwner
function renounceOwnership() public onlyOwner
```

## Events

```solidity
event Transfer(address indexed from, address indexed to, uint256 value)
event Approval(address indexed owner, address indexed spender, uint256 value)
event Paused(address indexed account)
event Unpaused(address indexed account)
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```

## Gas Optimization

The contract is optimized for:
- Efficient storage layout
- Minimal state changes
- Optimized loops and conditions
- Proper use of view/pure functions

### Gas Costs (Approximate)

| Function | Gas Cost |
|----------|----------|
| transfer | ~50,000 |
| approve | ~45,000 |
| mint | ~70,000 |
| burn | ~50,000 |
| pause | ~30,000 |
| transferOwnership | ~30,000 |

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review test cases for examples

## Links

- **GitHub**: https://github.com/kramu39/BasedKenToken
- **Ethereum**: https://ethereum.org/
- **Solidity**: https://soliditylang.org/
- **OpenZeppelin**: https://docs.openzeppelin.com/

## Disclaimer

This code is provided as-is. While we've done our best to ensure security and functionality, deploying smart contracts to a blockchain is a serious decision. Always:

1. Get a professional audit before mainnet deployment
2. Test thoroughly on testnet first
3. Use hardware wallets for private keys
4. Keep private keys secure
5. Monitor contract activity after deployment

## Changelog

### Version 1.0.0 (2026-01-03)
- Initial release
- Complete ERC-20 implementation
- Minting and burning functionality
- Pausable transfers
- Comprehensive test suite
- Full documentation

---

**Made with ❤️ for the BasedKen community**
