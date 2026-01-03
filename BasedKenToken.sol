// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title BasedKenToken
 * @dev Complete ERC-20 token contract implementation for BasedKenToken (BKT)
 * @notice This contract implements the ERC-20 standard with additional features
 */

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IERC20Metadata is IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

/**
 * @dev Implementation of the ERC-20 standard token
 */
contract BasedKenToken is IERC20, IERC20Metadata {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;
    string private _name = "BasedKenToken";
    string private _symbol = "BKT";
    uint8 private _decimals = 18;

    address public owner;
    bool private _paused;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Paused(address indexed account);
    event Unpaused(address indexed account);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    modifier whenNotPaused() {
        require(!_paused, "Token transfer while paused");
        _;
    }

    constructor(uint256 initialSupply) {
        owner = msg.sender;
        _paused = false;
        _mint(msg.sender, initialSupply * 10 ** uint256(_decimals));
    }

    /**
     * @dev Returns the name of the token
     */
    function name() public view override returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token
     */
    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used by the token
     */
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Returns the total supply of the token
     */
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Returns the balance of a specific account
     */
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev Returns the amount of tokens approved for spending
     */
    function allowance(address _owner, address spender) public view override returns (uint256) {
        return _allowances[_owner][spender];
    }

    /**
     * @dev Transfer tokens to a recipient
     */
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    /**
     * @dev Approve a spender to spend tokens on behalf of the owner
     */
    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another
     */
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "Insufficient allowance");
        
        _approve(from, msg.sender, currentAllowance - amount);
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Increase the allowance of a spender
     */
    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _approve(msg.sender, spender, _allowances[msg.sender][spender] + addedValue);
        return true;
    }

    /**
     * @dev Decrease the allowance of a spender
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        uint256 currentAllowance = _allowances[msg.sender][spender];
        require(currentAllowance >= subtractedValue, "Decreased allowance below zero");
        
        _approve(msg.sender, spender, currentAllowance - subtractedValue);
        return true;
    }

    /**
     * @dev Mint new tokens (only owner)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from caller's balance
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Burn tokens from a specific address (only owner)
     */
    function burnFrom(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }

    /**
     * @dev Pause token transfers (only owner)
     */
    function pause() public onlyOwner {
        _paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @dev Unpause token transfers (only owner)
     */
    function unpause() public onlyOwner {
        _paused = false;
        emit Unpaused(msg.sender);
    }

    /**
     * @dev Check if token is paused
     */
    function isPaused() public view returns (bool) {
        return _paused;
    }

    /**
     * @dev Transfer ownership to a new address
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    /**
     * @dev Internal function to transfer tokens
     */
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        require(amount > 0, "Transfer amount must be greater than zero");
        require(_balances[from] >= amount, "Insufficient balance");

        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    /**
     * @dev Internal function to approve tokens
     */
    function _approve(address _owner, address spender, uint256 amount) internal {
        require(_owner != address(0), "Approve from zero address");
        require(spender != address(0), "Approve to zero address");

        _allowances[_owner][spender] = amount;
        emit Approval(_owner, spender, amount);
    }

    /**
     * @dev Internal function to mint tokens
     */
    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "Mint to zero address");
        require(amount > 0, "Mint amount must be greater than zero");

        _totalSupply += amount;
        _balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    /**
     * @dev Internal function to burn tokens
     */
    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "Burn from zero address");
        require(amount > 0, "Burn amount must be greater than zero");
        require(_balances[account] >= amount, "Burn amount exceeds balance");

        _balances[account] -= amount;
        _totalSupply -= amount;
        emit Transfer(account, address(0), amount);
    }

    /**
     * @dev Fallback function - rejects ether
     */
    receive() external payable {
        revert("BasedKenToken does not accept Ether");
    }

    fallback() external payable {
        revert("BasedKenToken does not accept Ether");
    }
}
