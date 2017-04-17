(function ($) {
    var getDocHeight    = function () {
        var doc = document;
        return Math.max(
            Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight),
            Math.max(doc.body.offsetHeight, doc.documentElement.offsetHeight),
            Math.max(doc.body.clientHeight, doc.documentElement.clientHeight)
        );
    };
    var checkboxClick   = function () {
        var holder = $(this).parents(".ui-checkbox");
        if (this.tagName.toLowerCase() == "span") {
            var checkbox = holder.find("input[type=checkbox]");
            checkbox.click();
            return;
        }
        if ($(this).is(":checked")) {
            holder.addClass("checked");
        }
        else {
            holder.removeClass("checked");
        }
    };
    var radioGroupClick = function () {
        var holder = $(this).parents(".ui-radiobox");
        if (this.tagName.toLowerCase() == "span") {
            var checkbox = holder.find("input[type=radio]");
            checkbox.click();
            return;
        }
        var name   = $(this).attr("name");
        var radios = $("input[name='" + name + "']");
        $.each(radios, function () {
            var holder = $(this).parents(".ui-radiobox");
            if ($(this).is(":checked")) {
                holder.addClass("checked");
            }
            else {
                holder.removeClass("checked");
            }
        });
    };
    var tidaWrapper     = $.tida;
    $.extend($, {
        isMobile     : function () {
            var agent = navigator.userAgent;
            if (!agent || !agent.toLowerCase) return false;
            agent        = agent.toLowerCase();
            var keywords = ["android", "iphone",
                "symbianos", "windows phone",
                "ipad", "ipod", "mqqbrowser"];
            for (var v = 0; v < keywords.length; v++) {
                if (agent.indexOf(keywords[v]) > 0) {
                    return true;
                }
            }
            return false;
        },
        isAndroid    : function () {
            var agent = navigator.userAgent;
            if (!agent || !agent.toLowerCase) return false;
            agent        = agent.toLowerCase();
            var keywords = ["android"];
            for (var v = 0; v < keywords.length; v++) {
                if (agent.indexOf(keywords[v]) > 0) {
                    return true;
                }
            }
            return false;
        },
        isInWeixin   : function () {
            var agent = navigator.userAgent;
            if (!agent || !agent.toLowerCase) return false;
            agent = agent.toLowerCase();
            if (agent.match(/MicroMessenger/i) == 'micromessenger') {
                return true;
            } else {
                return false;
            }
        },
        toast        : function (message, options) {
            if (tidaWrapper && tidaWrapper.toast(message)) {
                return;
            }
            if (!options) {
                options = {};
            }
            options.text     = message;
            options.type     = options.type || "success";
            options.position = options.position || "middle-center";
            options.stayTime = options.stayTime || 2000;
            var result       = $().toastmessage('showToast', options);
            return result;
        },
        errorToast   : function (message) {
            return $.toast(message, {type: "error"});
        },
        alert        : function (message, callback) {
            var options = {
                skin    : "ui-alert-dialog",
                title   : "提示",
                message : message,
                callback: callback
            };
            if (typeof(message) == "object") {
                options = $.extend(options, message);
            }
            var cb     = options.callback;
            var dialog = $("." + options.skin);
            if (!dialog.length) {
                dialog = $('<div class="' + options.skin + ' modal-container"><div class="modal zoomIn animated"><div class="title">' + options.title + '</div><div class="content">' + options.message + '</div><div class="footer"><button>确定</button></div></div></div>');
                dialog.appendTo($("body"));
                dialog.find("button").click(function () {
                    var dialog = $(this).parents(".modal-container");
                    dialog.popup("hide");
                    if (cb) {
                        cb();
                    }
                });
            }
            else {
                dialog.find(".content").html(options.message);
            }
            dialog.popup("show", {adjustSize: true});
        },
        confirm      : function (message, callback) {
            var dialog = $(".ui-confirm-dialog");
            if (!dialog.length) {
                dialog = $('<div class="ui-confirm-dialog modal-container"><div class="modal zoomIn animated"><div class="title">提示</div><div class="content">' + message + '</div><div class="footer"><button class="ui-btn-ok">确定</button><button class="ui-btn-cancel">取消</button></div></div></div>');
                dialog.appendTo($("body"));
                dialog.find(".footer button").click(function () {
                    var $this  = $(this);
                    var dialog = $this.parents(".modal-container");
                    dialog.popup("hide");
                    if (callback && $this.hasClass("ui-btn-ok")) {
                        callback();
                    }
                });
            }
            else {
                dialog.find(".content").text(message);
            }
            dialog.popup("show", {adjustSize: true});
        },
        showLoading  : function (message) {
            if (window.layer) {
                this._layerId = layer.open({type: 2, content: message || '请稍候...', closeBtn: false})

                return this._layerId
            }

            if (tidaWrapper && tidaWrapper.showLoading(message)) {
                this.showOverlay('loading');
                return;
            }
            message    = message || "&nbsp;&nbsp;请稍候...";
            var loader = $(".ui-loader");
            if (!loader.length) {
                loader = $('<div class="ui-loader ui-corner-all ui-body-b ui-loader-verbose"><span class="ui-icon-loading"></span><h1>' + message + '</h1></div>');
                loader.appendTo($("body"));
            }
            else {
                loader.find("h1").html(message);
            }
            $("html").addClass("ui-loading");
            this.showOverlay('loading');
        },
        hideLoading  : function () {
            if (window.layer) {
                (this._layerId || this._layerId == 0) ? layer.close(this._layerId) : layer.closeAll()
            }

            if (tidaWrapper && tidaWrapper.hideLoading()) {
                this.hideOverlay('loading');
                return;
            }
            $("html").removeClass("ui-loading");
            this.hideOverlay('loading');
        },
        getNextZIndex: function () {
            if (!$.overlayCfgs) {
                $.overlayCfgs = {zindex: 1099};
            }
            return $.overlayCfgs.zindex++;
        },
        showOverlay  : function (category) {
            var sel     = category ? "." + category : "";
            category    = category || "";
            var overlay = $(".ui-overlay-a" + sel);
            if (!overlay.length) {
                overlay = $('<div class="ui-overlay-a ' + category + '"></div>');
                overlay.appendTo($("body"));
            }
            var zindex = $.getNextZIndex();
            overlay.css("z-index", zindex);
            overlay.show();
            var height = getDocHeight();
            overlay.height(height);
        },
        hideOverlay  : function (category) {
            var sel     = category ? "." + category : "";
            var overlay = $(".ui-overlay-a" + sel);
            overlay.hide();
        },
        doAjax       : function (opt) {
            var defer  = $.Deferred();
            var option = {
                traditional     : true,
                mask            : true,
                type            : "POST",
                contentType     : "application/x-www-form-urlencoded; charset=UTF-8", //zepto默认contentType没有指定charset编码，导致ews中文乱码
                error           : function (e, b, c) {
                    defer.reject(e.responseText);
                    if (option.skipError) {
                        return;
                    }
                    if (e.status == 403) {
                        option.noPermission(e.responseText || "您没有权限访问该页面。");
                    }
                    else {
                        $.alert(e.responseText || "系统繁忙，请重试");
                    }
                },
                beforeSend      : function () {
                    if (!window.AJAX_ARR)
                        window.AJAX_ARR = [];
                    window.AJAX_ARR.push(1);

                    if (option.mask) {
                        window.AJAX_LOADING = true;
                        $.showLoading();
                    }
                },
                complete        : function () {
                    if (window.AJAX_ARR)
                        window.AJAX_ARR.pop();

                    if (window.AJAX_ARR && window.AJAX_ARR.length <= 0 && window.AJAX_LOADING) {
                        window.AJAX_LOADING = false;
                        $.hideLoading();
                    }
                },
                success_wrapper : function (rslt) {
                    if (rslt.success == false) {
                        if (rslt.code == 7899) {
                            defer.reject(rslt);
                            option.validateError(rslt.data, rslt.message);
                            console.error("服务端校验不通过:" + rslt.message);
                            return;
                        }
                        if (rslt.code == 403) {
                            defer.reject(rslt);
                            option.notAuthenticated(rslt);
                            return;
                        }
                    }
                    if (option.success_cb) {
                        try {
                            option.success_cb(rslt);
                        } catch (ex) {
                            console.error(ex);
                        }
                    }
                    try {
                        defer.resolve(rslt);
                    } catch (ex) {
                        console.error(ex);
                    }
                },
                noPermission    : function (rslt) {
                    //$.ui.alert(rslt, { title: '没有权限', height: 375, width: 600 });
                    $.errorToast(rslt);
                },
                validateError   : function (errors, message) {
                    var errorList = [];
                    var validator = new $.validator();
                    var handled   = false;
                    $.each(errors, function () {
                        var key = this.key;
                        var e   = key ? $("#" + key) : null;
                        if (e && e.length) {
                            e = e[0];
                            $.each(this.errors, function () {
                                validator.settings.invalidHandler.call(validator, this.toString(), e);
                                handled = true;
                            });
                        }
                    });
                    if (!handled && message) {
                        $.alert(message);
                    }
                },
                notAuthenticated: function (rslt) {
                    var url           = document.location.pathname;
                    url               = encodeURI(url);
                    document.location = "/account/login?returnUrl=" + url;
                }
            };
            $.extend(option, opt);
            if (option.jsonData) {
                option.data        = JSON.stringify(option.jsonData);
                option.contentType = "application/json; charset=utf-8";
            }
            option.success_cb = option.success;
            option.success    = option.success_wrapper;
            $.ajax(option);
            return defer.promise();
        },
        scrollBottom : function (callback) {
            $(window).scroll(function () {
                if (($(window).scrollTop() + $(window).height() > $(document).height() - 40)) {
                    callback();
                }
            });
        },
        getUserNick  : function (success, failed) {
            //具体代码移到tida-wrapper里了,这里还保留方法以便兼容
            tidaWrapper && tidaWrapper.getUserNick(success, failed);
        },
        //TODO: 把下面几个方法移到别的js里
        grant        : function (options, grantCallback, fnGrant, fnCheckFlow) {
            if (!options) {
                options = {
                    sellerId     : null,
                    activityId   : null,
                    participantId: null
                }
            }
            if (fnGrant == null) {
                fnGrant = function (attentionFlag, nick) {
                    var data = {
                        activityId   : options.activityId,
                        sellerId     : options.sellerId,
                        attentionFlag: attentionFlag,
                        participantId: options.participantId,
                        nick         : nick
                    };
                    $.doAjax({
                        url    : '/games/' + options.sellerId + '/' + options.activityId + '/grant',
                        type   : 'POST',
                        data   : data,
                        success: function (data) {
                            if (data.participantId) {
                                window.GAME_PARTICIPANT_ID = data.participantId;
                            }
                            grantCallback && grantCallback(data);
                        }
                    });
                };
            }
            if (fnCheckFlow == null) {
                fnCheckFlow = function (nick, callback) {
                    $.doAjax({
                        url    : '/games/' + options.sellerId + '/' + options.activityId + '/attention',
                        type   : 'POST',
                        data   : {nick: nick},
                        success: function (data) {
                            var _data         = data.data;
                            var attentionFlag = _data.attention;
                            if (!attentionFlag) {//还没关注
                                var supported = tidaWrapper.followShop({
                                    sellerId: options.sellerId
                                }, function (res) {
                                    if (res.success) {
                                        callback && callback(true, nick);
                                    } else {
                                        $.alert("关注店铺失败，请重试");
                                    }
                                });
                                if (!supported) {
                                    $.alert("对不起, 只支持在手机淘宝里抽奖");
                                }
                            } else {//已经关注
                                callback && callback(false, nick);
                            }
                        }
                    })
                };
            }
            $.getUserNick(function (nick) {
                fnCheckFlow(nick, fnGrant);
            }, function () {
                $.alert("亲，识别您的身份失败，无法进行抽奖～～", function () {
                    document.location = document.location;
                });
            });
        },
        joinGame     : function (sellerId, activityId, success) {
            var callback = function (newFans) {
                $.doAjax({
                    url    : '/games/' + sellerId + '/' + activityId + '/participant',
                    type   : 'POST',
                    data   : {
                        nick         : window.nick,
                        attentionFlag: newFans
                    },
                    mask   : false,
                    success: function (data) {
                        window.GAME_PARTICIPANT_ID = data.data;
                        success && success(window.GAME_PARTICIPANT_ID);
                    }
                })
            };
            this.getUserNick({
                showLoading: false,
                success    : function (nick) {
                    $.doAjax({
                        url    : '/games/' + sellerId + '/' + activityId + '/attention',
                        type   : 'POST',
                        data   : {nick: nick},
                        mask   : false,
                        success: function (data) {
                            var _data         = data.data;
                            var attentionFlag = _data.attention;
                            if (!attentionFlag) {//还没关注
                                var supported = tidaWrapper.followShop({
                                    sellerId: sellerId
                                }, function (res) {
                                    if (res.success) {
                                        callback && callback(true, nick);
                                    } else {
                                        $.alert("关注店铺失败，请重试");
                                    }
                                });
                                if (!supported) {
                                    callback && callback(false, nick);
                                }
                            } else {//已经关注
                                callback && callback(false, nick);
                            }
                        }
                    });

                }
            });
        },
        cartItems    : function (options, cartItemsCallback) {
            this.getUserNick(function (nick) {
                var data = $.extend({
                    sellerId : window.sellerId,
                    buyerNick: nick
                }, options);
                $.doAjax({
                    url    : '/activity/cart-items',
                    type   : 'POST',
                    mask   : true,
                    data   : data,
                    success: function (rst) {
                        cartItemsCallback(rst.data);
                    }
                });
            })
        },
        favorItems   : function (options, favorItemsCallback) {
            this.getUserNick(function (nick) {
                var data = $.extend({
                    sellerId : window.sellerId,
                    buyerNick: nick
                }, options);
                $.doAjax({
                    url    : '/activity/favor-items',
                    type   : 'POST',
                    mask   : true,
                    data   : data,
                    success: function (rst) {
                        favorItemsCallback(rst.data);
                    }
                });
            })
        }
    });
    $.extend($.fn, {
        form2json   : function () {
            var o = {};
            var a = this.serializeArray();
            $.each(a, function () {
                if (o[this.name]) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                }
                else {
                    o[this.name] = this.value || '';
                }
            });
            return o;
        },
        json2form   : function (data) {
            var data2 = {};
            for (var f in data) {
                if (typeof (f) == "string") {
                    data2[f.toLowerCase()] = data[f];
                }
            }
            var inputs = this.find("[name]");
            $.each(inputs, function () {
                var input = $(this);
                var name  = input.attr("name");
                if (name) {
                    var value = data2[name.toLowerCase()];
                    value     = value || "";
                    input.val(value);
                    //todo: checkbox radio
                }
            });
        },
        json2view   : function (data) {
            var elements = this.find("[data-bind]");
            $.each(elements, function () {
                var e    = $(this);
                var name = e.attr("data-bind");
                if (name) {
                    var value = data[name];
                    value     = value || "";
                    e.text(value);
                }
            });
        },
        textinput   : function (option) {
            $.each(this, function () {
                var input     = $(this);
                var container = input.parent();
                if (container.hasClass("input-box")) {
                    input.focus(function () {
                        $(this).parent().addClass("input-box-focus");
                    }).blur(function () {
                        $(this).parent().removeClass("input-box-focus");
                    });
                }
                var type     = input.attr("type");
                var clearBtn = container.find("a.w-search-icon.c");
                if (clearBtn.length) {
                    input.inputing(function () {
                        var container = $(this).parent();
                        var clearBtn  = container.find("a.w-search-icon.c");
                        var val       = $(this).val();
                        if (val != "") {
                            clearBtn.removeClass("hide");
                        }
                        else {
                            clearBtn.addClass("hide");
                        }
                    });
                    clearBtn.click(function () {
                        var container = $(this).parent();
                        var input     = container.find("input");
                        input.val("");
                        input.focus();
                        $(this).addClass("hide");
                    });
                }
            });
        },
        inputing    : function (callback) {
            if (typeof(callback) != "function") return;
            $(this).bind("inputing", callback);
            if ($(this).data("inputing-init")) {
                return;
            }
            $(this).focus(function () {
                var input = $(this);
                var t     = setInterval(function () {
                    var val  = input.val();
                    var oval = input.data("oval");
                    if (!oval || oval != val) {
                        input.trigger("inputing");
                    }
                    input.data("oval", val);
                }, 500);
                $(this).data("timer", t);
            });
            $(this).blur(function () {
                var t = $(this).data("timer");
                clearInterval(t);
            });
            $(this).data("inputing-init", true);
        },
        textarea    : function () {
            $(this).focus(function () {
                var container = $(this).parent();
                if (container.hasClass("input-box")) {
                    container.addClass("input-box-focus");
                }
            }).blur(function () {
                var container = $(this).parent();
                container.removeClass("input-box-focus");
            });
        },
        selectmenu  : function () {
            $(this).change(function () {
                var $this = $(this);
                var span  = $this.parent().find("span");
                var text  = $this.selectedText();
                if (text != null) {
                    if (span.length) {
                        span.text(text);
                    }
                    else {
                        $this.parent().find(".select-box").text(text);
                    }
                }
            });
            $(this).change();
        },
        selectedText: function () {
            var sel = this[0];
            if (sel.selectedIndex > -1) {
                var option = sel.options[sel.selectedIndex];
                return option ? option.text : null;
            }
            return null;
        },
        popup       : function (method, option) {
            if (!this.length) return;
            option = $.extend({adjustSize: true}, option);
            if (!method) {
                method = "show";
            }
            if (method == "show") {
                $.showOverlay('poup');
                var dlg = $(this);
                dlg.addClass("active");
                dlg.css("z-index", $.getNextZIndex());
                if (option.adjustSize) {
                    if (option.adjustSize.width) {
                        dlg.css("width", option.adjustSize.width);
                    }
                    if (option.adjustSize.left) {
                        dlg.css("left", option.adjustSize.left);
                    }
                    if (option.adjustSize.top) {
                        dlg.css("top", option.adjustSize.top);
                    }
                    if (option.adjustSize["margin-left"]) {
                        dlg.css("margin-left", option.adjustSize["margin-left"]);
                    }
                    if (option.adjustSize["margin-top"]) {
                        dlg.css("margin-top", option.adjustSize["margin-top"]);
                    }
                }

            }
            else if (method == "hide") {
                var dlg = $(this);
                dlg.removeClass("active");
                if (!$(".modal-container.active").length) {
                    $.hideOverlay('poup');
                }
            }
        },
        showPopup   : function (option) {
            $(this).popup("show", option);
        },
        hidePopup   : function () {
            $(this).popup('hide');
        },
        checkboxer  : function () {
            if (this.length > 1) {
                $.each(this, function () {
                    $(this).checkboxer();
                });
                return this;
            }
            this.find("input[type=checkbox]").click(checkboxClick);
            this.find("span").click(checkboxClick);
            return this;
        },
        radioGroup  : function () {
            if (this.length > 1) {
                $.each(this, function () {
                    $(this).radioGroup();
                });
                return this;
            }
            this.find("input[type=radio]").click(radioGroupClick);
            this.find("span").click(radioGroupClick);
            return this;
        },
        disable     : function () {
            this.addClass("disabled");
            this.attr("disabled", "disabled");
        },
        enable      : function () {
            this.removeClass("disabled");
            this.removeAttr("disabled");
        }
    });
    if (!window.supportAll && !window.supportPC) {
        if (!$.isMobile()) {
            var url    = encodeURIComponent(document.location.href);
            var img    = '<img src="/qrcode?code=' + url + '">';
            var dialog = $('<div class="qrcode-dialog modal-container"><div class="modal zoomIn animated"><div class="title">手机淘宝扫一扫</div><div class="content">' + img + '<br>请用手机淘宝扫码访问' + '</div></div></div>');
            dialog.appendTo($("body"));
            dialog.popup("show");
        }
    }
    if (!window.supportAll && $.isMobile()) {
        //如果非全网支持, 就尝试弹出手淘
        if (window.Tida && !Tida.isSupportedApp && Tida.openClient && Tida.ready) {
            tidaWrapper.openTaobaoApp();
            var tips = '<div id="onlyTaobao" class="float-top animated fadeInDown">' +
                '<div class="inner ub">' +
                '<a href="javascript:;" class="btn btn-block ub-f1">请在手机淘宝里打开本页面</a>' +
                '</div>' +
                '</div>';
            $("body").append(tips);
            $("#onlyTaobao").click(tidaWrapper.openTaobaoApp);
        }
    }
    $("input").textinput();
    $("textarea").textarea();
    $("select").selectmenu();
    $("div.ui-checkbox").checkboxer();
    $("div.ui-radiobox").radioGroup();
})(window.jQuery || window.Zepto);
