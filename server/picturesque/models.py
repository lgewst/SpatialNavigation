from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now

# Create your models here.

class Tag(models.Model):
    name = models.CharField(max_length=64)

    def __str__(self):
        return self.name

class Image(models.Model):
    uploader = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='images',
        null=False
    )
    url = models.CharField(max_length=255)
    width = models.IntegerField()
    height = models.IntegerField()
    uploaded_at = models.DateTimeField(default=now)
    tags = models.ManyToManyField(
        Tag,
        related_name='images'
    )
    def __str__(self):
        return self.uploader.username + '_' + self.uploaded_at.strftime("%Y%m%d%H%M%S")
