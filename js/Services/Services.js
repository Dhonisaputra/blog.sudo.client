window.mainApp

.service('$config', function () {
    this.processing_server = "http://localhost/projects/blog/server/",
    this.public_key = '';
    this.source = undefined;

    this.trends_url = function(url)
    {
        url = (!url)?'':url;
        return this.trends+'/'+url;   
    }
    this.server_url = function(url)
    {
        url = (!url)?'':url;
        return this.processing_server+url;
    }
    this.base_url = function(url)
    {
        url = (!url)?'':url;
        return this.blog_server+'/'+url;
    }
    this.set_source = function(source)
    {
        this.source = source;
    }
    this.set_public_key = function(source)
    {
        this.public_key = source;
    }
    this.node = window.node;
    this.initialize_configuration = function(config)
    {
        var _parents = this;
        $.each(config, function(a,b){
            _parents[a] = b;
        })
    }   
    
})
.service('$owner', function ($config) {
    this.credential = function()
    {
        var credential = {
            source: $config.source,
            administrator: Cookies.getJSON('sudo')? Cookies.getJSON('sudo') : {},
            public: Cookies.getJSON('public')? Cookies.getJSON('public') : {},
        }
        return credential; 
    }
    this.reset_credential = function()
    {
        this.administrator  = undefined;
        Cookies.remove('sudo')
        Cookies.remove('public')
    }
    
    this.submit_new_owner = function(d, c, e)
    {
        // $tools.post($config.server_url('owner/create_new_owner'), d, c, e )
        var _parents = this;
        data = $.extend({credential: _parents.credential() }, d)
        $.post($config.server_url('owner/create_new_owner'), data )
        .done(function(res){
            if(typeof c == 'function'){c(res)}
        })
        .fail(function(res){
            console.log(res)
            if(typeof e == 'function'){e(res)}
        })
    }

    this.check_available_mail = function(d,c,e)
    {
        // $tolls.post($config.server_url('owner/is_owner_exist'), d, c, e )
        var _parents = this;
        data = $.extend({credential: _parents.credential() }, d)
        $.post($config.server_url('owner/is_owner_exist'), data )
        .done(function(res){
            if(typeof c == 'function'){c(res)}
        })
        .fail(function(res){
            console.log(res)
            if(typeof e == 'function'){e(res)}
        })

    }

})
.service('$tools', function ($config, $owner) {
    this.range = function(input, total)
    {
        var arr = []
        total = parseInt(total);
        for (var i=input; i<total; i++) {
          arr.push(i);
        }

        return arr;
    }
    this.copy = function(e, c)
    {
        $(e).select();
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text was ' + msg);
            if(typeof c == 'function')
            {
                c()
            }
        } catch (err) {
            console.error('Oops, unable to copy');
        }
    }

    this.post = function(url, data, success, fail)
    {
        var _parents = this;
        data = $.extend({credential: $owner.credential() }, data)
        $.post(url, data )
        .done(function(res){
            var parse = _parents.isJson(res)? JSON.parse(res) : res;
            if(typeof success == 'function'){success(parse, res)}
        })
        .fail(function(res){
            console.log(res)
            if(typeof fail == 'function'){fail(res)}
        })
    }

    this. isJson = function(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
})
.service('$pagination', function ($tools, $config, $rootScope) {
    this.components = {}
    this.components.records = []
    this.components.pageSize = 5;
    this.components.currentPage = 1;
    this.components.search = '';

    this.set_page_size = function(item)
    {
        this.initialize(item, this.components.currentPage)
    }
    this.set_records = function(records)
    {
        this.components.records = records;
    }
    this.get_paging = function()
    {
        return this.components.pages;
    }
    this.set_page = function(page)
    {

        this.initialize(this.components.pageSize, page)
    }
    this.get_page_records = function()
    {
        var rec = []
        var _parents = this;
        angular.forEach(this.components.records, function(value, key){
            if(key >= _parents.components.startIndex && key <= _parents.components.endIndex)
            {
                this.push(value)
            }
        }, rec)
        return rec;
    }
    this.get_current_page = function()
    {
        return this.components.currentPage;
    }
    this.initialize = function(pageSize, currentPage)
    {
        this.components.totalItems = this.components.records.length
        if(this.components.totalItems <=0)
        {
            alert('no records found!');
            return false;
        }
        this.components.pageSize = pageSize? parseInt(pageSize) : this.components.pageSize
        this.components.currentPage = currentPage? parseInt(currentPage) : this.components.currentPage
        // check length records
        // get total pages
        this.components.totalPages = Math.ceil(this.components.totalItems / this.components.pageSize);
        this.components.startPage = '';
        this.components.endPage = '';
        // jika total pages <= 10
        if (this.components.totalPages <= 10) {
            // less than 10 total pages so show all
            this.components.startPage = 1;
            this.components.endPage = this.components.totalPages;
        } else {
            // more than 10 total pages so calculate start and end pages
            if (this.components.currentPage <= 6) {
                this.components.startPage = 1;
                this.components.endPage = 10;
            } else if (this.components.currentPage + 4 >= this.components.totalPages) {
                this.components.startPage = this.components.totalPages - 9;
                this.components.endPage = this.components.totalPages;
            } else {
                this.components.startPage = this.components.currentPage - 5;
                this.components.endPage = this.components.currentPage + 4;
            }
        }

        // calculate start and end item indexes
        this.components.startIndex = (this.components.currentPage - 1) * this.components.pageSize;
        this.components.endIndex = Math.min(this.components.startIndex + this.components.pageSize - 1, this.components.totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        this.components.pages = $tools.range(this.components.startPage, this.components.endPage + 1);

        // return object with all pager properties required by the view
        var data = {
            totalItems  : this.components.totalItems,
            currentPage : this.components.currentPage,
            pageSize    : this.components.pageSize,
            totalPages  : this.components.totalPages,
            startPage   : this.components.startPage,
            endPage     : this.components.endPage,
            startIndex  : this.components.startIndex,
            endIndex    : this.components.endIndex,
            pages       : this.components.pages
        };
        console.log( data)
        return data;
    }
    $rootScope.pagination = this;
})
.service('$blog', function($config, $owner, $tools){
    this.records = []
    this.init = function()
    {
       return this;
    }
    this.get_blogs = function(where, callback)
    {
        var _parents = this;
        $.post($config.server_url('blog/get_blog'), {credential: $owner.credential(), where: where})
        .done(function(res){
            res = (!$config.double_server)? JSON.parse(res) : res;
            if(typeof callback == 'function'){callback(res)}
        })
        .fail(function(res){
            console.log(res)
            switch(res.status)
            {
                case 500:
                    // window.location.href= '#/logout';
                    break;
            }
        })
    }

    this.create_blog = function(data, callback)
    {
        var _parents = this;
        $.post($config.server_url('blog/create_blog'), {credential: $owner.credential(), data: {blog: data} })
        .done(function(res){
            console.log(res);
            res = (!$config.double_server)? JSON.parse(res) : res;
            if(typeof callback == 'function'){callback(res)}
        })
        .fail(function(res){
            console.log(res)
            switch(res.status)
            {
                case 500:
                    // window.location.href= '#/logout';
                    break;
            }
        })
    }

    this.uninstall = function($where, success, fail) {
        // body...
        $tools.post(
            $config.server_url('blog/uninstall'), 
            {
                where: $where
            }, 
            success,
            fail
        )
    }
})
.service('$authorize', function($owner, $config, $rootScope){
    this.get_auth_data = function()
    {
        return Cookies.getJSON('sudo')
    }
    this.is_need_login = function()
    {
        var data = this.get_auth_data();
        return ($config.source == 'panel' && !data)? true : false;
    }
    this.is_login = function()
    {
        var data = this.get_auth_data();
        return (!data)? false : true 
    }
    this.initialize = function(c,f)
    {
        if ( this.is_need_login() ) {
            event.preventDefault();
            $location.path('/login');
            
            if(typeof c == 'function'){c}
        }else
        {
            $rootScope.is_auth = 1;
            $rootScope.sidebar= true
            $rootScope.style_main_panel= '';
            $rootScope.base_url = $config.base_url;
            if(typeof f == 'function'){f}
        }
    }
});
