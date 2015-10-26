!function($) {
    "use strict";
}(window.jQuery || window.Zepto), $(document).ready(function() {
    $(".post-content").fitVids(), $(".menu-toggle").click(function() {
        $(".site-navigation").slideToggle(250);
        var t = $(".site-navigation .center").outerHeight();
        $(".site-navigation .center").css({
            "margin-top": - (t / 2)
        })
    });
    var t = $(".container > .post-list:first-of-type > .load-wrapper:first-of-type .post-list__item:first-of-type h5 a").attr("href");
    $(".container > .post-list:first-of-type > .load-wrapper:first-of-type .post-list__item:first-of-type .post-excerpt").load(t + " .post-content > p:first-child");
    var e = function(t) {
        var e = $.Deferred();
        return $(".loaded-post-list").last().load(t + " .load-wrapper"), setTimeout(function() {
            e.resolve()
        }, 2e3), e
    }, i = function() {
        var t = $(".post-list").find("a").last().attr("href");
        $(".post-list").append("<div class='loaded-post-list'></div>"), e(t)
    };
    if (0 != $("body").find(".next-link").length) {
        var r = $(".next-link").attr("href");
        e(r)
    }
    !function(t) {
        var r = $(".pages-number").html(), o = parseInt(r);
        if (o - 2 > t) {
            e().done(i);
            var a = arguments.callee;
            window.setTimeout(function() {
                a(t + 1)
            }, 1e3)
        }
    }(0)
});

