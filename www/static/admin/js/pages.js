/**
*分页
*/
function pages(pagerData){
	var options ={
	      	desc: true, //show description
	     	pageNum: 2,
	     	url: 'javascript:""', //page url, when not set, it will auto generated
	      	class: 'nomargin', //pagenation extra class
	      	text: {
		        next: '下一页',
		        prev: '上一页',
		        total: '电影数量: ${count} , 总页数: ${pages}'
	      	}
	    }
  	var currentPage = pagerData.data.currentPage | 0 || 1;

  	var html = `<ul class="pagination">`;
  	if(options.class){
    	html = `<ul class="pagination ${options.class}">`;
  	}
  	if(options.desc){
    	var total = options.text.total.replace('${count}', pagerData.data.count).replace('${pages}', pagerData.data.totalPages);
    	html += `<li class="disabled"><span>${total}</span></li>`;
  	}
  	if(currentPage > 1){
    	html += `<li class="prev"><a href="javascript:;">${options.text.prev}</a></li>`;
  	}

  	var pageIndex = getPageIndex(pagerData.data, options);
  	if(pageIndex[0] > 1){
    	html += `<li><a href="javascript:;">1</a></li>`;
  	}
  	if(pageIndex[0] > 2){
    	html += `<li class="disabled"><span>...</span></li>`;
  	}

  	for (var i = 0, length = pageIndex.length; i < length; i++) {
    	var p = pageIndex[i];
    	if (p === currentPage) {
      		html += `<li class="active"><a href="javascript:;">${p}</a></li>`;
    	} else { 
      		html += `<li><a href="javascript:;">${p}</a></li>`;
    	}
  	}
  	if (pageIndex.length > 1) {
    	var last = pageIndex[pageIndex.length - 1];
    	if (last < (pagerData.data.totalPages - 1)) { 
      		html += `<li class="disabled"><span>...</span></li>`;
    	}
    	if (last < pagerData.data.totalPages) { 
      		html += `<li><a href="javascript:;">${pagerData.data.totalPages}</a></li>`;
    	}
  	}
  	if (currentPage < pagerData.data.totalPages) {
    	html += `<li class="next"><a href="javascript:;">${options.text.next}</a></li>`;
  	}
  	return html;
}
function getPageIndex(pagerData){
	var options={
		desc: true, //show description
	     	pageNum: 2,
	     	url: 'javascript:""', //page url, when not set, it will auto generated
	      	class: 'nomargin', //pagenation extra class
	      	text: {
		        next: '下一页',
		        prev: '上一页',
		        total: '电影数量: ${pagerData.count} , 总页数: ${pagerData.totalPages}'
	      	}
		}
  	var num = options.pageNum || 2;
  	var page = pagerData.currentPage | 0 || 1;
  	var totalPages = pagerData.totalPages;
  	var pageIndex = [];
  	var start = page - num;
  	var stop = page + num;

  	if(start <= 1) {
    	start = 1;
    	stop = start + num * 2 + 1;
  	}

  	if(stop >= totalPages) {
	    stop = totalPages;
	    start = totalPages - num * 2 - 1;
  	}

  	for (var i = start; i <= stop; i++) {
    	if (i >= 1 && i <= totalPages) {
      		pageIndex.push(i);
    	}
  	}
  	return pageIndex;
};