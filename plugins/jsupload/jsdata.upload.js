	$.Upload = function(element, options)
	{
		if( !$(element).attr('name') )
		{
			console.error('Attribute nama tidak ditemukan!');
			return false;
		}
		/*
		| code error
		*/
		var code = {
			5001: {text: 'Maaf file tidak dapat diproses karena termasuk dalam file yang tidak diperbolehkan. silahkan pilih file yang lain', code: 5001, title: 'File tidak diterima'}
		}
		function code_error(error)
		{
			return code[error];
		}
		/*
		|----------------
		| get extention
		|----------------
		| @params string 
		*/
		function _get_extention(filename)
		{
			return filename.split('.').pop();
		}

		function _exist_in_excluded_ext(ext)
		{
			var type = []
			if(typeof $.Upload.options.not_accepted_files == 'string')
			{
				type = $.Upload.options.not_accepted_files.replace(/\s/g, '').split(',');
			}

			return ( type.indexOf(ext) > -1 )? true : false;
		}

		function _not_exist_in_accepted_ext(ext)
		{
			var type = []
			if(typeof $.Upload.options.accepted_files == 'string')
			{
				type = $.Upload.options.accepted_files.replace(/\s/g, '').split(',');
			}
		
			return ( type.indexOf(ext) > -1 )? true : false;

		}

		$.Upload.options = $.extend( $.Upload.options, options)

		element 	 	= $(element)[0];
		var files 	 	= element.files,
			deff	 	= $.Deferred(), 
			promises 	= [],
			datapromise = [];
		
		$.each(files, function(a,b){
			var def = new $.Deferred();
			// var inExcludeOne = _exist_in_excluded_ext(_get_extention(b.name));
			var notAccepted = _not_exist_in_accepted_ext(_get_extention(b.name))
			if($.Upload.options.accepted_files != '' && !notAccepted)
			{
				console.error('maaf, '+b.name+' tidak dapat ditambahkan karena ekstensi tidak diperbolehkan.')
				// alert('maaf, '+b.name+' tidak dapat ditambahkan karena ekstensi tidak diperbolehkan.')
				return deff.reject(event, code_error(5001), b);

			}else
			{
				if( $.Upload.test_size(b.size) )
				{
					$.Upload.append($(element).attr('name'), b)
					.done(function(res){
						def.resolve(res);
						promises.push(def);
						datapromise.push(res);
					})
				}
			}

		})

		$.when.apply(undefined, promises)
		.done(function(res){
			deff.resolve(datapromise);
		})

		return deff.promise();
	}

	$.Upload.options = 
	{
		minimum_size: 100000000,
		accepted_files: '', // typea, typeb, typec, | ['typea', 'typeb', ... ] / ['image', ]
		not_accepted_files: null,
		name: 'file',
		url: undefined,
	}

	$.Upload.records = {}

	$.Upload.define_key_files = function(name)
	{

		var i = [];
		if( $.Upload.records[name] )
		{

			$.each( $.Upload.records[name], function(a,b){
				var expl 	= a.split('-');
				expl		= expl.pop();
				i.push(expl);
			});

			return parseInt(i.pop()) + 1;
		
		}else
		{
			return 1;
		}
	}

	$.Upload.append = function(name, file)
	{
		var deff 	= $.Deferred();

		var key 	= $.Upload.define_key_files(name);

		file['key'] = key;
		if(!$.Upload.records[name])
		{
			$.Upload.records[name] = {}
		}
		$.Upload.records[name][$.Upload.options.name+'-'+key] = file;

		deff.resolve( $.Upload.records[name][$.Upload.options.name+'-'+key] );

		return $.when(deff.promise() );

	} 
	$.Upload._count_filename = function(filename)
	{
		var find = []
		$.each($.Upload.records, function(a,b){

			if(b.name == filename)
			{
				find.push('true')
			}else
			{
				find.push('false')
			}
			
		})
		return find;
	}
	$.Upload.is_file = function(filename)
	{
		
		return ($.Upload._count_filename(filename).indexOf('true') > -1)? true : false;
	}

	$.Upload.count_files = function(filename)
	{
		
		return $.Upload._count_filename(filename).filter(function(res){ return res == 'true' }).length;
	}
	
	$.Upload.delete = function(filename, key)
	{
		var deff 	= $.Deferred(),
			obj 	= {key: '', value: {} };
		$.each($.Upload.records, function(a,b){
			/*untuk versi lama yang hanya mengisikan filename saja*/
			if(!key)
			{

				if(b.name == filename)
				{
					obj.key 	= a;
					obj.value 	= b;
			
					deff.resolve(obj);
				}
			}else
			{
				if(b.name == filename && b.key == key)
				{
					obj.key 	= a;
					obj.value 	= b;
			
					deff.resolve(obj);
				}
			}
			
		})

		deff.pipe(function(res){
			delete $.Upload.records[res.key];
			return res;
		})

		return $.when(deff.promise())

	}

	$.Upload.test_size = function(size)
	{
		if(size > $.Upload.options.minimum_size && $.Upload.options.minimum_size !== 0)
		{
			console.error('file lebih besar daripada minimum size. silahkan pilih file dengan size < '+$.Upload.options.minimum_size);
			return false;
		}
		return true;
	}
	$.Upload.read_image = function(input)
	{

		var def = $.Deferred();

	    if (input.files && input.files[0]) {
	        var reader = new FileReader();

	        reader.onload = function (e) {
	    		def.resolve(e)        
	        }

	        reader.readAsDataURL(input.files[0]);
	    }
	    return $.when( def.promise() );
	}

	$.Upload.data_submit = function(other_data_that_will_send)
	{
		var fData = new FormData();
		$.each($.Upload.records, function(a,b){

			fData.append(a,b);
		})

		if(other_data_that_will_send)
		{
			$.each(other_data_that_will_send, function(a,b){
				fData.append(a,b);
			})
		}

		return fData;
	}

	/*
	* reset uploaded file
	*/
	$.Upload.reset = function(options)
	{
		$.Upload.records = {}
	}
	
	$.Upload.submit = function(options)
	{
		options = $.extend({
			url: $.Upload.options.url,
		}, options);

		var deff  = $.Deferred(),
			fData = new FormData();  

		if( options.url && Object.keys($.Upload.records).length > 0 )
		{
			$.each($.Upload.records, function(a,b){

				$.each(b, function(c,d){
					console.log(c,d)
					fData.append(c,d);
				})
			})

			if(options.data)
			{
				$.each(options.data, function(a,b){
					fData.append(a,b);
				})
			}

			$.ajax({
			    url 	: options.url,
			    data 	: fData,
			    cache 	: false,
			    contentType : false,
			    processData : false,
			    type 		: 'POST',
			    success 	: function(data){
			    	deff.resolve(data);
			    	$.Upload.reset();
			    },
			    error: function(data)
			    {
			    	deff.resolve(data);
			    }

			});

		}
		else
		{
			console.error('no url defined! or no file uploaded.');
			return false;
		}

		return deff.promise();
	}
	

