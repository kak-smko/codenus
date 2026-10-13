from renus.db import MongoDBAdapter


adapter= MongoDBAdapter({
    "uri": "mongodb://127.0.0.1:27017",
    "database" : "codenus_test"
})

ID=int
