'use strict';

var expect = require('expect.js');
var rewire = require('rewire');
var _ = require('lodash');
var testUtils = require('./utils');
const sinon = require("sinon");

var MongoStore = rewire('../../../lib/mongoStore');

var describeTitle = 'MongoStore.resetKey with suitable params';
describe(describeTitle, function() {
	var testData = testUtils.getTestData();
	testData.deleteOneReturn = sinon.stub().returns(true);

	var mocks = testUtils.getMocks(testData);

	it('should be ok', function(done) {
		(new MongoStore({collectionName: 'testCollection', uri: 'testUri'})).resetKey.call(
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

	it(
		'collection.deleteOne should be called for deleting record',
		function() {
			expect(
				mocks._dynamic.collection.deleteOne.callCount
			).eql(1);

			var deleteOneArgs = mocks._dynamic.collection.deleteOne.args[0];

			expect(
				deleteOneArgs
			).eql([
				{_id: testData.key}
			]);
		}
	);

	it('errorHandler should not be called', function() {
		expect(
			mocks._dynamic.mongoStoreContext.errorHandler.callCount
		).eql(0);
	});
});
