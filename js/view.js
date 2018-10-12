if(localStorage.getItem('node'))
{
	viz.config.set('websocket', localStorage.getItem('node'));
}
else
{
	viz.config.set('websocket','wss://ws.viz.ropox.tools');
}
var globalVars = new Object();
var article = new Object();
var user = new Object();
var startAuthor;
var startPermlink;
user.following = [];
user.followers = [];
//Init();
var active_key = '';

function removeChildrenRecursively(node)
{
    if (!node) return;
    while (node.hasChildNodes()) {
        removeChildrenRecursively(node.firstChild);
        node.removeChild(node.firstChild);
    }
}

function spoiler(elem)
{
    style = document.getElementById(elem).style;
    style.display = (style.display == 'block') ? 'none' : 'block';
}

function explode( delimiter, string ) {	// Split a string by string
	// 
	// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +   improved by: kenneth
	// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)

	var emptyArray = { 0: '' };

	if ( arguments.length != 2
		|| typeof arguments[0] == 'undefined'
		|| typeof arguments[1] == 'undefined' )
	{
		return null;
	}

	if ( delimiter === ''
		|| delimiter === false
		|| delimiter === null )
	{
		return false;
	}

	if ( typeof delimiter == 'function'
		|| typeof delimiter == 'object'
		|| typeof string == 'function'
		|| typeof string == 'object' )
	{
		return emptyArray;
	}

	if ( delimiter === true ) {
		delimiter = '1';
	}

	return string.toString().split ( delimiter.toString() );
}

function getPostingKey()
{
	var login = localStorage.getItem('login');
	if(login)
	{
		var pk = sjcl.decrypt(login, localStorage.getItem(login));
		return pk;
	}
	else
	{
		return false;
	}
}	

function getPostingKeyByLogin(login)
{
	var pk = sjcl.decrypt(login, localStorage.getItem(login));
	return pk;
}	

function isLoggedIn()
{
	if(getPostingKey() && localStorage.getItem('login'))
	{
		return true;
	}
	return false;
}

function getFollowersCount()
{
	var login = localStorage.getItem('login');
	viz.api.getFollowCount(login, function(err, data){
		console.log(err, data);
	});
}

function getFollowers(login, start, me)
{
	viz.api.getFollowers(login, start, 'blog', 100, function(err, data){
		//console.log(err, data);
		if(data && data.length > 1 && me == true){
			var i = user.followers.length - 1;
			var latest = '';
			if(start != '')
			{
				data.shift();
			}
			data.forEach(function (operation){
				i++;
				user.followers[i] = operation.follower;
				//console.log(i, operation.follower);
				latest = operation.follower;
			});
			getFollowers(login, latest, me);
		}
	});
}

function getFollowersMe()
{
	var login = localStorage.getItem('login');
	viz.api.getFollowers(login, '', 'blog', 100, function(err, data){
		//console.log(err, data);
		if(data && data.length > 0)
		{
			var i = 0;
			var latest = '';
			data.forEach(function (operation){
				i++;
				user.followers[i] = operation.follower;	
				//console.log(i, operation.follower);
				latest = operation.follower;				
			});
			if(latest != '' && data.length == 100)
			{
				getFollowers(login, latest, true);
			}
			
		}else{
			console.log(err);
		}
	});
}

function getFollowing(login)
{
	viz.api.getFollowing(login, '', 'blog', 100, function(err, data){
		//console.log(err, data);
	});
}

function getFollowingMe()
{
	var login = localStorage.getItem('login');
	viz.api.getFollowing(login, '', 'blog', 100, function(err, data){
		if(data)
		{
			var i = 0;
			data.forEach(function (operation){
				user.following[i] = operation.following;	
				i++;
			});
			//console.log(user.following);
		}else{
			console.log(err);
		}
		
	});
}

function ReblogUpvote(percent, permlink, author)
{
	voter = user.login;
	var key = localStorage.getItem(voter);
	var pk = sjcl.decrypt(voter, key);

if (percent == 100) {
	const json = JSON.stringify(
		["reblog", {
			account: voter,
			author: author,
			permlink: permlink
		}]
	)

	viz.broadcast.custom(pk, [],
            [voter], "follow", json, (err, result) => {
				console.log(err, result); 
                    if (err) return
			});
}
			}

function votePost(power, permlink, author)
{
	voter = user.login;
	var full_weight = power * 100;
	var weight = full_weight/20;
	var key = localStorage.getItem(voter);
	if(key == '')
	{
		alert('Кажется вам нужно еще раз ввести постинг ключ.');
		return;
	}
	var pk = sjcl.decrypt(voter, key);
	document.getElementById('vote_form').style = 'display: none';
	viz.broadcast.vote(pk, voter, author, permlink, weight, 
		function(err, result) {
			 //console.log(err, result);
			 if(result)
			 {				
				updateVotes(permlink, author);
				isVoted(permlink, author, voter);
			 }
			 else{
				  console.log(err);
			 }
		});
		}

function maximumVote(permlink, author) {
var q = window.confirm('Это действие приведет к голосованию со 100% силой, но при этом вы израсходуете 20% энергии на восстановление которой потребуется 24 часа, автор получит больше выплаты. Также будет сделан репост. Чтобы узнать, что такое "энергия", нажмите на ссылку "Твоя энергия" вверху страницы. Вы действительно хотите сделать его?')
if (q === true) {
votePost(2000, permlink, author); ReblogUpvote(100, permlink, author);
}
}

function AddBlockX(operation)
{
	var listWrapper = document.getElementById('items_list_wrapper');
	var main_div = document.createElement("div");
	if(localStorage.getItem('open') == 'true')
	{
		main_div.classList.add("col-xs-6","r_wrapper");
	}
	else
	{
		main_div.classList.add("col-xs-12","q_wrapper");
	}
	
	var metadata = JSON.parse(operation.json_metadata);
	if(metadata.image)
	{
		var image = metadata.image[0];
	}
	else
	{
		var image = 'images/noimage.png';
	}
	var img_div = document.createElement("div");
	img_div.classList.add("img_div");
	main_div.appendChild(img_div);
	if(image == undefined || image == 'images/noimage.png')
	{
		img_div.style.backgroundImage = "url('images/noimage.png')";
	}
	else
	{
		img_div.style.backgroundImage = "url('https://imgp.golos.io/256x256/"+image+"')";
	}
	
	
	var q_div = document.createElement("div");
	q_div.classList.add("q_div");
	main_div.appendChild(q_div);
	
	var title = operation.title;
	var author = operation.author;
	startAuthor = operation.author;
	startPermlink = operation.permlink;
	var created = operation.created;
	var last_update = operation.last_update;
	var total_payout_value = operation.total_payout_value;
	var pending_payout_value = operation.pending_payout_value;
	var total_pending_payout_value = operation.total_pending_payout_value;
var curation_percent = operation.curation_percent/100;
if (operation.active_votes.length !== 0) {
var votes = ' Голосов <strong>' + operation.active_votes.length + '</strong> ';
} else if (operation.cashout_time === "1969-12-31T23:59:59") {
	var votes = '';
}
var vl = total_pending_payout_value;
	if(total_payout_value > total_pending_payout_value)
	{
		vl = total_payout_value;
	} else if (operation.cashout_time === "1969-12-31T23:59:59") {
var shares_payout_value = parseFloat(operation.shares_payout_value)+parseFloat(operation.beneficiary_payout_value)*0.975609756097561;
var beneficiary_payout_value = parseFloat(operation.beneficiary_payout_value)*0.02439024390243902;
		vl = 'авторских: ' + operation.payout_value + ' и ' + shares_payout_value.toFixed(6) + ' SHARES, ' + 'Кураторских: ' + operation.curator_payout_value + ', Бенефициарских: ' + beneficiary_payout_value.toFixed(6) + ' SHARES';
	}
	var content_body = operation.body;

	var tags = '';
	if(typeof metadata.tags !== undefined)
	{
		var tags_count = metadata.tags.length;
		
		for(var i = 0;i < tags_count;i++)
		{
			if(tags_count > 1)
			{
if (metadata.tags[i] !== 'liveblogs') {
				tags = tags + " <span class='label label-warning'><a href='tag.html?tag=" + metadata.tags[i] + "'>"+detransliterate(metadata.tags[i], 0)+'</a></span>';
}
				}
		}
	}	
	var dt = getCommentDate(created);
		var d1 = moment(created);// new Date(created);
	var d2 = moment(operation.cashout_time);//new Date(operation.cashout_time);
	var dco = d2.diff(d1, 'hours');
	if(localStorage.getItem('open') == 'true')
	{
		var s = '';
		var h = 'show.html?permlink='+operation.permlink.trim() +'&author='+operation.author.trim();
	}
	else
	{
		var s = 'onClick="getContentX(\''+operation.permlink.trim() +'\', \''+operation.author.trim() +'\');"';
		var h = 'javascript:void(0)';
	}
if (user.login === operation.author) {
var edit_post = '(<a href="edit.html?author=' + operation.author + '&permlink=' + operation.permlink + '" target="_blank">Редактировать</a>)';
} else {
var edit_post = '';
}

	q_div.innerHTML = '<div class="q_header_wrapper"><h3><a href="'+h+'" '+s+'>'+ title + '</a>' + edit_post + '</h3></div>' +  dt +' - Автор: <a href="user.html?author='+ author +'" title="Все посты пользователя">@' + author + '</a>' + '<br/>' + votes + 'Сумма <strong>' + vl + '</strong>  Отдаёт кураторам: <strong>' + curation_percent + '%</strong> выплаты<br/>' + tags + '<div class="anons_body">' + content_body + '</div>';
	
	var clearFix = document.createElement("div");
	clearFix.classList.add("clearFix");
	main_div.appendChild(clearFix); 
	listWrapper.appendChild(main_div);
}

