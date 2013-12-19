function dragEnter(ev)
{
    ev.preventDefault();
    return true;
}

function allowDrop(ev)
{
    ev.preventDefault();
    ev.dataTransfer.effectAllowed = 'move';
}

function drag(ev)
{
    if (ev.target.className == 'played-tile') {
        return false;
    }
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData('Text', ev.target.getAttribute('id'));
}

function drop(ev)
{
    ev.preventDefault();
    var data = ev.dataTransfer.getData('Text');

    if (ev.target.getAttribute('id') == 'tiles') {
        ev.target.appendChild(document.getElementById(data));
        document.getElementById(data).className = "tile";
    } else {
        var element = document.getElementById(data);
        if (element.getAttribute('id') != ev.target.getAttribute('id') && element.className != 'played-tile'
            && ev.target.innerHTML == "") {

            element.className = "move-tile";
            ev.target.appendChild(element);
        }
    }
    ev.stopPropagation();
}