import { MongoClientOptions, Collection } from 'mongodb';

declare module '@sammaye/rate-limit-mongo' {

    export default class MongoStore {

        constructor(options: Partial<MongoStoreOptions>);

        /**
         * Returns a rate limit record for the given key.
         * @param key
         */
        get(key: string): Promise<MongoStoreRateLimitRecord>;

        /**
         * Returns a prefixed key.
         * @param key
         */
        prefixKey(key: string): string;

        /**
         * Increments the value in the underlying store for the given key.
         * @param key The key to use as the unique identifier passed down from RateLimit.
         */
        increment(key: string): void;

        /**
         * Decrements the value in the underlying store for the given key. Used only when skipFailedRequests is true
         * @param key The key to use as the unique identifier passed down from RateLimit.
         */
        decrement(key: string): void;

        /**
         * Resets a value with the given key.
         * @param key The key to reset.
         */
        resetKey(key: string): void;

        /**
         * Resets every value
         */
        resetAll(): void;
    }

    export interface MongoStoreRateLimitRecord {
        totalHits: number;
        resetTime: Date;
    }

    export interface MongoStoreOptions {

        /**
         * uri for connecting to mongodb, `mongodb://127.0.0.1:27017/test_db` for example. Required if collection hasn't been set.
         */
        uri: string;

        /**
         * name of collection for storing records. Defaults to `expressRateRecords`
         */
        collectionName: string;

        /**
         * username for authentication in mongodb
         */
        user?: string;

        /**
         * password for authentication in mongodb
         */
        password?: string;

        /**
         * db name against which authenticate use. If not set db name from uri will be taken.
         */
        authSource?: string;

        /**
         * mongodb collection instance. Required if uri hasn't been set.
         */
        collection?: Collection;

        /**
         * mongodb connection options. Allows to pass additional connection options to mongodb.
         * The default connection options are `useUnifiedTopology: true`, `useNewUrlParser: true`.
         */
        connectionOptions?: MongoClientOptions;

        /**
         * time period, in milliseconds, after which record will be reset (deleted).
         * Defaults to `60 * 1000`.
         * Notice that current implementation uses on mongodb ttl indexes - background task that removes expired documents runs every 60 seconds.
         * As a result, documents may remain in a collection during the period between the expiration of the document and the running of the background task.
         * See [mongodb ttl indexes doc](https://docs.mongodb.com/v3.6/core/index-ttl/#timing-of-the-delete-operation) for more information.
         */
        expireTimeMs?: number;

        /**
         * indicates whether expireDate should be reset when changed or not.
         * Defaults to `false`.
         */
        resetExpireDateOnChange?: boolean;

        /**
         * function that will be called if error happened during incr, decrement or resetKey methods. Defaults to `_.noop`.
         */
        errorHandler?: (err: any) => any;

        /**
         * defines whether create ttl index (on `expirationDate` field with `expireAfterSeconds: 0`) on collection or not.
         * Could be useful in situations when you don't want to create index from the app e.g.
         * due to restricted db permissions (see [#15](https://github.com/2do2go/rate-limit-mongo/issues/15) for details).
         * Defaults to `true`.
         */
        createTtlIndex?: boolean;

        /**
         * Used to prefix all keys
         */
        prefix?: string;
    }

}
