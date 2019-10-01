(function() {
var options = {
	version: '0.5.50',//текущая версия приложения
	key: 'KJgj865Hfh7ftGt',//ключ для запроса на backend
	password: 'KJhgj8Hgfh8gffd4e',//пароля под ключ для запроса на backend
	site: 'http://www.calypsa.club/',
	share: {
		title: 'Поделиться',//Внутри кнопки, название кнопки
		message: 'Calypsa Club',
		subject: '',
		image: '',
		link: '',
	},
//Pushbots.com - BEGIN
	pushId: '5674bc31177959415f8b4569',
	pushGoogle: '499071410844',
//Pushbots.com - END
	listEmpty: {
		shares: 'Данный раздел пока пуст',
	}
};
var app = angular.module('app', ['ionic'],function($httpProvider) {
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

	$httpProvider.defaults.transformRequest = [function(data) {
		var param = function(obj) {
			var query = '',name, value, fullSubName, subValue, innerObj, i;

			for(name in obj) {
				value = obj[name];

				if(value instanceof Array) {
					for(i=0; i<value.length; ++i) {
						subValue = value[i];
						fullSubName = name + '[' + i + ']';
						innerObj = {};
						innerObj[fullSubName] = subValue;
						query += param(innerObj) + '&';
					}
				} else if(value instanceof Object) {
					for(subName in value) {
						subValue = value[subName];
						fullSubName = name + '[' + subName + ']';
						innerObj = {};
						innerObj[fullSubName] = subValue;
						query += param(innerObj) + '&';
					}
				} else if(value !== undefined && value !== null) {
					query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
				}
			}
			return query.length ? query.substr(0, query.length - 1) : query;
		};

		return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
	}];
});

app.run(function($ionicPlatform,$ionicPopup,$http,sessionService) {
	$ionicPlatform.ready(function() {
		//запрос на проверку версии
		var platform;
		if (ionic.Platform.isAndroid()) {
			platform = 'android';
		} else if(ionic.Platform.isIOS()) {
			platform = 'ios';
		} else {
			platform = 'android';//по умолчанию
		}
		
		if(typeof platform!='undefined' && platform!='') {
			var params = {
				'api_request': 1,
				'api_key': options.key,
				'api_password': options.password,
				'api_version': 2,
					'source': 'get_version',
					'action': platform,
				},
				url = options.site+"api/version/";
			
			$http.post(url, params)
				.success(function(response) {
					if(typeof response!='undefined') {
						if(typeof response.result!='undefined' && response.result>0 && response.version!='') {
							//проверяем версии
							var curr_version = options.version,
								new_version = response.version;
							
							if(curr_version<new_version) {
								
								var title = '<br/><br/>Обновите приложение.',buttons = [];
								if(response.link!='') {
									title = "<br/><br/>Произвести обновление?";
									
									if(typeof response.imm!='undefined' && response.imm>0) {
										buttons = [
											{
												text: 'Обновить',
													onTap: function(e) {
													window.open(response.link, "_system");
												}
											}
										];
									} else {
										buttons = [
											{ text: 'Не сейчас' },
											{
												text: 'Обновить',
													onTap: function(e) {
													window.open(response.link, "_system");
												}
											}
										];
									}
									
									
								}
								
								$ionicPopup.show({
									cssClass: 'check_update',
									title: 'Доступно обновление',
									subTitle: 'Для приложения доступно обновление '+response.version+'.'+title,
									buttons: buttons
								});
							}
						}
					}
				})
				.error(function(response) {
					
				});
		}
		
		ionic.Platform.setGrade('с');
		if(window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if(window.StatusBar) {
			StatusBar.styleDefault();
		}
		
		if(sessionService.get('option.push') == null || sessionService.get('option.push')>0) {
			if(typeof PushbotsPlugin != 'undefined') {
				var Pushbots = PushbotsPlugin.initialize(options.pushId, {"android":{"sender_id":options.pushGoogle}});
			}
		}
		
	});
});

app.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
	//if (ionic.Platform.isAndroid()) {
	if (!ionic.Platform.isIOS()) {
		$ionicConfigProvider.scrolling.jsScrolling(false);
	}
	$stateProvider
		.state('main', {
			url: '/',
			templateUrl: 'index.tpl',
			controller: 'indexCtrl'
		})
		.state('login', {
			url: '/login/',
			templateUrl: 'login.tpl',
			controller: 'authCtrl',
			cache: false,
		})
		.state('register', {
			url: '/register/',
			templateUrl: 'register.tpl',
			controller: 'authCtrl',
			cache: false,
		})
		.state('option', {
			url: '/option/',
			templateUrl: 'option.tpl',
			controller: 'authCtrl',
			cache: false,
		})
		.state('subscribe',{
			url: '/subscribe/',
			templateUrl: 'subscribe.tpl',
			controller: 'subscribeCtrl',
			cache: false,
		})
		.state('page', {
			url: '/pages/:id/',
			templateUrl: 'page.tpl',
			controller: 'pageCtrl'
		})
		.state('subscribe_me', {
			url: '/subscribe_me/',
			templateUrl: 'subscribe_me.tpl',
			controller: 'formCtrl'
		})
		.state('share', {
			url: '/promo/share/:id/',
			templateUrl: 'share.tpl',
			controller: 'promoShare'
		})
		.state('partner', {
			url: '/promo/partner/:id/',
			templateUrl: 'partner.tpl',
			controller: 'promoPartner'
		})
		.state('catalog', {
			url: '/promo/:cat/:id/',
			templateUrl: 'catalog.tpl',
			controller: 'promoCtrl',
			//cache: false,
		})
		.state('shares_all_sorttype', {
			url: '/promo/shares/sorttype/:sorttype/',
			templateUrl: 'shares.tpl',
			controller: 'promoCtrl',
			//cache: false,
		})
		.state('shares_all', {
			url: '/promo/shares/',
			templateUrl: 'shares.tpl',
			controller: 'promoCtrl',
			//cache: false,
		})
		.state('shares', {
			url: '/promo/:cat/:id/:type/',
			templateUrl: 'shares.tpl',
			controller: 'promoCtrl',
			//cache: false,
		})
		.state('promo_best_deals',{
			url: '/module/0018/best_deals/',
			templateUrl: 'shares.tpl',
			controller: 'moduleCtrl',
			//cache: false,
		})
		.state('promo_last_all',{
			url: '/module/0018/last_all/',
			templateUrl: 'shares.tpl',
			controller: 'moduleCtrl',
			//cache: false,
		})

        $urlRouterProvider.otherwise('/');
});

app.directive('leftMenu',function() {
return {
	restrict: 'A',
	template: "<ion-item ng-repeat='r in list' ng-show='(r.check == 1)?(session)?false:true:true'><a class='item {{r.class}}' ng-class=\"{current: checkLinkPath('{{r.link}}')}\"  menu-close='left' href='#/{{r.link}}' nav-direction='forward'><font>{{r.title}}</font></a></ion-item>",
	link: function(scope, el, attrs, ctrl) {
		
		scope.list = [
			{
				title: '',
				link: '',
				class:'index',
			},
			{
				title: 'Каталог',
				link: 'promo/cat/1/',
				class:'link catalog',
			},
			{
				title: 'Лучшие предложения',
				link: 'module/0018/best_deals/',
				class:'link best_deals',
			},
			{
				title: 'Акции',
				link: 'promo/shares/',
				class:'link shares',
			},
			{
				title: 'Контакты',
				link: 'pages/contacts/',
				class:'link contacts',
			},
			{
				title: 'О нас',
				link: 'pages/about_mobile/',
				class: 'link about',
			},
			{
				title: 'Рассылка',
				link: 'subscribe_me/',
				class: 'link subscribe',
				//show:(scope.is_logged)?'1':'0',
				check:'1',
			},
		];
	}
}
});
/*
app.directive('taogal',function() {
return {
	restrict: 'C',
	link: function(scope, el, attrs, ctrl) {
		el.on('click',function() {
			
		});
	}
}
});
*/
/*
Для ion-spinner чтобы крутился
if (ionic.Platform.platform() === 'windowsphone' || ionic.Platform.platform() === "windows") {
    override = 'android';
  }
  */
app.controller('body',function($scope,$rootScope,$location,$state,$stateParams,$location,$ionicModal,$ionicPopover,$ionicScrollDelegate,$timeout,$window,sessionService,$ionicPopup) {
	/*
	$scope.$on('$stateChangeStart', function () {
		$rootScope.pageTitle = false;
	});
	$scope.$on('$stateChangeSuccess', function () {
		
	});
	*/
	
	
	//$rootScope.pageTitle = false;
	
	$rootScope.session = false;
	$rootScope.session_avatar = false;
	$rootScope.session_check = false;
	$rootScope.$watch('session',function() {
		//console.log('Сессия изменилась');
	});
	$scope.logout = function() {
		sessionService.destroy($rootScope);
		$state.go('main');
	};
	//При каждой загрузке проверь сессию
	sessionService.checkSession($rootScope,$scope);
	
	$scope.openlink = function(link) {
		if(typeof link == 'undefined' || link == '') {return false;}
		$window.open(link, '_system', 'location=yes');
	};
	
	$scope.isItemShown = function() {
		return $rootScope.shownItem;
	};
	$scope.toggleItem = function() {
		if($scope.isItemShown()) {
			$rootScope.shownItem = false;
			//$ionicScrollDelegate.scrollTop();
		} else {
			$rootScope.shownItem = true;
		}
		$timeout(function () {
			$ionicScrollDelegate.resize();
		},10);
	};
	
	$scope.checkLinkPath = function(dest) {
		return (dest!='' && $location.path() == '/'+dest || dest=='' && $location.path()=='/')?true:false;
	};
	//Потянуть, чтобы обновить
	
	$scope.reloadPage = function(e) {
		
		//$ionicHistory.clearCache();
		//$ionicHistory.clearCache();
		//$ionicHistory.clearHistory();
		//$ionicHistory.clearCache().then(function(){ $state.go('/promo/cat/1/');});
			
		$scope.$broadcast('scroll.refreshComplete');
	};
	$scope.showMore = function(e) {
		$scope.$broadcast('scroll.infiniteScrollComplete');
	};
	
	$ionicModal.fromTemplateUrl('modal-image', {
		scope: $scope,
		animation: 'fade-in'
	}).then(function(modal) {
		$scope.modal_image = modal;
	});
	$scope.showImage = function(url) {
		$scope.imageSrc  = url
		$scope.modal_image.show();
	};
	$scope.closeImage = function() {
		$scope.modal_image.hide();
	};
	
	$scope.$on('$destroy', function() {
		$scope.modal_image.remove();
	});
	
	$scope.popupTopMenu = $ionicPopover.fromTemplateUrl('popup-top-menu', {
		scope: $scope
	}).then(function(popover) {
		$scope.popupTopMenu = popover;
	});
	
	$scope.showPopup = function(type,$event) {
		switch(type) {
			case 'topMenu':{
				$scope.popupTopMenu.show($event);
			break;}
		}
	};
	
	$scope.socialShare = function(title,second,cover,link) {
		title = (typeof title!='undefined' && title!='')?title:null;
		second = (typeof second!='undefined' && second!='')?second:null;
		cover = (typeof cover!='undefined' && cover!='')?cover:null;
		link = (typeof link!='undefined' && link!='')?options.site+link:null;
		
		if(typeof plugins!='undefined' && typeof plugins.socialsharing!='undefined') {
			window.plugins.socialsharing.share(title, null, cover, link);
		}
	}
});

app.factory('cachePage',function($cacheFactory) {return $cacheFactory('cachePage',{capacity: 5});});
app.factory('sessionService',function($http,$ionicPopup,$window) {
	//sessionStorage,localStorage
	var f = this;
	f.checkSession = function($rootScope) {
		
		var result = false,
			id = this.get('user.id'),
			login = this.get('user.login'),
			password = this.get('user.password'),
			uid_time = this.get('user.uid_time');
		
		if(typeof id!='undefined' && id!='' && id!=null && typeof login!='undefined' && login!='' && login!=null && typeof password !='undfined' && password!='' && password!=null && typeof uid_time !='undefined' && uid_time!='' && uid_time!=null) {
			$rootScope.session_check = true;
			var params = {
				'api_request': 1,
				'api_key': options.key,
				'api_password': options.password,
				'api_version': 2,
					'source': 'check_session',
					'login': login,
					'password': password,
					'id': id,
					'uid_time': uid_time,
				},
				url = options.site+"action/login.php";
			
			$http.post(url, params)
				.success(function(response) {
					$rootScope.session_check = false;
					if(response.result>0) {
						$rootScope.session = true;
						$rootScope.session_avatar = response.avatar;
					}
				})
				.error(function(response) {
					/*
					$ionicPopup.alert({
						cssClass: 'error',
						title: 'Ошибка',
						template: 'Нет подключения'
					});
					*/
				});
			
		} else {
			this.destroy($rootScope);
		}
	};
	
	/*localStorage.setItem("user",JSON.stringify({ }));*/
	
	f.set = function(key,value){return $window.localStorage.setItem(key,value);};
	f.get = function(key){return $window.localStorage.getItem(key);};
	f.destroy = function($rootScope){
		var id = this.get('user.id'),
			password = this.get('user.password');
		
		if(id!=null && password!=null) {
			$http.post(options.site+"action/login.php", {
				'api_request': 1,
				'api_key': options.key,
				'api_password': options.password,
					'source': 'destroy_session',
					'password': password,
					'id': id,
			});
		}
		$rootScope.session = false;
		$rootScope.session_avatar = false;
		localStorage.removeItem('user.id');
		localStorage.removeItem('user.login');
		localStorage.removeItem('user.password');
		localStorage.removeItem('user.uid_time');
		
		return true;
	};
	
	return f;
});
app.factory('post',function(cachePage,$http,$ionicLoading,$ionicPopup,$timeout,$q) {
	return {
		get: function($scope,url,params,cache,loading) {
			/*
				cache - использовать ли кэш
			*/
			cache = (typeof cache == 'undefined' || cache ==  true)?true:false;
			loading = (typeof loading == 'undefined' || loading ==  true)?true:false;
			
			var safe_url = url;
			if(typeof params['page']!='undefined' && params['page']>1) {
				safe_url = safe_url + "&page=" + params['page'];
			}
			
			var resp = cachePage.get(safe_url);
			if(resp && cache == true) {
				//console.log("Из кэша чтение: "+safe_url+" => "+resp.list.length);
				var f = {};
				f.then = function(r) {
					return r(resp);
				};
				$scope.dataLoaded = true;
				return f;
			} else {
			
			if(loading) {
				$ionicLoading.show({
					content: 'Loading',
					noBackdrop: true,
					//template: '<ion-spinner icon="ripple" class="spinner-calm"></ion-spinner>'
					//template: '<ion-spinner icon="ripple"></ion-spinner>'
					template: '<ion-spinner icon="ios"></ion-spinner>'
				});
			}
			
			var defer = $q.defer();
			
			$http.post(url, params)
				.success(function(response) {
					
					$scope.dataLoaded = true;
					if(loading) {$ionicLoading.hide();}
					
					if(cache == true) {
						cachePage.put(safe_url,response);
					} else {
						
					}
					
					defer.resolve(response);
				})
				.error(function(response) {
					if(loading) {$ionicLoading.hide();}
					$ionicPopup.alert({
						cssClass: 'error',
						title: 'Ошибка',
						template: 'Проблемы с соединением'
					});
					defer.reject(response);
				});
				
				return defer.promise;
			}
		}
	};
});

app.directive('bindHtmlCompile', ['$compile', function ($compile) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			scope.$watch(function () {
				return scope.$eval(attrs.bindHtmlCompile);
			}, function (value) {
				element.html(value);
				$compile(element.contents())(scope);
			});
		}
	};
}]);
	