function getDiscussionsByAuthor(author)
{
	document.getElementById('loader').style = 'display:block';
	 var params = 
	 {
		 'limit': 100,
		 'truncate_body': 40,
		 'select_authors': [author],
'select_tags': ['liveblogs']
	 }
	 viz.api.getDiscussionsByCreated(params, function(err, data){
		if(data.length > 0)
		{	
			data.sort(compareDate);	
			for(operation of data)
			{
				//console.log(operation);
				if (operation.curation_percent === 5000 && operation.beneficiaries && operation.beneficiaries.length && operation.beneficiaries[0].account === 'denis-skripnik' || operation.beneficiaries[1].account === 'denis-skripnik') {
				AddBlockX(operation);
}
				}//);
		}
		document.getElementById('loader').style = 'display:none';
	 });
}

function getDiscussionsByBlog(author)
{
	document.getElementById('loader').style = 'display:block';
	 var params = 
	 {
		 'limit': 100,
		 "select_authors": [author],
		 'select_tags': ['liveblogs']
		 }
	 viz.api.getDiscussionsByBlog(params, function(err, data){
		if(err)
		{
			console.log(err);
		}			
		if(data.length > 0)
		{	
			data.sort(compareDate);
			for(operation of data)
			{
				if(operation.author === author) {
					if (operation.curation_percent === 5000 && operation.beneficiaries && operation.beneficiaries.length && operation.beneficiaries[0].account === 'denis-skripnik' || operation.beneficiaries[1].account === 'denis-skripnik') {
				AddBlockX(operation);
}
				}
			}//);
		}
		document.getElementById('loader').style = 'display:none';
	 });
}

function getDiscussionsTrending() 
{
	document.getElementById('loader').style = 'display:block';
	viz.api.getDiscussionsByTrending({"limit": 100, 'select_tags': ['liveblogs']}, function(err, data){
		//console.log(err,data);
		
		if(data.length > 0)
		{			
			data.forEach(function (operation){
				if (operation.curation_percent === 5000 && operation.beneficiaries && operation.beneficiaries.length && operation.beneficiaries[0].account === 'denis-skripnik' || operation.beneficiaries[1].account === 'denis-skripnik') {
			AddBlockX(operation);
}
			});
		}
		document.getElementById('loader').style = 'display:none'; 
	});	
}

function getDiscussionsPopular(date)
{
	document.getElementById('loader').style = 'display:block';
	viz.api.getDiscussionsByHot({"limit": 100, 'select_tags': ['liveblogs']}, function(err, data){
		//console.log(err,data);
		
		if(data.length > 0)
		{			
			data.forEach(function (operation){
				if (operation.curation_percent === 5000 && operation.beneficiaries && operation.beneficiaries.length && operation.beneficiaries[0].account === 'denis-skripnik' || operation.beneficiaries[1].account === 'denis-skripnik') {
			AddBlockX(operation);
}
			});
		}
		document.getElementById('loader').style = 'display:none'; 
	});	
}

function compareDate(a, b)
{
	if(a.created > b.created)
	{
		return -1;
	}
	else{
		return 1;
	}
}

function getDiscussionsByTags(tags)
{
	document.getElementById('loader').style = 'display:block';
	 var params = 
	 {
		 'limit': 100,
		 'select_tags': tags,
		 'truncate_body': 20
	 }
	 //console.log(params);
	 viz.api.getDiscussionsByCreated(params, function(err, data){
		if(err)
		{
			console.log(err);
		}
		if(data)
		{
			data.sort(compareDate);
			if(data.length > 0)
			{			
				data.forEach(function (operation){
					if (operation.curation_percent === 5000 && operation.beneficiaries && operation.beneficiaries.length && operation.beneficiaries[0].account === 'denis-skripnik' || operation.beneficiaries[1].account === 'denis-skripnik') {
				AddBlockX(operation);
}
				});
			}
		}		
		document.getElementById('loader').style = 'display:none'; 
	 });
}

function getDiscussions(start_author, start_permlink)
{
     start_author = typeof start_author !== 'undefined' ?  start_author : '';
     start_permlink = typeof start_permlink !== 'undefined' ?  start_permlink : '';
     if(start_permlink && start_author)
     {
         var params = 
         {
             'limit': 100,
             'truncate_body': 240,
'select_tags': ['liveblogs'],
             'start_author': start_author,
             'start_permlink': start_permlink
         }     
     }
     else
     {
         var params = 
         {
             'limit': 100,
             'truncate_body': 240,
		 'select_tags': ['liveblogs']
         }
     }
     
     viz.api.getDiscussionsByCreated(params, function(err, data){
        if(data.length > 0)
        {			
            //data.forEach(function (operation)
			for(operation of data)
			{
				if (operation.curation_percent === 5000 && operation.beneficiaries && operation.beneficiaries.length && operation.beneficiaries[0].account === 'denis-skripnik' || operation.beneficiaries[1].account === 'denis-skripnik') {
		AddBlockX(operation);
}
		}//);
        }
		document.getElementById('loader').style = 'display:none'; 
     });
}

function getDiscussionsByFeed(login, start_author, start_permlink)
{
	document.getElementById('loader').style = 'display:block';
	 start_author = typeof start_author !== 'undefined' ?  start_author : '';
     start_permlink = typeof start_permlink !== 'undefined' ?  start_permlink : '';
	 //console.log(start_author, start_permlink);
     if(start_permlink && start_author)
     {
         var params = 
         {
             'limit': 100,
             'truncate_body': 240,
'select_tags': ['liveblogs'],
			 "select_authors": [login],
             'start_author': start_author,
             'start_permlink': start_permlink
         }     
     }
     else
     {
         var params = 
         {
			 "tag": "",
			 "select_authors": [login],
             'limit': 100,
             'truncate_body': 240,
'select_tags': ['liveblogs']
         }
     }
			viz.api.getDiscussionsByFeed(params, function(err, data){
		//console.log(err,data);
		data.sort(compareDate);
		if(data.length > 0)
		{			
			data.forEach(function (operation){
				viz.api.getFollowing(login, '', 'blog', 100, function(err, result) {
					if ( ! err) {
					 result.forEach(function(item) {
if (item.following === operation.author)
if (operation.curation_percent === 5000 && operation.beneficiaries && operation.beneficiaries.length && operation.beneficiaries[0].account === 'denis-skripnik' || operation.beneficiaries[1].account === 'denis-skripnik') {
	AddBlockX(operation);
}
	});
		}
		else console.error(err);
		});
			});
		}
		document.getElementById('loader').style = 'display:none'; 
	});
}

function getReblogsPost(login, start_author, start_permlink)
{
	document.getElementById('loader').style = 'display:block';
	 start_author = typeof start_author !== 'undefined' ?  start_author : '';
     start_permlink = typeof start_permlink !== 'undefined' ?  start_permlink : '';
	 //console.log(start_author, start_permlink);
     if(start_permlink && start_author)
     {
         var params = 
         {
             'limit': 100,
             'truncate_body': 240,
'select_tags': ['liveblogs'],
			 "select_authors": [login],
             'start_author': start_author,
             'start_permlink': start_permlink
         }     
     }
     else
     {
         var params = 
         {
			 "tag": "",
			 "select_authors": [login],
             'limit': 100,
             'truncate_body': 240,
'select_tags': ['liveblogs']
         }
     }
	viz.api.getDiscussionsByFeed(params, function(err, data){
		//console.log(err,data);
data.sort(function(a, b) {
  if(a.active_votes_count < b.active_votes_count) return -1;
  if(a.active_votes_count > b.active_votes_count) return 1;
  return 0;
});
		if(data.length > 0)
		{			
			data.forEach(function (operation){
				viz.api.getFollowing(login, '', 'blog', 100, function(err, result) {
					if ( ! err) {
					 result.forEach(function(item) {
if (item.following != operation.author)
if (operation.curation_percent === 5000 && operation.beneficiaries && operation.beneficiaries.length && operation.beneficiaries[0].account === 'denis-skripnik' || operation.beneficiaries[1].account === 'denis-skripnik') {
	AddBlockX(operation);
}
	});
		}
		else console.error(err);
		});
			});
		}
		document.getElementById('loader').style = 'display:none'; 
	});	
}

function prepareContent(text) {
	return text.replace(/[^=][^""][^"=\/](https?:\/\/[^" <>\n]+)/gi, data => {
	const link = data.slice(3);
	  if(/(jpe?g|png|svg|gif)$/.test(link)) return `${data.slice(0,3)} <img src="${link}" alt="" /> `
	  if(/(youtu|vimeo)/.test(link)) return `${data.slice(0,3)} <iframe src="${link}" frameborder="0" allowfullscreen></iframe> `;
	  return `${data.slice(0,3)} <a href="${link}">${link}</a> `
	}).replace(/ (@[^< \.,]+)/gi, user => ` <a href="user.html?author=${user.trim().slice(1)}">${user.trim()}</a>`)
}

