const mazeGeneration = (numberCellsX, numberCellsY) => {
    const cellsX = numberCellsX;
    const cellsY = numberCellsY
    const width = window.innerWidth;
    const height = window.innerHeight; //multiply by .945 for customize
    // length of walls
    const unitLengthX = width / cellsX;
    const unitLengthY = height / cellsY;
    
    const engine = Engine.create();
    // disable gravity for x and y coords
    engine.world.gravity.y = 0;
    const { world } = engine;
    const render = Render.create({
        element: document.querySelector('#gameboard'),
        engine: engine,
        options: {
            wireframes: false,
            width: width,
            height: height
        }
    });
    Render.run(render);
    Runner.run(Runner.create(), engine);
    
    // Walls
    const walls = [
        Bodies.rectangle(width / 2, 0, width, 3, { isStatic: true }),
        Bodies.rectangle(width / 2, height, width, 3, { isStatic: true}),
        Bodies.rectangle(0, height / 2, 3, height, { isStatic: true}),
        Bodies.rectangle(width, height / 2, 3, height, { isStatic: true})
    ];
    World.add(world, walls);
    
    // Maze Grid Generation
    const grid = Array(cellsY).fill(null).map(() => Array(cellsX).fill(false));
    // if cells === 3
    // [f][f][f]
    // [f][f][f]
    // [f][f][f]
    const verticals = Array(cellsY).fill(null).map(() => Array(cellsX - 1).fill(false));
    // [f][f]
    // [f][f]
    // [f][f]
    const horizontals = Array(cellsY - 1).fill(null).map(() => Array(cellsX).fill(false));
    // [f][f][f]
    // [f][f][f]
    
    const startRow = Math.floor(Math.random() * cellsY);
    const startColumn = Math.floor(Math.random() * cellsX);
    
    const movementThroughCell = (row, column) => {
        // if already visited, return
        if (grid[row][column]) {
            return;
        }
    
        // after vist return true
        grid[row][column] = true;
    
        // create randomly ordered list of neighbors
        const neighboringCells = shuffle([
            [row - 1, column, 'up'], // Up
            [row, column + 1, 'right'], // Right
            [row + 1, column, 'down'], // Down
            [row, column - 1, 'left'] // Left
        ]);
    
        // For each neighbor
        for (let neighbor of neighboringCells) {
            const [nextRow, nextColumn, direction] = neighbor;
            // See if neighbor is out of bounds
            if (nextRow < 0 || nextRow >= cellsY || nextColumn < 0 || nextColumn >= cellsX) {
                continue;
            }
            // If cell contain true, meaning already visited, continue
            if (grid[nextRow][nextColumn]) {
                continue;
            }
            // Remove a wall from the cell 
            // verticals
            if (direction === 'left') {
                verticals[row][column - 1] = true;
            }
            else if (direction === 'right') {
                verticals[row][column] = true;
            }
            else if (direction === 'up') {
                horizontals[row - 1][column] = true;
            }
            else if (direction === 'down') {
                horizontals[row][column] = true;
            }
            // Recursion
            movementThroughCell(nextRow, nextColumn)
        }
    };
    movementThroughCell(startRow, startColumn);
    
    horizontals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if (open) {
                return;
            }
    
            const wall = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX / 2,
                rowIndex * unitLengthY + unitLengthY,
                unitLengthX, 1,
                {
                    label: 'wall',
                    isStatic: true,
                    render: {
                        fillStyle: 'red'
                    }
                }
            )
            World.add(world, wall)
        })
    })


    verticals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if (open) {
                return;
            }
    
            const wall = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX,
                rowIndex * unitLengthY + unitLengthY / 2,
                1, unitLengthY,
                {
                    label: 'wall',
                    isStatic: true,
                    render: {
                        fillStyle: 'red'
                    }
                }
            )
            World.add(world, wall)
        })
    })

    
    
    // Player's Object
    const ball = Bodies.circle(
        unitLengthX / 2,
        unitLengthY / 2,
        Math.min(unitLengthX, unitLengthY) / 3,
        {
            label: 'player',
            inertia: Infinity
        }
    )
    World.add(world,ball)
    
    // Goal object
    const goal = Bodies.rectangle(
        width - unitLengthX / 2,
        height - unitLengthY / 2,
        unitLengthX * .7, 
        unitLengthY * .7,
        {
            label: 'goal',
            isStatic: true,
            render: {
                fillStyle: 'green'
            }
        }
    );
    World.add(world, goal);
    
    // Key Movements
    document.addEventListener('keydown', (event) => {
        const { x, y } = ball.velocity;
    
        // move up
        if (event.keyCode === 38 || event.keyCode === 87) {
            Body.setVelocity(ball, {
                x,
                y: y-8
            })
        }
        // move down
        if (event.keyCode === 40 || event.keyCode === 83) {
            Body.setVelocity(ball, {
                x,
                y:  y+8
            })
        }
        // move right
        if (event.keyCode === 39 || event.keyCode === 68) {
            Body.setVelocity(ball, {
                x:  x+8,
                y
            })
        }
        // move left
        if (event.keyCode === 37 || event.keyCode === 65) {
            Body.setVelocity(ball, {
                x: x-8,
                y
            })
        }
    })
    
    
    // Stop movement after keyup
    document.addEventListener('keyup', (event) => {
        const { x, y } = ball.velocity;
    
        // move up
        if (event.keyCode === 38 || event.keyCode === 87 || event.keyCode === 40 || event.keyCode === 83) {
            Body.setVelocity(ball, {
                x,
                y: 0
            })
        }
        // move right
        if (event.keyCode === 39 || event.keyCode === 68 || event.keyCode === 37 || event.keyCode === 65) {
            Body.setVelocity(ball, {
                x: 0,
                y
            })
        }
    })
    
    // Win condition
    Events.on(engine, 'collisionStart', (event) => {
        event.pairs.forEach((collision) => {
            const labels = ['player', 'goal'];
    
            if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
                document.querySelector('.winner').classList.remove('hidden')
                // switch gravity back on
                world.gravity.y = 1;
                world.bodies.forEach((body) => {
                    if (body.label === 'wall') {
                        Body.setStatic(body, false)
                    }
                })
            }
        })
    })
    }