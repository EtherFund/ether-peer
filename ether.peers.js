/*
- ether.peers.js v0.1
- Display peers of the Ethereum network discovered by Etherface.
- http://ether.fund/tool/peers
- (c) 2014 J.R. Bédard (jrbedard.com)
*/


// Init
$(function() {
	
	// peer loading spinner...
	$("#peerTable tbody").append("<tr><td id='loadingPeers' style='text-align:center;' colspan=5><i class='fa fa-spinner fa-spin fa-2x'></i> Loading...</td></tr>");
	
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
		
		$(".timeago").timeago();
		$(".tooltip").tooltip({});
		
		// Clicked globe id
		$(".peerId").click(function(e) {
			e.preventDefault();
			console.log($(this).attr('title'));
			//$(this).html($(this).attr('title'));
			return false;
		});
	});
	
	
	// get analytics
	etherface.analytics('peers', {}, function(data) {
		$("#lastCrawl").text(data.lastCrawl);
		$("#lastCrawl").attr('title',data.lastCrawl);
		$("#lastCrawl").addClass('timeago');
		$(".timeago").timeago();
		
		$("#peerCount").text(data.peerCount);
		$("#newPeerCount").text(data.newPeerCount);
		//console.log(data);
		
		// Analytics
		updateCharts(data);
	});
	
};



// display peers in table
function updateTable(peers) {
	var table = $("#peerTable tbody");
	table.html("");
	
	$.each(peers, function(p) {
		var peer = peers[p];
		//console.log(peer);
		
		var line = "<tr><td>";
		
		line += "<span>"+peer.ip+"<span>:"+peer.port+'<br>';
		
		line += "<a class='peerId' class='tooltip' href='#' title="+peer.id+"><i class='fa fa-globe'></i></a></td>";
		
		line += (peer.clientId ? "<td>"+peer.clientId+'<br>' : "<td><i>Unknown</i>");
		
		line += (peer.protocolVersion ? "Protocol version "+peer.protocolVersion+"</td>" : "</td>");
		
		line += "</td><td><a target='_blank' href='http://www.google.com/maps/place/"+peer.ll[0]+","+peer.ll[1]+"'><i class='fa fa-map-marker fa-lg'></i></a> "+getGeoStr(peer)+"</td>";
		
		line += "<td><abbr class='timeago' title='"+peer.last_crawl+"'>"+peer.last_crawl+'</abbr></td>';
		
		line += "<td>";
		if(peer.capabilities) { 
			//console.log(peer.capabilities);
			$.each(peer.capabilities, function(cap,num) {
				line += cap+':'+num+'<br>';
			});
		} else {
			line += "<i>Unknown</i></td>";
		}
		line += '</tr>';
		
		table.append(line);
	});
}


// display analytics chart
function updateCharts(data) {	

	//clientsChart(data);
	
	worldMapPeers(data);
	
	//console.log(data);
}



// Client Pie Chart
function clientsChart(data) {
	//console.log(data.clients);
	
	// Create the chart
	$('#clientsChart').highcharts({
		chart: {
		    type: 'pie'
		},
		title: {
		    text: 'Ethereum clients market share.'
		},
		subtitle: {
			text: 'For <b>'+data.peerCount+' peers</b> crawled in the last hour.'// Click the slices to view versions.'
		},
		plotOptions: {
		    series: {
		        dataLabels: {
		            enabled: true,
		            format: '{point.name}: {point.percentage:.1f}%'
		        }
		    }
		},
		tooltip: {
		    headerFormat: '<span style="font-size:11px">Ethereum client:</span><br>',
		    pointFormat: '<span style="color:{point.color}">{point.name}</span><br><b>{point.percentage:.2f}%</b> of total ({point.y} of '+data.peerCount+')<br/>'
		},
		series: [{
		    name: 'Clients',
		    colorByPoint: true,
			data: data.clients,
		}],
		drilldown: {
		    //series: drilldownSeries
		}
	});
}



