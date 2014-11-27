/*
- ether.peers.js v0.1
- Display peers of the Ethereum network discovered by Etherface.
- http://ether.fund/tool/peers
- (c) 2014 J.R. Bédard (jrbedard.com)
*/

var gPeerFilter = {};
var gPeerSort = {};


// Init
$(function () {

	// todo: from url hash

	// get peers
	etherface.peer('list', {}, function(peers) {
		console.log(peers);
		updateTable(peers);
		//updateChart(peers);
	});
	
	// listen to sort/filter input events
	
	//$("#filterPeers a").click
	
	//$("#sortPeers a").click
});



// display peers in table
function updateTable(peers) {
	var table = $("#peerTable tbody");
	table.html("");
	
	$.each(peers, function(p) {
		var peer = peers[p];
		console.log(peer);
		
		var line = "<tr><td>Name</td><td><span>"+peer.publicIp+"<span>:"+peer.port+"</td>";
		
		// <td>"+peer.id+"</td>
		
		line += '<td>'+getGeoStr(peer)+'</td>';
		
		line += '</tr>';
		
		table.append(line);
	});
}


// display peers in chart
function updateChart(peers) {
	var chart = $("#peerChart");
	// todo
}
