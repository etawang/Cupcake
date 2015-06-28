var numHoursPreviousToSearch = 2;
var showSimilarSites = true;
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
    urlList.push([item.url, item.visitCount, item.title]);
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
    var entry = document.createElement('div');
    entry.className = "failure";
    entry.appendChild(document.createTextNode("Similar sites is turned off"));
    list.appendChild(entry);
  }

  buildMostPopularPagesDOM();
  buildMostVisitedPagesDOM(urlList);
}

function buildMostPopularPagesDOM() {
    var list = document.getElementById("most-popular-list");
    list.appendChild(buildPageDOM("http://www.google.com", "Google")); 
    list.appendChild(buildPageDOM("http://www.facebook.com", "Facebook")); 
    list.appendChild(buildPageDOM("http://www.youtube.com", "Youtube")); 
    list.appendChild(buildPageDOM("http://www.baidu.com", "Baidu")); 
    list.appendChild(buildPageDOM("http://www.yahoo.com", "Yahoo")); 
    list.appendChild(buildPageDOM("http://www.amazon.com", "Amazon")); 
    list.appendChild(buildPageDOM("http://www.wikipedia.com", "Wikipedia")); 
    list.appendChild(buildPageDOM("http://www.qq.com", "QQ")); 
    list.appendChild(buildPageDOM("http://www.taobao.com", "Taobao")); 
    list.appendChild(buildPageDOM("http://www.twitter.com", "Twitter")); 
}

function buildMostVisitedPagesDOM(urlList) {
  urlList.sort(function(first, second) {
    return second[2] > first[1];
  });

  var list = document.getElementById("most-visited-list");
  for (var i = 0; i < Math.min(10, urlList.length); i++) {
    var page = urlList[i]; 
    var entry = buildPageDOM(page[0], page[2]);
    list.appendChild(entry);
  }
}

function buildSimilarSitesDOM(urlList, websiteTable){
  var similarSiteList = getSimilarSites(urlList, websiteTable);
  var list = document.getElementById("similar-list");
  if (!similarSiteList){
    var entry = document.createElement('div');
    entry.className = "failure";
    entry.appendChild(document.createTextNode("Daily query limit exceeded"));
    list.appendChild(entry);
  }
  for (var i = 0; i < similarSiteList.length; i++) {
    var fullurl = "http://" + similarSiteList[i][0];
    var entry = buildPageDOM(fullurl, similarSiteList[i][0]);
    list.appendChild(entry);
  }
}

function buildPageDOM(url, title){
  var entry = document.createElement('div');
  entry.className = "page";
  var newLink = document.createElement('a');
  var favicon = new Image();
  favicon.onerror = function() {
    this.onerror = null;
    this.src = "img/icon.png";
  };
  favicon.src = getHttpHostname(url) + "favicon.ico";
  newLink.appendChild(favicon);
  newLink.setAttribute("href", url);
  entry.appendChild(newLink);
  var content = document.createElement('div');
  content.className = "content";
  content.innerHTML = "<p>" + title + "</p>\n" + "<p>" + url + "</p>\n"
  entry.appendChild(content);
  return entry;
}

function getSimilarSites(urlList, websiteTable){
var similarSiteScores = {};
for (var i = 0; i < 10 && i < urlList.length; i++){
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

// e.g., "http://www.stackoverflow.com"
function getHttpHostname(url) {
  return "http://" + getFullHostname(url) + "/";
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

function buildTopRecentlyVisited(urlList){
  var list = document.getElementById("recent-list");
  for (var i = 0; i < urlList.length; i++) {
    var fullurl = urlList[i][0];
    var entry = buildPageDOM(fullurl, urlList[i][1]);
    list.appendChild(entry);
  }
}

function sampleTen(hostBinning, props) {
  var hostItems = hostBinning;
  var urlList = [];
  while (urlList.length < 10 && props.length > 0) {
    var host = props.pop()[0];
    if (host == "thisapp_total") {
      continue;
    }
    var histItems = hostItems[host];
    for (var i = 0; i < Math.min(histItems.length, 3); i++) {
      var title = histItems[i].title;
      if (!title) {
        title = "";
      }
      urlList.push([histItems[i].url, title]);
    }
  }
  buildTopRecentlyVisited(urlList);
}

// Returns proportions of visits that have been made in last 2 hours.
function getProportion(hostBinning, acc) {
  // Milliseconds
  /* for (var host in acc) {
    if (acc.hasOwnProperty(host)) {
      var total = 0;
      var count = 0;
      for (var i = 0; i < acc[host].length; i++) {
        var visitTime = acc[host][i].visitTime;
        if (visitTime < 
            (curDate - 60 * 60 * 1000 * numHoursPreviousToSearch)) {
              continue;
            }
        if (visitTime && visitTime > recency) {
          count++;
        }
        total++;
      }
      props[host] = count / total;
    }
  } */
  var props = [];
  var total = acc["thisapp_total"];
  for (var host in acc) {
    if (acc.hasOwnProperty(host)) {
      props.push([host, acc[host] / total]);
    }
  }
  console.log(props);
  props.sort(function (first, second) {
    first[1] - second[1];
  });

  sampleTen(hostBinning, props);
}

function visitRecentProportion(host, visitItems, hostBins, acc) {
  if (hostBins[1].length == 0) {
    getProportion(hostBins[0], acc);
    return;
  }

  var curDate = (new Date).getTime();
  var recency = curDate - (0.5 * 60 * 60 * 1000);
  if (host == "") {
    acc["thisapp_total"] = 0;
    var item = hostBins[1].pop();
    chrome.history.getVisits({url: item[1].url}, function (vitems) {
      visitRecentProportion(item[0], vitems, hostBins, acc)
    });
    return;
  }

  if (!acc[host]) {
    acc[host] = 0;
  }
  for (var i = 0; i < visitItems.length; i++) {
    var visitTime = visitItems[i].visitTime;
    if (visitTime < 
        (curDate - 60 * 60 * 1000 * numHoursPreviousToSearch)) {
          continue;
        }
    if (visitTime && visitTime > recency) {
      acc[host]++;
      acc["thisapp_total"]++;
    }
  }

  var item = hostBins[1].pop();
  chrome.history.getVisits({url: item[1].url}, function (vitems) {
    visitRecentProportion(item[0], vitems, hostBins, acc)
  });
}

function groupURLs(historyItems) {
  hostBinning = {}
  for (var i = 0; i < historyItems.length; i++) {
    var host = getHostname(historyItems[i].url);
    if (hostBinning[host]) {
      hostBinning[host].push(historyItems[i]);
    } else {
      hostBinning[host] = [historyItems[i]];
    }
  }

  hostBinList = [];
  for (var host in hostBinning) {
    if (hostBinning.hasOwnProperty(host)) {
      for (var i = 0; i < hostBinning[host].length; i++) {
        var item = hostBinning[host][i];
        hostBinList.push([host, item]);
      }
    }
  }
  return [hostBinning, hostBinList];
}

function topRecentlyVisited(historyItems) {
  // signals: recency of visit, /* time spent on a site, similarity to open tabs, */
  // whether domain has been visited more than usual in the past couple hours
  var itemsByDomain = groupURLs(historyItems);
  visitRecentProportion("", [], itemsByDomain, {});
}

document.addEventListener('DOMContentLoaded', function(){
  getHistory("test_div", bin);
  getHistory("test_div", topRecentlyVisited);
});

