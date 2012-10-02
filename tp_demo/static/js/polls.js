/**
 * Created with PyCharm.
 * User: Janez Stupar
 * Date: 9/30/12
 * Time: 6:50 PM
 * To change this template use File | Settings | File Templates.
 */

// This is here only to get Pycharm code analysis tool off my back
var poll_settings=poll_settings;
var poll_app = poll_app;

$(document).ready(function(){
    poll_app = new PollApp();
    poll_app.render();
});

var Poll = Backbone.Model.extend({
    initialize: function(){
        if (! this.get('choices')){
            this.set('choices', new ChoiceCollection());
        }
    },
    schema: {
        question: {type: 'Text'}
    },
    defaults: {
        question: '',
        pub_date: new Date()
    },
    url: function(){
        if (this.id){
            return this.id;
        }else{
            return poll_settings.url_poll;
        }
    },
    parse: function(response){
        if (response.choices){
            response.choices = new ChoiceCollection(response.choices);
        }
        return response;
    },
    toJSON: function(){
        var attributes = this.attributes;
        if (this.isNew()){
            delete attributes.choices;
        }
        return attributes;
    }
});

var Choice = Backbone.Model.extend({
    initialize: function(){
        this.bind('change', function(){
            // Ignore save when model is first initialized
            if (this.get('poll') && this.get('choice')!=""){
                // ignore save when only resource_uri is changed (AKA after model is created)
                if(!this.changed.resource_uri){
                    this.save();
                }
            }
        },this);
    },
   schema: {
       choice: {type: 'Text'}
   },
    defaults: {
        choice: "",
        votes: 0
    },
    url: function(){
        if (this.id){
            return this.id;
        }else{
            return poll_settings.url_choice;
        }
    }
});


