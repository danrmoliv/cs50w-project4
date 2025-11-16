document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#all-posts-btn').addEventListener('click', () => load_all_posts());
  document.querySelector('#following-btn').addEventListener('click', () => load_following());


  // By default, load all_posts
  load_all_posts();
});


// Event listener after DOM loaded
document.addEventListener('DOMContentLoaded', function() {

  composePost();

});


function load_all_posts() {
    // Clear out composition fields
    document.querySelector('#post-body').value = '';

    document.querySelector('#all-posts-view').style.display = 'block';
    document.querySelector('#following-view').style.display = 'none';
    document.querySelector('#profile-view').style.display = 'none';

    createAllPostsView();
    // composePost();
};

function load_profile_user(username){
  document.querySelector('#following-view').style.display = 'none';
  document.querySelector('#all-posts-view').style.display = 'none';
  document.querySelector('#profile-view').style.display = 'block';

  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

  const divProfile = document.querySelector("#profile-content");

  fetch(`/profiles/${username}`)
  .then(response => response.json())
  .then(usuarios => {
    usuarios.forEach(usuario => {

      const username = usuario.username;

      const followers = usuario.followers;
      let followersQtd = followers.length;

      const following = usuario.following;
      let followingQtd = following.length;

      divProfile.innerHTML = `<h3>${username}</h3>`
        
      let h5FollowData = document.createElement('h5');
      h5FollowData.innerHTML = `<h5>${followersQtd} Followers      ${followingQtd} Following</h5>`;
      divProfile.appendChild(h5FollowData);

      // console.log(username, followersQtd, followingQtd)

      const followButton = document.createElement('button');
      followButton.className = "btn btn-sm btn-outline-primary";
      followButton.id = "follow-btn";
      followButton.textContent = 'Follow';
      followButton.style.display = 'none';

      divProfile.appendChild(followButton);

      const unfollowButton = document.createElement('button');
      unfollowButton.className = "btn btn-sm btn-outline-primary";
      unfollowButton.id = "follow-btn";
      unfollowButton.textContent = 'Unfollow';
      unfollowButton.style.display = 'none';

      divProfile.appendChild(unfollowButton);

      if (currentUsername !== username) {
        if (followers.includes(currentUsername)){
          unfollowButton.style.display = 'block';
        } else {
          followButton.style.display = 'block';
        };        
      };

      followButton.addEventListener('click', () => {
        // alert(`followClicked ${username}`);

        fetch(`/profiles/${username}`, {
        method: 'PUT',
        headers: {
          // Informa ao servidor que você está enviando JSON
          'Content-Type': 'application/json',
          // Adiciona o token CSRF ao cabeçalho que o Django espera
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            follow: true,
            currentUser: currentUsername
        })
        })
        .then(fetch(`/profiles/${username}`))
        .then(followButton.style.display = 'none')
        .then(unfollowButton.style.display = 'block')
        .then(followersQtd = followersQtd+1)
        .then(h5FollowData.innerHTML = `<h5>${followersQtd} Followers      ${followingQtd} Following</h5>`);

      });

      unfollowButton.addEventListener('click', () => {
        // alert(`unfollowClicked ${username}`)

        fetch(`/profiles/${username}`, {
        method: 'PUT',
        headers: {
          // Informa ao servidor que você está enviando JSON
          'Content-Type': 'application/json',
          // Adiciona o token CSRF ao cabeçalho que o Django espera
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            unfollow: true,
            currentUser: currentUsername
        })
        })
        .then(fetch(`/profiles/${username}`)).then(unfollowButton.style.display = 'none')
        .then(followButton.style.display = 'block').then(fetch(`/posts/following`))
        .then(followersQtd = followersQtd-1)
        .then(h5FollowData.innerHTML = `<h5>${followersQtd} Followers      ${followingQtd} Following</h5>`);

      });

    })
  })
  .then(load_profile_posts(username, document.querySelector('#profile-posts')))
};

function load_profile_posts(username, elementSelector){
  let page = 1

  nextBtn = document.querySelector("#next-btn");
  prevBtn = document.querySelector("#previous-btn");

  prevBtn.style.display='none';

  nextBtn.addEventListener('click', (event) => {
    event.preventDefault();
    page +=1;
    elementSelector.innerHTML = '';

    prevBtn.style.display='block';
  });

  
  prevBtn.addEventListener('click', (event) => {
    event.preventDefault();
    nextBtn.style.display='block';
    if (page > 1){
      page -=1;
      elementSelector.innerHTML = '';
      createPostsCards(username, elementSelector, page);
      if (page < 2) {
        prevBtn.style.display='none';
      }
    } else {
      prevBtn.style.display='none';
    }
    
  });
  
  createPostsCards(username, elementSelector, page);

}

