function sortAlphabetical() {
  $(".icon").remove();
  getHistory(function(h) { displayBubbles("icon-container", h, "alpha") });
}

function sortVisits() {
  $(".icon").remove();
  getHistory(function(h) { displayBubbles("icon-container", h, "visits") });
}

function showIcons(divName, items, sortOrder) {
  var availableIconList = { facebook: 'facebook.png', google: 'google.png'};
  var iconList = document.getElementById(divName);
  for (var i = 0; i < 7; i++) { 
      if (i >= items.length) {
          break;
      }
      var icon = document.createElement('div');
      icon.className = "icon";
      var a = document.createElement('a');
      a.href = "chrome-extension://" + chrome.runtime.id + "/list.html?host=" + items[i][0];
      var img = document.createElement('img');
      if (items[i][0] in availableIconList) {
        img.setAttribute('src', 'img/' + items[i][0] + '.png');
      } else {
        img.setAttribute('src', 'img/lemon_cupcake.jpg');
      }
      img.setAttribute('alt', items[i][0]);

      var visitCountDiv = document.createElement('div');
      visitCountDiv.className = "text";
      var visitCount = document.createElement('div');
      visitCount.className = "visits-text";
      visitCount.appendChild(document.createTextNode(items[i][1] + " Pages"));
      // TODO: consider displaying visits instead of pages
      visitCountDiv.appendChild(visitCount);
      a.appendChild(img);
      a.appendChild(visitCountDiv);
      icon.appendChild(a);
      var name = document.createElement('div');
      name.className = "name";
      name.appendChild(document.createTextNode(items[i][0]));
      icon.appendChild(name);
      iconList.appendChild(icon);
  }
}

function displayBubbles(divName, historyItems, sortOrder) {
  var items = bin(historyItems);
  showIcons(divName, items);
}

document.addEventListener('DOMContentLoaded', function(){
  getHistory(function(h) { displayBubbles("icon-container", h) });
});

