import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { StyleSheet, Text, View, ImageBackground, Alert } from "react-native";
import bg from "./assets/bg.png";
import Cell from "./src/components/Cell";

const copyArray = (original) => {
  const copy = original.map((arr) => arr.slice());
  return copy;
};

export default function App() {
  const [map, setMap] = useState([
    ["", "", ""], // 1st row
    ["", "", ""], // 2nd row
    ["", "", ""], // 3rd row
  ]);
  const [currentTurn, setCurrentTurn] = useState("x");
  const [gameMode, setGameMode] = useState("BOT_MEDIUM"); // LOCAL, BOT_EASY, BOT_MEDIUM

  useEffect(() => {
    if (currentTurn === "o" && gameMode !== "LOCAL") {
      botTurn();
    }
  }, [currentTurn, gameMode]);

  useEffect(() => {
    const winner = getWinner(map);
    if (winner) {
      gameWon(winner);
    } else {
      checkTieState();
    }
  }, [map]);

  const onPress = (rowIndex, colIndex) => {
    if (map[rowIndex][colIndex] !== "") {
      Alert.alert("Position already occupied!");
      return;
    }

    setMap((prevMap) => {
      const updatedMap = [...prevMap];
      updatedMap[rowIndex][colIndex] = currentTurn;
      return updatedMap;
    });

    setCurrentTurn(currentTurn === "x" ? "o" : "x");
  };

  const getWinner = (winnerMap) => {
    // check rows
    for (let i = 0; i < 3; i++) {
      const isRowXWinning = winnerMap[i].every((cell) => cell === "x");
      const isRowOWinning = winnerMap[i].every((cell) => cell === "o");

      if (isRowXWinning) {
        return "x";
      }
      if (isRowOWinning) {
        return "o";
      }
    }

    // check columns
    for (let col = 0; col < 3; col++) {
      let isColumnXWinner = true;
      let isColumnOWinner = true;

      for (let row = 0; row < 3; row++) {
        if (winnerMap[row][col] !== "x") {
          isColumnXWinner = false;
        }
        if (winnerMap[row][col] !== "o") {
          isColumnOWinner = false;
        }
      }

      if (isColumnXWinner) {
        return "x";
      }
      if (isColumnOWinner) {
        return "o";
      }
    }

    // check diagonals
    let isDiagonalOWinning1 = true;
    let isDiagonalXWinning1 = true;
    let isDiagonalOWinning2 = true;
    let isDiagonalXWinning2 = true;

    for (let i = 0; i < 3; i++) {
      // left diagonal
      if (winnerMap[i][i] !== "o") {
        isDiagonalOWinning1 = false;
      }
      if (winnerMap[i][i] !== "x") {
        isDiagonalXWinning1 = false;
      }

      // right diagonal
      if (winnerMap[i][2 - i] !== "o") {
        isDiagonalOWinning2 = false;
      }
      if (winnerMap[i][2 - i] !== "x") {
        isDiagonalXWinning2 = false;
      }
    }

    // alert for left/right diagonal
    if (isDiagonalOWinning1 || isDiagonalOWinning2) {
      return "o";
    }
    if (isDiagonalXWinning1 || isDiagonalXWinning2) {
      return "x";
    }
  };

  const checkTieState = () => {
    if (!map.some((row) => row.some((cell) => cell === ""))) {
      Alert.alert("It's a Tie!", `Match Tied`, [
        {
          text: "Restart",
          onPress: resetGame,
        },
      ]);
    }
  };

  const gameWon = (player) => {
    Alert.alert("Congratulations!!!", `Player ${player.toUpperCase()} won`, [
      {
        text: "Restart",
        onPress: resetGame,
      },
    ]);
  };

  const resetGame = () => {
    setMap([
      ["", "", ""], // 1st row
      ["", "", ""], // 2nd row
      ["", "", ""], // 3rd row
    ]);
    setCurrentTurn("x");
  };

  const botTurn = () => {
    // collect all possible options
    const possiblePositions = [];
    map.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === "") {
          possiblePositions.push({ row: rowIndex, col: colIndex });
        }
      });
    });

    let chosenOption;
    if (gameMode === "BOT_MEDIUM") {
      // attack
      possiblePositions.forEach((possiblePosition) => {
        const mapCopy = copyArray(map);
        mapCopy[possiblePosition.row][possiblePosition.col] = "o";

        const winner = getWinner(mapCopy);
        if (winner === "o") {
          // defend that position
          chosenOption = possiblePosition;
        }
      });

      // defend - check if the opponent WINS if he/she takes one of the possible postions
      if (!chosenOption) {
        possiblePositions.forEach((possiblePosition) => {
          const mapCopy = copyArray(map);
          mapCopy[possiblePosition.row][possiblePosition.col] = "x";

          const winner = getWinner(mapCopy);
          if (winner === "x") {
            // defend that position
            chosenOption = possiblePosition;
          }
        });
      }
    }

    // choose random position
    if (!chosenOption) {
      chosenOption =
        possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
    }

    // display x or o when pressing
    if (chosenOption) {
      onPress(chosenOption.row, chosenOption.col);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={bg} style={styles.bg} resizeMode="contain">
        <Text
          style={{
            fontSize: 24,
            color: "white",
            position: "absolute",
            top: 50,
          }}
        >
          Current Turn: {currentTurn.toUpperCase()}
        </Text>
        <View style={styles.map}>
          {map.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((cell, colIndex) => (
                <Cell
                  key={`row-${rowIndex}-col-${colIndex}`}
                  cell={cell}
                  onPress={() => onPress(rowIndex, colIndex)}
                />
              ))}
            </View>
          ))}
        </View>

        <View style={styles.buttons}>
          <Text
            onPress={() => setGameMode("LOCAL")}
            style={[
              styles.button,
              { backgroundColor: gameMode === "LOCAL" ? "#4f5686" : "#191f24" },
            ]}
          >
            Local
          </Text>
          <Text
            onPress={() => setGameMode("BOT_EASY")}
            style={[
              styles.button,
              {
                backgroundColor:
                  gameMode === "BOT_EASY" ? "#4f5686" : "#191f24",
              },
            ]}
          >
            Easy Bot
          </Text>
          <Text
            onPress={() => setGameMode("BOT_MEDIUM")}
            style={[
              styles.button,
              ,
              {
                backgroundColor:
                  gameMode === "BOT_MEDIUM" ? "#4f5686" : "#191f24",
              },
            ]}
          >
            Medium Bot
          </Text>
        </View>
      </ImageBackground>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#242d34",
  },
  bg: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",

    paddingTop: 20,
  },
  map: {
    width: "80%",
    aspectRatio: 1,
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  buttons: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
  },
  button: {
    color: "white",
    margin: 10,
    fontSize: 16,
    backgroundColor: "#191f24",
    padding: 10,
    paddingHorizontal: 15,
  },
});
