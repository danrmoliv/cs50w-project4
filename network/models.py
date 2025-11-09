from django.contrib.auth.models import AbstractUser
from django.db import models

### TODO: Verificar como modelar following

class User(AbstractUser):
    following = models.ManyToManyField('self', related_name='following')
    followers = models.ManyToManyField('self', related_name='followers') 

    def serialize(self):
        return {
            "id": self.id,
            'followers': [user.username for user in self.followers.all()],
            'following': [user.username for user in self.following.all()]
        }

class PostItem(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    body = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    liked_by = models.ManyToManyField(User, blank=True, related_name="posts_liked")

    def __str__(self):
        return f"{self.user} - Post: {self.body} - {self.timestamp}"
    

    def serialize(self):
        return {
            "id": self.id,
            "creator": self.user.username,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "liked_by": self.liked_by
        }