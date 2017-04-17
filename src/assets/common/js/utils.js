(function ($) {
    var utils = $.utils;
    if (!utils) {
        $.utils = {};
    }
    $.extend($.utils, {
        parseInt: function (str) {
            if (!str)
                return 0;
            if (typeof (str) != "string") {
                return 0;
            }
            if (str == "")
                return 0;
            var newStr = "1" + str;
            try {
                var i = parseInt(newStr);
                return i - Math.pow(10, str.length);
            }
            catch (err) {
                return 0;
            }
        },
        date2String: function (date, ignoreTime) {
            if (!date || !date.getFullYear)
                return "";
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            if(ignoreTime){
            	return year + "-" + month + "-" + day;
            }
            var h = date.getHours();
            var m = date.getMinutes();
            var s = date.getSeconds();
            if (h < 10) {
                h = "0" + h;
            }
            if (m < 10) {
                m = "0" + m;
            }
            if (s < 10) {
                s = "0" + m;
            }
            return year + "-" + month + "-" + day + " " + h + ":" + m + ":" + s;
        },
        string2Date: function (str) {
            if(!str){
                return null;
            }
            var me = this;
            str = str.replace("T", " ");
            var arr = str.split(' ');
            var date = new Date();
            if (arr.length > 0) {
                var arr1 = arr[0].split('-');
                if (arr1.length == 3) {
                	var year = me.parseInt(arr1[0]);
                	var month = me.parseInt(arr1[1]) - 1;
                	var day = me.parseInt(arr1[2]);
                    date = new Date(year,month,day);
                }
            }
            if (arr.length > 1) {
                var arr2 = arr[1].split(":");
                if (arr2.length >= 2) {
                    date.setHours(me.parseInt(arr2[0]));
                    date.setMinutes(me.parseInt(arr2[1]));
                }
                if (arr2.length == 3) {
                    var arr3 = arr2[2].split(".");
                    if (arr3.length >= 1) {
                        date.setSeconds(me.parseInt(arr3[0]));
                    }
                    if (arr3.length == 2) {
                        date.setMilliseconds(me.parseInt(arr3[1]));
                    }
                }
            }
            return date;
        },
        getFirendlyTimeString: function (timeString) {
            if (!timeString)
                return "";
            
            var nowTime = new Date().getTime();
            var date = timeString;
            if(typeof timeString == "string"){
            	date = this.string2Date(timeString);
            }
            var time = date.getTime();
            var diff = Math.abs(nowTime - time);
            var m = 60 * 1000;
            var h = m * 60;
            if (diff < m) {
                return "刚刚";
            }
            if (diff > m && diff < h) {
                return parseInt((diff / m)) + "分钟前";
            }
            if (diff >= h && diff < 5 * h) {
                return parseInt((diff / h)) + "小时前";
            }
            var hour = date.getHours();
            if (hour < 10) {
                hour = "0" + hour;
            }
            var minute = date.getMinutes();
            if (minute < 10) {
                minute = "0" + minute;
            }
            var hm = hour + ":" + minute;
            var nowDate = new Date(nowTime);
            var i = nowDate.getDate();
            var j = date.getDate();
            if (diff >= 5 * h && diff < 72 * h) {
                if (i - j == 0) {
                    return "今天" + hm;
                }
                if (i - j == 1) {
                    return "昨天" + hm;
                }
                if (i - j == 2) {
                    return "前天" + hm;
                }
            }
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            return year + "-" + month + "-" + j + " " + hm;
        },
        getFirendlyDateString: function (timeString) {
            if (!timeString)
                return "";
            var nowDate = new Date();
            nowDate.setHours(0);
            nowDate.setMinutes(0);
            nowDate.setSeconds(0);
            nowDate.setMilliseconds(0);
            var date = timeString;
            if(typeof timeString == "string"){
            	date = this.string2Date(timeString);
            }
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);

            var nowTime = nowDate.getTime();
            var time = date.getTime();
            var diff = Math.abs(nowTime - time);

            var i = nowDate.getDate();
            var j = date.getDate();
            var m = 60 * 1000;
            var h = m * 60;
            if (diff < 72 * h) {
                if (i - j == 0) {
                    return "今天";
                }
                if (i - j == 1) {
                    return "昨天";
                }
                if (i - j == 2) {
                    return "前天";
                }
            }
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            return year + "-" + month + "-" + j;
        },
        formatString: function (src) {
            if (arguments.length == 0)
                return null;
            var args = Array.prototype.slice.call(arguments, 1);
            return src.replace(/\{(\d+)\}/g, function (m, i) {
                return args[i];
            });
        },
        getHeadImg: function (img) {
            if (!img) {
                return "/resources/styles/images/user-face.png";
            }
            if(img.indexOf("http") == 0){
            	return toHttps(img);
            }
            if(window.fileServerUrl){
            	return window.fileServerUrl + "/" + img;
            }
            return img;
        },
        showPic: function (url, arr) {
        	if (typeof (WeixinJSBridge) != "undefined" && WeixinJSBridge != null){
        		wx.previewImage({
    			    current: url, // 当前显示图片的http链接
    			    urls: arr // 需要预览的图片http链接列表
    			});
        		return;
        	}
        	if(url){
        		$("#picBrowser img").attr("src", toHttps(url));
        	}
            $("#picBrowser").show();
            $("#picBrowser div").css("line-height", $(window).height() + "px");
        },
        toHttps : function(url){
            var location = document.location.href;
            //当前页面是https时才处理
            if(location.toLocaleLowerCase().indexOf("https://") == 0){
                if(url && url.toLowerCase){
                    var s = url.toLowerCase();
                    if(s.indexOf("http://") == 0){
                        return "https://" + url.substr("http://".length);
                    }
                }
            }
            return url;
        },
        chooseImage: function (cb) {
        	if (typeof (WeixinJSBridge) != "undefined" && WeixinJSBridge != null){
        		wx.chooseImage({
        			count: 1, // 默认9
    			    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    			    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    			    success: function (res) {
    			        var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
    			        cb(localIds);
    			    }
    			});
        		
        	}
        },
        uploadImage: function (file, cb) {
        	if (typeof (WeixinJSBridge) != "undefined" && WeixinJSBridge != null){
        		wx.uploadImage({
		            localId: file, // 需要上传的图片的本地ID，由chooseImage接口获得
		            isShowProgressTips: 1, // 默认为1，显示进度提示
		            success: function (res) {
		                var serverId = res.serverId; // 返回图片的服务器端ID
		                if(cb){
		                	cb(serverId);
		                }
		            }
		        });
        		
        	}
        },
        serialize : function(c, obj, key) {
			obj = obj || {};
			var prefiex = "";
			if (key) {
				prefiex = key + ".";
			} else {
				key = "";
			}
			if ($.isArray(c)) {
				if (c.length) {
					// if (typeof (c[0]) == "object") {
					for ( var i in c) {
						$.utils.serialize(c[i], obj, key + "[" + i + "]");
					}
					return obj;
					// }
				}
			}
			if (typeof (c) == "object") {
				for ( var k in c) {
					$.utils.serialize(c[k], obj, prefiex + k);
				}
				return obj;
			}
			obj[key] = c;
			return obj;
		},
		toArray : function(obj) {
			var result = [];
			for ( var i in obj) {
				if (!obj[i].name) {
					obj[i].name = i;
				}
				result.push(obj[i]);
			}
			return result;
		}
    });
    if (!$.search) {
		$.search = {};
	}
	$.extend($.search, {
		search : function() {
			if (!window.queryModel)
				return;
			var conditions = queryModel.conditions;
			var orders = queryModel.orders;
			queryModel.conditions = $.utils.toArray(conditions);
			queryModel.orders = $.utils.toArray(orders);
			var data = $.utils.serialize(queryModel);
			queryModel.conditions = conditions;
			queryModel.orders = orders;
			$.doAjax({
				url : queryModel.url,
				data : data,
				success : function(rslt) {
					$(".list-view").append(rslt);
					$.search.bindPager();
				}
			});
		},
		setRowCount : function(rowCount) {
			if (window.queryModel){
				window.queryModel.totalRowCount = rowCount;
			}
		},
		bindPager : function() {
			if (!window.queryModel)
				return;
			$(".list-pager .more-btn").click(function(){
				$(this).parent().remove();
				queryModel.paging = true;
				var index = queryModel.pageIndex || 0;
				index ++;
				queryModel.pageIndex = index;
				$.search.search();
			});
		},
		order : function(item, value, dir) {
			if (!window.queryModel)
				return;
			if (!queryModel.orders) {
				queryModel.orders = {};
			}
			queryModel.orders.order_input = {
				field : value,
				direction : dir
			};
			queryModel.pageIndex = 0;
			queryModel.paging = false;
			$.search.search();
		}		
	});
})(window.jQuery || window.Zepto);
