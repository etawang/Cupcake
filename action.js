var numHoursPreviousToSearch = 1;
function getHistory(divName, callback) {
  var microsecondsPerHour = 1000 * 60 * 60;
  var startTime = (new Date).getTime() - microsecondsPerHour * numHoursPreviousToSearch;

  var numRequestsOutstanding = 0;

  chrome.history.search({
    'text': '',
    'startTime': startTime
    }, callback);
}

function processHistoryItems(historyItems) {
  for (var i = 0; i < historyItems.length; i++) {
    var title = historyItems[i].title;
    if (title) {
      console.log(historyItems[i].title)
    } else {
      console.log(historyItems[i].url)
    }
  }
}

function bin(historyItems) {
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

  items.sort(function(first, second) {
    return second[1] > first[1]; 
  });

  for (var i = 0; i < items.length; i++) {
    var host = items[i][0];
    items[i][1] = numURLs[host][0];
  }
  console.log(items);
  return items;
}

function getHostname(url) {
  var a = $('<a>', { href:url } )[0];
  return a.hostname
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

document.addEventListener('DOMContentLoaded', function(){
  getHistory("test_div", bin);
});

