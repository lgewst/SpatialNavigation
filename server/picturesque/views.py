from django.http import HttpResponse, JsonResponse, HttpResponseNotFound, HttpResponseNotAllowed
from django.shortcuts import render, redirect
from django.core.files.storage import default_storage
from django.utils.timezone import now
from django.contrib.auth.models import User
from django.core.files.storage import default_storage

from .models import *

import random

# Create your views here.
def index(request):
    return HttpResponse("Hello World! Welcome to picturesque.")

def get_image(request, size, tag):
    if (size == '2:2' or size == '3:3' or size == '4:4'):
        size = '1:1'
    elif (size == '2:4'):
        size = '1:2'
    elif (size == '4:2'):
        size = '2:1'

    print(size)

    if request.method == 'GET':
        try:
            ratio = Ratio.objects.get(name=size)
            images = ratio.images
            if (tag != ''):
                maintag = Tag.objects.get(name=tag)
                images = images.filter(tags=maintag)

            image_json = {}
            length = len(list(images.all().values()))
            print(length)
            if (length == 0):
                image_json['image_url'] = default_storage.url('images/' + size.replace(':', 'x') + '.jpg')
                image_json['id'] = 0
            else:
                pick = random.choice(list(images.all().values()))
                try:
                    image = Image.objects.get(id=pick['id'])
                    image_json['image_url'] = default_storage.url(image.url)
                    image_json['id'] = image.id
                    if tag == '':
                        image_json['tag'] = list(image.tags.all().values())[0]['name']
                except Image.DoesNotExist:
                    return HttpResponseNotFound()
            return JsonResponse(image_json)        
        except (Ratio.DoesNotExist, Tag.DoesNotExist):
            return HttpResponseNotFound()
    else:
        return HttpResponseNotAllowed(['GET'])

def get_image_error(request, size, tag):
    return HttpResponse(status=204)

def detail_image(request, id):
    if request.method == 'GET':
        image_id = int(id)
        try:
            image = Image.objects.get(id=image_id)

            image_json = {}
            image_json['image_url'] = default_storage.url(image.url)

            tags = []
            for tag in image.tags.all():
                tags.append(tag.name)

            image_json['tags'] = tags
            return JsonResponse(image_json)
        except Image.DoesNotExist:
            return HttpResponseNotFound()
    else:
        return HttpResponseNotAllowed(['GET'])

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
        ratio = get_ratio(int(width), int(height))
        image_model = Image(uploader=uploader, url=image_url, width=width, height=height, uploaded_at=uploaded_at, ratio=ratio)
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


def get_ratio(width, height):
    ratio = width / height

    if (ratio < 0.4):
        key = 0.33
    elif (0.4 <= ratio < 0.6):
        key = 0.50
    elif (0.6 <= ratio < 0.75):
        key = 0.66
    elif (0.75 <= ratio < 0.9):
        key = 0.75
    elif (0.9 <= ratio < 1.2):
        key = 1.00
    elif (1.2 <= ratio < 1.45):
        key = 1.33
    elif (1.45 <= ratio < 1.75):
        key = 1.50
    elif (1.75 <= ratio < 2.5):
        key = 2.00
    else:
        key = 3.00

    return Ratio.objects.get(value=key)

