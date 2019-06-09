import React from 'react';
import './App.css';
import lottie from "lottie-web"
const asteroidDimension = 35;
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allAsteroids : []
    };
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.allAsteroidRefs = [];
    this.asteroidLotties = [];
  }
  componentDidMount() {
    // this.initializeGameLoop();
    let i = 10;
    while(i > 0){
      this.state.allAsteroids.push(this.insertNewAsteroid());
      i--;
    }
    this.setState({
      allAsteroids: this.state.allAsteroids
    }, () => {
    this.initializeAllAsteroidLotties()
    this.gameLoop = window.requestAnimationFrame(() => this.runGameLoop());
    })
  }
  initializeAllAsteroidLotties() {
    console.log("initializeAllAsteroidLotties");
    this.allAsteroidRefs.map((astroidRef, astroidRefIndex) => {
      this.asteroidLotties[astroidRefIndex] = lottie.loadAnimation({
        container: astroidRef,
        animType: 'svg',
        prerender: false,
        autoplay: false,
        animationData: require(`./asteroid.json`) // the path to the animation json
    });
    this.asteroidLotties[astroidRefIndex].playSegments([0,32], true);
    this.asteroidLotties[astroidRefIndex].loop = true;
    })
  }
  componentWillUnmount() {
    window.cancelAnimationFrame(this.gameLoop);
  }
  insertNewAsteroid() {
    const leftMargin = (Math.random() * (this.windowWidth - 70)) + 35;
    const xRandomness = Math.random() > 0.5 ? 1 : -1;
    return({
      style: {
        top: 0,
        left: leftMargin,
        height: asteroidDimension,
        width: asteroidDimension,
        transform: 'rotate(0deg)'
      },
      center: [leftMargin + asteroidDimension/2,asteroidDimension/2],
            xSpeed: (0.7 + (Math.random() * 0.4)) * xRandomness,
            ySpeed: 0.7 + Math.random() * 0.4,
            radius: asteroidDimension/2,
            isAlive: true
    });
  }
  runGameLoop() {
      if(this.state.allAsteroids.length) {
        // console.log("looping");
        this.setState({
          allAsteroids: this.state.allAsteroids
        }, () => {
          // detect collisions here and update asteroids
          this.state.allAsteroids.map((asteroid, asteroidIndex) => {
            // left and right wall collision
            if(asteroid.center[0] < asteroid.radius || asteroid.center[0] > this.windowWidth - asteroid.radius) {
              asteroid.xSpeed = -asteroid.xSpeed;
          } else 
          if(asteroid.center[1] > this.windowHeight) 
            {
              this.state.allAsteroids[asteroidIndex] = this.insertNewAsteroid();
            }
            asteroid.style = {
              ...asteroid.style,
              top: asteroid.style.top + asteroid.ySpeed,
              left: asteroid.style.left + asteroid.xSpeed,
              transform: `rotate(${-Math.atan(asteroid.ySpeed / asteroid.xSpeed)}rad)`
            };
            // console.log(Math.atan(asteroid.ySpeed / asteroid.xSpeed))
            asteroid.center = [asteroid.center[0] + asteroid.xSpeed, asteroid.center[1] + asteroid.ySpeed];
          });
        });
      }
      this.gameLoop = window.requestAnimationFrame(() => this.runGameLoop());
  }
  render () {
      return (
        <div className="mainContainer">
          {
            this.state.allAsteroids.map((item, index) => {
              return <div ref={(ref) => this.allAsteroidRefs[index] = ref} className="asteroid" key={index} style={item.style} />
            })
          }
        </div>
  );
  }
}

export default App;
