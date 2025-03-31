'use strict';

var sinon = require('sinon');
var _ = require('lodash');

exports.getTestData = function() {
	return {
		key: 'testKey',
		collection: {
			findOneResult: {}
		},
		mongoStoreContext: {
			expireTimeMs: _.random(1, 10)
		}
	};
};

exports.getMocks = function(testData) {

	var collectionFindOneMock =
		testData.collection.findOneResult;
	var collectionMock = {
		findOne: collectionFindOneMock
	};

	return {
		_dynamic: {
			mongoStoreContext: {
				_getCollection: sinon.stub().returns(collectionMock),
				errorHandler: sinon.stub().returns()
			},
			collection: collectionMock
		}
	};
};
