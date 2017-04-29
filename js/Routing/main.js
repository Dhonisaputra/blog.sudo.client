
window.mainApp.config(function($routeProvider) {
	$routeProvider
		.when('/home', {
			title: 'Dashboard',
			templateUrl: 'templates/administrator/blog/index.html',
			controller: 'controller.blog',
			need_login: true,
		})
		.when('/blog', {
			title: 'Dashboard',
			templateUrl: 'templates/administrator/blog/index.html',
			controller: 'controller.blog',
			need_login: true,
		})
		.when('/blog/create', {
			title: 'Create Blog',
			templateUrl: 'templates/administrator/blog/blog.create.html',
			controller: 'controller.blog.create',
			need_login: true,
		})
		.when('/blog/detail/:owner_id/:blog_id', {
			title: 'Detail Blog',
			templateUrl: 'templates/administrator/blog/blog.detail.html',
			controller: 'controller.blog.detail',
			need_login: true,
		})
		.when('/blog/detail/:owner_id/:blog_id/wizard', {
			title: 'Daftar Wizard',
			templateUrl: 'templates/administrator/blog/blog.wizard.html',
			controller: 'controller.blog.detail.wizard',
			need_login: true,
		})
		.when('/blog/detail/:owner_id/:blog_id/wizard/install/blog', {
			title: 'Setting Database',
			templateUrl: 'templates/administrator/blog/blog.wizard.db.html',
			controller: 'controller.blog.detail.wizard.setting.blog',
			need_login: true,
		})
		.when('/blog/detail/:owner_id/:blog_id/wizard/users', {
			title: 'Setting Database',
			templateUrl: 'templates/administrator/blog/blog.wizard.user.html',
			controller: 'controller.blog.detail.wizard.setting.user',
			need_login: true,
		})
		.when('/login', {
			title: 'Login',
			templateUrl: 'templates/administrator/administrator.login.html',
			controller: 'controller.administrator.login'
		})
		.when('/logout', {
			templateUrl: 'templates/administrator/administrator.logout.html',
			controller: 'controller.administrator.logout',
			need_login: true,
		})
		.when('/signup', {
			title: 'signup',
			templateUrl: 'templates/administrator/administrator.signup.html',
			controller: 'controller.signup'
		})
		
		.otherwise({
			redirectTo: function(){
				var cookies = Cookies.getJSON('user');
				if(cookies)
				{
					return (cookies.app_auth)? '/dashboard/post' : '/login'
				}else
				{
					return '/login'
				}
				
			}
		});
});