// World Peers
function worldMapPeers(analytics) {
	//console.log(analytics.countries);
	var data = analytics.countries;
	console.log(data);
	
    // Base path to maps
    var baseMapPath = "http://code.highcharts.com/mapdata/",
        showDataLabels = false, // Switch for data labels enabled/disabled
        mapCount = 0,
        searchText,
        mapOptions = '';

	
    // Populate dropdown menus and turn into jQuery UI widgets
    $.each(Highcharts.mapDataIndex, function (mapGroup, maps) {
        if (mapGroup !== "version") {
            mapOptions += '<option class="option-header">' + mapGroup + '</option>';
            $.each(maps, function(desc, path) {
                mapOptions += '<option value="' + path + '">' + desc + '</option>';
                mapCount += 1;
            });
        }
    });
    searchText = 'Select one of ' + mapCount + ' maps';
    mapOptions = '<option value="custom/world.js">' + searchText + '</option>' + mapOptions;
    $("#mapDropdown").append(mapOptions);//.combobox();
	
	
    // Change map when item selected in dropdown
    $("#mapDropdown").change(function () {
        var $selectedItem = $("option:selected", this),
            mapDesc = $selectedItem.text(),
            mapKey = this.value.slice(0, -3),
            svgPath = baseMapPath + mapKey + '.svg',
            geojsonPath = baseMapPath + mapKey + '.geo.json',
            javascriptPath = baseMapPath + this.value,
            isHeader = $selectedItem.hasClass('option-header');

        // Dim or highlight search box
        if(mapDesc === searchText || isHeader) {
            $('.custom-combobox-input').removeClass('valid');
            location.hash = '';
        } else {
			$('.custom-combobox-input').addClass('valid');
			location.hash = mapKey;
        }

        if(isHeader) {
            return false;
        }

        // Show loading
        if($("#countryMap").highcharts()) {
            $("#countryMap").highcharts().showLoading('<i class="fa fa-spinner fa-spin fa-2x"></i>');
        }


        // When the map is loaded or ready from cache...
        function mapReady() {

            var mapGeoJSON = Highcharts.maps[mapKey];
            var parent = null;
			var match = null;

			console.log(mapGeoJSON);
			//console.log(Highcharts.geojson);
			
            // Is there a layer above this?
            match = mapKey.match(/^(countries\/[a-z]{2}\/[a-z]{2})-[a-z0-9]+-all$/);
            if (/^countries\/[a-z]{2}\/[a-z]{2}-all$/.test(mapKey)) { // country
				parent = {desc: 'World', key: 'custom/world'};
				
			} else if (match) { // admin1
				parent = {
                    desc: $('option[value="' + match[1] + '-all.js"]').text(),
                    key: match[1] + '-all'
                };
            }
            $('#up').html('');
            if(parent) {
                $('#up').append(
                    $('<a href="#"><i class="fa fa-angle-up"></i> ' + parent.desc + '</a>')
                        .attr({
                            title: parent.key
                        })
                        .click(function () {
                            $('#mapDropdown').val(parent.key + '.js').change();
                        })
                );
            }

			//console.log(mapGeoJSON);
			
            // Instantiate chart
            $("#countryMap").highcharts('Map', {
				chart : {
                	borderWidth:0
            	},
                title: {
                    text: "Ethereum Peer Locations"
                },
				subtitle: {
					text: 'For <b>'+analytics.peerCount+' peers</b> crawled in the last hour.'// Click country to drill down.'
				},
                mapNavigation: {
                    enabled: false
                },
                colorAxis: {
                    min: 0,
                    stops: [
                        [0, '#EFEFFF'],
                        [0.5, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).brighten(-0.5).get()]
                    ]
                },
                legend: {
					enabled: false,
                    layout: 'vertical',
                    align: 'left',
                    verticalAlign: 'bottom'
                },
                series: [{
                    mapData: mapGeoJSON,
                    joinBy: ['hc-key', 'key'],
					data: data,
                    name: 'Peers located in',
                    states: {
                        hover: {
                            color: Highcharts.getOptions().colors[2]
                        }
                    },
                    dataLabels: {
                        enabled: false,
                        formatter: function () {
                            return mapKey === 'custom/world' || mapKey === 'countries/us/us-all' ?
								(this.point.properties && this.point.properties['hc-a2']) : this.point.name;
                        }
                    },
                    point: {
                        events: {
                            // On click, look for a detailed map
                            /*
							click: function () {
                                var key = this.key;
                                $('#mapDropdown option').each(function () {
                                    if (this.value === 'countries/' + key.substr(0, 2) + '/' + key + '-all.js') {
                                        $('#mapDropdown').val(this.value).change();
                                    }
                                });
                            }
							*/
                        }
                    }
                }
				/*
				, {
                    type: 'mapline',
                    name: "Separators",
                    data: data, //Highcharts.geojson(mapGeoJSON, 'mapline'),
                   	nullColor: 'gray',
                    showInLegend: false,
                    enableMouseTracking: false
                }*/ ]
            });
            showDataLabels = $("#chkDataLabels").attr('checked');
        }

        // Check whether the map is already loaded, else load it and then show it async
        if(Highcharts.maps[mapKey]) {
            mapReady();
        } else {
            $.getScript(javascriptPath, mapReady);
        }
    });
	
	/*
	// Toggle data labels - Note: Reloads map with new random data
	$("#chkDataLabels").change(function () {
		showDataLabels = $("#chkDataLabels").attr('checked');
		$("#mapDropdown").change();
	});

	// Trigger change event to load map on startup
	if(location.hash) {
		$('#mapDropdown').val(location.hash.substr(1) + '.js');
	} else { // for IE9
		$($('#mapDropdown option')[0]).attr('selected', 'selected');
	}
	*/
	$('#mapDropdown').change();
}



