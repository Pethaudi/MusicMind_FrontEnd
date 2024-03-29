/*-------------------------------------------------------------*/
/*Download and init google analytics*/
/*-------------------------------------------------------------*/
(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-109816817-1', 'auto');
ga('send', 'pageview');

/*-------------------------------------------------------------*/
/*Init JS*/
/*-------------------------------------------------------------*/
let userID = undefined;
let page = 0;
let query = 'newest';

$(function () {

    /*store own id (for play count)*/
    ga(function(tracker) {
        userID = tracker.get('clientId');
    });

    /*Show tooltips*/
    $('[data-toggle="tooltip"]').tooltip();

    /*enable scrollto buttons*/
    $('.scrollto').click(function () {
        let elem = $('#' + $(this).attr('scrollto'));
        $('html, body').animate({
            scrollTop: elem.offset().top
        }, 1000);
    });

    /*Load more personalities on more click*/
    $('#section-more a').click(function() {
        page++;
        updateMusic();
    });

    /*Search for name*/
    $('#section-header-search').change(function() {
        page = 0;
        query = $(this).val();
        if(!query) query = 'hottest';
        updateMusic();
    });

    /*Show hottest*/
    $('#section-header-a-1').click(function() {
        page = 0;
        query = 'hottest';
        updateMusic();
    });

    /*Show newest*/
    $('#section-header-a-2').click(function() {
        page = 0;
        query = 'newest';
        updateMusic();
    });

    updateMusic();
});

/*-------------------------------------------------------------*/
/*Update the grid by loading new personalities, depending on request*/
/*-------------------------------------------------------------*/
function updateMusic() {
    if(page == 0) {
        clearItems();
    }
    $.get('https://www.musicmindproject.com:8443/backend/rest/music/' + query + '/' + (page * 40) + '/' + ((page + 1) * 40), function (data, status) {
        if (status === 'success') {
            $.each(data, function(key, value) {
                createItem(value);
            });
        }
    });
}

/*-------------------------------------------------------------*/
/*Clear grid*/
/*-------------------------------------------------------------*/
function clearItems() {
    $('#section-elements > .row').empty();
}

/*-------------------------------------------------------------*/
/*Create one grid item with one personality*/
/*-------------------------------------------------------------*/
function createItem(data) {
    let styles = ['light', 'medium'];
    let items = $('#section-elements > .row');
    let item = $('#section-elements-hidden .element').first().clone();

    item.addClass(styles[items.children().length % 2]);

    let traits = ['neuroticism', 'extraversion', 'openness', 'agreeableness', 'conscientiousness'];
    for (let i = 0; i < traits.length; i++) {
        item.find('.personality-' + traits[i]).width(data[traits[i]] + '%');
    }
    item.find('.element-headline').text(data['userName'] + '\'s Music');
    item.find('.element-shares').text(data['shares'] + ' shares');
    item.find('.element-plays').text(data['plays'] + ' plays');
    item.find('.element-more').click(function() {
        window.location.href = 'https://www.musicmindproject.com/?id=' + data['userId'];
    });
    item.find('.element-play button').attr('playing', 'false');
    item.find('.element-play button').attr('clicked', 'false');
    item.find('.element-play button').click(function() {
        if($(this).attr('clicked') === 'false') {
            $(this).attr('clicked', 'true');
            let play = {
                player: userID,
                played: data['userId']
            };
            $.ajax({
                url: 'https://www.musicmindproject.com:8443/backend/rest/music/play',
                contentType: 'application/json; charset=utf-8',
                type: 'POST',
                data: JSON.stringify(play)
            });
        }

        if($(this).attr('playing') === 'true') {
            pauseMusic();
            $(this).find('p').text('Play');
            $(this).attr('playing', 'false');
        } else {
            playMusic(data['filename']);
            $(this).find('p').text('Pause');
            $(this).attr('playing', 'true');
        }
    });

    items.append(item);
}

/*-------------------------------------------------------------*/
/*Play or pause current music*/
/*-------------------------------------------------------------*/
function playMusic(path) {
    let audio = document.getElementById('audio');
    audio.src = 'https://www.musicmindproject.com:443/music/' + path + '.mp3';
    audio.play();

    $('.element-play button').attr('playing', 'false');
    $('.element-play button p').text('Play');
}

function pauseMusic() {
    let audio = document.getElementById('audio');
    audio.pause();
    audio.currentTime = 0;
}