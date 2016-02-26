// api.js
exportData = {
    key: "",
    root: "https://{$region}.api.pvp.net/",
    base: "api/lol/{$region}/",
    region: "euw",
    regionMap: {
        "na": "NA1",
        "tr": "TR1",
        "eune": "EUN1",
        "euw": "EUW1",
        "lan": "LA1",
        "las": "LA2",
        "oce": "OC1",
        "br": "BR1",
        "ru": "RU",
        "kr": "KR"
    },
    map: {
        "summoner": {
            version: "v1.4/summoner/",
            byName: "by-name/{$params}",
            queryString: false,
            useBase: true
        },
        "matchlist": {
            version: "v2.2/matchlist/",
            bySummoner: "by-summoner/{$param[0]}",
            queryString: "?championIds={$param[1]}&seasons={$param[2]}",
            useBase: true
        },
        "championmastery": {
            version: "championmastery/",
            byPlayerAndChamp: "location/{$param[0]}/player/{$param[1]}/champion/{$param[2]}",
            queryString: false,
            useBase: false
        },
        "championdata": {
            version: "v1.2/",
            isStaticData: true,
            champions: "champion",
            queryString: "?locale={$param[0]}",
            useBase: true
        },
        "leaguedata": {
            version: "v2.5/league/",
            bySummoner: "by-summoner/{$param[0]}/entry",
            queryString: false,
            useBase: true
        }
    },
    request: function (mapQuery, name, argsArray, callback) {
        var map = util._extend({}, this.map[mapQuery]),
            url = "",
            root = this.root,
            key = this.key,
            base = this.base,
            region = this.region;
        console.log(map, url, root, key);
        url += root.replace("{$region}", (map.isStaticData && "global") || region);
        if (map.useBase) {
            url += base.replace("{$region}", ((map.isStaticData && "static-data/") || "") + region);
        }
        url += map.version;
        url += map[name].replace("{$params}", argsArray.slice(1).join(",")).replace(/\{\$param\[(\d+)\]\}/g, function (argIndex) {
            argIndex = parseInt(argIndex.substring(argIndex.indexOf("[") + 1, argIndex.indexOf("]")), 10);
            return argsArray[argIndex];
        });
        if (map.queryString !== false) {
            url += map.queryString.replace("{$params}", argsArray.slice(1).join(",")).replace(/\{\$param\[(\d+)\]\}/g, function (argIndex) {
                argIndex = parseInt(argIndex.substring(argIndex.indexOf("[") + 1, argIndex.indexOf("]")), 10);
                return argsArray[argIndex];
            });
        }
        url += ((map.queryString && "&") || "?") + "api_key=" + key;
        console.log(url);
        request(url, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (typeof callback === "function") {
                    callback(JSON.parse(body));
                } else {
                    console.log("No callback provided. Command was executed properly, but you won't be able to receive the data.");
                }
            } else {
                console.log("Something bad happened: ", response.statusCode, "; error: ", error);
            }
        });
    },
    setKey: function (key) {
        this.key = key;
        return this;
    },
    setRegion: function (region) {
        this.region = region;
    }
};
module.exports = exportData;