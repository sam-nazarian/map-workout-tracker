/* eslint-disable no-unused-vars */
'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// let map, mapEvent;

class App {
  #map;
  #mapEvent;
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
    this.#mapEvent = mapE;
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
    // console.log(this);
    e.preventDefault(); //stop page from automatically loading

    // Clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    //display marker
    const { lat: latMarker, lng: lngMarker } = this.#mapEvent.latlng;
    // console.log(latMarker, lngMarker);

    L.marker([latMarker, lngMarker])
      //all of the methodes below are attached to marker's prototype
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        })
      )
      .setPopupContent('workout')
      .openPopup();
  }
}

const app = new App();
