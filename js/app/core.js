$(function() {

    $('.command-link').on('click', function(evt) {
        evt.preventDefault();
        $.ajax({
            type: "POST",
            url: $(this).attr('href')
        });
    });

});

window.addEventListener('load', function() {
    new FastClick(document.body);
}, false);

