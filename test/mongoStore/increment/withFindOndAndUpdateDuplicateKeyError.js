'use strict';

var sinon = require('sinon');
var expect = require('expect.js');
var rewire = require('rewire');
var _ = require('lodash');
var testUtils = require('./utils');

var MongoStore = rewire('../../../lib/mongoStore');

var describeTitle = 'MongoStore.prototype.incr with ' +
	'findOneAndUpdate duplicate key error';
describe(describeTitle, function() {
	var testData = testUtils.getTestData();
	testData.findOneAndUpdateError = new Error();
	testData.findOneAndUpdateError.code = 11000;
	testData.collection.findOneAndUpdateResult = sinon.stub().throws(testData.findOneAndUpdateError);

	var mocks = testUtils.getMocks(testData);

	var revertMocks;

	before(function() {
		revertMocks = MongoStore.__set__(
			_.omit(mocks, ['_dynamic'])
		);
	});

	it('should be ok', function(done) {
		(new MongoStore({collectionName: 'testCollection', uri: 'testUri'})).increment.call(
			_.extend(
				{},
				testData.mongoStoreContext,
				mocks._dynamic.mongoStoreContext
			),
			testData.key,
		).then(_ => done());
	});

	it('_getCollection should be called', function() {
		expect(
			mocks._dynamic.mongoStoreContext._getCollection.callCount
		).eql(1);

		var getCollectionArgs = mocks._dynamic.mongoStoreContext
			._getCollection.args[0];

		expect(getCollectionArgs).length(0);
	});

	it('Date.now should be called', function() {
		expect(mocks.Date.now.callCount).eql(1);
		expect(mocks.Date.now.args[0]).eql([]);
	});

	it('Date should be called to construct expirationDate', function() {
		expect(mocks.Date.callCount).eql(1);

		var dateArgs = mocks.Date.args[0];

		expect(dateArgs).eql([
			testData.mongoStoreContext.expireTimeMs + testData.Date.nowResult
		]);
	});

	it('Date should be called as constructor', function() {
		expect(mocks.Date.calledWithNew()).eql(true);
	});

	it(
		'collection.findOneAndUpdate should be called for incrementing counter',
		function() {
			expect(
				mocks._dynamic.collection.findOneAndUpdate.callCount
			).eql(1);

			var findOneAndUpdateArgs = mocks._dynamic.collection
				.findOneAndUpdate.args[0];

			expect(
				findOneAndUpdateArgs
			).eql([
				{_id: testData.key},
				{
					$inc: {counter: 1},
					$setOnInsert: {
						expirationDate: testData.DateResult
					}
				},
				{
					upsert: true,
					returnDocument: 'after'
				}
			]);
		}
	);

	it('self.incr should be called', function() {
		expect(mocks._dynamic.mongoStoreContext.increment.callCount).eql(1);

		var incrArgs = mocks._dynamic.mongoStoreContext.increment.args[0];

		expect(
			incrArgs
		).eql([
			testData.key
		]);
	});

	it('errorHandler should not be called', function() {
		expect(
			mocks._dynamic.mongoStoreContext.errorHandler.callCount
		).eql(0);
	});

	after(function() {
		revertMocks();
	});
});
