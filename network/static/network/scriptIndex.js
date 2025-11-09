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

    createAllPostsView();
    // composePost();
};

function load_following() {
    document.querySelector('#all-posts-view').style.display = 'none';
    document.querySelector('#following-view').style.display = 'block';
};

function createAllPostsView() {
  divPostsView = document.querySelector("#div-all-posts");
  divPostsView.innerHTML = '';

  fetch(`/posts/all`)
  .then(response => response.json())
  .then(postItems => {

    postItems.forEach(postItem => {
      
      const body = postItem.body;
      const userWhoPosted = postItem.creator;
      const horario = postItem.timestamp;
      const qtdLikes = postItem.liked_by.length;

      const elementPost = document.createElement('div');
      elementPost.className = 'post-item';
      elementPost.id = `post-id-${postItem.id}`;

      const titlePostElement = document.createElement('h4');
      titlePostElement.textContent = userWhoPosted;
      elementPost.appendChild(titlePostElement);

      // const editAnchorElement = document.createElement('p');
      // // editAnchorElement.href
      // editAnchorElement.innerHTML = "<a>Edit</a>";
      // editAnchorElement.style.fontSize = '14px';
      // elementPost.appendChild(editAnchorElement);

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
      likesEmojiElement.innerHTML = `<em>&#9825;  </em> ${qtdLikes}`;
      elementPost.appendChild(likesEmojiElement);

      likesEmojiElement.addEventListener('click', () => {
        likesEmojiElement.innerHTML = `<em> &#9829; </em> ${qtdLikes+1}`;
      });
      // likesEmojiElement.style.color = 'red'
      // likesEmojiElement.style.fontSize = '32px'
      
      divPostsView.appendChild(elementPost);

      console.log(body, userWhoPosted, horario, qtdLikes)
      
      
    })
  })
}

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




