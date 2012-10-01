__author__ = 'Janez Stupar'
from tastypie.api import Api
from tp_demo.api.polls_api import PollResource, ChoiceResource

v1_api = Api(api_name='polls')
v1_api.register(PollResource())
v1_api.register(ChoiceResource())