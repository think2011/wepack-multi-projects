;(function ($, resLoader) {
    function GameLoader() {

    }

    GameLoader.prototype = {
        load: function (resources, afterLoadSuccess) {
            var cover = $('<div id="loading-cover" class="game ub-f1" style="position: absolute;height:100%;width:100%;top:0;left: 0;z-index: 9999;">' +
                '<div class="scene-loading"><div class="loading"><div class="spinner">' +
                '<div class="double-bounce1"></div><div class="double-bounce2"></div></div><p>加载中（<span id="loadingNum" class="loadingNum">0</span>%）</p></div><div class="slogan">趣互动</div></div></div>');
            $(document.body).append(cover);

            var _percent       = 0;
            var currentPercent = 0;
            var countInterval  = null;
            var completed      = false;

            var isFunc = function (f) {
                return typeof f === 'function';
            };

            function countPercent() {
                if (countInterval == null) {
                    countInterval = setInterval(function () {
                        if (_percent < currentPercent) {
                            _percent += 2;
                            if (_percent > 100)
                                _percent = 100;
                            $("#loadingNum").text(_percent.toFixed(0));
                        }
                        if (_percent >= 100) {
                            clearInterval(countInterval);
                            setTimeout(function () {
                                $('#loading-cover').remove();
                                if (isFunc(afterLoadSuccess)) {
                                    afterLoadSuccess();
                                }
                            }, 1000);
                        }
                    }, 15);
                }
            }

            var loader = new resLoader({
                resources : resources,
                onProgress: function (current, total) {
                    currentPercent = (current / total * 100).toFixed(0);
                },
                onComplete: function (total) {
                    completed = true;
                }
            });
            countPercent();
            loader.start();
        }
    };
    window.GameLoader    = new GameLoader();
})(Zepto, resLoader);