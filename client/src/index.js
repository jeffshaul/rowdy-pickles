import './styles/style.css';
import Game from './scripts/Game.js';
import $ from 'jquery';
import logo from './images/hud/logo.png';
import countdown3 from './images/hud/countdown3.png';
import countdown2 from './images/hud/countdown2.png';
import countdown1 from './images/hud/countdown1.png';
import life from './images/hud/life.png';
import woodBackground from './images/hud/woodBackground.png';
import highscore from './images/hud/highscore.png';
import { iOS } from './scripts/Utilities';
import loading from './images/hud/loadinggame.png';
import credits from './images/hud/credits.png';
import discord from './images/discord.png';
import twitter from './images/twitter.png';
import opensea from './images/opensea.png';
import difficulty from './config/difficulty';
import Dapp from './scripts/Dapp';
import headshot from './images/headshots/1.png';

$('#headshot').attr('src', headshot);

// set up asset URLs
$('#landing-logo').attr('src', logo);
$('#logo').attr('src', logo);
$('#logoBlocker').attr('src', logo);
$('#countdown3').attr('src', countdown3);
$('#countdown2').attr('src', countdown2);
$('#countdown1').attr('src', countdown1);
$('.requiredKills').text(difficulty.requiredKills);
$('#life1').attr('src', life);
$('#life2').attr('src', life);
$('#life3').attr('src', life);
$('#highscore').attr('src', highscore);
$('#loadingBarImage').attr('src', loading);
$('#loadingBarGhost').attr('src', loading);
$('#credits').attr('src', credits);
$('#creditsHitbox').on('click', () => {
    $('#credits').show();
})
$('#discord').attr('src', discord);
$('#twitter').attr('src', twitter);
$('#opensea').attr('src', opensea);

$('#missMessage').hide();
$('#overrunMessage').hide();
$('#keepGoingMessage').hide();
$('#winMessage').hide();

$('#tryAgainBtn').on('click', function () {
    window.location.reload();
});

$('#mintBtn').on('click', function () {
    window.location.href = 'https://mint.rowdypickles.com';
});

$('#homeBtn').on('click', function () {
    window.location.href = 'https://www.rowdypickles.com';
});

// set up fullscreen button
function openFullscreen() {
    var elem = document.documentElement;

    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }

    $('#fullscreenButton').on('click', closeFullscreen);
}

function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }

    $('#fullscreenButton').on('click', openFullscreen);
}

// check for portrait mode and politely ask users to change to landscape
if (window.innerHeight > window.innerWidth) {
    $('#blocker').show();
}

$(window).on('resize', function (event) {
    if (window.innerHeight < window.innerWidth) {
        $('#blocker').hide();
        let svgH = 0.8 * window.innerHeight;
        let svgW = 1.4 * svgH;
        $('#gameOverSVG').attr('height', svgH);
        $('#gameOverSVG').attr('width', svgW);
    } else {
        $('#blocker').show();
    }
})

$('#fullscreenButton').on('click', openFullscreen);

// hide fullscreen button if iOS
if (iOS) {
    $('#fullscreenButton').hide();
}

// enable connect button
$('#connect-wallet-btn').on('click', Dapp.connect);

// start game!
var game = new Game();

