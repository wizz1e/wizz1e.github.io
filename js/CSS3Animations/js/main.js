/*******************************************************************************
@author Lukasz Jagodzinski <a href="mailto:l.jagodzinsk@samsung.com">l.jagodzinsk@samsung.com</a>
Copyright (c) 2012 Samsung Electronics All Rights Reserved.
*******************************************************************************/
var init = function () {
    var sprite, indicator, addAnimation, removeAnimation;

    sprite = $('#sprite');
    indicator = $('#indicator');

    addAnimation = function (id) {
        if (id >= 1 && id <= 4) {
            sprite.addClass('animation-' + id);
        }
    };

    removeAnimation = function (name) {
        sprite.removeClass(typeof name !== 'undefined' ? name : 'animation-1 animation-2 animation-3 animation-4');
    };

    $('.point').on('click', function (e) {
        var point;

        point = $(this);
        if(!sprite.is('.animation-1, .animation-2, .animation-3, .animation-4')) {
            addAnimation(parseInt(point.attr('id').replace('point-', ''), 10));
        }

        e.stopPropagation();
        e.preventDefault();
    });

    sprite.on({
        'webkitAnimationStart': function (e) {
            if (e.originalEvent.animationName !== 'sprite') {
                indicator.addClass('start');
            }
        },
        'webkitAnimationEnd': function (e) {
            if (e.originalEvent.animationName !== 'sprite') {
                removeAnimation(e.originalEvent.animationName);
                indicator.removeClass('start');
            }
        }
    });
};
window.onload = init;