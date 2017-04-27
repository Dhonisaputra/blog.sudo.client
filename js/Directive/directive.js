window.mainApp
.directive('compileHtml', function ($compile) {
    return function (scope, element, attrs) {
        scope.$watch(
            function(scope) {
                return scope.$eval(attrs.compileHtml);
            },
            function(value) {
                element.html(value);
                $compile(element.contents())(scope);
            }
            );
    };
})
.directive('showTab', function () {
    return {
        link: function (scope, element, attrs) {
            element.click(function (e) {
                e.preventDefault();
                $(element).tab('show');
            });
        }
    };
})
.directive('materialDesign', function () {
    return {
        link: function (scope, element, attrs) {
            attrs.$observe('materialDesign', function(text) {
                componentHandler.upgradeDom();
            })
        }
    };
})
.directive('readMore', ['$compile', function($compile) {
    function readmore(html)
    {

    }
    return {
        link: function (scope, element, attrs) {

            var maxLength = 200
            
            attrs.$observe('readMore', function(text) {
                var text = $(element).text();
                var data = $(element).data();

                if (text.length > maxLength) {
                    // split the text in two parts, the first always showing
                    var firstPart   = String(text).substring(0, maxLength);
                    var secondPart  = String(text).substring(maxLength, text.length);

                    // create some new html elements to hold the separate info
                    var firstSpan   = $compile('<span>' + firstPart + '</span>')(scope);
                    var readMoreLink = '<a href="#/open/article/'+data.id_post+'">Read more</a>'


                    // remove the current contents of the element
                    // and add the new ones we created
                    element.empty();
                    element.append(firstSpan);
                    element.append(readMoreLink);
                }
                else {
                    element.empty();
                    element.append(text);
                }
               
                /*console.log($(element).html())
                $('[ng-bind-html] div.readmore').each(function(){
                    $(this).nextAll().remove(); 
                    var data = $(this).parents('[ng-bind-html]').data()
                    if(data && data.id_post)
                    {
                        $(this).after('<a href="#/open/article/'+data.id_post+'">Read more</a>')
                    }
                    $(this).remove()
                })*/
            })
        }
    };
}])
.directive('pagination', ['$timeout','$rootScope','$compile', '$tools', '$pagination', function($timeout, $rootScope, $compile, $tools, $pagination) {
    var records = [];
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            
            angular.element(document).ready(function() {
                $timeout(function(){
                    var records = JSON.parse(attrs.paginationRecords)
                    /*var pageSize = attrs.dataPaginationSize? attrs.dataPaginationSize : 2;
                    var currentPage = ? attrs.dataPaginationCurrentPage : 7;*/
                    $pagination.set_records(records);
                    $pagination.initialize(attrs.paginationSize, attrs.paginationCurrentPage);
                })
            });
        }
    };
}])
.directive('textCollapse', ['$compile', function($compile) {

    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
            // start collapsed
            scope.collapsed = false;

            // create the function to toggle the collapse
            scope.toggle = function() {
                scope.collapsed = !scope.collapsed;
            };

            // wait for changes on the text
            attrs.$observe('textCollapseText', function(text) {

                // get the length from the attributes
                var maxLength = scope.$eval(attrs.textCollapseLength);

                if (text.length > maxLength) {
                    // split the text in two parts, the first always showing
                    var firstPart   = String(text).substring(0, maxLength);
                    var secondPart  = String(text).substring(maxLength, text.length);

                    // create some new html elements to hold the separate info
                    var firstSpan       = $compile('<span>' + firstPart + '</span>')(scope);
                    var secondSpan      = $compile('<span ng-if="collapsed">' + secondPart + '</span>')(scope);
                    var moreIndicatorSpan = $compile('<span ng-if="!collapsed">... </span>')(scope);
                    var lineBreak       = $compile('<br ng-if="collapsed">')(scope);
                    var toggleButton    = $compile('<a class="collapse-text-toggle" ng-click="toggle()">{{collapsed ? "read less" : "read more"}}</a>')(scope);

                    // remove the current contents of the element
                    // and add the new ones we created
                    element.empty();
                    element.append(firstSpan);
                    element.append(secondSpan);
                    element.append(moreIndicatorSpan);
                    element.append(lineBreak);
                    element.append(toggleButton);
                }
                else {
                    element.empty();
                    element.append(text);
                }
            });
        }
    };
}])
.directive('initializeBlog', ['$rootScope', '$owner', '$config', '$tools', function($rootScope, $owner, $config, $tools) {

    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
            $config.set_source(attrs.source);
            $.post('config/configuration.json', function(res){
                console.log(res)
                if($tools.isJson(res))
                {
                    res = JSON.parse(res);
                }
                // res = JSON.parse(res);
                $config.initialize_configuration(res);
                
            })
           /* 
            console.log(attrs.publicKey, $owner.public.get_public_key())
            if(attrs.source == 'client')
            {
                if($owner.public.get_public_key() !== attrs.publicKey )
                {
                    console.info('re-credentials')
                    $owner.public.set_public_key(attrs.publicKey)
                }
            }*/
        }
    };
}]);