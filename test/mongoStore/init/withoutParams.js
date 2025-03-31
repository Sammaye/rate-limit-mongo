'use strict';

var expect = require('expect.js');
var MongoStore = require('../../../lib/mongoStore');

describe('MongoStore.init without params', function() {

    it('should throw error', function() {
        var store = new MongoStore({
            collectionName: 'test',
            uri: 'mongodb://localhost:27017/test',
            expireTimeMs: 1,
        });
        store.init({});

        expect(store.expireTimeMs).eql(1);
    });
});
