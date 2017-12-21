from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^get_image/(?P<size>[1-4]:[1-4])/(?P<tag>.*)$', views.get_image, name='get_image'),
    url(r'^get_image/(?P<size>((?![1-4]:[1-4]).)*)/(?P<tag>.*)$', views.get_image_error,
        name='get_image_error'),
    url(r'^save_image', views.save_image, name='save_image'),
]
