from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.core.files.storage import default_storage
from django.utils.timezone import now
from django.contrib.auth.models import User

from .models import *

# Create your views here.
def index(request):
    return HttpResponse("Hello World! Welcome to picturesque.")

def save_image(request):
    # get files from request.FILES - https://docs.djangoproject.com/en/1.11/topics/http/file-uploads/
    image = request.FILES.get("image", None)
    tags = request.POST.get("tags", None)
    width = request.POST.get("width", 0)
    height = request.POST.get("height", 1)

    if request.method == 'POST' and image is not None and tags is not None:
        uploader = request.user
        if uploader.is_anonymous():
            uploader = User.objects.get(id=2) # no_login
        uploaded_at = now()
        uploaded_time = uploaded_at.strftime("%Y%m%d%H%M%S")
        image_type = image.name.split('.')[-1]
        image_url = default_storage.save('images/' + uploader.username + '/' + uploaded_time + '.' + image_type, image)
        image_model = Image(uploader=uploader, url=image_url, width=width, height=height, uploaded_at=uploaded_at)
        image_model.save()

        tags = tags.lower()
        tags_split = tags.split(' ')

        for tag in tags_split:
            try:
                image_model.tags.add(Tag.objects.get(name=tag))
            except Tag.DoesNotExist:
                image_model.tags.add(Tag.objects.create(name=tag))

        image_model.save()
        '''
        return render(request, 'upload.html', {
            'message': 'upload success!'
        })
        '''
        return HttpResponse('Upload Success!')

    return render(request, 'upload.html')
