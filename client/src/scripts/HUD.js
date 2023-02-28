import $ from 'jquery';
import general from '../config/general'
import lostlife from '../images/hud/lostlife.png'
import logo from '../images/hud/logo.png'
import { importAll, randomInt, randomPick } from './Utilities';
import difficulty from '../config/difficulty';
import Socket from './Socket';
import Dapp from './Dapp';
// const headshots = Object.values(importAll(require.context('../images/headshots/')));
// console.log(headshots);

export default class HUD {

    static recorded;

    static updateLoadingScreen(loadProgress) {
        let percent = loadProgress / 48 * 100;
        percent = 100 - percent;
        $('#loadingBarImage').css('clip-path', 'inset(0% ' + percent + '% 0% 0%)');
    }

    static displayGameOverHUD(message, score) {

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


        HUD.buildLeaderboard(score);
        HUD.setTweetIntentLink(score);

        setTimeout(() => {
            $('#gameOverHUD').show();
            $('#gameOverHUD').addClass('gameOverAnimation');
            $('#leaderboard-logo').attr('src', logo);
            const rowid = 'row-' + HUD.recorded;
            const row = document.getElementById(rowid);
            row.classList.add('highlight');
        }, 1500);

    }

    static buildLeaderboard(score) {
        const isEligible = (score >= difficulty.stage2requiredKills);
        const isWalletConnected = Dapp.wallet !== undefined;

        if (isEligible) {
            if (isWalletConnected) {
                HUD.assignToken(score);
            } else {
                $('#disconnected').show();
                $('#leaderboard-table').addClass('greyout');
                $('#connect-2').on('click', (e) => {
                    Dapp.connect2().then(() => {
                        HUD.assignToken(score);
                    });
                })
            }
        } else {
            $("#ineligible").show();
            $("#leaderboard-table").addClass('greyout');
        }
    }

    static assignToken(score) {
        const tokens = Dapp.getTokens();
        tokens.then((tokenList) => {
            if (tokenList.length === 0) {
                $('#notokens').show();
                $('#leaderboard-table').addClass('greyout');
            } else if (tokenList.length === 1) {
                Socket.initialize(HUD.populateLeaderboard);
                Socket.writeToLeaderboard(tokenList[0], score);
                HUD.recorded = tokenList[0];
            } else {
                // owner has to select which token
                HUD.populateTokenSelection(tokenList);
                $('#selecttoken').show();                
                $('#leaderboard-table').addClass('greyout');
                $('.pickle-token').on('click', (event) => {
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    const target = event.target.closest('.pickle-token');
                    const pickleNumber = target.firstElementChild.innerHTML.substring(1);
                    Socket.initialize(HUD.populateLeaderboard);
                    Socket.writeToLeaderboard(pickleNumber, score);
                    $('#selecttoken').hide();
                    $('#leaderboard-table').removeClass('greyout');
                    $(`#row-${pickleNumber}`).addClass('highlight');
                });
            }
        });
    }

    static populateTokenSelection(tokenList) {
        for (const token of tokenList) {
            $('#pickle-picker').append(`<div class='pickle-token'><p>#${token}</p><img src=''><p>Score</p></div>`);
        }
    }

    static getLeaderboardData() {
        Socket.initialize(HUD.populateLeaderboard);
        Socket.readFromLeaderboard();
    }

    static populateLeaderboard(data) {
        const values = data[0].values;
        values.sort((a, b) => {
            if (parseInt(a[1]) === parseInt(b[1])) {
                return 0;
            } else {
                return (parseInt(a[1]) < parseInt(b[1]) ? -1 : 1);
            }
        }).reverse();

        let rank = 1;
        values.forEach((value) => {
            const pickleNumber = value[0];
            const score = value[1];
            if (parseInt(score) === 0) {
                return;
            }
            // picture url https://gateway.pinata.cloud/ipfs/QmRfjoj9GewN4vRcT89rg7JBcmfeBGFK7XYmMTvEggYH1f/5.png
            $('#leaderboard-data').append(`<tr id='row-${pickleNumber}'><td>${rank}</td><td><a href='https://opensea.io/assets/ethereum/0x859201b9229cd22211f08fcfbd554830d54e8193/${pickleNumber}'>#${pickleNumber}</a></td><td>${score}</td></tr>`);
            rank++;
        });
    }

    static setTweetIntentLink(score) {
        const link = 'https://twitter.com/intent/tweet?text=';
        const text = `I pushed back ${score} pickles!  Check out the NFT collection at opensea.io/collection/rowdypickles`;
        const fulllink = link + encodeURIComponent(text);
        $('#tweet').attr('href', fulllink);
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
        }, 1500);
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
