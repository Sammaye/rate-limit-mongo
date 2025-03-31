'use strict';

var expect = require('expect.js');
var rewire = require('rewire');
var _ = require('lodash');
var testUtils = require('./utils');
var sinon = require("sinon");

var MongoStore = rewire('../../../lib/mongoStore');

var describeTitle = 'MongoStore.get without findOne Error';
describe(describeTitle, function() {
	var testData = testUtils.getTestData();
	var doc = {
		counter: _.random(1, 10),
		expirationDate: _.random(1, 10)
	};
	testData.collection.findOneResult = sinon.stub().returns(doc);

	var mocks = testUtils.getMocks(testData);

	var revertMocks;

	before(function() {
		revertMocks = MongoStore.__set__(
			_.omit(mocks, ['_dynamic'])
		);
	});

	it('should return counter and expirationDate', function(done) {
		(new MongoStore({collectionName: 'testCollection', uri: 'testUri'})).get.call(
			_.extend(
				{},
				testData.mongoStoreContext,
				mocks._dynamic.mongoStoreContext
			),
			testData.key,
		).then(data => {
			revertMocks();

			expect(data.totalHits).eql(
				doc.counter
			);
			expect(data.resetTime).eql(
				doc.expirationDate
			);

			done();
		});
	});

	it('_getCollection should be called', function() {
		expect(
			mocks._dynamic.mongoStoreContext._getCollection.callCount
		).eql(1);

		var getCollectionArgs = mocks._dynamic.mongoStoreContext
			._getCollection.args[0];

		expect(getCollectionArgs).length(0);
	});

	after(function() {
		revertMocks();
	});
});
