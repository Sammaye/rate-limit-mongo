'use strict';

var sinon = require('sinon');

exports.getTestData = function() {
	return {
		mongoStoreContext: {
			dbOptions: {
				uri: 'testUri/testDbName',
				collectionName: 'testCollectionName'
			},
			connectionOptions: {},
			createTtlIndex: true,
		},
		db: {
			collectionResult: 'testCollection'
		},
		collection: {
			createIndex: sinon.stub()
		}
	};
};

exports.getMocks = function(testData) {
	var dbCollectionMock = sinon.stub().returns(testData.collection);

	var clientDbMock = sinon.stub().returns({
		collection: dbCollectionMock
	});

	var mongoClientConnectResult = {
		db: clientDbMock
	};

	return {
		MongoClient: {
			connect: sinon.stub().returns(mongoClientConnectResult)
		},
		_dynamic: {
			db: {
				collection: dbCollectionMock
			},
			client: {
				db: clientDbMock
			}
		}
	};
};
