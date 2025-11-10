import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

from django.views.decorators.csrf import csrf_exempt

from .models import User, PostItem


def index(request):
    return render(request, "network/index.html")

#@csrf_exempt ### TODO: Remover exceção depois
@login_required
def compose_post(request):

    # Composing a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    data = json.loads(request.body)

    username = request.user
    body = data.get("body", "")
    
    new_post = PostItem(
        user=username,
        body=body
        )
    
    new_post.save()

    return JsonResponse({"message": "Post sent successfully."}, status=201)

def return_posts(request, user_posts):

    if user_posts=='all':
        posts = PostItem.objects.all()

    elif len(user_posts) > 0:
        try:
            user_id = User.objects.filter(username=user_posts)[0].id
            posts = PostItem.objects.filter(
                user=user_id
            )       
        except:
            return JsonResponse({"error": "Invalid User."}, status=400)
    else:
        return JsonResponse({"error": "Invalid User."}, status=400)


    posts = posts.order_by("-timestamp").all()

    return JsonResponse([postitem.serialize() for postitem in posts], safe=False)

def return_profile_content(request, user_name):
    print(User.objects.filter(username=user_name))
    try:
        usuarios = User.objects.filter(username=user_name)
        return JsonResponse([usuario.serialize() for usuario in usuarios], safe=False)
    except:
        return JsonResponse({"error": "Invalid User."}, status=400)



def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
