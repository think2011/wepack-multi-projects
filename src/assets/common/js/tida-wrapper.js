/**为了避免Tida库升级带来的接口变化,所以做一个wrapper*/
(function ($) {
    var wrapper = $.tida = {};
    var ready = false

    $.extend(wrapper, {
        isShoujiTaobao : function () {
            return window.Tida && Tida.appinfo && Tida.appinfo.isTaobao;
        },
        isShoujiTmall : function () {
            return window.Tida && Tida.appinfo && Tida.appinfo.isTmall;
        },
        /**
         * 获得原始的Tida
         * @returns {*}
         */
        getRawTida    : function () {
            return window.Tida;
        },
        /**
         * 当前环境是否支持Tida
         * @returns {boolean}
         */
        isSupportedApp: function () {
            if (window.Tida && Tida.isSupportedApp) {
                return true;
            }
            return false;
        },
        toast         : function (message) {
            if (wrapper.isSupportedApp()) {
                Tida.toast && Tida.toast(message);
                return true;
            }
            return false;
        },
        showLoading   : function (message) {
            if (wrapper.isSupportedApp()) {
                //显示不出来？
                Tida.showLoading && Tida.showLoading(message);
                return true;
            }
            return false;
        },
        hideLoading   : function () {
            if (wrapper.isSupportedApp()) {
                Tida.hideLoading && Tida.hideLoading();
                return true;
            }
            return false;
        },
        openTaobaoApp : function () {
            if (window.Tida && !Tida.isSupportedApp && Tida.openClient && Tida.ready) {
                Tida.ready({}, function () {
                    try {
                        Tida.openClient(document.location.href);
                    } catch (err) {
                    }
                });
            }
        },
        /**
         * 取当前用户昵称(混淆昵称)
         * @param options
         * @param callback
         * @returns {boolean}
         */
        mixNick       : function (options, callback) {
            if (wrapper.isSupportedApp()) {
                Tida.mixNick && Tida.mixNick(options, callback);
                return true;
            }
            return false;
        },
        /**
         * 注册Tida的js加载完之后执行的动作
         * @param options
         * @param callback
         * @returns {boolean}
         */
        ready         : function (options, callback) {
            if (ready) return callback && callback()

            if (window.Tida && Tida.ready) {
                Tida.ready(options, function () {
                    ready = true
                    callback && callback()
                });
                return true;
            }
            return false;
        },
        share         : function (options, callback) {
            if (wrapper.isSupportedApp()) {
                var opt = $.extend({
                    title  : document.title,
                    content: document.title,
                    url    : document.location.href
                    // targets: [0, 1, 2, 3, 4, 5, 6, 7]
                }, options);

                Tida.share(opt, callback);
                return true;
            }
            return false;
        },
        doFollow:function(options, callback){
            var opt = $.extend({
                sellerId: window.sellerId
            }, options);
            Tida.follow2(opt, function (rst) {
                callback && callback(rst);
            });
        },
        followShop    : function (options, callback) {
            if (wrapper.isSupportedApp()) {
                wrapper.getUserNick({
                    showLoading: false,
                    success    : function (nick) {
                        var opt = $.extend({
                            sellerId: window.sellerId
                        }, options);
                        Tida.follow2(opt, function (rst) {
                            if (!rst.success || !opt.bizActivityId) {
                                //没有bizActivityId, 直接回调
                                callback && callback(rst);
                                return;
                            }
                            opt.nick = nick;
                            $.doAjax({
                                url     : "/activity/add-attention",
                                jsonData: opt,
                                mask    : false,
                                success : function (apiRst) {
                                    var data = $.extend(rst, apiRst);
                                    callback && callback(data);
                                }
                            });

                        });
                    },
                    failed     : function () {
                        callback && callback({success: false});
                    }
                });
                return true;
            }
            return false;
        },
        cart          : function (options, callback) {

            if (wrapper.isSupportedApp()) {
                wrapper.getUserNick({
                    showLoading: false,
                    success    : function (nick) {
                        var opt = $.extend({
                            sellerId  : window.sellerId,
                            sellerNick: window.sellerNick
                        }, options);
                        if (opt.numIid && !opt.itemId) {
                            opt.itemId = opt.numIid;
                        } else {
                            if (opt.itemId && !opt.numIid) {
                                opt.numIid = opt.itemId;
                            }
                        }
                        if (!opt.itemId && opt.item) {
                            opt.itemId = opt.item.numIid;
                        }

                        Tida.cart({
                            sellerNick: opt.sellerNick,
                            itemId    : opt.itemId + ''
                        }, function (rst) {

                            rst.success = false;
                            if (rst.errorCode === 0) {
                                if (rst.data === "businissType:1") {
                                    /**
                                     * 安卓手淘里,他没点加购,但是点了购买,所以不算他加购了;
                                     * 安卓天猫里没这个字段, 也没有购买的按钮
                                     * 返回值的单词是错的
                                     */
                                } else if (rst.businissType == "1") {
                                    /**
                                     * iphone手淘里,他没点加购,但是点了购买,所以不算他加购了;
                                     * iphone天猫里没这个字段, 也没有购买的按钮
                                     * 返回值的单词是错的
                                     */
                                } else {
                                    rst.success = true;
                                }
                            }
                            if (!rst.success || !opt.bizActivityId) {
                                //没有bizActivityId, 直接回调
                                callback && callback(rst);
                                return;
                            }
                            opt.nick = nick;
                            //请求后端
                            if (!opt.item) {
                                opt.item = $.extend({}, opt);
                            }
                            $.doAjax({
                                url     : "/activity/add-cart",
                                jsonData: opt,
                                success : function (apiRst) {
                                    var data = $.extend(rst, apiRst);
                                    callback && callback(data);
                                }
                            });
                        });
                    },
                    failed     : function () {
                        callback && callback({success: false});
                    }
                });
                return true;
            }
            return false;
        },
        itemFavor     : function (options, callback) {
            if (wrapper.isSupportedApp()) {
                wrapper.getUserNick({
                    showLoading: false,
                    success    : function (nick) {
                        var opt = $.extend({
                            sellerId: window.sellerId
                        }, options);
                        if (opt.numIid && !opt.itemId) {
                            opt.itemId = opt.numIid;
                        } else {
                            if (opt.itemId && !opt.numIid) {
                                opt.numIid = opt.itemId;
                            }
                        }
                        if (!opt.itemId && opt.item) {
                            opt.itemId = opt.item.numIid;
                        }
                        opt.action = opt.action || "add";
                        Tida.itemFavor(opt, function (rst) {
                            rst.success = false;
                            if (rst.errorCode === 0) {
                                rst.success = true;
                            } else if (rst.errorCode == "ALREADY_COLLECTION") {
                                //iphone 淘宝
                                rst.success = true;
                            }
                            else {
                                if (rst.data === "该商品已收藏") {
                                    //android 淘宝
                                    rst.success = true;
                                } else if (rst.msg === "该商品已收藏") {
                                    //天猫
                                    rst.success = true;
                                }
                            }
                            if (!rst.success || !opt.bizActivityId) {
                                //没有bizActivityId, 直接回调
                                callback && callback(rst);
                                return;
                            }
                            opt.nick = nick;
                            //请求后端
                            if (!opt.item) {
                                opt.item = $.extend({}, opt);
                            }
                            $.doAjax({
                                url     : "/activity/item-favor",
                                jsonData: opt,
                                success : function (apiRst) {
                                    var data = $.extend(rst, apiRst);
                                    callback && callback(data);
                                }
                            });
                        });
                    },
                    failed     : function () {
                        callback && callback({success: false});
                    }
                });
                return true;
            }
            return false;
        },
        getUserNick   : function (success, failed) {
            var showLoading = false;
            if (typeof(success) == "object") {
                showLoading = success.showLoading;
                success     = success.success;
                failed      = success.failed;
            }

            wrapper.ready({}, function () {
                var nick = window.nick || "";
                if (!wrapper.isSupportedApp()) {
                    if (!nick.length) {
                        window.nick = nick = "unknow_nick_outside_taobao";
                    }
                    success && success(nick);
                    return;
                }

                if (nick.length) {
                    success && success(nick);
                    return;
                }
                showLoading && $.showLoading();

                var options    = {};
                var retryTimes = 0;
                var cb         = function (data) {
                    showLoading && $.hideLoading();
                    if (data.success && data.mixnick) {
                        window.nick = data.mixnick;
                        success && success(data.mixnick);
                    } else {
                        if (retryTimes < 2) {
                            //重试两次
                            retryTimes++;
                            wrapper.mixNick(options, cb);
                        } else {
                            failed && failed();
                        }
                    }
                };
                wrapper.mixNick(options, cb);
            });
        },
    });
    wrapper.ready({}, function () {

    });
})(window.jQuery || window.Zepto);
