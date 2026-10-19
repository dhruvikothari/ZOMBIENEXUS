function rpc(method, params) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send(
            { jsonrpc: "2.0", method, params, id: new Date().getTime() },
            (err, res) => {
                if (err) return reject(err);
                if (res && res.error) return reject(new Error(res.error.message));
                resolve(res);
            }
        );
    });
}

async function increase(duration) {
    // both calls are awaited: the mined block must carry the new time
    await rpc("evm_increaseTime", [duration]);
    await rpc("evm_mine", []);
}

const duration = {

    seconds: function (val) {
        return val;
    },
    minutes: function (val) {
        return val * this.seconds(60);
    },
    hours: function (val) {
        return val * this.minutes(60);
    },
    days: function (val) {
        return val * this.hours(24);
    },
}

module.exports = {
    increase,
    duration,
};
