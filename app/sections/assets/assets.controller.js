(function () {
    'use strict';

    angular.module('app.assets')
        .controller('assetsCtrl', ['$scope', '$filter', '$routeParams', '$location', '$http', 'orderByFilter', 'appConfig', 'utilities', assetsCtrl]);

    function assetsCtrl($scope, $filter, $routeParams, $location, $http, orderByFilter, appConfig, utilities) {

		var path = $location.path();
		var name = $routeParams.name;
		if(name) {
		    name = name.toUpperCase();
            if(path.includes("assets")) {
                var block_num = "";
                var virtual_op = "";
                var trx_in_block = "";
                var op_in_trx = "";
                var result = [];
                var type = "";
                //var raw = "";
                $http.get(appConfig.urls.python_backend + "/get_asset_and_volume?asset_id=" + name)
                    .then(function(response) {
                        var type;
                        var description;
                        if(response.data[0].issuer === "1.2.0") {
                            description = response.data[0].options.description;
                            type = "SmartCoin";
                        }
                        else {
                            var description_p = response.data[0].options.description.split('"');
                            description = description_p[3];
                            type = "User Issued";
                        }
                        if(response.data[0].symbol === "BTS") {
                            type = "Core Token";
                        }

                        var long_description = false;
                        try {
                            if (description.length > 100) {
                                long_description = true;
                            }
                        }
                        catch(err) { }
                        $http.get(appConfig.urls.python_backend + "/get_asset_holders_count?asset_id=" + name)
                            .then(function(response2) {
                                var name_lower = response.data[0].symbol.replace("OPEN.", "").toLowerCase();
                                var url = "images/asset-symbols/"+name_lower+".png";
                                var image_url = "";

                                $http({
                                    method: 'GET',
                                    url: url
                                }).then(function successCallback(response3) {
                                    image_url = "images/asset-symbols/"+name_lower+".png";

                                    $scope.data = {
                                        symbol: response.data[0].symbol,
                                        id: response.data[0].id,
                                        description: description,
                                        long_description: long_description,
                                        max_supply: utilities.formatBalance(response.data[0].options.max_supply, response.data[0].precision),
                                        issuer: response.data[0].issuer,
                                        precision: response.data[0].precision,
                                        current_supply: utilities.formatBalance(response.data[0].current_supply, response.data[0].precision),
                                        confidential_supply: utilities.formatBalance(response.data[0].confidential_supply, response.data[0].precision),
                                        holders: response2.data,
                                        issuer_name: response.data[0].issuer_name,
                                        accumulated_fees: utilities.formatBalance(response.data[0].accumulated_fees, response.data[0].precision),
                                        fee_pool: utilities.formatBalance(response.data[0].fee_pool, response.data[0].precision),
                                        type: type,
                                        image_url: image_url,
                                        volume: parseInt(response.data[0].volume),
                                        market_cap: response.data[0].mcap/100000
                                    };
                                }, function errorCallback(response3) {
                                    if(type === "SmartCoin") {
                                        image_url = "images/asset-symbols/white.png";
                                    }
                                    else {
                                        image_url = "images/asset-symbols/white.png";
                                    }

                                    $scope.data = {
                                        symbol: response.data[0].symbol,
                                        id: response.data[0].id,
                                        description: description,
                                        long_description: long_description,
                                        max_supply: utilities.formatBalance(response.data[0].options.max_supply, response.data[0].precision),
                                        issuer: response.data[0].issuer,
                                        precision: response.data[0].precision,
                                        current_supply: utilities.formatBalance(response.data[0].current_supply, response.data[0].precision),
                                        confidential_supply: utilities.formatBalance(response.data[0].confidential_supply, response.data[0].precision),
                                        holders: response2.data,
                                        issuer_name: response.data[0].issuer_name,
                                        accumulated_fees: utilities.formatBalance(response.data[0].accumulated_fees, response.data[0].precision),
                                        fee_pool: utilities.formatBalance(response.data[0].fee_pool, response.data[0].precision),
                                        type: type,
                                        image_url: image_url,
                                        volume: parseInt(response.data[0].volume),
                                        market_cap: response.data[0].mcap/100000
                                    };
                                });
                            });

                            var markets = [];
                            $http.get(appConfig.urls.python_backend + "/get_markets?asset_id=" + name)
                                .then(function(response) {
                                    angular.forEach(response.data, function(value, key) {
                                        var parsed = {pair: value[1], price: value[3], volume: value[4]};
                                        markets.push(parsed);
                                    });
                                    $scope.markets = markets;
                                });
                            var accounts = [];
                            $http.get(appConfig.urls.python_backend + "/get_asset_holders?asset_id=" + name)
                                .then(function(response_ah) {
                                    angular.forEach(response_ah.data, function(value, key) {
                                        var parsed = {name: value.name, amount: utilities.formatBalance(value.amount, response.data[0].precision), id: value.account_id};
                                        accounts.push(parsed);
                                    });
                                    $scope.accounts = accounts;
                                });
                    });
            }

            utilities.columnsort($scope, "volume", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
            utilities.columnsort($scope, "amount", "sortColumn2", "sortClass2", "reverse2", "reverseclass2", "column2");

		}
		else {
			var init;
            if(path === "/assets") {

                $http.get(appConfig.urls.python_backend + "/get_dex_total_volume")
                    .then(function(response) {
                        //console.log(response);

                        var parsed = {volume_bts: response.data["volume_bts"], volume_cny: response.data["volume_cny"], volume_usd: response.data["volume_usd"],
                            market_cap_bts: response.data["market_cap_bts"].toString().slice(0, -12), market_cap_cny: response.data["market_cap_cny"].toString().slice(0, -12), market_cap_usd: response.data["market_cap_usd"].toString().slice(0, -12)};
                        $scope.dynamic = parsed;

                    });

                $scope.dex_volume_chart = {};
                $http.get(appConfig.urls.python_backend + "/daily_volume_dex_dates")
                    .then(function(response) {
                        $http.get(appConfig.urls.python_backend + "/daily_volume_dex_data")
                            .then(function(response2) {

                                $scope.dex_volume_chart.options = {
                                    animation: true,
                                    title : {
                                        text: 'Daily DEX Volume in BTS for the last 30 days'
                                    },
                                    tooltip : {
                                        trigger: 'axis'
                                    },
                                    toolbox: {
                                        show : true,
                                        feature : {
                                            saveAsImage : {show: true, title: "save as image"}
                                        }
                                    },

                                    xAxis : [
                                        {
                                            boundaryGap : true,
                                            data : response.data
                                        }
                                    ],
                                    yAxis : [
                                        {
                                            type : 'value',
                                            scale:true,
                                            axisLabel : {
                                                formatter: function(value)
                                                {
                                                        return value/1000000 + "M";
                                                }
                                            }
                                        }
                                    ],
                                    calculable : true,
                                    series : [
                                        {
                                            name:'Volume',
                                            type:'bar',
                                            itemStyle: {
                                                normal: {
                                                    color: 'green',
                                                    borderColor: 'green'

                                                }
                                            },
                                            data: response2.data
                                        }
                                    ]
                                };
                            });
                    });

                $http.get(appConfig.urls.python_backend + "/assets")
                    .then(function(response) {
                        var assets = [];
                        var name = "";
                        angular.forEach(response.data, function(value, key) {
                            var market_cap;
                            var supply;
                            if(value[1].indexOf("OPEN") >= 0 || value[1].indexOf("RUDEX") >= 0) {
                                market_cap = "-";
                                supply = "-";
                            }
                            else {
                                market_cap = Math.round(value[5]/100000); // in bts always by now
                                var precision = 100000;
                                if(value[10]) {
                                    precision = Math.pow(10, value[10]);
                                }
                                supply = Math.round(value[7]/precision);
                            }
                            var volume = Math.round(value[4]);
                            var name_lower = value[1].replace("OPEN.", "").toLowerCase();
                            var url = "images/asset-symbols/"+name_lower+".png";
                            var image_url = "";

                            $http({
                                method: 'GET',
                                url: url
                            }).then(function successCallback(response) {
                                image_url = "images/asset-symbols/"+name_lower+".png";
                                var parsed = {name: value[1], image_url: image_url, id: value[2], price: value[3], volume: volume, type: value[6], market_cap: market_cap, supply: supply, holders: value[8]};
                                assets.push(parsed);
                            }, function errorCallback(response) {
                                if(type === "SmartCoin") {
                                    image_url = "images/asset-symbols/white.png";
                                }
                                else {
                                    image_url = "images/asset-symbols/white.png";
                                }
                                var parsed = {name: value[1], image_url: image_url, id: value[2], price: value[3], volume: parseInt(volume), type: value[6], market_cap: market_cap, supply: supply, holders: value[8]};
                                assets.push(parsed);
                            });
                        });
                        $scope.assets = assets;
                    });
			}

            utilities.columnsort($scope, "volume", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
		}
    }

})();
