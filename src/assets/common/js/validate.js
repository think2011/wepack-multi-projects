(function($) {
	$.extend($.fn, {
		valid : function(options) {
			elements = this;
			if(this.is("form")){
				elements = this.find("input[data-val='true'], select[data-val='true'], textarea[data-val='true']");
			}
			var isValid = true;
			var prefix = "data-val-";
			var validator = new $.validator(options,this[0]);
			validator.settings.rules = validator.settings.rules || {};
			validator.settings.messages = validator.settings.messages || {};
			$.each(elements,function(){
				var element = $(this);
				for(var i = 0; i < $.validator.adapters.length; i ++){
					var adapter = $.validator.adapters[i];
					var attribute = prefix + adapter.name;
					var message = element.attr(attribute);
					if(message){
						var rules = validator.settings.rules;
						var messages = validator.settings.messages;
						rules = rules[this.name] = rules[this.name] || {};
						messages = messages[this.name] = messages[this.name] || {};
						messages[adapter.name] = message;
						var params = {};
						if(adapter.params){
							for(var p in adapter.params){
								var pName = adapter.params[p];
								var pValue = element.attr(attribute + "-" + pName);
								if(pValue){
									params[pName] = pValue;
								}
							}
						}
						rules[adapter.name] = params;
					}
				}
			});
			var validHandler = validator.settings.validHandler;
			var invalidHandler = validator.settings.invalidHandler;
			var pendingHandler = validator.settings.pendingHandler;
			var result = true;
			validator.mainThreadProcessing = true;
			$.each(elements,function(){
				var element = this;
				var elementName = this.name;
				var rules = validator.settings.rules[elementName];
				var messages = validator.settings.messages[elementName];
				if(!rules) return;
				var value = validator.elementValue(element);
				//把remote放到最后一个验证
				var methods = [];
				for(var methodName in rules){
					if(methodName != "remote"){
						methods.push(methodName);
					}
				}
				for(var methodName in rules){
					if(methodName == "remote"){
						methods.push(methodName);
					}
				}
				for(var i in methods){
					var methodName = methods[i];
					var rule = rules[methodName];
					var method = $.validator.methods[methodName];
					if(method){
						var isValid = method.call(validator, value,element, rule);
						if(!isValid){
							var message = messages[methodName];
							validator.errors.push({
								message:message,
								element:element
							});
							result = false;
							invalidHandler.call(validator,message, element);
							break;
						}
						else if(isValid == "pending"){
							pendingHandler.call(validator, rule.pendingMessage, element);
							break;
						}
						else{
							validHandler.call(validator, element);
						}
					}
				}
			});
			for(var elementName in validator.settings.rules){
				
			}
			validator.callHandlerIfSuccess();
			validator.mainThreadProcessing = false;
			return result;
		}
	});
	$.validator = function( options, form ) {
		this.settings = $.extend( true, {}, $.validator.defaults, options );
		if(form){
			var $form = $(form);
			if($form.is("form")){
				this.currentForm = $form;
			}
			else{
				this.currentForm = $(form.form);
			}
		}
		this.init();
	};
	$.extend($.validator,{
		methods : {
			required : function(value, element, param) {
				return $.trim(value).length > 0;
			},
			length : function(value, element, param) {
				var optional = this.optional(value);
				if(optional) return true;
				
				var length = $.isArray( value ) ? value.length : this.getLength($.trim(value), element);
				var min,max;
				if(param.min){
					min = parseInt(param.min);
				}
				if(param.max){
					max = parseInt(param.max);
				}
				var valid = true;
				if(min != undefined && length < min){
					valid = false;
				}
				else if(max != undefined && length > max){
					valid = false;
				}
				return valid;
			},
			equalTo: function(value, element, param) {
				if(!param || typeof (param) != "string"){
					return;
				}
				var comparedTo = this.elementValue(param);
				return value == comparedTo;
			},
			number: function(value, element , param) {
				return this.optional(value) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
			},
			digits: function( value, element ) {
				return this.optional(value) || /^-?\d+$/.test(value);
			},
			range: function( value, element, param ) {
				var optional = this.optional(value);
				if(optional) return true;
	        	value = parseFloat(value);
	    		var min,max;
				if(param.min){
					min = parseFloat(param.min);
				}
				if(param.max){
					max = parseFloat(param.max);
				}
				var valid = true;
				if(min != undefined && value < min){
					valid = false;
				}
				else if(max != undefined && value > max){
					valid = false;
				}
				return valid;
			},
			email:function(value, element, param){
				var match;
		        if (this.optional(value)) {
		            return true;
		        }
		        match = new RegExp(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/).exec(value);
		        return (match && (match.index === 0) && (match[0].length === value.length));
			},
			regex:function(value, element, param){
				var match;
		        if (this.optional(value)) {
		            return true;
		        }
		        match = new RegExp(param.pattern).exec(value);
		        return (match && (match.index === 0) && (match[0].length === value.length));
			},
			remote:function(value, element, param){
				var optional = this.optional(value);
				if(optional) return true;
				var previous = this.previousValue(element);
				if ( previous.old === value ) {
					return previous.valid;
				}
				previous.old = value;
				param = typeof param === "string" && {url:param} || param;
				var validator = this;
				this.startRequest(element);
				var data = {};
				data[element.name] = value;				
				$.ajax($.extend(true, {
					url: param,
					mode: "abort",
					port: "validate" + element.name,
					dataType: "json",
					data: data,
					success: function( response ) {
						var valid = response === true || response === "true";
						var validHandler = validator.settings.validHandler;
						var invalidHandler = validator.settings.invalidHandler;
						var messages = validator.settings.messages[element.name];
						if(!valid){
							var message = messages["remote"];
							validator.errors.push({
								message:message,
								element:element
							});
							invalidHandler.call(validator,message, element);
						}
						else{
							validHandler.call(validator, element);
						}
						previous.valid = valid;
						validator.stopRequest(element, valid);
					}
				}, param));
				return "pending";
			}
		},		
		defaults: {
			messages: {},
			rules: {},
			validHandler:function(element){
				var label = this.getDefaultLabel(element);
				if(!label) return;
				label.text("");
				label.hide();
				var $element = $(element);
				var parent = $element.parents(".form-group");
                if (!parent.length) {
                    parent = $element;
                }
                parent.removeClass("input-box-error");
			},
			invalidHandler:function(message, element){
				var label = this.getDefaultLabel(element);
				if(!label) return;
				label.text(message);
				label.show();
				var $element = $(element);
				var parent = $element.parents(".form-group");
                if (!parent.length) {
                    parent = $element;
                }
                parent.addClass("input-box-error");
			},
			pendingHandler:function(message, element){
				var label = this.getDefaultLabel(element);
				if(!label) return;
				label.text(message);
				label.show();
			}
		},
		adapters : [],
		prototype:{
			init:function(){
				this.pendingRequest = 0;
				this.pending = [];
				this.errors = [];
			},
			optional:function(val){
				return $.trim(val).length == 0;
			},
			elementValue: function( element ) {
				var type = $(element).attr("type"),
					val = $(element).val();

				if ( type === "radio" || type === "checkbox" ) {
					return $("input[name='" + $(element).attr("name") + "']:checked").val();
				}

				if ( typeof val === "string" ) {
					return val.replace(/\r/g, "");
				}
				return val;
			},
			getLength: function( value, element ) {
				return value.length;
			},
			getDefaultLabel:function(element){
				var $element = $(element);
				var id = $element.attr("id");
				var label = $("#label-invalid-msg-" + id);
				if(!label.length){
					label = $('<label for="' + id + '" id="label-invalid-msg-' + id + '"></label>');
					var container = $(".error-message");
					if(!container.length){
						container = $('<div class="error-message"></div>');
						this.currentForm.append(container);
					}
					container.append(label);
				}
				return label;
			},
			startRequest: function( element ) {
				if ( !this.pending[element.name] ) {
					this.pendingRequest++;
					this.pending[element.name] = true;
				}
			},

			stopRequest: function( element, valid ) {
				this.pendingRequest--;
				// sometimes synchronization fails, make sure pendingRequest is never < 0
				if ( this.pendingRequest < 0 ) {
					this.pendingRequest = 0;
				}
				delete this.pending[element.name];
				if(!this.mainThreadProcessing){
					this.callHandlerIfSuccess();
				}
			},
			previousValue: function( element ) {
				return element.previousValue || (element.previousValue = {old: null,valid: false});
			},
			callHandlerIfSuccess:function(){
				if(!this.handlerCalled && this.pendingRequest == 0 && this.errors.length == 0){
					var handler = this.settings.successHandler;
					 if(handler){
						 handler();
					 }
					 this.handlerCalled = true;
				}
			}
		}
	});
	$.extend($.validator.adapters,{
		add:function(adapterName, params){
			this.push({name: adapterName, params: params});
		}
	});
	var adapters = $.validator.adapters;
	adapters.add("required");
	adapters.add("number");
	adapters.add("digits");
	adapters.add("email");
	adapters.add("length",["min","max"]);
	adapters.add("range",["min","max"]);
	adapters.add("regex",["pattern"]);
	$(function() {
		// $jQval.unobtrusive.parse(document);
	});
}(window.jQuery || window.Zepto));