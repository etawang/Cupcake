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

// Assumes list - change to other objects if necessary
function buildHistoryListsDOM(divName, elements){
  var list = document.getElementById(divName);
  for (var i = 0; i < elements.length; i++) {
    var entry = document.createElement('li');
    entry.className = "page";
    var newLink = document.createElement('a');
    newLink.appendChild(document.createTextNode(elements[i].title));
    newLink.setAttribute("href", elements[i].url);
    entry.appendChild(newLink);
    list.appendChild(entry);
  }
}

function processHistoryItemsAndBuildList(historyItems){
  var results = processHistoryItems(historyItems);
  buildHistoryListsDOM("pages-list", results);
}

// do any necessary filtering
function processHistoryItems(historyItems) {
  var results = [];
  for (var i = 0; i < historyItems.length; i++) {
    var title = historyItems[i].title;
    if (title) {
      results.push({title:title, url:historyItems[i].url});
    } else {
      results.push({title:historyItems[i].url, url: historyItems[i].url});
    }
  }
  return results;
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

  var availableIconList = { facebook: 'facebook.png', google: 'google.png'};
  var iconList = document.getElementById("icon-container");
  for (var i = 0; i < 7; i++) { 
      if (i >= items.length) {
          break;
      }
      var icon = document.createElement('div');
      icon.className = "icon";
      var img = document.createElement('img');
      if (items[i][0] in availableIconList) {
        img.setAttribute('src', items[i][0] + '.png');
      } else {
        img.setAttribute('src', 'lemon_cupcake.jpg');
      }
      img.setAttribute('alt', items[i][0]);

      var visitCountDiv = document.createElement('div');
      visitCountDiv.className = "text";
      var visitCount = document.createElement('div');
      visitCount.className = "visits-text";
      visitCount.appendChild(document.createTextNode(items[i][1] + " Pages"));
      // TODO: consider displaying visits instead of pages
      visitCountDiv.appendChild(visitCount);
      icon.appendChild(img);
      icon.appendChild(visitCountDiv);
      var name = document.createElement('div');
      name.className = "name";
      name.appendChild(document.createTextNode(items[i][0]));
      icon.appendChild(name);
      iconList.appendChild(icon);
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

document.addEventListener('DOMContentLoaded', function(){
  getHistory("icon-container", bin); 
});

