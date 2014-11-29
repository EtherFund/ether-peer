/*
- ether.peers.js v0.1
- Display peers of the Ethereum network discovered by Etherface.
- http://ether.fund/tool/peers
- (c) 2014 J.R. Bédard (jrbedard.com)
*/


// Init
$(function () {

	// todo: from url hash
	getPeers();
	
	// FILTER option click
	$("#filterPeers li a").click(function(e) {
		e.preventDefault();
		var filter = $(this).data('val');
		$("#filterPeers .btn").html($(this).text()+" <span class='caret'></span>");
		$("#filterPeers .btn").val(filter);
		getPeers();
		return true;
	});
	
	// SORT option click
	$("#sortPeers li a").click(function(e) {
		e.preventDefault();
		var sort = $(this).data('val');
		$("#sortPeers .btn").html($(this).text()+ " <span class='caret'></span>");
		$("#sortPeers .btn").val(sort);
		getPeers();
		return true;
	});
	
	// PAGINATION next page, prev page clicks
	$("#pagination a").click(function(e) {
		getPeers();
	});
	
});


function getPeers() {
	var args = {};
	args.filter = $("#filterPeers .btn").data('val');
	args.sort = $("#sortPeers .btn").data('val');
	args.start = 0;
	args.range = 10;
	
	// todo: greyingout + loading animation;
	
	// get peers
	etherface.peer('list', args, function(peers) {
		// todo: stop animation;
		//console.log(peers);
		updateTable(peers);
		
		var peer = peers[0];
		$("#lastCrawl").text(peer.last_crawl);
		$("#lastCrawl").attr('title',peer.last_crawl);
		$("#lastCrawl").attr('datetime',peer.last_crawl);
		$("#lastCrawl").timeago(); // WTF??
		
		var analytics = peers;
		updateCharts(analytics);
	});
};



// display peers in table
function updateTable(peers) {
	var table = $("#peerTable tbody");
	table.html("");
	
	$.each(peers, function(p) {
		var peer = peers[p];
		console.log(peer);
		
		var line = "<tr><td title='"+peer.id+"'>"+peer.clientId+"</td><td><span>"+peer.ip+"<span>:"+peer.port+"</td>";
		
		line += "<td><a target='_blank' href='http://www.google.com/maps/place/"+peer.ll[0]+","+peer.ll[1]+"'><i class='fa fa-map-marker fa-lg'></i></a> "+getGeoStr(peer)+"</td>";
		
		line += "<td><abbr>"+peer.last_crawl+'</abbr></td>';
		
		line += "<td>"+peer.capabilities+"</td>";
		
		line += '</tr>';
		
		table.append(line);
	});
}


// display analytics chart
function updateCharts(analytics) {
	var chart = $("#peerChart");
	// todo: charts
}