app.directive('lazyScroll', ['$rootScope', function($rootScope) {
	return {
		restrict: 'A',
		link: function ($scope, $element) {
			var origEvent = $scope.$onScroll;
			$scope.$onScroll = function () {
				$rootScope.$broadcast('lazyScrollEvent');

				if(typeof origEvent === 'function'){
				  origEvent();
				}
			};
		}
	};
}]);
app.directive('checkHeight', ['$rootScope', function($rootScope) {
	return {
		restrict: 'A',
		link: function (scope, el, attr) {
			el.ready(function () {
				if(el[0].offsetHeight<=attr.height) {
					el[0].className = attr.class+" nomore";
				}
			});
		}
	};
}]);
app.directive('imageLoader',['$document','$timeout','$compile', function($document,$timeout,$compile) {
	return {
		restrict: 'A',
		link: function ($scope, $el, $attr) {
			//var loader = $compile('<div class="image-loader" style="width:'+$el[0].offsetWidth+'px;height:'+$el[0].offsetHeight+'px;"><ion-spinner class="spiral"></ion-spinner></div>')($scope);
			var loader = $compile('<div class="image-loader" style="width:'+$el[0].offsetWidth+'px;height:'+$el[0].offsetHeight+'px;"><ion-spinner class="spinner spinner-spiral" icon="spiral"></ion-spinner></div>')($scope);
			$el.append(loader);
			
			$attr.imageLazyDistanceFromBottomToLoad = 0;
			$attr.imageLazyDistanceFromRightToLoad = 0;
			
			function isVisible() {
				var clientHeight = $document[0].documentElement.clientHeight;
				var clientWidth = $document[0].documentElement.clientWidth;
				var imageRect = $el[0].getBoundingClientRect();
				return (imageRect.top >= 0 && imageRect.top <= clientHeight + parseInt($attr.imageLazyDistanceFromBottomToLoad))
					&& (imageRect.left >= 0 && imageRect.left <= clientWidth + parseInt($attr.imageLazyDistanceFromRightToLoad));
			}
			function loadImage() {
				var Img = new Image();
				Img.src = $attr.imageLoader;
				Img.onload = function () {
					if(loader) {loader.remove();}
					$el[0].style.backgroundImage = 'url(' + $attr.imageLoader + ')';
					$el[0].style.backgroundPosition = 'center center';
				};
			};
			
			var deregistration = $scope.$on('lazyScrollEvent', function () {
					if (isVisible()) {loadImage();deregistration();}
				}
			);
			$scope.$watch('imageLoader', function (oldV, newV) {
				var deregistration = $scope.$on('lazyScrollEvent', function () {
						if (isVisible()) {loadImage();deregistration();}
					}
				);
				$timeout(function () {
					if(isVisible()) {loadImage();deregistration();}
				}, 50);
			});
			$el.on('$destroy', function () {
				deregistration();
			});
			$timeout(function () {
				if (isVisible()) {loadImage();deregistration();}
			}, 50);
		}
	};
}]);

