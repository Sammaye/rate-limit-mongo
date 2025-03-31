'use strict';

const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');

/**
 * @typedef IMongoStoreDocument
 * @extends import('mongodb').Document
 * @property {import('mongodb').ObjectId} _id
 * @property {number} counter
 * @property {Date} expirationDate
 * @property {string} [key]
 */

class MongoStore {
	/** @type {import('mongodb').MongoClient} */
	client;

	/** @type {{uri: string, user: string, password: string, authSource: string, collectionName: string}} */
	dbOptions;

	/** @type {import('mongodb').Collection} */
	collection;

	/** @type {number} */
	expireTimeMs;

	/** @type {boolean} */
	resetExpireDateOnChange;

	/** @type {Function} */
	errorHandler;

	/** @type {boolean} */
	createTtlIndex;

	/** @type {Object} */
	connectionOptions;

	/** @type {string} */
	prefix;

	/**
	 * @constructor. Only required if the user needs to pass
	 * some store specific parameters. For example, in a Mongo Store, the user will
	 * need to pass the URI, username and password for the Mongo database.
	 *
	 * Accepting a custom `prefix` here is also recommended.
	 *
	 * @param options {{
	 *     collectionName: string,
	 *     uri: string,
	 *     user: string,
	 *     password: string,
	 *     authSource: string,
	 *     expireTimeMs: Number,
	 *     resetExpireDateOnChange: Boolean,
	 *     errorHandler: Function,
	 *     createTtlIndex: Boolean,
	 *     collection: import('mongodb').Collection,
	 *     connectionOptions: import('mongodb').MongoClientOptions,
	 *     authSource: string,
	 *     prefix: string,
	 * }}
	 */
	constructor(options) {
		const allOptions = _.defaults(options, {
			collectionName: 'expressRateRecords',
			expireTimeMs: 60000,
			resetExpireDateOnChange: false,
			errorHandler: _.noop,
			createTtlIndex: true,
			connectionOptions: {},
			prefix: '',
		});

		if (!allOptions.collection && (!allOptions.collectionName || !allOptions.uri)) {
			throw new Error('collection or collectionName and uri should be set');
		}

		this.dbOptions = {
			uri: allOptions.uri,
			user: allOptions.user,
			password: allOptions.password,
			authSource: allOptions.authSource,
			collectionName: allOptions.collectionName,
		};

		this.collection = allOptions.collection;
		this.expireTimeMs = allOptions.expireTimeMs;
		this.resetExpireDateOnChange = allOptions.resetExpireDateOnChange;
		this.errorHandler = allOptions.errorHandler;
		this.createTtlIndex = allOptions.createTtlIndex;
		this.connectionOptions = allOptions.connectionOptions;
		this.prefix = allOptions.prefix;
	}

	/**
	 * @returns {Collection<Document>}
	 * @private
	 */
	async _getCollection() {
		if (!this.client) {
			const connectionOptions = this.connectionOptions;

			if (this.dbOptions.user && this.dbOptions.password) {
				const dbName = _.last(this.dbOptions.uri.split('/'));

				connectionOptions.authSource = this.dbOptions.authSource || dbName;
				connectionOptions.auth = {
					user: this.dbOptions.user,
					password: this.dbOptions.password,
				};
			}

			this.client = await MongoClient.connect(this.dbOptions.uri, connectionOptions);
		}

		const collection = this.client.db().collection(this.dbOptions.collectionName);
		if (this.createTtlIndex) {
			await collection.createIndex({ expirationDate: 1 }, { expireAfterSeconds: 0 });
		}
		return collection;
	}

	/**
	 * Method that actually initializes the store. Must be synchronous.
	 *
	 * This method is optional, it will be called only if it exists.
	 *
	 * @param options {Partial<import('express-rate-limit').Options>} - The options used to setup express-rate-limit.
	 *
	 * @public
	 */
	init(options) {
		this.expireTimeMs = options.windowMs;
	}

	/**
	 * Method to prefix the keys with the given text.
	 *
	 * Call this from get, increment, decrement, resetKey, etc.
	 *
	 * @param key {string} - The key.
	 *
	 * @returns {string} - The text + the key.
	 */
	prefixKey(key) {
		return `${this.prefix}${key}`;
	}

	/**
	 * Method to fetch a client's hit count and reset time.
	 *
	 * @param key {string} - The identifier for a client.
	 *
	 * @returns {{totalHits: number, resetTime: Date}} - The number of hits and reset time for that client.
	 *
	 * @public
	 */
	async get(key) {
		const collection = await this._getCollection();

		const expressRateRecord = await collection.findOne({ _id: key });

		return {
			totalHits: expressRateRecord ? expressRateRecord.counter : 0,
			resetTime: expressRateRecord ? expressRateRecord.expirationDate : new Date(),
		};
	}

	/**
	 * Method to increment a client's hit counter.
	 *
	 * @param key {string} - The identifier for a client.
	 *
	 * @returns {{totalHits: number, resetTime: Date}} - The number of hits and reset time for that client.
	 *
	 * @public
	 */
	async increment(key) {
		try {
			const collection = await this._getCollection();

			const modifier = {
				$inc: { counter: 1 },
			};
			const expirationDate = new Date(Date.now() + this.expireTimeMs);

			if (this.resetExpireDateOnChange) {
				modifier.$set = { expirationDate: expirationDate };
			} else {
				modifier.$setOnInsert = { expirationDate: expirationDate };
			}

			const /** @type IMongoStoreDocument */ expressRateRecord = await collection.findOneAndUpdate(
				{ _id: key },
				modifier,
				{
					upsert: true,
					returnDocument: 'after',
				},
			);

			return {
				totalHits: expressRateRecord.counter, // A positive integer
				resetTime: expressRateRecord.expirationDate, // A JS `Date` object
			};
		} catch (err) {
			console.log(err);
			// call function again in case of duplicate key error
			if (err && err.code === 11000) {
				return this.increment(key);
			}

			this.errorHandler(err);

			throw err;
		}
	}

	/**
	 * Method to decrement a client's hit counter.
	 *
	 * @param key {string} - The identifier for a client.
	 *
	 * @public
	 */
	async decrement(key) {
		try {
			const collection = await this._getCollection();
console.log('here1');
			const modifier = {
				$inc: { counter: -1 },
			};
			const expirationDate = new Date(Date.now() + this.expireTimeMs);
			console.log(Date);
			console.log('#calleddate');
			if (this.resetExpireDateOnChange) {
				modifier.$set = { expirationDate: expirationDate };
			} else {
				modifier.$setOnInsert = { expirationDate: expirationDate };
			}

			await collection.findOneAndUpdate({ _id: key }, modifier, {
				upsert: true,
				returnDocument: 'after',
			});
		} catch (err) {
			console.log(err);
			this.errorHandler(err);
			throw err;
		}
	}

	/**
	 * Method to reset a client's hit counter.
	 *
	 * @param key {string} - The identifier for a client.
	 *
	 * @public
	 */
	async resetKey(key) {
		try {
			const collection = await this._getCollection();
			await collection.deleteOne({ _id: key });
		} catch (err) {
			this.errorHandler(err);
			throw err;
		}
	}
}

module.exports = MongoStore;
