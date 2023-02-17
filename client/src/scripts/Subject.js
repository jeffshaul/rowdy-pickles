export default class Subject {
    constructor() {
        this.observers = [];
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    notifyObservers(event) {
        this.observers.forEach(observer => observer.notify(event));
    }
}