app.factory('timer',function() {
	var f = {};
	f.num_to_text = function(timeend) {
			
		today = Math.floor((timeend-Date.now())/1000);
		
		tsec = today%60; today=Math.floor(today/60); if(tsec<10)tsec='0'+tsec;
		tmin = today%60; today=Math.floor(today/60); //if(tmin<10)tmin='0'+tmin;
		thour = today%24; today=Math.floor(today/24);

		tday = (today>0)?today+" д.":"";
		thour = (thour>0)?" "+thour+" ч.":"";
		//tmin = " "+tmin+" м.";
		tmin = (tmin>0)?" "+tmin+" м.":"";
		//tsec = " "+tsec+" с.";
		tsec = (tsec>0)?" "+tsec+" с.":"";
		
		return tday+thour+tmin+tsec;
	};
	f.begin_timer = function(val) {
		if(val>0) {
			var text = this.num_to_text(val*1);
							
			var timeend = (val*1),
				nowtime = Date.now();
			
			if(nowtime>timeend) {
				return false;
			} else {
				setTimeout(function() {
					return f.begin_timer(val);
				},1000);
			}
		}
	};
	
	
	return f;
});

app.directive('timerExpire',['timer', function(timer) {
	return {
		restrict: 'A',
		link: function ($scope, $el, $attr) {
			var t = $attr.timerExpire,
				f = {};
			
			f.num_to_text = function(timeend) {
					
				today = Math.floor((timeend-Date.now())/1000);
				
				tsec = today%60; today=Math.floor(today/60); if(tsec<10)tsec='0'+tsec;
				tmin = today%60; today=Math.floor(today/60); //if(tmin<10)tmin='0'+tmin;
				thour = today%24; today=Math.floor(today/24);

				tday = (today>0)?today+" д.":"";
				thour = (thour>0)?" "+thour+" ч.":"";
				//tmin = " "+tmin+" м.";
				tmin = (tmin>0)?" "+tmin+" м.":"";
				tsec = " "+tsec+" с.";
				//tsec = (tsec>0)?" "+tsec+" с.":"";
				
				return tday+thour+tmin+tsec;
			};
			f.begin_timer = function(val,el) {
				if(val>0) {
					el[0].innerHTML = f.num_to_text(val*1);
					var timeend = (val*1),
						nowtime = Date.now();
					
					if(nowtime>timeend) {
						return false;
					} else {
						setTimeout(function() {
							return f.begin_timer(val,el);
						},1000);
					}
				}
			};
			
			if(t>0 && angular.isNumber(t*1)) {
				
				t = f.begin_timer(t,$el);
			} else {
				$el.append(t);
			}
			
		}
	};
}]);

