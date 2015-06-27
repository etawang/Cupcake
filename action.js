function showIcons(divName, items) {
  var availableIconList = { facebook: 'facebook.png', google: 'google.png'};
  var iconList = document.getElementById(divName);
  for (var i = 0; i < 6; i++) { //TODO: change to 8
      if (i >= items.length) {
          break;
      }
      var icon = document.createElement('div');
      icon.className = "icon";
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
      icon.appendChild(img);
      icon.appendChild(visitCountDiv);
      iconList.appendChild(icon);
  }
}


function displayBubbles(divName, historyItems) {
  var items = bin(historyItems);
  showIcons(divName, items);
}

document.addEventListener('DOMContentLoaded', function(){
  getHistory(function(h) { displayBubbles("icon-container", h) });
});

