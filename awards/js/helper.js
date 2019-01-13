var viz_login = '';
var posting_key = '';

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

viz.config.set("websocket", "http://140.82.37.172")

var award_target = getUrlVars()['target'];
var award_energy = getUrlVars()['energy'];
var custom_sequence = getUrlVars()['custom_sequence'];
var memo = getUrlVars()['memo'];
var beneficiaries = getUrlVars()['beneficiaries'];
var redirect = getUrlVars()['redirect'];
var benef = beneficiaries.split(',');
var benef_list = [];
benef.forEach(function (el) {
var b = el.split(':');
var benef_login = b[0];
var benef_percent = +b[1]*100;
benef_list.push({account:benef_login,weight:benef_percent});
});


function awardAuth() {
			let login = $('#this_login').val();
			let posting = $('#this_posting').val();
var isSavePosting = document.getElementById('isSavePosting');
			if (isSavePosting.checked) {
		localStorage.setItem('login', login);
			localStorage.setItem('PostingKey', sjcl.encrypt(login + '_postingKey', posting));
			}
			if (localStorage.getItem('PostingKey')) {
		var isPostingKey = sjcl.decrypt(login + '_postingKey', localStorage.getItem('PostingKey'));
} else {
var isPostingKey = posting;
}

			var resultIsPostingWif = viz.auth.isWif(isPostingKey);
console.log(resultIsPostingWif);
			if (resultIsPostingWif === true) {
viz_login = login;
			posting_key = isPostingKey;
} else {
window.alert('Постинг ключ имеет неверный формат. Пожалуйста, попробуйте ещё раз.');
}

			if (login === '' && posting_key === '') {
$('#unblock_form').css("display", "block");
$('#unblock_form').html('<p><label for="viz_login">Введите логин в VIZ: </label></p>\
<p><input type="text" name="viz_login" id="this_login"></p>\
<p><label for="posting">Введите приватный постинг ключ (Начинается с 5). Внимание: он никуда не передаётся, все операции выполняются у вас на компьютере, в вашем браузере.</label></p>\
<p><input type="password" name="posting" id="this_posting"></p>\
<p><input type="checkbox" id="isSavePosting"> Сохранить логин и Постинг ключ</p>\
<p align="center"><input type="button" value="Войти для отправки award" onclick="walletAuth();"></p>');
}

			} // end awardAuth


viz_login = localStorage.getItem('login');
	const postingKey = localStorage.getItem('PostingKey');
	posting_key = postingKey ? sjcl.decrypt(viz_login + '_postingKey', postingKey) : $('#this_posting').val();

if (viz_login && posting_key) {
  $('#unblock_form').css("display", "none");
	viz.broadcast.award(posting_key,viz_login,award_target,award_energy*100,custom_sequence,memo,benef_list,function(err,result){
if (!err) {
if (redirect) {
	window.location.href = redirect;
} else {
viz.api.getAccounts([viz_login], function (err, res) {
$('#account_energy').html(res[0].energy/100 + '%');
});

	jQuery("#main_award_info").css("display", "block");
	$('#main_award_info').html('<h1>Результат:</h1>\
<p><strong>Вы успешно отправили аворд.</strong></p>\
<ul><li>Направление: ' + award_target + '</li>\
<li>Затрачиваемый процент энергии: ' + award_energy + '%</li>\
<li>Номер Custom операции (С каждой операцией он увеличивается в get_accounts): ' + custom_sequence + '</li>\
<li>Заметка (Memo, описание; назначение может быть любым): ' + decodeURIComponent(memo) + '</li>\
<li>Бенефициары: ' + JSON.stringify(beneficiaries) + '</li>\
<li>Осталось энергии на момент последнего аворда: <span id="account_energy"></span></li>\
</ul>');
}
}
});
} else {
  $('#unblock_form').css("display", "block");
  $('#delete_posting_key').css("display", "none");
}