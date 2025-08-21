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

    /// initialHolder = adres puli (ClaimPool) – całość trafia od razu do kontraktu
    constructor(
        string memory name_,
        string memory symbol_,
        string memory author_,
        string memory description_,
        string memory logoURI_,
        address initialHolder
    ) ERC20(name_, symbol_) {
        author = author_;
        description = description_;
        logoURI = logoURI_;
        _mint(initialHolder, SUPPLY);
    }

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
}

/*====================== CLAIM POOL (no limit) ======================*/
contract ClaimPool is Ownable {
    IERC20  public token;               // ustawiany jednorazowo po deployu
    bool    public tokenSet;

    uint256 public immutable claimAmount;
    uint256 public claimCount;
    uint256 public claimedTotal;

    event TokenSet(address token);
    event Claimed(address indexed by, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);

    constructor(uint256 claimAmount_, address owner_) {
        claimAmount = claimAmount_;
        _transferOwnership(owner_);
    }

    /// Jednorazowe przypięcie adresu tokena (po jego deployu)
    function setTokenOnce(address token_) external onlyOwner {
        require(!tokenSet, "Token already set");
        require(token_ != address(0), "Zero token");
        token = IERC20(token_);
        tokenSet = true;
        emit TokenSet(token_);
    }

    function remaining() public view returns (uint256) {
        return tokenSet ? token.balanceOf(address(this)) : 0;
    }

    /// Brak limitu na adres – można claimować wielokrotnie do wyczerpania puli
    function claim() external {
        require(tokenSet, "Token not set");
        uint256 bal = token.balanceOf(address(this));
        require(bal > 0, "Pool empty");

        uint256 amount = claimAmount;
        if (amount > bal) amount = bal;

        claimedTotal += amount;
        unchecked { claimCount += 1; }

        require(token.transfer(msg.sender, amount), "Transfer failed");
        emit Claimed(msg.sender, amount);
    }

    /// Twórca może odebrać resztę z puli
    function withdrawLeftovers(address to) external onlyOwner {
        require(tokenSet, "Token not set");
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

    /// Flow:
    /// 1) Deploy ClaimPool (owner = msg.sender)
    /// 2) Deploy TokenWithMetadata i MINT bezpośrednio do adresu poola
    /// 3) pool.setTokenOnce(token)
    function createAll(
        string calldata name_,
        string calldata symbol_,
        string calldata author_,
        string calldata description_,
        string calldata logoURI_
    ) external returns (address tokenAddr, address poolAddr) {
        // 1) Pool
        ClaimPool pool = new ClaimPool(CLAIM_100, msg.sender);
        poolAddr = address(pool);

        // 2) Token – cała podaż mintowana bezpośrednio do puli
        TokenWithMetadata token = new TokenWithMetadata(
            name_, symbol_, author_, description_, logoURI_, poolAddr
        );
        tokenAddr = address(token);

        // 3) Przypnij token do puli (jednorazowo)
        pool.setTokenOnce(tokenAddr);

        emit Created(msg.sender, tokenAddr, poolAddr);
    }
}

