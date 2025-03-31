'use strict';

var sinon = require('sinon');

exports.getTestData = function() {
	return {
		key: 'testKey'
	};
};

exports.getMocks = function(testData) {
	var collectionMock = {
		deleteOne: testData.deleteOneReturn
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
