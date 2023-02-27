import { io } from 'socket.io-client';

export default class Socket {

    static socket = io();
    static data;

    static initialize(callback) {
        Socket.socket.on('leaderboardData', (...payload) => {
            console.log(payload);
            callback(payload);
        });

        Socket.socket.on('written', (...payload) => {
            callback(payload)
        })
    }

    static readFromLeaderboard() {
        Socket.socket.emit('needLeaderboardData');
    }

    static writeToLeaderboard(pickleNumber, score) {
        Socket.socket.emit('score', pickleNumber, score);
    }
    
}