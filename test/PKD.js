const PKD = artifacts.require( "PKD" );

const sleep = seconds => new Promise( resolve => setTimeout( resolve, seconds * 1e3 ) );

contract( "PKD", accounts => {

	const now = Math.round( new Date().getTime() / 1000 );

	it( "should register new public key", async() => {
		const pkd = await PKD.deployed();
		await pkd.register( accounts[1], `did:lac:main:${accounts[2]}`, now + 10 );
		const pk = await pkd.publicKeys( accounts[1] );
		assert.equal( pk.did, `did:lac:main:${accounts[2]}` );
		assert.equal( pk.expires.toNumber(), now + 10 );
	} );


	it( "should fail to register an active public key", async() => {
		const pkd = await PKD.deployed();
		try {
			await pkd.register( accounts[1], `did:lac:main:${accounts[2]}`, now );
			return assert.equal( true, false );
		} catch( e ) {
			return assert.equal( e.reason, "The public key is already registered" );
		}
	} );

	it( "should update a public key", async() => {
		const pkd = await PKD.deployed();
		await pkd.update( accounts[1], `did:lac:main:${accounts[3]}`, now + 10 );
		const pk = await pkd.publicKeys( accounts[1] );
		assert.equal( pk.did, `did:lac:main:${accounts[3]}` );
		assert.equal( pk.expires.toNumber(), now + 10 );
	} );

	it( "should fail to update an unregistered public key", async() => {
		const pkd = await PKD.deployed();
		try {
			await pkd.update( accounts[2], `did:lac:main:${accounts[2]}`, now );
			return assert.equal( true, false );
		} catch( e ) {
			return assert.equal( e.reason, "The public key is not registered or has been revoked" );
		}
	} );

	it( "should fail to update an expired public key", async() => {
		await sleep( 7 );
		const pkd = await PKD.deployed();
		try {
			await pkd.update( accounts[1], `did:lac:main:${accounts[2]}`, now );
			return assert.equal( true, false );
		} catch( e ) {
			return assert.equal( e.reason, "The public key has expired" );
		}
	} );

	it( "should revoke a public key", async() => {
		const pkd = await PKD.deployed();
		await pkd.revoke( accounts[1] );
		const pk = await pkd.publicKeys( accounts[1] );
		assert.equal( pk.status, 2 );
	} );

	it( "should fail to revoke an unregistered public key", async() => {
		const pkd = await PKD.deployed();
		try {
			await pkd.revoke( accounts[2] );
			return assert.equal( true, false );
		} catch( e ) {
			return assert.equal( e.reason, "The public key is not registered" );
		}
	} );

	it( "should fail to update an revoked public key", async() => {
		const pkd = await PKD.deployed();
		try {
			await pkd.update( accounts[1], `did:lac:main:${accounts[2]}`, now );
			return assert.equal( true, false );
		} catch( e ) {
			return assert.equal( e.reason, "The public key is not registered or has been revoked" );
		}
	} );

} );