app.controller('authCtrl',function($scope,$rootScope,$http,$state,$ionicLoading,$ionicPopup,sessionService) {
	$scope.data = {};
	
	if($rootScope.session && $state.current.name!='option') {
		$state.go('main');
		return false;
	}
	
	$scope.options = {
		'push': (sessionService.get('option.push') == null || sessionService.get('option.push')>0)?true:false,
	};
	
	$scope.changeOption = function(name) {
		switch(name) {
			case 'push':{
				if($scope.options.push) {
					sessionService.set('option.push','0');
					$scope.options.push = false;
					
					if(typeof PushbotsPlugin != 'undefined') {
						PushbotsPlugin.unregister();
					}
				} else {
					sessionService.set('option.push','1');
					$scope.options.push = true;
					
					if(typeof PushbotsPlugin != 'undefined') {
						PushbotsPlugin.initialize(options.pushId, {"android":{"sender_id":options.pushGoogle}});
					}
				}
			break;}
		}
	};
	
	$scope.login = function(data) {
		if(typeof data.login == 'undefined' || data.login == '' || data.password == '' || typeof data.password == 'undefined') {return false;}
		var params = {
			'api_request': 1,
			'api_key': options.key,
			'api_password': options.password,
			'api_version': 2,
				'source': 'login',
				'login': data.login,
				'password': data.password,
				'remember': 1,
			},
			url = options.site+"action/login.php";
			
		//$ionicLoading.show({content: 'Loading',noBackdrop: true,});
		$ionicLoading.show({
			content: 'Loading',
			noBackdrop: true,
			template: '<ion-spinner icon="ios"></ion-spinner>'
		});
		
		$http.post(url, params)
			.success(function(response) {
				$ionicLoading.hide();
				if(response.result>0) {
					
					sessionService.set('user.id',response.id);
					sessionService.set('user.login',response.login);
					sessionService.set('user.password',response.password);
					sessionService.set('user.uid_time',response.uid_time);
					
					$rootScope.session = true;
					$rootScope.session_avatar = response.avatar;
					$state.go('main');
				} else {
					$ionicPopup.alert({
						cssClass: 'info',
						title: 'Ошибка',
						template: response.text
					});
				}
				$scope.data.login = $scope.data.password = '';
			})
			.error(function(response) {
				$ionicLoading.hide();
				$ionicPopup.alert({
					cssClass: 'error',
					title: 'Ошибка',
					template: 'Нет подключения'
				});
				$scope.data.login = $scope.data.password = '';
			});
	};
	$scope.register = function(data) {
		if(typeof data.login == 'undefined' || data.login == '' || data.password == '' || typeof data.password == 'undefined' || data.password_repeat == '' || typeof data.password_repeat == 'undefined' || data.email == '' || typeof data.email == 'undefined') {return false;}
		if(data.password!=data.password_repeat) {
			$ionicPopup.alert({
				cssClass: 'info',
				title: 'Ошибка',
				template: 'Введёные пароли не совпадают',
			});
			return false;
		}
		
		var params = {
			'api_request': 1,
			'api_key': options.key,
			'api_password': options.password,
			'api_version': 2,
				'source': 'register',
				'login': data.login,
				'password': data.password,
				'mail': data.email,
				'subscribe': 1,
			},
			url = options.site+"action/login.php";
			
		//$ionicLoading.show({content: 'Loading',noBackdrop: true,});
		$ionicLoading.show({
			content: 'Loading',
			noBackdrop: true,
			template: '<ion-spinner icon="ios"></ion-spinner>'
		});
		
		$http.post(url, params)
			.success(function(response) {
				$ionicLoading.hide();
				if(response.result>0) {
					$ionicPopup.alert({
						cssClass: 'info',
						title: 'Регистрация',
						template: response.text
					});
					
					if(response.start>0) {
						
					}
					
					$scope.data.login = $scope.data.password = $scope.data.password_repeat = $scope.data.email = '';
				} else {
					$ionicPopup.alert({
						cssClass: 'info',
						title: 'Ошибка',
						template: response.message
					});
				}
			})
			.error(function(response) {
				$ionicLoading.hide();
				$ionicPopup.alert({
					cssClass: 'error',
					title: 'Ошибка',
					template: 'Нет подключения'
				});
				$scope.data.login = $scope.data.password = $scope.data.password_repeat = $scope.data.email = '';
			});
	};
	
});
app.controller('indexCtrl',function($scope,$rootScope,post) {
	$scope.response_list = [];
	
	var url = options.site+'api/promo/cat/1/';
	var params = {
		'api_key': options.key,
		'api_password': options.password,
		'api_version': 2,
		'per_page': $scope.per_page,
		'page': $scope.page,
	};
	post.get($scope,url,params).then(function(response) {
		$scope.response_list = response.list;
	});
	
});
app.controller('subscribeCtrl',function($scope,$rootScope,$http,$state,$ionicPopup,$ionicLoading,post,sessionService) {
	$scope.list = [];
	if(!$rootScope.session) {
		$state.go('main');
		return false;
	}
	var user_id = ($rootScope.session)?sessionService.get('user.id'):0;
	
	$scope.data = [];
	$scope.saveSubscribe = function(obj) {
		var form = angular.element(obj.target),
			input = form[0],
			post = {},
			promoCat = [],
			promoPartner = [],
			go = 0;
		
		if(typeof input == 'undefined' || input.length<=0) {
			return false;
		}
		
		for(var i=0;i<input.length;i++) {
			if(input[i].name == 'submit') {continue;}
			if(input[i].checked) {
				if(input[i].value==null || input[i].value == '') {continue;}
				go++;
				if(input[i].name == '0018_cat') {
					promoCat[i] = input[i].value;
				} else if(input[i].name == 'mod_0018_partner') {
					promoPartner[i] = input[i].value;
				} else {
					post[input[i].name] = input[i].value;
				}
			}
		}
		/*
		if(go<=1) {
			$ionicPopup.alert({
				cssClass: "info",
				title: 'Подписка',
				template: 'Необходимо выбрать на что подписаться'
			});
			return false;
		}
		*/
		
		if(promoCat.length>0) {post['0018_cat'] = angular.toJson(promoCat);}
		if(promoPartner.length>0) {post['mod_0018_partner'] = angular.toJson(promoPartner);}
		
		post['api_request'] = 1;
		post['api_key'] = options.key;
		post['api_password'] = options.password;
		post['api_version'] = 2;
		post['user_id'] = user_id;
		post['source'] = 'subscribe';
		post['action'] = 'add_email';
		
		
		$ionicLoading.show({content: 'Loading',noBackdrop: true,});
		
		$http.post(options.site+'action/subscribe.php', post)
			.success(function(response) {
				$ionicLoading.hide();
				$ionicPopup.alert({
					cssClass: "info",
					title: response.div.title,
					template: response.div.content,
				});
			})
			.error(function(response) {
				$ionicLoading.hide();
				$ionicPopup.alert({
					cssClass: "error",
					title: response.div.title,
					template: response.div.content,
				});
			});
	};
	$scope.changeCheckbox = function(type,o) {
		if(!o.target.checked) {return false;}
		
		if(type == 'mod_0018_partners_all') {
			var b = document.getElementsByName('mod_0018_partner');
			if(b.length) {
				for(var i=0;i<b.length;i++) {
					if(b[i].checked) {b[i].checked = false;}
				}
			}
		}
	};
	$scope.changeRadio = function(type) {
		if(type == 'mod_0018_partner') {
			var b = document.getElementById('mod_0018_partners_all');
			if(b.checked) {b.checked = false;}
		}
	};
	
	var params = {
		'api_request': 1,
		'api_key': options.key,
		'api_password': options.password,
		'api_version': 2,
			'user_id': user_id,
	};
	
	
	post.get($scope,options.site+'api/subscribe/',params,false).then(function(response) {
		if(response.result>0) {
			$scope.list = response.body;
		} else {
			
		}
		//$scope.r = response.list;
	});
});

