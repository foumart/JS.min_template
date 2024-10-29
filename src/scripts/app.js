(function() {
	return new Promise(resolve => resolve());
})().then(e => init());

function init() {
	const _div = document.createElement('div');
	_div.innerHTML = '<div style="color:aqua;text-align:center;margin:20px">Ready!</div>';
	document.body.appendChild(_div);
}