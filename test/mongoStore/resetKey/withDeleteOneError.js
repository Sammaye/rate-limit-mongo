'use strict';

var sinon = require('sinon');
var expect = require('expect.js');
var rewire = require('rewire');
var _ = require('lodash');
var testUtils = require('./utils');

var MongoStore = rewire('../../../lib/mongoStore');

var describeTitle = 'MongoStore.prototype.resetKey ' +
	'with deleteOne error';
describe(describeTitle, function() {
	var testData = testUtils.getTestData();
	testData.deleteOneError = new Error();
	testData.deleteOneReturn = sinon.stub().throws(testData.deleteOneError);

	var mocks = testUtils.getMocks(testData);

	it('should throw error', function(done) {
		(new MongoStore({collectionName: 'testCollection', uri: 'testUri'})).resetKey.call(
			_.extend(
				{},
				testData.mongoStoreContext,
				mocks._dynamic.mongoStoreContext
			),
			testData.key,
		).catch((err) => {
			expect(err).eql(testData.deleteOneError);

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

	it('errorHandler should be called with error', function() {
		expect(
			mocks._dynamic.mongoStoreContext.errorHandler.callCount
		).eql(1);

		var errorHandlerArgs = mocks._dynamic.mongoStoreContext.errorHandler
			.args[0];

		expect(errorHandlerArgs).eql([
			testData.deleteOneError
		]);
	});
});
