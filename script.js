/* eslint-disable no-unused-vars */
/* prettier-ignore */

'use strict';

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
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance;
    this.duration = duration;

  }

  //in the child classes as those classes contain 'type'
  _setDescription() {
    // prettier-ignore(this will ignore the next line)
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
  }

  click(){
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace()
    this._setDescription()
  }

  calcPace() {
    // min/km
    //sets instance variable called pace
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
    this.calcSpeed();
    this._setDescription()
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
  #mapZoomLevel = 13;
  #mapEvent; //has coordinates of when the event/click happened
  #workouts = [];

  constructor() {
    // Get user's position
    this._getPosition();

    //Get data from local storage
    this._getLocalStorage();

    //Attach Event Handlers
    //whenever form is submitted (could be done by pressing enter)
    form.addEventListener('submit', this._newWorkout.bind(this)); //this keyword is gonna of the dom elm that it is attached
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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
    this.#map = L.map('map').setView([latitude, longitude], this.#mapZoomLevel);

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

    this.#workouts.forEach(work=>{
      this._renderWorkoutMarker(work)
    })
  }
  _showForm(mapE) {
    this.#mapEvent = mapE; //has coordinates of when the event happened
    form.classList.remove('hidden');
    inputDistance.focus(); //moves cursor to that form
  }
  _hideForm() {
    // Clear input fields
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

    //immediately hide the form, do this to hide the form immediately to remove 
    //the animations. Give illusion of form being replaced by the workout activity.
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(()=>{form.style.display = 'grid'}, 1)

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
    e.preventDefault(); //stop page from automatically loading

    //helper function, helps us do a longer task for us, just in a function
    const isInputValid = (...inputs) => {
      for(let i=0; i<inputs.length; i++){
        if( !Number.isFinite(inputs[i]) || inputs[i]<0 || inputs[i] == '') return false;
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

    // Render workout on list
    this._renderWorkout(workout)

    // Hide form + clear input fields
    this._hideForm();

    //Set local storage to all workouts
    this._setLocalStorage();
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
    .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴🏾‍♂️'} ${workout.description}`)
    .openPopup();
  }

  _renderWorkout(workout) {
    const html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
     <div class="workout__details">
      <span class="workout__icon">${
        workout.type === `running` ? `🏃‍♂️` : `🚴🏾‍♂️`
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${
        workout.type === 'running'
          ? workout.pace.toFixed(1)
          : workout.speed.toFixed(1)
      }</span>
      <span class="workout__unit">${
        workout.type === 'running' ? 'min/km' : 'km/h'
      }</span>
    </div>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === 'running' ? '🦶🏼' : '🚲'
        }</span>
        <span class="workout__value">${
          workout.type === 'running' ? workout.cadence : workout.elevationGain
        }</span>
        <span class="workout__unit">${
          workout.type === 'running' ? 'spm' : 'm'
        }</span>
      </div>
  </li>`;

    // console.log(html);
    //after the form elm
    form.insertAdjacentHTML('afterend', html)
  }

  _moveToPopup(e){
    //even if li or div is clicked it will go up to the li (as that's what contains the class workout)
    const workoutEl = e.target.closest('.workout');
    if(!workoutEl) return;
    // console.log(workoutEl);

    //find workout object with matching id
    const workout = this.#workouts.find( (work) => work.id === workoutEl.dataset.id);
    // console.log(workout);

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1
      }
    })

    //using public interface
    // workout.click();
  }

  _setLocalStorage(){
    //local storage is an api that the browser gives us, local storage is blocking
    //don't store large amounts of data there, or it'll slow down browser
    localStorage.setItem('workouts', JSON.stringify(this.#workouts)) //key, value
  }

  _getLocalStorage(){
    //converting object to string loses prototype chain
    //the fix would be to loop over data, and use that data to create a new Workout(Running/Cycling) object, that would fix the prototype chain
    const data = JSON.parse(localStorage.getItem('workouts'));
    // console.log(data);

    if(!data) return;
    this.#workouts = data; //workouts arr empty at beggining


    this.#workouts.forEach(work => {
      this._renderWorkout(work); //render wworkouts on the website
    })
  }

  reset(){
    localStorage.removeItem('workouts');
    location.reload(); //reload page programatically
  }
}

const app = new App();
