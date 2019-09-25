const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const dbName = 'LSmails';
const url = 'mongodb://DBUsername:Mfqiek6ZIvN6De59@long-url-bla-bla-bla/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';

const insertDocuments = function(selectedDB,forminfo,callback) 
{
    // Get the documents collection
    const collection = selectedDB.collection('mails');
    // Insert some documents
    collection.insertMany([
    {
        forminfo
    }]
    , function(err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        assert.equal(1, result.ops.length);
        console.log("Inserted User's form info into the database.");
        callback(result);
    });
}


function insertFormData(request, response, callback)
{
    
    let userdata =
    {
        Name : request.post.Name,
        Message : request.post.Message,
        Subject : request.post.Subject,
        Email : request.post.Email,
        ip : request.headers["x-forwarded-for"] || request.connection.remoteAddress,
        Headers : request.headers,
        DateTime : new Date().toLocaleString()
    }

    //A mail need to contain some content...
    if(userdata.Message == null || userdata.Message == "")
    {
        callback(false, "No message was found :S");
    }

    else
    {
        console.log("Userdata is packed into an object.");
        //console.log(userdata);

        //Creating the mongoDB client.
        console.log("Creating  Mongo Client with the URL: "+ url + " ....")
        const client = new MongoClient(url);

        console.log("Connecting MongoDB client to the server...")
        client.connect(function(error)
        {
            assert.equal(null, error);
            console.log("Succesfully connected with the server.");
            console.log("Selecting database: " + dbName);
            const selectedDB = client.db(dbName);

            console.log("Inserting userdata... ")
            //console.log(userdata)
            insertDocuments(selectedDB, userdata, function()
            {
                console.log("Closing the Mongo Client...");
                client.close();
                if(callback == null)
                {
                    response.statusCode = 200;
                    response.setHeader("ContentType","text/html");
                    response.end("Succes!");
                }

                else
                {
                    callback(true, "Success!");
                }
            });
        });
    }
}

module.exports.InsertFormData = insertFormData;