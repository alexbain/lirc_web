var OSUR = {
        util: {}
    };

$(function() {

    // Handle command buttons with AJAX
    $('.command-link').on('click', function(evt) {
        $.ajax({
            type: "POST",
            url: $(this).attr('href'),
            success: function(data) {
            },
            error: function(xhr, type) {
            }
        });
    });

    if (OSUR.util.hasTouchEvents()) {
        $('body').addClass('has-touch');
        $('.command-link, .remote-link').on('touchstart', function(evt) {
            $(this).addClass('active');
        });
        $('.command-link, .remote-link').on('touchend', function(evt) {
            $(this).removeClass('active');
        });
        $('body').on('touchcancel', function(evt) {
            $('.command-link').removeClass('active');
        });
    } else {
        $('body').addClass('no-touch');
    }

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

OSUR.util.hasTouchEvents = function() {
    // From Modernizr
    // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js
    var bool;

    if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
        bool = true;
    }

    return bool;
};
