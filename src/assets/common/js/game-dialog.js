;(function ($, document, window, layer) {
    function GameDialog() {
        this.settings = {
            // grantUrl: null,
            showCloseBtn: false,
            gameUrl     : '',
            shopId      : null,
            gameName    : ''
        };

        this.taskMap = {
            shopping: {
                init : false,
                alias: 'cart',
                api  : 'add-cart',
                tida : $.tida.cart,
                name : '加购',
                title: '加入购物车'
            },
            collect : {
                init : false,
                alias: 'favor',
                api  : 'add-favor',
                tida : $.tida.itemFavor,
                name : '收藏',
                title: '收藏宝贝'
            }
        }

        this.lotteryDict = window.lotteryDict = (function (lotteryConfig) {
            var map     = {
                pc    : {
                    follow: '收藏店铺',
                },
                mobile: {
                    follow: '关注店铺',
                }
            }
            var result  = (lotteryConfig && lotteryConfig.type) ? map[lotteryConfig.type] : map['mobile']
            result._map = map

            return result
        })(window.lotteryConfig)
    }

    function isFunc(f) {
        return typeof f === 'function';
    }

    function createBtn(target, options) {
        var has = false;
        if (options) {
            if (options.btn1) {
                var btn1   = options.btn1;
                var button = $('<button class="btn1">' + btn1.title + '</button>');
                button.on('click', function (event) {
                    btn1.click && btn1.click();
                });
                target.append(button);
                has = true;
            }
            if (options.btn2) {
                var btn2   = options.btn2;
                var button = $('<button class="btn2">' + btn2.title + '</button>');
                button.on('click', function (event) {
                    btn2.click && btn2.click();
                });
                target.append(button);
                has = true;
            }
        }
        return has;
    }

    function touchmoveEvent(e) {
        e.preventDefault()
    }

    function createRuleContent(_data) {
        return '<div class="game-rule-text"><div class="rule-row"><label class="rule-t">活动奖品：</label><div class="rule-i">' + _data.gifts + '</div></div>' +
            '<div class="rule-row"><label class="rule-t">活动时间：</label><div class="rule-i">' + _data.startTime + '—' + _data.endTime + '</div></div>' +
            '<div class="rule-row"><label class="rule-t">活动规则：</label><div class="rule-i"><pre>' + _data.description + '</pre></div></div></div>' +
            '<div class="explain">本次活动最终解释权归<strong>' + _data.shopTitle + '</strong>所有<div>';
    }

    function getExtraCountDesc(descTplMap, params, amountFix) {
        var countType = params.countMeta ? params.countMeta.type : 'deprecated';
        var descTpl   = descTplMap[countType];
        var desc      = '';
        if (descTpl) {
            var countMeta = params.countMeta ? params.countMeta : params;
            if (countType === 'mjsStepCount') {
                if (countMeta.steps) {
                    countMeta.steps.forEach(function (step) {
                        desc += descTpl.render({
                            count : step.count,
                            amount: step.amount ? step.amount.toFixed(amountFix) : 0,
                            action: params.action
                        });
                    });
                }
            } else {
                // 位置不够显示, 会换行, 为了美观先屏蔽掉吧
                // if(countType === 'mjsLinearCount' && countMeta.maxCount){
                //     descTpl += '<span class="text-muted">(最多不超过${maxCount}次)</span>'
                // }
                desc = descTpl.render({
                    item    : countMeta.item,
                    person  : countMeta.person,
                    count   : countMeta.count,
                    amount  : countMeta.amount ? countMeta.amount.toFixed(amountFix) : 0,
                    maxCount: countMeta.maxCount,
                    action  : params.action
                });
            }
        }
        return desc;
    }

    function refreshTrade(callback) {
        $.tida.getUserNick(function (nick) {
            window.nick = nick;
            $.doAjax({
                url : 'refresh-trade',
                data: {
                    nick    : window.nick,
                    realNick: window.realNick
                }
            }).then(function (rst) {
                if (rst.success && rst.data.realNickRequired) {
                    var $content = $('<div class="real-stuff-wraper refresh-trade">' +
                        '<div class="tip">(需要填写您的淘宝账号才能查询)</div>' +
                        '<form><div class="form-group"><label>淘宝账号：</label><input name="taobaoAccount" type="text"></div></form>' +
                        '</div>');

                    var layerConfig = {
                        title    : '下单抽奖',
                        className: 'lottery game-content',
                        content  : $content,
                        btn      : '查询',
                        yes      : function (index) {
                            var $input  = $content.find("input");
                            var account = $input.val();
                            if (!$.validator.methods.required(account)) {
                                $.toast('请输入您的淘宝账号');
                                return;
                            }
                            window.realNick = account;
                            $.doAjax({
                                url : 'refresh-trade',
                                data: {
                                    nick    : window.nick,
                                    realNick: window.realNick
                                }
                            }).then(function (rst) {
                                if (rst.success) {
                                    layer.close(index);
                                    callback && callback(rst);
                                } else {
                                    $.toast(rst.message);
                                }
                            });
                        }
                    };
                    return layer.open(layerConfig);
                }
                callback && callback(rst);
            });
        });
    }

    function refreshRate(callback) {
        $.tida.getUserNick(function (nick) {
            window.nick = nick;
            $.doAjax({
                url : 'refresh-rate',
                data: {
                    nick    : window.nick,
                    realNick: window.realNick
                }
            }).then(function (rst) {
                if (rst.success && rst.data.realNickRequired) {
                    var $content = $('<div class="real-stuff-wraper refresh-trade">' +
                        '<div class="tip">(需要填写您的淘宝账号才能查询)</div>' +
                        '<form><div class="form-group"><label>淘宝账号：</label><input name="taobaoAccount" type="text"></div></form>' +
                        '</div>');

                    var layerConfig = {
                        title    : '好评抽奖',
                        className: 'lottery game-content',
                        content  : $content,
                        btn      : '查询',
                        yes      : function (index) {
                            var $input  = $content.find("input");
                            var account = $input.val();
                            if (!$.validator.methods.required(account)) {
                                $.toast('请输入您的淘宝账号');
                                return;
                            }
                            window.realNick = account;
                            $.doAjax({
                                url : 'refresh-rate',
                                data: {
                                    nick    : window.nick,
                                    realNick: window.realNick
                                }
                            }).then(function (rst) {
                                if (rst.success) {
                                    layer.close(index);
                                    callback && callback(rst);
                                } else {
                                    $.toast(rst.message);
                                }
                            });
                        }
                    };
                    return layer.open(layerConfig);
                }
                callback && callback(rst);
            });
        });
    }

    function refreshConfirmGoods(callback) {
        $.tida.getUserNick(function (nick) {
            window.nick = nick;
            $.doAjax({
                url : 'refresh-confirm-good',
                data: {
                    nick    : window.nick,
                    realNick: window.realNick
                }
            }).then(function (rst) {
                if (rst.success && rst.data.realNickRequired) {
                    var $content = $('<div class="real-stuff-wraper refresh-trade">' +
                        '<div class="tip">(需要填写您的淘宝账号才能查询)</div>' +
                        '<form><div class="form-group"><label>淘宝账号：</label><input name="taobaoAccount" type="text"></div></form>' +
                        '</div>');

                    var layerConfig = {
                        title    : '确认收货抽奖',
                        className: 'lottery game-content',
                        content  : $content,
                        btn      : '查询',
                        yes      : function (index) {
                            var $input  = $content.find("input");
                            var account = $input.val();
                            if (!$.validator.methods.required(account)) {
                                $.toast('请输入您的淘宝账号');
                                return;
                            }
                            window.realNick = account;
                            $.doAjax({
                                url : 'refresh-confirm-good',
                                data: {
                                    nick    : window.nick,
                                    realNick: window.realNick
                                }
                            }).then(function (rst) {
                                if (rst.success) {
                                    layer.close(index);
                                    callback && callback(rst);
                                } else {
                                    $.toast(rst.message);
                                }
                            });
                        }
                    };
                    return layer.open(layerConfig);
                }
                callback && callback(rst);
            });
        });
    }

    GameDialog.prototype = {

        close: function (callback) {
            $.hideOverlay("game-dialog-cover");
            // $('#dialog-cover').remove();
            $('#game-dialog').remove();
            if (isFunc(callback)) {
                callback();
            }
        },
        /**
         * 中奖了,调这个方法
         * @param type 1.淘金币, 2.优惠券, 3.支付宝红包, 4.流量, 5.淘话费
         * @param value 面额，单位是分
         * @param fnRePlay 再玩一次的函数回调
         * @param shareOptions 分享的参数 {title, content, url}
         * @param opts 可以用来重写整个弹窗
         * @param multi 拼图等游戏玩一次根据游戏结果可以多次抽奖
         */
        win  : function (type, value, fnRePlay, shareOptions, opts, multi) {
            var gift = value || "{}";
            if (typeof(gift) == "string") {
                try {
                    gift = $.parseJSON(value);
                } catch (e) {
                    gift = {};
                }
            }
            var content;
            var self         = this;
            var shareContent = '我得到了';
            var copyText     = '';
            if (type == 1 || type === 'COIN') {
                var extra = gift.COIN || {};
                var value = extra.denomination;
                content   = '<div class="coin-wraper"><img class="coin"' +
                    ' src="data:image/png;base64,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">' +
                    '<div>恭喜您获得' + value + '个淘金币</div></div>';
                shareContent += value + '个淘金币';
            } else if (type == 2 || type === 'SHOP_COUPON') {
                var extra = gift.SHOP_COUPON || {};
                var url   = extra.activityUrl;
                if (url) {
                    var index = url.indexOf('?');
                    if (index > 0) {
                        url = 'https://h5.m.taobao.com/ump/coupon/detail/index.html' + url.substring(index);
                    }
                }
                var value = $.utils.toHttps(url);
                if ($.tida.isShoujiTaobao() && !$.isAndroid()) {
                    content = '<div class="coupon-wraper"><div class="coupon-dummy"><div class="coupon"><div class="mod-a mod-a-shop"><div class="mod-a-h"></div><div class="mod-a-f"></div><div class="mod-a-ln"><div class="mod-a-ln-bg"></div></div><div class="mod-a-icon"></div><div class="mod-a-tit">!{shopTitle}店铺优惠券</div><div class="mod-a-sub-tit">!{endTime} 前有效</div> <div class="mod-a-val"><span class="price"><span>￥</span>!{denomination}</span></div><div class="mod-a-tip">满 !{condition} 使用</div></div></div><a class="claim" href="!{url}" role="button" target="_blank">去领取</a></div></div>';
                    content = content.render({
                        shopTitle   : window.act ? (window.act.shopTitle || '') : '',
                        endTime     : extra.endTime || '',
                        condition   : extra.condition ? extra.condition / 100 : '',
                        denomination: extra.denomination ? extra.denomination / 100 : '',
                        url         : value
                    });
                } else {
                    content = '<div class="coupon-wraper"><iframe src="' + value + '"></iframe></div>';
                }
                shareContent += '一张优惠券';
            } else if (type == 3 || type === 'ALIPAY_COUPON') {
                var extra = gift.ALIPAY_COUPON || {};
                var value = extra.denomination;
                value     = parseInt(value) / 100;
                content   = '<div class="ali-wraper"><img class="ali" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAACkCAMAAADsWzH3AAAAtFBMVEUAAAD9JFL9JFLzH0v4IE/9JFL9JFL9JFL9JFL+JFL+JFLLCjP9I1HMCzTLCjPLCzT9JFLLCzT4IU79JFL6IlD9JFL9JFLLCzT9JFLLCjTaEj3LCzTKCjP9JFLLCzT/JVTKCjPJCTL6IlDVDznpGUbQDTb8I1H1H0zODDXMCzTSDjjHCDH3IU7yHkvhFkHXETvuHEjdEz7fFUDsG0fkFkLaEjz9I1LwHEr/JFLmGET9HVT9Kk+SAblsAAAAHXRSTlMA7CwG/vp12ruz861ZKPXr5NTOZCrXqWxpWuTcZjfmb1YAAASOSURBVHja7NqJjtMwEMZxL1Rcyw0S4vg8Hjv3nTRpd3n/B4PVFgyIo8F2myD+b/CT044nrTj05M3lM7nK3l++eSK+7cnli5VSPvf02YtLy7n79oVcc6o0Lx/fPVg+PJVrjuVQ49GrW83bVVuYi2tNwKPHN5bX7zKWq43zqSMCgOd3PmMe6iaWSq4ypbJhQ7jtoRB37l/R3uRyjSlZRHSFQ/fviHsXAOlxlRqeUsLXLu6JB7gp2ZvVPWlKjhW+7YG4wG3V9bq+BxQXncZ3XQgcIr1veT0clkMKwvcJfIkoHeNyHQ+b4iLaWIrF2AjbVq7hcFi2HRF+i8EVVUOhFn84HA8VAX/AAERdmy1ckxdRQjgCA1DSxHLJZW0K4DgMQHuz3A+OykaNGRjsNk2+UA6bfYJZGJDu2iV+SbPq0x3NxICQjjEvjVPebi5zMQAl22lZM4d56kCYh7EXgmZBh6M4HlK6wlyM5WzbpVw+lTQRCJiNsdGmyeQiyuzmMhtj64oFrG0qGwG4Y1A1Z39BwKaDHwz03vA5OYqHGu4YO3OyUp4pxXG0AblibKS351pCWU1dQoAXjJ0551hCFcdNSoBXDECI2vzUGlZ2uPjC2CVUnpSj8qkmwCfGRtvTvvjMGm0tvjGAHk74qBUdbAEwSDpTylOkZF8lsIXA0C5tTrEYlHGk8WPzMUuYOczT/ojh4o4BoQ6855RxUx1BccXYmRPuWVNsohnH4ooBKB3iQC8+VTbVNMPijgFRZHIVgCKLZuaxuGMAqoYQE9R08ynuGEBvC+X7XPoNHHLAIKkayX6HSwKHnDAg3ZnSF0eVMzaXABgQ0sbTEsp5k4LgloBTpCMfFwJ2GC7+MCCqe+cLAWf93OESBAMQbmaOchouo9uxWIx7VPUOFwLlMFwCYABymDmqrwh+EvBT1Sv1V5Qs0nDIM8ZeCEo1m8JtncCpIBhCPftCwNmYwrEgmPkzh9lsNcG5IBgQ1cPxM6e0w8VXAj6jJDKSj3zzOmqC3wT8RmmfqSMsueng0xIEA9pFR/zYFk8VwXsC/qv6P2iU3Vw8FgZzM3P4t8MlDWEJhKEkHfLyF5YyHzcIk0CQSEc/X0JVaSJNCJNAmAj18JMllGVfgxAogVCRvjaKf/yf6KiDUUJiQFR/v+eovN1SOEtQzGEJtZq4rwghEwgapVP2RVNcE8ImELgkivmGwm1NCJxA8OqelVJjheCFxxCqqDBbjfAJhI9Q1yCET+AUEeEUCfxD/ccstf+YpfYfs9TOg9ntdh8/foTvBM7Vp/bqJgVhIAagcGZKaysuxD/c5BpuvP+9VETwAIKv4X03eGQmud9/XhP5P7f8Kf8MlzFUxlAZQ2UMlTFUxlAZQ2UMlTFUxlAZQ2UMlTFUxlAZQ2UMlTFUxlAZQ2UMlTFUxlAZQ2UMlTFUxlAZQ2UMlTFUxlAZQ2UMlTFUMWYdsckyWix1RjPH1LKINkUv8842PWLJIpaI6PssYd/jabfNAra7eBmuBRbaeB3iXXM85ModjkN89Mu5rXY8Yztfenw7TfNKD06bp1O8PQDiZ/JqFutlwgAAAABJRU5ErkJggg==" />' +
                    '<div class="text">' + value + '元红包</div></div>' +
                    '<div>恭喜您获得' + value + '元支付宝红包</div>';
                shareContent += value + '元支付宝红包';
            } else if (type == 4 || type === 'MOBILE_FLOW') {
                var extra = gift.MOBILE_FLOW || {};
                var value = extra.denomination;
                content   = '<div class="flow-wraper"><img class="flow" src="data:image/png;base64,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" />' +
                    '<div class="text"><span class="val">' + value + '<span class="unit">M</span></span></div></div>' +
                    '<div>恭喜您获得' + value + 'M流量</div>';
                shareContent += value + 'M流量';
            } else if (type === 'THF') {
                var extra = gift.THF || {};
                var value = extra.denomination;
                content   = '<div class="thf-wraper"><img class="thf" src="data:image/png;base64,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" />' +
                    '<div class="text"><span class="val">' + value + '<span class="unit">元</span></span></div></div>' +
                    '<div>恭喜您获得' + value + '元淘话费</div>';
                shareContent += value + '元话费';
            } else if (type === 'REAL_STUFF') {
                opts       = $.extend({skin: "real-stuff-dialog"}, opts);
                var extra  = gift.REAL_STUFF || {};
                copyText   = extra.copyText;
                var picSrc = extra.prizePic;
                if (!picSrc || picSrc.length < 1) {
                    picSrc = 'data:image/png;base64,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';
                } else {
                    picSrc = $.utils.toHttps(picSrc);
                }
                if (extra.needTaobaoAccount
                    || extra.needAliPayAccount
                    || extra.needPhoneNumber
                    || extra.needReceiver
                    || extra.needReceiverAddress) {
                    if (opts.submitted) {
                        content = '<div class="real-stuff-wraper"><img class="real-stuff" src="' + picSrc + '" />' +
                            '<div class="stuff-name">"' + extra.name + '"</div>' +
                            '<div class="tip">提交成功，奖品将很快送到您的手中！</div>';
                        if (extra.rule) {
                            content += '<pre class="stuff-rule">' + extra.rule + '</pre>';
                        }
                        content += '</div>';

                        shareContent += extra.name;
                    } else {
                        content = '<div class="real-stuff-wraper"><img class="real-stuff" src="' + picSrc + '" />' +
                            '<div class="stuff-name">恭喜您获得"' + extra.name + '"</div>';
                        if (extra.rule) {
                            content += '<pre class="stuff-rule">' + extra.rule + '</pre>';
                        }

                        content += '<div class="tip">(填写以下信息后才能领奖哦)</div>' +
                            '<div class="personal-form"><form id="real-stuff-form">!{taobaoAccount}!{aliPayAccount}!{phoneNumber}!{receiver}!{receiverAddress}</form></div>' +
                            '</div>';
                        var taobaoAccount = '<div class="form-group"><label>淘宝账号：</label><input data-show="needTaobaoAccount" data-val-required="请填写淘宝账号" name="taobaoAccount" type="text"></div>';
                        if (extra.needTaobaoAccount && window.realNick) {
                            taobaoAccount = '<div class="form-group"><label>淘宝账号：</label><input data-show="needTaobaoAccount" data-val-required="请填写淘宝账号" name="taobaoAccount" type="text" value="' + window.realNick + '"></div>';
                        }
                        var aliPayAccount   = '<div class="form-group"><label>支付宝账号：</label><input data-show="needAliPayAccount" data-val="true" data-val-required="请填写支付宝账号" name="aliPayAccount" type="text"></div>';
                        var phoneNumber     = '<div class="form-group"><label>手机号码：</label><input data-show="needPhoneNumber" data-val="true" data-val-required="请填写手机号码" data-val-regex="请填写正确的手机号码" data-val-regex-pattern="^[1][3456789][0-9]{9}$" name="phoneNumber" type="tel"></div>';
                        var receiver        = '<div class="form-group"><label>收货人：</label><input data-show="needReceiver" data-val="true" data-val-required="请填写收货人" name="receiver" type="text"></div>';
                        var receiverAddress = '<div class="form-group"><label>收货地址：</label><input data-show="needReceiverAddress" data-val="true" data-val-required="请填写收货地址" name="receiverAddress" type="text"></div>';
                        content             = content.render({
                            taobaoAccount  : extra.needTaobaoAccount ? taobaoAccount : '',
                            aliPayAccount  : extra.needAliPayAccount ? aliPayAccount : '',
                            phoneNumber    : extra.needPhoneNumber ? phoneNumber : '',
                            receiver       : extra.needReceiver ? receiver : '',
                            receiverAddress: extra.needReceiverAddress ? receiverAddress : ''
                        });

                        var layerConfig = {
                            title    : '中奖啦',
                            className: 'lottery game-content',
                            content  : content,
                            btn      : '提交',
                            yes      : function (index) {
                                var form      = $("#real-stuff-form");
                                var validator = null;
                                var option    = {
                                    invalidHandler: function (message, element) {
                                        validator = this;
                                    }
                                };
                                if (!form.valid(option)) {
                                    if (validator.errors.length) {
                                        //每次只显示第一个错误
                                        var msg = validator.errors[0].message;
                                        $.toast(msg);
                                        return;
                                    }
                                }
                                var data           = form.form2json();
                                data.participantId = window.GAME_PARTICIPANT_ID;
                                data.nick          = window.nick;
                                $.doAjax({
                                    url    : "personal-info",
                                    data   : data,
                                    success: function (rst) {
                                        if (rst.success) {
                                            layer.close(index);
                                            self.win(type, value, fnRePlay, shareOptions, $.extend({}, opts, {submitted: true}), multi);
                                        } else {
                                            $.toast(rst.message);
                                        }
                                    }
                                });
                            }
                        };

                        $.extend(layerConfig, self.settings, opts || {});

                        return layer.open(layerConfig);
                    }
                }
                else {
                    //不需要填写用户信息
                    content  = '<div class="real-stuff-wraper"><img class="real-stuff" src="' + picSrc + '" />' +
                        '<div class="stuff-name">"' + extra.name + '"</div>';
                    var rule = extra.rule || '恭喜您中奖';
                    content += '<pre class="stuff-rule">' + rule + '</pre>';
                    content += '</div>';

                    shareContent += extra.name;
                }

            }
            else if (type === 'SCORE') {
                var extra = gift.SCORE || {};
                var value = extra.denomination + (extra.aliasName || "积分");
                content   = '<div class="coin-wraper"><img class="coin"' +
                    'src=data:image/png;base64,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' +
                    '> <div>恭喜您获得 ' + value + ' </div></div>';
                shareContent += value;
            } else {
                //不支持的奖品
                console.log("不支持的奖品 " + type);
                return;
            }

            var layerConfig = {
                title    : '中奖啦',
                className: 'lottery game-content',
                content  : content
            };
            if (multi != undefined && multi == true) {
                layerConfig.btn = '确定';
                if (copyText) {
                    layerConfig.btn = ['复制', '确定'];
                }
                layerConfig.yes = function (index) {
                    if (copyText) {
                        self.copyText(copyText);
                        return;
                    }
                    layer.close(index);
                }
            } else {
                layerConfig.btn = ['炫耀一下', '再玩一次'];
                if (!fnRePlay) {
                    layerConfig.btn = ['炫耀一下'];
                }
                if (copyText) {
                    layerConfig.btn = ['复制', '炫耀一下'];
                }
                layerConfig.yes = function () {
                    if (copyText) {
                        self.copyText(copyText);
                        return;
                    }
                    var shareUrl = self.settings.gameUrl || (window.act ? window.act.actUrl : '') || document.location.href;
                    if(window.nick){
                        shareUrl += '?fromNick=' + encodeURIComponent(nick);
                    }
                    $.tida.share($.extend({
                        title  : self.settings.gameName || '幸运大抽奖',
                        content: shareContent + '，你快来试试！',
                        url    : shareUrl
                    }, shareOptions || {}), null)
                };
                layerConfig.no  = function (index) {
                    if (fnRePlay) {
                        fnRePlay();
                    }
                    layer.close(index);
                };
            }
            $.extend(layerConfig, self.settings, opts || {});
            var rst = layer.open(layerConfig);
            // if(copyText){
            //     var supported = Clipboard.isSupported() && !$.isAndroid();
            //     var clipboard = new Clipboard('.layui-m-layer-real-stuff-dialog .layui-m-layerbtn span[type="1"]', {
            //         text: function(trigger) {
            //             return copyText;
            //         }
            //     });
            //     clipboard.on('success', function(e) {
            //         $.toast('复制成功');
            //     });
            //     clipboard.on('error', function(e) {
            //         self.copyText(copyText);
            //     });
            //
            // }
            return rst;
        },

        /**
         * 复制文本
         */
        copyText        : function (txt) {
            var supported = Clipboard.isSupported() && !$.isAndroid();

            var btn   = '复制';
            var input = '<div class="form-group"><input type="text" value="' + txt + '" ></div>';

            var content = '<div class="real-stuff-wraper">';
            if (!supported) {
                content += '<div class="tip">(长按以下文本,全选并复制)</div>';
                btn = '关闭';
            }
            content += '<div class="personal-form"><form id="real-stuff-form">' + input + '</form></div>' +
                '</div>';

            var $content = $(content);

            layer.open({
                title    : '复制',
                className: 'lottery game-content copy-dialog',
                content  : $content,
                btn      : btn,
                yes      : function (index) {
                    if (!supported) {
                        layer.close(index);
                    }
                }
            });

            $content.find("input")[0].select();
            var clipboard = new Clipboard('.copy-dialog .layui-m-layerbtn span', {
                text: function (trigger) {
                    return txt;
                }
            });
            clipboard.on('success', function (e) {
                $.toast('复制成功,可以去粘贴了');
            });
            clipboard.on('error', function (e) {
                $.toast('复制失败,请长按文本框文本,全选并复制');
            });
        },
        /**
         * 静默收藏领取店铺优惠券
         * @param value 优惠券信息
         */
        winShopCoupon   : function (value) {
            var gift = value || "{}";
            if (typeof(gift) == "string") {
                try {
                    gift = $.parseJSON(value);
                } catch (e) {
                    gift = {};
                }
            }
            var content;
            var self  = this;
            var extra = gift.SHOP_COUPON || {};
            var value = $.utils.toHttps(extra.activityUrl);
            if($.tida.isShoujiTaobao() && !$.isAndroid()){
                content = '<div class="coupon-wraper"><div class="coupon-dummy"><div class="coupon"><div class="mod-a mod-a-shop"><div class="mod-a-h"></div><div class="mod-a-f"></div><div class="mod-a-ln"><div class="mod-a-ln-bg"></div></div><div class="mod-a-icon"></div><div class="mod-a-tit">!{shopTitle}店铺优惠券</div><div class="mod-a-sub-tit">!{endTime} 前有效</div> <div class="mod-a-val"><span class="price"><span>￥</span>!{denomination}</span></div><div class="mod-a-tip">满 !{condition} 使用</div></div></div><a class="claim" href="!{url}" role="button" target="_blank">去领取</a></div></div>';
                content = content.render({
                    shopTitle: window.act ? (window.act.shopTitle || '') : '',
                    endTime: extra.endTime || '',
                    condition: extra.condition ? extra.condition / 100 : '',
                    denomination: extra.denomination ? extra.denomination / 100 : '',
                    url : value
                });
            }else {
                content   = '<div class="coupon-wraper"><iframe src="' + value + '"></iframe></div>';
            }

            var layerConfig = {
                className: 'lottery game-content',
                content  : content,
                btn      : '关闭',
                yes      : function (index) {
                    layer.close(index);
                }
            };
            $.extend(layerConfig, self.settings, {});
            return layer.open(layerConfig);
        },
        /**
         * 抽奖没有抽到礼物的函数
         * @param fn1 用于btn1的函数
         * @param fn2 用于btn2的函数
         * @param opts 用于重写整个窗口
         * @param multi 拼图等游戏玩一次根据游戏结果可以多次抽奖
         */
        lose            : function (fn1, fn2, opts, multi) {
            var self = this;
            var options;
            if (multi != undefined && multi == true) {
                options = {
                    title  : '很遗憾',
                    content: '<div class="only-text">咦..运气这种事，谁能说得清呢?说不定下次就中了....</div>',
                    btn1   : {
                        title: '确定',
                        click: function () {
                            self.close();
                        }
                    }
                }
            } else {
                options = {
                    title  : '很遗憾',
                    content: '<div class="only-text">咦..运气这种事，谁能说得清呢?说不定下次就中了....</div>',
                    btn1   : {
                        title: '再玩一次',
                        click: function () {
                            if (isFunc(fn1)) {
                                fn1();
                                self.close();
                            }
                        }
                    },
                    btn2   : {
                        title: '随便逛逛',
                        click: function () {
                            window.location.href = 'https://shop' + self.settings.shopId + '.taobao.com';
                        }
                    }
                };
            }
            this.open($.extend(options, self.settings, opts || {}))
        },
        success         : function (options, _success) {
            var self = this;
            this.open($.extend({
                title  : '恭喜',
                content: '<div class="only-text">恭喜您全部配对成功！</div>',
                btn1   : {
                    title: '去抽奖',
                    click: function () {
                        self.close();
                        _success && _success();
                    }
                }
            }, self.settings, options || {}))
        },
        fail            : function (options) {
            var self = this;
            this.open($.extend({
                title  : '很遗憾',
                content: '<div class="only-text">很遗憾，离抽奖只有一步之遥...</div>',
                btn1   : {
                    title: '再来一次'
                },
                btn2   : {
                    title: '随便逛逛',
                    click: function () {
                        window.location.href = 'https://shop' + self.settings.shopId + '.taobao.com';
                    }
                }
            }, self.settings, options || {}));
        },
        /**
         * 这个是经过layer改造的
         * @param data
         * @param layerOpts
         */
        standardRule    : function (data, layerOpts) {
            var layerDefaultOptions = {
                title    : '活动规则',
                content  : createRuleContent(data),
                className: 'lottery game-content'
            };
            $.extend(layerDefaultOptions, layerOpts);

            layer.open(layerDefaultOptions);
        },
        rule            : function (sellerId, activityId, ajaxParams) {
            var self = this;

            if (window.GAME_RULE_DATA) {
                self.open({
                    title       : '活动规则',
                    content     : createRuleContent(window.GAME_RULE_DATA),
                    showCloseBtn: true,
                    closeBtnImg : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAA2FBMVEUAAADYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhL////YEhL++fn52Nj3z8/ztLTncHDhR0f87e3hTEz//f3rhITlXl7cJibZGBj98vL40tLeNDTdLy/bICDaHBzZFRX529v0vb3peHjoc3PlYmL99vb74uL2xMTjVFTaGhr76Oj53Nz2ycnzuLjwoqLvnZ3ul5fmaGj63t7xqKjmaWn99PTyra3qgYHhFZYvAAAAGnRSTlMAMO37+tXPtoA2BiQI6o4/9PGvrpyZjz4JJl3VPuUAAAIKSURBVDjLpZXncuIwFIWNqcEBUkjZe2zcqKbbkJCQsiTZ3fd/o0USMZJoO7Pnh0caf7Zul6GqXCtd581czsxfl2pl47AyNyYkmTeZQ2ARQNhyncC2A8dthQCK++DzahZIHJLkJED29lwnrQLg9UhTzwMKlkqeVeA3aI8aPswzhbxA26a9sme4kFirghUd1AoVK/WogDYdURuFb9+q8O1jqO2juolnFhuPnGeVaUYb35AV8S3CI66o039WPepOxcpDkf8U6Ilvh4DM2m2g+yriC7Df1pEQ109gzT6k5ALAt78J6utausSE9rBzRqbRnuCybNwhJJLZAWd/hWw9SyMT4s4ooUWp3jn7QdTz2WrVTN+0UDKu4JLOLgNOeluSXFwZeSiF98aYTp89E4kkB3nDREAKO4ZQLJMUwDRy0JL6Kdg/WnKR20UfOowcRbuobsDHAFydiDQDdLeWnBwLVnVLC9aEn/7udgEMG6QES02Bw8jxG5HKihQoiY04+cmWr5x9oW1ia3K5NIaM/C02U5kV5WLUEYvtCyO7qeXTJxazR7GJUeel3Z9zO0cQpayy3N55HxmpYZoe8DQlSY9rdjHfNoxoQ8Gy4xR2tLDTNlSau7kkTZGtNrdxf3pk3EuD6Osw+YWKpYy32fHxJrHmsaH5z6P4x86Av81iEKsDPh5IA/70tfF/l9HpK+4vTq6aylYNDE8AAAAASUVORK5CYII=',
                    skin        : 'rule-dialog'
                })
            } else {
                function success(data) {
                    if (data && data.data) {
                        var _data = window.GAME_RULE_DATA = data.data;
                        self.open({
                            title       : '活动规则',
                            content     : createRuleContent(_data),
                            showCloseBtn: true,
                            closeBtnImg : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAA2FBMVEUAAADYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhL////YEhL++fn52Nj3z8/ztLTncHDhR0f87e3hTEz//f3rhITlXl7cJibZGBj98vL40tLeNDTdLy/bICDaHBzZFRX529v0vb3peHjoc3PlYmL99vb74uL2xMTjVFTaGhr76Oj53Nz2ycnzuLjwoqLvnZ3ul5fmaGj63t7xqKjmaWn99PTyra3qgYHhFZYvAAAAGnRSTlMAMO37+tXPtoA2BiQI6o4/9PGvrpyZjz4JJl3VPuUAAAIKSURBVDjLpZXncuIwFIWNqcEBUkjZe2zcqKbbkJCQsiTZ3fd/o0USMZJoO7Pnh0caf7Zul6GqXCtd581czsxfl2pl47AyNyYkmTeZQ2ARQNhyncC2A8dthQCK++DzahZIHJLkJED29lwnrQLg9UhTzwMKlkqeVeA3aI8aPswzhbxA26a9sme4kFirghUd1AoVK/WogDYdURuFb9+q8O1jqO2juolnFhuPnGeVaUYb35AV8S3CI66o039WPepOxcpDkf8U6Ilvh4DM2m2g+yriC7Df1pEQ109gzT6k5ALAt78J6utausSE9rBzRqbRnuCybNwhJJLZAWd/hWw9SyMT4s4ooUWp3jn7QdTz2WrVTN+0UDKu4JLOLgNOeluSXFwZeSiF98aYTp89E4kkB3nDREAKO4ZQLJMUwDRy0JL6Kdg/WnKR20UfOowcRbuobsDHAFydiDQDdLeWnBwLVnVLC9aEn/7udgEMG6QES02Bw8jxG5HKihQoiY04+cmWr5x9oW1ia3K5NIaM/C02U5kV5WLUEYvtCyO7qeXTJxazR7GJUeel3Z9zO0cQpayy3N55HxmpYZoe8DQlSY9rdjHfNoxoQ8Gy4xR2tLDTNlSau7kkTZGtNrdxf3pk3EuD6Osw+YWKpYy32fHxJrHmsaH5z6P4x86Av81iEKsDPh5IA/70tfF/l9HpK+4vTq6aylYNDE8AAAAASUVORK5CYII=',
                            skin        : 'rule-dialog'
                        })
                    }
                }

                var params = $.extend({
                    url     : '/games/' + sellerId + '/' + activityId + '/rule',
                    type    : 'GET',
                    dataType: 'json',
                    success : success
                }, ajaxParams || {});

                $.ajax(params);
            }
        },
        lotteryRule     : function (sellerId, activityId, ajaxParams) {
            var self = this;

            function createContent(_data) {
                return '<div class="lottery-rule"><pre id="description">' + (_data.description || '无') + '</pre></div>';
            }

            if (window.LOTTERY_RULE_DATA) {
                self.open({
                    title       : '活动规则',
                    content     : createContent(window.LOTTERY_RULE_DATA),
                    showCloseBtn: true,
                    closeBtnImg : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAA2FBMVEUAAADYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhL////YEhL++fn52Nj3z8/ztLTncHDhR0f87e3hTEz//f3rhITlXl7cJibZGBj98vL40tLeNDTdLy/bICDaHBzZFRX529v0vb3peHjoc3PlYmL99vb74uL2xMTjVFTaGhr76Oj53Nz2ycnzuLjwoqLvnZ3ul5fmaGj63t7xqKjmaWn99PTyra3qgYHhFZYvAAAAGnRSTlMAMO37+tXPtoA2BiQI6o4/9PGvrpyZjz4JJl3VPuUAAAIKSURBVDjLpZXncuIwFIWNqcEBUkjZe2zcqKbbkJCQsiTZ3fd/o0USMZJoO7Pnh0caf7Zul6GqXCtd581czsxfl2pl47AyNyYkmTeZQ2ARQNhyncC2A8dthQCK++DzahZIHJLkJED29lwnrQLg9UhTzwMKlkqeVeA3aI8aPswzhbxA26a9sme4kFirghUd1AoVK/WogDYdURuFb9+q8O1jqO2juolnFhuPnGeVaUYb35AV8S3CI66o039WPepOxcpDkf8U6Ilvh4DM2m2g+yriC7Df1pEQ109gzT6k5ALAt78J6utausSE9rBzRqbRnuCybNwhJJLZAWd/hWw9SyMT4s4ooUWp3jn7QdTz2WrVTN+0UDKu4JLOLgNOeluSXFwZeSiF98aYTp89E4kkB3nDREAKO4ZQLJMUwDRy0JL6Kdg/WnKR20UfOowcRbuobsDHAFydiDQDdLeWnBwLVnVLC9aEn/7udgEMG6QES02Bw8jxG5HKihQoiY04+cmWr5x9oW1ia3K5NIaM/C02U5kV5WLUEYvtCyO7qeXTJxazR7GJUeel3Z9zO0cQpayy3N55HxmpYZoe8DQlSY9rdjHfNoxoQ8Gy4xR2tLDTNlSau7kkTZGtNrdxf3pk3EuD6Osw+YWKpYy32fHxJrHmsaH5z6P4x86Av81iEKsDPh5IA/70tfF/l9HpK+4vTq6aylYNDE8AAAAASUVORK5CYII=',
                    skin        : 'rule-dialog'
                })
            } else {
                function success(data) {
                    if (data && data.data) {
                        var _data = window.LOTTERY_RULE_DATA = data.data;
                        self.open({
                            title       : '活动规则',
                            content     : createContent(_data),
                            showCloseBtn: true,
                            closeBtnImg : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAA2FBMVEUAAADYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhLYEhL////YEhL++fn52Nj3z8/ztLTncHDhR0f87e3hTEz//f3rhITlXl7cJibZGBj98vL40tLeNDTdLy/bICDaHBzZFRX529v0vb3peHjoc3PlYmL99vb74uL2xMTjVFTaGhr76Oj53Nz2ycnzuLjwoqLvnZ3ul5fmaGj63t7xqKjmaWn99PTyra3qgYHhFZYvAAAAGnRSTlMAMO37+tXPtoA2BiQI6o4/9PGvrpyZjz4JJl3VPuUAAAIKSURBVDjLpZXncuIwFIWNqcEBUkjZe2zcqKbbkJCQsiTZ3fd/o0USMZJoO7Pnh0caf7Zul6GqXCtd581czsxfl2pl47AyNyYkmTeZQ2ARQNhyncC2A8dthQCK++DzahZIHJLkJED29lwnrQLg9UhTzwMKlkqeVeA3aI8aPswzhbxA26a9sme4kFirghUd1AoVK/WogDYdURuFb9+q8O1jqO2juolnFhuPnGeVaUYb35AV8S3CI66o039WPepOxcpDkf8U6Ilvh4DM2m2g+yriC7Df1pEQ109gzT6k5ALAt78J6utausSE9rBzRqbRnuCybNwhJJLZAWd/hWw9SyMT4s4ooUWp3jn7QdTz2WrVTN+0UDKu4JLOLgNOeluSXFwZeSiF98aYTp89E4kkB3nDREAKO4ZQLJMUwDRy0JL6Kdg/WnKR20UfOowcRbuobsDHAFydiDQDdLeWnBwLVnVLC9aEn/7udgEMG6QES02Bw8jxG5HKihQoiY04+cmWr5x9oW1ia3K5NIaM/C02U5kV5WLUEYvtCyO7qeXTJxazR7GJUeel3Z9zO0cQpayy3N55HxmpYZoe8DQlSY9rdjHfNoxoQ8Gy4xR2tLDTNlSau7kkTZGtNrdxf3pk3EuD6Osw+YWKpYy32fHxJrHmsaH5z6P4x86Av81iEKsDPh5IA/70tfF/l9HpK+4vTq6aylYNDE8AAAAASUVORK5CYII=',
                            skin        : 'rule-dialog'
                        })
                    }
                }

                var params = $.extend({
                    url    : 'act-data',
                    data   : {
                        needRule: true
                    },
                    success: success
                }, ajaxParams || {});

                $.doAjax(params);
            }
        },
        /**
         * @deprecated 废弃了，以后拓展换成layer吧
         *
         * onClose:关闭窗口时候响应的事件，如果从外部调GameDialog.close(), 需要在close里传入事件
         * onSuccess:窗口打开成功后的事件
         * @param options
         */
        open            : function (options) {
            var self = this;

            var cover  = $('<div id="dialog-cover" class="dialog-cover"></div>');
            var dialog = $('<div id="game-dialog" class="game-dialog"></div>');

            var closeBtn;
            if (options.closeBtnImg) {
                closeBtn = $('<img id="closeBtn" src="' + options.closeBtnImg + '">');
            } else {
                closeBtn = $('<img id="closeBtn" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAA4VBMVEUAAADe3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7///+Dg4Pw8PD09PTm5ubo6Oji4uLy8vLt7e2MjIyJiYmGhob4+Pjs7Ozk5OT8/Pzq6uqUlJSPj4/29vb7+/vY2NjU1NSXl5efn5/6+vqQkJDf39/Ozs7BwcGjo6Obm5va2trLy8vGxsawsLClpaUkNC+QAAAAJnRSTlMABP4JEUfzxLZwZlUfFxMN49POqoF2UD03MSsc7Ni+m5GMYSMG9w5NUksAAAIASURBVDjLhdRpd+IgFAbgGxP3fWnduk07Q4CYVLNp7LS2M531//+gGRAqkKjvB0889zkhwAUw40yb9dFFo/zwGU6mNbqiESaE+DhdDJr2UTjppwQdkuD4zimE7WqwRUYIrVt52fQyVBB83THlXYSKQ0ozXQ4DdCxhNFHlJ1Wa2ZZaB3kpR8dEV37IfrOKLWWnJCrR67Nm8fqFW78m6Y2opxvXffZV6bp7G433cio/9KvrCivG+P93xUdMrixOBzuk2rUvx2DyCfEEZSbnnpTSYvboPYp38iR9Ri8IUuxKWMrkkkseyjatlyAlT3u7WDK5UKZ4CdCNFSjthslHtRIOAWYpKrBMUqSmAlDGyMjPFZce0rKwoOGjwtdujLaIu2IB9EXgedXbkjpQN+g3/ko+t1SjXbj383KNS0vTxjaMtW/6Jdvgbcmnpk2rpc70N5M/CC/pNukBWMqWfOcyQ0hYZXGzEQBUt4oUDZq3wYSdFixPB+uQdymlfRHP7F6yxVbzbvq705Z96YoTlN3ujyuRJe+Pcb/Q90xU5pw6FJ0Lkeewjs9R6ghqXZPTMrgHmXZpd0riGhwyjZITcmCBknEUHpV94/KefSHFMqhZYKRbDZI8JF4DClKuYAOH6U0bCmM1e56//XA4Hj7A8bQa1beYeh5dVG7LNpyL3Zm3HQty+QfUeMwO75AmbgAAAABJRU5ErkJggg==">');
            }
            closeBtn.on('click', function (event) {
                self.close(options.onClose);
            });

            var title = $('<div class="dialog-title"><span>' + options.title + '</span></div>');

            if (options.showCloseBtn)
                title.append(closeBtn);

            var content = $('<div class="dialog-content"></div>');
            content.append(options.content);

            var btnBox = $('<div class="dialog-btns"></div>');

            var has = createBtn(btnBox, options);

            if (options.skin) {
                dialog.addClass(options.skin);
                cover.addClass(options.skin);
            }

            dialog.append(title);

            dialog.append(content);
            if (has)
                dialog.append(btnBox);

            self.close();
            $.showOverlay("game-dialog-cover");
            var zindex = $.getNextZIndex();
            dialog.css("z-index", zindex);
            dialog.css('display', 'none');
            $(document.body).append(dialog);
            setTimeout(function () {
                dialog.css('display', 'inline-block');
                var marginTop = -dialog.height() / 2;
                dialog.css('margin-top', marginTop + 'px');
                dialog.addClass(options.animated || 'zoomIn').addClass('animated');
                if (isFunc(options.onSuccess))
                    options.onSuccess();
            }, 50);
        },
        reset           : function () {
            var dialog    = $('#game-dialog');
            var marginTop = -dialog.height() / 2;
            dialog.css('margin-top', marginTop + 'px');
        },
        config          : function (settings) {
            this.settings = $.extend(this.settings, settings || {});
        },
        openWinRecord   : function (nick, sellerId, activityId, options) {
            var self = this;
            if (!options)
                options = {};

            var queryUrl = options.queryUrl || 'winner-records';
            var tmpData  = {};

            function formSubmit(target, id) {
                target.on('click', function () {
                    var data = {};
                    var form = $('#real-form-' + id);
                    var arr  = form.serializeArray();
                    if (arr) {
                        for (var i = 0; i < arr.length; i++) {
                            var v     = arr[i];
                            var value = v.value;
                            if (!value || value.length < 1) {
                                $.toast('中奖信息不可为空！');
                                return;
                            }
                            data[v.name] = value;
                        }
                    }
                    data.participantId = id;
                    data.nick          = window.nick;

                    $.doAjax({
                        url     : 'personal-info',
                        type    : 'POST',
                        dataType: 'json',
                        data    : data,
                        success : function (data) {
                            if (data.success) {
                                form.find('input').each(function () {
                                    $(this).attr('readonly', 'true');
                                    $(this).addClass('readOnly');
                                });
                                $('#form-submit-' + id).addClass('hide');
                                $('#form-cancel-' + id).addClass('hide');
                                $('#form-modify-' + id).removeClass('hide');
                            } else {
                                $.toast(data.message);
                            }
                        }
                    });
                });
            }

            function formModify(target, id) {
                target.on('click', function () {
                    var form = $('#real-form-' + id);
                    var arr  = form.serializeArray();
                    // tmpData = {};
                    // if (arr) {
                    //     for (var i = 0; i < arr.length; i++) {
                    //         var v = arr[i];
                    //         var value = v.value;
                    //         if (!value || value.length < 1) {
                    //             $.toast('中奖信息不可为空！');
                    //             return;
                    //         }
                    //         tmpData[v.name] = value;
                    //     }
                    // }
                    form.find('input').each(function () {
                        $(this).removeAttr('readonly');
                        $(this).removeClass('readOnly');
                    });
                    $('#form-modify-' + id).addClass('hide');
                    $('#form-submit-' + id).removeClass('hide');
                    $('#form-cancel-' + id).removeClass('hide');
                });
            }

            function cancelModify(target, id) {
                target.on('click', function () {
                    var form = $('#real-form-' + id);
                    form.find('input').each(function () {
                        var $this = $(this);
                        var name  = $this.attr('name');

                        var value = tmpData[name];
                        if (value && value.length > 0) {
                            $this.val(value);
                        }

                        $this.attr('readonly', 'true');
                        $this.addClass('readOnly');
                    });
                    $('#form-submit-' + id).addClass('hide');
                    $('#form-cancel-' + id).addClass('hide');
                    $('#form-modify-' + id).removeClass('hide');
                });
            }

            function showForm(target, id) {
                target.on('click', function () {
                    var form = $('#real-form-' + id);
                    if (form) {
                        if (form.hasClass('hide')) {
                            form.removeClass('hide');
                        } else {
                            form.addClass('hide')
                        }
                    }
                    self.reset();
                });
            }

            $.doAjax({
                url     : queryUrl,
                type    : 'POST',
                dataType: 'json',
                data    : {
                    nick: nick
                },
                success : function (data) {
                    var giftList = data.data;
                    var content  = $('<div class="record-list"></div>');
                    if (giftList && giftList.length > 0) {
                        // content.append('<div class="list-title">尊敬的用户，您的中奖信息如下</div>');
                        var listMain = $('<ul class="list-main"></ul>');

                        giftList && giftList.forEach(function (v) {
                            var str   = '<li><div class="gift-row"><span class="time-text">!{time}</span><span class="gift-text">抽中<span class="strong-text">!{gift}</span>!{real}</span></div></li>';
                            var real  = '';
                            var extra = null;
                            if (v.giftType === 'REAL_STUFF') {
                                extra = JSON.parse(v.giftExtra || '{}');
                                // real  = '<span class="gift-detail">详细>></span>'
                            }
                            var li = $(str.render({time: v.drawTime, gift: v.giftName, real: real}));
                            if (extra && v.giftType === 'REAL_STUFF') {
                                li.find('.gift-row').each(function () {
                                    showForm($(this), v.id);
                                });
                                var modify = true;
                                if (v.userInfo) {
                                    modify = false;
                                } else {
                                    modify     = true;
                                    v.userInfo = v.userInfo || {};
                                }
                                var opts = extra['REAL_STUFF'];
                                if (opts) {
                                    var noForm = false;
                                    if (!(opts.needTaobaoAccount
                                        || opts.needPhoneNumber
                                        || opts.needReceiverAddress
                                        || opts.needAliPayAccount
                                        || opts.needReceiver)) {
                                        noForm = true;
                                    }
                                    var form = $('<form class="real-form hide" onsubmit="return false;" id="real-form-' + v.id + '"></form>');
                                    if (opts.rule) {
                                        form.append('<pre class="stuff-rule">' + opts.rule + '</pre>')
                                    }
                                    if (opts.needTaobaoAccount) {//需要淘宝帐号
                                        var taobaoAccount = v.userInfo.taobaoAccount;
                                        if (taobaoAccount == undefined) {
                                            if (window.realNick) {
                                                taobaoAccount = window.realNick;
                                            } else {
                                                taobaoAccount = '';
                                            }
                                        }
                                        form.append('<p><label class="l1">淘宝帐号：</label><input readonly="true" class="readOnly" name="taobaoAccount" value="' + taobaoAccount + '" /></p>')
                                    }
                                    if (opts.needPhoneNumber) {//需要手机号码
                                        var phoneNumber = v.userInfo.phoneNumber;
                                        if (phoneNumber == undefined)
                                            phoneNumber = '';
                                        form.append('<p><label class="l1">手机号码：</label><input readonly="true" type="tel"  class="readOnly" name="phoneNumber" value="' + phoneNumber + '" /></p>')
                                    }
                                    if (opts.needReceiverAddress) {//需要收货人地址
                                        var receiverAddress = v.userInfo.receiverAddress;
                                        if (receiverAddress == undefined)
                                            receiverAddress = '';
                                        form.append('<p><label class="l1">收货地址：</label><input readonly="true" class="readOnly" name="receiverAddress" value="' + receiverAddress + '" /></p>')
                                    }
                                    if (opts.needAliPayAccount) {//需要支付宝帐号
                                        var aliPayAccount = v.userInfo.aliPayAccount;
                                        if (aliPayAccount == undefined)
                                            aliPayAccount = '';
                                        form.append('<p><label class="l1">支付宝帐号：</label><input readonly="true" class="readOnly" name="aliPayAccount" value="' + aliPayAccount + '"/></p>')
                                    }
                                    if (opts.needReceiver) {//需要收货人
                                        var receiver = v.userInfo.receiver;
                                        if (receiver == undefined)
                                            receiver = '';
                                        form.append('<p><label class="l1">收货人：</label><input readonly="true" class="readOnly" name="receiver" value="' + receiver + '" /></p>')
                                    }
                                    if (modify) {
                                        form.find('input').each(function () {
                                            $(this).removeAttr('readonly');
                                            $(this).removeClass('readOnly');
                                        });
                                    }
                                    var btn1 = $('<span class="form-btn" id="form-submit-' + v.id + '">提交</span>');
                                    formSubmit(btn1, v.id);

                                    var btn2 = $('<span class="form-btn" id="form-modify-' + v.id + '">修改</span>');
                                    formModify(btn2, v.id);

                                    var btn3 = $('<span class="form-btn" id="form-cancel-' + v.id + '">取消</span>');
                                    cancelModify(btn3, v.id);
                                    if (noForm) {
                                        btn1.addClass('hide')
                                        btn2.addClass('hide');
                                        btn3.addClass('hide');
                                    }
                                    if (modify) {
                                        btn2.addClass('hide');
                                    } else {
                                        btn3.addClass('hide');
                                        btn1.addClass('hide')
                                    }

                                    var p = $('<p class="btn-p"></p>');
                                    p.append(btn1);
                                    p.append(btn3);
                                    p.append(btn2);
                                    form.append(p);
                                    // form.append('<div id="form-' + v.id + '-msg" class="error-msg"></div>');
                                    li.append(form);
                                }
                            } else {
                                li.on('click', '.gift-row', function () {
                                    gameDialog.win(v.giftType, v.giftExtra);
                                });
                            }
                            listMain.append(li);
                        });
                        content.append(listMain);
                    } else {
                        content.append('<div class="empty-msg">您暂时还没有中奖记录，赶紧去抽奖吧！<br/>精彩大奖等着你</div>');
                        var closeBtn = $('<div class="btn-line"><button class="play-game-btn">去抽奖</button></div>');
                        closeBtn.on('click', 'button.play-game-btn', function () {
                            self.close();
                        });
                        content.append(closeBtn)
                    }
                    var _options     = $.extend({
                        showCloseBtn: true,
                        skin        : 'win-record',
                        title       : '中奖记录'
                    }, options);
                    _options.content = content;
                    self.open(_options);
                }
            })
        },
        share           : function (url, params) {
            var descTplMap = {
                deprecated    : '每分享给${person}个好友可获得${count}次抽奖机会，获得的抽奖机会最多不超过${maxCount}次',
                mjsStepCount  : '<div>分享给${amount}个好友,可获得${count}次抽奖机会</div>',
                mjsLinearCount: '每分享${amount}个好友,可获得${count}次抽奖机会',
                mjsFixCount   : '分享${amount}个好友以上,可获得${count}次抽奖机会',
            };

            var desc = getExtraCountDesc(descTplMap, params, 0);

            var content = '<div>\n    <p>\n        ${desc} \n    </p>\n\n    <div class="text-muted">\n        <span class="text-warning">注意:</span>\n        <div>\n            对方需打开活动并参与抽奖，才算作一次有效的分享\n        </div>\n    </div>\n</div>'.render({
                desc: desc
            });

            layer.open({
                type     : 1,
                className: 'lottery share',
                title    : '分享抽奖',
                content  : content,
                btn      : ['去分享'],
                yes      : function () {
                    $.tida.getUserNick(function (nick) {
                        $.tida.share({
                            title  : "幸运抽奖",
                            content: "幸运抽奖，嗨翻全场！超值好礼奖不停！",
                            url    : url + "?fromNick=" + encodeURIComponent(nick),
                        }, function () {
                            console.log('分享成功')
                        });
                    }, function () {
                        $.alert("亲,获取您的身份失败");
                    })
                }
            })
        },
        buy             : function (extraCount, callback) {
            var shopUrl = 'https://shop' + window.settings.shopId + '.taobao.com/';
            if (!extraCount.tradeCountEnabled && !extraCount.tradePaymentEnabled) {
                document.location = shopUrl;
                return;
            }
            var config = extraCount.tradeCountConfig || extraCount.tradePaymentConfig;
            if (!config) {
                document.location = shopUrl;
                return;
            }
            var onlyone = true;
            if (extraCount.tradeCountEnabled && extraCount.tradePaymentEnabled) {
                onlyone = false;
            }
            var items;
            if (onlyone && config.condition && config.condition.range && config.condition.range.range === 'INCLUDE') {
                items = config.condition.range.items;
            }
            var $instance  = $('<div class="do-task-container"></div>');
            var $payed     = $('<div class="payed">(我已经下单, 但还是没机会? <a data-trigger="refreshTrade" href="javascript:;">点这里试试</a>)</div>');
            var descTplMap = {
                mjsStepCount  : '<div>单笔订单满${amount}件宝贝,可获得${count}次抽奖机会</div>',
                mjsLinearCount: '单笔订单每满${amount}件宝贝,可获得${count}次抽奖机会',
                mjsFixCount   : '单笔订单满${amount}件宝贝以上,可获得${count}次抽奖机会',
            };
            var amountFix  = 0;
            if (config.condition && config.condition.type === 'tradePayment') {
                descTplMap = {
                    mjsStepCount  : '<div>单笔订单满${amount}元,可获得${count}次抽奖机会</div>',
                    mjsLinearCount: '单笔订单每满${amount}元,可获得${count}次抽奖机会',
                    mjsFixCount   : '单笔订单超过${amount}元及以上,可获得${count}次抽奖机会',
                };
                amountFix  = 2;
            }

            var desc  = '<p>' + getExtraCountDesc(descTplMap, config, amountFix) + '</p>';
            var $desc = $(desc);
            $instance.append($desc);
            if (items) {
                var $todo   = $('<ul class="todo"></ul>');
                var itemTpl = '<li>\n    <a href="//item.taobao.com/item.htm?id=${numIid}" target="_blank">\n       <img src="${picUrl}_200x200.jpg" alt="">\n    </a>\n    <span><a href="//item.taobao.com/item.htm?id=${numIid}" target="_blank">购买</a></span>\n</li>'
                items.forEach(function (item) {
                    var $html = $(itemTpl.render({
                        picUrl: item.picUrl,
                        numIid: item.numIid
                    }));

                    $todo.append($html)
                })
                $instance
                    .append($todo)
                    .append($payed)
                    .on('click', '[data-trigger="refreshTrade"]', function () {
                        refreshTrade(callback);
                    });

                layer.open({
                    type      : 1,
                    anim      : 'up',
                    shadeClose: true,
                    className : 'lottery task trade-task',
                    title     : '下单抽奖',
                    content   : $instance
                });
            } else {
                $instance
                    .append($payed)
                    .on('click', '[data-trigger="refreshTrade"]', function () {
                        refreshTrade(callback);
                    });
                layer.open({
                    type     : 1,
                    className: 'lottery share trade-task',
                    title    : '下单抽奖',
                    content  : $instance,
                    btn      : ['去下单'],
                    yes      : function () {
                        document.location = shopUrl;
                    }
                });
            }
        },
        rate            : function (extraCount, callback) {
            var myOrderUrl = '//h5.m.taobao.com/mlapp/olist.html?tabCode=waitRate';
            if (!$.isMobile()) {
                myOrderUrl = 'https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm?action=itemlist/BoughtQueryAction&event_submit_do_query=1&tabCode=waitRate';
            }
            var config = extraCount.tradeRateConfig;
            if (!config) {
                document.location = myOrderUrl;
                return;
            }

            var items;
            if (config.condition && config.condition.range && config.condition.range.range === 'INCLUDE') {
                items = config.condition.range.items;
            }
            var $instance  = $('<div class="do-task-container"></div>');
            var $rated     = $('<div class="payed">(我给了好评, 但还是没机会? <a data-trigger="refreshRate" href="javascript:;">点这里试试</a>)</div>');
            var descTplMap = {
                mjsStepCount  : '<div>评论满${amount}个字,可获得${count}次抽奖机会</div>',
                mjsLinearCount: '评论每满${amount}个字,可获得${count}次抽奖机会',
                mjsFixCount   : '评论满${amount}个字以上,可获得${count}次抽奖机会',
            };

            var desc  = '<p>' + getExtraCountDesc(descTplMap, config, 0) + '</p>';
            var $desc = $(desc);
            $instance.append($desc);
            if (items) {
                var $todo   = $('<ul class="todo"></ul>');
                var itemTpl = '<li>\n    <a href="//item.taobao.com/item.htm?id=${numIid}" target="_blank">\n       <img src="${picUrl}_200x200.jpg" alt="">\n    </a>\n    <span><a href="//item.taobao.com/item.htm?id=${numIid}" target="_blank">购买</a></span>\n</li>'
                items.forEach(function (item) {
                    var $html = $(itemTpl.render({
                        picUrl: item.picUrl,
                        numIid: item.numIid
                    }));

                    $todo.append($html)
                })
                $instance
                    .append('<div class="text-muted">(购买以下宝贝并好评才会获得抽奖机会哦~~)</div>')
                    .append($todo)
                    .append($rated)
                    .on('click', '[data-trigger="refreshRate"]', function () {
                        refreshRate(callback);
                    });

                layer.open({
                    type      : 1,
                    anim      : 'up',
                    shadeClose: true,
                    className : 'lottery task trade-task',
                    title     : '好评抽奖',
                    content   : $instance
                });
            } else {
                $instance
                    .append($rated)
                    .on('click', '[data-trigger="refreshRate"]', function () {
                        refreshRate(callback);
                    });
                layer.open({
                    type     : 1,
                    className: 'lottery share trade-task',
                    title    : '好评抽奖',
                    content  : $instance,
                    btn      : ['去评价'],
                    yes      : function () {
                        document.location = myOrderUrl;
                    }
                });
            }
        },
        shopFollow      : function (extraCount, callback) {
            var config = extraCount.shopFollowConfig || {};

            var desc;
            var countMeta = config.countMeta;
            if (countMeta) {
                desc = '${action}, ${type}可获得${count}次抽奖机会'.render({
                    action: this.lotteryDict.follow,
                    type  : countMeta.countType == 'EACH_DAY' ? '每天' : '',
                    count : countMeta.count
                });
            } else {
                desc = this.lotteryDict.follow + '可获得抽奖机会';
            }

            var content = '<div>\n    <p>\n     ${desc} \n    </p>\n\n</div>'.render({
                desc: desc
            });

            var act     = window.act || {};
            var doneStr = '您已经${action}了该店铺了,\n无法获得新的抽奖机会'.render({action: this.lotteryDict.follow.substr(0, 2)})
            layer.open({
                type     : 1,
                className: 'lottery share',
                title    : this.lotteryDict.follow,
                content  : content,
                btn      : [this.lotteryDict.follow],
                yes      : function (index) {
                    layer.close(index);
                    if (act.shopFollowedBefore || act.shopFollowed) {
                        //并不是客户端一关注,后端就能获取到关注结果的
                        $.doAjax({
                            url : 'refresh-shop-follow',
                            data: {
                                nick: window.nick,
                            }
                        });
                        return $.toast(doneStr);
                    }
                    $.tida.getUserNick({
                        showLoading: false,
                        success    : function (nick) {
                            window.nick = nick;
                            $.doAjax({
                                url    : "attention",
                                data   : {nick: nick},
                                method : 'POST',
                                mask   : false,
                                success: function (rslt) {
                                    if (rslt.success) {
                                        //并不是客户端一关注,后端就能获取到关注结果的
                                        $.doAjax({
                                            url : 'refresh-shop-follow',
                                            data: {
                                                nick: window.nick,
                                            }
                                        });
                                        act.shopFollowedBefore = true;
                                        return $.toast(doneStr);
                                    } else {
                                        act.shopFollowedBefore = false;
                                        $.tida.followShop({
                                            sellerId: act.sellerId
                                        }, function (res) {
                                            if (res.success) {
                                                $.doAjax({
                                                    url : 'refresh-shop-follow',
                                                    data: {
                                                        nick: window.nick,
                                                    }
                                                }).then(function (rst) {
                                                    if (rst.success) {
                                                        act.shopFollowed = rst.data.shopFollowed;
                                                        callback && callback(rst);
                                                    } else {
                                                        $.toast(rst.message);
                                                    }
                                                });
                                            } else {
                                                $.alert(this.lotteryDict.follow + "失败，请重试");
                                            }
                                        });
                                    }

                                }
                            });
                        }
                    });
                }
            })
        },
        confirmGoods    : function (extraCount, callback) {
            var myConfirmUrl = '//h5.m.taobao.com/mlapp/olist.html?tabCode=waitConfirm';
            if (!$.isMobile()) {
                myConfirmUrl = 'https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm?action=itemlist/BoughtQueryAction&event_submit_do_query=1&tabCode=waitConfirm';
            }
            var config = extraCount.confirmGoodConfig;
            if (!config) {
                document.location = myConfirmUrl;
                return;
            }
            var items;
            if (config.condition && config.condition.range && config.condition.range.range === 'INCLUDE') {
                items = config.condition.range.items;
            }
            var $instance  = $('<div class="do-task-container"></div>');
            var $confirmed = $('<div class="confirmed">(我已经确认收货, 但还是没机会? <a data-trigger="refreshConfirmGoods" href="javascript:;">点这里试试</a>)</div>');
            var descTplMap = {
                mjsStepCount  : '<div>订单金额满${amount}元,可获得${count}次抽奖机会</div>',
                mjsLinearCount: '<div>订单金额每满${amount}元,可获得${count}次抽奖机会</div>',
                mjsFixCount   : '<div>订单金额满${amount}元以上,可获得${count}次抽奖机会</div>'
            };
            var desc       = '<p>' + getExtraCountDesc(descTplMap, config, 0) + '</p>';
            var $desc      = $(desc);
            $instance.append($desc);
            if (items) {
                var $todo   = $('<ul class="todo"></ul>');
                var itemTpl = '<li>\n    <a href="//item.taobao.com/item.htm?id=${numIid}" target="_blank">\n       <img src="${picUrl}_200x200.jpg" alt="">\n    </a>\n    <span><a href="//item.taobao.com/item.htm?id=${numIid}" target="_blank">购买</a></span>\n</li>'
                items.forEach(function (item) {
                    var $html = $(itemTpl.render({
                        picUrl: item.picUrl,
                        numIid: item.numIid
                    }));

                    $todo.append($html)
                })

                $instance
                    .append('<div class="text-muted">(购买以下宝贝并在收到包裹后24小时内确认收货才会获得抽奖机会哦~~)</div>')
                    .append($todo)
                    .append($confirmed)
                    .on('click', '[data-trigger="refreshConfirmGoods"]', function () {
                        refreshConfirmGoods(callback);
                    });

                layer.open({
                    type      : 1,
                    anim      : 'up',
                    shadeClose: true,
                    className : 'lottery task trade-task',
                    title     : '确认收货抽奖',
                    content   : $instance
                });
            } else {
                $instance
                    .append($confirmed)
                    .on('click', '[data-trigger="refreshConfirmGoods"]', function () {
                        refreshConfirmGoods(callback);
                    });
                layer.open({
                    type     : 1,
                    className: 'lottery share trade-task',
                    title    : '确认收货抽奖',
                    content  : $instance,
                    btn      : ['去确认收货'],
                    yes      : function () {
                        document.location = myConfirmUrl;
                    }
                });
            }
        },
        realNickRequired: function (callback) {
            var $content = $('<div class="real-stuff-wraper refresh-trade">' +
                '<div class="tip">(输入你的淘宝账号,否则无法抽奖)</div>' +
                '<form><div class="form-group"><label>淘宝账号：</label><input name="taobaoAccount" type="text"></div></form>' +
                '</div>');

            var layerConfig = {
                title    : '淘宝账号',
                className: 'lottery game-content',
                content  : $content,
                btn      : '确定',
                yes      : function (index) {
                    var $input  = $content.find("input");
                    var account = $input.val();
                    if (!$.validator.methods.required(account)) {
                        $.toast('请输入您的淘宝账号');
                        return;
                    }
                    $.doAjax({
                        url : 'save-real-nick',
                        data: {
                            nick    : window.nick,
                            realNick: account
                        }
                    }).then(function (rst) {
                        if (rst.success) {
                            window.realNick = account;
                            layer.close(index);
                            callback && callback(rst);
                        } else {
                            $.toast(rst.message);
                        }
                    });
                }
            };
            layer.open(layerConfig);
        },
        doTask          : function (type, params, doneCallback) {
            var that     = this
            var taskDesc = that.taskMap[type]

            checkItems()
                .then(function (doneItems) {
                    // 标记todo状态
                    params.items.forEach(function (item) {
                        item._done = !!item._done

                        if (doneItems) {
                            item._done = doneItems.some(function (doneItem) {
                                return doneItem.numIid === item.numIid
                            })
                        }
                    })

                    layer.open({
                        type      : 1,
                        anim      : 'up',
                        shadeClose: true,
                        className : 'lottery task',
                        title     : taskDesc.title,
                        content   : that.renderTask(type, params, doneCallback)
                    })
                })

            /**
             * 检查已做任务列表
             * @returns {*}
             */
            function checkItems() {
                var defer = $.Deferred()

                if (taskDesc.init) return defer.resolve()

                $[taskDesc.alias + 'Items']({
                    bizType      : params.bizType || "Lottery",
                    bizActivityId: params.id
                }, defer.resolve);

                // 上面的接口在PC上可能不会回调,为了调试方便,直接标记checked
                taskDesc.init = true

                return defer.promise()
            }
        },

        renderTask: function (type, params, doneCallback) {
            var that         = this
            var taskDesc     = that.taskMap[type]
            var $instance    = $('<div class="do-task-container"></div>')
            var todoEmptyTpl = '<li class="empty">\n    已全部${action}\n</li>'
            var doneEmptyTpl = '<li class="empty">\n    还没有${action}宝贝\n</li>'
            var todoItemTpl  = '<li data-trigger="doTask">\n    <a href="javascript:">\n       <img src="${picUrl}_200x200.jpg" alt="">\n    </a>\n    <span>点击${action}</span>\n</li>'
            var doneItemTpl  = '<li>\n    <a href="//item.taobao.com/item.htm?id=${numIid}">\n        <img src="${picUrl}_200x200.jpg" alt="">\n    </a>\n</li>'
            var $todo        = $('<ul class="todo"></ul>')
            var $done        = $('<ul class="done"></ul>')
            var descTplMap   = {
                deprecated    : '每${action}${item}个宝贝,可获得${count}次抽奖机会 <span class="text-muted">(最多不超过${maxCount}次)</span>',
                mjsStepCount  : '<div>${action}${amount}个宝贝,可获得${count}次抽奖机会</div>',
                mjsLinearCount: '每${action}${amount}个宝贝,可获得${count}次抽奖机会',
                mjsFixCount   : '${action}${amount}个宝贝以上,可获得${count}次抽奖机会',
            };

            var desc  = '<p>' + getExtraCountDesc(descTplMap, $.extend({}, params, {action: taskDesc.name}), 0) + '</p>';
            var $desc = $(desc);

            var $todoEmpty = $(todoEmptyTpl.render({
                action: taskDesc.name
            }))
            var $doneEmpty = $(doneEmptyTpl.render({
                action: taskDesc.name
            }))

            var todoItems = params.items.filter(function (item) {
                return !item._done
            })
            var doneItems = params.items.filter(function (item) {
                return item._done
            });

            [[todoItems, $todo, $todoEmpty, todoItemTpl], [doneItems, $done, $doneEmpty, doneItemTpl]].forEach(function (options) {
                var items      = options[0]
                var $container = options[1]
                var empty      = options[2]
                var itemTpl    = options[3]

                if (!items.length) {
                    $container.append(empty)
                } else {
                    items.forEach(function (item, i) {
                        var $html = $(itemTpl.render({
                            picUrl: item.picUrl,
                            numIid: item.numIid,
                            action: taskDesc.name
                        }))

                        $html[0].data = item
                        $container.append($html)
                    })
                }
            })

            $instance
                .append($desc)
                .append($todo)
                .append($done)
                .on('click', '[data-trigger="doTask"]', function () {
                    var $this = $(this)
                    var item  = this.data

                    $.showLoading()
                    taskDesc.tida({itemId: item.numIid}, function (res) {
                        if (!res.success) return $.hideLoading()

                        var data = {
                            url : taskDesc.api,
                            data: $.extend({}, item, {
                                nick: window.nick
                            })
                        }
                        $.doAjax(data)
                            .then(function (res) {
                                if (!res.success) return

                                $this.add($doneEmpty).remove()
                                $done.append(doneItemTpl.render({
                                    picUrl: item.picUrl,
                                    numIid: item.numIid,
                                    action: taskDesc.name
                                }))
                                if (!$todo.find('li').length) $todo.append($todoEmpty)

                                item._done = true
                                doneCallback && doneCallback(res)
                            })
                            .always(function () {
                                $.hideLoading()
                            })
                    })
                })

            return $instance
        },
        
        shopFollowGift : function () {
            $.doAjax({
                url : 'myGift',
                type : 'GET',
                success : function (rst) {
                    var gift = rst.data;
                    var $content  = $('<div class="record-list"></div>');
                    if (gift){
                        var str = '<div style="text-align: center;font-size: large;color: red">!{giftName}>></div>'.render({giftName : gift.name});
                        var $instance = $(str);
                        $instance.on('click', function () {
                            gameDialog.win(gift.giftType, gift.extra);
                        })
                        layer.open({
                            type     : 1,
                            className: 'lottery share trade-task',
                            title    : '我的奖品',
                            content  : $instance,
                            btn      : ['关闭']
                        });
                    }
                }
            })
        }
    };
    window['gameDialog'] = window['GameDialog'] = new GameDialog();
})(Zepto, document, window, layer);