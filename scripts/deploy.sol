// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BasedKenToken.sol";

/**
 * @title BasedKenTokenDeployment
 * @dev Script to deploy BasedKenToken
 */
contract BasedKenTokenDeployment {
    BasedKenToken public token;

    /**
     * @dev Deploy the token with initial supply
     * @param initialSupply The initial supply in whole tokens (will be multiplied by 10^18)
     */
    function deploy(uint256 initialSupply) external returns (address) {
        token = new BasedKenToken(initialSupply);
        return address(token);
    }

    /**
     * @dev Get the deployed token address
     */
    function getTokenAddress() external view returns (address) {
        return address(token);
    }
}