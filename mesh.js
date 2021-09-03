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
    compassToOffsets: {
        'w': { dx: -2, dy: 0 },
        'nnw': { dx: -1, dy: -1 },
        'nne': { dx: 1, dy: -1 },
        'e': { dx: 2, dy: 0 },
        'sse': { dx: 1, dy: 1 },
        'ssw': { dx: -1, dy: 1 }
    },
    keyToCompass: {
        'h': 'w',
        'u': 'nnw',
        'i': 'nne',
        'k': 'e',
        'm': 'sse',
        'n': 'ssw',
        'a': 60,
        'w': 0,
        's': 180,
        'd': -60
    },
};

function rotate(compass, angle) {
    let newAngle = mod(GLOBAL.compassToAngle[compass] + angle, 360);
    console.log('Rotate:', compass, angle, newAngle);
    return GLOBAL.angleToCompass[newAngle];
}

function revert(compass) {
    return rotate(compass, 180);
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

function positionToIndices(position) {
    let x = position.x;
    let y = position.y;
    let board = GLOBAL.board;
    let row_index = mod(y, board.length);
    let row = board[row_index];
    let col_index = mod(Math.floor(x / 2), row.length - 1) + (mod(row_index, 2) > 0 ? 0 : 1);
    return {
        'row': row_index,
        'col': col_index
    };
}

function indicesToPosition(indices) {
    let fudge = mod(indices.row, 2) > 0 ? 0 : 1;
    return {
        'x': (2 * indices['col']) - fudge,
        'y': indices['row']
    };
}

function normalizePosition(position) {
    return indicesToPosition(positionToIndices(position));
}

function step(position, compass) {
    let x = position.x;
    let y = position.y;
    let offsets = GLOBAL.compassToOffsets[compass];
    return normalizePosition({
        'x': x + offsets['dx'],
        'y': y + offsets['dy']
    });
}

function getTile(position) {
    let indices = positionToIndices(position);
    let tile = GLOBAL.board[indices.row][indices.col];
    console.log("Get tile:", position, indices, tile);
    return tile;
}

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

function setActor(tile, actor, markerCompass) {
    let markerClass = (actor ? ' arrow-' + actor.compass : (markerCompass ? ' arrow-' + markerCompass : '')) + (markerCompass ? ' mark' : '');
    let htmlClass = 'tile' + (actor ? ' ' + actor.name: '') + markerClass;
    tile.setAttribute('class', htmlClass);
}

function reorient() {
    document.getElementById("view").className = 'rotate-' + GLOBAL.compass;
    console.log("Global position:", GLOBAL.position);
    const x_offset = 175 - GLOBAL.position.x * 26;
    const y_offset = 180 - GLOBAL.position.y * 42;
    console.log("Global position:", GLOBAL.position, x_offset, y_offset);
    document.getElementById("board").style = 'transform: translate(' + x_offset + 'px, ' + y_offset + 'px);';
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

function onKey(event) {
    let key = event.key;
    console.log('Key event:', key);
    let lowerKey = key.toLowerCase();
    let compass = GLOBAL.keyToCompass[lowerKey];
    let newCompass = undefined;
    if (typeof compass === 'number') {
        console.log('Rotate:', compass);
        if (compass === 0) {
            compass = GLOBAL.compass
        } else if (compass === 180) {
            compass = revert(GLOBAL.compass);
        } else {
            newCompass = rotate(GLOBAL.compass, compass)
            GLOBAL.compass = newCompass;
            compass = undefined;
        }
        console.log('Rotated:', compass, GLOBAL.compass);
    }
    if (compass) {
        let fromTile = getTile(GLOBAL.position);
        let fromActor = getActor(fromTile);
        let toPosition = step(GLOBAL.position, compass);
        let toTile = getTile(toPosition);
        let toActor = getActor(toTile);
        let moveFlag = key === lowerKey;
        if (moveFlag && !toActor) {
            // Move actor
            if (fromActor) {
                fromActor.compass = GLOBAL.compass;
            }
            setActor(fromTile, undefined, false);
            setActor(toTile, fromActor, GLOBAL.compass);
            GLOBAL.position = toPosition;
        } else if (!moveFlag) {
            setActor(fromTile, fromActor, false);
            setActor(toTile, toActor, GLOBAL.compass);
            GLOBAL.position = toPosition;
        }
    } else if (newCompass) {
        let tile = getTile(GLOBAL.position);
        let actor = getActor(tile);
        if (actor) {
            actor.compass = newCompass;
        }
        setActor(tile, actor, newCompass);
    }
    reorient()
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
        if (boardChild.nodeName.toLowerCase() === 'div' && boardChild.className !== 'half-tile') {
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
    GLOBAL.position = normalizePosition({ 'x': 0, 'y': 0 });
    GLOBAL.compass = 'sse';
    document.getElementById("view").className = 'rotate-' + GLOBAL.compass;
    console.log('Normalized origin:', GLOBAL.position);
    for (let a = 0; a < 360; a += 60) {
        let compass = GLOBAL.angleToCompass[a];
        for (let i = 0; i < 12; i++) {
            console.log('Tile:', GLOBAL.position, getTile(GLOBAL.position));
            GLOBAL.position = step(GLOBAL.position, compass);
        }
    }
    reorient();

    document.addEventListener('keydown', onKey);
}

console.log("Script mesh.js loaded");
