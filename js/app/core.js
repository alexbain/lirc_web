$(function() {

    // Handle command buttons with AJAX
    $('.command-link').on('click', function(evt) {
        evt.preventDefault();
        $.ajax({
            type: "POST",
            url: $(this).attr('href')
        });
    });

    // Flash highlighted state to indicate command was received
    $('.command-link').on('touchend', function(evt) {
        var that = this;
        $(this).attr('data-color', $(this).css('background'));
        $(this).css('background', '#2fe2bf');
        setTimeout(function() {
            $(that).css('background', $(that).attr('data-color'));
        }, 100);

    });

    // Remove 300ms delay after tapping
    new FastClick(document.body);

});
