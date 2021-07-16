pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TrustedList is Ownable {

    struct TrustedEntity {
        string did;
        uint expires;
        uint8 status;
    }

    bytes32 public tlType;
    address public parent;
    mapping(address => TrustedEntity) public entities;

    event EntityAdded( address indexed entity, string did, uint expires );
    event EntityUpdated( address indexed entity, string did, uint expires );
    event EntityRevoked( address indexed entity );

    constructor( address _parent, bytes32 _tlType ) Ownable() public {
        parent = _parent;
        tlType = _tlType;
    }

    function register( address _entity, string memory _did, uint _expires ) onlyOwner external {
        TrustedEntity storage entity = entities[_entity];
        require( entity.status == 0, "The entity is already registered" );
        entity.status = 1;
        entity.expires = _expires;
        entity.did = _did;

        emit EntityAdded( _entity, _did, _expires );
    }

    function update( address _entity, string memory _did, uint _expires ) onlyOwner external {
        TrustedEntity storage entity = entities[_entity];
        require( entity.status == 1, "The entity is not registered or has been revoked" );
        require( entity.expires > block.timestamp, "The entity has expired" );
        entity.expires = _expires;
        entity.did = _did;

        emit EntityUpdated( _entity, _did, _expires );
    }

    function revoke( address _entity ) onlyOwner external {
        TrustedEntity storage entity = entities[_entity];
        require( entity.status == 1, "The entity is not registered" );
        entity.status = 2;

        emit EntityRevoked( _entity );
    }
}