function getContentX(permlink, author)
{
	article.permlink = permlink;
	article.author = author;
	removeChildrenRecursively(document.getElementById('query_header'));
	removeChildrenRecursively(document.getElementById('answers_list'));
	removeChildrenRecursively(document.getElementById('qq'));
	removeChildrenRecursively(document.getElementById('voters'));
	if(document.getElementById('my_vote'))
	{
		document.getElementById('my_vote').innerHTML = '';
		document.getElementById('vote_form').style = 'display: none';
	}
	
	if(document.getElementById('content_loader'))
	{
		document.getElementById('content_loader').style = 'display:block';
	}	
	
	if(document.getElementById('answers_loader'))
	{
		document.getElementById('answers_loader').style = 'display:block';
	}
	
	viz.api.getContent(author, permlink, -1, function(err, data){
		//console.log( data );
		var metadata = JSON.parse(data.json_metadata);
		console.log(metadata);
		if(document.getElementById('content_loader'))
		{
			document.getElementById('content_loader').style = 'display:none'; 
			document.getElementById('loader').style = 'display:none'; 
		}

		var result = data;
		if (result.curation_percent === 5000 && result.beneficiaries && result.beneficiaries.length && result.beneficiaries[0].account === 'denis-skripnik' || result.beneficiaries[1].account === 'denis-skripnik') {
		marked.setOptions({
		  renderer: new marked.Renderer(),
		  gfm: true,
		  tables: true,
		  breaks: true,
		  pedantic: false,
		  sanitize: false,
		  smartLists: true,
		  smartypants: false,
		});
		article.text = result.body;
		var main_div = document.getElementById('qq');
		/*var re = /https:\/\/golos.io/gi;
		var newbody = result.body.replace(re, 'https://liveblogs.space');
		var re = /https:\/\/golos.blog/gi;
		var newbody = newbody.replace(re, 'https://liveblogs.space');
		var re = /https:\/\/goldvoice.club/gi;
		var newbody = newbody.replace(re, 'https://liveblogs.space');*/
		var newbody = marked(result.body);
	//	console.log(newbody);
		newbody = prepareContent(newbody);
		
var options = {
 whiteList: {
	iframe: ['width', 'height', 'src', 'frameborder', 'allow', 'allowfullscreen'],
			  a: ['href', 'title', 'target'],
			  table: [],
			  img: ['width', 'height', 'src', 'title', 'alt'],
			  td: [],
th: [],
tr: [],
h1: [],
h2: [],
h3: [],
h4: [],
h5: [],
h6: [],
br: [],
hr: [],
blockquote: [],
p: [],
em: [],
small: [],
b: [],
strong: [],
ul: [],
ol: [],
li: [],
center: [],
code: [],
del: []
}
};

		   main_div.innerHTML = filterXSS(newbody, options);

		var date = new Date(result.created);
		var offset = date.getTimezoneOffset();
		date.setMinutes(date.getMinutes() - offset); 
	var tags = '';
	if(typeof metadata.tags !== undefined)
	{
		var tags_count = metadata.tags.length;
		
		for(var i = 0;i < tags_count;i++)
		{
			if(tags_count > 1)
			{
if (metadata.tags[i] !== 'liveblogs') {
				tags = tags + " <span class='label label-warning'><a href='tag.html?tag=" + metadata.tags[i] + "'>"+detransliterate(metadata.tags[i], 0)+'</a></span>';
}
				}
		}
	}	
		var dt = date.toLocaleDateString("ru-RU") + ' ' + date.toLocaleTimeString("ru-RU");
	  
var curation_percent = result.curation_percent/100;
if (result.active_votes.length !== 0) {
var votes = 'Голосов <strong>'+result.active_votes.length+'</strong> ';
} else if (result.cashout_time === "1969-12-31T23:59:59") {
var votes = '';
} else {
var votes = 'Голосов <strong>'+result.active_votes.length+'</strong> ';
}

var vl = result.total_pending_payout_value;
		if(result.total_payout_value > result.total_pending_payout_value)
		{
			vl = result.total_payout_value;
		} else if (result.cashout_time === "1969-12-31T23:59:59") {
			var shares_payout_value = parseFloat(result.shares_payout_value)+parseFloat(result.beneficiary_payout_value)*0.975609756097561;
			var beneficiary_payout_value = parseFloat(result.beneficiary_payout_value)*0.02439024390243902;
					vl = 'авторских: ' + result.payout_value + ' и ' + shares_payout_value.toFixed(6) + ' SHARES, ' + 'Кураторских: ' + result.curator_payout_value + ', Бенефициарских: ' + beneficiary_payout_value.toFixed(6) + ' SHARES';
		}

	if (result.cashout_time === "1969-12-31T23:59:59") {
var vyplata = 		result.last_payout;
	} else {
var vyplata = result.cashout_time;
	}
		article.payment = vl;
		article.votes = result.active_votes.length;
		article.title = result.title;
		
		var follow = '';
		if(isLoggedIn() && document.getElementById('vote_form'))
		{
			follow = '<span class="tt" onclick="spoiler(\'follow\'); return false">больше...</span>';
			follow += '<span id="follow" class="terms" style="display: none;">';
			if(user.followers.includes(author))
			{
				follow += "<div style='float: left; margin-top: -7px; margin-right: 5px;'> <img src='images/hs.png' title='Подписан на вас'> </div>";
			}
			if(user.following.includes(author))
			{
				follow += "<button class='btn btn-warning' onClick='follow(\""+author+"\"); style.display=\"none\"'>Отписаться</button> ";
			}
			else
			{
				follow += "<button class='btn btn-success' onClick='follow(\""+author+"\"); style.display=\"none\"'>Подписаться</button> ";
			}			
			follow += "<button class='btn btn-danger' onClick='ignore(\""+author+"\"); style.display=\"none\"'>Игнорировать</button> ";
			follow += '</span>';
		}
		
		var header = document.createElement("div");
		if (user.login === author) {
			var edit_post = '(<a href="edit.html?author=' + author + '&permlink=' + permlink + '" target="_blank">Редактировать</a>)';
			} else {
			var edit_post = '';
			}
			history.pushState('', '', 'show.html?author=' + author + '&permlink=' + permlink);
$('title').html(result.title + ' | Live blogs space');
			header.innerHTML = "<h1><a href='show.html?author="+ author +"&permlink="+ permlink +"'>"+result.title+"</a>" + edit_post + "<br><small>"+dt+" Автор - <a href='user.html?author="+ author +"' title='Все посты пользователя'>@"+result.author+"</a> "+ follow + "</small></h1>" + '<p class="help-text">' + votes + 'Сумма <strong>'+vl+'</strong>  выплата '+getCommentDate(vyplata)+'  Отдаёт кураторам: <strong>'+curation_percent+'%</strong> от выплаты<br/>' + tags + '</p>';
		
		var ava = document.createElement("div");
		ava.style.float = 'left';
		ava.id = 'ava';
	  
		document.getElementById('query_header').appendChild(ava);	  
		document.getElementById('query_header').appendChild(header);
		if(isLoggedIn() && document.getElementById('vote_form'))
		{
			var vote_form =  document.getElementById('vote_form');
			vote_form.permlink.value = permlink;
			vote_form.author.value = author;
			vote_form.style = 'display:block'; 
		}
		  
		viz.api.getAccounts([author], function(err, response){
			if(err)
			{
				console.log(err);
			}
			
			if(response)
			{
				var ava = document.getElementById("ava");
				if(response[0].json_metadata != 'undefined' && response[0].json_metadata != '{}' && response[0].json_metadata != '')
				{
					var metadata = JSON.parse(response[0].json_metadata);
					if(metadata.profile != 'undefined')
					{
						if(metadata.profile.profile_image != undefined)
						{
							ava.style.backgroundImage = "url('https://imgp.golos.io/256x256/"+metadata.profile.profile_image+"')";
							
						}else{
							ava.style.backgroundImage = "url('images/ninja.png')";
						}
					}else{
						var ava = document.getElementById("ava");
						ava.style.backgroundImage = "url('images/ninja.png')";
					}					
				}else{
					var ava = document.getElementById("ava");

					ava.style.backgroundImage = "url('images/ninja.png')";
				}	
				ava.classList.add('ava_div');
			}
		});  
	}
	});
	
	viz.api.getContentReplies(author, permlink, -1, function(err, data){
		if(data.length > 0)
		{
			data.forEach(function(operation){
				var main_div = addComentX(operation);
				document.getElementById('answers_list').appendChild(main_div);
				getRepliesX(operation.author, operation.permlink, main_div)
			});
		}
	});
	
	if(isLoggedIn())
	{
		document.getElementById('answer').style = 'display: block';
	}
	
	var voter = localStorage.getItem('login');
	isVoted(permlink, author, voter);
	
	viz.api.getActiveVotes(author, permlink, -1, function(err, data){
	if(data)
		if(data.length > 0)
		{
			var s = '';
			data.forEach(function(operation){

			s = s + "<a href='user.html?author="+operation.voter+"' title='"+operation.percent / 5 +"%'>@"+operation.voter+"</a> ";
			});
			document.getElementById('voters').innerHTML = '<hr><div>Оценили ('+data.length+'): <span class="tt" onclick="spoiler(\'all_votes\'); return false">показать</span> <span id="all_votes" class="terms" style="display: none;"><small>' + s + '</small></span></div>';
		}
	});	
	
}

function updateVotes(permlink, author)
{
	removeChildrenRecursively(document.getElementById('voters'));
	viz.api.getActiveVotes(author, permlink, -1, function(err, data){
		if(data)
			if(data.length > 0)
			{
				var s = '';
				data.forEach(function(operation){
					s = s + "<a href='user.html?author="+operation.voter+"' title='"+operation.percent / 5 +"%'>@"+operation.voter+"</a> ";
				});
				document.getElementById('voters').innerHTML = '<hr><div>Оценили ('+data.length+'): <span class="tt" onclick="spoiler(\'all_votes\'); return false">показать</span> <span id="all_votes" class="terms" style="display: none;"><small>' + s + '</small></span></div>';
			}
	});	
}

function follow(author)
{
	var login = localStorage.getItem('login');
	var pk = getPostingKeyByLogin(login);
	var json=JSON.stringify(['follow',{follower:login,following:author,what:['blog']}]);
	viz.broadcast.custom(pk,[],[login],'follow',json,function(err, result){
		console.log(err);
		if(!err){
			/*$('.user-card[data-user-login="'+user_card_action.login+'"]').attr('data-subscribed','1');
			$('.user-card[data-user-login="'+user_card_action.login+'"]').attr('data-ignored','0');
			user_card_action.wait=0;
			rebuild_user_cards();*/
		}
		else{
			//user_card_action.wait=0;
			//add_notify('<strong>'+l10n.global.error_caption+'</strong> '+l10n.errors.broadcast,10000,true);
		}
	});
}

function ignore(author)
{
	var login = localStorage.getItem('login');
	var pk = getPostingKeyByLogin(login);
	var json=JSON.stringify(['follow',{follower:login,following:author,what:['ignore']}]);
	viz.broadcast.custom(pk,[],[login],'follow',json,function(err, result){
		if(!err){
			/*$('.user-card[data-user-login="'+user_card_action.login+'"]').attr('data-subscribed','1');
			$('.user-card[data-user-login="'+user_card_action.login+'"]').attr('data-ignored','0');
			user_card_action.wait=0;
			rebuild_user_cards();*/
		}
		else{
			//user_card_action.wait=0;
			//add_notify('<strong>'+l10n.global.error_caption+'</strong> '+l10n.errors.broadcast,10000,true);
		}
	});
}

