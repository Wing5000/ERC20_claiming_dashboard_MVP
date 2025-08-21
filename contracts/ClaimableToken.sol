// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ClaimableToken
 * @dev ERC20 token z funkcją claim() pozwalającą odbierać tokeny z puli kontraktu
 */
contract ClaimableToken is ERC20, Ownable {
    // Stałe
    uint8 public constant DECIMALS = 18;
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**DECIMALS;
    uint256 public constant CLAIM_AMOUNT = 100 * 10**DECIMALS;
    
    // Metadane (opcjonalne)
    string public author;
    string public description;
    string public logoURI;
    
    // Statystyki
    uint256 public claimCount;
    uint256 public claimedTotal;
    
    // Zdarzenia
    event Claimed(address indexed by, uint256 amount);
    
    /**
     * @dev Konstruktor kontraktu
     * @param name_ Nazwa tokena
     * @param symbol_ Symbol tokena
     * @param author_ Autor kontraktu (opcjonalne)
     * @param description_ Opis tokena (opcjonalne)
     * @param logoURI_ URI do logo (opcjonalne)
     */
    constructor(
        string memory name_,
        string memory symbol_,
        string memory author_,
        string memory description_,
        string memory logoURI_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        // Ustaw metadane
        author = author_;
        description = description_;
        logoURI = logoURI_;
        
        // Wybij całą początkową podaż na adres kontraktu
        _mint(address(this), INITIAL_SUPPLY);
    }
    
    /**
     * @dev Override funkcji decimals() - zawsze zwraca 18
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
    
    /**
     * @dev Funkcja claim() - pozwala odbierać tokeny z puli
     * Każdy może wywołać wielokrotnie, otrzymuje 100 tokenów lub resztę jeśli mniej zostało
     */
    function claim() external {
        uint256 contractBalance = balanceOf(address(this));
        
        // Sprawdź czy pula nie jest pusta
        if (contractBalance == 0) {
            revert("Pool empty");
        }
        
        // Oblicz kwotę do wypłaty (100 tokenów lub reszta)
        uint256 amountToClaim = contractBalance >= CLAIM_AMOUNT ? CLAIM_AMOUNT : contractBalance;
        
        // Zaktualizuj statystyki
        claimCount++;
        claimedTotal += amountToClaim;
        
        // Prześlij tokeny do msg.sender
        _transfer(address(this), msg.sender, amountToClaim);
        
        // Emituj zdarzenie
        emit Claimed(msg.sender, amountToClaim);
    }
    
    /**
     * @dev Zwraca pozostałą ilość tokenów w puli kontraktu
     */
    function remaining() public view returns (uint256) {
        return balanceOf(address(this));
    }
    
    /**
     * @dev Funkcja dla właściciela do wypłaty pozostałości (opcjonalna)
     * @param to Adres odbiorcy
     */
    function withdrawLeftovers(address to) external onlyOwner {
        require(to != address(0), "Invalid address");
        uint256 leftover = balanceOf(address(this));
        require(leftover > 0, "No leftovers");
        
        _transfer(address(this), to, leftover);
    }
}