var PollForm = Backbone.View.extend({
    el: 'div#poll_form',
    initialize: function (){
        _.bindAll(this,'render', 'add_choice', 'confirm_poll','item_add_remove','remove');
        this.model.get('choices').bind('add', this.item_add_remove);
        this.model.get('choices').bind('remove', this.item_add_remove);
        this.model.bind('close_poll_form', this.remove);
        this.choice_form_arr = [] ;
    },
    events: {
        'click .container button#add_choice': 'add_choice',
        'click .container button#confirm_poll': 'confirm_poll',
        'click .container button#close_form': 'remove'
    },
    render: function(){
        this.container = $('<div class="span8"></div>');
        this.$el.append(this.container);

        this.container.append('<h2>Add new poll</h2>');

        this.form = new Backbone.Form({model: this.model});
        this.form.render();
        this.container.append(this.form.$el);

        this.add_choice_btn = $('<button id="add_choice" class="btn btn-primary">Add choice</button>');
        this.confirm_btn = $('<button id="confirm_poll" class="btn btn-success">Confirm poll</button>');
        this.close_btn = $('<button id="close_form" class="btn btn-danger">Close</button>');

        this.container.append(this.add_choice_btn);
        this.container.append(this.close_btn);
        this.container.append(this.confirm_btn);

        this.confirm_btn.toggle();

        return this;
    },
    add_choice: function(){
        var new_choice = new Choice();
        var choice_form = new ChoiceForm({model: new_choice}).render();
        this.$el.append(choice_form.$el);
        this.model.get('choices').add(new_choice);
        this.choice_form_arr.push(choice_form);
    },
    confirm_poll: function(){
        var self = this;
        this.form.commit();
        this.model.save({},{
            success: function(model, response){
                _.each(self.choice_form_arr,function(e,i){
                    if (!e.model.get('poll')) {
                        e.model.set('poll',model.id);
                    }
                    e.form.commit();
                });
                self.trigger('poll_added');
                self.remove(true);
            },
            error: function(model,response){
                self.remove(false);
            }
        });
    },
    item_add_remove: function(model, collection){
        if (collection.length>1){
           this.confirm_btn.show();
            this.add_choice_btn.removeClass('btn-primary');
        }
        else{
            this.confirm_btn.hide();
            this.add_choice_btn.addClass('btn-primary');
        }

    },
    remove: function (model){
        model = model?true:false;
        this.trigger('closing');
        if (!model){
            this.model.destroy();
        }
        this.undelegateEvents();
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

var PollCollection = Backbone.Collection.extend({
    url: function(){
        return poll_settings.url_poll;
    },
    model: Poll
});

var ChoiceCollection = Backbone.Collection.extend({
    url: function(){
        return poll_settings.url_choice;
    },
    model: Choice
});

var PollApp = Backbone.View.extend({
    el: 'body div#main_container',
    initialize: function (){
        _.bindAll(this,'render','add_poll_click');
        this.poll_collection = new PollCollection();
    },
    events: {'click button#add_poll': 'add_poll_click'},
    render: function(){
        var self = this;
        var p_list = new PollEditor({poll_collection: this.poll_collection});
        p_list.render();

        this.add_poll = $('<button id="add_poll" class="btn btn-primary">Add Poll</button>');
        this.$el.append(this.add_poll);
        this.poll_collection.fetch({success: function(collection,response){
            p_list.trigger('init_polls');
        }});
    },
    add_poll_click: function(){
        var poll_instance = new Poll({});
        var form = new PollForm({model:poll_instance, poll_collection: this.poll_collection});
        form.bind('closing',function(){
            this.add_poll.show();
        },this);
        form.bind('poll_added',function(){
            this.add_poll.show();
            this.poll_collection.add(poll_instance);
        },this);
        form.render();
        this.add_poll.hide();
    }
});

var PollEditor = Backbone.View.extend({
    el: 'div#poll_container',
    initialize: function(){
        _.bindAll(this,'render','poll_added','poll_removed','init_polls');
        this.poll_collection = this.options.poll_collection;
        this.poll_collection.bind('add', this.poll_added);
        this.poll_collection.bind('remove',this.poll_removed);
        this.bind('init_polls', this.init_polls);
    },
    render: function(){
        this.table = $('<table class="table table-hover"><thead><tr><th>Poll</th></tr></thead><tbody></tbody></table>');
        this.$el.append(this.table);

        this.table_content = $('div#poll_container table tbody');

        return this;
    },
    poll_added: function(model, collection){
        var new_entry = new PollListEntry({model: model});
        new_entry.render();
        this.table_content.append(new_entry.$el);
    },
    poll_removed: function(model, collection){

    },
    init_polls: function (){
        this.poll_collection.each(function(e,i){
            this.poll_added(e);
        },this);
    }
});

var PollListEntry = Backbone.View.extend({
    el: '<tr class="poll_list_entry"></tr>',
    initialize: function(){
        _.bindAll(this,'render','remove_model','toggle_mode');
        this.model.bind('destroy', function(){this.remove();},this);
        this.mode = 0; // row
    },
    events: {
        'click td>button.remove_poll': 'remove_model',
        'click td': 'toggle_mode'
    },
    render: function(){
        var self = this;
        if (this.mode==0){
            this.content = $('<td class="col1">'+ this.model.get('question') +'</td><td class="col2"><button class="remove_poll btn btn-danger">Remove</button></td>');
            this.$el.append(this.content);
        }else{
            var choices = this.model.get('choices');
            var lambda = function(choices){
                var choice_container  = $('<td><div>' + self.model.get("question") +'</div><div class="poll_choice_container"><ul class="unstyled"></ul></div></td><td><div class="poll_choice_vote"><ul class="unstyled"></ul></div></td>');
                choices.each(function(e,i){
                    var choice = $('<li><button class="btn">Vote</button><span>' + e.get('choice') + '</span></li></br>');
                    var votes = $('<li>Current votes: ' + e.get('votes') + '</li></br>');
                    choice.children('button').bind('click',function(){
                        e.set('votes', e.get('votes')+1);
                    });
                    choice.appendTo(choice_container.find('div.poll_choice_container ul'));
                    votes.appendTo(choice_container.find('div.poll_choice_vote ul'));
                });
                return choice_container;
            };

            if (!choices.length) {
                this.model.fetch({success: function(model,collection){
                    choices = model.get('choices');
                    self.content = lambda(choices);
                    self.$el.append(self.content);
                }});
            }else{
                this.content = lambda(choices);
                this.$el.append(this.content);
            }

        }

        return this;
    },
    rerender: function(){
        this.content.remove();
        this.render();
    },
    remove_model: function(){
        this.model.destroy();
        this.remove();
    },
    toggle_mode: function(){
        this.mode = this.mode ^ 1;
        this.rerender();
    }
});
