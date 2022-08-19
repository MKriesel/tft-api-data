//https://americas.api.riotgames.com/tft/match/v1/matches/NA1_4390280132?api_key=
//https://raw.communitydragon.org/latest/game/assets/loot/companions/
//https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/companions.json\
//https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/

const express = require('express')
const app = express()
const port = 3000

app.use(express.static('public'));

app.set('views', './views');
app.set('view engine', 'ejs');

//app.listen(port, () => console.info(`App listening on port ${port}`))


const fetch = require('node-fetch');
const Datastore = require('nedb');
require('dotenv').config();

const playersDB = new Datastore('players.db');
playersDB.loadDatabase();
const matchDB = new Datastore('match.db');
matchDB.loadDatabase();
matchDB.ensureIndex({ fieldName: 'm', unique: true });

const key = process.env.API_KEY;
const id = 'Mittew';
var pid = 'Hu6olHpRqhesbPu5e4gufJJOwX4uFxI6WsCllSBGa141fFrliIl2m1NNogaPBg7lxsP6LcmXoZQzFw';
var pidkr =  '6kFM3UrpLKgjbTEiqEoAs9Bvfi8eScVH7fi-ir6CRJgOkpxi8bvTCH0DmQbkPZ5KFY4uvO-l2gsMEg';
var pideu =  'q_fTYOB20cpBx-oQJB9IHVIVWQ7OpLUSIF9prdBgXkik0Z73aJvi01basCIOjv-E7MNl1z-BbBLAHA';
// EUW1_6018093954
//"KR_6079357724"
var matchId = 'NA1_4398933971';
var petid;
async function getPetId(){
    let response = await fetch('https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/companions.json');
    petid = await response.json();
}

async function getSumInfo(){
    let response;
    response = await fetch(`https://na1.api.riotgames.com/tft/summoner/v1/summoners/by-name/${id}?api_key=${key}`);
	return response.json(); 
}
async function getMatchId(id){
    let response;
    response = await fetch(`https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/${id}/ids?start=0&count=40&api_key=${key}`);
	return response.json();
}
async function getMatch(mid){
    let response;
    response = await fetch(`https://americas.api.riotgames.com/tft/match/v1/matches/${mid}?api_key=${key}`);
	return response.json(); 
}
async function getMatchIdKR(id){
    let response;
    response = await fetch(`https://asia.api.riotgames.com/tft/match/v1/matches/by-puuid/${id}/ids?start=0&count=40&api_key=${key}`);
	return response.json();
}
async function getMatchKR(mid){
    let response;
    response = await fetch(`https://asia.api.riotgames.com/tft/match/v1/matches/${mid}?api_key=${key}`);
	return response.json(); 
}
async function getMatchIdEU(id){
    let response;
    response = await fetch(`https://europe.api.riotgames.com/tft/match/v1/matches/by-puuid/${id}/ids?start=0&count=40&api_key=${key}`);
	return response.json();
}
async function getMatchEU(mid){
    let response;
    response = await fetch(`https://europe.api.riotgames.com/tft/match/v1/matches/${mid}?api_key=${key}`);
	return response.json(); 
}
async function fillMatchesDB(){
    
    var mID = await getMatchId(pid);
    var mIDk = await getMatchIdKR(pidkr);
    var mIDe = await getMatchIdEU(pideu);
    for(i = 0; i < mID.length; i++){
        matchDB.insert({m: mID[i]});
        matchDB.insert({m: mIDk[i]});
        matchDB.insert({m: mIDe[i]});
    }
    
    var mRan = Math.floor(Math.random() * 35) + 1;
    console.log(mRan);
    var match = await getMatch(mID[mRan]);
    var matchk = await getMatchKR(mIDk[mRan]);
    var matche = await getMatchEU(mIDe[mRan]);
    //console.log(match);

    var npid = match.metadata.participants[4];
    var npidk = matchk.metadata.participants[4];
    var npide = matche.metadata.participants[4];
    //console.log("npid ",npid);
    if (npid != pid){
        pid = match.metadata.participants[4];
        //console.log("ASRGWEIOWENWEGNpid ",pid);
    }
    else{
        pid = match.metadata.participants[3];
        //console.log("pid ",pid);
    }
    if (npidk != pidkr){
        pidkr = matchk.metadata.participants[4];
        //console.log("ASRGWEIOWENWEGNpid ",pidkr);
    }
    else{
        pidkr = matchk.metadata.participants[3];
        //console.log("pid ",pidkr);
    }
    if (npide != pideu){
        pideu = matche.metadata.participants[4];
        //console.log("ASRGWEIOWENWEGNpid ",pideu);
    }
    else{
        pideu = matche.metadata.participants[3];
        //console.log("pid ", pideu);
    }
}

