/* handle all DOM manipulation, using org_app.js */


var UI = function(config){

	//get all the needed DOM elements
    this.initDom();

    //used in org_app.js
    this.events = config.events;

    this.dom.createTodoButton.click(this.submitTodo.bind(this));

    this.dom.deleteTodoButton.click(this.deleteEventTodo.bind(this));

    this.dom.createTodoContentInput.onenter(this.submitTodo.bind(this));

}

UI.prototype = {
    initDom: function(){
        this.dom = {
            createTodoContentInput: $('#createTodoContentInput'),
            createTodoButton: $('#createTodoButton'),
            todos: $('#todos')
        }

        this.dom.deleteTodoButton = $('<button>');
        this.dom.deleteTodoButton.attr('id', 'deleteButton');
        this.dom.deleteTodoButton.text('done');
    },

    submitTodo: function(){
        var content = this.dom.createTodoContentInput.val();
        this.dom.createTodoContentInput.val('');

        this.events.create(content);
    },

    deleteEventTodo: function(event){
        var domTodo = $(event.target).parent();
        var _id = domTodo.data('_id');
        this.events.delete(_id);
    },

    //==================
    //  API
    //==================

    emptyTodos: function(){
        this.dom.todos.empty();
    },

    insert: function(todo){
        var domContent = $('<div>');
        domContent.text(todo.content);
        domContent.addClass('todoContent')

        var domTodo = $('<li>');
        domTodo.data('_id', todo._id);
        domTodo.addClass('todo');
        domTodo.append(domContent);


        domTodo.mouseenter(function(){
            domTodo.append(this.dom.deleteTodoButton);
        }.bind(this));

        domTodo.mouseleave(function(){
            this.dom.deleteTodoButton.detach();
        }.bind(this));
        
        this.dom.todos.prepend(domTodo);
    },

    remove: function(_id){
        this.dom.todos.children().each(function(){
            var todo = $(this);
            if (todo.data('_id') === _id){
                todo.find('#deleteButton').detach();
                todo.remove();
            }
        });
    }

}