function isVoted(permlink, author, voter)
{
	if(document.getElementById('my_vote'))
	{
		document.getElementById('my_vote').innerHTML = '';
		viz.api.getActiveVotes(author, permlink, -1, function(err, data){
			if(data)
				if(data.length > 0)
				{
					data.forEach(function(operation){
						if(operation.voter == voter)
						{
							document.getElementById('my_vote').innerHTML = '<hr><div>Оценено мной на <strong>'+operation.percent / 5+' %</strong></div>';
							document.getElementById('vote_form').style = 'display: none';
						}
					});
				}
		});	
	}
}

function addComentX(operation)
{
	var main_div = document.createElement("div");
	main_div.classList.add("panel");
	main_div.classList.add("panel-default");
	var header = document.createElement("div");
	header.classList.add("panel-heading");
	var actions = document.createElement("div");
	actions.style.textAlign = 'right';
	actions.style.marginBottom = '5px';
	
	var action_edit = document.createElement("div");
	action_edit.style.textAlign = 'left';
	action_edit.style.marginBottom = '5px';

	var dt = getCommentDate(operation.created);
	var ava = document.createElement("div");
	ava.style.float = 'left';
		
	header.innerHTML = "<div><h3>"+operation.title+" <small>"+dt+" Автор - <a href='user.html?author="+operation.author+"' title='Все посты пользователя'>@"+operation.author+'</a></small></h3></div>';
	main_div.appendChild(header);
	header.appendChild(ava);
		
	var answer = document.createElement("div");
	answer.classList.add("panel-body");
	answer.id = 'body_' + operation.permlink.trim();
		answer.innerHTML = marked(operation.body);
	if(isLoggedIn())
	{
		actions.innerHTML = '<a href="javascript:void(0);" onClick="document.getElementById(\'id_'+operation.permlink+'\').style.display = \'block\'; this.style.display = \'none\';" class="reply">Ответить</a>';
		var send = document.createElement("div");
		send.innerHTML = "<textarea id='tx_"+operation.permlink+"' style='width: 92%; height: 100px; margin: 5px;'></textarea><button onClick=\"sendComment('"+operation.permlink+"', '"+operation.author+"', 'tx_"+operation.permlink+"', this, true);\">Отправить</button>";
		send.style.display = 'none';
		send.margin = '8px';
		send.id = 'id_' + operation.permlink.trim();
		actions.appendChild(send);
if (user.login === operation.author) {
		action_edit.innerHTML = '<a href="javascript:void(0);" onClick="document.getElementById(\'edit_'+operation.permlink+'\').style.display = \'block\'; this.style.display = \'inline\';" class="edit">редактировать</a>';
		var send_edit = document.createElement("div");
		send_edit.innerHTML = "<textarea id='editarea_"+operation.permlink+"' style='width: 92%; height: 100px; margin: 5px;'>" + operation.body + "</textarea><button onClick=\"editComment('"+operation.parent_author+"', '"+operation.parent_permlink+"', '"+operation.permlink+"', '"+operation.author+"', 'editarea_"+operation.permlink+"', this, true);\">Изменить</button>";
		send_edit.style.display = 'none';
		send_edit.margin = '8px';
		send_edit.id = 'edit_' + operation.permlink.trim();
		action_edit.appendChild(send_edit);
	}
	}
	main_div.appendChild(answer);
	main_div.appendChild(actions);
	main_div.appendChild(action_edit);
	if(isLoggedIn())
	{
		document.getElementById('answer').style = 'display: block';
	}
	
	viz.api.getAccounts([operation.author], function(err, response){
		//console.log(err, response);
		if(response)
		{
			if(response[0].json_metadata != undefined && response[0].json_metadata != '{}' && response[0].json_metadata != '')
			{
				var metadata = JSON.parse(response[0].json_metadata);
				console.log(metadata.profile.profile_image);
				if(metadata.profile != undefined && metadata.profile != null)
				{
					if(metadata.profile.profile_image != undefined && metadata.profile.profile_image != null)
					{
						//var ava = document.getElementById("ava");
						ava.style.backgroundImage = "url('https://imgp.golos.io/256x256/"+metadata.profile.profile_image+"')";
						ava.classList.add('ava_div');
					}else{
						ava.style.backgroundImage = "url('images/ninja.png')";
						ava.classList.add('ava_div');
					}
				}else{
					ava.style.backgroundImage = "url('images/ninja.png')";
					ava.classList.add('ava_div');
				}					
			}else{
				ava.style.backgroundImage = "url('images/ninja.png')";
				ava.classList.add('ava_div');
			}				
		}
	});
	return main_div;
}

function getRepliesX(author, permlink, parent)
{
	viz.api.getContentReplies(author, permlink, -1, function(err, data){
		//console.log(err, data);
		if(data.length > 0)
		{
			data.forEach(function(operation){
				var div = addComentX(operation);
				div.classList.add("depth2");
				parent.appendChild(div);
				getRepliesX(operation.author, operation.permlink, div);
console.log(operation.author + ' ' + operation.permlink);
			});
		}
	});
}

function showEditor(id, btn)
{
	//btn.style = 'display:none';
	document.getElementById(id.trim()).style.display = 'block';
}

function getCommentDate(adate)
{
	var date = new Date(adate);
	var offset = date.getTimezoneOffset();
	date.setMinutes(date.getMinutes() - offset); 
	return moment(date, "YYYYMMDD").fromNow();
}

function sendComment(permlink, author, txt_id, button, hide)
{
	var login = localStorage.getItem('login');
	var text = document.getElementById(txt_id).value;
	var dv = document.createElement('div');
	dv.innerHTML = text;
	var text = dv.textContent || dv.innerText || "";
	var parts = explode( '-', permlink );
	var pl = '';
	for(var i = 0; i< parts.length - 1; i++)
	{
		if(i == 0)
		{
			pl += parts[i];
		}
		else{
			pl += '-' + parts[i];
		}
		
	}
	var date = new Date();
	var dt = date.getFullYear() + date.getMonth().toString() + date.getDate().toString()+ 't' + date.getHours().toString() + date.getMinutes().toString() + date.getSeconds().toString() + date.getMilliseconds().toString() + 'z';
	var new_permlink = 're-' + author + '-' + pl + '-' + dt;
	if(text && login)
	{
		var key = getPostingKey();
		if(key)
		{
			const benecs = [{account: user.login, weight:4000}];
			if(user.login != "denis-skripnik") benecs.push({account: "denis-skripnik", weight:100});
			viz.broadcast.content(key,
			author,
			permlink,
			login,
			new_permlink,
			'',
			text,
5000,
'{"app":"liveblogs.space","format":"text"}',
[[ 0, {"beneficiaries":benecs} ]],
			function(err, result) {
				console.log(err);
				if(result)
				{
					console.log(result);
					document.getElementById(txt_id).value = '';
					if(hide)
					{
						document.getElementById(txt_id).style = 'display:none';
						button.style = 'display:none';
					}					
					viz.api.getContentReplies(article.author, article.permlink, -1, function(err, data){
						if(data.length > 0)
						{
								data.forEach(function(operation){
									var main_div = addComentX(operation);
									document.getElementById('answers_list').appendChild(main_div);
									getRepliesX(operation.author, operation.permlink, main_div)
								});
							}
						});
				}
				if(err)
				{
					console.log( err.payload.error.message);
					//if(err.i.payload.data.code == 10)
					{
						alert('Ошибка при публикации. ' + err.payload.error.message);
					}
				}				
			});			 
		}		
	}
}

function editComment(parent_author, parent_permlink, permlink, author, txt_id, button, hide)
{
	var login = localStorage.getItem('login');
	var text = document.getElementById(txt_id).value;
	var dv = document.createElement('div');
	dv.innerHTML = text;
	var text = dv.textContent || dv.innerText || "";
	var parts = explode( '-', permlink );
	var pl = '';
	for(var i = 0; i< parts.length - 1; i++)
	{
		if(i == 0)
		{
			pl += parts[i];
		}
		else{
			pl += '-' + parts[i];
		}
		
	}
	var date = new Date();
	var dt = date.getFullYear() + date.getMonth().toString() + date.getDate().toString()+ 't' + date.getHours().toString() + date.getMinutes().toString() + date.getSeconds().toString() + date.getMilliseconds().toString() + 'z';
	if(text && login)
	{
		var key = getPostingKey();
		if(key)
		{
			viz.broadcast.content(key,
				parent_author,
				parent_permlink,
				author,
				permlink,
				'',
				text,
	5000,
	'{"app":"liveblogs.space","format":"text"}',
[],
				function(err, result) {
					console.log(err);
					if(result)
					{
						jQuery('#body_' + permlink).html(marked(text));
						console.log(result);
						document.getElementById(txt_id).value = '';
						if(hide)
						{
							document.getElementById(txt_id).style = 'display:none';
							button.style = 'display:none';
						}					
					}
					if(err)
					{
						console.log( err.payload.error.message);
						//if(err.i.payload.data.code == 10)
						{
							alert('Ошибка при изменении. ' + err.payload.error.message);
						}
					}				
				});			 
			}		
		}
		}

	function sendMainComment(button)
{
	sendComment(article.permlink, article.author, 'editor', button, false); 
}

function loadUserCard(login)
{
	viz.api.getAccounts([login], function(err, response){
		//console.log(err, response);
		if(response)
		{
			var ava_base = document.getElementById("avatar");
			var hello = document.getElementById("hello");
			var ava = document.createElement("div");
			if(response[0].json_metadata != 'undefined' && response[0].json_metadata != '{}' && response[0].json_metadata != '')
			{
				var metadata = JSON.parse(response[0].json_metadata);
				if(metadata.profile != 'undefined')
				{
					if(metadata.profile.profile_image != 'undefined')
					{
						ava.style.backgroundImage = "url('https://imgp.golos.io/256x256/"+metadata.profile.profile_image+"')";
						
					}else{
						ava.style.backgroundImage = "url('images/logo.png')";
					}
				}else{
					var ava = document.getElementById("ava");
					ava.style.backgroundImage = "url('images/logo.png')";
				}					
			}else{
				var ava = document.getElementById("ava");

				ava.style.backgroundImage = "url('images/logo.png')";
			}	
			ava.classList.add('ava_div');
			//ava.style.display = 'block';
			ava_base.appendChild(ava);
			//document.getElementById("login_div").style.display = 'none';
		}
	}); 
}