async function fillPlayerDB(matchA){
    var match;
    var players;
    var companions = [];
    for(j = 30008; j < matchA.length; j++){//start j at where last ended **25661
        console.log(matchA[j].m);
        console.log(j);
        if(matchA[j].m.includes("NA1"))
            match = await getMatch(matchA[j].m);
        else if(matchA[j].m.includes("KR"))
            match = await getMatchKR(matchA[j].m);
        else if(matchA[j].m.includes("EUW1"))
            match = await getMatchEU(matchA[j].m);
        players = match.info.participants;
        for(i = 0; i < 8; i++){
            companions.push( {
                match: match.metadata.match_id,
                spec: players[i].companion.species,
                cont: players[i].companion.content_ID,
                skin: players[i].companion.skin_ID,
                plac: players[i].placement,
                gold: players[i].gold_left,
                players_elim: players[i].players_eliminated,
                dmg: players[i].total_damage_to_players,
                puuid: players[i].puuid
            });
        }
        
        playersDB.insert(companions);
        companions = [];
        await new Promise(r => setTimeout(r, 900));//sleep
    }
    console.log("complete")
    
}

function processData(a){
    //average placement for pet
    //most 8th for pet
    //yasuo cut scenes (elims if has yas pet)
    //popPet
    //popSpec
    //goldLeft
    //avgDmg
    //avg elims
    //

    //console.log(petid[0].contentId);
    var data = []; //data by content id
    var specData = []; //data by species type

    for(i = 0; i < a.length; i++){
        var _ind = data.findIndex(function(post, index){
            return post.cont == a[i].cont
        });
        //console.log(_ind, " ", a[i].cont);
        if(_ind >= 0){
            data[_ind].avgPlac += a[i].plac;
            data[_ind].gold += a[i].gold;
            data[_ind].elim += a[i].players_elim;
            data[_ind].dmg += a[i].dmg;
            if(a[i].plac == '8'){
                data[_ind].eif ++;
            }
            data[_ind].games ++;
        }
        else{
        //edit values
        //else //push
            if(a[i].plac == 8){
                data.push( {
                    cont: a[i].cont,
                    avgPlac: a[i].plac,
                    gold: a[i].gold,
                    elim: a[i].players_elim,
                    dmg: a[i].dmg,
                    eif: 1,
                    games: 1
                });
            } else {
                data.push( {
                    cont: a[i].cont,
                    avgPlac: a[i].plac,
                    gold: a[i].gold,
                    elim: a[i].players_elim,
                    dmg: a[i].dmg,
                    eif: 0,
                    games: 1
                });
            }
        } 
        
        var _indSpec = specData.findIndex(function(post, index){
            return post.specID == a[i].spec
        });
        //console.log(_ind, " ", a[i].cont);
        if(_indSpec >= 0){
            specData[_indSpec].avgPlac += a[i].plac;
            specData[_indSpec].gold += a[i].gold;
            specData[_indSpec].elim += a[i].players_elim;
            specData[_indSpec].dmg += a[i].dmg;
            if(a[i].plac == 8){
                specData[_indSpec].eif ++;
            }
            specData[_indSpec].games ++;
        }
        else{
        //edit values
        //else //push
            if(a[i].plac == 8){
                specData.push( {
                    specID: a[i].spec,
                    avgPlac: a[i].plac,
                    gold: a[i].gold,
                    elim: a[i].players_elim,
                    dmg: a[i].dmg,
                    eif: 1,
                    games: 1
                });
            } else {
                specData.push( {
                    specID: a[i].spec,
                    avgPlac: a[i].plac,
                    gold: a[i].gold,
                    elim: a[i].players_elim,
                    dmg: a[i].dmg,
                    eif: 0,
                    games: 1
                });
            }
        } 
        
    }

    
    /*  top 5 */
    var avgPlac; 
    var eif;    
    var avgElim;
    var popPet;
    var popSpec; 
    var avgGold;
    var avgDmg; 

    //cont id data
    //printAvgPlac(data);
    //printAvgEif(data);
    //printEif(data);
    //printAvgElim(data);
    //printAvgGold(data);
    //printPopSpec(data);
    //printAvgDmg(data);
    
    
    //spec data
    //printAvgPlac(specData);
    //printAvgEif(specData);
    //printEif(specData);
    //printAvgElim(specData);
    //printAvgGold(specData);
    printPopSpec(specData);
    //printAvgDmg(specData);

    //yas data
    /*
    var _yas = data.findIndex(function(post, index){
        return post.cont == "b890d4df-181a-43da-861d-99a72afbc602"
    });
    console.log("yas data \n",data[_yas]);*/
}
    

