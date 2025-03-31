'use strict';

var expect = require('expect.js');
var rewire = require('rewire');
var _ = require('lodash');
var testUtils = require('./utils');
var sinon = require('sinon');
var MongoStore = rewire('../../../lib/mongoStore');

var describeTitle = 'MongoStore._getCollection ' +
	'with collection.createIndex error';
describe(describeTitle, function() {
	var testData = testUtils.getTestData();
	var collectionCreateIndexError = new Error('test createIndex error');
	testData.collection.createIndex = sinon.stub().throws(collectionCreateIndexError);

	var mocks = testUtils.getMocks(testData);

	var revertMocks;

	before(function() {
		revertMocks = MongoStore.__set__(
			_.omit(mocks, ['_dynamic'])
		);
	});

	it('should throw error', function(done) {
		(new MongoStore({collectionName: 'testCollection', uri: 'testUri'}))._getCollection.call(
			_.extend(
				{},
				testData.mongoStoreContext,
			)
		).catch(err => {
			expect(err).eql(
				collectionCreateIndexError
			);

			done();
		});
	});

	it(
		'collection.createIndex should be called for setting ttl index',
		function() {
			var collectionMock = testData.collection;

			expect(collectionMock.createIndex.callCount).eql(1);

			var collectionCreateIndexArgs = collectionMock.createIndex.args[0];

			expect(
				collectionCreateIndexArgs
			).eql([
				{expirationDate: 1},
				{expireAfterSeconds: 0}
			]);
		}
	);

	after(function() {
		revertMocks();
	});
});
