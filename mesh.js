// mesh.js

GLOBAL = {
    compassToAngle: {
        'w': 3 * 60,
        'nnw': 2 * 60,
        'nne': 60,
        'e': 0,
        'sse': 5 * 60,
        'ssw': 4 * 60
    },
};

function getActor(tile) {
    console.log("Get actor for:", tile);
    let attributes = tile.getAttribute('class').split(' ');
    let actor = {
        compass: 'e'
    };
    for (let attribute of attributes) {
        console.log('Attribute:', attribute);
        if (attribute.startsWith('arrow-')) {
            let compass = attribute.substring(6);
            console.log('Compass:', compass);
            actor.compass = compass;
        } else if (attribute.startsWith('actor-')) {
            actor.name = attribute;
        }
    }
    if (actor.name) {
        actor.angle = GLOBAL.compassToAngle[actor.compass];
        console.log('Actor:', actor);
        return actor;
    } else {
        return undefined;
    }
}

function setActor(tile, actor) {
    let htmlClass = 'tile ' + actor.name + ' arrow-' + actor.compass;
    tile.setAttribute('class', htmlClass);
}

function onClick(event) {
    let target = event.target;
    let actor = getActor(target);
    console.log('On click:', target, actor);
    if (!actor) {
        return;
    }
    let newAngle = (actor.angle + 60) % 360;
    actor.angle = newAngle;
    actor.compass = GLOBAL.angleToCompass[newAngle];
    setActor(target, actor);
}

function onLoad() {
    console.log("On load event handler")

    GLOBAL.angleToCompass = {};
    for (let compass of Object.keys(GLOBAL.compassToAngle)) {
        let angle = GLOBAL.compassToAngle[compass];
        console.log("Compass:", compass);
        GLOBAL.angleToCompass[angle] = compass;
    }
    console.log("Angle to compass:", GLOBAL.angleToCompass);

    let board = document.getElementById("board")
    console.log("Board", board);
    GLOBAL.board = [];
    for (let boardChildEntry of board.childNodes.entries()) {
//        console.log("Board child entry:", boardChildEntry);
        let boardChild = boardChildEntry[1];
        if (boardChild.nodeName.toLowerCase() === 'div') {
            console.log("Board child:", boardChild, boardChild.nodeName);
            let row = [];
            for (let rowChildEntry of boardChild.childNodes.entries()) {
                let rowChild = rowChildEntry[1];
                if (rowChild.nodeName.toLowerCase() === 'div') {
                    rowChild.addEventListener('click', onClick);
                    row.push(rowChild);
                }
            }
            GLOBAL.board.push(row);
        }
    }
    console.log("Board:", GLOBAL.board);
    // let tile = GLOBAL.board[0][1];
    // console.log("Tile:", tile, getActor(tile));
    // tile.addEventListener('click', onClick);
}

console.log("Script mesh.js loaded");
