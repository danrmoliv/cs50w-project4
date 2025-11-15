import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

from django.core.paginator import Paginator

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
    if request.method == "PUT":

        data = json.loads(request.body)
        usuario_request = User.objects.get(username=data.get("currentUser"))

        post_item = PostItem.objects.get(id=user_posts)

        print(post_item)

        if data.get("like"):
 
            post_item.liked_by.add(usuario_request)

            post_item.save()

        elif data.get("unlike"):

            post_item.liked_by.remove(usuario_request)
            
            post_item.save()

        print(data, user_posts, post_item)

        return HttpResponse(status=204)

    if user_posts=='all':
        posts = PostItem.objects.all()
    
    elif user_posts=='following':
        usuario_object = User.objects.filter(username=request.user.username)
        usuarios_following = usuario_object.first().following.all()
        posts = PostItem.objects.filter(user__in=usuarios_following)

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

    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return JsonResponse([postitem.serialize() for postitem in page_obj], safe=False)


def return_profile_content(request, user_name):
    
    if request.method == "GET":
        try:
            usuarios = User.objects.filter(username=user_name)
            return JsonResponse([usuario.serialize() for usuario in usuarios], safe=False)
        except:
            return JsonResponse({"error": "Invalid User."}, status=400)
    elif request.method == "PUT":
        data = json.loads(request.body)

        usuario = User.objects.get(username=user_name)
        usuario_request = User.objects.get(username=data.get("currentUser"))

        if data.get("follow"):
 
            usuario.followers.add(usuario_request)
            usuario_request.following.add(usuario)

            usuario.save()
            usuario_request.save()   
            
        elif data.get("unfollow"):
 
            usuario.followers.remove(usuario_request)
            usuario_request.following.remove(usuario)

            usuario.save()
            usuario_request.save()   

        return HttpResponse(status=204)




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
