window.mainApp
.service('$blogconfig', function($config){
    this.adslist = [
        '<img src="http://s3.lk21.org/assets/naganewx.gif" style="margin: 5px 0px;">',
        '<img src="http://s3.lk21.org/assets/luxury-top.gif" style="margin: 5px 0px;">',
        '<img src="http://s3.lk21.org/assets/hoyapkrnew-rev.gif" style="margin: 5px 0px;">',
        '<img src="http://s3.lk21.org/assets/axioopkrnew.gif" style="margin: 5px 0px;">',
        '<img src="http://s3.lk21.org/assets/naganewx.gif" style="margin: 5px 0px;">',
        '<img src="http://s0.lk21.org/assets/remibet.gif" style="margin: 5px 0px;">',
        '<img src="http://s3.lk21.org/assets/vegas.gif" style="margin: 5px 0px;">',
        '<img src="http://s3.lk21.org/assets/royalbola.gif" style="margin: 5px 0px;">',

    ];
    this.num_ads_pershow = 3;
    this.blog_ads_shuffle = [];
    this.set_number_pershow = function(num)
    {
        this.num_ads_pershow = num;
    }
    this.shuffle_ads = function()
    {
        var _parents = this;
        var ads_result = []
        if(this.blog_ads_shuffle.length == this.adslist.length)
        {
            this.blog_ads_shuffle = [];
        }

        for (var i = 0; i < this.num_ads_pershow; i++) {
            var rand = Math.floor((Math.random() * _parents.adslist.length) + 1);            
            if( _parents.adslist[rand] && _parents.blog_ads_shuffle.indexOf(rand) < 0 && _parents.blog_ads_shuffle.length < _parents.adslist.length)
            {
                ads_result.push(_parents.adslist[rand]);
                _parents.blog_ads_shuffle.push(rand);
            }else
            {
               i--;
            }
        }

        return ads_result;
    }

});