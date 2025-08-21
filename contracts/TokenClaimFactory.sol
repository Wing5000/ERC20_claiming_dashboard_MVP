// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.6/contracts/token/ERC20/ERC20.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.6/contracts/token/ERC20/IERC20.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.6/contracts/access/Ownable.sol";

/*===================== ERC20 + METADATA =====================*/
contract TokenWithMetadata is ERC20 {
    string public author;
    string public description;
    string public logoURI;

    uint8   public constant DECIMALS = 18;
    uint256 public constant SUPPLY   = 1_000_000 * (10 ** DECIMALS);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory author_,
        string memory description_,
        string memory logoURI_
    ) ERC20(name_, symbol_) {
        author = author_;
        description = description_;
        logoURI = logoURI_;
        _mint(msg.sender, SUPPLY); // cała podaż do deployera (fabryki)
    }

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
}

/*====================== CLAIM POOL (no limit) ======================*/
contract ClaimPool is Ownable {
    IERC20  public immutable token;
    uint256 public immutable claimAmount;

    uint256 public claimCount;
    uint256 public claimedTotal;

    event Claimed(address indexed by, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);

    constructor(IERC20 token_, uint256 claimAmount_, address owner_) {
        token = token_;
        claimAmount = claimAmount_;
        _transferOwnership(owner_);
    }

    function remaining() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function claim() external {
        uint256 bal = token.balanceOf(address(this));
        require(bal > 0, "Pool empty");
        uint256 amount = claimAmount;
        if (amount > bal) amount = bal;
        claimedTotal += amount;
        unchecked { claimCount += 1; }
        require(token.transfer(msg.sender, amount), "Transfer failed");
        emit Claimed(msg.sender, amount);
    }

    function withdrawLeftovers(address to) external onlyOwner {
        uint256 bal = token.balanceOf(address(this));
        require(bal > 0, "No leftovers");
        require(token.transfer(to, bal), "Transfer failed");
        emit Withdraw(to, bal);
    }
}

/*============================= FACTORY =============================*/
contract TokenClaimFactory {
    event Created(address indexed creator, address token, address pool);

    uint8   public constant DECIMALS  = 18;
    uint256 public constant CLAIM_100 = 100 * (10 ** DECIMALS);

    function createAll(
        string calldata name_,
        string calldata symbol_,
        string calldata author_,
        string calldata description_,
        string calldata logoURI_
    ) external returns (address tokenAddr, address poolAddr) {
        // 1) Deploy token (podaż trafia do tego kontraktu – fabryki)
        TokenWithMetadata token = new TokenWithMetadata(
            name_, symbol_, author_, description_, logoURI_
        );
        tokenAddr = address(token);

        // 2) Deploy pool (owner = msg.sender)
        ClaimPool pool = new ClaimPool(IERC20(tokenAddr), CLAIM_100, msg.sender);
        poolAddr = address(pool);

        // 3) Przelej całą podaż z fabryki do puli
        require(token.transfer(poolAddr, token.balanceOf(address(this))), "Transfer to pool failed");

        emit Created(msg.sender, tokenAddr, poolAddr);
    }
}
