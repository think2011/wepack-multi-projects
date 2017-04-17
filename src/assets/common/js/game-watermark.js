;(function ($) {
    function GameWatermark() {
        this.remove = function () {
            $('#game-watermark').remove();
        };
        this.insert = function (target) {
            var wm = $('<div id="game-watermark"><img' +
                ' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG8AAAAiCAMAAABm3XfgAAAAk1BMVEUAAAD///////////////////////////////////8iqef/////////////6CY6sNH/////////6Cb/6Cb/////6Cb/6Cb/9p//6jX/6Cb/6Cb/6Cb/6Cb/6Cb/6Cb/6Cb/6Cb/+9v/6Cb/9JP/9qgrrN//////6Cbw5DPS207/8G7/6TT//OT/97X/7Ej//vHh30CbsNO+AAAAJnRSTlMAv++A30BgnxAgGs9wj79UUDAQ76+PgPrfz2Agn3BQQDC/r4BQNkIkiEoAAAIvSURBVEjHzZYNU6MwEIbDN8jHQVus592p97V4VU///68zWbqbgJkJGdDxnWkIyds+7C5JKrRASmwtkHJMgU3k8NEn5WGPWtLH8mzcdfUDlpNXoC3M34GX0GBgWDN4fjr9H4ah6e+cLFOufNp5CRwfBlJztwmP1AVK5YT3U4Wmdb0wn24e31YAEbv+UHCkfhOeajE+STrIxJJpd4UQa4Qwkz9PfXLZhGzqhzfa7/x5U5duA4CqBTiQ7xtTXu65+30znipdXEsm+X4Q49/FFwbuhVZIAJQ3r5NNCFCQ7yvjhNDAm9kPrXg/8Xlj9hg4A3jJ8y3aV/Aydcm4fIxDXdxTAUk12X151KZqtCXL7YD6O4u34ftA2dMVPNycE0d8/bR8XRVI1VaeBth5IpaXaGn9Ejw5RIRVdPNQFl7Jxsb6ft7SNIIOIxZyfx4E42jhXn+6fNH5hEx88oliXsXb556BhDOXQ4ic87VaygsZh4OlmdBL+/45qgMlirNeyJtkVbJSSijtMDP95rmKjuYaO0t5Zd3merBW8VZs3c2Bx5znsrF851UbLuTlxiCWI8OEMvCXSXt4MlZ3TJsDv6CBkzcdxKds8bta1/rMPT3GglVMlwEkIzf24mXjC5QKUzd90zRXp+PjZCIFXqslZpa2Nw8eujM+cU3F9PCWzfqAXS6jm+dWBPzw5moPIqWxG2OUhYW3VkGHPBaS6H843mzLi8WEFxbczTATW/OERbz15obpFZfyBEAYf9PtAAAAAElFTkSuQmCC"></div>');
            $(target).append(wm);
        }
    }

    window.GameWatermark = new GameWatermark();
})(Zepto);