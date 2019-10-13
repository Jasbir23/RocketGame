import React from "react";
import "./App.css";
import lottie from "lottie-web";

let obstacleStep = 0;
const rocketHorSpeed = 3;
const obstacleAppearInterval = 20;
const obstacleDimension = 40;
const trunkPos = 11;
const collisionBoxWidth = 3;
const collisionErrorMarginY = 30;
const collisionErrorMarginX = trunkPos;
const rocketTop = 140;
const rocketDimension = {
  width: 10,
  height: 10
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.state = {
      obstacleBoxes: [],
      rocketHorFactor: this.windowWidth / 2 - 25,
      gameOver: false,
      rocketPos: -rocketDimension.height
    };
    this.boxRefs = [];
    this.collisionBoxRefs = [];
    this.runGameLoop = this.runGameLoop.bind(this);
    this.allObstacleLotties = {};
  }
  componentDidMount() {
    // this.initializeBg();
    // this.initializeRocket();
    this.startGame();
  }
  componentWillUnmount() {
    window.cancelAnimationFrame(this.gameLoop);
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
    const leftMargin = Math.random() * this.windowWidth;
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
  initializeObstacleLottie(container, obstacleIndex) {
    const randomFactor = Math.floor(Math.random() * 10);
    const key = this.state.obstacleBoxes[obstacleIndex].key;
    this.allObstacleLotties[key] = lottie.loadAnimation({
      container: container,
      animType: "svg",
      autoplay: false,
      loop: false,
      rendererSettings: {
        preserveAspectRatio: "none"
      },
      animationData:
        randomFactor > 5
          ? require(`./assets/tree.json`)
          : require(`./assets/tree.json`)
    });
  }
  startGame() {
    this.setState(
      {
        obstacleBoxes: [],
        gameOver: false
      },
      () => {
        this.gameLoop = window.requestAnimationFrame(this.runGameLoop);
      }
    );
    // this.bg.play();
    // this.rocket.play();
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
      this.collisionBoxRefs.splice(removalIndex, 1);
      this.state.obstacleBoxes.splice(removalIndex, 1);
      this.setState({
        obstacleBoxes: this.state.obstacleBoxes
      });
    });
  }

  stopGame(key) {
    // console.log(this.allObstacleLotties[key], key, this.allObstacleLotties);
    this.allObstacleLotties[key].playSegments([0, 4]);
    window.cancelAnimationFrame(this.gameLoop);
    this.setState({
      gameOver: true
    });

    this.boxRefs.forEach(item => {
      item && (item.style.webkitAnimationPlayState = "paused");
    });
    // this.bg.stop();
    // this.rocket.stop();
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
    this.boxRefs.forEach((item, index) => {
      if (item) {
        const collisionBox = this.collisionBoxRefs[
          index
        ].getBoundingClientRect();
        //detect collision
        if (
          item.getBoundingClientRect().y <
          rocketTop + rocketDimension.height
        ) {
          // it is in the colliding zone, detect collision
          const boundingRect = item.getBoundingClientRect();
          this.isColliding(
            {
              top: this.rocketRef.offsetTop,
              left: this.rocketRef.offsetLeft,
              right: this.rocketRef.offsetLeft + rocketDimension.width,
              bottom: this.rocketRef.offsetTop + rocketDimension.height
            },
            {
              top: collisionBox.y,
              left: collisionBox.x,
              right: collisionBox.x + collisionBoxWidth,
              bottom: collisionBox.y + 10
            }
          ) && this.stopGame(this.state.obstacleBoxes[index].key);
        }
        //remove moved out boxes
        if (item.getBoundingClientRect().y < -obstacleDimension) {
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
      this.state.rocketHorFactor <
        this.windowWidth - rocketDimension.width - rocketHorSpeed &&
        this.setState({
          rocketHorFactor: this.state.rocketHorFactor + rocketHorSpeed
        });
    }
    !this.state.gameOver &&
      (this.gameLoop = window.requestAnimationFrame(this.runGameLoop));
  }
  render() {
    return (
      <div className="mainContainer">
        <div ref={ref => (this.continerRef = ref)} className="bg" />
        <div
          ref={ref => (this.rocketRef = ref)}
          className={`${
            this.state.gameOver ? "rocketStop" : "rocketContainer"
          } ${this.state.leftMoving ? "tiltLeft" : ""} ${
            this.state.rightMoving ? "tiltRight" : ""
          }`}
          style={{ left: this.state.rocketHorFactor, top: rocketTop }}
        />
        {this.state.obstacleBoxes.map((item, index) => {
          return (
            <div
              key={item.key}
              ref={ref => (this.boxRefs[index] = ref)}
              className="box"
              style={item.style}
            >
              <span
                className="collisionBox"
                ref={ref => (this.collisionBoxRefs[index] = ref)}
              />
            </div>
          );
        })}
        <div
          onTouchStart={() => this.setState({ leftMoving: true })}
          onTouchEnd={() => this.setState({ leftMoving: false })}
          className="leftBut button"
        />
        <div
          className="rightBut button"
          onTouchStart={() => this.setState({ rightMoving: true })}
          onTouchEnd={() => this.setState({ rightMoving: false })}
        />
        <span className="ind">{`Mov ${this.state.rocketHorFactor}`}</span>
        <div className={`gameOverlay ${this.state.gameOver ? "visible" : ""}`}>
          GAME OVER
          <span onClick={() => this.startGame()}>RETRY</span>
        </div>
      </div>
    );
  }
}
export default App;
