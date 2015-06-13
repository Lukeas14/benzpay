<?
	
	//search places
	$q= $_GET['q'];

	$appID = 'evalLunne37Ciwejfare7';
	$appCode = 'RrEcE54Hc6U2VGp70LqoQQ';

	$str = file_get_contents('https://places.demo.api.here.com/places/v1/discover/search?at=37.7942%2C-122.4070&q='.$q.'&app_id=evalLunne37Ciwejfare7&app_code=RrEcE54Hc6U2VGp70LqoQQ
');
	$json = json_decode($str, true);

	/////get parking spaces
	$str = file_get_contents('https://parking-v2.cit.cc.api.here.com/parking/facilities.json?app_id='.$appID.'&app_code='.$appCode.'&prox='.$currentGeo.'');
	$json = json_decode($str, true);

	/////get gas stations
	$str = file_get_contents('https://fuel-v2.cit.cc.api.here.com/fuel/stations.json?app_id='.$appID.'&app_code='.$appCode.'&prox='.$currentGeo.'');
	$json = json_decode($str, true);

	/////get ev stations
	$str = file_get_contents('https://ev-v2.cit.cc.api.here.com/ev/stations.json?app_id='.$appID.'&app_code='.$appCode.'&prox='.$currentGeo.'');
	$json = json_decode($str, true);

?>