'use strict';

var expect = require('expect.js');
var MongoStore = require('../../../lib/mongoStore');

describe('MongoStore.prefixKey without prefix', function() {

    it('should throw error', function() {
        var store = new MongoStore({
            collectionName: 'test',
            uri: 'mongodb://localhost:27017/test',
        });
        var key = store.prefixKey('test');

        expect(key).eql('test');
    });
});