app.controller('pageCtrl',function($scope,$stateParams,post) {
	var url = false;
	$scope.is_load = false;
	//Акции по категории
	if($stateParams.id) {
		url = options.site+'api/pages/'+$stateParams.id+'/';
	}
	$scope.r = [];
	var params = {
		'api_key': options.key,
		'api_password': options.password,
		'api_version': 2,//полный json объект без html элементов
	};
	
	$scope.canRefresh = true;
	$scope.isReloading = false;
	
	$scope.reloadPage = function() {
		$scope.isReloading = true;
		post.get($scope,url,params).then(function(response) {
			$scope.r = response.list;
			$scope.isReloading = false;
			$scope.canRefresh = false;
			$scope.is_load = true;
		});
		$scope.$broadcast('scroll.refreshComplete');
	};
	
	if(!url) {return false;}
	
	post.get($scope,url,params).then(function(response) {
		$scope.r = response.list;
		$scope.canRefresh = false;
			$scope.is_load = true;
	});

});
app.controller('formCtrl',function($scope,$stateParams,$ionicPopup,post) {

	$scope.submitForm = function(f) {
		if(typeof f.email == 'undefined' || f.email == '') {return false;}
		var url = options.site+'action/subscribe.php';
		var value = f.email;
		
		var params = {
			'api_key': options.key,
			'api_password': options.password,
			'api_version': 2,
				'api_request': 1,
				'source': 'subscribe',
				'action': 'add_mail',
				'mail': value,
				//'user_id': ($rootScope.session)?sessionService.get('user.id'):0,
		};
		post.get($scope,url,params,false).then(function(response) {
			f.email = '';
			if(response.result>0) {
				$ionicPopup.alert({
					cssClass: 'info',
					title: response.div.title,
					template: response.div.content
				});
			} else {
				$ionicPopup.alert({
					cssClass: 'error',
					title: response.div.title,
					template: response.div.content
				});
			}
		});
	};


});
app.controller('moduleCtrl',function($scope,$rootScope,$stateParams,$state,post) {
	var url = false;
	$scope.canRefresh = false;
	$scope.pageTitle = false;
	
	if($state.current.name == 'promo_best_deals') {
		$scope.pageTitle = 'Лучшие предложения';
		url = options.site+'api/tfl/module/0018/best_deals/';
	} else if($state.current.name == 'promo_last_all') {
		$scope.pageTitle = 'Новые акции';
		url = options.site+'api/tfl/module/0018/last_all/';
	}
	if(!url) {return false;}
	
	$scope.response_list = [];
	var params = {
		'api_key': options.key,
		'api_password': options.password,
		'api_version': 2,//полный json объект без html элементов
	};
	post.get($scope,url,params).then(function(response) {
		$scope.response_list = response.list;
	});

});
app.controller('promoCtrl',function($scope,$stateParams,$state,post) {
	var url = false,
		add  = '';
	$scope.pageTitle = false;
	$scope.response_list = [];
	$scope.is_load = false;
	//Все акции
	if($state.current.name == 'shares_all' || $state.current.name == 'shares_all_sorttype') {
		add = ($stateParams.sorttype)?"&sorttype="+$stateParams.sorttype:"/";
		url = options.site+'api/promo/shares'+add;
	} else
	//Акции по категории
	if($stateParams.cat == 'cat' && $stateParams.id && $stateParams.type) {
		url = options.site+'api/promo/cat/'+$stateParams.id+'/'+$stateParams.type+'/';
	} else
	//Список каталога
	if($stateParams.cat == 'cat' && $stateParams.id) {
		url = options.site+'api/promo/cat/'+$stateParams.id+'/';
	}
	$scope.page = 1;
	$scope.per_page = 8;
	$scope.canMore = false;
	$scope.canRefresh = true;
	$scope.isReloading = false;
	
	var params = {
		'api_key': options.key,
		'api_password': options.password,
		'api_version': 2,//полный json объект без html элементов
		'per_page': $scope.per_page,
		'page': $scope.page,
	};
	
	$scope.reloadPage = function() {
		$scope.isReloading = true;
		$scope.canMore = false;
		$scope.page = 1;
		params['page'] = $scope.page;
		$scope.response_list = [];
		post.get($scope,url,params,false,false).then(function(response) {
			$scope.isReloading = false;
			$scope.$broadcast('scroll.refreshComplete');
			$scope.$broadcast('items.list',response);
		});
	};
	$scope.showMore = function(e) {
		//$scope.page = ($scope.page+1);
		//params['page'] = $scope.page+1;
		params['page'] = $scope.page;
		post.get($scope,url,params,false,false).then(function(response) {
			//console.log("Запрос more: "+url+" => "+response.list.length);
			$scope.$broadcast('items.list',response);
		});
	};
	$scope.$on('items.list',function(_,response,check) {
		
		$scope.canMore = false;
		if(typeof response.list == 'object' && response.list.length>0) {
			
			response.list.forEach(function(row) {
				$scope.response_list.push(row);
			});
			if($state.current.name!='catalog') {
				if(typeof response.list != 'object' || response.list.length<$scope.per_page || response.list.length<=0) {
					$scope.canMore = false;
					$scope.page = 1;
				} else {
					$scope.canMore = true;
					$scope.page = ($scope.page+1);
				}
			}
		} else {
			$scope.canMore = false;
			$scope.page = 1;
		}
		$scope.$broadcast('scroll.infiniteScrollComplete');
	});
	
	if(!url) {return false;}
	
	post.get($scope,url,params).then(function(response) {
		
		if(typeof response.title!='undefined' && response.title!='') {
			$scope.pageTitle = response.title;
		}
		
		$scope.is_load = true;
		//console.log("Запрос: "+url+" => "+response.list.length);
		$scope.$broadcast('items.list',response);
		//$scope.response_list = response.list;
		if(typeof response.list != 'object' || response.list.length<$scope.per_page || response.list.length<=0) {
			$scope.canMore = false;
		} else {
			$scope.canMore = true;
		}
	});

});
app.controller('promoShare',function($scope,$rootScope,$stateParams,post) {
	var url = false;
	$rootScope.dataLoaded = false;
	$rootScope.shownItem = false;
	
	//Акции одна
	if($stateParams.id) {
		url = options.site+'api/promo/share/'+$stateParams.id+'/';
	}
	if(!url) {return false;}
	//$scope.showPager = true;
	//$scope.r = [];
	var params = {
		'api_key': options.key,
		'api_password': options.password,
		'api_version': 2,//полный json объект без html элементов
	};
	
	post.get($scope,url,params).then(function(response) {
		$scope.r = response.body;
	});

});
app.controller('promoPartner',function($scope,$rootScope,$stateParams,post,$ionicPopup,sessionService) {
	var url = false;
	$scope.dataLoaded = false;
	$rootScope.shownItem = false;
	//$scope.r = [];
	
	$scope.subscribeForPartner = false;
	
	$scope.subscribePartner = function(obj) {
		
		if($rootScope.session != true) {
			$ionicPopup.alert({
				cssClass: 'info',
				title: 'Ошибка',
				template: 'Вам необходимо авторизоваться',
			});
			return false;
		}
		
		var el = obj.target,
			newParams = {
				'api_request': 1,
				'api_key': options.key,
				'api_password' : options.password,
				'api_version': 2,
				'user_id': ($rootScope.session)?sessionService.get('user.id'):0,
					'source': 'mod_0018',
					'action': 'add_partner',
					'id': el.getAttribute('data-id'),
					'check': ($scope.subscribeForPartner)?"1":"0",
			};
		
		post.get($scope,options.site+'action/subscribe.php',newParams,false).then(function(response) {
			$ionicPopup.alert({
				cssClass: (response.result>0)?"info":"error",
				title: response.div.title,
				template: response.div.content
			});
			
			if($scope.subscribeForPartner) {
				$scope.subscribeForPartner = false;
			} else {
				$scope.subscribeForPartner = true;
			}
		});
	};
	
	//Один партнёр
	if($stateParams.id) {
		url = options.site+'api/promo/partner/'+$stateParams.id+'/';
	}
	
	if(!url) {return false;}
	
	var params = {
		'api_key': options.key,
		'api_password': options.password,
		'api_version': 2,//полный json объект без html элементов
	};
	
	post.get($scope,url,params).then(function(response) {
		$scope.r = response.body;
		
		if(typeof response.subscribe_partner!='undefined' && response.subscribe_partner>0) {
			$scope.subscribeForPartner = true;
		}
	});

});

