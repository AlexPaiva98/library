const { MongoClient } = require("mongodb")

class Mongo {

    constructor(uri) {
        this.uri = uri;
    }

    async connect() {
        this.client = new MongoClient(this.uri);
        this.connection = await this.client.connect();
    }

    async insertMany(db, collection, docs) {
        let database = this.client.db(db);
        let col = database.collection(collection);
        return await col.insertMany(docs);
    }

    async close() {
        await this.client.close();
    }

};

module.exports = Mongo;