function Init()
{
	if(!isLoggedIn())
	{
		jQuery('#login_div').show();
		jQuery('#feed').hide();
		jQuery('#blog').hide();
		jQuery('#post').hide();
		jQuery('#answer').hide();
		jQuery('#exit').hide();
		jQuery('#options').hide();
	}	
	else
	{
		user.login = localStorage.getItem('login');
		jQuery('#login_div').hide();
		jQuery('#hello').html('Привет, <a href="user.html?author=' + user.login + '" target="_blank">@' + user.login + '</a>');
		getUserPower(user.login);
		
		//check options
		if(localStorage.getItem('open') == 'true')
		{
			jQuery('#x7').hide();
			document.getElementById('x5').classList.remove('col-lg-5');
			document.getElementById('x5').classList.add('col-lg-12');
		}
	}
	//jQuery('#items_list_wrapper').height = window.heigh - 120;	
	//document.getElementById("items_list_wrapper").style.maxHeight = jQuery(window).height() - 120;
	//document.getElementById("items_list_wrapper").height = jQuery(window).height() - 120;
	//console.log(document.getElementById("items_list_wrapper"));
}

function checkLogin(login)
{
	viz.api.getAccounts([login], function(err, response){
		if(response == '')
		{
			document.getElementById('login').value = '';
			return false;
		}
		return true;
	});

}

function storeKeyLocally()
{
	var login = document.getElementById("login").value;
	var key = document.getElementById("key").value;
	if(key && login)
	{
		localStorage.setItem(login, sjcl.encrypt(login, key));
		localStorage.setItem('login', login);
		return true;
	}		
	else
	{
		return false;
	}
}

viz.api.getAccounts([localStorage.getItem('login')], function(err, result){
	var all_shares = parseFloat(result[0].vesting_shares) - parseFloat(result[0].delegated_vesting_shares) + parseFloat(result[0].received_vesting_shares);
var vote_shares = all_shares * 1000000 *2000 / 10000 / 20;

	viz.api.getChainProperties(function(err, result) {
		if (!err) {
var vote_accounting_min_rshares = result.vote_accounting_min_rshares * 5;
var minPercent = 100/(vote_shares / vote_accounting_min_rshares);
var min_percent = minPercent.toFixed();
if (min_percent <=100) {
$('input[name=power]').attr("min", min_percent);
console.log(min_percent);
} else if (min_percent > 100) {
	$('input[type=range]').attr("min", 100);
}
}
		  else console.error(err);
	  });
	});


function getUserPower(login)
{
	var timerId = setInterval(function() {
	
		viz.api.getAccounts([login], function(err, result){
	var power = result[0].energy;//Voting Power последнего апа
	var votetime = Date.parse(result[0].last_vote_time);//время последнего апа
  viz.api.getDynamicGlobalProperties(function(err, result) {  
	var curtime = Date.parse(result.time);//время последнего известного блока чейна
viz.api.getConfig(function(err, config_res) {
var CHAIN_ENERGY_REGENERATION_SECONDS = 10000 / config_res.CHAIN_ENERGY_REGENERATION_SECONDS;

	var volume =(power+((curtime-votetime)/1000)* CHAIN_ENERGY_REGENERATION_SECONDS);//расчет текущей Voting Power
	var charge;	//перемнная для приёма volume и вывода в консоль
	if(volume>=10000)charge=100.00;
	else charge=+(volume/100).toFixed(2); //округление значения volume до второго знака
  
			jQuery('#battery').html( '<a href="#energyHelp" class="btn btn-primary" data-toggle="modal">твоя энергия</a>: ' + charge + '%');
		});
	});
});

}, 3000);
	  jQuery('#avatar').append('<div id="energyHelp" class="modal fade">\
	  <div class="modal-dialog">\
		<div class="modal-content">\
		  <div class="modal-header">\
			<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\
			<h4 class="modal-title">Справка: что такое энергия, и что означает её процент?</h4>\
		  </div>\
		  <div class="modal-body">\
<ol><li>Энергия - показатель в блокчейне VIZ, который уменьшается при оценке постов, создании нового аккаунта и понижении доли (SHARES);</li>\
<li>За сутки восстанавливается 20%;</li>\
<li>На liveblogs.space оценка поста в 100% тратит 1% энергии, т.е. в сутки так, чтобы энергия на следующий день восстановилась, вы можете делать 20 оценок. Если же вы готовы ждать восстановления, например, 5 дней, можете проголосовать 100 раз;</li>\
<li>Между кнопками "оценить на ...%" и флагом есть ещё одна: "Пост - огонь!" - она тратит 20% энергии, т.е. будет она восстанавливаться сутки до прежних значений.</li></ol>\
		  </div>\
		  <div class="modal-footer">\
			<button type="button" class="btn btn-default" data-dismiss="modal">Закрыть</button>\
		  </div>\
		</div>\
	  </div>\
	</div>\
<nav class="navbar navbar-default">\
					<div class="container-fluid">\
						<div class="navbar-header">\
							<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#collapse_navbar" aria-expanded="false">\
								<span class="sr-only">Меню</span>\
								<span class="icon-bar"></span>\
								<span class="icon-bar"></span>\
								<span class="icon-bar"></span>\
							</button>\
<div class="collapse navbar-collapse" id="collapse_navbar">\
<ul class="nav navbar-nav">\
<li class="item-120 default current active" id="blog"><a href="blog.html" >Мой блог</a></li>\
<li class="item-120 default current" id="feed"><a href="following-posts.html" >Посты друзей</a></li>\
<li class="item-120 default current" id="feed"><a href="reblogs.html" >Рекомендации друзей</a></li>\
<li class="item-120 default current" id="post"><a href="post.html" >Новый пост</a></li>\
<li class="item-120 default current" id="wallet"><a href="wallet.html" >Кошелёк</a></li>\
<li class="item-120 default current" id="change_profile"><a href="profile.html" >Изменить профиль</a></li>\
<li class="item-120 default current" id="options" ><a href="options.html">Настройки</a></li><li class="item-120 default current" id="exit" ><a href="#" onClick="localStorage.clear(); location.reload();">Выход</a></li>\
</ul>\
</div>\
						</div>\
					</div>\
					</nav>');

					}

