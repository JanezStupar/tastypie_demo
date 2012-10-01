__author__ = 'Janez Stupar'
from tastypie import resources, authorization, authentication, fields
from polls import models as poll_models


class PollResource(resources.ModelResource):
    choices = fields.ToManyField('tp_demo.api.polls_api.ChoiceResource', 'choices',null=True, blank=True, full=True)

    class Meta:
        queryset= poll_models.Poll.objects.all()
        resource_name = 'poll_resource'
        authentication = authentication.Authentication()
        authorization = authorization.Authorization()
        list_allowed_methods = ['get','post']
        detail_allowed_methods = ['put','get','delete']
        fields = ['question','pub_date']
        limit = 500

class ChoiceResource(resources.ModelResource):
    poll = fields.ForeignKey(PollResource, 'poll')

    class Meta:
        queryset = poll_models.Choice.objects.all()
        resource_name = 'choice_resource'
        authentication = authentication.Authentication()
        authorization = authorization.Authorization()
        list_allowed_methods = ['get', 'post']
        detail_allowed_methods = ['put','get','delete']
        fields = ['choice','votes']

