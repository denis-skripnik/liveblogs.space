var d = /\s+/g,
    //rus = "щ	ш	ч	ц	ю	ю	я	я  ые	ий	ё	ё	ж	ъ	э	ы	а	б	в	г	д	е	з	и	й	к	л	м	н	о	п	р	с	т	у	ф	х	х   ь".split(d),
    //eng = "sch	sh	ch	cz	yu	ju	ya	q  yie	iy	yo	jo	zh	w	ye	y	a	b	v	g	d	e	z	i	yi	k	l	m	n	o	p	r	s	t	u	f	x	h	j".split(d);

    rus = "щ    ш  ч  ц  й  ё  э  ю  я  х  ж  а б в г д е з и к л м н о п р с т у ф ъ  ы ь".split(d),
    eng = "shch sh ch cz ij yo ye yu ya kh zh a b v g d e z i k l m n o p r s t u f xx y x".split(d);

function detransliterate(str, reverse) {
    if (!reverse && str.substring(0, 4) !== 'ru--') return str
    if (!reverse) str = str.substring(4)

    // TODO rework this
    // (didnt placed this earlier because something is breaking and i am too lazy to figure it out ;( )
    if(!reverse) {
    //    str = str.replace(/j/g, 'ь')
    //    str = str.replace(/w/g, 'ъ')
        str = str.replace(/yie/g, 'ые')
    }
    else {
    //    str = str.replace(/ь/g, 'j')
    //    str = str.replace(/ъ/g, 'w')
        str = str.replace(/ые/g, 'yie')
    }

    var i,
        s = /[^[\]]+(?=])/g, orig = str.match(s),
        t = /<(.|\n)*?>/g, tags = str.match(t);

    if(reverse) {
        for(i = 0; i < rus.length; ++i) {
            str = str.split(rus[i]).join(eng[i]);
            str = str.split(rus[i].toUpperCase()).join(eng[i].toUpperCase());
        }
    }
    else {
        for(i = 0; i < rus.length; ++i) {
            str = str.split(eng[i]).join(rus[i]);
            str = str.split(eng[i].toUpperCase()).join(rus[i].toUpperCase());
        }
    }

    if(orig) {
        var restoreOrig = str.match(s);

        for (i = 0; i < restoreOrig.length; ++i)
            str = str.replace(restoreOrig[i], orig[i]);
    }

    if(tags) {
        var restoreTags = str.match(t);

        for (i = 0; i < restoreTags.length; ++i)
            str = str.replace(restoreTags[i], tags[i]);

        str = str.replace(/\[/g, '').replace(/\]/g, '');
    }

    return str;
}

function showQuery(operation)
{
	var metadata = JSON.parse(operation.json_metadata);
	var main_div = document.createElement("div");
	main_div.classList.add("col-xs-12","q_wrapper");
	if(metadata.image)
	{
		var image = metadata.image[0];
	}
	else
	{
		var image = '/components/com_q/noimage.png';
	}
	var img_div = document.createElement("div");
	img_div.classList.add("img_div");
	main_div.appendChild(img_div);
	img_div.style.backgroundImage = "url('"+image+"')";
	
	var q_div = document.createElement("div");
	q_div.classList.add("q_div");
	main_div.appendChild(q_div);
	
	var title = operation.title;
	var author = operation.author;
	var created = operation.created;
	var last_update = operation.last_update;
	var total_payout_value = operation.total_payout_value;
	var total_pending_payout_value = operation.total_pending_payout_value;
	var curation_percent = operation.curation_percent;
	var votes = operation.active_votes;

	var a_div = document.createElement("div");
	a_div.classList.add("a_div");
	main_div.appendChild(a_div);
	
	var replies = 0;
	viz.api.getContentReplies(operation.author, operation.permlink, function(err, result) {
		console.log(err, result);
		replies = result.length;		
	});
	
	
	a_div.innerHTML = "<div style='font-size: 12px; background-image:url(\"images/messages.png\");'><strong>"+replies+"</strong></div>";
	
	var tags = '';
	if(typeof metadata.tags !=="undefined")
	{
		var tags_count = metadata.tags.length;
		
		for(var i = 0;i < tags_count;i++)
		{
			if(tags_count > 1)
			{
				tags = tags + " <span class='label label-warning'><a href='index.php?option=com_q&view=tag&tag=" + metadata.tags[i] + "'>"+detransliterate(metadata.tags[i], 0)+'</a></span>';
			}
		}
	}	
	
	var date = new Date(created);
	var dt = date.toLocaleDateString("ru-RU") + ' ' + date.toLocaleTimeString("ru-RU");
	
	q_div.innerHTML = '<div class="q_header_wrapper"><h3><a href="index.php'+'?'+'option=com_q&'+'view=item&user='+author+'&plink='+operation.permlink+'">'+ title + '</a></h3></div>' +  dt +' - Автор: <a href="index.php'+'?'+'option='+'com_q&'+'view'+'=userq'+'&user='+ author +'" title="Все вопросы пользователя">@' + author + '</a>' + '<br/> <button onclick="ajaxVote(\''+operation.permlink+'\');" type="button" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-heart text-info"></span></button> Голосов <strong>' + votes.length + '</strong> на сумму <strong>' + total_pending_payout_value + '</strong> Процент кураторам: <strong>' + curation_percent/100 + '</strong><br/>' + tags;
	
	var clearFix = document.createElement("div");
	clearFix.classList.add("clearFix");
	main_div.appendChild(clearFix);
	
	return main_div;
}