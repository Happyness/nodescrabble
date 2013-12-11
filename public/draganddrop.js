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
    //ev.dataTransfer.setData('text/html', ev.target.outerHTML);
    ev.dataTransfer.setData('Text', ev.target.getAttribute('id'));
    //ev.dataTransfer.setData("Text", ev.target.id);
}

function dragEnd(event)
{
    ev.preventDefault();
    if (event.dataTransfer.dropEffect == 'move') {
        // remove the dragged element
        event.target.parentNode.removeChild(event.target);
    }
}

function drop(ev)
{
    ev.preventDefault();
    var data = ev.dataTransfer.getData('Text');
    //console.log(data);
    //ev.target.appendChild(data);
    //ev.target.appendChild(data);
    //var data = ev.dataTransfer.getData('Text');

    ev.target.appendChild(document.getElementById(data));
    //ev.stopPropagation();
}