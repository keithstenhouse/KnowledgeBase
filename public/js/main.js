$(document).ready(() => {
    $('.delete-article').on('click', (event) => {
        const id = $(event.target).attr('data-id');
 
        if (confirm('Are you sure you want to delete the article?')) {
            $.ajax({
                type: 'DELETE',
                url: '/articles/'+id,
                success: response => {
                    window.location.href='/';
                },
                error: err => {
                    console.log(err);
                }
            });
        }
    });
});