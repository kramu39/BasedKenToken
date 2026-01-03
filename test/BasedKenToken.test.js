const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BasedKenToken", function () {
  let basedKenToken;
  let owner, addr1, addr2, addr3;
  const initialSupply = ethers.parseEther("1000000"); // 1 million tokens

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy contract
    const BasedKenToken = await ethers.getContractFactory("BasedKenToken");
    basedKenToken = await BasedKenToken.deploy();
    await basedKenToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with correct name", async function () {
      expect(await basedKenToken.name()).to.equal("BasedKenToken");
    });

    it("Should deploy with correct symbol", async function () {
      expect(await basedKenToken.symbol()).to.equal("BKT");
    });

    it("Should deploy with correct decimals", async function () {
      expect(await basedKenToken.decimals()).to.equal(18);
    });

    it("Should set owner correctly", async function () {
      expect(await basedKenToken.owner()).to.equal(owner.address);
    });

    it("Should not be paused on deployment", async function () {
      expect(await basedKenToken.paused()).to.equal(false);
    });

    it("Should have initial total supply of 0", async function () {
      expect(await basedKenToken.totalSupply()).to.equal(0);
    });
  });

  describe("ERC-20: Transfer", function () {
    beforeEach(async function () {
      // Mint tokens to owner for testing
      await basedKenToken.mint(owner.address, initialSupply);
    });

    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.parseEther("100");
      await expect(
        basedKenToken.transfer(addr1.address, transferAmount)
      ).to.changeTokenBalances(
        basedKenToken,
        [owner, addr1],
        [-transferAmount, transferAmount]
      );
    });

    it("Should emit Transfer event on successful transfer", async function () {
      const transferAmount = ethers.parseEther("50");
      await expect(
        basedKenToken.transfer(addr1.address, transferAmount)
      ).to.emit(basedKenToken, "Transfer");
    });

    it("Should fail if sender has insufficient balance", async function () {
      const transferAmount = ethers.parseEther("100");
      await expect(
        basedKenToken.connect(addr1).transfer(addr2.address, transferAmount)
      ).to.be.revertedWithCustomError(
        basedKenToken,
        "ERC20InsufficientBalance"
      );
    });

    it("Should allow transfer of zero tokens", async function () {
      await expect(
        basedKenToken.transfer(addr1.address, 0)
      ).to.emit(basedKenToken, "Transfer");
    });

    it("Should not allow transfer to zero address", async function () {
      const transferAmount = ethers.parseEther("100");
      await expect(
        basedKenToken.transfer(ethers.ZeroAddress, transferAmount)
      ).to.be.revertedWithCustomError(
        basedKenToken,
        "ERC20InvalidReceiver"
      );
    });
  });

  describe("ERC-20: Approval and TransferFrom", function () {
    beforeEach(async function () {
      // Mint tokens to owner for testing
      await basedKenToken.mint(owner.address, initialSupply);
    });

    it("Should approve tokens for spending", async function () {
      const approveAmount = ethers.parseEther("100");
      await expect(
        basedKenToken.approve(addr1.address, approveAmount)
      ).to.emit(basedKenToken, "Approval");
    });

    it("Should track approval balance correctly", async function () {
      const approveAmount = ethers.parseEther("100");
      await basedKenToken.approve(addr1.address, approveAmount);
      expect(
        await basedKenToken.allowance(owner.address, addr1.address)
      ).to.equal(approveAmount);
    });

    it("Should allow transferFrom with approval", async function () {
      const approveAmount = ethers.parseEther("100");
      const transferAmount = ethers.parseEther("50");
      
      await basedKenToken.approve(addr1.address, approveAmount);
      await expect(
        basedKenToken
          .connect(addr1)
          .transferFrom(owner.address, addr2.address, transferAmount)
      ).to.changeTokenBalances(
        basedKenToken,
        [owner, addr2],
        [-transferAmount, transferAmount]
      );
    });

    it("Should emit Approval event on approve", async function () {
      const approveAmount = ethers.parseEther("100");
      await expect(
        basedKenToken.approve(addr1.address, approveAmount)
      ).to.emit(basedKenToken, "Approval");
    });

    it("Should fail transferFrom without sufficient approval", async function () {
      const transferAmount = ethers.parseEther("100");
      await basedKenToken.approve(addr1.address, ethers.parseEther("50"));
      
      await expect(
        basedKenToken
          .connect(addr1)
          .transferFrom(owner.address, addr2.address, transferAmount)
      ).to.be.revertedWithCustomError(
        basedKenToken,
        "ERC20InsufficientAllowance"
      );
    });

    it("Should fail transferFrom if owner has insufficient balance", async function () {
      const transferAmount = ethers.parseEther("100");
      await basedKenToken.approve(addr1.address, ethers.parseEther("1000000"));
      
      await expect(
        basedKenToken
          .connect(addr1)
          .transferFrom(addr2.address, addr3.address, transferAmount)
      ).to.be.revertedWithCustomError(
        basedKenToken,
        "ERC20InsufficientBalance"
      );
    });

    it("Should update allowance after transferFrom", async function () {
      const approveAmount = ethers.parseEther("100");
      const transferAmount = ethers.parseEther("50");
      
      await basedKenToken.approve(addr1.address, approveAmount);
      await basedKenToken
        .connect(addr1)
        .transferFrom(owner.address, addr2.address, transferAmount);
      
      expect(
        await basedKenToken.allowance(owner.address, addr1.address)
      ).to.equal(approveAmount - transferAmount);
    });

    it("Should allow increasing approval", async function () {
      const initialApproval = ethers.parseEther("100");
      const increaseAmount = ethers.parseEther("50");
      
      await basedKenToken.approve(addr1.address, initialApproval);
      await basedKenToken.increaseAllowance(addr1.address, increaseAmount);
      
      expect(
        await basedKenToken.allowance(owner.address, addr1.address)
      ).to.equal(initialApproval + increaseAmount);
    });

    it("Should allow decreasing approval", async function () {
      const initialApproval = ethers.parseEther("100");
      const decreaseAmount = ethers.parseEther("30");
      
      await basedKenToken.approve(addr1.address, initialApproval);
      await basedKenToken.decreaseAllowance(addr1.address, decreaseAmount);
      
      expect(
        await basedKenToken.allowance(owner.address, addr1.address)
      ).to.equal(initialApproval - decreaseAmount);
    });

    it("Should fail to decrease allowance below zero", async function () {
      const initialApproval = ethers.parseEther("100");
      const decreaseAmount = ethers.parseEther("150");
      
      await basedKenToken.approve(addr1.address, initialApproval);
      
      await expect(
        basedKenToken.decreaseAllowance(addr1.address, decreaseAmount)
      ).to.be.revertedWithCustomError(
        basedKenToken,
        "ERC20FailedDecreaseAllowance"
      );
    });
  });

  describe("Mint", function () {
    it("Should mint tokens to an address", async function () {
      const mintAmount = ethers.parseEther("1000");
      await basedKenToken.mint(addr1.address, mintAmount);
      
      expect(await basedKenToken.balanceOf(addr1.address)).to.equal(
        mintAmount
      );
    });

    it("Should emit Transfer event with 0x0 as from address on mint", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(
        basedKenToken.mint(addr1.address, mintAmount)
      ).to.emit(basedKenToken, "Transfer");
    });

    it("Should increase total supply on mint", async function () {
      const initialSupply = await basedKenToken.totalSupply();
      const mintAmount = ethers.parseEther("1000");
      
      await basedKenToken.mint(addr1.address, mintAmount);
      
      expect(await basedKenToken.totalSupply()).to.equal(
        initialSupply + mintAmount
      );
    });

    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("500");
      await expect(
        basedKenToken.mint(addr1.address, mintAmount)
      ).to.not.be.reverted;
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("500");
      await expect(
        basedKenToken.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWithCustomError(basedKenToken, "OwnableUnauthorizedAccount");
    });

    it("Should mint zero tokens without reverting", async function () {
      await expect(basedKenToken.mint(addr1.address, 0)).to.not.be.reverted;
    });
  });

  describe("Burn", function () {
    beforeEach(async function () {
      // Mint tokens to addr1 for burning
      await basedKenToken.mint(addr1.address, initialSupply);
    });

    it("Should burn tokens from caller", async function () {
      const burnAmount = ethers.parseEther("100");
      const initialBalance = await basedKenToken.balanceOf(addr1.address);
      
      await basedKenToken.connect(addr1).burn(burnAmount);
      
      expect(await basedKenToken.balanceOf(addr1.address)).to.equal(
        initialBalance - burnAmount
      );
    });

    it("Should emit Transfer event with 0x0 as to address on burn", async function () {
      const burnAmount = ethers.parseEther("100");
      await expect(
        basedKenToken.connect(addr1).burn(burnAmount)
      ).to.emit(basedKenToken, "Transfer");
    });

    it("Should decrease total supply on burn", async function () {
      const burnAmount = ethers.parseEther("100");
      const initialSupply = await basedKenToken.totalSupply();
      
      await basedKenToken.connect(addr1).burn(burnAmount);
      
      expect(await basedKenToken.totalSupply()).to.equal(
        initialSupply - burnAmount
      );
    });

    it("Should fail to burn more than balance", async function () {
      const burnAmount = ethers.parseEther("2000000");
      await expect(
        basedKenToken.connect(addr1).burn(burnAmount)
      ).to.be.revertedWithCustomError(
        basedKenToken,
        "ERC20InsufficientBalance"
      );
    });

    it("Should burn zero tokens without reverting", async function () {
      await expect(basedKenToken.connect(addr1).burn(0)).to.not.be.reverted;
    });

    it("Should allow burning from an approved account", async function () {
      const burnAmount = ethers.parseEther("100");
      
      await basedKenToken
        .connect(addr1)
        .approve(addr2.address, burnAmount);
      await basedKenToken
        .connect(addr2)
        .burnFrom(addr1.address, burnAmount);
      
      expect(await basedKenToken.balanceOf(addr1.address)).to.equal(
        initialSupply - burnAmount
      );
    });
  });

  describe("Pause/Unpause", function () {
    beforeEach(async function () {
      // Mint tokens to owner for testing transfers during pause
      await basedKenToken.mint(owner.address, initialSupply);
      await basedKenToken.mint(addr1.address, initialSupply);
    });

    it("Should allow owner to pause contract", async function () {
      await basedKenToken.pause();
      expect(await basedKenToken.paused()).to.equal(true);
    });

    it("Should allow owner to unpause contract", async function () {
      await basedKenToken.pause();
      await basedKenToken.unpause();
      expect(await basedKenToken.paused()).to.equal(false);
    });

    it("Should not allow non-owner to pause contract", async function () {
      await expect(
        basedKenToken.connect(addr1).pause()
      ).to.be.revertedWithCustomError(
        basedKenToken,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should not allow non-owner to unpause contract", async function () {
      await basedKenToken.pause();
      await expect(
        basedKenToken.connect(addr1).unpause()
      ).to.be.revertedWithCustomError(
        basedKenToken,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should prevent transfers when paused", async function () {
      const transferAmount = ethers.parseEther("100");
      await basedKenToken.pause();
      
      await expect(
        basedKenToken.transfer(addr2.address, transferAmount)
      ).to.be.revertedWithCustomError(basedKenToken, "EnforcedPause");
    });

    it("Should prevent transferFrom when paused", async function () {
      const transferAmount = ethers.parseEther("100");
      await basedKenToken.approve(addr2.address, transferAmount);
      await basedKenToken.pause();
      
      await expect(
        basedKenToken
          .connect(addr2)
          .transferFrom(owner.address, addr3.address, transferAmount)
      ).to.be.revertedWithCustomError(basedKenToken, "EnforcedPause");
    });

    it("Should prevent mint when paused", async function () {
      await basedKenToken.pause();
      
      await expect(
        basedKenToken.mint(addr2.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(basedKenToken, "EnforcedPause");
    });

    it("Should prevent burn when paused", async function () {
      await basedKenToken.pause();
      
      await expect(
        basedKenToken.connect(addr1).burn(ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(basedKenToken, "EnforcedPause");
    });

    it("Should allow transfers after unpause", async function () {
      const transferAmount = ethers.parseEther("100");
      await basedKenToken.pause();
      await basedKenToken.unpause();
      
      await expect(
        basedKenToken.transfer(addr2.address, transferAmount)
      ).to.not.be.reverted;
    });
  });

  describe("Ownership Transfer", function () {
    it("Should transfer ownership to new owner", async function () {
      await basedKenToken.transferOwnership(addr1.address);
      expect(await basedKenToken.owner()).to.equal(addr1.address);
    });

    it("Should not allow non-owner to transfer ownership", async function () {
      await expect(
        basedKenToken.connect(addr1).transferOwnership(addr2.address)
      ).to.be.revertedWithCustomError(
        basedKenToken,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should prevent old owner from performing owner actions after transfer", async function () {
      await basedKenToken.transferOwnership(addr1.address);
      
      await expect(
        basedKenToken.mint(addr2.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(
        basedKenToken,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should allow new owner to mint after ownership transfer", async function () {
      await basedKenToken.transferOwnership(addr1.address);
      
      await expect(
        basedKenToken.connect(addr1).mint(addr2.address, ethers.parseEther("100"))
      ).to.not.be.reverted;
    });

    it("Should allow new owner to pause", async function () {
      await basedKenToken.transferOwnership(addr1.address);
      
      await expect(basedKenToken.connect(addr1).pause()).to.not.be.reverted;
    });

    it("Should allow renouncing ownership", async function () {
      await basedKenToken.renounceOwnership();
      expect(await basedKenToken.owner()).to.equal(ethers.ZeroAddress);
    });

    it("Should prevent minting after renouncing ownership", async function () {
      await basedKenToken.renounceOwnership();
      
      await expect(
        basedKenToken.mint(addr1.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(
        basedKenToken,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("Balance and Supply Queries", function () {
    it("Should return correct balance for address with tokens", async function () {
      const mintAmount = ethers.parseEther("500");
      await basedKenToken.mint(addr1.address, mintAmount);
      
      expect(await basedKenToken.balanceOf(addr1.address)).to.equal(
        mintAmount
      );
    });

    it("Should return 0 balance for address with no tokens", async function () {
      expect(await basedKenToken.balanceOf(addr2.address)).to.equal(0);
    });

    it("Should return correct total supply", async function () {
      const amount1 = ethers.parseEther("100");
      const amount2 = ethers.parseEther("200");
      
      await basedKenToken.mint(addr1.address, amount1);
      await basedKenToken.mint(addr2.address, amount2);
      
      expect(await basedKenToken.totalSupply()).to.equal(amount1 + amount2);
    });

    it("Should return 0 allowance when not approved", async function () {
      expect(
        await basedKenToken.allowance(owner.address, addr1.address)
      ).to.equal(0);
    });
  });

  describe("Edge Cases", function () {
    beforeEach(async function () {
      await basedKenToken.mint(owner.address, initialSupply);
    });

    it("Should handle max uint256 amounts", async function () {
      const maxAmount = ethers.MaxUint256;
      // Approve max amount (though mint won't support this large amount)
      await basedKenToken.approve(addr1.address, maxAmount);
      
      expect(
        await basedKenToken.allowance(owner.address, addr1.address)
      ).to.equal(maxAmount);
    });

    it("Should handle rapid minting and burning", async function () {
      const amount = ethers.parseEther("100");
      
      for (let i = 0; i < 5; i++) {
        await basedKenToken.mint(addr1.address, amount);
      }
      
      expect(await basedKenToken.balanceOf(addr1.address)).to.equal(
        amount * 5n
      );
      
      for (let i = 0; i < 5; i++) {
        await basedKenToken.connect(addr1).burn(amount);
      }
      
      expect(await basedKenToken.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should handle multiple approvals from same owner", async function () {
      const amount = ethers.parseEther("100");
      
      await basedKenToken.approve(addr1.address, amount);
      await basedKenToken.approve(addr2.address, amount);
      await basedKenToken.approve(addr3.address, amount);
      
      expect(
        await basedKenToken.allowance(owner.address, addr1.address)
      ).to.equal(amount);
      expect(
        await basedKenToken.allowance(owner.address, addr2.address)
      ).to.equal(amount);
      expect(
        await basedKenToken.allowance(owner.address, addr3.address)
      ).to.equal(amount);
    });

    it("Should handle overwriting approvals", async function () {
      const amount1 = ethers.parseEther("100");
      const amount2 = ethers.parseEther("200");
      
      await basedKenToken.approve(addr1.address, amount1);
      expect(
        await basedKenToken.allowance(owner.address, addr1.address)
      ).to.equal(amount1);
      
      await basedKenToken.approve(addr1.address, amount2);
      expect(
        await basedKenToken.allowance(owner.address, addr1.address)
      ).to.equal(amount2);
    });

    it("Should correctly handle token transfers in a chain", async function () {
      const amount = ethers.parseEther("100");
      
      // owner -> addr1
      await basedKenToken.transfer(addr1.address, amount);
      expect(await basedKenToken.balanceOf(addr1.address)).to.equal(amount);
      
      // addr1 -> addr2
      await basedKenToken.connect(addr1).transfer(addr2.address, amount);
      expect(await basedKenToken.balanceOf(addr2.address)).to.equal(amount);
      expect(await basedKenToken.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should handle approveAndTransfer pattern", async function () {
      const amount = ethers.parseEther("100");
      
      await basedKenToken.approve(addr1.address, amount);
      await basedKenToken
        .connect(addr1)
        .transferFrom(owner.address, addr2.address, amount);
      
      expect(await basedKenToken.balanceOf(addr2.address)).to.equal(amount);
      expect(
        await basedKenToken.allowance(owner.address, addr1.address)
      ).to.equal(0);
    });

    it("Should handle pause during pending transactions", async function () {
      const amount = ethers.parseEther("100");
      await basedKenToken.approve(addr1.address, amount);
      await basedKenToken.pause();
      
      await expect(
        basedKenToken
          .connect(addr1)
          .transferFrom(owner.address, addr2.address, amount)
      ).to.be.revertedWithCustomError(basedKenToken, "EnforcedPause");
    });

    it("Should correctly track allowance through multiple operations", async function () {
      const initialApproval = ethers.parseEther("1000");
      const transfer1 = ethers.parseEther("200");
      const transfer2 = ethers.parseEther("300");
      
      await basedKenToken.approve(addr1.address, initialApproval);
      
      await basedKenToken
        .connect(addr1)
        .transferFrom(owner.address, addr2.address, transfer1);
      expect(
        await basedKenToken.allowance(owner.address, addr1.address)
      ).to.equal(initialApproval - transfer1);
      
      await basedKenToken
        .connect(addr1)
        .transferFrom(owner.address, addr3.address, transfer2);
      expect(
        await basedKenToken.allowance(owner.address, addr1.address)
      ).to.equal(initialApproval - transfer1 - transfer2);
    });
  });

  describe("Event Emissions", function () {
    it("Should emit correct Transfer event values", async function () {
      await basedKenToken.mint(owner.address, ethers.parseEther("100"));
      const amount = ethers.parseEther("50");
      
      await expect(
        basedKenToken.transfer(addr1.address, amount)
      ).to.emit(basedKenToken, "Transfer")
        .withArgs(owner.address, addr1.address, amount);
    });

    it("Should emit correct Approval event values", async function () {
      const amount = ethers.parseEther("100");
      
      await expect(
        basedKenToken.approve(addr1.address, amount)
      ).to.emit(basedKenToken, "Approval")
        .withArgs(owner.address, addr1.address, amount);
    });

    it("Should emit Paused event on pause", async function () {
      await expect(basedKenToken.pause())
        .to.emit(basedKenToken, "Paused");
    });

    it("Should emit Unpaused event on unpause", async function () {
      await basedKenToken.pause();
      
      await expect(basedKenToken.unpause())
        .to.emit(basedKenToken, "Unpaused");
    });

    it("Should emit OwnershipTransferred event", async function () {
      await expect(
        basedKenToken.transferOwnership(addr1.address)
      ).to.emit(basedKenToken, "OwnershipTransferred")
        .withArgs(owner.address, addr1.address);
    });
  });
});
