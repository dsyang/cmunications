/* server side code using interface from db_func.js */

module.exports = function todoRoutes(db_API, mongoExpressAuth, app){

    checkLoggedInForAllTodoRoutes(mongoExpressAuth, app);

    app.get('/myevents', function(request, response){
        var orgname = mongoExpressAuth.getUsername(request);
        db_API.getAll(orgname, makeSendResult(response));
        response.sendfile("index.html");
    });

    app.get('/myevents/:_id', function(request, response){
        var orgname = mongoExpressAuth.getUsername(request);
        var _id = request.params._id;
        db_API.get(orgname, _id, makeSendResult(response));
        response.sendfile("index.html");
    });

    app.post('/create', function(request, response){
        var content = request.body.content;
        var orgname = mongoExpressAuth.getUsername(request);
        db_API.create(orgname, content, makeSendResult(response));
        response.sendfile("create.html");
    });

    app.put('/myevents/:_id', function(req, res){
        var orgname = mongoExpressAuth.getUsername(request);
        var _id = req.params._id;
        var content = req.body.content;
        db_API.update(orgname, _id, content, makeSendResult(response));
    });


    app.delete('/myevents/:_id', function(req, res){
        var orgname = mongoExpressAuth.getUsername(request);
        var _id = request.params._id;
        todoAPI.delete(orgname, _id, makeSendResult(response));
    });
}

function checkLoggedInForAllTodoRoutes(mongoExpressAuth, app){
    app.all('/todo', function(req, res, next){
        mongoExpressAuth.checkLogin(req, res, function(err){
            if (err)
                res.send({ 'err': err });
            else
                next();
        });
    });
}

function makeSendResult(response){
    return function(err, result){
        if (typeof result === 'number')
            result = String(result);
        if (err)
            response.send({ 'err': 'unknown err' });
        else
            response.send(result);
    }
}