app.filter('subString', function($sce) {
    return function(str, start, end) {
        if (str != undefined) {
            return str.substr(start, end);
        }
    }
})
app.directive('showMore', ['$compile','$sce', function($compile,$sce) {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            text: '=',
            limit:'='
        },

        template: '<div><p ng-show="largeText" >{{ text | subString :0 :end }}<button ng-click="showMore()" ng-show="isShowMore">Show More</button><button ng-click="showLess()" ng-hide="isShowMore">Show Less</button></p><p ng-hide="largeText">{{ text }}</p></div>',

        link: function(scope, iElement, iAttrs) {
			//iElement.ready(function () {
				scope.text = $sce.trustAsHtml(scope.text);
					
				scope.end = scope.limit;
				scope.isShowMore = true;
				scope.largeText = true;

				if (typeof scope.text!='undefined' && scope.text.length <= scope.limit) {
					scope.largeText = false;
				}

				scope.showMore = function() {
					scope.end = scope.text.length;
					scope.isShowMore = false;
				};

				scope.showLess = function() {
					scope.end = scope.limit;
					scope.isShowMore = true;
				};
			//});
			
        }
    };
}]);


app.directive('focus', function() {
return {
	restrict: 'A',
	link: function ($scope, selem, attrs) {
		selem.bind('keydown', function (e) {
			var code = e.keyCode || e.which;
			if (code === 13) {
				//e.preventDefault();
				var pageElems = document.querySelectorAll('input, select, textarea'),
					elem = e.srcElement
					focusNext = false,
					len = pageElems.length;
				for (var i = 0; i < len; i++) {
					var pe = pageElems[i];
					if (focusNext) {
						if (pe.style.display !== 'none') {
							pe.focus();
							break;
						}
					} else if (pe === e.srcElement) {
						focusNext = true;
					}
				}
			}
		});
	}
}
});

