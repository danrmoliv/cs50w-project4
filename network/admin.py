from django.contrib import admin
from .models import User, PostItem

# Register your models here.
admin.site.register(PostItem)
admin.site.register(User)
