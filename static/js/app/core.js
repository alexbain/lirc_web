var OSUR = {
    util: {}
};

// From Modernizr
// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js
OSUR.util.hasTouchEvents = function() {
    var bool;

    if(('ontouchstart' in window) ||
            window.DocumentTouch &&
            document instanceof DocumentTouch) {
        bool = true;
    }

    return bool;
};

$(function() {

    // command-once buttons send a single command when clicked
    $('.command-once').on('click', function(evt) {
        $.ajax({
            type: "POST",
            url: $(this).attr('href'),
            success: function(data) {},
            error: function(xhr, type) {}
        });
    });

    // command-repeater buttons repeatedly send the command while being clicked
    // (uses send_start and send_stop behind the scenes)
    $('.command-repeater').on('mousedown touchstart', function(evt) {
        $.ajax({
            type: "POST",
            url: $(this).attr('href') + '/send_start',
            success: function(data) {},
            error: function(xhr, type) {}
        });
        $(this).attr('data-active', true);
    });

    // Capture any kind of mouse or touch "out" event
    $('.command-repeater').on('mouseup touchend touchleave touchcancel', function(evt) {
        $.ajax({
            type: "POST",
            url: $(this).attr('href') + '/send_stop',
            success: function(data) {},
            error: function(xhr, type) {}
        });
        $(this).attr('data-active', false);
    });

    // If the user clicks, holds, and drags mouse outside of window - handle that too
    $(window).on('mouseup touchend touchleave touchcancel', function(evt) {
        $('.command-repeater[data-active=true]').trigger('mouseup');
    });

    // macro-link buttons send a command to execute the macro when clicked
    $('.macro-link').on('click', function(evt) {
        evt.preventDefault();
        $.ajax({
            type: "POST",
            url: $(this).attr('href'),
            success: function(data) {},
            error: function(xhr, type) {}
        });
    });

    // Different visual behavior for touch devices
    if (OSUR.util.hasTouchEvents()) {
        $('body').addClass('has-touch');

        $('.command-link, .remote-link').on('touchstart', function(evt) {
            $(this).addClass('active');

        });

        $('.command-link, .remote-link').on('touchend touchleave touchcancel', function(evt) {
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
        $('.macros-nav').removeClass('hidden');
        $('.back').addClass('hidden');
        $('#title').html($('#title').attr('data-text'));
        $('#titlebar').removeClass('is-remote');
    });

    // Navigate to remote pages
    $('.remotes-nav a').on('click', function(evt) {
        evt.preventDefault();
        var href = $(this).attr('href');
        $('.remotes-nav').addClass('hidden');
        $('.macros-nav').addClass('hidden');
        $(href).addClass('active');
        $('.back').removeClass('hidden');
        $('#title').html($(this).html());
        $('#titlebar').addClass('is-remote');
    });

    // Remove 300ms delay after tapping
    OSUR.fastClick = new FastClick(document.body);

});

