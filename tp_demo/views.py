# Create your views here.from django.shortcuts import get_object_or_404, render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.shortcuts import render_to_response
from django.template import Context, loader, RequestContext

def index(request):

    return render_to_response('base.django.html',{}, RequestContext(request))
