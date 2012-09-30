/**
 * Created with PyCharm.
 * User: Janez Stupar
 * Date: 9/30/12
 * Time: 6:50 PM
 * To change this template use File | Settings | File Templates.
 */

var poll_settings=poll_settings;

$(document).ready(function(){
    var app = new PollApp();
    app.render();
});

var Poll = Backbone.Model.extend({
    initialize: function(){
        this.choices = new Backbone.Collection([],{model: Choice})
    },
    schema: {
        question: {type: 'Text'}
    },
    defaults: {
        question: '',
        pub_date: new Date()
    },
    url: function(){
        return poll_settings.url_poll;
    }
});

var Choice = Backbone.Model.extend({
   schema: {
       choice: {type: 'Text'}
   },
    defaults: {
        choice: "",
        votes: 0
    }
});

var PollList = Backbone.View.extend({
    el: 'div#poll_container',
    initialize: function(){
        _.bindAll(this,'render');
        this.poll_collection = new Backbone.Collection();
    },
    render: function(){
        this.table = $('<table class="table table_hover"><tr><th>Poll</th></tr><thead></thead></table>');
        this.$el.append(this.table);

        return this;
    }
 });

var PollForm = Backbone.View.extend({
    el: 'div#poll_container',
    initialize: function (){
        _.bindAll(this,'render', 'add_choice', 'confirm_poll','item_add_remove','remove');
        this.model.choices.bind('add', this.item_add_remove);
        this.model.choices.bind('remove', this.item_add_remove);
        this.model.bind('close_poll_form', this.remove);
    },
    events: {
        'click .container button#add_choice': 'add_choice',
        'click .container button#confirm_poll': 'confirm_poll'
    },
    render: function(){
        this.container = $('<div class="span8"></div>');
        this.$el.append(this.container);
        this.form = new Backbone.Form({model: this.model});
        this.form.render();
        this.container.append(this.form.$el);

        this.add_choice_btn = $('<button id="add_choice" class="btn btn-primary">Add choice</button>');
        this.confirm = $('<button id="confirm_poll" class="btn btn-success">Confirm poll</button>');

        this.container.append(this.add_choice_btn);
        this.container.append(this.confirm);

        this.confirm.toggle();

        return this;
    },
    add_choice: function(){
        var new_choice = new Choice();
        var choice_form = new ChoiceForm({model: new_choice}).render();
        this.$el.append(choice_form.$el);
        this.model.choices.add(new_choice);
    },
    confirm_poll: function(){
        this.model.save();
    },
    item_add_remove: function(model, collection){
        if (collection.length>1){
           this.confirm.show();
            this.add_choice_btn.removeClass('btn-primary');
        }
        else{
            this.confirm.hide();
            this.add_choice_btn.addClass('btn-primary');
        }

    },
    remove: function (){
        this.model.destroy();
        this.unbind();
        this.$el.html('');
    }
});

var ChoiceForm = Backbone.View.extend({
    el: '<div class="poll_choice offset2 span6"></div>',
    initialize: function (){
        _.bindAll(this,'render','remove');
    },
    events: {
        'click button.choice_remove': 'remove'
    },
    render: function(){
        this.container = $('<div class="form_content"></div>');
        this.form=new Backbone.Form({model: this.model});
        this.$el.append(this.container);
        this.form.render().$el.appendTo(this.container);

        this.remove = $('<div class="button"><button class="choice_remove btn btn-warning">Remove</button></div>');
        this.$el.append(this.remove);

        return this;
    },
    remove: function(){
        this.model.destroy();
        this.unbind();
        this.$el.remove();
    }
});

var PollApp = Backbone.View.extend({
    el: 'body div#main_container',
    initialize: function (){
        _.bindAll(this,'render','add_poll_click');
    },
    events: {'click button#add_poll': 'add_poll_click'},
    render: function(){
        var p_list = new PollList({});
        p_list.render();

        this.add_poll = $('<button id="add_poll" class="btn btn-primary">Add Poll</button>');
        this.$el.append(this.add_poll);
    },
    add_poll_click: function(){
        var poll_instance = new Poll({});
        var form = new PollForm({model:poll_instance});
        form.render();
        this.add_poll.toggle();
    }
});
