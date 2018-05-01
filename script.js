const controller = (function() {
    
    const _fields = new Map([
        ['top',    {first : null, second : null, third : null}],
        ['middle', {first : null, second : null, third : null}],
        ['bottom', {first : null, second : null, third : null}]
    ]);

    const scores = {
        'player_1' : 0, 
        'player_2' : 0
    }  

    const _positions = [
        [['top', 'first'], ['top', 'second'], ['top', 'third']],
        [['middle', 'first'], ['middle', 'second'], ['middle', 'third']],
        [['bottom', 'first'], ['bottom', 'second'], ['bottom', 'third']],
        
        [['top', 'first'], ['middle', 'first'], ['bottom', 'first']],
        [['top', 'second'], ['middle', 'second'], ['bottom', 'second']],
        [['top', 'third'], ['middle', 'third'], ['bottom', 'third']],

        [['top', 'first'], ['middle', 'second'], ['bottom', 'third']],
        [['top', 'third'], ['middle', 'second'], ['bottom', 'first']],        
    ];

    let stage = 1;
    

    return {

        checkField : (postion, index) => _fields.get(postion)[index] !== null,

        fillField  : (postion, index, player) => _fields.get(postion)[index] = player,
        clearFields : () => {

            _positions.forEach(function(item) {

                let [i,y,x] = item;

                _fields.get(i[0])[i[1]] = null;
                _fields.get(y[0])[y[1]] = null;
                _fields.get(x[0])[x[1]] = null;
            });
        },

        testing : () => console.log(_fields),

        clearStage : () => stage = 1,
        
        winner : function() {

            for (const [i, y, x] of _positions) {
                 
                //if field is not null
                if (_fields.get(i[0])[i[1]] !== null && _fields.get(y[0])[y[1]] !== null && 
                _fields.get(i[0])[i[1]]  !== null && _fields.get(x[0])[x[1]] !== null) {

                    //return Winner
                    if (_fields.get(i[0])[i[1]] === _fields.get(y[0])[y[1]] && 
                        _fields.get(i[0])[i[1]] === _fields.get(x[0])[x[1]]) {
                            stage = 1;
                            scores[this.getCurrentPlayer()]++;
                            return true;
                    }
                }            
            }

            //If all field are filled and no one won the game return 'draw'
            if (stage === 9) {
                stage = 1;
                return 'draw';
            }
            
            stage++;
        },

        getCurrentPlayer : () => {

            return Array.from(document.querySelector('.choose__player').children)
            .filter(el => el.classList.contains('active'))[0].classList[0];

        },

        playerScore : function() {return scores[this.getCurrentPlayer()]; },

        resetScores : () => ['player_1', 'player_2'].forEach(key => scores[key] = 0)

    };

})();


