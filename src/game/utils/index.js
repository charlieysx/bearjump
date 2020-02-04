wx.$util = {
    delay(t = 0) {
        return new Promise(resolve => {
            setTimeout(resolve, t);
        });
    }
};