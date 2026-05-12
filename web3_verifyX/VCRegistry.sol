// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VCRegistry {
    address public owner;
    uint256 public credentialCounter;

    struct Credential {
        address issuer;
        address holder;
        string  ipfsCID;
        bytes32 credentialHash;
        uint256 issuedAt;
        uint256 expiresAt;
        bool    revoked;
    }
    mapping(uint256  => Credential) public credentials;
    mapping(address  => bool)       public authorizedIssuers;
    mapping(bytes32  => uint256)    public hashToId;
    mapping(bytes32  => bool)       public issuedHashes;


    mapping(address => uint256[]) public holderCredentials;
    event CredentialIssued(
        uint256 indexed id,
        address indexed issuer,
        address indexed holder,
        bytes32 credentialHash,
        string  ipfsCID,
        uint256 issuedAt,
        uint256 expiresAt
    );

    event CredentialRevoked(uint256 indexed id, address indexed issuer, uint256 revokedAt);
    event IssuerAdded(address indexed issuer);
    event IssuerRemoved(address indexed issuer);


    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier validId(uint256 id) {
        require(id > 0 && id <= credentialCounter, "Invalid credential ID");
        _;
    }


    constructor() {
        owner = msg.sender;
    }


    function addAuthorizedIssuer(address _issuer) external onlyOwner {
        require(_issuer != address(0), "Invalid issuer address");
        require(!authorizedIssuers[_issuer], "Already authorized");

        authorizedIssuers[_issuer] = true;
        emit IssuerAdded(_issuer);
    }

    function removeAuthorizedIssuer(address _issuer) external onlyOwner {
        require(authorizedIssuers[_issuer], "Not an authorized issuer");

        authorizedIssuers[_issuer] = false;
        emit IssuerRemoved(_issuer);
    }

    function issueCredential(
        address holder,
        string  memory ipfsCID,
        bytes32 credentialHash,
        uint256 expiresAt
    ) external returns (uint256 id) {

        require(authorizedIssuers[msg.sender], "Not an authorized issuer");
        require(holder != address(0),          "Invalid holder address");
        require(bytes(ipfsCID).length > 0,     "IPFS CID cannot be empty");
        require(credentialHash != bytes32(0),  "Invalid credential hash");
        require(!issuedHashes[credentialHash], "Credential already issued");

        if (expiresAt != 0) {
            require(expiresAt > block.timestamp, "Expiry must be in the future");
        }

        credentialCounter++;
        id = credentialCounter;

        credentials[id] = Credential({
            issuer:         msg.sender,
            holder:         holder,
            ipfsCID:        ipfsCID,
            credentialHash: credentialHash,
            issuedAt:       block.timestamp,
            expiresAt:      expiresAt,
            revoked:        false
        });

        issuedHashes[credentialHash]  = true;
        hashToId[credentialHash]      = id;
        holderCredentials[holder].push(id);

        emit CredentialIssued(
            id,
            msg.sender,
            holder,
            credentialHash,
            ipfsCID,
            block.timestamp,
            expiresAt
        );
    }
    function revokeCredential(uint256 id) external validId(id) {
        Credential storage cert = credentials[id];

        require(cert.issuer == msg.sender, "Only the original issuer can revoke");
        require(!cert.revoked,             "Already revoked");

        cert.revoked = true;

        emit CredentialRevoked(id, msg.sender, block.timestamp);
    }
    function verifyCredential(bytes32 hash) external view returns (bool) {
        uint256 id = hashToId[hash];
        if (id == 0) return false;
        return _isValid(id);
    }

    function isValid(uint256 id) external view returns (bool) {
        if (id == 0 || id > credentialCounter) return false;
        return _isValid(id);
    }

    function _isValid(uint256 id) internal view returns (bool) {
        Credential storage cert = credentials[id];
        if (cert.revoked) return false;
        if (cert.expiresAt != 0 && block.timestamp > cert.expiresAt) return false;
        return true;
    }

    function getCredential(uint256 id)
        external view validId(id)
        returns (Credential memory)
    {
        return credentials[id];
    }

    function getCredentialByHash(bytes32 hash)
        external view
        returns (Credential memory)
    {
        uint256 id = hashToId[hash];
        require(id != 0, "Credential not found");
        return credentials[id];
    }

    function getHolderCredentials(address holder)
        external view
        returns (uint256[] memory)
    {
        return holderCredentials[holder];
    }

    function getHolderCredentialCount(address holder)
        external view
        returns (uint256)
    {
        return holderCredentials[holder].length;
    }
}
