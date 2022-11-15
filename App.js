import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, Text, View, ImageBackground, Alert } from "react-native";
import bg from "./assets/bg.png";
import Cell from "./src/components/Cell";

export default function App() {
  const [map, setMap] = useState([
    ["", "", ""], // 1st row
    ["", "", ""], // 2nd row
    ["", "", ""], // 3rd row
  ]);
  const [currentTurn, setCurrentTurn] = useState("x");

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

    const winner = getWinner();
    if (winner) {
      gameWon(winner);
    } else {
      checkTieState();
    }
  };

  const getWinner = () => {
    // check rows
    for (let i = 0; i < 3; i++) {
      const isRowXWinning = map[i].every((cell) => cell === "x");
      const isRowOWinning = map[i].every((cell) => cell === "o");

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
        if (map[row][col] !== "x") {
          isColumnXWinner = false;
        }
        if (map[row][col] !== "o") {
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
      if (map[i][i] !== "o") {
        isDiagonalOWinning1 = false;
      }
      if (map[i][i] !== "x") {
        isDiagonalXWinning1 = false;
      }

      // right diagonal
      if (map[i][2 - i] !== "o") {
        isDiagonalOWinning2 = false;
      }
      if (map[i][2 - i] !== "x") {
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
});
