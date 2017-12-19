from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.core.files.storage import default_storage

# Create your views here.
def index(request):
    return HttpResponse("Hello World! Welcome to picturesque.")

def simple_upload(request):
    # get files from request.FILES - https://docs.djangoproject.com/en/1.11/topics/http/file-uploads/
    image = request.FILES.get("myimage", None)
    if request.method == 'POST' and image is not None:
        imageurl = default_storage.save('images/' + image.name, image)
        uploaded_file_url = default_storage.url(imageurl)
        return render(request, 'upload.html', {
            'uploaded_file_url': uploaded_file_url
        })
    return render(request, 'upload.html')
