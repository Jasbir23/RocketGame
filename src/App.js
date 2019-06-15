import React from 'react';
import './App.css';
import lottie from "lottie-web"
const asteroidDimension = 35;
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allAsteroids : [],
      firebullets : [],
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

  insertNewFireBullet(xpos, ypos) {
    // console.log('pos: ', xpos)
    const leftMargin = xpos;
    return ({
      style: {
        bottom: 1,
        left: leftMargin,
        height: 10,
        width: 5,
      },
      center: [leftMargin + 5, this.windowHeight + 5],
      ySpeed: 10,
    })
  }

  fire (e) {
    this.state.firebullets.push(this.insertNewFireBullet(e.screenX - 40, e.screenY))
    console.log('fire: ', this.state.firebullets);
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
      if(this.state.firebullets.length) {
        this.setState({
          firebullets: this.state.firebullets
        }, () => {
          this.state.firebullets.map((bullet, index) => {
          this.state.allAsteroids.map((asteroid, asteroidIndex) => {
            if(Math.abs(asteroid.center[0] - bullet.center[0]) < 10 && Math.abs(asteroid.center[1] - bullet.center[1]) < 10) {
              this.state.allAsteroids.splice(asteroidIndex, 1)
            }
          })
          if(bullet.center[1] < 0) {
            this.state.firebullets.splice(index, 1);
            setTimeout(()=> { this.state.allAsteroids.push(this.insertNewAsteroid()) }, 1000)
          }
          bullet.style = {
            ...bullet.style,
            bottom: bullet.style.bottom + bullet.ySpeed,
          }
          bullet.center = [bullet.center[0], bullet.center[1] - bullet.ySpeed];
        }
        )
        })
      }
      this.gameLoop = window.requestAnimationFrame(() => this.runGameLoop());
  }
  render () {
      return (
        <div onClick={(e) => this.fire(e)} className="mainContainer">
          {
            this.state.allAsteroids.map((item, index) => {
              return <div ref={(ref) => this.allAsteroidRefs[index] = ref} className="asteroid" key={index} style={item.style} />
            })
          }
          {
            this.state.firebullets.map((item, index) => {
              return <div className="bullets" key={index} style={item.style}/>
            })
          }
        </div>
  );
  }
}

export default App;