const UIControler = (function() {

    const

        DOM_strings = {
            game : '.tic-tac-toe',
            choose_player: '.choose__player',
            label: '.label',
            overlay : '.overlay',
            popup: '.popup',
            content: '.content',
            minus: '.symbol-minus',
            btn: '.btn-restart'
        },

        _map = new Map([
            [1, '&times;'], 
            [0, '&cir;'.fontcolor('white')],
            [3, '&times;' + '&cir;'.fontcolor('white')]
        ]),

        _players = Array.from(document.querySelector(DOM_strings.choose_player).children),

        _player0Color = (class_, player) => {
            if (player === 0) {
                document.querySelector(`.${class_}`)
                .querySelector('.symbol').classList.add('symbol-white');
            }     
        },

        _getCurrentPlayerObj = () => _players.filter(el => el.classList.contains('active'))[0];


    return {

        DOM : DOM_strings,

        playerMove : (class_, player, check_field) => {

            //add only if check_field is equal to false
            if (!check_field) {
                const html = `<span class="symbol">${_map.get(player)}</span>`;
                document.querySelector(`.${class_}`)
                .insertAdjacentHTML(
                    'afterbegin',
                    html
                );
                _player0Color(class_, player);
            }
        },

        clearFields : function() {
            
            const fields = Array.from(document.querySelector(DOM_strings.game).childNodes)
            .filter(el => el.tagName === 'DIV' && el.hasChildNodes());
            fields.forEach(el => el.removeChild(el.firstChild));
        },

        choosePlayer : el_clicked => {

            el_clicked = el_clicked.target;
            //Array.from will convert the result from children (NodeList) to array
            _players.forEach(item => {
                
                //check if the item has active class if so it doesn't change anything if not change the player
                item.className !== el_clicked.className ? 
                item.classList.remove('active') : item.classList.add('active');
            });
            
            //return current player
            return _players.filter(el => el.classList.contains('active'))[0].classList[0];
            
        },

        changePlayer : () => {

            [player_1, player_2] = _players;
            player_1.classList.toggle('active');
            player_2.classList.toggle('active');
            
        },
        
        winner : player => {

            document.querySelector(DOM_strings.popup)
            .firstElementChild.textContent = player === 3 ? 'DRAW!' : 'WINNER!';
            
            document.querySelector(DOM_strings.popup)
            .querySelector(DOM_strings.content).innerHTML = _map.get(player);   

            //Change popup msg visibility
            document.querySelector(DOM_strings.overlay).style.visibility = 'visible';
            document.querySelector(DOM_strings.overlay).style.opacity = 1;

            
            const default_ = () => {
                document.querySelector(DOM_strings.overlay).style.visibility = 'hidden';
                document.querySelector(DOM_strings.overlay).style.opacity = 0;
                //remove this event
                setTimeout(document.removeEventListener, 100, 'click', default_);
                
            }
            //Add event listener to remove the popup msg
            setTimeout(document.addEventListener, 500, 'click', default_);
            

        },

        setPlayerScore : score => {

            _getCurrentPlayerObj()
            .querySelector(DOM_strings.minus).textContent = score

        }
        
    }

})();


const main = (function(UICtrl, gameCtrl) {
    
    const DOM_strings = UICtrl.DOM;
    let player = 1;

    const stages = {
        stageEventChoosePlayer : 1,
        stageEventField_delegation : 1
    }



    const change = (fn, arg) => {

        player = ({
            player_1: 1,
            player_2: 0
        })[fn(arg)];
    }

    
    //events functions
    const field_delegation = function(e) {
        //remove event that provide change of the player
        if (stages.stageEventChoosePlayer) {
            stages.stageEventChoosePlayer = 0
        }

        
        if (e.target.tagName === 'DIV' && stages.stageEventField_delegation) {
            
            const 
                [class_, border] = e.target.classList,
                [index, position] = e.target.classList[0].split('-');

            UICtrl.playerMove(
                class_, player, gameCtrl.checkField(position, index)
            );
            //Add values (1 or 0) in the field
            gameCtrl.fillField(position, index, player);
 
            //Check Winner
            const winner = gameCtrl.winner();
            if (winner) {              
                UICtrl.winner(winner === 'draw' ? 3 : player);
                UICtrl.setPlayerScore(gameCtrl.playerScore());

                //disable this event
                stages.stageEventField_delegation = 0
                 
            } else {
                //Player turn
                UICtrl.changePlayer();

                //Only change player
                change(gameCtrl.getCurrentPlayer);
            }

        }
    }

    const choosePlayer = function(e) {
         //Choose the player and update the current player
         if (stages.stageEventChoosePlayer) {
            change(UICtrl.choosePlayer, e);
         }     
    }

    //Events;
    const events = () => {
        //Player Move
        document.querySelector(DOM_strings.game)
        .addEventListener('click', field_delegation);
        
        //Choose player at the beginning of the game
        document.querySelector(DOM_strings.choose_player)
        .addEventListener('click', choosePlayer);

        //Restart Game
        document.querySelector(DOM_strings.btn).addEventListener('click', function() {

            //1. Clear Objs values and Stage
            gameCtrl.clearFields();
            gameCtrl.clearStage();

            //2. Clear UI Fields 
            UICtrl.clearFields();

            //3. Reassign Default Value to these events
            stages.stageEventChoosePlayer = 1;
            stages.stageEventField_delegation = 1;
        })

    }


    // return a object with one property named run to initialize the application
    return {
        run : events
    };

})(UIControler, controller);

//run app
main.run();
