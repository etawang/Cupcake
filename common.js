var numHoursPreviousToSearch = 1;
function getHistory(callback, searchQuery) {
  var microsecondsPerHour = 1000 * 60 * 60;
  var startTime = (new Date).getTime() - microsecondsPerHour * numHoursPreviousToSearch;

  if (!searchQuery){
    searchQuery = "";
  }

  var numRequestsOutstanding = 0;

  chrome.history.search({
    'text': searchQuery,
    'startTime': startTime,
    }, callback);
}

function bin(historyItems, sortOrder) {
  if (typeof(sortOrder) === 'undefined') sortOrder="visits";

  var urlList = [];
  for (var i = 0; i < historyItems.length; i++) {
    var item = historyItems[i];
    urlList.push([item.url, item.visitCount]);
  }
  var numURLs = binURLs(urlList);

  // Sort hosts by number of visits
  var items = Object.keys(numURLs).map(function(key) {
        return [key, numURLs[key][1]];
  });

  var sortFn;
  if (sortOrder == "visits") {
    sortFn = function(first, second) {
      return second[1] > first[1];
    }
  } else if (sortOrder == "alpha") {
    sortFn = function(first, second) {
      return first[0] > second[0];
    }
  }
  items.sort(sortFn);

  for (var i = 0; i < items.length; i++) {
    var host = items[i][0];
    items[i][1] = numURLs[host][0];
  }
  return items;
}

// e.g., "www.stackoverflow.com"
function getFullHostname(url) {
  var a = $('<a>', { href:url } )[0];
  return a.hostname
}

// e.g., "stackoverflow"
function getHostname(url) {
  var fullHost = getFullHostname(url);
  var lastDot = fullHost.lastIndexOf(".");
  var slice = fullHost.slice(0, lastDot);
  lastDot = slice.lastIndexOf(".");
  if (lastDot == -1) {
    return slice;
  }
  return slice.slice(lastDot + 1);
}

function binURLs(urlList) {
  hostBinning = {}
  for (var i = 0; i < urlList.length; i++) {
    var url = urlList[i][0];
    var visits = urlList[i][1];
    var host = getHostname(url);
    if (hostBinning[host]) {
      var numUrls = hostBinning[host][0] + 1;
      var numVisits = hostBinning[host][1] + visits;
      hostBinning[host] = [numUrls, numVisits];
    } else {
      hostBinning[host] = [1, visits];
    }
  }
  return hostBinning;
}

function stripQueryParams(url) {
  var i = url.lastIndexOf('?');
  return url.slice(0, i);
}
