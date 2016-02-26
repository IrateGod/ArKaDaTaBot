var util = require("util");
var request = require("request");
var api = require("./api.js");
var irc = require("tmi.js");
var jsdom = require("jsdom");
var lolSkillBase = "http://www.lolskill.net/summoner/EUW/ArKaDaTa";
var jQUrl = "http://code.jquery.com/jquery.js";
var options = {
    options: {
        debug: true
    },
    connection: {
        cluster: "chat",
        reconnect: true
    },
    identity: {
        username: "arkadatabot",
        password: "oauth:c4yax9ec445koehrf5ucdyg10sezqt"
    },
    channels: ["#arkadataediting"]
};
var client = new irc.client(options);
client.on("chat", function (channel, user, message, self) {
    if (deHash(channel).toLowerCase() === "arkadataediting" && isCommand(message)) {
        parseCommand(message, commands, client, function (client, commands, args) {
            var argsArray = [client];
            args.slice(1).forEach(function (arg) {
                argsArray.push(arg);
            });
            commands[args[0]].apply(this, argsArray);
        });
    }
});
// api.setKey("<APIKEY>");

function deHash (str) {
    return str.trim().replace(/^(\#)+/, "");
}

function isCommand (message) {
    return message.trim().charAt(0) === "!";
}

function parseCommand (message, commands, client, callback) {
    var command = message.trim().split("!").join("");
    if (!(command.split(" ")[0] in commands)) {
        return;
    }
    console.log(command);
    callback(client, commands, command.split(" "));
}

var commands = {
    "elo": function (client) {
        api.request("leaguedata", "bySummoner", [42925758], function (data) {
            var tier = data['42925758'][0].tier;
            var leaguePoints = data['42925758'][0].entries[0].leaguePoints;
            client.say("#arkadataediting", tier[0] + tier.toLowerCase().substr(1) + ", " + leaguePoints + " LP.");
        });
    },
    "mastery": function (client) {
        api.request("championmastery", "byPlayerAndChamp", [api.regionMap.euw, 42925758, 157], function (data) {
            client.say("#arkadataediting", data.championPoints.toString());
        });
    },
    "lolskill": function (client, locale) {
        var score = {
            place: "",
            lss: ""
        };
        jsdom.env({
            url: lolSkillBase,
            scripts: [jQUrl],
            done: function (err, window) {
                if (!err) {
                    var $ = window.$;
                    score.place = $('.badge[style*="yasuo"] .text').text(); // magic constant, I guess. This is bad.
                    jsdom.env({
                        url: lolSkillBase + "/champions",
                        scripts: [jQUrl],
                        done: function (err, window) {
                            if (!err) {
                                var $ = window.$;
                                score.lss = $('[data-champion-id="157"].left + td.tooltip').text();
                                client.say("#arkadataediting", "ArKaDaTa is " + score.place + " Yasuo in the world with a LoL Skill Score of " + score.lss);
                            }
                        }
                    });
                }
            }
        });
    } 
};
client.connect();