app.run(function($templateCache) {
	$templateCache.put('index.tpl',
	"<ion-view><ion-content padding='true' overflow-scroll='false' id='indexCtrl'>"+
	"<div class='indexImage'><font class='tfl-calypsa'></font></div>"+
	//"<div class='no_load' ng-show='response_list.length<=0'>Требуется подключение к сети интернет</div>"+
	"<div class='indexList'>"+
		"<div class='one item_cat cat{{r.id}}' ng-repeat='r in response_list'><a href='#/{{r.link}}'><font class='title'>{{r.name}}</font><font class='cols' ng-if='r.shares_cols>0'>{{r.shares_cols}}</font></a></div>"+
		//"<ion-item class='item item_cat cat{{r.id}}' href='#/{{r.link}}' ng-repeat='r in response_list'>{{r.name}}<font class='cols' ng-if='r.shares_cols>0'>{{r.shares_cols}}</font></ion-item>"+
	"</div>"+
	"</ion-content></ion-view>");
	
	$templateCache.put('catalog.tpl',
		"<ion-view><ion-content overflow-scroll='false'>"+
		"<ion-list class='list' id='catalog'>"+
		"<ion-item class='item item_cat cat{{r.id}}' href='#/{{r.link}}' ng-repeat='r in response_list'>{{r.name}}<font class='cols' ng-if='r.shares_cols>0'>{{r.shares_cols}}</font></ion-item>"+
		"</ion-list>"+
		"</ion-content></ion-view>");
		
	$templateCache.put('page.tpl',
		"<ion-view><ion-content padding='true'>"+
		"<ion-refresher  pulling-text='Потяните, чтобы обновить...' on-refresh='reloadPage()' ng-if='canRefresh' spinner='ios-small'></ion-refresher>"+
		"<div ng-show='canRefresh && !isReloading && !is_load' class='list_empty'>обнови</div>"+
		"<div id='page' class='padding-descr' ng-bind-html='r.descr'>"+
		"</div>"+
		"</ion-content></ion-view>");
	$templateCache.put('option.tpl',
		"<ion-view><ion-content>"+
		"<div class='list'>"+
		"<div class='item item-divider'>Настройки</div>"+
		
		//"<ion-toggle ng-click='changeOption(\"push\")' ng-model='option.push' toggle-class='toggle-positive' ng-checked='options.push'>Принимать пуш-уведомления</ion-toggle>"+
		"<div class='item item-toggle'><label class='toggle toggle-positive'><input type='checkbox' ng-click='changeOption(\"push\")' ng-model='option.push' ng-checked='options.push'><div class='track'><div class='handle'></div></div></label><span>Принимать пуш-уведомления</span></div>"+
		
		"</div>"+
		"</ion-content></ion-view>");
	$templateCache.put('login.tpl',
		"<ion-view><ion-content padding='true' overflow-scroll='false'>"+
			"<form name='logForm' class='list list-inset authPanel' ng-submit='login(data)' novalidate>"+
				"<div class='item item-divider'><i class='icon ion-person'></i></div>"+
				"<label class='item item-input'>"+
					"<input focus type='text' placeholder='Логин' name='login' ng-model='data.login' max-length='20' ng-minlength='3' required>"+
				"</label>"+
				"<label class='item item-input'>"+
					"<input focus type='password' placeholder='Пароль' name='password' ng-model='data.password' max-length='15' ng-minlength='5' required>"+
				"</label>"+
				"<div class='action_place'><button ng-disabled='logForm.$invalid' type='submit' class='button button-block button-positive'>Вход</button></div>"+
				"<div class='padding error_place'>"+
					"<p ng-show='logForm.login.$error.required'><i class='icon ion-android-alert error'></i> Требуется ввести логин. Допустимые символы: \"A-Z\", \"0-9\", \"_\"</p>"+
					"<p ng-show='logForm.login.$error.minlength'><i class='icon ion-android-alert error'></i> Логин должен быть более 2 сиволов</p>"+
					"<p ng-show='logForm.password.$error.required'><i class='icon ion-android-alert error'></i> Требуется ввести пароль. Допустимые символы: \"A-Z\", \"0-9\"</p>"+
					"<p ng-show='logForm.password.$error.minlength'><i class='icon ion-android-alert error'></i> Пароль должен быть более 4 символов</p>"+
				"</div>"+
			"</form>"+
		"</ion-content></ion-view>");
	$templateCache.put('register.tpl',
		"<ion-view><ion-content padding='true' overflow-scroll='false'>"+
			"<form name='regForm' class='list list-inset authPanel' ng-submit='register(data)' novalidate>"+
				"<div class='item item-divider'><i class='icon ion-person-add'></i></div>"+
				"<label class='item item-input'>"+
					"<input focus type='text' placeholder='Логин' name='login' ng-model='data.login' max-length='20' ng-minlength='3' required>"+
				"</label>"+
				"<label class='item item-input'>"+
					"<input focus type='password' placeholder='Пароль' name='password' ng-model='data.password' max-length='15'' ng-minlength='5' required>"+
				"</label>"+
				"<label class='item item-input'>"+
					"<input focus type='password' placeholder='Пароль ещё раз' name='password_repeat' ng-pattern='data.password' ng-model='data.password_repeat' max-length='15' ng-minlength='5' required>"+
				"</label>"+
				"<label class='item item-input'>"+
					"<input focus type='text' placeholder='E-mail' name='mail' ng-model='data.email' max-length='100' ng-minlength='5' required>"+
				"</label>"+
				"<div class='action_place'><button ng-disabled='regForm.$invalid || regForm.password_repeat.$error.pattern' type='submit' class='button button-block button-positive'>Регистрация</button></div>"+
				"<div class='padding error_place'>"+
					"<p ng-show='regForm.login.$error.required'><i class='icon ion-android-alert error'></i> Требуется ввести логин. Допустимые символы: \"A-Z\", \"0-9\", \"_\"</p>"+
					"<p ng-show='regForm.login.$error.minlength'><i class='icon ion-android-alert error'></i> Логин должен быть более 2 сиволов</p>"+
					"<p ng-show='regForm.password.$error.required'><i class='icon ion-android-alert error'></i> Требуется ввести пароль. Допустимые символы: \"A-Z\", \"0-9\"</p>"+
					"<p ng-show='regForm.password.$error.minlength'><i class='icon ion-android-alert error'></i> Пароль должен быть более 4 символов</p>"+
					//"<p ng-show='regForm.password_repeat.$error.required'><i class='icon ion-alert-circled error'></i> Требуется ввести пароль второй раз</p>"+
					"<p ng-show='regForm.password_repeat.$error.pattern'><i class='icon ion-android-alert error'></i> Пароли не совпадают</p>"+
					"<p ng-show='regForm.mail.$error.required'><i class='icon ion-android-alert error'></i> Требуется ввести почту</p>"+
				"</div>"+
			"</form>"+
		"</ion-content></ion-view>");
	$templateCache.put('subscribe_me.tpl',
		"<ion-view><ion-content padding='true'>"+
		"<form class='list' ng-submit='submitForm(this)'>"+
			//"<label class='item item-input item-floating-label'>"+
			//	"<span class='input-label'>Email</span>"+
			//	"<input type='text' name='email' ng-model='email' placeholder='Введите ваш e-mail'>"+
			//"</label>"+
			"<label class='item item-input'>"+
				"<input type='text' placeholder='Введите ваш e-mail' ng-model='email' max-length='100'>"+
			"</label>"+
			"<div class='action_place'><button class='button button-block button-positive'>Подписаться</button></div>"+
		"</form>"+
		"</ion-content></ion-view>");
	$templateCache.put('catalog.tpl',
		"<ion-view><ion-content overflow-scroll='false'>"+
		"<ion-list class='list' id='catalog'>"+
		"<ion-item class='item item_cat cat{{r.id}}' href='#/{{r.link}}' ng-repeat='r in response_list'>{{r.name}}<font class='cols' ng-if='r.shares_cols>0'>{{r.shares_cols}}</font></ion-item>"+
		"</ion-list>"+
		"</ion-content></ion-view>");
	$templateCache.put('shares.tpl',
		"<ion-view>"+
		//"<ion-content overflow-scroll='true' lazy-scroll>"+
		"<ion-content overflow-scroll='true'>"+
		//"<div style='padding:10px;'>{{grade}}</div>"+
		"<ion-refresher  pulling-text='Потяните, чтобы обновить...' on-refresh='reloadPage()' ng-if='canRefresh' ng-show='canRefresh' spinner='ios-small'></ion-refresher>"+
		"<div ng-if='pageTitle' class='head_title'>{{pageTitle}}</div>"+
		"<ion-list class='list' id='promoShares'>"+
		"<div ng-show='response_list.length<=0 && is_load && !isReloading' class='list_empty'>"+options.listEmpty.shares+"</div>"+
		"<ion-item class='one item' collection-repeat='r in response_list track by $index' href='#/{{r.link}}'>"+
		//"<ion-item class='one item' collection-repeat='r in response_list track by $index' href='#/{{r.link}}'>"+
		
		//"<div class='cover'><div image-loader='{{r.cover_mini}}'></div></div>"+
		//"<div class='cover'><div ng-style=\"{'background-image':'url('+r.cover_mini+')','background-position':'center center'}\"></div></div>"+
		"<div class='cover'><div ><img ng-src='{{r.cover_mini}}'/></div></div>"+
		
		"<h2 ng-bind-html='r.name'></h2>"+
		"<div class='exhib' ng-if='r.exhib_type && r.exhib_value'><font class='value'>{{r.exhib_value}}</font><font class='type'>{{r.exhib_type}}</font></div>"+
		"<div ng-if='r.time_expire' class='expire'><i ng-show='r.time_expire>0' class='icon ion-android-time'></i><font timer-expire='{{r.time_expire}}'></font></div>"+
		"<div><span class='partner' ng-bind-html='r.partner_name'></span></div>"+
		//"<ion-option-button class='button-positive icon ion-android-share-alt' ng-click=\"socialShare(r.name, null, null, r.link)\"></ion-option-button>"+
		"</ion-item>"+
		"<ion-infinite-scroll on-infinite='showMore()' ng-if='canMore' ng-show='canMore' spinner='ios-small'></ion-infinite-scroll>"+
		"</ion-list>"+
		"</ion-content>"+
		"</ion-view>");
		//"");
	$templateCache.put('share.tpl',
		"<ion-view><ion-content id='promoShare' padding='true' overflow-scroll='false' ng-show='dataLoaded'>"+
		"<div class='title padding-title' ng-bind-html='r.title'></div>"+
		"<div class='share'><button class='icon button ion-android-share-alt' ng-click=\"socialShare(r.title, null, r.cover, r.link)\"></button></div>"+
		"<div class='middle padding-middle'>"+
			"<a class='partner' href='#/{{r.partner_link_true}}'><div ng-style=\"{'background-image':'url('+r.partner_cover_mini+')','background-position':'center center'}\"></div></a>"+
			"<div class='exhib' ng-if='r.exhib_type && r.exhib_value'><font class='value'>{{r.exhib_value}}</font><font class='type'>{{r.exhib_type}}</font></div>"+
		"</div>"+
		"<div class='price' ng-if=\"r.price_old!='' && r.price_new!=''\">"+
			"<div class='price_old' ng-if=\"r.price_old!=''\"><font class='title'>Старая цена</font><font class='text'>{{r.price_old}} руб.</font></div>"+
			"<div class='price_new' ng-if=\"r.price_new!=''\"><font class='title'>Новая цена</font><font class='text'>{{r.price_new}} руб.</font></div>"+
		"</div>"+
		//"<a class='cover'><div ng-click=\"showImage(r.cover)\" ng-style=\"{'background-image':'url('+r.cover+')','background-position':'center center'}\"></div></a>"+
		"<div class='cover'><a ng-click=\"showImage(r.cover)\"><img ng-src='{{r.cover}}'/></a></div>"+
		"<div ng-if='r.time_expire' class='expire'><i ng-show='r.time_expire>0' class='icon ion-android-time'></i><font timer-expire='{{r.time_expire}}'></font></div>"+
		
		
		//"<show-more text='r.descr' limit='50'></show-more>"+
		
		"<div check-height height='120' ng-if='r.descr.length>0' class='descr item-expand' ng-class=\"isItemShown() ? 'active' : 'inactive'\" >"+
			"<div class='text' bind-html-compile='r.descr'  ></div>"+
			"<div ng-if='r.descr.length>0' ng-click='toggleItem()' class='item-expand-footer'>"+
				"<i ng-class=\"!isItemShown() ? 'ion-ios-plus-outline' : 'ion-ios-minus-outline'\"></i>"+
				"{{ !isItemShown() ? 'Читать далее' : 'Скрыть' }}"+
			"</div>"+
		"</div>"+
		
		"<ion-slide-box class='inSlider' ng-if='r.slider.length>0'  options='{loop: false,effect: slide,speed: 300,showPager:true,autoHeight:true,}'>"+
			"<ion-slide class='slide' ng-repeat='li in r.slider'><img ng-src='{{li}}'/></ion-slide>"+
		"</ion-slide-box>"+
		//<div class='image' ng-style=\"{'background-image':'url({{li}})','background-position':'center center'}\"></div>
		"<div class='contacts padding-contacts' bind-html-compile='r.contacts_descr'></div>"+
		"</ion-content></ion-view>");
	$templateCache.put('partner.tpl',
		"<ion-view><ion-content id='promoPartner' padding='true' overflow-scroll='false' ng-show='dataLoaded'>"+
		"<div class='title padding-title' ng-bind-html='r.title'></div>"+
		"<div class='share'><button class='icon button ion-android-share-alt' ng-click=\"socialShare(r.title, null, r.cover, r.link)\"></button></div>"+
		//"<a class='cover'><div ng-click=\"showImage(r.cover)\" ng-style=\"{'background-image':'url('+r.cover+')','background-position':'center center'}\"></div></a>"+
		"<div class='cover'><a ng-click=\"showImage(r.cover)\"><img ng-src='{{r.cover}}'/></a></div>"+
		
		"<div class='subscribe action_place'><button class='button button-block button-positive' ng-click='subscribePartner($event)' data-id='{{r.id}}'>{{subscribeForPartner ? 'Отписаться' : 'Подписаться' }}</button></div>"+
		//"<div class='subscribe action_place'><button class='button button-block button-positive' ng-click='subscribePartner($event)' data-id='{{r.id}}'>Подписаться</button></div>"+
		
		//"<div class='contacts padding-contacts' ng-bind-html='r.contacts'></div>"+
		"<div class='contacts padding-contacts' bind-html-compile='r.contacts'></div>"+
		"<div class='padding-descr'>"+
		
		"<div check-height height='120' ng-if='r.descr.length>0' class='descr' ng-class=\"isItemShown() ? 'item-expand active' : 'item-expand inactive'\">"+
			"<div class='text' bind-html-compile='r.descr'  ></div>"+
			"<div ng-if='r.descr.length>0' ng-click='toggleItem()' class='item-expand-footer'>"+
				"<i ng-class=\"!isItemShown() ? 'ion-ios-plus-outline' : 'ion-ios-minus-outline'\"></i>"+
				"{{ !isItemShown() ? 'Читать далее' : 'Скрыть' }}"+
			"</div>"+
		"</div>"+
		
		"</div>"+
		"</ion-content></ion-view>");
	$templateCache.put('subscribe.tpl',
		"<ion-view><ion-content overflow-scroll='false'>"+
			"<form class='list' ng-if='list.length' ng-submit='saveSubscribe($event)' id='subscribeForm'>"+
				"<div ng-repeat='r in list'>"+
				
					"<div ng-if='r.type == 1' class='item item-divider'><span ng-bind-html='r.title'></span></div>"+
					
					"<div ng-if='r.type == 2' class='item item-toggle'><label class='toggle toggle-positive'><input type='checkbox' ng-checked='r.check' ng-model='data.checkbox[r.model]' name='{{r.model}}'><div class='track'><div class='handle'></div></div></label><span ng-bind-html='r.title'></span></div>"+
					
					"<div ng-if='r.type == 3'>"+
						"<div ng-repeat='l in r.list'>"+
							"<div class='item'><span ng-bind-html='l.title'></span></div>"+
							"<ion-checkbox ng-repeat='n in l.list' ng-model='data.radio[n.model][n.value]' name='{{n.model}}' ng-value='n.value' ng-checked='n.check'><span ng-bind-html='n.name'></span></ion-checkbox>"+
						"</div>"+
					"</div>"+
					
					"<div ng-if='r.type == 4 && !r.list' class='item item-toggle'><label class='toggle toggle-positive'><input ng-click='changeCheckbox(r.model,$event)' type='checkbox' ng-checked='r.check' ng-model='data.radio[r.model]' name='{{r.model}}' id='{{r.model}}'><div class='track'><div class='handle'></div></div></label><span ng-bind-html='r.title'></span></div>"+
					
					"<div ng-if='r.type == 4 && r.list.length'>"+
						"<ion-checkbox ng-repeat='s in r.list' ng-model='data.radio[s.model][s.value]' name='{{s.model}}' ng-click='changeRadio(s.model)' ng-value='s.value' ng-checked='s.check' ><span ng-bind-html='s.name'></span></ion-checkbox>"+
					"</div>"+
					
				"</div>"+
				"<div class='padding action_place'><button name='submit' type='submit' class='button button-block button-positive'>Сохранить настройки</button></div>"+
			"</form>"+
		"</ion-content></ion-view>");
		/*
	$templateCache.put('modal-image',
		"<div class='modal image-modal transparent' ng-click='closeImage()'>"+
		"<ion-pane class='transparent'>"+
			"<img ng-src='{{imageSrc}}' class='fullscreen-image'/>"+
		"</ion-pane>"+
		"</div>");
		*/
		
	$templateCache.put('modal-image',
	"<div class='modal image-modal transparent' ng-click='closeImage()'>"+
	"<ion-slide-box show-pager='false' class='slider' options='{showPager:false,}'>"+
		"<ion-slide><img ng-src='{{imageSrc}}'/></ion-slide>"+
	"</ion-slide-box>"+
	"</div>");
		
		
	$templateCache.put('popup-top-menu',
		"<ion-popover-view style='width:180px;height:auto'>"+
			"<ion-content style='position:relative;'>"+
				"<div ng-if='session_check' class='check_session'><ion-spinner class='spiral'></ion-spinner></div>"+
				"<div ng-if='!session_check' class='list' id='popupTopMenu' ng-click='popupTopMenu.hide()'>"+
					"<div class='item avatar'><div>"+
					"<img ng-if=\"!session || session && !session_avatar.startsWith('http')\" ng-src='css/images/default_avatar.jpg'/>"+
					"<img ng-if=\"session && session_avatar.startsWith('http')\" ng-src='{{session_avatar}}'/>"+
					"</div></div>"+
					"<a ng-if='!session' class='item item-icon-left' href='#/login/'><i class='icon ion-person'></i>Вход</a>"+
					"<a ng-if='!session' class='item item-icon-left' href='#/register/'><i class='icon ion-person-add'></i>Регистрация</a>"+
					"<a class='item item-icon-left' href='#/option/'><i class='icon ion-ios-gear'></i>Настройки</a>"+
					"<a ng-if='session' class='item item-icon-left' href='#/subscribe/'><i class='icon ion-ios-list'></i>Подписки</a>"+
					"<a ng-if='session' class='item item-icon-left' ng-click='logout()'><i class='icon ion-android-exit'></i>Выйти</a>"+
				"</div>"+
			"</ion-content>"+
		"</ion-popover-view>");
});
}());


document.addEventListener('deviceready', function() {
	setTimeout(function() {
		if(typeof $cordovaSplashscreen != 'undefined') {$cordovaSplashscreen.hide();}
		if(typeof navigator.splashscreen !='undefined') {navigator.splashscreen.hide();}
	},500);
}, false);