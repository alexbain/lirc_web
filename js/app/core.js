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

    // Compute thresholds
    var offsets = []
    $.each($('.remote h2'), function(index, item) {
        offsets.push({ el: item, top: $(item).offset().top});
    });

    // Sticky headers
    window.onscroll = function(evt) {
        var bodyTop = document.body.scrollTop;

        if (bodyTop < offsets[0].top) {
            $('.remote h2').removeClass('active');
        } else {
            $.each(offsets, function(index, item) {
                console.log(index, item, item.top, top);
                var next = offsets[index+1] ? offsets[index+1].top : document.height;
                if (bodyTop + 100 > item.top && bodyTop + 100 <= next) {
                    console.log("Should be adding a class");
                    $('.remote h2').removeClass('active');
                    $($('.remote h2')[index]).addClass('active');
                }
            });
        }
    };

    // Clicking on the header should bring it to the top
    $('h2').on('click', function(evt) {
        window.scrollTo(0, $(this).offset().top);
    });

    // Remove 300ms delay after tapping
    new FastClick(document.body);

});
