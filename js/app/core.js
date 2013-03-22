var OSUR = {};

$(function() {

    // Handle command buttons with AJAX
    $('.command-link').on('click', function(evt) {
        evt.preventDefault();
        $.ajax({
            type: "POST",
            url: $(this).attr('href')
        });
    });

    // Flash highlighted state on touch device to indicate command was received
    $('.command-link').on('touchend', function(evt) {
        var that = this;
        $(this).attr('data-color', $(this).css('background'));
        $(this).css('background', '#2fe2bf');
        setTimeout(function() {
            $(that).css('background', $(that).attr('data-color'));
        }, 100);

    });

    // Back button shown on remote pages
    $('.back').on('click', function(evt) {
        $('.remote.active').removeClass('active');
        $('.remotes-nav').removeClass('hidden');
        $('.back').addClass('hidden');
        $('#title').html($('#title').attr('data-text'));
        $('#titlebar').removeClass('is-remote');
    });

    // Navigate to remote pages
    $('.remotes-nav a').on('click', function(evt) {
        evt.preventDefault();
        var href = $(this).attr('href');
        $('.remotes-nav').addClass('hidden');
        $(href).addClass('active');
        $('.back').removeClass('hidden');
        $('#title').html($(this).html());
        $('#titlebar').addClass('is-remote');
    });


    // Remove 300ms delay after tapping
    OSUR.fastClick = new FastClick(document.body);

});