function load_following() {
    document.querySelector('#all-posts-view').style.display = 'none';
    document.querySelector('#following-view').style.display = 'block';
    document.querySelector('#profile-view').style.display = 'none';

    divPostsFollowing = document.querySelector("#following-view");

    divPostsFollowing.innerHTML = ''

    let page = 1

    nextBtn = document.querySelector("#next-btn");
    prevBtn = document.querySelector("#previous-btn");

    prevBtn.style.display='none';

    nextBtn.addEventListener('click', (event) => {
      event.preventDefault();
      page +=1;
      divPostsFollowing.innerHTML = '';

      prevBtn.style.display='block';
    });

    
    prevBtn.addEventListener('click', (event) => {
      event.preventDefault();
      nextBtn.style.display='block';
      if (page > 1){
        page -=1;
        divPostsFollowing.innerHTML = '';
        createPostsCards('following', divPostsFollowing, page)
        
        if (page < 2) {
          prevBtn.style.display='none';
        }

      } else {
        prevBtn.style.display='none';
      }
      
    });


    // load_profile_user('foo');
    fetch(`/posts/following`)
    .then(createPostsCards('following', divPostsFollowing, page));

};

function createDivCard(elementPost, postId, body, qtdLikes, userWhoPosted, horario, csrfToken, fullHeart) {

      const titlePostElement = document.createElement('h4');
      titlePostElement.innerHTML = `<a href="#">${userWhoPosted}</a>`;
      elementPost.appendChild(titlePostElement);

      titlePostElement.addEventListener('click', () => {
        load_profile_user(userWhoPosted);
      });

      // Edit Section
      if (currentUsername === userWhoPosted) {
        const editAnchorElement = document.createElement('p');

        editAnchorElement.innerHTML = "<a href='#'>Edit</a>";
        editAnchorElement.style.fontSize = '14px';
        elementPost.appendChild(editAnchorElement);        

        editAnchorElement.addEventListener('click', (event) => {
          event.preventDefault()
          const formEditElement = document.createElement('form');
          formEditElement.id = 'edit-post';

          formEditElement.innerHTML = `
              <textarea class="form-control" id="edit-body" placeholder="${body}">${body}</textarea>
              <input type="submit" value="Save" class="btn btn-primary"/>
          `
          elementPost.innerHTML = '';
          elementPost.appendChild(formEditElement);  
          
          formEditElement.addEventListener("submit", (event) => { 
                event.preventDefault();

                const bodyEdit = document.querySelector('#edit-body').value;

                console.log(bodyEdit)

                fetch(`/posts/${postId}`, {
                  method: 'PUT',
                  headers: {
                    // Informa ao servidor que você está enviando JSON
                    'Content-Type': 'application/json',
                    // Adiciona o token CSRF ao cabeçalho que o Django espera
                    'X-CSRFToken': csrfToken
                  },
                  body: JSON.stringify({
                      edit: true,
                      bodyEdit: bodyEdit,
                      currentUser: currentUsername
                  })
                  }).then(createDivCard(elementPost, postId, bodyEdit, qtdLikes, userWhoPosted, horario, csrfToken, fullHeart))
                  .then(document.querySelector('#edit-post').style.display = 'none')

              }
            )

        })
      };

      const bodyPostElement = document.createElement('p');
      bodyPostElement.textContent = body;
      elementPost.appendChild(bodyPostElement);

      const tsPostElement = document.createElement('p');
      tsPostElement.textContent = horario;
      tsPostElement.style.color = 'gray';
      tsPostElement.style.fontSize = '14px';
      elementPost.appendChild(tsPostElement);

      
      const likesEmojiElement = document.createElement('p');
      // likesEmojiElement.innerHTML = `&#9825; &#9829; ${qtdLikes}`;
      if (fullHeart) {
        likesEmojiElement.innerHTML = `<a href="#"><em> &#9829; </em></a> ${qtdLikes}`;
      } else {
        likesEmojiElement.innerHTML = `<a href="#"><em>&#9825;  </em></a> ${qtdLikes}`;
      };

      
      elementPost.appendChild(likesEmojiElement);

      likesEmojiElement.addEventListener('click', (event) => {
        event.preventDefault();

        if (fullHeart) {
          qtdLikes = qtdLikes - 1
          likesEmojiElement.innerHTML = `<a href="#"><em>&#9825;  </em></a> ${qtdLikes}`;
          fullHeart = false;

          fetch(`/posts/${postId}`, {
          method: 'PUT',
          headers: {
            // Informa ao servidor que você está enviando JSON
            'Content-Type': 'application/json',
            // Adiciona o token CSRF ao cabeçalho que o Django espera
            'X-CSRFToken': csrfToken
          },
          body: JSON.stringify({
              unlike: true,
              currentUser: currentUsername
          })
          })

        } else {
          qtdLikes = qtdLikes + 1
          likesEmojiElement.innerHTML = `<a href="#"><em> &#9829; </em></a> ${qtdLikes}`;
          fullHeart = true;

          fetch(`/posts/${postId}`, {
          method: 'PUT',
          headers: {
            // Informa ao servidor que você está enviando JSON
            'Content-Type': 'application/json',
            // Adiciona o token CSRF ao cabeçalho que o Django espera
            'X-CSRFToken': csrfToken
          },
          body: JSON.stringify({
              like: true,
              currentUser: currentUsername
          })
          })

        }
        
      });

      return elementPost

}



