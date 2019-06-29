import React from "react";
import "./App.css";
import lottie from "lottie-web";

let obstacleStep = 0;
const rocketHorSpeed = 6;
const obstacleAppearInterval = 150;
const obstacleDimension = 100;
const collisionErrorMargin = 10;
const rocketDimension = {
  width: 50,
  height: 100
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.state = {
      obstacleBoxes: [],
      rocketHorFactor: this.windowWidth / 2 - 25,
      gameOver: false
    };
    this.boxRefs = [];
    this.runGameLoop = this.runGameLoop.bind(this);
    this.allObstacleLotties = {};
  }
  componentDidMount() {
    this.initializeBg();
    this.initializeRocket();
    this.startGame();
  }
  initializeBg() {
    this.bg = lottie.loadAnimation({
      container: this.continerRef,
      animType: "svg",
      autoplay: true,
      loop: true,
      rendererSettings: {
        preserveAspectRatio: "none"
      },
      animationData: require(`./assets/spaceBg.json`) // the path to the animation json
    });
    this.bg.setSpeed(0.6);
  }
  initializeRocket() {
    this.rocket = lottie.loadAnimation({
      container: this.rocketRef,
      animType: "svg",
      autoplay: true,
      loop: true,
      animationData: require(`./assets/rocket.json`) // the path to the animation json
    });
  }
  insertNewObstacle() {
    const leftMargin = Math.random() * (this.windowWidth - 100);
    const boxArrayLength = this.state.obstacleBoxes.length;
    this.state.obstacleBoxes.push({
      style: {
        left: leftMargin,
        height: obstacleDimension,
        width: obstacleDimension
      },
      key: Math.random()
    });
    this.setState(
      {
        obstacleBoxes: this.state.obstacleBoxes
      },
      () => {
        this.initializeObstacleLottie(
          this.boxRefs[boxArrayLength],
          boxArrayLength
        );
      }
    );
  }
  startGame() {
    this.setState(
      {
        obstacleBoxes: [],
        gameOver: false
      },
      () => {
        this.gameLoop = setInterval(this.runGameLoop, 15);
      }
    );
    this.bg.play();
    this.rocket.play();
  }
  initializeObstacleLottie(container, obstacleIndex) {
    const randomFactor = Math.floor(Math.random() * 10);
    const key = this.state.obstacleBoxes[obstacleIndex].key;
    this.allObstacleLotties[key] = lottie.loadAnimation({
      container: container,
      animType: "svg",
      autoplay: true,
      loop: true,
      rendererSettings: {
        preserveAspectRatio: "none"
      },
      animationData:
        randomFactor > 5
          ? require(`./assets/grad.json`)
          : require(`./assets/molten.json`)
    });
  }
  removeLotties(removalIndexesArray) {
    removalIndexesArray.map(removalIndex => {
      if (
        this.state.obstacleBoxes[removalIndex] &&
        this.allObstacleLotties[this.state.obstacleBoxes[removalIndex].key]
      ) {
        this.allObstacleLotties[
          this.state.obstacleBoxes[removalIndex].key
        ].destroy();
        delete this.allObstacleLotties[
          this.state.obstacleBoxes[removalIndex].key
        ];
      }
      this.state.obstacleBoxes.splice(removalIndex, 1);
      this.setState({
        obstacleBoxes: this.state.obstacleBoxes
      });
    });
  }
  stopGame() {
    clearInterval(this.gameLoop);
    this.setState({
      gameOver: true
    });
    this.bg.stop();
    this.rocket.stop();
  }
  isColliding(a, b) {
    return (
      a.left <= b.right &&
      b.left <= a.right &&
      a.top <= b.bottom &&
      b.top <= a.bottom
    );
  }
  runGameLoop() {
    obstacleStep++;
    let removalIndexes = [];
    this.boxRefs.map((item, index) => {
      if (item) {
        // detect collision
        if (item.getBoundingClientRect().y > this.windowHeight - 320) {
          // it is in the colliding zone, detect collision
          this.isColliding(
            {
              top: this.rocketRef.offsetTop + collisionErrorMargin,
              left: this.rocketRef.offsetLeft + collisionErrorMargin,
              right:
                this.rocketRef.offsetLeft +
                rocketDimension.width -
                collisionErrorMargin,
              bottom:
                this.rocketRef.offsetTop +
                rocketDimension.height -
                collisionErrorMargin
            },
            {
              top: item.getBoundingClientRect().y + collisionErrorMargin,
              left: item.getBoundingClientRect().x + collisionErrorMargin,
              right:
                item.getBoundingClientRect().x +
                obstacleDimension -
                collisionErrorMargin,
              bottom:
                item.getBoundingClientRect().y +
                obstacleDimension -
                collisionErrorMargin
            }
          ) && this.stopGame();
        }
        // remove moved out boxes
        if (item.getBoundingClientRect().y >= this.windowHeight) {
          removalIndexes.push(index);
        }
      }
    });
    // removal logic
    removalIndexes.length && this.removeLotties(removalIndexes);
    // new insertion logic
    if (obstacleStep === obstacleAppearInterval) {
      this.insertNewObstacle();
      obstacleStep = 0;
    }
    // control rocket logic
    if (this.state.leftMoving) {
      this.state.rocketHorFactor > rocketHorSpeed &&
        this.setState({
          rocketHorFactor: this.state.rocketHorFactor - rocketHorSpeed
        });
    }
    if (this.state.rightMoving) {
      this.state.rocketHorFactor < this.windowWidth - 50 - rocketHorSpeed &&
        this.setState({
          rocketHorFactor: this.state.rocketHorFactor + rocketHorSpeed
        });
    }
  }
  render() {
    return (
      <div className="mainContainer">
        <div ref={ref => (this.continerRef = ref)} className="bg" />
        {this.state.obstacleBoxes.map((item, index) => {
          return (
            <div
              key={item.key}
              ref={ref => (this.boxRefs[index] = ref)}
              className="box"
              style={item.style}
            />
          );
        })}
        <div
          ref={ref => (this.rocketRef = ref)}
          className={`rocketContainer ${
            this.state.leftMoving ? "tiltLeft" : ""
          } ${this.state.rightMoving ? "tiltRight" : ""}`}
          style={{ left: this.state.rocketHorFactor }}
        />
        <span
          onTouchStart={e => this.setState({ leftMoving: true })}
          onTouchEnd={e => this.setState({ leftMoving: false })}
          className="leftBut button"
        />
        <span
          className="rightBut button"
          onTouchStart={e => this.setState({ rightMoving: true })}
          onTouchEnd={e => this.setState({ rightMoving: false })}
        />
        <div className={`gameOverlay ${this.state.gameOver ? "visible" : ""}`}>
          GAME OVER
          <span onClick={() => this.startGame()}>RETRY</span>
        </div>
      </div>
    );
  }
}
export default App;