function mainMenu() {
var mainMenuCode = '						<ul class="list-inline text-right">\
	<li class="item-132"><a href="index.html">Новое</a></li>\
	<li class="item-143"><a href="popular.html" >Популярное</a></li>\
						<li class="item-139"><a href="tag.html?tag=академия,образование,обучение,программирование">Обучение</a></li>\
							<li class="item-142"><a href="tag.html?tag=технологии,робототехника,роботы,техника,наука,медицина,знания,гаджеты,смартфоны,nokia,интернет,nvidia">Технологии</a></li>\
							<li class="item-136"><a href="tag.html?tag=еда,рецепт,кулинария,фудблог,суши,kulinarclub,рецепты,фудфото">Еда</a></li>\
							<li class="item-135"><a href="tag.html?tag=поэзия,стихи,творчество,фотография,фото,чернобелоефото,рукоделие,вязание,поэзияфото,проза,рассказ,сказки,handmade">Творчество</a></li>\
							<li class="item-134"><a href="tag.html?tag=btc,bitcoin,блокчейн,токен,ico,bounty,криптовалюта,биткоин,майнинг,token,криптовалюты,altcoin,cryptocurrency,сатоши,bitshares,dex,monero,xmr,монеро,токены">Криптоновости<a></li>\
							<li class="item-137"><a href="tag.html?tag=linux,линукс,pyton,delphi,windows,coding,php,laravel,codecustoms,microsoft,skype,телеком,apple,soft,java,js,javascript,программирование">IT</a></li>\
						</ul>';
      jQuery('#main-menu').html(mainMenuCode);
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function unique(arr) {
  var obj = {};

  for (var i = 0; i < arr.length; i++) {
    var str = arr[i];
    obj[str] = true; // запомнить строку в виде свойства объекта
  }

  return Object.keys(obj); // или собрать ключи перебором для IE8-
}

function isKyr(str) {
    return /[а-яё]/i.test(str);
}

function postBlog(title, tags)
{
	var image = jQuery('#image').val();
	var key = getPostingKey();
	if(!key)
	{
		alert('Не получается найти ваш ключ. Авторизуйтесь еще раз.');
		return;
	}
	if(!user.login)
	{
		alert('Не пойму кто передо мной. Авторизуйтесь еще раз.');
		return;
	}
	if(!title)
	{
		alert('Для публикации нужен заголовок поста.');
		return;
	}
	if(!tags)
	{
		alert('Укажите хотя бы один тэг.');
		return;
	}
	if(!editor.getMarkdown())
	{
		alert('Нужен какой-то текст.');
		return;
	}
	
var full_tags = tags + " liveblogs";
	var t = full_tags.split(' ');
	var t2 = [];
	t.forEach(function(item){
			t2.push(item.toLowerCase().trim());
				
	});
	t2 = unique(t2);
	tags = t2.join('","');
	var new_permlink = title;
	new_permlink = new_permlink.replace(/\s+/g,"-");	
	
	var img = '';
	
	if(image)
	{
		img = ', "image": ["'+image+'"]';
	}
	
	var uniq = Math.round(new Date().getTime() / 1000);
	new_permlink = detransliterate(new_permlink, 1).toLowerCase() + '-' + uniq;
	new_permlink = new_permlink.replace(/[^a-z0-9 -]/g, "").trim();
	console.log(new_permlink, tags, user.login, title, editor.getMarkdown().trim());
	const benecs = [{account: user.login, weight:4000}];
	if(user.login != "denis-skripnik") benecs.push({account: "denis-skripnik", weight:100});
	viz.broadcast.content(key,
			'',
			'',
			user.login,
			new_permlink,
			title.trim(),
			editor.getMarkdown().trim(),
			5000,
			'{"tags":["'+tags+'"], "app": "liveblogs.space", "format": "markdown"'+img+'}',
			[[ 0, {"beneficiaries":benecs} ]],
			function(err, result) {
				if(err)
				{
					console.log(err);
					alert('Произошла ошибка при публикации. ' + err.payload.error.message);
					return;
				}
				if(result)
				{
					alert('Вы успешно опубликовали пост.');
				}
	
			});	
}

function editPostBlog(author, permlink, title, tags)
{
	var image = jQuery('#image').val();
	var key = getPostingKey();
	if(!key)
	{
		alert('Не получается найти ваш ключ. Авторизуйтесь еще раз.');
		return;
	}
	if(!user.login)
	{
		alert('Не пойму кто передо мной. Авторизуйтесь еще раз.');
		return;
	}
	if(!title)
	{
		alert('Для редактирования нужен заголовок поста.');
		return;
	}
	if(!tags)
	{
		alert('Укажите хотя бы один тэг.');
		return;
	}
	if(!editor.getMarkdown())
	{
		alert('Нужен какой-то текст.');
		return;
	}
	
var full_tags = tags + " liveblogs";
	var t = full_tags.split(' ');
	var t2 = [];
	t.forEach(function(item){
			t2.push(item.toLowerCase().trim());
				
	});
	t2 = unique(t2);
	tags = t2.join('","');
	
	var img = '';
	
	if(image)
	{
		img = ', "image": ["'+image+'"]';
	}
	
	console.log(permlink, tags, user.login, title, editor.getMarkdown().trim());
	viz.broadcast.content(key,
			'',
			'',
			author,
			permlink,
			title.trim(),
			editor.getMarkdown().trim(),
			5000,
			'{"tags":["'+tags+'"], "app": "liveblogs.space", "format": "markdown"'+img+'}',
[],
			function(err, result) {
				if(err)
				{
					console.log(err);
					alert('Произошла ошибка при публикации изменений. ' + err.payload.error.message);
					return;
				}
				if(result)
				{
					alert('Вы успешно отредактировали пост.');
				}
	
			});	
}

function pass_gen(){
	let length=100;
	let charset='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-=_:;.,@!^&*$';
	let ret='';
	for (var i=0,n=charset.length;i<length;++i){
		ret+=charset.charAt(Math.floor(Math.random()*n));
	}
	let wif=viz.auth.toWif('',ret,'')
	return wif;
}

function inviteRegPage(new_account_name, invite_secret, new_account_key, private_key) {
	viz.broadcast.inviteRegistration('5KcfoRuDfkhrLCxVcE9x51J6KN9aM9fpb78tLrvvFckxVV6FyFW', 'invite', new_account_name, invite_secret, new_account_key, function(err, result) {
		if (!err) {
		console.log('inviteRegistration', result);
window.alert('Регистрация прошла успешно.\nВаш логин: '+ new_account_name + ',\nВаш ключ: ' + private_key + '\n\nДобро пожаловать! И не забудьте сохранить ваш ключ, так как его нельзя восстановить.')
	}
	else console.error(err);
  	});
}

function accountHistoryCompareDate(a, b)
{
	if(a[1].timestamp > b[1].timestamp)
	{
		return -1;
	}
	else{
		return 1;
	}
}

function fast_str_replace(search,replace,str){
	return str.split(search).join(replace);
}

function date_str(timestamp,add_time,add_seconds,remove_today=false){
	if(-1==timestamp){
		var d=new Date();
	}
	else{
		var d=new Date(timestamp);
	}
	var day=d.getDate();
	if(day<10){
		day='0'+day;
	}
	var month=d.getMonth()+1;
	if(month<10){
		month='0'+month;
	}
	var minutes=d.getMinutes();
	if(minutes<10){
		minutes='0'+minutes;
	}
	var hours=d.getHours();
	if(hours<10){
		hours='0'+hours;
	}
	var seconds=d.getSeconds();
	if(seconds<10){
		seconds='0'+seconds;
	}
	var datetime_str=day+'.'+month+'.'+d.getFullYear();
	if(add_time){
		datetime_str=datetime_str+' '+hours+':'+minutes;
		if(add_seconds){
			datetime_str=datetime_str+':'+seconds;
		}
	}
	if(remove_today){
		datetime_str=fast_str_replace(date_str(-1)+' ','',datetime_str);
	}
	return datetime_str;
}

function walletData() {
active_key = sjcl.decrypt(user.login + '_activeKey', localStorage.getItem('ActiveKey'));

		$('#unblock_form').css("display", "none");
jQuery("#wallet_page").append('<div id="main_wallet_info"></div>');
		viz.api.getAccounts([user.login], function(err, result) {
//  console.log(err, result);
  if (!err) {
    result.forEach(function(item) {
	jQuery("#main_wallet_info").append('<p>Баланс: ' + item.balance + ' и ' + item.vesting_shares + '</p>');
jQuery("#main_wallet_info").append('<a class="tt" onclick="spoiler(\'wallet_actions\'\); return false">(Действия)</a>\
<ul id="wallet_actions" class="terms" style="display: none;"><li><a href="#viz_diposit_modal" class="btn btn-primary" data-toggle="modal">Пополнить счёт</a></li>\
<li><a href="#vesting_withdraw_modal" class="btn btn-primary" data-toggle="modal">Вывод SHARES в VIZ</a></li>\
<li><a href="#viz_transfer_modal" class="btn btn-primary" data-toggle="modal">Перевести VIZ</a></li>\
<li><a href="#vesting_delegate_modal" class="btn btn-primary" data-toggle="modal">Делегировать SHARES</a></li>\
<li><a href="#create_invite_form_modal" class="btn btn-primary" data-toggle="modal">Создать инвайт-код</a></li></ul>\
<div id="viz_diposit_modal" class="modal fade">\
  <div class="modal-dialog">\
    <div class="modal-content">\
      <div class="modal-header">\
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\
        <h4 class="modal-title">Пополнение счёта вашего аккаунта в VIZ</h4>\
      </div>\
      <div class="modal-body">\
<p><strong>Пополнение производится с использованием инвайт-кодов. Получить за фиат или криптовалюту их вы сможете, обратившись к пользователям VIZ, например, к создателю liveblogs.</strong></p>\
	  <div id="action_vesting_diposit"></div>\
      </div>\
      <div class="modal-footer">\
        <button type="button" class="btn btn-default" data-dismiss="modal">Закрыть</button>\
      </div>\
    </div>\
  </div>\
</div>\
<div id="vesting_withdraw_modal" class="modal fade">\
  <div class="modal-dialog">\
    <div class="modal-content">\
      <div class="modal-header">\
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\
        <h4 class="modal-title">Вывод SHARES в VIZ</h4>\
      </div>\
      <div class="modal-body">\
<div id="action_vesting_withdraw"></div>\
      </div>\
      <div class="modal-footer">\
        <button type="button" class="btn btn-default" data-dismiss="modal">Закрыть</button>\
      </div>\
    </div>\
  </div>\
</div>\
<div id="viz_transfer_modal" class="modal fade">\
  <div class="modal-dialog">\
    <div class="modal-content">\
      <div class="modal-header">\
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\
        <h4 class="modal-title">Перевод VIZ на другой аккаунт</h4>\
      </div>\
      <div class="modal-body">\
	  <div id="action_viz_transfer"></div>\
      </div>\
      <div class="modal-footer">\
        <button type="button" class="btn btn-default" data-dismiss="modal">Закрыть</button>\
      </div>\
    </div>\
  </div>\
</div>\
<div id="vesting_delegate_modal" class="modal fade">\
  <div class="modal-dialog">\
    <div class="modal-content">\
      <div class="modal-header">\
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\
        <h4 class="modal-title">Делегирование SHARES</h4>\
      </div>\
      <div class="modal-body">\
<div id="action_vesting_delegate"></div>\
      </div>\
      <div class="modal-footer">\
        <button type="button" class="btn btn-default" data-dismiss="modal">Закрыть</button>\
      </div>\
    </div>\
  </div>\
</div>\
<div id="create_invite_form_modal" class="modal fade">\
  <div class="modal-dialog">\
    <div class="modal-content">\
      <div class="modal-header">\
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\
        <h4 class="modal-title">Создание инвайта</h4>\
      </div>\
      <div class="modal-body">\
<p>Инвайты могут использоваться при регистрации и для перевода в баланс</p>\
	  <div id="create_invite"></div>\
      </div>\
      <div class="modal-footer">\
        <button type="button" class="btn btn-default" data-dismiss="modal">Закрыть</button>\
      </div>\
    </div>\
  </div>\
</div>');

var type = 'received';
viz.api.getVestingDelegations(user.login, '', 100, type, function(err, res) {
  //console.log(err, res);
  if ( ! err) {
var vs_amount = '';
  var body_received_vesting_shares = '';
  res.forEach(function(item) {
      console.log('getVestingDelegations', item);
vs_amount = item.vesting_shares;
	  body_received_vesting_shares = '<tr><td><a href="user.html?author=' + item.delegator + '" target="_blank">@' + item.delegator + '</a></td><td>' + vs_amount + '</td></tr>';
		jQuery("#body_received_vesting_shares").append(body_received_vesting_shares);
	});
 }
  else console.error(err);
});
jQuery("#main_wallet_info").append('<div><p>Делегировали другие пользователи вам <a href="#modal_received_vesting_shares" class="btn btn-primary" data-toggle="modal">' + item.received_vesting_shares + '</a></p>\
<div id="modal_received_vesting_shares" class="modal fade">\
  <div class="modal-dialog">\
    <div class="modal-content">\
      <div class="modal-header">\
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\
        <h4 class="modal-title">Список аккаунтов, которые делегировали SHARES этому пользователю</h4>\
      </div>\
      <div class="modal-body">\
<table id="body_received_vesting_shares"><tr><th>Логин</th><th>Сумма</th></tr></table>\
      </div>\
      <div class="modal-footer">\
        <button type="button" class="btn btn-default" data-dismiss="modal">Закрыть</button>\
      </div>\
    </div>\
  </div>\
</div>\
</div>');
var type = 'delegated';
viz.api.getVestingDelegations(user.login, '', 100, type, function(err, res) {
  //console.log(err, res);
  if ( ! err) {
var vesting_shares_amount = '';
  var body_delegated_vesting_shares = '';
  res.forEach(function(item) {
      console.log('getVestingDelegations', item);
vesting_shares_amount = item.vesting_shares;
	  body_delegated_vesting_shares = '<tr id="delegated_vesting_shares_' + item.delegatee + '"><td><a href="user.html?author=' + item.delegatee + '" target="_blank">@' + item.delegatee + '</a></td><td>' + vesting_shares_amount + '</td><td><input type="button" id="cancel_delegated_vesting_shares_' + item.delegatee + '" value="Отменить делегирование"></td></tr>';
		jQuery("#body_delegated_vesting_shares").append(body_delegated_vesting_shares);
 $('#cancel_delegated_vesting_shares_' + item.delegatee).click(function(){
viz.broadcast.delegateVestingShares(active_key, user.login, item.delegatee, '0.000000 SHARES', function(err, result) {
if (!err) {
window.alert('Делегирование пользователю ' + item.delegatee + ' отменено.');
$('#delegated_vesting_shares_' + item.delegatee).css("display", "none");
} else {
window.alert(err);
}
});
 });
 });
 }
  else console.error(err);
});

jQuery("#main_wallet_info").append('<div><p>Делегировано другим пользователям (Без учёта отменённого) <a href="#modal_delegated_vesting_shares" class="btn btn-primary" data-toggle="modal">' + item.delegated_vesting_shares + '</a></p>\
<div id="modal_delegated_vesting_shares" class="modal fade">\
  <div class="modal-dialog">\
    <div class="modal-content">\
      <div class="modal-header">\
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\
        <h4 class="modal-title">Список аккаунтов, которым вы делегировали SHARES</h4>\
      </div>\
      <div class="modal-body">\
<table id="body_delegated_vesting_shares"><tr><th>Логин</th><th>Сумма</th><th>Отменить делегирование</th></tr></table>\
      </div>\
      <div class="modal-footer">\
        <button type="button" class="btn btn-default" data-dismiss="modal">Закрыть</button>\
      </div>\
    </div>\
  </div>\
</div>\
</div>');

var full_vesting = (parseFloat(item.vesting_shares) - parseFloat(item.delegated_vesting_shares) + parseFloat(item.received_vesting_shares)).toFixed(6);
jQuery("#main_wallet_info").append('<p>Ваша доля (С учётом полученного и переданного), которая влияет на голосование за посты: ' + full_vesting + ' SHARES</p>');

var vesting_withdraw_rate = parseFloat(item.vesting_withdraw_rate);
var nvwithdrawal = Date.parse(item.next_vesting_withdrawal);
var next_vesting_withdrawal = date_str(nvwithdrawal-(new Date().getTimezoneOffset()*60000),true,false,true);
var full_vesting_withdraw = (vesting_withdraw_rate*28).toFixed(6) + ' SHARES';
if (full_vesting_withdraw !== '0.000000 SHARES') {
jQuery("#wallet_page").append('<div id="info_vesting_withdraw"></div>');
jQuery("#info_vesting_withdraw").append('<p>Выводится по ' + vesting_withdraw_rate + ' SHARES 28 дней</p>');
jQuery("#info_vesting_withdraw").append('<p>Следующий вывод: ' + next_vesting_withdrawal + '</p>');
jQuery("#info_vesting_withdraw").append('<p>В конечном итоге вы выведите ' + full_vesting_withdraw + '</p>');
jQuery("#info_vesting_withdraw").append('<p><input type="button" id="cancel_vesting_withdraw" value="Отменить вывод SHARES"></p>');
 $("#cancel_vesting_withdraw").click(function(){
viz.broadcast.withdrawVesting(active_key, user.login, '0.000000 SHARES', function(err, result) {
  if (!err) {
window.alert('Вывод отменён.');
$('#info_vesting_withdraw').css('display', 'none');
  } else {
window.alert(err);
  }
});
}); // end subform
}

 jQuery("#action_vesting_diposit").append('<form>\
<p><label for="invite_secret">Инвайт-код (Начинается с 5):</label></p>\
<p><input type="text" name="invite_secret" id="invite_secret" placeholder="5K..."></p>\
 <p><input type="button" id="action_vesting_diposit_start" value="Пополнить"></p>\
</form>');

 $("#action_vesting_diposit_start").click(function(){
var invite_secret = $('#invite_secret').val();
viz.broadcast.claimInviteBalance(active_key, user.login, user.login, invite_secret, function(err, result) {
if (!err) {
window.alert('Пополнение прошло успешно.');
} else {
window.alert('Ошибка: ' + err);
}
});

}); // end subform

var max_vesting_withdraw = (parseFloat(item.vesting_shares) - parseFloat(item.delegated_vesting_shares) - parseFloat(full_vesting_withdraw)).toFixed(6);
 jQuery("#action_vesting_withdraw").append('<p><strong>Предупреждение: если у вас сейчас уже есть вывод, отправка этой формы сбросит сумму на вывод.</strong></p>');
 jQuery("#action_vesting_withdraw").append('<form>\
<p><label for="vesting_withdraw_amount">Сумма на вывод (<span id="max_vesting_withdraw">Вывести все доступные ' + new Number(parseFloat(max_vesting_withdraw)).toFixed(6) + ' SHARES</span>):</label></p>\
<p><input type="text" name="vesting_withdraw_amount" id="action_vesting_withdraw_amount" placeholder="1.000000"></p>\
 <p><input type="button" id="action_vesting_withdraw_start" value="Начать вывод"></p>\
</form>');
  $("#max_vesting_withdraw").click(function(){
 $('#action_vesting_withdraw_amount').val(new Number(parseFloat(max_vesting_withdraw)).toFixed(6));
  });
 $("#action_vesting_withdraw_start").click(function(){
var action_vesting_withdraw_amount = $('#action_vesting_withdraw_amount').val() + ' SHARES';
viz.broadcast.withdrawVesting(active_key, user.login, action_vesting_withdraw_amount, function(err, result) {
if (!err) {
window.alert('Вывод на ' + action_vesting_withdraw_amount + ' начат.');
} else {
window.alert('Ошибка: ' + err);
}
  });

}); // end subform

 jQuery("#action_viz_transfer").append('<form>\
<p><label for="viz_transfer_to">Кому:</label></p>\
<p><input type="text" name="viz_transfer_to" id="action_viz_transfer_to" placeholder="Введите получателя"></p>\
 <p><label for="viz_transfer_amount">Сумма перевода (<span id="max_vesting_transfer">Перевести все доступные ' + new Number(parseFloat(item.balance)).toFixed(3) + ' VIZ</span>):</label></p>\
<p><input type="text" name="viz_transfer_amount" id="action_viz_transfer_amount" placeholder="1.000"></p>\
<p><label for="viz_transfer_memo">Заметка (описание) к платежу:</label></p>\
<p><input type="text" name="viz_transfer_memo" id="action_viz_transfer_memo" placeholder="Введите memo"></p>\
<p><input type="checkbox" id="transfer_to_vesting"> Перевести в SHARES</p>\
 <p><input type="button" id="action_viz_transfer_start" value="Перевести"></p>\
</form>');

  $("#max_vesting_transfer").click(function(){
 $('#action_viz_transfer_amount').val(new Number(parseFloat(item.balance)).toFixed(3));
  });
 $("#action_viz_transfer_start").click(function(){
 var action_viz_transfer_to = $('#action_viz_transfer_to').val();
 var action_viz_transfer_amount = $('#action_viz_transfer_amount').val() + ' VIZ';
var action_viz_transfer_memo = $('#action_viz_transfer_memo').val();
var transfer_to_vesting = document.getElementById('transfer_to_vesting');

if (transfer_to_vesting.checked) {
viz.broadcast.transferToVesting(active_key, user.login, action_viz_transfer_to, action_viz_transfer_amount, function(err, result) {
if (!err) {
window.alert('Вы перевели ' + action_viz_transfer_amount + ' пользователю ' + action_viz_transfer_to + ' в SHARES.');
} else {
window.alert('Ошибка: ' + err);
}
  });
} else {
viz.broadcast.transfer(active_key, user.login, action_viz_transfer_to, action_viz_transfer_amount, action_viz_transfer_memo, function(err, result) {
if (!err) {
window.alert('Вы перевели ' + action_viz_transfer_amount + ' пользователю ' + action_viz_transfer_to + '.');
} else {
window.alert('Ошибка: ' + err);
}
  });
}
}); // end subform

var max_vesting_deligate = (parseFloat(item.vesting_shares) - parseFloat(item.delegated_vesting_shares)).toFixed(6);
 jQuery("#action_vesting_delegate").append('<form>\
<p><label for="vesting_delegate_to">Кому:</label></p>\
<p><input type="text" name="vesting_delegate_to" id="action_vesting_delegate_to" placeholder="Введите получателя"></p>\
 <p><label for="vesting_delegate_amount">Сумма делегирования (<span id="max_vesting_delegate">Делегировать все доступные ' + new Number(parseFloat(max_vesting_deligate)).toFixed(6) + ' SHARES</span>):</label></p>\
<p><input type="text" name="vesting_delegate_amount" id="action_vesting_delegate_amount" placeholder="1.000000"></p>\
 <p><input type="button" id="action_vesting_delegate_start" value="делегировать"></p>\
</form>');

  $("#max_vesting_delegate").click(function(){
 $('#action_vesting_delegate_amount').val(new Number(parseFloat(max_vesting_deligate)).toFixed(6));
  });
 $("#action_vesting_delegate_start").click(function(){
 var action_vesting_delegate_to = $('#action_vesting_delegate_to').val();
 var action_vesting_delegate_amount = $('#action_vesting_delegate_amount').val() + ' SHARES';
viz.broadcast.delegateVestingShares(active_key, user.login, action_vesting_delegate_to, action_vesting_delegate_amount, function(err, result) {
if (!err) {
window.alert('Вы делегировали ' + action_vesting_delegate_amount + '.');
} else {
window.alert('Ошибка: ' + err);
}
  });

}); // end subform

 jQuery("#create_invite").append('<form>\
 <p><label for="create_invite_balance">Баланс инвайта (<span id="max_invite_balance">В баланс инвайта все доступные ' + new Number(parseFloat(item.balance)).toFixed(3) + ' VIZ</span>):</label></p>\
<p><input type="text" name="create_invite_balance" id="create_invite_amount" placeholder="1.000"></p>\
<p><label for="create_invite_key">Инвайт-код:</label></p>\
<p><input type="button" value="Генерировать" id="new_private_gen"><br>\
<input type="text" name="create_invite_key" id="create_invite_key" readonly placeholder="Сгенерируйте инвайт-код"><br>\
<input type="button" id="new_private_copy" value="Скопировать в буфер обмена"></p>\
 <p><input type="button" id="create_invite_start" value="Создать инвайт"></p>\
</form>');

$("#new_private_gen").click(function(){
	$('#create_invite_key').val(pass_gen());
});

//цепляем событие на onclick кнопки
var button = document.getElementById('new_private_copy');
button.addEventListener('click', function () {
  //нашли наш контейнер
  var ta = document.querySelector('#create_invite_key');
    ta.focus();
    ta.setSelectionRange(0, ta.value.length);
 
  try { 
    document.execCommand('copy'); 
  } catch(err) { 
    console.log('Can`t copy, boss'); 
  } 
  //очистим выделение текста, чтобы пользователь не парился
  window.getSelection().removeAllRanges();
});
  
  $("#max_invite_balance").click(function(){
 $('#create_invite_amount').val(new Number(parseFloat(item.balance)).toFixed(3));
  });
 $("#create_invite_start").click(function(){
 var create_invite_amount = $('#create_invite_amount').val() + ' VIZ';
var create_private_invite_key = $('#create_invite_key').val();
		var create_invite_key = viz.auth.wifToPublic(create_private_invite_key);
viz.broadcast.createInvite(active_key, user.login, create_invite_amount, create_invite_key, function(err, result) {
if (!err) {
jQuery("#create_invite").append('<div id="invite_modal" class="modal fade">\
  <div class="modal-dialog">\
    <div class="modal-content">\
      <div class="modal-header">\
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\
        <h4 class="modal-title">Вы создали инвайт-код</h4>\
      </div>\
      <div class="modal-body">\
<ul><li>Инвайд-код: ' + create_private_invite_key + '</li><li>Вы можете тому, кто пожелает зарегистрироваться, дать эту ссылку: <span id="invite_reg_link">https://liveblogs.space/reg.html?invite=' + create_private_invite_key + '</span><br><input type="button" id="invite_reg_link_copy" value="Скопировать ссылку в буфер обмена"></p></li><li>Баланс: ' + create_invite_amount + '</li></ul>\
      </div>\
      <div class="modal-footer">\
        <button type="button" class="btn btn-default" data-dismiss="modal">Закрыть</button>\
      </div>\
    </div>\
  </div>\
</div>');
    $("#invite_modal").modal('show');

//цепляем событие на onclick кнопки
var button = document.getElementById('invite_reg_link_copy');
button.addEventListener('click', function () {
  //нашли наш контейнер
  var ta = document.getElementById('invite_reg_link'); 
  //производим его выделение
  var range = document.createRange();
  range.selectNode(ta); 
  window.getSelection().addRange(range); 
 
  //пытаемся скопировать текст в буфер обмена
  try { 
    document.execCommand('copy'); 
  } catch(err) { 
    console.log('Can`t copy, boss'); 
  } 
  //очистим выделение текста, чтобы пользователь не парился
  window.getSelection().removeAllRanges();
});
} else {
window.alert('Ошибка: ' + err);
}
  });
}); // end subform

jQuery('#main_wallet_info').append('<div id="witnesses_vote_button"><strong>Проголосовать за создателя проекта liveblogs.space.</strong></div>');
var witness_votes = item.witness_votes;
var witness_votes_count = witness_votes.length;
witness_votes.forEach(function(witness_vote) {
if (witness_votes_count === 2 || witness_vote === 'denis-skripnik') {
$("#witnesses_vote_button").css("display", "none");
} else {
$("#witnesses_vote_button").css("display", "inline");
}
	});

  $("#witnesses_vote_button").click(function(){
viz.broadcast.accountWitnessVote(active_key, user.login, 'denis-skripnik', true, function(err, result) {
if (!err) {
window.alert('Благодарю вас за голос!');
} else {
window.alert('Ошибка: ' + err);
}
});
$("#witnesses_vote_button").css("display", "none");
  });
  
var to = getUrlVars()['to'];
var amount = getUrlVars()['amount'];
var memo = getUrlVars()['memo'];

if (to && amount && memo) {
$(document).ready(function(){
$("#viz_transfer_modal").modal('show');
$('#action_viz_transfer_to').val(to).prop('readonly', true);
$('#action_viz_transfer_amount').val(amount).prop('readonly', true);
$('#action_viz_transfer_memo').val(decodeURIComponent(memo)).prop('readonly', true);
});
} else if (to && memo) {
$(document).ready(function(){
$("#viz_transfer_modal").modal('show');
$('#action_viz_transfer_to').val(to).prop('readonly', true);
$('#action_viz_transfer_memo').val(decodeURIComponent(memo)).prop('readonly', true);
}); 
} else if (amount && memo) {
$(document).ready(function(){
$("#viz_transfer_modal").modal('show');
$('#action_viz_transfer_amount').val(amount).prop('readonly', true);
$('#action_viz_transfer_memo').val(decodeURIComponent(memo)).prop('readonly', true);
});
} else if (to && amount) {
$(document).ready(function(){
$("#viz_transfer_modal").modal('show');
$('#action_viz_transfer_to').val(to).prop('readonly', true);
$('#action_viz_transfer_amount').val(amount).prop('readonly', true);
});
} else if (to) {
$(document).ready(function(){
$("#viz_transfer_modal").modal('show');
$('#action_viz_transfer_to').val(to).prop('readonly', true);
});
} else if (amount) {
$(document).ready(function(){
$("#viz_transfer_modal").modal('show');
$('#action_viz_transfer_amount').val(amount).prop('readonly', true);
});
} else if (memo) {
$(document).ready(function(){
$("#viz_transfer_modal").modal('show');
$('#action_viz_transfer_memo').val(decodeURIComponent(memo)).prop('readonly', true);
});
}

    });
  }
  else console.error(err);
 });

 // История переводов:
 jQuery("#wallet_page").append('<div id="wallet_transfer_history"></div>');
 viz.api.getAccountHistory(user.login, -1, 10000, function(err, result) {
 if (!err) {
  jQuery("#wallet_transfer_history").append('<h2>История переводов средств</h2>\
  <table id="transfer_history_table"><tr><th>Дата и время платежа</th>\
<th>От кого</th>\
<th>Кому</th>\
<th>Сумма</th>\
<th>memo (Заметка)</th></tr>');
			result.sort(accountHistoryCompareDate);
 result.forEach(function(item) {
var get_time = Date.parse(item[1].timestamp);
var transfer_datetime = date_str(get_time-(new Date().getTimezoneOffset()*60000),true,false,true);

        var op = item[1].op;
var from = op[1].from;
var to = op[1].to;
var amount = op[1].amount;
var memo = op[1].memo;

	   if (from && to && amount && memo) {
  jQuery("#transfer_history_table").append('<tr class="' + from + '"><td>' + transfer_datetime + '</td>\
<td><a href="user.html?author=' + from + '" target="_blank">@' + from + '</a></td>\
<td><a href="user.html?author=' + to + '" target="_blank">@' + to + '</a></td>\
<td>' + amount + '</td>\
<td>' + memo + '</td>\
  </tr>');

  

  }
  });
  jQuery("#wallet_transfer_history").append('</table>');

	} else {
window.alert('Ошибка: ' + err);
}
 });
 }

			function walletAuth() {
			let active = $('#this_active').val();
var isSaveActive = document.getElementById('isSaveActive');
			if (isSaveActive.checked) {
		localStorage.setItem('ActiveKey', sjcl.encrypt(user.login + '_activeKey', active));
			}
			if (localStorage.getItem('ActiveKey')) {
		var isActiveKey = sjcl.decrypt(user.login + '_activeKey', localStorage.getItem('ActiveKey'));
jQuery("#wallet_page").append('<p align="center"><a onclick="localStorage.removeItem(\'ActiveKey\'\)">Удалить активный ключ</a></p>');
} else {
var isActiveKey = active;
}

			var resultIsActiveWif = viz.auth.isWif(isActiveKey);
console.log(resultIsActiveWif);
			if (resultIsActiveWif === true) {
			active_key = isActiveKey;
window.alert('Вы успешно вошли в кошелёк.');
} else {
window.alert('Активный ключ имеет неверный формат. Пожалуйста, попробуйте ещё раз.');
}

			if (active_key === '') {
$('#unblock_form').css("display", "block");
$('#unblock_form').html('<p><label for="active">Введите приватный активный ключ (Если регистрировались по инвайту, он совпадает с постинг ключом, при помощи которого авторизовались в liveblogs.space). Внимание: он никуда не передаётся, все операции выполняются у вас на компьютере, в вашем браузере.</label></p>\
<p><input type="password" name="active" id="this_active"></p>\
<p><input type="checkbox" id="isSaveActive"> Сохранить активный ключ</p>\
<p align="center"><input type="button" value="Войти в кошелёк" onclick="walletAuth();"></p>');
} else if (active_key !== '' && user.login) {
walletData();
}

			} // end walletAuth

function loadOptions()
{
	if(localStorage.getItem('open') == 'true')
	{
		document.getElementById('open').checked = true;
	}
	else
	{
		document.getElementById('open').checked = false;
	}
	if(localStorage.getItem('node'))
	{
		document.getElementById('node').value = localStorage.getItem('node');
	}
}

function saveOptions()
{
	if(document.getElementById('open').checked)
	{
		localStorage.setItem('open', true);
	}
	else
	{
		localStorage.setItem('open', false);
	}
	if(document.getElementById('node').value != '')
	{
		localStorage.setItem('node', document.getElementById('node').value);
	}
	else
	{
		localStorage.setItem('node', 'wss://testnet.viz.world/');
	}
	alert('Настройки сохранены');
}