function createPostsCards(profile, divPostsView, page=1){
  
  fetch(`/posts/${profile}?page=${page}`)
  .then(response => response.json())
  .then(postItems => {
    
    const nextBtn = document.querySelector("#next-btn");

    let pagesReturn = postItems.length

    if (pagesReturn < 10) {
      nextBtn.style.display='none';
    };

    postItems.forEach(postItem => {

      let body = postItem.body;
      let qtdLikes = postItem.liked_by.length;

      const postId = postItem.id;      
      const userWhoPosted = postItem.creator;
      const horario = postItem.timestamp;      
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

      let fullHeart = false

      if (postItem.liked_by.includes(currentUsername)) {
        fullHeart = true;
      };

      let elementPost = document.createElement('div');
      elementPost.className = 'post-item';
      elementPost.id = `post-id-${postItem.id}`;

      elementPost = createDivCard(elementPost, postId, body, qtdLikes, userWhoPosted, horario, csrfToken, fullHeart);
       
      divPostsView.appendChild(elementPost);    

    })
  })

  
};




function createAllPostsView() {
  /// TODO: Contar número de páginas para controlar com base nisso (Continua aumentando o numero de page retornando a mesma coisa)
  divPostsView = document.querySelector("#div-all-posts");
  divPostsView.innerHTML = '';

  let page = 1

  nextBtn = document.querySelector("#next-btn");
  prevBtn = document.querySelector("#previous-btn");
  // prevBtn.disabled = true;
  prevBtn.style.display='none';


  nextBtn.addEventListener('click', (event) => {
    event.preventDefault();
    page +=1;
    
    divPostsView.innerHTML = '';
    createPostsCards('all', divPostsView, page);

    prevBtn.style.display='block';

    // prevBtn.disabled = false;
  });
  
  prevBtn.addEventListener('click', (event) => {
    event.preventDefault();
    nextBtn.style.display='block';
    if (page > 1){
      page -=1;
      divPostsView.innerHTML = '';
      createPostsCards('all', divPostsView, page);
      if (page < 2) {
        prevBtn.style.display='none';
      }
    } else {
      // prevBtn.disabled = true;
      prevBtn.style.display='none';
    }
    
  });


  createPostsCards('all', divPostsView, page);
  
};

function composePost() {
  formDOM = document.querySelector("#compose-post");

  formDOM.addEventListener("submit", (event) => { 
    event.preventDefault();

    const body = document.querySelector('#post-body').value;
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // console.log(body);

    fetch('/posts', {
        method: 'POST',
        headers: {
          // Informa ao servidor que você está enviando JSON
          'Content-Type': 'application/json',
          // Adiciona o token CSRF ao cabeçalho que o Django espera
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            body: body, 
            
        })
      })
      .then(response => response.json())
      .then(result => {
          console.log(result);
      })
      .then(fetch(`/posts/all`).then(createAllPostsView()))
      .then(
        document.querySelector('#post-body').value = '')
      

  }
)

}




