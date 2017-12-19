from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^detail/(?P<id>[0-9]+)$', views.detail_image, name='detail'),
    url(r'^get_image/(?P<tag>.+)/(?P<size>[0-9]+)$', views.get_image, name='send_image'),
    url(r'^save_image', views.save_image, name='save_image'),
]
