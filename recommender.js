var showSimilarSites = false;

function similarSites(historyItems) {
  bin(historyItems);
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

function sampleTen(hostBinning, props) {
  var hostItems = hostBinning[0];
  var urlList = [];
  while (urlList.length < 10 && props.length > 0) {
    var host = props.pop();
    var histItems = hostItems[host];
    for (var i = 0; i < Math.min(histItems.length, 3); i++) {
      var title = histItems[i].title;
      if (!title) {
        title = host;
      }
      urlList.push([histItems[i].url, title]);
    }
  }
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
  var props = {};
  var total = acc["thisapp_total"];
  for (var host in acc) {
    if (acc.hasOwnProperty(host)) {
      props[host] = acc[host] / total;
    }
  }
  console.log(props);
  props.sort(function (first, second) {
    first[1] > second[1];
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
  getHistory(function (h) { topRecentlyVisited(h, 'visits') });
});

