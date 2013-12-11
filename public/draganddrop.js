function dragEnter(ev)
{
    ev.preventDefault();
}

function allowDrop(ev)
{
    ev.preventDefault();
    ev.dataTransfer.effectAllowed = 'move';
}

function drag(ev)
{
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData('text/html', ev.target.innerHTML);
    //ev.dataTransfer.setData('Text', ev.target.getAttribute('id'));
    //ev.dataTransfer.setData("Text", ev.target.id);
}

function dragEnd(event)
{
    if (event.dataTransfer.dropEffect == 'move') {
        // remove the dragged element
        event.target.parentNode.removeChild(event.target);
    }
}

function drop(ev)
{
    var data = ev.dataTransfer.getData('text/html');
    console.log(data);
    ev.target.innerHTML = data;
    //ev.target.appendChild(data);
    //var data = ev.dataTransfer.getData('Text');

    //ev.target.appendChild(document.getElementById(data));
    ev.stopPropagation();
}