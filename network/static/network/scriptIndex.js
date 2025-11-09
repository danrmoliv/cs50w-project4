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

    // composePost();
};

function load_following() {
    document.querySelector('#all-posts-view').style.display = 'none';
    document.querySelector('#following-view').style.display = 'block';
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
      .then(
        document.querySelector('#post-body').value = '')

  }
)

}




