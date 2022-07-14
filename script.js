/* eslint-disable no-unused-vars */
/* prettier-ignore */

'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type'); //selector
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10); //getting last 10 numbers

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance;
    this.duration = duration;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance; //for every minute how many km they ran
    return this.pace;
  }
}

class Cycling extends Workout {
  //class field
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60); //convert duration to hours from minutes;
    //for every km, how many hours it took.
    return this.speed;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);

//////////////////////////////////////
//Application Architecture
class App {
  //class fields
  #map;
  #mapEvent; //has coordinates of when the event/click happened
  #workouts = [];

  constructor() {
    this._getPosition();

    //whenever form is submitted (could be done by pressing enter)
    form.addEventListener('submit', this._newWorkout.bind(this)); //this keyword is gonna of the dom elm that it is attached

    inputType.addEventListener('change', this._toggleElevationField);
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this), // calls the "_loadMap" as regular function call, so change 'this' keyword
        function () {
          alert('Could not get your position'); //if the geolocation fails/blocked then run this:
        }
      );
    }
  }
  //methode also gets access to parameter
  _loadMap(position) {
    // console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    // console.log(latitude, longitude);
    // console.log(`https://www.google.ca/maps/@${latitude},${longitude}`);

    // console.log(this);
    this.#map = L.map('map').setView([latitude, longitude], 13);

    // L is a nameSpace that Leaflet gives us
    // L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    //   attribution:
    //     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', //choose different theme for tile
    // }).addTo(map);
    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.#map);

    L.marker([latitude, longitude])
      .addTo(this.#map)
      .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
      .openPopup();

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(mapE) {
    this.#mapEvent = mapE; //has coordinates of when the event happened
    form.classList.remove('hidden');
    inputDistance.focus(); //moves cursor to that form
  }
  _toggleElevationField() {
    //if the parent is has class "form__row--hidden" then remove it, otherwise add it. (bassically do a swap)

    //getting closest parent that has class .form__row
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');

    // another way to possibly due this
    // if (e.target.value === 'running')
  }
  _newWorkout(e) {
    //helper function, helps us do a longer task for us, just in a function
    const isInputValid = (...inputs) => {
      for(let i=0; i<inputs.length; i++){
        if( !Number.isFinite(inputs[i]) || inputs[i]<0 ) return false;
      }
      return true;
    }


    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value; //convert it to a number
    const duration = +inputDuration.value;
    const { lat: latMarker, lng: lngMarker } = this.#mapEvent.latlng;
    let workout;

    // Check if data is valid
    // If workout is running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if ( !isInputValid(distance,duration,cadence) ) return alert('Inputs have to be positive numbers!');

      workout = new Running([latMarker,lngMarker], distance, duration, cadence);
    }

    // If workout is cycling, create cycling objects
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if ( !isInputValid(distance,duration,elevation) ) return alert('Inputs have to be positive numbers!');

      workout = new Cycling([latMarker,lngMarker], distance, duration, elevation);
    }

    // add new object to workout array
    this.#workouts.push(workout);
    // console.log(this.#workouts);
    // console.log(workout);

    // render workout on map as markers
    this._renderWorkoutMarker(workout) //since 'this' is calling it 'this' keyword will be poiting to 'this'

    // console.log(this);
    e.preventDefault(); //stop page from automatically loading

    // Clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }

  _renderWorkoutMarker(workout) {
    //display marker
    L.marker(workout.coords) //[latMarker, lngMarker]
    //all of the methodes below are attached to marker's prototype
    .addTo(this.#map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${workout.type}-popup`,
      })
    )
    .setPopupContent('workout')
    .openPopup();
  }
}

const app = new App();
