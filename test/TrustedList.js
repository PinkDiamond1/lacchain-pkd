const TrustedList = artifacts.require( "TrustedList" );

const sleep = seconds => new Promise( resolve => setTimeout( resolve, seconds * 1e3 ) );

contract( "TrustedList", accounts => {

	const now = Math.round( new Date().getTime() / 1000 ) + 10;

	it( "should register new entity", async() => {
		const trustedList = await TrustedList.deployed();
		await trustedList.register( accounts[1], `did:lac:main:${accounts[2]}`, now + 10 );
		const pk = await trustedList.entities( accounts[1] );
		assert.equal( pk.did, `did:lac:main:${accounts[2]}` );
		assert.equal( pk.expires.toNumber(), now + 10 );
	} );


	it( "should fail to register an active entity", async() => {
		const trustedList = await TrustedList.deployed();
		try {
			await trustedList.register( accounts[1], `did:lac:main:${accounts[2]}`, now );
			return assert.equal( true, false );
		} catch( e ) {
			return assert.equal( e.reason, "The entity is already registered" );
		}
	} );

	it( "should update a entity", async() => {
		const trustedList = await TrustedList.deployed();
		await trustedList.update( accounts[1], `did:lac:main:${accounts[3]}`, now + 10 );
		const pk = await trustedList.entities( accounts[1] );
		assert.equal( pk.did, `did:lac:main:${accounts[3]}` );
		assert.equal( pk.expires.toNumber(), now + 10 );
	} );

	it( "should fail to update an unregistered entity", async() => {
		const trustedList = await TrustedList.deployed();
		try {
			await trustedList.update( accounts[2], `did:lac:main:${accounts[2]}`, now );
			return assert.equal( true, false );
		} catch( e ) {
			return assert.equal( e.reason, "The entity is not registered or has been revoked" );
		}
	} );

	it( "should fail to update an expired entity", async() => {
		await sleep( 7 );
		const trustedList = await TrustedList.deployed();
		try {
			await trustedList.update( accounts[1], `did:lac:main:${accounts[2]}`, now );
			return assert.equal( true, false );
		} catch( e ) {
			return assert.equal( e.reason, "The entity has expired" );
		}
	} );

	it( "should revoke a entity", async() => {
		const trustedList = await TrustedList.deployed();
		await trustedList.revoke( accounts[1] );
		const pk = await trustedList.entities( accounts[1] );
		assert.equal( pk.status, 2 );
	} );

	it( "should fail to revoke an unregistered entity", async() => {
		const trustedList = await TrustedList.deployed();
		try {
			await trustedList.revoke( accounts[2] );
			return assert.equal( true, false );
		} catch( e ) {
			return assert.equal( e.reason, "The entity is not registered" );
		}
	} );

	it( "should fail to update an revoked entity", async() => {
		const trustedList = await TrustedList.deployed();
		try {
			await trustedList.update( accounts[1], `did:lac:main:${accounts[2]}`, now );
			return assert.equal( true, false );
		} catch( e ) {
			return assert.equal( e.reason, "The entity is not registered or has been revoked" );
		}
	} );

} );