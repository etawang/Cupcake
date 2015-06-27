var numHoursPreviousToSearch = 1;
var showSimilarSites = false;
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
  var websiteTable = {}
  for (var i = 0; i < historyItems.length; i++) {
    var item = historyItems[i];
    urlList.push([item.url, item.visitCount]);
    websiteTable[getFullHostname(item.url)] = item.visitCount;
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
  if (showSimilarSites){
    buildSimilarSitesDOM(urlList, websiteTable);
  } else {
    var list = document.getElementById("similar-list");
    var entry = document.createElement('li');
    entry.className = "failure";
    entry.appendChild(document.createTextNode("Similar sites is turned off"));
    list.appendChild(entry);
  }
}


function buildSimilarSitesDOM(urlList, websiteTable){
  var similarSiteList = getSimilarSites(urlList, websiteTable);
  var list = document.getElementById("similar-list");
  if (!similarSiteList){
    var entry = document.createElement('li');
    entry.className = "failure";
    entry.appendChild(document.createTextNode("Daily query limit exceeded"));
    list.appendChild(entry);
  }
  for (var i = 0; i < similarSiteList.length; i++) {
    var entry = document.createElement('li');
    entry.className = "recommendation";
    var newLink = document.createElement('a');
    newLink.appendChild(document.createTextNode(similarSiteList[i][0]));
    newLink.setAttribute("href", "http://" + similarSiteList[i][0]);
    entry.appendChild(newLink);
    list.appendChild(entry);
  }
}

function getSimilarSites(urlList, websiteTable){
  var similarSiteScores = {};
  for (var i = 0; i < 5 && i < urlList.length; i++){
    var similarSites = getSimilarSiteForSite(getFullHostname(urlList[i][0]));
    if (similarSites.status === "daily query limit exceeded"){
      return false;
    }
    if (similarSites.num != 0){
      var url = removeHttp(similarSites.r0);
      if (!(url in websiteTable)){
        if (url in similarSiteScores)
          similarSiteScores[url] += 1;
        else
          similarSiteScores[url] = 1;
      }
    }
  }
  var similarSiteList = [];
  for (url in similarSiteScores){
    similarSiteList.push([url, similarSiteScores[url]]);
  }
  similarSiteList.sort(function(first, second) {
    return second[1] > first[1];
  });
  return similarSiteList.slice(0, 10);
}

function getSimilarSiteForSite(sitelink){
  var xmlhttp = new XMLHttpRequest();
  var url = "http://www.similarsitesearch.com/api/similar/";
  /*xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var results = JSON.parse(xmlhttp.responseText);
      displayResults(results);
    }
  }*/
  xmlhttp.open("GET", url + sitelink, false);
  xmlhttp.send();
  return JSON.parse(xmlhttp.responseText);
}

// http://www.stackoverflow.com -> www.stackoverflow.com
function removeHttp(url){
  return url.split("://").pop();
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

function topRecentlyVisited() {
  // positive signals: recency of visit, (time spent on a site,) similarity to open tabs
  // negative signals: 
}

document.addEventListener('DOMContentLoaded', function(){
  getHistory("test_div", bin);
});

