(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(function($, undefined) {
    'use strict';
    $.infinitescroll = function infscr(options, callback, element) {
        this.element = $(element);
        if (!this._create(options, callback)) {
            this.failed = true;
        }
    };
    $.infinitescroll.defaults = {
        loading: {
            finished: undefined,
            finishedMsg: "",
            msg: null,
            msgText: '<em>Getting more content...</em>',
            selector: null,
            speed: 'fast',
            start: undefined
        },
        state: {
            isDuringAjax: false,
            isInvalidPage: false,
            isDestroyed: false,
            isDone: false,
            isPaused: false,
            isBeyondMaxPage: false,
            currPage: 1
        },
        debug: false,
        behavior: undefined,
        binder: $(window),
        nextSelector: 'div.navigation a:first',
        navSelector: 'div.navigation',
        contentSelector: null,
        extraScrollPx: 150,
        itemSelector: 'div.post',
        animate: false,
        pathParse: undefined,
        dataType: 'html',
        appendCallback: true,
        bufferPx: 40,
        errorCallback: function() {},
        infid: 0,
        pixelsFromNavToBottom: undefined,
        path: undefined,
        prefill: false,
        maxPage: undefined
    };
    $.infinitescroll.prototype = {
        _binding: function infscr_binding(binding) {
            var instance = this, opts = instance.options;
            opts.v = '2.0b2.120520';
            if (!!opts.behavior && this['_binding_' + opts.behavior] !== undefined) {
                this['_binding_' + opts.behavior].call(this);
                return;
            }
            if (binding !== 'bind' && binding !== 'unbind') {
                this._debug('Binding value  ' + binding + ' not valid');
                return false;
            }
            if (binding === 'unbind') {
                (this.options.binder).unbind('smartscroll.infscr.' + instance.options.infid);
            } else {
                (this.options.binder)[binding]('smartscroll.infscr.' + instance.options.infid, function() {
                    instance.scroll();
                });
            }
            this._debug('Binding', binding);
        },
        _create: function infscr_create(options, callback) {
            var opts = $.extend(true, {}, $.infinitescroll.defaults, options);
            this.options = opts;
            var $window = $(window);
            var instance = this;
            if (!instance._validate(options)) {
                return false;
            }
            var path = $(opts.nextSelector).attr('href');
            if (!path) {
                this._debug('Navigation selector not found');
                return false;
            }
            opts.path = opts.path || this._determinepath(path);
            opts.contentSelector = opts.contentSelector || this.element;
            opts.loading.selector = opts.loading.selector || opts.contentSelector;
            opts.loading.msg = opts.loading.msg || $('<div id="infscr-loading"></div>');
            (new Image()).src = opts.loading.img;
            if (opts.pixelsFromNavToBottom === undefined) {
                opts.pixelsFromNavToBottom = $(document).height() - $(opts.navSelector).offset().top;
                this._debug('pixelsFromNavToBottom: ' + opts.pixelsFromNavToBottom);
            }
            var self = this;
            opts.loading.start = opts.loading.start || function() {
                $(opts.navSelector).hide();
                opts.loading.msg.appendTo(opts.loading.selector).show(opts.loading.speed, $.proxy(function() {
                    this.beginAjax(opts);
                }, self));
            };
            opts.loading.finished = opts.loading.finished || function() {
                if (!opts.state.isBeyondMaxPage)
                    opts.loading.msg.fadeOut(opts.loading.speed);
            };
            opts.callback = function(instance, data, url) {
                if (!!opts.behavior && instance['_callback_' + opts.behavior] !== undefined) {
                    instance['_callback_' + opts.behavior].call($(opts.contentSelector)[0], data, url);
                }
                if (callback) {
                    callback.call($(opts.contentSelector)[0], data, opts, url);
                }
                if (opts.prefill) {
                    $window.bind('resize.infinite-scroll', instance._prefill);
                }
            };
            if (options.debug) {
                if (Function.prototype.bind && (typeof console === 'object' || typeof console === 'function') && typeof console.log === 'object') {
                    ['log', 'info', 'warn', 'error', 'assert', 'dir', 'clear', 'profile', 'profileEnd'].forEach(function(method) {
                        console[method] = this.call(console[method], console);
                    }, Function.prototype.bind);
                }
            }
            this._setup();
            if (opts.prefill) {
                this._prefill();
            }
            return true;
        },
        _prefill: function infscr_prefill() {
            var instance = this;
            var $window = $(window);
            function needsPrefill() {
                return ($(instance.options.contentSelector).height() <= $window.height());
            }
            this._prefill = function() {
                if (needsPrefill()) {
                    instance.scroll();
                }
                $window.bind('resize.infinite-scroll', function() {
                    if (needsPrefill()) {
                        $window.unbind('resize.infinite-scroll');
                        instance.scroll();
                    }
                });
            };
            this._prefill();
        },
        _debug: function infscr_debug() {
            if (true !== this.options.debug) {
                return;
            }
            if (typeof console !== 'undefined' && typeof console.log === 'function') {
                if ((Array.prototype.slice.call(arguments)).length === 1 && typeof Array.prototype.slice.call(arguments)[0] === 'string') {
                    console.log((Array.prototype.slice.call(arguments)).toString());
                } else {
                    console.log(Array.prototype.slice.call(arguments));
                }
            } else if (!Function.prototype.bind && typeof console !== 'undefined' && typeof console.log === 'object') {
                Function.prototype.call.call(console.log, console, Array.prototype.slice.call(arguments));
            }
        },
        _determinepath: function infscr_determinepath(path) {
            var opts = this.options;
            if (!!opts.behavior && this['_determinepath_' + opts.behavior] !== undefined) {
                return this['_determinepath_' + opts.behavior].call(this, path);
            }
            if (!!opts.pathParse) {
                this._debug('pathParse manual');
                return opts.pathParse(path, this.options.state.currPage + 1);
            } else if (path.match(/^(.*?)\b2\b(.*?$)/)) {
                path = path.match(/^(.*?)\b2\b(.*?$)/).slice(1);
            } else if (path.match(/^(.*?)2(.*?$)/)) {
                if (path.match(/^(.*?page=)2(\/.*|$)/)) {
                    path = path.match(/^(.*?page=)2(\/.*|$)/).slice(1);
                    return path;
                }
                path = path.match(/^(.*?)2(.*?$)/).slice(1);
            } else {
                if (path.match(/^(.*?page=)1(\/.*|$)/)) {
                    path = path.match(/^(.*?page=)1(\/.*|$)/).slice(1);
                    return path;
                } else {
                    this._debug("Sorry, we couldn't parse your Next (Previous Posts) URL. Verify your the css selector points to the correct A tag. If you still get this error: yell, scream, and kindly ask for help at infinite-scroll.com.");
                    opts.state.isInvalidPage = true;
                }
            }
            this._debug('determinePath', path);
            return path;
        },
        _error: function infscr_error(xhr) {
            var opts = this.options;
            if (!!opts.behavior && this['_error_' + opts.behavior] !== undefined) {
                this['_error_' + opts.behavior].call(this, xhr);
                return;
            }
            if (xhr !== 'destroy' && xhr !== 'end') {
                xhr = 'unknown';
            }
            this._debug('Error', xhr);
            if (xhr === 'end' || opts.state.isBeyondMaxPage) {
                this._showdonemsg();
            }
            opts.state.isDone = true;
            opts.state.currPage = 1;
            opts.state.isPaused = false;
            opts.state.isBeyondMaxPage = false;
            this._binding('unbind');
        },
        _loadcallback: function infscr_loadcallback(box, data, url) {
            var opts = this.options, callback = this.options.callback, result = (opts.state.isDone) ? 'done': (!opts.appendCallback) ? 'no-append': 'append', frag;
            if (!!opts.behavior && this['_loadcallback_' + opts.behavior] !== undefined) {
                this['_loadcallback_' + opts.behavior].call(this, box, data, url);
                return;
            }
            switch (result) {
            case'done':
                this._showdonemsg();
                return false;
            case'no-append':
                if (opts.dataType === 'html') {
                    data = '<div>' + data + '</div>';
                    data = $(data).find(opts.itemSelector);
                }
                if (data.length === 0) {
                    return this._error('end');
                }
                break;
            case'append':
                var children = box.children();
                if (children.length === 0) {
                    return this._error('end');
                }
                frag = document.createDocumentFragment();
                while (box[0].firstChild) {
                    frag.appendChild(box[0].firstChild);
                }
                this._debug('contentSelector', $(opts.contentSelector)[0]);
                $(opts.contentSelector)[0].appendChild(frag);
                data = children.get();
                break;
            }
            opts.loading.finished.call($(opts.contentSelector)[0], opts);
            if (opts.animate) {
                var scrollTo = $(window).scrollTop() + $(opts.loading.msg).height() + opts.extraScrollPx + 'px';
                $('html,body').animate({
                    scrollTop: scrollTo
                }, 800, function() {
                    opts.state.isDuringAjax = false;
                });
            }
            if (!opts.animate) {
                opts.state.isDuringAjax = false;
            }
            callback(this, data, url);
            if (opts.prefill) {
                this._prefill();
            }
        },
        _nearbottom: function infscr_nearbottom() {
            var opts = this.options, pixelsFromWindowBottomToBottom = 0 + $(document).height() - (opts.binder.scrollTop()) - $(window).height();
            if (!!opts.behavior && this['_nearbottom_' + opts.behavior] !== undefined) {
                return this['_nearbottom_' + opts.behavior].call(this);
            }
            this._debug('math:', pixelsFromWindowBottomToBottom, opts.pixelsFromNavToBottom);
            return (pixelsFromWindowBottomToBottom - opts.bufferPx < opts.pixelsFromNavToBottom);
        },
        _pausing: function infscr_pausing(pause) {
            var opts = this.options;
            if (!!opts.behavior && this['_pausing_' + opts.behavior] !== undefined) {
                this['_pausing_' + opts.behavior].call(this, pause);
                return;
            }
            if (pause !== 'pause' && pause !== 'resume' && pause !== null) {
                this._debug('Invalid argument. Toggling pause value instead');
            }
            pause = (pause && (pause === 'pause' || pause === 'resume')) ? pause : 'toggle';
            switch (pause) {
            case'pause':
                opts.state.isPaused = true;
                break;
            case'resume':
                opts.state.isPaused = false;
                break;
            case'toggle':
                opts.state.isPaused=!opts.state.isPaused;
                break;
            }
            this._debug('Paused', opts.state.isPaused);
            return false;
        },
        _setup: function infscr_setup() {
            var opts = this.options;
            if (!!opts.behavior && this['_setup_' + opts.behavior] !== undefined) {
                this['_setup_' + opts.behavior].call(this);
                return;
            }
            this._binding('bind');
            return false;
        },
        _showdonemsg: function infscr_showdonemsg() {
            var opts = this.options;
            if (!!opts.behavior && this['_showdonemsg_' + opts.behavior] !== undefined) {
                this['_showdonemsg_' + opts.behavior].call(this);
                return;
            }
            opts.loading.msg.find('img').hide().parent().find('div').html(opts.loading.finishedMsg).animate({
                opacity: 1
            }, 2000, function() {
                $(this).parent().fadeOut(opts.loading.speed);
            });
            opts.errorCallback.call($(opts.contentSelector)[0], 'done');
        },
        _validate: function infscr_validate(opts) {
            for (var key in opts) {
                if (key.indexOf && key.indexOf('Selector')>-1 && $(opts[key]).length === 0) {
                    this._debug('Your ' + key + ' found no elements.');
                    return false;
                }
            }
            return true;
        },
        bind: function infscr_bind() {
            this._binding('bind');
        },
        destroy: function infscr_destroy() {
            this.options.state.isDestroyed = true;
            this.options.loading.finished();
            return this._error('destroy');
        },
        pause: function infscr_pause() {
            this._pausing('pause');
        },
        resume: function infscr_resume() {
            this._pausing('resume');
        },
        beginAjax: function infscr_ajax(opts) {
            var instance = this, path = opts.path, box, desturl, method, condition;
            opts.state.currPage++;
            if (opts.maxPage !== undefined && opts.state.currPage > opts.maxPage) {
                opts.state.isBeyondMaxPage = true;
                this.destroy();
                return;
            }
            box = $(opts.contentSelector).is('table, tbody') ? $('<tbody/>') : $('<div/>');
            desturl = (typeof path === 'function') ? path(opts.state.currPage) : path.join(opts.state.currPage);
            instance._debug('heading into ajax', desturl);
            method = (opts.dataType === 'html' || opts.dataType === 'json') ? opts.dataType : 'html+callback';
            if (opts.appendCallback && opts.dataType === 'html') {
                method += '+callback';
            }
            switch (method) {
            case'html+callback':
                instance._debug('Using HTML via .load() method');
                box.load(desturl + ' ' + opts.itemSelector, undefined, function infscr_ajax_callback(responseText) {
                    instance._loadcallback(box, responseText, desturl);
                });
                break;
            case'html':
                instance._debug('Using ' + (method.toUpperCase()) + ' via $.ajax() method');
                $.ajax({
                    url: desturl,
                    dataType: opts.dataType,
                    complete: function infscr_ajax_callback(jqXHR, textStatus) {
                        condition = (typeof(jqXHR.isResolved) !== 'undefined') ? (jqXHR.isResolved()) : (textStatus === 'success' || textStatus === 'notmodified');
                        if (condition) {
                            instance._loadcallback(box, jqXHR.responseText, desturl);
                        } else {
                            instance._error('end');
                        }
                    }
                });
                break;
            case'json':
                instance._debug('Using ' + (method.toUpperCase()) + ' via $.ajax() method');
                $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: desturl,
                    success: function(data, textStatus, jqXHR) {
                        condition = (typeof(jqXHR.isResolved) !== 'undefined') ? (jqXHR.isResolved()) : (textStatus === 'success' || textStatus === 'notmodified');
                        if (opts.appendCallback) {
                            if (opts.template !== undefined) {
                                var theData = opts.template(data);
                                box.append(theData);
                                if (condition) {
                                    instance._loadcallback(box, theData);
                                } else {
                                    instance._error('end');
                                }
                            } else {
                                instance._debug('template must be defined.');
                                instance._error('end');
                            }
                        } else {
                            if (condition) {
                                instance._loadcallback(box, data, desturl);
                            } else {
                                instance._error('end');
                            }
                        }
                    },
                    error: function() {
                        instance._debug('JSON ajax request failed.');
                        instance._error('end');
                    }
                });
                break;
            }
        },
        retrieve: function infscr_retrieve(pageNum) {
            pageNum = pageNum || null;
            var instance = this, opts = instance.options;
            if (!!opts.behavior && this['retrieve_' + opts.behavior] !== undefined) {
                this['retrieve_' + opts.behavior].call(this, pageNum);
                return;
            }
            if (opts.state.isDestroyed) {
                this._debug('Instance is destroyed');
                return false;
            }
            opts.state.isDuringAjax = true;
            opts.loading.start.call($(opts.contentSelector)[0], opts);
        },
        scroll: function infscr_scroll() {
            var opts = this.options, state = opts.state;
            if (!!opts.behavior && this['scroll_' + opts.behavior] !== undefined) {
                this['scroll_' + opts.behavior].call(this);
                return;
            }
            if (state.isDuringAjax || state.isInvalidPage || state.isDone || state.isDestroyed || state.isPaused) {
                return;
            }
            if (!this._nearbottom()) {
                return;
            }
            this.retrieve();
        },
        toggle: function infscr_toggle() {
            this._pausing();
        },
        unbind: function infscr_unbind() {
            this._binding('unbind');
        },
        update: function infscr_options(key) {
            if ($.isPlainObject(key)) {
                this.options = $.extend(true, this.options, key);
            }
        }
    };
    $.fn.infinitescroll = function infscr_init(options, callback) {
        var thisCall = typeof options;
        switch (thisCall) {
        case'string':
            var args = Array.prototype.slice.call(arguments, 1);
            this.each(function() {
                var instance = $.data(this, 'infinitescroll');
                if (!instance) {
                    return false;
                }
                if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
                    return false;
                }
                instance[options].apply(instance, args);
            });
            break;
        case'object':
            this.each(function() {
                var instance = $.data(this, 'infinitescroll');
                if (instance) {
                    instance.update(options);
                } else {
                    instance = new $.infinitescroll(options, callback, this);
                    if (!instance.failed) {
                        $.data(this, 'infinitescroll', instance);
                    }
                }
            });
            break;
        }
        return this;
    };
    var event = $.event, scrollTimeout;
    event.special.smartscroll = {
        setup: function() {
            $(this).bind('scroll', event.special.smartscroll.handler);
        },
        teardown: function() {
            $(this).unbind('scroll', event.special.smartscroll.handler);
        },
        handler: function(event, execAsap) {
            var context = this, args = arguments;
            event.type = 'smartscroll';
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(function() {
                $(context).trigger('smartscroll', args);
            }, execAsap === 'execAsap' ? 0 : 100);
        }
    };
    $.fn.smartscroll = function(fn) {
        return fn ? this.bind('smartscroll', fn) : this.trigger('smartscroll', ['execAsap']);
    };
}));
$('#blog-roll').infinitescroll({
    nextSelector: ".site-pagination a",
    navSelector: ".site-pagination",
    itemSelector: "#blog-roll"
});
$('#blog-roll').infinitescroll('retrieve');
$('#blog-roll').infinitescroll('retrieve');
$('#blog-roll').infinitescroll('retrieve');
InstantClick.on('change', function() {
    $('#blog-roll').infinitescroll({
        nextSelector: ".site-pagination a",
        navSelector: ".site-pagination",
        itemSelector: "#blog-roll"
    });
    $('#blog-roll').infinitescroll('retrieve');
    $('#blog-roll').infinitescroll('retrieve');
    $('#blog-roll').infinitescroll('retrieve');
});

