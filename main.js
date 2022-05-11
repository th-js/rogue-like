const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
screen_size = {
    width: 500,
    height: 500
}
canvas.width = screen_size.width;
canvas.height = screen_size.height;

let Player = null;
let isAlive = true;
let Winner = false;
let map = {
    Block_Size: 50,
    size: {
        colums: 10,
        rows: 10
    },
    blocks: [],
    init: function () {
        for (let y = 0; y < this.size.rows; y++) {
            let newRow = [];
            for (let x = 0; x < this.size.colums; x++) {
                Math.random() > 0.8 ? newRow.push('#') : newRow.push('.');
            }
            this.blocks.push(newRow)
        }
    },
    Draw: function () {
        for (let y = 0; y < this.size.rows; y++) {
            for (let x = 0; x < this.size.colums; x++) {
                ctx.beginPath();

                this.blocks[x][y] === '#' ? ctx.fillStyle = "gray" : ctx.fillStyle = "green";
                ctx.strokeStyle = "#111";
                ctx.rect(x * this.Block_Size, y * this.Block_Size, this.Block_Size, this.Block_Size);
                ctx.fill();
                //ctx.stroke();
                ctx.closePath();
            }
        }
    }
}
let characters = {
    Enemies: [
        Bat = {
            name: 'Bat',
            position: {
                x: 0,
                y: 0
            },
            hp: 50,
            dmg: 10,
            sprite: {
                img: new Image(),
                src: 'imgs/bat.png'
            }
        },
        Skeleton = {
            name: 'Sheleton',
            position: {
                x: 0,
                y: 0
            },
            hp: 100,
            dmg: 10,
            sprite: {
                img: new Image(),
                src: 'imgs/skeleton.png'
            }
        },
        Monster = {
            name: 'Monster',
            position: {
                x: 0,
                y: 0
            },
            hp: 200,
            dmg: 10,
            sprite: {
                img: new Image(),
                src: 'imgs/monster.png'
            }
        }
    ],
    Player_Class: [
        Main = {
            name: 'Player',
            position: {
                x: 0,
                y: 0
            },
            hp: 100,
            dmg: 50,
            sprite: {
                img: new Image(),
                src: 'imgs/player-blue.png'
            }
        }
    ],
    Count: 10,
    Enemies_Count: 0,
    All_Char: [],
    Char_Map: [],
    init: function () {
        
        this.Enemies_Count = this.Count - 1;

        for (let c = 0; c < this.Count; c++) {

            let index = Math.floor(Math.random() * this.Enemies.length);
            let char = {
                ...this.Enemies[index]
            };

            if (c == 0) char = {...this.Player_Class[0]};

            do {
                let pos = {
                    x: Math.floor(Math.random() * map.size.colums),
                    y: Math.floor(Math.random() * map.size.rows)
                }
                char.position = pos;

            }
            while (map.blocks[char.position.y][char.position.x] == '#' || this.Char_Map[char.position.y + '-' + char.position.x] != null) {
                this.Char_Map[char.position.y + '-' + char.position.x] = char;
                this.All_Char.push(char);
            }
        }
    },
    Draw: function () {
        for (let c in this.All_Char) {
            let currentChar = this.All_Char[c];
            if (currentChar) {
                currentChar.sprite.img.src = currentChar.sprite.src;
                ctx.beginPath()
                
                ctx.drawImage(currentChar.sprite.img, (currentChar.position.y * 50), (currentChar.position.x * 50), 50, 50);
                ctx.fillStyle = "red";
                ctx.font = "12px 'Press Start 2P'";
                ctx.textAlign = "center";
                ctx.fillText(currentChar.hp, currentChar.position.y * 50 + 25, currentChar.position.x * 50 + 15);
                
                ctx.closePath();
            }
        }
    },
    Update: function () {
        for (let enemy in this.All_Char) {
            //if(this.All_Char[enemy].name ==  'Player') continue;
            if (this.All_Char[enemy]) {
                if (this.All_Char[enemy].name === 'Player') continue;
                AI(this.All_Char[enemy])
            }
            //if(this.All_Char[enemy])
        }
    }
}
let items = {
    Potion: {
        position: {
            x: 0,
            y: 0
        },
        sprite: {
            img: new Image(),
            src: 'imgs/potion-mini-color.png'
        },
        action: function () {
            Player.hp = 100;
        }
    },
    items_list: [],
    items_Map: [],
    init: function () {
        let count = Math.floor(Math.random() * 5);
        if (count == 0) count = 1;
        for (let i = 0; i < count; i++) {

            let item = {
                ...this.Potion
            }
            do {
                let pos = {
                    x: Math.floor(Math.random() * map.size.colums),
                    y: Math.floor(Math.random() * map.size.rows)
                };
                item.position = pos;
            }
            while (map.blocks[item.position.y][item.position.x] == '#' || this.items_Map[item.position.y + '-' + item.position.x] != null) {
                this.items_Map[item.position.y + '-' + item.position.x] = item;
                this.items_list.push(item)
            }
        }
    },
    Draw: function () {
        for (let i in this.items_list) {
            let currentItem = this.items_list[i]
            if (currentItem) {
                currentItem.sprite.img.src = currentItem.sprite.src;
                ctx.beginPath()
                ctx.drawImage(currentItem.sprite.img, currentItem.position.y * 50 + 10, currentItem.position.x * 50 + 10, 30, 30);
                ctx.closePath()
            }
        }
    }
}
const CanMove = (char, dir) => {
    return char.position.x + dir.x >= 0 &&
        char.position.x + dir.x <= map.size.colums - 1 &&
        char.position.y + dir.y >= 0 &&
        char.position.y + dir.y <= map.size.rows - 1 &&
        map.blocks[char.position.y + dir.y][char.position.x + dir.x] == '.'
}
const MoveTo = (char, dir) => {

    if (!CanMove(char, dir)) {
        return false
    }

    const isPlayer = char.name == 'Player';

    let newIndex = (char.position.y + dir.y) + '-' + (char.position.x + dir.x)
    if (items.items_Map[newIndex] && isPlayer) {
        const item = items.items_Map[newIndex]
        item.action();
        items.items_Map[newIndex] = null;
        items.items_list[items.items_list.indexOf(item)] = null;
    }
    if (characters.Char_Map[newIndex]) {

        let target = characters.Char_Map[newIndex];

        if (target.name != 'Player' && char.name != 'Player') return;

        target.hp -= char.dmg;

        if (target.hp <= 0) {

            characters.Char_Map[newIndex] = null;
            characters.All_Char[characters.All_Char.indexOf(target)] = null;
            if(target.name != 'Player')
            {
                characters.Enemies_Count--;
            }

        }
    } else {

        characters.Char_Map[char.position.y + '-' + char.position.x] = null;

        char.position.x += dir.x
        char.position.y += dir.y

        characters.Char_Map[char.position.y + '-' + char.position.x] = char
    }
    return true;
}
const AI = (char) => {
    const directions = [{
        x: -1,
        y: 0
    }, {
        x: 1,
        y: 0
    }, {
        x: 0,
        y: -1
    }, {
        x: 0,
        y: 1
    }]

    let dx = Player.position.x - char.position.x;
    let dy = Player.position.y - char.position.y;

    if (Math.abs(dx) + Math.abs(dy) > 1) {
        MoveTo(char, directions[Math.floor(Math.random() * directions.length)])
    } else {

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) {
                // left
                MoveTo(char, directions[0]);
            } else {
                // right
                MoveTo(char, directions[1]);
            }
        } else {
            if (dy < 0) {
                // up
                MoveTo(char, directions[2]);
            } else {
                // down
                MoveTo(char, directions[3]);
            }
        }
    }
}
const GameOver = () => {
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.font = "50px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText('GAMEOVER', screen_size.width / 2, screen_size.height / 2);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillText('Press <R> to restart', screen_size.width / 2 , screen_size.height / 2 + 20);
    ctx.closePath();
}
const YouWin = () => 
{
    ctx.beginPath();
    ctx.fillStyle = "green";
    ctx.font = "50px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText('You Win', screen_size.width / 2, screen_size.height / 2);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillText('Press <R> to restart', screen_size.width / 2 , screen_size.height / 2 + 20);
    ctx.closePath();
}
document.addEventListener('keyup', (event) => {

    let press = false;
    if(event.code == 'KeyR') Restart();
    
    if (!isAlive || Winner) return;

    switch (event.code) {
        case 'ArrowLeft' || 'KeyA':
            press = MoveTo(Player, {
                x: 0,
                y: -1
            })
            break;

        case 'ArrowRight' || 'KeyD':
            press = MoveTo(Player, {
                x: 0,
                y: 1
            })
            press = true;
            break;

        case 'ArrowUp' || 'KeyW':
            press = MoveTo(Player, {
                x: -1,
                y: 0
            })
            break;
        case 'ArrowDown' || 'KeyS':
            press = MoveTo(Player, {
                x: 1,
                y: 0
            })
            break;
    }

    if (press) characters.Update();
});
const Start = () => {
    map.init();
    characters.init();
    items.init();
    Winner = false;
    isAlive = true;
    Player = characters.All_Char[0]
    Update();
}
const Restart = () =>
{
    map.blocks = []
    characters.Char_Map = []
    characters.All_Char = []
    items.items_list = []
    items.items_Map = []
    Start();
}
const Update = () => {
    setInterval(() => {
        ctx.clearRect(0, 0, 500, 500);
        if(isAlive && !Winner)
        {
            map.Draw();
            characters.Draw();
            items.Draw();
        }
        if (Player == null || Player.hp <= 0)
        {
            isAlive = false;
            Player = null;
        }

        if (!isAlive) 
            GameOver();

        if(isAlive && characters.Enemies_Count == 0) 
            Winner = true;
        
        if(Winner) YouWin();
            

    }, 1 / 1000);
}
Start();