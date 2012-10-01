from django.conf.urls.defaults import *
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from tp_demo.api import urls as api_urls

admin.autodiscover()

urlpatterns = patterns('',
                (r'^polls/', include('polls.urls')),
                (r'^admin/', include(admin.site.urls)),
                (r'^api/', include(api_urls.v1_api.urls)),
                (r'', include('tp_demo.urls')),
)

                       
                       
                       
    # Example:
    # (r'^mysite/', include('mysite.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:

urlpatterns += staticfiles_urlpatterns()

