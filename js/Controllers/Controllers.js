window.mainApp
.controller('controller.administrator.logout', function($scope, $owner, $routeParams){
	$owner.reset_credential()
	window.location.reload();
})
.controller('controller.administrator.login', function($scope, $config, $routeParams, $authorize){
	$scope.login_components = {}
	if($authorize.is_login())
	{
		window.location.href = '#/home';
	}
	$scope.alert = {}

	$scope.login = function()
	{
		// console.log($scope.login_components)
		var res = !$config.double_server ? $.post($config.server_url('owner/login?dblServer=0'), $scope.login_components) : window.node.send('owner/login', $scope.login_components);
		res.done(function(res){
			res = !$config.double_server ? JSON.parse(res) : res;
			switch(res.code)
			{
				case 200:
					Cookies.set('sudo', res);
					window.location.href = '#/home';
					
					break;
				case 404: 
					$scope.alert.login = res.message;
					$scope.$apply();
					break;
				case 500: 
					$scope.alert.login = res.message;
					$scope.$apply();
					break;
			}
		})
	}
})
.controller('controller.signup', function($scope, $owner) {	
	$scope.owner = {}
	$scope.check_available_mail = function(res)
	{
		Snackbar.manual({message:'Checking email', spinner:true});
		$owner.check_available_mail($scope.owner.email, function(res){
			Snackbar.show('Email Available');
		},function(res){
			Snackbar.manual({message:'Email not available', spinner:false});
		})
	}

	$scope.submit_new_owner = function()
	{
		Snackbar.manual({message:'Registering your data', spinner:true});
		$owner.submit_new_owner($scope.owner, function(res){
			Snackbar.show('Registering complete');
			window.location.href ="#/login"
		},
		function(res){
			Snackbar.manual({message:'Registering failed. please try again.', spinner:false});
		})
	}
})
.controller('controller.home', function($scope) {	
	$scope.message = "Click on the hyper link to view the students list.";
})
.controller('controller.blog', function($scope, $blog) {	
	$scope.blog = {records: []}

	$scope.get_blogs = function()
	{
		$blog.get_blogs({}, function(res){
			$scope.blog.records = res;
			$scope.$apply();
		})
	}
	$scope.message = "Click on the hyper link to view the students list.";
})
.controller('controller.blog.detail', function($scope, $blog, $tools, $routeParams, $config) {	
	$scope.blog = {records: []}

	$scope.get_blog = function()
	{
		$blog.get_blogs({blog_owner: $routeParams['owner_id'], blog_id: $routeParams['blog_id']}, function(res){
			console.log(res)
			$scope.blog.data = res[0];
			$scope.$apply();
		})
	}

	$scope.copy_blog_key = function()
	{
		$tools.copy('#blog_key', function(){
			Snackbar.show('Blog key copied!')
		})
	}
	$scope.download_file_configuration = function(blog)
	{
		window.open($config.server_url('blog/component_download_json_client?token='+blog.blog_key+'&using_auth=0'), '_blank')
	}

	$scope.download_file_sql = function(blog)
	{
		window.open($config.server_url('blog/component_download_sql_client?token='+blog.blog_key+'&using_auth=0'), '_blank')
	}
	
})
.controller('controller.blog.create', function($scope, $blog) {	
	$scope.blog = {}
	$scope.submit_blog = function()
	{
		Snackbar.manual({message: 'Creating Blog. Please wait.', spinner:true})
		$blog.create_blog($scope.blog, function(res){
			console.log(res)
			Snackbar.show('Blog Successfully Created.')
			window.location.href = '#/blog/detail/'+res.blog_owner+'/'+res.blog_id
		})
	}
})

.controller('controller.blog.detail.wizard', function($scope, $config, $routeParams, $authorize, $blog){
	$scope.blog = {records: []}

	$scope.get_blog = function()
	{
		$blog.get_blogs({blog_owner: $routeParams['owner_id'], blog_id: $routeParams['blog_id']}, function(res){
			console.log(res)
			$scope.blog.data = res[0];
			$scope.$apply();
		})
	}
})
.controller('controller.blog.detail.wizard.setting.blog', function($scope, $config, $routeParams, $authorize, $blog, $tools){
	$scope.blog = {records: []}
	$scope.settings = {hostname: 'localhost'}
	$scope.wizard_db_loading = false;
	$scope.get_blog = function()
	{
		$blog.get_blogs({blog_owner: $routeParams['owner_id'], blog_id: $routeParams['blog_id']}, function(res){
			console.log(res)
			$scope.blog.data = res[0];
			$scope.settings.blog_key = $scope.blog.data.blog_key;
			$scope.$apply();
		})
	}

	$scope.submit_setting_db = function()
	{
		componentHandler.upgradeAllRegistered()
		$('#wizard_db_loading').show()
		
		$tools.post($config.server_url('blog/save_blog_settings'), {settings: $scope.settings}, function(res){
			$scope.wizard_db_report = '';
			$('#wizard_db_loading').hide()
			Snackbar.show('Installing blog has done. redirecting to create user!');
			window.setTimeout(function(){
				window.location.href = '#/blog/detail/'+$scope.blog.data.blog_owner+'/'+$scope.blog.data.blog_id+'/wizard/users'
			},2000)
		}, function(res){
			$scope.wizard_db_report = '';
			$('#wizard_db_loading').hide()
		})
	}
})
.controller('controller.blog.detail.wizard.setting.user', function($scope, $config, $routeParams, $authorize, $blog, $tools){
	$scope.blog = {records: [], user: {}}
	$scope.settings = {hostname: 'localhost'}
	$scope.wizard_db_loading = false;
	$scope.get_blog = function()
	{
		$blog.get_blogs({blog_owner: $routeParams['owner_id'], blog_id: $routeParams['blog_id']}, function(res){
			console.log(res)
			$scope.blog.data = res[0];
			$scope.settings.blog_key = $scope.blog.data.blog_key;
			$scope.$apply();
		})
	}

	$scope.submit_setting_user = function()
	{
		componentHandler.upgradeAllRegistered()
		$('#wizard_db_loading').show()
		$scope.blog.user['blog_key'] = $scope.blog.data.blog_key;
		$tools.post($config.server_url('blog/insert_user'), {where: {blog_key: $scope.blog.data.blog_key}, user: $scope.blog.user}, function(res){
			console.log(res)
			$scope.wizard_db_report = '<div class="alert alert-success">User estabilished.</div>';
			$('#wizard_db_loading').hide()
			Snackbar.show('Creating user has done!');
		}, function(res){
			$scope.wizard_db_report = '<div class="alert alert-danger">Error when creating user.</div>';
			Snackbar.show('Error when creating user!');
			$('#wizard_db_loading').hide()
		})
	}
});

