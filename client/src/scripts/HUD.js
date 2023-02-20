import $ from 'jquery';
import general from '../config/general'
import lostlife from '../images/hud/lostlife.png'
import logo from '../images/hud/logo.png'
import { importAll, randomInt, randomPick } from './Utilities';
import difficulty from '../config/difficulty';
// const headshots = Object.values(importAll(require.context('../images/headshots/')));
// console.log(headshots);

export default class HUD {

    static updateLoadingScreen(loadProgress) {
        let percent = loadProgress / 48 * 100;
        percent = 100 - percent;
        $('#loadingBarImage').css('clip-path', 'inset(0% ' + percent + '% 0% 0%)');
    }

    static displayGameOverHUD(message) {
        
        switch (message) {
            case 'overrun':
                $('#overrunMessage').toggle();
                break;
            case 'miss':
                $('#missMessage').toggle();
                break;
            case 'win':
                $('#winMessage').toggle();
                break;
            default:
        }

        setTimeout(() => {
            $('#gameOverHUD').show();
            $('#gameOverHUD').addClass('gameOverAnimation');
            $('#leaderboard-logo').attr('src', logo);
        }, 1700);
        
    }

    static loseLife(misses) {
        // ouchie
        switch (misses) {
            case 2:
                $('#life1').attr('src', lostlife);
                $('#life1').addClass('xStamp');
                break;
            case 1:
                $('#life2').attr('src', lostlife);
                $('#life2').addClass('xStamp');
                break;
            case 0:
                $('#life3').attr('src', lostlife);
                $('#life3').addClass('xStamp');
                break;
            default:
                break;
        }
    }

    static updateKills(kills) {
        $('#killCount').text(kills);
        // TODO if pass req kills, show keep going msg
        if (kills === difficulty.requiredKills) {
            HUD.keepGoing(`Nice job! Push back ${difficulty.stage2requiredKills - difficulty.requiredKills} more pickles!`);
        }

        if (kills === difficulty.stage2requiredKills) {
            HUD.keepGoing('Infinite Pickles!');
        }
    }

    static keepGoing(message) {
        $('#keepGoingMessage').text(message);
        $('#keepGoingMessage').show();

        setTimeout(() => {
            $('#keepGoingMessage').hide();
        }, 700);
    }

    static countdown(engine) {
        // let introLogo = document.getElementById('logo');
        // let press2play = document.getElementById('press2play');
        let landingModal = document.getElementById('landing');
        let countdown3 = document.getElementById('countdown3');
        let countdown2 = document.getElementById('countdown2');
        let countdown1 = document.getElementById('countdown1');
        let goalMessage = document.getElementById('goalMessage');

        // turn off intro logo and press2play, turn on 3 DEPRECATED
        // turn off landing modal
        setTimeout(() => {
            // introLogo.style.display = 'none';
            // press2play.style.display = 'none';
            landingModal.style.display = 'none';
            countdown3.style.display = 'block';
        }, 20);

        // turn off 3, turn on 2
        setTimeout(() => {
            countdown3.style.display = 'none';
            countdown2.style.display = 'block';
        }, general.countdownInterval);

        // turn off 2, turn on 1
        setTimeout(() => {
            countdown2.style.display = 'none';
            countdown1.style.display = 'block';
        }, 2 * general.countdownInterval);

        // turn off 1 and tell Engine to start game
        setTimeout(() => {
            countdown1.style.display = 'none';
            goalMessage.style.display = 'block';
            engine.beginSpawning();
            
        }, 3 * general.countdownInterval);

        setTimeout(() => {
            goalMessage.style.display = 'none';            
        }, 6 * general.countdownInterval);
    }

    static stampHighScore() {
        $('#highscore').show();
    }    
}
