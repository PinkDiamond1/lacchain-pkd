pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PKD is Ownable {

    mapping(address => PublicKey) public publicKeys;

    struct PublicKey {
        string did;
        uint expires;
        uint8 status;
    }

    event PublicKeyAdded( address indexed entity, string did, uint expires );
    event PublicKeyUpdated( address indexed entity, string did, uint expires );
    event PublicKeyRevoked( address indexed entity);

    function register( address _entity, string memory _did, uint _expires ) onlyOwner external {
        PublicKey storage pk = publicKeys[_entity];
        require( pk.status == 0, "The public key is already registered" );
        pk.did = _did;
        pk.expires = _expires;
        pk.status = 1;

        emit PublicKeyAdded( _entity, _did, _expires );
    }

    function update( address _entity, string memory _did, uint _expires ) onlyOwner external {
        PublicKey storage pk = publicKeys[_entity];
        require( pk.status == 1, "The public key is not registered or has been revoked" );
        require( pk.expires > block.timestamp, "The public key has expired" );
        pk.did = _did;
        pk.expires = _expires;
        pk.status = 1;

        emit PublicKeyUpdated( _entity, _did, _expires );
    }

    function revoke( address _entity ) onlyOwner external {
		PublicKey storage pk = publicKeys[_entity];
        require( pk.status == 1, "The public key is not registered" );
        pk.status = 2;

        emit PublicKeyRevoked( _entity );
    }

    function isActive( address entity ) public view returns (bool) {
        return publicKeys[entity].status == 1;
    }
}
