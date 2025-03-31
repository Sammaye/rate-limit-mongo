'use strict';

var sinon = require('sinon');
var _ = require('lodash');

exports.getTestData = function() {
	return {
		key: 'testKey',
		DateResult: {
			someKey: _.random(1, 10)
		},
		Date: {
			nowResult: _.random(1, 10)
		},
		collection: {
			findOneAndUpdateResult: {},
		},
		mongoStoreContext: {
			expireTimeMs: _.random(1, 10)
		}
	};
};

exports.getMocks = function(testData) {
	var dateMock = sinon.stub().callsFake(function() {
		_.extend(this, testData.DateResult);
	});
	dateMock.now = sinon.stub().returns(testData.Date.nowResult);

	var collectionFindOneAndUpdateMock = testData.collection.findOneAndUpdateResult;
	var collectionMock = {
		findOneAndUpdate: collectionFindOneAndUpdateMock
	};

	return {
		Date: dateMock,
		_dynamic: {
			mongoStoreContext: {
				_getCollection: sinon.stub().returns(collectionMock),
				errorHandler: sinon.stub().returns(),
				increment: sinon.stub()
			},
			collection: collectionMock
		}
	};
};