/*top&bot 5 for data*/
function printAvgPlac(array){
    console.log("********* AVG PLACE *********");
    //top 5
    array.sort((a, b) => a.avgPlac/a.games - b.avgPlac/b.games);
    for(i = 0; i < 5; i++){
        console.log(array[i], "   ", array[i].avgPlac/array[i].games);
    }
    console.log("bot");
    //bottom 5 
    //specData.sort((b, a) => a.avgPlac/a.games - b.avgPlac/b.games);
    for(i = array.length-1; i >= array.length-5; i--){
        console.log(array[i], "   ", array[i].avgPlac/array[i].games);
    }
}
function printAvgEif(array){
    console.log("********* AVG EIF *********");
    //top 5
    array.sort((a, b) => a.eif/a.games - b.eif/b.games);
    for(i = 0; i < 5; i++){
        console.log(array[i], "   ", array[i].eif/array[i].games);
    } 
    console.log("bot");
    //bottom 5
    //specData.sort((b, a) => a.avgPlac/a.games - b.avgPlac/b.games);
    for(i = array.length-1; i >= array.length-5; i--){
        console.log(array[i], "   ", array[i].eif/array[i].games);
    }
}
function printEif(array){
    console.log("********* EIF *********");
    //top 5
    array.sort((a, b) => a.eif - b.eif);
    for(i = 0; i < 5; i++){
        console.log(array[i]);
    }
    console.log("bot");
    //bottom 5 
    //specData.sort((b, a) => a.avgPlac/a.games - b.avgPlac/b.games);
    for(i = array.length-1; i >= array.length-5; i--){
        console.log(array[i]);
    }
}
function printAvgElim(array){
    console.log("********* AVG ELIM *********");
    //top 5 
    array.sort((a, b) => a.elim/a.games - b.elim/b.games);
    for(i = 0; i < 5; i++){
        console.log(array[i], "   ", array[i].elim/array[i].games);
    }
    console.log("bot");
    //bottom 5 
    //specData.sort((b, a) => a.avgPlac/a.games - b.avgPlac/b.games);
    for(i = array.length-1; i >= array.length-5; i--){
        console.log(array[i], "   ", array[i].elim/array[i].games);
    }
}
function printPopSpec(array){
    console.log("********* Pop Spec *********");
    //top 5 
    array.sort((a, b) => a.games - b.games);
    for(i = 0; i < 5; i++){
        console.log(array[i]);
    }
    console.log("bot");
    //bottom 5 
    //specData.sort((b, a) => a.avgPlac/a.games - b.avgPlac/b.games);
    for(i = array.length-1; i >= array.length-5; i--){
        console.log(array[i]);
    }
}
function printAvgDmg(array){
    console.log("********* AVG DMG *********");
    //top 5 
    array.sort((a, b) => a.dmg/a.games - b.dmg/b.games);
    for(i = 0; i < 5; i++){
        console.log(array[i], "   ", array[i].dmg/array[i].games);
    }
    console.log("bot");
    //bottom 5
    //specData.sort((b, a) => a.avgPlac/a.games - b.avgPlac/b.games);
    for(i = array.length-1; i >= array.length-5; i--){
        console.log(array[i], "   ", array[i].dmg/array[i].games);
    }
}
function printAvgGold(array){
    console.log("********* AVG GOLD LEFT *********");
    //top 5
    array.sort((a, b) => a.gold/a.games - b.gold/b.games);
    for(i = 0; i < 5; i++){
        console.log(array[i], "   ", array[i].gold/array[i].games);
    }
    console.log("bot");
    //bottom 5
    //specData.sort((b, a) => a.avgPlac/a.games - b.avgPlac/b.games);
    for(i = array.length-1; i >= array.length-5; i--){
        console.log(array[i], "   ", array[i].gold/array[i].games);
    }
}






async function main(){
    //await getPetId();
    playersDB.find({}, function(err,docs){processData(docs)});

    /*fill player DataBase*/
    //matchDB.find({}, function(err,docs){fillPlayerDB(docs);});

    /* fill matches database*/
    /*
    setInterval(async () => {
        await fillMatchesDB() 
    }, 2000);
    */

}
main();

/*
    var _in = petid.findIndex(function(post, index){
        if (post.contentId == "0e251d36-d86e-4c58-9b7f-bcee2376a408")
            return index;
    });
    */
/*
    app.get('/', (req, res) => {
        res.render('index', { data: data })
      });
      */