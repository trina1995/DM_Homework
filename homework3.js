use Soccerdb
show collections
db.Player.find()
db.Match.find()
db.Team.find()
-------------------------------------------------------------------------------------------------------------------------------
--- General Queries
1. Display the total number of matches for the season 2011/2012
db.Match.find({"season" : "2011/2012"}).count()
2. Display 5 matches sort by date
db.Match.find().sort({date :1}).limit(5).pretty()
3. Display name of 5 players and their id according to their birthday
db.Player.find({}, {"player_name": 1, "player_api_id" : 1, _id : 0}).sort({"birthday" : 1}).limit(5)
4. Display name of 5 players and their id according to their birthday in descending order using pretty format
db.Player.find({}, {"player_name": 1, "player_api_id" : 1, _id : 0}).sort({"birthday" : -1}).limit(5).pretty()
5. Dispaly the details of the match having highest home team goal
db.Match.find().sort({"home_team_goal" : -1}).limit(1)
-----------------------------------------------------------------------------------------------------------------------------------------------------
-- Queries using aggregate

1. Display the maximum number of home team goal sorted by the country_id
db.Match.aggregate([
  {
    $group: {
      _id: "country_id",
      home_team_goal: {
        $sum: {"$toInt":"$home_team_goal"}
      }
    }
  },
  {
    $sort: {
      "country_id": -1
    }
  }
])

2. Display the average number of home_team_goal with country_id played in the season 2011/2012
db.Match.aggregate([
  {
    $match: {
      "season": "2011/2012"
    }
  },
{    
$group: {
_id: "$country_id",
mean_goal: {
        $avg: {
          "$toInt": "$home_team_goal"
        }
      }
    }
  },
])

3. Write the name of the home teams in 1st stage of country id 1 in the 2008/09 season
db.Match.aggregate([
  {
    $match: {
      "country_id": "1",
      "stage": "1",
      "season": "2008/2009"
    }
  },
  {
    $lookup: {
      from: "Team",
      localField: "home_team_api_id",
      foreignField: "team_api_id",
      as: "Match_team"
    }
  },
  {
    $project: {
      "team_long_name": "$Match_team"
    }
  }
])

4. Which the name of the away teams in 1st stage of 2015/16 session where country id is 1729
db.Match.aggregate([
  {
    $match: {
      "country_id": "1729",
      "stage": "1",
      "season": "2015/2016"
    }
  },
  {
    $lookup: {
      from: "Team",
      localField: "away_team_api_id",
      foreignField: "team_api_id",
      as: "Match_team"
    }
  },
  {
    $project: {
      "team_long_name": "$Match_team"
    }
  }
])

--------------------------------------------------------------------------------------------------------------------------------------------------------
--- Creating index

5. Which away teams scored more than 2 goals in 1st stage of 2015/16 session where country id is 1729
db.Team.createIndex( { team_long_name: 1 } )
db.Match.aggregate([
  {
    $match: {
      "country_id": "1729",
      "stage": "1",
      "season": "2015/2016",
      "away_team_goal": {
        "$gt": "2"
      }
    }
  },
  {
    $lookup: {
      from: "Team",
      localField: "away_team_api_id",
      foreignField: "team_api_id",
      as: "Match_team"
    }
  },
  {
    $project: {
      "team_long_name": "$Match_team"
    }
  }
])

-------------------------------------------------------------------------------------------------------------------------------------------------------
--- Creating view
db.createView("team_name","Team",[{$project :{"team_long_name" : "$Team.team_long_name" }}])
db.Match.aggregate([
  {
    $match: {
      "country_id": "1729",
      "stage": "1",
      "season": "2015/2016",
      "away_team_goal": {
        "$gt": "2"
      }
    }
  },
  {
    $lookup: {
      from: "Team",
      localField: "away_team_api_id",
      foreignField: "team_api_id",
      as: "Match_team"
    }
  },
  {
    $project: {
      "team_long_name": "$Match_team"
    }
  }
])
------------------------------------------------------------------------------------------------------------------------------------------------
