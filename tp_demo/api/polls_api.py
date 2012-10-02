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
        # custom_meta_option = object() # add a custom meta option
        list_allowed_methods = ['get','post']
        detail_allowed_methods = ['put','get','delete']
        fields = ['question','pub_date']
#        filtering = {'pub_date':['exact']} # Filter entries
        limit = 20
        ## Note that there are many other meta options, so you should refer to the documentation

    def dispatch(self, request_type, request, **kwargs):
        # You might wnat to override this method to initialize custom meta options
        # This is the point from which you will start if you want to assert
        # total control of the request/response, but still want some tastypie candy
        return super(PollResource,self).dispatch(request_type, request, **kwargs)

    def dispatch_detail(self, request, **kwargs):
        # This one is actually a wrapper for dispatch, for the purpose of
        # handling of detail request on a resource (e.g. /api/poll/10/ )
        return super(PollResource,self).dispatch_detail(request,**kwargs)

    def get_resource_uri(self, bundle_or_obj):
        # override to change the way specific resource uri is generated
        return super(PollResource,self).get_resource_uri(bundle_or_obj)

    def get_resource_list_uri(self):
        # override to change the way resource_list_uri is generated
        return super(PollResource,self).get_resource_list_uri()

    # Note that there are other method available
    def get_list(self, request, **kwargs):
        ## You might override this method to override HTTP GET request behavior
        # on list endpoint of a resource (e.g. /api/poll/ )
        return super(PollResource,self).get_list(request, **kwargs)

    def post_list(self, request, **kwargs):
        return super(PollResource, self).post_list(request, **kwargs)

    def obj_get(self, request=None, **kwargs):
        return super(PollResource,self).obj_get(request, **kwargs)

    def obj_create(self, bundle, request=None, **kwargs):
        return super(PollResource,self).obj_create(bundle, request, **kwargs)

    def obj_delete(self, request=None, **kwargs):
        return super(PollResource,self).obj_delete(request, **kwargs)

    def build_filters(self, filters=None):
        # You might override this method to change the behavior of default filtering
        # mechanism. (e.g.: You want to do complex lookups using Q objects)
        return super(PollResource, self).build_filters(filters)

    def apply_filters(self, request, applicable_filters):
        # You might override this method if you want to override the way
        # filters are aplied. (e.g.: you built your filtering around Q objects
        # in the build_filters method
        return super(PollResource,self).apply_filters(request, applicable_filters)

    def hydrate(self, bundle):
        # You will implement this method to clean the data from the
        # request that doesn't belong to the model or compute some data
        # that is required on the model respectively.
        return super(PollResource,self).hydrate(bundle)

    def dehydrate(self, bundle):
        # You will implement this method to prepare the data for
        # serialization. You might want to remove unnecessary data
        # or add some other data, you might desire
        return super(PollResource,self).dehydrate(bundle)

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