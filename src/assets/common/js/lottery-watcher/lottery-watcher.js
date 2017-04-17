;(function ($, Watcher, GameDialog) {
    var html = '<script id="lottery-watcher" type="text/lottery-html">\n    <div class="lottery-watcher swiper-container">\n        <div class="swiper-wrapper">\n            <div class="swiper-slide game-fail">\n                <div class="panel">\n                    <div class="badge badge-game-fail"></div>\n                    <h3>挑战失败, 再玩一次</h3>\n\n                    <div class="actions">\n                        <button data-type="replay" class="btn btn-default">再玩一次</button>\n                        <a href="//shop${shopId}.m.taobao.com" class="btn btn-primary to-shopping">进店逛逛</a>\n                    </div>\n                </div>\n            </div>\n            <div class="swiper-slide game">\n                <div class="panel">\n                    <div class="badge badge-game"></div>\n                    <h3>获得抽奖机会: <span>X1</span></h3>\n\n                    <div class="actions">\n                        <button data-type="draw" data-draw-type="game" class="btn btn-primary">立即抽奖</button>\n                        <div class="split-group">\n                            <a href="//shop${shopId}.m.taobao.com" class="btn btn-default to-shopping">进店逛逛</a>\n                            <button data-type="replay" class="btn btn-default">再玩一次</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <div class="swiper-slide collect">\n                <div class="panel">\n                    <div class="badge badge-collect"></div>\n                    <h3>收藏宝贝获得抽奖机会</h3>\n\n                    <div class="actions">\n                        <button data-type="draw" data-draw-type="collect" class="btn btn-primary">立即抽奖</button>\n                        <button data-type="click:collect" class="btn btn-primary">收藏抽奖</button>\n                    </div>\n                </div>\n            </div>\n            <div class="swiper-slide shopping">\n                <div class="panel">\n                    <div class="badge badge-shopping"></div>\n                    <h3>加购物车获得抽奖机会</h3>\n\n                    <div class="actions">\n                        <button data-type="draw" data-draw-type="shopping" class="btn btn-primary">立即抽奖</button>\n                        <button data-type="click:shopping" class="btn btn-primary">加购抽奖</button>\n                    </div>\n                </div>\n            </div>\n        </div>\n\n        <div class="swiper-pagination"></div>\n        <div class="tips">滑动获得抽奖机会</div>\n\n        <!-- 宝贝列表 -->\n        <div class="goods-list">\n            <h1 class="title">\n                <a href="javascript:" data-type="close:goodsList" class="close">×</a>\n                ${title}\n            </h1>\n\n            <h3 class="sub-title">${subTitle}</h3>\n            <ul>\n                <li>\n                <a href="http://item.taobao.com/item.htm?id=${numIid}">\n                    <img data-src="${img}_270x270.jpg">\n                    <div class="title">\n                        ${title}\n                    </div>\n                </a>\n                    <button data-type="${task}"\n                            data-id="${id}"\n                            data-disabled="${disabled}"\n                            class="btn btn-primary">${taskBtn}\n                    </button>\n                </li>\n            </ul>\n        </div>\n    </div>\n\n\n\n\n\n\n\n\n\n\n\n\n\n</script>'
    $('body').append(html)

    /**
     * @param options object
     * @param options.gameParams 以下游戏参数必须
     * @param [options.gameParams.participantId]
     * @param options.gameParams.shopId
     * @param options.gameParams.sellerId
     * @param options.gameParams.activityId
     * @param options.gameParams.bizType
     * @param [options.gameParams.collectItems]
     * @param [options.gameParams.shoppingCartItems]
     *
     * @event on click:task(type) 点击了某任务
     * @event on click:replay 再玩一次
     * @event on click:draw 抽奖
     *
     * @event emit add:draw(type, [time=1]) 增加抽奖次数, type:任务类型, time:次数
     * @event emit show:draw(type, [time=1]) 显示抽奖界面, type:任务类型, time:次数
     * @event emit reduce:draw(type, [time=1]) 扣除抽奖次数, type:任务类型, time:次数
     * @event emit show:win 游戏成功
     * @event emit show:fail 游戏失败
     * @event emit show:task(type) 弹出某任务
     * @event emit do:task(type) 做了某任务
     * @event emit done:task(type, items) 完成某个任务  type:任务类型, items:[{numIid: xxxx}]
     *
     * @example
     * new LotteryWatcher({
                gameParams : gameParams
       })
     *
     * @constructor
     */
    var LotteryWatcher = function (options) {
        Watcher.call(this)

        this.gameParams = options.gameParams
        this.options    = options
        this.tasks      = {
            shopping: {
                todo: this.gameParams.shoppingCartItems || [],
                done: []
            },
            collect : {
                todo: this.gameParams.collectItems || [],
                done: []
            },
        }
        this.drawTotal  = {
            game    : {
                $draw : '获得抽奖机会: <span>X${num}</span>',
                $empty: '抽奖机会已用完',
                num   : 0
            },
            collect : {
                $draw  : '获得抽奖机会: <span>X${num}</span>',
                $empty : '抽奖机会已用完',
                $chance: '收藏宝贝获得抽奖机会',
                num    : 0
            },
            shopping: {
                $draw  : '获得抽奖机会: <span>X${num}</span>',
                $empty : '抽奖机会已用完',
                $chance: '加购物车获得抽奖机会',
                num    : 0
            }
        }
        this.taskConfig = {
            collect : {
                title      : '收藏宝贝',
                subTitle   : '',
                taskBtn    : '收藏宝贝',
                taskBtnDone: '已收藏',
            },
            shopping: {
                title      : '加入购物车',
                subTitle   : '',
                taskBtn    : '加入购物车',
                taskBtnDone: '已加购'
            }
        }

        this.init()
    }

    LotteryWatcher.prototype = Object.create(Watcher.prototype)
    Object.assign(LotteryWatcher.prototype, {
        construct: LotteryWatcher,

        init: function () {
            var that = this

            that.gameParamsCheck()

            that.on('show:win', function () {
                that.show('game')
            })

            that.on('show:fail', function () {
                that.show('game-fail')
            })

            that.on('show:task', function (type) {
                that.showTask(type)
            })

            that.on('add:draw', function (type, time) {
                that.drawTotal[type].num += time || 1
                that.renderDraw()
            })
            that.on('show:draw', function (type, time) {
                that.drawTotal[type].num = time || 0
                that.renderDraw()
            })

            that.on('reduce:draw', function (type, time) {
                that.drawTotal[type].num -= time || 1
                that.renderDraw()
            })

            that.on('done:task', function (type, items) {
                items.forEach(function (item) {
                    if (that.$goodsListInstance) {
                        var $item = that.$goodsListInstance.find('[data-id="' + item.numIid + '"]')

                        // 同步UI
                        $item.data('disabled', true)
                        $item.text(that.taskConfig[type].taskBtnDone)
                        $item[0].item._isDone = true
                    }

                    // 保存已完成
                    var isExist = that.tasks[type].done.some(function (aItem) {
                        return aItem.numIid === item.numIid
                    })

                    if (!isExist) that.tasks[type].done.push(item)
                })

                that.renderDraw()
            })

            that.initGameLogic()
        },

        initGameLogic: function () {
            var that       = this
            var gameParams = this.gameParams

            window.collectedItemsNum = 0;
            window.cartAddedItems    = 0;

            that
                .on('click:task', function (type) {
                    var map = {
                        shopping: 'cartItems',
                        collect : 'favorItems'
                    }

                    if (that.tasks[type].done.length <= 0) {
                        $[map[type]]({
                                sellerId     : gameParams.sellerId,
                                bizActivityId: gameParams.activityId,
                                bizType      : gameParams.bizType
                            },
                            function (data) {
                                that.emit('done:task', type, data || []);
                            });
                    }
                    that.emit('show:task', type);
                })
                .on('do:task', function (type, item) {
                    var options = {
                        sellerId     : gameParams.sellerId,
                        itemId       : item.numIid,
                        bizType      : gameParams.bizType,
                        bizActivityId: gameParams.activityId,
                        title        : item.title,
                        price        : item.price,
                        picUrl       : item.picUrl,
                    }

                    if (type == 'collect') {
                        $.tida.itemFavor(options, function (rst) {
                            if (rst.success) {
                                that.emit('done:task', type, [{numIid: item.numIid}]);
                                window.collectedItemsNum++;
                                if (window.collectedItemsNum == gameParams.collectItemNum) {
                                    window.collectedItemsNum = 0;
                                    that.emit('add:draw', type, gameParams.collectItemLotteryCount);
                                    $.toast("收藏宝贝又增加了" + gameParams.collectItemLotteryCount + "次抽奖机会");
                                } else {
                                    var remain = gameParams.collectItemNum - window.collectedItemsNum;
                                    $.toast("再收藏" + remain + "个宝贝就可以再增加" + gameParams.collectItemLotteryCount + "抽奖机会");
                                }
                            }
                        });
                    } else if (type == 'shopping') {
                        $.tida.cart(options, function (rst) {
                            if (rst.success) {
                                that.emit('done:task', type, [{numIid: item.numIid}]);
                                window.cartAddedItems++;
                                if (window.cartAddedItems == gameParams.shoppingCartItemNum) {
                                    window.cartAddedItems = 0;
                                    that.emit('add:draw', type, gameParams.shoppingCartItemLotteryCount);
                                    $.toast("加购物车又增加了" + gameParams.shoppingCartItemLotteryCount + "次抽奖机会");
                                } else {
                                    var remain = gameParams.shoppingCartItemNum - window.cartAddedItems;
                                    $.toast("再加购物车" + remain + "个宝贝就可以再增加" + gameParams.shoppingCartItemLotteryCount + "次抽奖机会");
                                }
                            }
                        });
                    }
                })
                .on('click:draw', function (drawType) {
                    $.grant({
                        sellerId     : gameParams.sellerId,
                        activityId   : gameParams.activityId,
                        participantId: gameParams.participantId
                    }, function (data) {
                        if (data && data.data) {
                            var _data = data.data;
                            if (_data.resultType == 'SUCCESS') {
                                GameDialog.win(data.data.giftType, _data.content, null, null, null, true);
                            } else if (_data.resultType == 'BAD') {
                                GameDialog.lose(null, null, null, true);
                            }
                            that.emit('reduce:draw', drawType, 1);
                        }
                    })
                })
        },

        gameParamsCheck: function () {
            var gameParams = this.gameParams;

            [
                'shopId',
                'sellerId',
                'activityId',
                'bizType',
            ].forEach(function (item) {
                if (!(item in gameParams)) throw new Error('缺少必要参数:gameParams.' + item)
            })
        },

        initEvent: function ($html) {
            var that = this

            var targetType = null

            $html
                .on('tap', function (event) {
                    if (that.sliderMove) return
                    targetType = $(event.target).data('type')

                    switch (targetType) {
                        case 'draw':
                            $(event.target)[0].disabled || that.emit('click:' + targetType, $(event.target).data('draw-type'))
                            break;
                        case 'replay':
                            that.emit('click:' + targetType)
                            that.hide()
                            break;

                        case 'click:collect':
                        case 'click:shopping':
                            that.emit('click:task', targetType.split(':')[1])
                            break;
                        default:
                        //
                    }
                })
                .on('touchend', function (e) {
                    // 防止穿透
                    if (!$(event.target).hasClass('to-shopping')) {
                        e.preventDefault()
                    }
                })
        },

        renderDraw: function () {
            var that = this

            if (that.$slide) {
                for (var p in that.drawTotal) {
                    if (!that.drawTotal.hasOwnProperty(p)) continue;
                    var item   = that.drawTotal[p]
                    var $slide = that.$slide.filter('.' + p)

                    if (item.num > 0) {
                        $slide.find('h3').html(item.$draw.render({num: item.num}))
                        $slide.find('.btn[data-type="draw"]').prop('disabled', false)
                    } else {
                        $slide.find('h3').html(item.$empty)
                        $slide.find('.btn[data-type="draw"]').prop('disabled', true)
                    }

                    // 检查已做任务情况
                    if (p === 'shopping' || p === 'collect') {
                        that.tasks[p].todo.forEach(function (item) {
                            item._isDone = item._isDone || that.tasks[p].done.some(function (addedItem) {
                                    return item.numIid === addedItem.numIid
                                })
                        })

                        var allDone = that.tasks[p].todo.every(function (item) {
                            return item._isDone
                        })

                        if (allDone) {
                            $slide.find('.btn[data-type="show:' + p + '"]').prop('disabled', true)
                        } else {
                            item.num > 0 || $slide.find('h3').html(item.$chance)
                            $slide.find('.btn[data-type="show:' + p + '"]').prop('disabled', false)
                        }
                    }
                }
            }
        },

        show: function (slideClass) {
            var that       = this
            var container  = $('script#lottery-watcher').html().render({shopId: that.gameParams.shopId})
            var $container = this.$container = $(container)
            $container.css("z-index", $.getNextZIndex());
            var $wrapper = $container.find('.swiper-wrapper')
            var $slide   = this.$slide = $wrapper.find('.swiper-slide').remove()
            var $goodsList = this.$goodsList = $container.find('.goods-list').remove()
            var $goodsListItem = this.$goodsListItem = $goodsList.find('li').remove()

            for (var p in that.tasks) {
                if (!that.tasks.hasOwnProperty(p)) continue;

                that.tasks[p].todo.length && $slide.filter('.' + p).prependTo($wrapper)
            }
            $slide.filter('.' + slideClass).prependTo($wrapper)

            if ($container.find('.swiper-slide').length < 2) {
                that.hideTips()
            }

            that.renderDraw()
            that.initEvent($container)
            $('body').append($container)

            var swiperOptions = {
                pagination         : '.swiper-pagination',
                width              : hotcss.rem2px(21.034666666666666, document.documentElement.offsetWidth),
                effect             : 'coverflow',
                centeredSlides     : true,
                slideToClickedSlide: true,
                paginationClickable: true,
                slidesPerView      : 2,
            }

            // android 下关闭3d特效
            if (navigator.userAgent.toLowerCase().match(/Android/i) == "android") {
                delete swiperOptions.effect
                swiperOptions.spaceBetween = 30
            }

            that.swiper = new Swiper('.lottery-watcher', swiperOptions)

            that.swiper.on('sliderMove', function () {
                that.sliderMove = true
            })
            that.swiper.on('onTransitionEnd', function () {
                that.sliderMove = false
            })
        },

        showTips: function () {
            if (this.$container.find('.swiper-slide').length > 1) {
                this.$container.find('.swiper-pagination, .tips').show()
            }
        },

        hideTips: function () {
            this.$container.find('.swiper-pagination, .tips').hide()
        },

        hide: function () {
            this.$container.remove()
        },

        showTask: function (type) {
            var that = this

            var html  = that.$goodsList[0].outerHTML.render({
                title   : that.taskConfig[type].title,
                subTitle: that.taskConfig[type].subTitle
            })
            var $html = that.$goodsListInstance = $(html)

            that.tasks[type].todo.forEach(function (item) {
                var $item = $(that.$goodsListItem[0].outerHTML.render({
                    id      : item.numIid,
                    numIid  : item.numIid,
                    img     : item.picUrl,
                    title   : item.title,
                    task    : type,
                    disabled: item._isDone,
                    taskBtn : item._isDone ? that.taskConfig[type].taskBtnDone : that.taskConfig[type].taskBtn,
                }))

                $item.find('img').attr('src', $item.find('img').data('src'))
                $item.find('.btn')[0].item = item
                $html.find('ul').append($item)
            })

            $html
                .on('touchstart', function (event) {
                    var targetType = $(event.target).data('type')
                    switch (targetType) {
                        case 'collect':
                        case 'shopping':
                            if ($(event.target).data('disabled') === false) {
                                that.emit('do:task', targetType, $(event.target)[0].item)
                            }
                            break;

                        case 'close:goodsList':
                            that.hideTask()
                            break;

                        default:
                        //
                    }
                })

            $('body').append($html)
            that.hideTips()
            that.swiper.lockSwipes()
        },

        hideTask: function () {
            this.$goodsListInstance.remove()
            this.showTips()
            this.swiper.unlockSwipes()
        }
    })

    window.LotteryWatcher = LotteryWatcher
})($, Watcher, GameDialog)