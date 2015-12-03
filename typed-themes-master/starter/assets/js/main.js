!function($) {
    "use strict";
    $.fn.fitVids = function(t) {
        var e = {
            customSelector: null
        };
        if (!document.getElementById("fit-vids-style")) {
            var i = document.head || document.getElementsByTagName("head")[0], r = ".fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}", o = document.createElement("div");
            o.innerHTML = '<p>x</p><style id="fit-vids-style">' + r + "</style>", i.appendChild(o.childNodes[1])
        }
        return t && $.extend(e, t), this.each(function() {
            var t = ["iframe[src*='player.vimeo.com']", "iframe[src*='youtube.com']", "iframe[src*='youtube-nocookie.com']", "iframe[src*='kickstarter.com'][src*='video.html']", "object", "embed"];
            e.customSelector && t.push(e.customSelector);
            var i = $(this).find(t.join(","));
            i = i.not("object object"), i.each(function() {
                var t = $(this);
                if (!("embed" === this.tagName.toLowerCase() && t.parent("object").length || t.parent(".fluid-width-video-wrapper").length)) {
                    var e = "object" === this.tagName.toLowerCase() || t.attr("height")&&!isNaN(parseInt(t.attr("height"), 10)) ? parseInt(t.attr("height"), 10): t.height(), i = isNaN(parseInt(t.attr("width"), 10)) ? t.width(): parseInt(t.attr("width"), 10), r = e / i;
                    if (!t.attr("id")) {
                        var o = "fitvid" + Math.floor(999999 * Math.random());
                        t.attr("id", o)
                    }
                    t.wrap('<div class="fluid-width-video-wrapper"></div>').parent(".fluid-width-video-wrapper").css("padding-top", 100 * r + "%"), t.removeAttr("height").removeAttr("width")
                }
            })
        })
    }
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

