var request = require("request");
var tools = require("./tools.js");

function RademacherLockAccessory(log, accessory, sw, url) {
    this.log = log;
    this.sw = sw;
    this.url = url;
    this.accessory = accessory;
    this.lockservice = accessory.getService(global.Service.LockMechanism);
    
    this.lockservice
        .getCharacteristic(global.Characteristic.LockCurrentState)
        .on('get', this.getState.bind(this));
    
    this.lockservice
        .getCharacteristic(global.Characteristic.LockTargetState)
        .on('get', this.getState.bind(this))
        .on('set', this.setState.bind(this));
    
}

RademacherLockAccessory.prototype.getState =function (callback) {
    this.log("%s [%s] - get lock state", this.accessory.displayName, this.sw.did)
    callback(null, true);
}

RademacherLockAccessory.prototype.setState = function (state, callback) {
    var self=this;
    var lockState = (state == global.Characteristic.LockTargetState.SECURED) ? "lock" : "unlock";
    this.log("%s [%s] - set lock state to %s", this.accessory.displayName, this.sw.did, lockState)

    callback(null);
    return; //TODO

    var params = "cid=10&did="+this.sw.did+"&command=1";
    request.post({
        headers: {'content-type' : 'application/x-www-form-urlencoded'},
        url: this.url + "/deviceajax.do",
        body: params
        }, function(e,r,b){
            if(e) return callback(new Error("Request failed."), false);
            if(r.statusCode == 200)
            {
                // alway unlock
                self.lockservice.setCharacteristic(global.Characteristic.LockCurrentState, global.Characteristic.LockCurrentState.UNSECURED);
                self.lockservice.setCharacteristic(global.Characteristic.LockCurrentState, global.Characteristic.LockCurrentState.SECURED)
                callback(null);
            }
    });
}

RademacherLockAccessory.prototype.getServices = function() {
    return [this.lockservice];
}

module.exports =  RademacherLockAccessory;