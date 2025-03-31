'use strict';

var expect = require('expect.js');
var rewire = require('rewire');
var _ = require('lodash');
var testUtils = require('./utils');

var MongoStore = rewire('../../../lib/mongoStore');

var describeTitle = 'MongoClient._createCollection ' +
	'with user and password';
describe(describeTitle, function() {
	var testData = testUtils.getTestData();
	testData.mongoStoreContext.dbOptions.user = 'testUser';
	testData.mongoStoreContext.dbOptions.password = 'testPassword';

	var mocks = testUtils.getMocks(testData);

	var revertMocks;

	before(function() {
		revertMocks = MongoStore.__set__(
			_.omit(mocks, ['_dynamic'])
		);
	});

	it('should set collection to mongoStore context', function(done) {
		(new MongoStore({collectionName: 'testCollection', uri: 'testUri'}))._getCollection.call(
			testData.mongoStoreContext,
		).then(data => {
			expect(data).eql(testData.mongoStoreContext.collection);
			expect(testData.mongoStoreContext).keys('collection');
			expect(
				testData.mongoStoreContext.collection
			).eql(testData.collection);
			done();
		});
	});

	it('MongoClient.connect should be called with uri and options', function() {
		expect(mocks.MongoClient.connect.callCount).eql(1);

		var MongoClientConnectArgs = mocks.MongoClient.connect.args[0];

		expect(
			MongoClientConnectArgs
		).eql([
			testData.mongoStoreContext.dbOptions.uri,
			{
				authSource: 'testDbName',
				auth: {
					user: testData.mongoStoreContext.dbOptions.user,
					password: testData.mongoStoreContext.dbOptions.password
				}
			}
		]);
	});

	it('client.db should be called', function() {
		expect(mocks._dynamic.client.db.callCount).eql(1);

		var clientDbArgs = mocks._dynamic.client.db.args[0];

		expect(clientDbArgs).eql([]);
	});

	it('db.collection should be called with collection name', function() {
		expect(mocks._dynamic.db.collection.callCount).eql(1);

		var dbCollectionArgs = mocks._dynamic.db.collection.args[0];

		expect(dbCollectionArgs).eql([
			testData.mongoStoreContext.dbOptions.collectionName
		]);
	});

	after(function() {
		revertMocks();
	});
});
