/**适配pc*/
(function ($) {
    var wrapper = $.tida = {};

    $.extend(wrapper, {
        isShoujiTaobao: function () {
            return false;
        },
        isShoujiTmall : function () {
            return false;
        },
        /**
         * 获得原始的Tida
         * @returns {*}
         */
        getRawTida    : function () {
            return {};
        },
        /**
         * 当前环境是否支持Tida
         * @returns {boolean}
         */
        isSupportedApp: function () {
            return false;
        },
        toast         : function (message) {
            return false;
        },
        showLoading   : function (message) {
            return false;
        },
        hideLoading   : function () {
            return false;
        },
        openTaobaoApp : function () {
        },
        /**
         * 取当前用户昵称(混淆昵称)
         * @param options
         * @param callback
         * @returns {boolean}
         */
        mixNick       : function (options, callback) {
            return window.nick && callback && callback(window.nick);
        },
        /**
         * 注册Tida的js加载完之后执行的动作
         * @param options
         * @param callback
         * @returns {boolean}
         */
        ready         : function (options, callback) {
            $(callback);
        },
        share         : function (params) {
            window.jiathis_config = {
                title  : params.title,
                summary: params.content,
                url    : params.url
            }

            // 得每次生成才有效,测试没有出现冲突
            var script = document.createElement('script')
            script.src = '//v3.jiathis.com/code/jia.js'
            document.body.appendChild(script)

            layer.open({
                closeBtn  : false,
                shadeClose: true,
                content   : '<div class="jiathis_style">\n    <span class="jiathis_txt">分享到：</span>\n    <a class="jiathis_button_weixin">微信</a>\n    <a class="jiathis_button_cqq">QQ</a>\n    <a class="jiathis_button_qzone">QQ空间</a>\n    <a class="jiathis_button_tsina">微博</a>\n    <a class="jiathis_button_copy">复制链接</a>\n</div>'
                , skin    : 'footer share'
            })
        },
        followShop    : function (options, callback) {
            //https://favorite.taobao.com/popup/add_collection.htm?id=116406112&itemtype=0
            //手机端的收藏店铺是静默的,pc端的要弹出对话框(iframe)? 还是像抽奖精灵直接open一个窗口?
            //但是手机抽奖的js里在抽奖前会调用followShop这个方法并且不会中断,pc上要中断?
            wrapper.getUserNick(function (nick) {
                var shopId  = (window.settings || window.act).shopId;
                var url     = 'https://favorite.taobao.com/popup/add_collection.htm?itemtype=0&id=' + shopId;
                var content = '<div class="coupon-wraper"><iframe src="' + url + '"></iframe></div>';

                var layerConfig = {
                    className: 'lottery game-content followShop',
                    content  : content,
                    end      : function () {
                        callback && callback({success: true});
                    }
                };
                layer.open(layerConfig);
            });
            return true;
        },
        cart          : function (options, callback) {
            //页面上应该用超链接链接到宝贝页面, 而不是调用这个借口
            return false;
        },
        itemFavor     : function (options, callback) {
            //open dialog, iframe
            return false;
        },
        getUserNick   : function (success, failed) {
            if (typeof(success) == "object") {
                success = success.success;
            }
            if (window.nick) {
                success && success(window.nick);
            } else {
                //alert 需要登录, 然后跳转到登录页面
                layer.open({
                    type     : 1,
                    className: 'lottery lottery-empty',
                    title    : '请登录',
                    content  : '请登录淘宝',
                    btn      : '确定',
                    yes      : function (index) {
                        document.location = window.authUrl;
                    }
                })
            }
        }
    });
})(window.jQuery || window.Zepto);
