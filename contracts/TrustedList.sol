pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;
import "@openzeppelin/contracts/access/Ownable.sol";

contract TrustedList is Ownable {
    struct TrustedEntity {
        string did;
        string hash;
        uint expires;
        uint8 status;
    }

    string public name;
    address public parent;
    mapping(address => TrustedEntity) public entities;

    event EntityAdded( address indexed entity, string did, string hash, uint expires );
    event EntityUpdated( address indexed entity, string did, string hash, uint expires );
    event EntityRevoked( address indexed entity );

    constructor( address _parent, string memory _name ) Ownable() public {
        parent = _parent;
        name = _name;
    }

    function register( address _entity, string memory _did, string memory _hash, uint _expires ) onlyOwner external {
        TrustedEntity storage entity = entities[_entity];
        require( entity.status == 0, "The entity is already registered" );
        entity.status = 1;
        entity.expires = _expires;
        entity.did = _did;
        entity.hash = _hash;

        emit EntityAdded( _entity, _did, _hash, _expires );
    }

    function update( address _entity, string memory _did, string memory _hash, uint _expires ) onlyOwner external {
        TrustedEntity storage entity = entities[_entity];
        require( entity.status == 1, "The entity is not registered or has been revoked" );
        entity.expires = _expires;
        entity.did = _did;
        entity.hash = _hash;

        emit EntityUpdated( _entity, _did, _hash, _expires );
    }

    function revoke( address _entity ) onlyOwner external {
        TrustedEntity storage entity = entities[_entity];
        require( entity.status == 1, "The entity is not registered" );
        entity.status = 2;

        emit EntityRevoked( _entity );
    }
}
